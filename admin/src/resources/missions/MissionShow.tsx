import { useState } from 'react';
import { Box, Button, Card, CardContent, Grid, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import CancelIcon from '@mui/icons-material/Cancel';
import {
  Datagrid,
  DateField,
  FunctionField,
  ReferenceField,
  ReferenceManyField,
  Show,
  TextField,
  TopToolbar,
  useGetList,
  useGetManyReference,
  useListContext,
  useNotify,
  useRecordContext,
  useRefresh,
  useTranslate,
} from 'react-admin';
import type {
  MessageRow,
  MissionExpenseRow,
  MissionRescheduleRow,
  MissionRow,
  ProfileRow,
  VatRateRow,
} from '@shared/supabase/database.types';
import { admin } from '../../lib/admin';
import {
  buildInvoice,
  chf,
  expenseKindLabel,
  fmtDate,
  fmtDayFull,
  fmtRange,
  fmtStamp,
  fullName,
  hoursLabel,
  rateLabel,
  recurrenceLabel,
  shortId,
} from '../../lib/format';
import { UserAvatar, UserField, ProfileInline } from '../../components/UserField';
import { MissionStatusField, PaymentStatusField, ToneChip } from '../../components/StatusChip';
import { Stars } from '../../components/Rating';
import { LabeledValue, SectionCard } from '../../components/Layouts';
import { Money, MoneyField } from '../../components/Money';
import { SignedFile } from '../../components/SignedFile';
import { ReasonDialog } from '../../components/Dialogs';
import { brand } from '../../theme';

const ACTIVE = new Set(['searching', 'posted', 'pending_validation', 'confirmed', 'start_requested', 'in_progress']);

function MissionTitle() {
  const m = useRecordContext<MissionRow>();
  return <span>{m ? `Mission ${shortId(m.id)}` : ''}</span>;
}

function MissionActions() {
  const m = useRecordContext<MissionRow>();
  const notify = useNotify();
  const refresh = useRefresh();
  const t = useTranslate();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  if (!m) return null;
  return (
    <TopToolbar>
      {ACTIVE.has(m.status) ? (
        <Button size="small" variant="outlined" color="error" startIcon={<CancelIcon />} onClick={() => setOpen(true)}>
          {t('heroes.actions.cancel_mission')}
        </Button>
      ) : null}
      <ReasonDialog
        open={open}
        title={t('heroes.actions.cancel_mission')}
        description="Le client et le héros recevront une notification « Mission annulée par HEROES ». Le prépaiement éventuel reste à rembourser manuellement (paiement simulé)."
        reasonLabel="Motif (transmis aux deux parties)"
        confirmLabel="Annuler la mission"
        danger
        loading={busy}
        onConfirm={async (reason) => {
          setBusy(true);
          try {
            await admin.cancelMission(m.id, reason);
            notify(t('heroes.messages.mission_cancelled'), { type: 'success' });
            setOpen(false);
            refresh();
          } catch (e) {
            notify((e as Error).message, { type: 'error' });
          } finally {
            setBusy(false);
          }
        }}
        onClose={() => setOpen(false)}
      />
    </TopToolbar>
  );
}

function Header() {
  const m = useRecordContext<MissionRow>();
  if (!m) return null;
  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Stack direction="row" spacing={2} alignItems="flex-start" flexWrap="wrap" useFlexGap>
          <Box sx={{ flex: 1, minWidth: 260 }}>
            <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap>
              <Typography variant="h5" component="div">
                <ReferenceField source="service_id" reference="services" link={false}>
                  <TextField source="name" variant="inherit" />
                </ReferenceField>
              </Typography>
              <MissionStatusField />
            </Stack>
            <Typography variant="body2" color="text.secondary" component="div">
              <ReferenceField source="sub_service_id" reference="sub_services" link={false} emptyText=" ">
                <TextField source="name" />
              </ReferenceField>
            </Typography>
            <Typography variant="body1" fontWeight={500} sx={{ mt: 1 }}>
              {fmtDayFull(m.start_date)} · {fmtRange(m.time_start, m.time_end)} ({hoursLabel(m.base_hours)})
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {m.street}, {m.zip} {m.city} · {recurrenceLabel(m.recurrence)}
            </Typography>
          </Box>
          <Stack spacing={0.25} alignItems="flex-end">
            <Typography variant="caption" color="text.secondary">
              Total client TTC
            </Typography>
            <Typography variant="h4" sx={{ fontVariantNumeric: 'tabular-nums' }}>
              <Money value={m.total_ttc_chf ?? m.base_amount_chf} />
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Réf. {shortId(m.id)} · créée le {fmtStamp(m.created_at)}
            </Typography>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

function PartyBody() {
  const p = useRecordContext<ProfileRow>();
  if (!p) return null;
  return (
    <Stack direction="row" spacing={1.5} alignItems="center">
      <UserAvatar profile={p} size={44} />
      <Box sx={{ minWidth: 0 }}>
        <Typography fontWeight={600}>{fullName(p) || p.email}</Typography>
        <Typography variant="body2" color="text.secondary">
          {[p.phone, p.email, p.city].filter(Boolean).join(' · ')}
        </Typography>
        {p.role === 'pro' && p.rating_count ? <Stars value={Number(p.rating_avg)} count={p.rating_count} /> : null}
      </Box>
    </Stack>
  );
}

function PartyCard({ source, title }: { source: 'client_id' | 'pro_id'; title: string }) {
  return (
    <SectionCard title={title}>
      <ReferenceField source={source} reference="profiles" link="show" emptyText="Aucun héros attribué pour le moment">
        <PartyBody />
      </ReferenceField>
    </SectionCard>
  );
}

function DetailsCard() {
  const m = useRecordContext<MissionRow>();
  if (!m) return null;
  return (
    <SectionCard title="Détails de la demande">
      <Grid container spacing={2}>
        <Grid size={12}>
          <LabeledValue label="Description">{m.description}</LabeledValue>
        </Grid>
        <Grid size={6}>
          <LabeledValue label="Durée prévue">{hoursLabel(m.base_hours)}</LabeledValue>
        </Grid>
        <Grid size={6}>
          <LabeledValue label="Récurrence">{recurrenceLabel(m.recurrence)}</LabeledValue>
        </Grid>
        <Grid size={6}>
          <LabeledValue label="Tarif client">{rateLabel(m.client_rate_chf)}</LabeledValue>
        </Grid>
        <Grid size={6}>
          <LabeledValue label="Gain héros">{rateLabel(m.pro_rate_chf)}</LabeledValue>
        </Grid>
        {m.status === 'cancelled' ? (
          <>
            <Grid size={6}>
              <LabeledValue label="Annulée par">
                <UserField source="cancelled_by" />
              </LabeledValue>
            </Grid>
            <Grid size={6}>
              <LabeledValue label="Motif">{m.cancel_reason}</LabeledValue>
            </Grid>
          </>
        ) : null}
      </Grid>
    </SectionCard>
  );
}

function InvoiceCard() {
  const m = useRecordContext<MissionRow>();
  const expenses = useGetManyReference<MissionExpenseRow>(
    'mission_expenses',
    { target: 'mission_id', id: m?.id ?? '', pagination: { page: 1, perPage: 100 }, sort: { field: 'created_at', order: 'ASC' } },
    { enabled: !!m },
  );
  const vat = useGetList<VatRateRow & { id: number }>('vat_rates', { pagination: { page: 1, perPage: 50 }, sort: { field: 'code', order: 'ASC' } });
  if (!m) return null;
  const exp = expenses.data ?? [];
  const rates = vat.data ?? [];
  const client = buildInvoice(m, exp, rates, 'client');
  const pro = buildInvoice(m, exp, rates, 'pro');
  const rateOf = (code: number) => rates.find((r) => r.code === code)?.rate ?? 0;
  return (
    <SectionCard title="Décompte" dense>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Ligne</TableCell>
            <TableCell align="right">Client TTC</TableCell>
            <TableCell align="right">Héros TTC</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {client.lines.map((l, i) => (
            <TableRow key={l.key}>
              <TableCell>
                {l.label}
                {l.detail ? (
                  <Typography variant="caption" color="text.secondary">
                    {' '}
                    · {l.detail}
                  </Typography>
                ) : null}
                <Typography variant="caption" color="text.secondary" component="div">
                  TVA {Number(rateOf(l.vatCode)).toFixed(1)} %
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Money value={l.amount} />
              </TableCell>
              <TableCell align="right">
                <Money value={pro.lines[i]?.amount} />
              </TableCell>
            </TableRow>
          ))}
          {client.vatLines.map((v) => (
            <TableRow key={v.code}>
              <TableCell sx={{ color: 'text.secondary' }}>dont TVA {Number(v.rate).toFixed(1)} %</TableCell>
              <TableCell align="right" sx={{ color: 'text.secondary' }}>
                <Money value={v.amount} />
              </TableCell>
              <TableCell align="right" sx={{ color: 'text.secondary' }}>
                <Money value={pro.vatLines.find((x) => x.code === v.code)?.amount ?? 0} />
              </TableCell>
            </TableRow>
          ))}
          <TableRow>
            <TableCell sx={{ fontWeight: 600 }}>Total</TableCell>
            <TableCell align="right">
              <Money value={client.total} strong />
            </TableCell>
            <TableCell align="right">
              <Money value={pro.total} strong />
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell sx={{ fontWeight: 600, borderBottom: 0 }}>Marge HEROES</TableCell>
            <TableCell align="right" colSpan={2} sx={{ borderBottom: 0 }}>
              <Money value={client.total - pro.total} strong />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', px: 2, pt: 1.5 }}>
        {m.status === 'completed'
          ? `Montants figés à la clôture : total ${chf(m.total_ttc_chf)} · TVA ${chf(m.total_vat_chf)} · part du héros ${chf(m.pro_amount_chf)}.`
          : 'Estimation à partir du temps prévu et des frais saisis ; les montants sont figés à la clôture de la mission.'}
      </Typography>
    </SectionCard>
  );
}

function ReceiptPanel() {
  const e = useRecordContext<MissionExpenseRow>();
  if (!e?.receipt_path) return null;
  return (
    <Box sx={{ p: 1 }}>
      <SignedFile bucket="receipts" path={e.receipt_path} label="Ticket / justificatif" />
    </Box>
  );
}

function ExpensesCard() {
  return (
    <SectionCard title="Frais ajoutés par le héros" dense>
      <ReferenceManyField reference="mission_expenses" target="mission_id" sort={{ field: 'created_at', order: 'ASC' }} perPage={100}>
        <Datagrid bulkActionButtons={false} rowClick={false} expand={<ReceiptPanel />} isRowExpandable={(r) => !!(r as MissionExpenseRow).receipt_path} empty={<Empty text="Aucun frais" />}>
          <DateField source="created_at" showTime locales="fr-CH" />
          <FunctionField label="Type" render={(e: MissionExpenseRow) => expenseKindLabel(e.kind)} />
          <TextField source="label" />
          <FunctionField label="Minutes" render={(e: MissionExpenseRow) => e.minutes ?? ''} />
          <FunctionField label="TVA" render={(e: MissionExpenseRow) => `code ${e.vat_code}`} />
          <MoneyField source="amount_chf" textAlign="right" />
        </Datagrid>
      </ReferenceManyField>
    </SectionCard>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <Typography variant="body2" color="text.secondary" sx={{ px: 2, py: 1.5 }}>
      {text}
    </Typography>
  );
}

function PaymentsCard() {
  return (
    <SectionCard title="Paiements" dense>
      <ReferenceManyField reference="payments" target="mission_id" sort={{ field: 'created_at', order: 'DESC' }} perPage={20}>
        <Datagrid bulkActionButtons={false} rowClick={false} empty={<Empty text="Aucun paiement" />}>
          <DateField source="created_at" showTime locales="fr-CH" />
          <UserField source="payer_id" />
          <MoneyField source="amount_chf" textAlign="right" />
          <PaymentStatusField source="status" />
          <TextField source="provider" />
          <TextField source="provider_ref" />
        </Datagrid>
      </ReferenceManyField>
    </SectionCard>
  );
}

const RESCHEDULE_LABEL: Record<MissionRescheduleRow['status'], { label: string; tone: 'warning' | 'good' | 'critical' }> = {
  pending: { label: 'En attente', tone: 'warning' },
  accepted: { label: 'Acceptée', tone: 'good' },
  declined: { label: 'Refusée', tone: 'critical' },
};

function ReschedulesCard() {
  return (
    <SectionCard title="Propositions de report" dense>
      <ReferenceManyField reference="mission_reschedules" target="mission_id" sort={{ field: 'created_at', order: 'DESC' }} perPage={20}>
        <Datagrid bulkActionButtons={false} rowClick={false} empty={<Empty text="Aucun report proposé" />}>
          <DateField source="created_at" showTime locales="fr-CH" label="Proposé le" />
          <UserField source="proposed_by" label="Par" />
          <FunctionField label="Nouveau créneau" render={(r: MissionRescheduleRow) => `${fmtDate(r.start_date)} · ${fmtRange(r.time_start, r.time_end)}`} />
          <FunctionField label="Statut" render={(r: MissionRescheduleRow) => <ToneChip tone={RESCHEDULE_LABEL[r.status].tone} label={RESCHEDULE_LABEL[r.status].label} />} />
        </Datagrid>
      </ReferenceManyField>
    </SectionCard>
  );
}

function TimelineCard() {
  const m = useRecordContext<MissionRow>();
  if (!m) return null;
  const steps: [string, string | null][] = [
    ['Demande créée', m.created_at],
    ['Acceptée par le héros', m.accepted_at],
    ['Validée et prépayée par le client', m.validated_at],
    ['Démarrage demandé', m.start_requested_at],
    ['Démarrage confirmé', m.started_at],
    ['Terminée par le héros', m.completed_at],
    ['Clôture confirmée par le client', m.client_confirmed_at],
    ['Annulée', m.cancelled_at],
  ];
  return (
    <SectionCard title="Chronologie">
      <Stack spacing={1.25}>
        {steps
          .filter(([, at]) => !!at)
          .map(([label, at]) => (
            <Stack key={label} direction="row" spacing={1.5} alignItems="baseline">
              <Box sx={{ width: 8, height: 8, borderRadius: 4, bgcolor: label === 'Annulée' ? brand.red : brand.blue, flexShrink: 0, position: 'relative', top: -1 }} />
              <Typography variant="body2" sx={{ flex: 1 }}>
                {label}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                {fmtStamp(at)}
              </Typography>
            </Stack>
          ))}
      </Stack>
    </SectionCard>
  );
}

function MessageThread() {
  const { data, isPending } = useListContext<MessageRow>();
  const mission = useRecordContext<MissionRow>();
  if (isPending) return null;
  if (!data?.length) return <Empty text="Aucun message échangé" />;
  return (
    <Stack spacing={1.5} sx={{ px: 2, pb: 1 }}>
      {data.map((msg) => {
        const fromClient = msg.sender_id === mission?.client_id;
        return (
          <Box key={msg.id} sx={{ alignSelf: fromClient ? 'flex-start' : 'flex-end', maxWidth: '85%' }}>
            <Box sx={{ mb: 0.5 }}>
              <ReferenceField record={msg} source="sender_id" reference="profiles" link="show">
                <ProfileInline size={20} />
              </ReferenceField>
            </Box>
            <Box sx={{ bgcolor: fromClient ? '#fff' : '#E8E7F5', border: `1px solid ${brand.line}`, borderRadius: 2, px: 1.5, py: 1 }}>
              {msg.body ? <Typography variant="body2">{msg.body}</Typography> : null}
              {msg.image_path ? <SignedFile bucket="chat" path={msg.image_path} maxHeight={180} /> : null}
              <Typography variant="caption" color="text.secondary" component="div" sx={{ mt: 0.5 }}>
                {fmtStamp(msg.created_at)}
                {msg.read_at ? ' · lu' : ''}
              </Typography>
            </Box>
          </Box>
        );
      })}
    </Stack>
  );
}

function MessagesCard() {
  return (
    <SectionCard title="Messagerie (lecture seule)" dense>
      <ReferenceManyField reference="messages" target="mission_id" sort={{ field: 'created_at', order: 'ASC' }} perPage={200}>
        <MessageThread />
      </ReferenceManyField>
    </SectionCard>
  );
}

function ReviewsCard() {
  return (
    <SectionCard title="Avis" dense>
      <ReferenceManyField reference="reviews" target="mission_id" sort={{ field: 'created_at', order: 'ASC' }} perPage={10}>
        <Datagrid bulkActionButtons={false} rowClick={false} empty={<Empty text="Aucun avis" />}>
          <UserField source="author_id" />
          <UserField source="target_id" />
          <FunctionField label="Note" render={(r: { rating: number }) => <Stars value={Number(r.rating)} />} />
          <TextField source="comment" />
        </Datagrid>
      </ReferenceManyField>
    </SectionCard>
  );
}

export function MissionShow() {
  return (
    <Show title={<MissionTitle />} actions={<MissionActions />} component="div">
      <Header />
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <Stack spacing={2}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <PartyCard source="client_id" title="Client" />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <PartyCard source="pro_id" title="Héros" />
              </Grid>
            </Grid>
            <DetailsCard />
            <ExpensesCard />
            <MessagesCard />
            <ReviewsCard />
          </Stack>
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }}>
          <Stack spacing={2}>
            <InvoiceCard />
            <PaymentsCard />
            <ReschedulesCard />
            <TimelineCard />
          </Stack>
        </Grid>
      </Grid>
    </Show>
  );
}
