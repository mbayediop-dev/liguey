import { useState } from 'react';
import { Box, Button, Card, CardContent, Stack, Typography } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import {
  AutocompleteInput,
  Datagrid,
  DateField,
  Edit,
  FunctionField,
  List,
  NumberInput,
  ReferenceField,
  ReferenceInput,
  SelectField,
  SelectInput,
  SimpleForm,
  TextField,
  TextInput,
  useGetIdentity,
  useNotify,
  useRecordContext,
} from 'react-admin';
import type { MissionRow, ProDocumentRow, ProfileRow, SupportRequestRow } from '@shared/supabase/database.types';
import { admin } from '../../lib/admin';
import {
  DOCUMENT_KIND_CHOICES,
  NOTIFICATION_KIND_CHOICES,
  PAYMENT_STATUS_CHOICES,
  SUPPORT_STATUS_CHOICES,
  documentKindLabel,
  documentSideLabel,
  fmtDate,
  fmtStamp,
  fullName,
  shortId,
} from '../../lib/format';
import { UserField } from '../../components/UserField';
import { PaymentStatusField, SupportStatusField } from '../../components/StatusChip';
import { MoneyField } from '../../components/Money';
import { ReviewRatingField } from '../../components/Rating';
import { SignedFile } from '../../components/SignedFile';
import { NotifyDialog } from '../../components/Dialogs';

const profileText = (p: ProfileRow) => fullName(p) || p.email || '';
const profileQuery = (q: string) => ({ 'search@ilike': q });

function MissionRef({ source = 'mission_id' }: { source?: string; label?: string; sortBy?: string }) {
  return (
    <ReferenceField source={source} reference="missions" link="show">
      <FunctionField render={(m: MissionRow) => `${fmtDate(m.start_date)} · ${shortId(m.id)}`} />
    </ReferenceField>
  );
}

/* ------------------------------------------------------------ Paiements */

const paymentFilters = [
  <SelectInput key="status" source="status" choices={PAYMENT_STATUS_CHOICES} alwaysOn emptyText="Tous" />,
  <TextInput key="provider" source="provider" />,
  <ReferenceInput key="payer" source="payer_id" reference="profiles">
    <AutocompleteInput optionText={profileText} filterToQuery={profileQuery} />
  </ReferenceInput>,
];

export function PaymentList() {
  return (
    <List filters={paymentFilters} sort={{ field: 'created_at', order: 'DESC' }} perPage={25} exporter={false}>
      <Datagrid rowClick={false} bulkActionButtons={false}>
        <DateField source="created_at" showTime locales="fr-CH" />
        <MissionRef source="mission_id" />
        <UserField source="payer_id" />
        <MoneyField source="amount_chf" textAlign="right" />
        <PaymentStatusField source="status" />
        <TextField source="provider" />
        <TextField source="provider_ref" />
      </Datagrid>
    </List>
  );
}

/* ----------------------------------------------------------------- Avis */

const reviewFilters = [
  <NumberInput key="max" source="rating@lte" step={0.5} alwaysOn />,
  <ReferenceInput key="target" source="target_id" reference="profiles">
    <AutocompleteInput optionText={profileText} filterToQuery={profileQuery} />
  </ReferenceInput>,
];

export function ReviewList() {
  return (
    <List filters={reviewFilters} sort={{ field: 'created_at', order: 'DESC' }} perPage={25} exporter={false}>
      <Datagrid rowClick={false}>
        <DateField source="created_at" locales="fr-CH" />
        <UserField source="author_id" />
        <UserField source="target_id" />
        <ReviewRatingField source="rating" />
        <TextField source="comment" />
        <MissionRef source="mission_id" />
      </Datagrid>
    </List>
  );
}

/* -------------------------------------------------------------- Support */

const supportFilters = [
  <SelectInput key="status" source="status" choices={SUPPORT_STATUS_CHOICES} alwaysOn emptyText="Toutes" />,
  <ReferenceInput key="user" source="user_id" reference="profiles">
    <AutocompleteInput optionText={profileText} filterToQuery={profileQuery} />
  </ReferenceInput>,
];

export function SupportList() {
  return (
    <List filters={supportFilters} sort={{ field: 'created_at', order: 'DESC' }} perPage={25} exporter={false}>
      <Datagrid rowClick="edit" bulkActionButtons={false}>
        <DateField source="created_at" showTime locales="fr-CH" />
        <UserField source="user_id" withRole />
        <FunctionField label="Message" render={(r: SupportRequestRow) => (r.message.length > 120 ? `${r.message.slice(0, 120)}…` : r.message)} />
        <SupportStatusField source="status" />
        <UserField source="handled_by" />
        <DateField source="handled_at" showTime locales="fr-CH" />
      </Datagrid>
    </List>
  );
}

function SupportContext() {
  const r = useRecordContext<SupportRequestRow>();
  const notify = useNotify();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  if (!r) return null;
  return (
    <Card variant="outlined" sx={{ mb: 2, width: '100%' }}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="caption" color="text.secondary">
              Reçue le {fmtStamp(r.created_at)} de
            </Typography>
            <Box sx={{ my: 0.5 }}>
              <UserField source="user_id" withRole />
            </Box>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mt: 1 }}>
              {r.message}
            </Typography>
          </Box>
          <Button variant="outlined" size="small" startIcon={<SendIcon />} onClick={() => setOpen(true)} sx={{ flexShrink: 0 }}>
            Répondre par notification
          </Button>
        </Stack>
      </CardContent>
      <NotifyDialog
        open={open}
        recipient="l'utilisateur"
        defaultTitle="Réponse du support HEROES"
        loading={busy}
        onSend={async (title, body) => {
          setBusy(true);
          try {
            await admin.notify(r.user_id, title, body);
            notify('Réponse envoyée', { type: 'success' });
            setOpen(false);
          } catch (e) {
            notify((e as Error).message, { type: 'error' });
          } finally {
            setBusy(false);
          }
        }}
        onClose={() => setOpen(false)}
      />
    </Card>
  );
}

export function SupportEdit() {
  const { identity } = useGetIdentity();
  const transform = (data: SupportRequestRow) => {
    const handled = data.status !== 'open';
    return {
      ...data,
      handled_by: handled ? (data.handled_by ?? identity?.id ?? null) : null,
      handled_at: handled ? (data.handled_at ?? new Date().toISOString()) : null,
    };
  };
  return (
    <Edit mutationMode="pessimistic" redirect="list" transform={transform} title="Demande de support">
      <SimpleForm>
        <SupportContext />
        <SelectInput source="status" choices={SUPPORT_STATUS_CHOICES} />
        <TextInput source="admin_note" multiline minRows={3} fullWidth helperText="Visible uniquement par les administrateurs" />
      </SimpleForm>
    </Edit>
  );
}

/* -------------------------------------------------------- Notifications */

const notificationFilters = [
  <SelectInput key="kind" source="kind" choices={NOTIFICATION_KIND_CHOICES} alwaysOn emptyText="Tous les types" />,
  <ReferenceInput key="user" source="user_id" reference="profiles">
    <AutocompleteInput optionText={profileText} filterToQuery={profileQuery} />
  </ReferenceInput>,
  <TextInput key="title" source="title@ilike" label="Titre" />,
];

export function NotificationList() {
  return (
    <List filters={notificationFilters} sort={{ field: 'created_at', order: 'DESC' }} perPage={25} exporter={false}>
      <Datagrid rowClick={false} bulkActionButtons={false}>
        <DateField source="created_at" showTime locales="fr-CH" />
        <UserField source="user_id" />
        <SelectField source="kind" choices={NOTIFICATION_KIND_CHOICES} />
        <TextField source="title" />
        <TextField source="body" />
        <DateField source="read_at" showTime locales="fr-CH" emptyText="Non lue" />
      </Datagrid>
    </List>
  );
}

/* ------------------------------------------------------------ Documents */

const documentFilters = [
  <SelectInput key="kind" source="kind" choices={DOCUMENT_KIND_CHOICES} alwaysOn emptyText="Tous les types" />,
  <ReferenceInput key="pro" source="pro_id" reference="profiles" filter={{ role: 'pro' }}>
    <AutocompleteInput optionText={profileText} filterToQuery={profileQuery} />
  </ReferenceInput>,
];

function DocumentPreview() {
  const d = useRecordContext<ProDocumentRow>();
  if (!d) return null;
  return (
    <Box sx={{ p: 1 }}>
      <SignedFile bucket="documents" path={d.file_path} mime={d.mime_type} label={[documentKindLabel(d.kind), documentSideLabel(d.side), d.label].filter(Boolean).join(' · ')} />
    </Box>
  );
}

export function DocumentList() {
  return (
    <List filters={documentFilters} sort={{ field: 'created_at', order: 'DESC' }} perPage={25} exporter={false}>
      <Datagrid rowClick="expand" bulkActionButtons={false} expand={<DocumentPreview />}>
        <DateField source="created_at" showTime locales="fr-CH" />
        <UserField source="pro_id" />
        <FunctionField label="Type" source="kind" render={(d: ProDocumentRow) => documentKindLabel(d.kind)} />
        <FunctionField label="Face" render={(d: ProDocumentRow) => documentSideLabel(d.side)} />
        <TextField source="label" />
        <TextField source="mime_type" />
      </Datagrid>
    </List>
  );
}
