import { Box, Card, CardContent, Grid, Stack, Typography } from '@mui/material';
import {
  Datagrid,
  DateField,
  FunctionField,
  Pagination,
  ReferenceField,
  ReferenceManyField,
  Show,
  TabbedShowLayout,
  TextField,
  useRecordContext,
} from 'react-admin';
import type { Json, ProDocumentRow, ProfileRow } from '@shared/supabase/database.types';
import {
  companyTypeLabel,
  documentKindLabel,
  documentSideLabel,
  fmtDate,
  fmtRange,
  fmtStamp,
  fullName,
  roleLabel,
  verificationLabel,
} from '../../lib/format';
import { UserAvatar, UserField } from '../../components/UserField';
import { FlagsField, MissionStatusField, RoleField, VerificationField } from '../../components/StatusChip';
import { ProfileRatingField, ReviewRatingField } from '../../components/Rating';
import { LabeledValue } from '../../components/Layouts';
import { MoneyField } from '../../components/Money';
import { SignedFile } from '../../components/SignedFile';
import { ProfileShowActions } from './ProfileActions';

function ProfileTitle() {
  const r = useRecordContext<ProfileRow>();
  return <span>{r ? fullName(r) || r.email || 'Utilisateur' : ''}</span>;
}

function ProfileHeader() {
  const r = useRecordContext<ProfileRow>();
  if (!r) return null;
  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
          <UserAvatar profile={r} size={64} />
          <Box sx={{ flex: 1, minWidth: 200 }}>
            <Typography variant="h5">{fullName(r) || r.email}</Typography>
            <Typography variant="body2" color="text.secondary">
              {[r.email, r.phone, r.city].filter(Boolean).join(' · ')}
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <RoleField />
            <VerificationField />
            <FlagsField />
          </Stack>
          <ProfileRatingField />
        </Stack>
      </CardContent>
    </Card>
  );
}

function settingsOf(json: Json): Record<string, unknown> {
  return json && typeof json === 'object' && !Array.isArray(json) ? (json as Record<string, unknown>) : {};
}

function ProfileDetails() {
  const r = useRecordContext<ProfileRow>();
  if (!r) return null;
  const s = settingsOf(r.settings);
  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, md: 6 }}>
        <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
          Identité
        </Typography>
        <Grid container spacing={2}>
          <Grid size={6}><LabeledValue label="Prénom">{r.first_name}</LabeledValue></Grid>
          <Grid size={6}><LabeledValue label="Nom">{r.last_name}</LabeledValue></Grid>
          <Grid size={6}><LabeledValue label="Rôle">{roleLabel(r.role)}</LabeledValue></Grid>
          <Grid size={6}><LabeledValue label="Date de naissance">{fmtDate(r.birth_date)}</LabeledValue></Grid>
          {r.role === 'pro' ? (
            <Grid size={6}><LabeledValue label="Statut juridique">{companyTypeLabel(r.company_type)}</LabeledValue></Grid>
          ) : null}
          <Grid size={6}><LabeledValue label="Inscrit le">{fmtStamp(r.created_at)}</LabeledValue></Grid>
          <Grid size={6}><LabeledValue label="CGU acceptées le">{fmtStamp(r.cgu_accepted_at)}</LabeledValue></Grid>
          <Grid size={6}><LabeledValue label="Inscription">{r.onboarding_completed ? 'Terminée' : 'Incomplète'}</LabeledValue></Grid>
        </Grid>
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
          Contact
        </Typography>
        <Grid container spacing={2}>
          <Grid size={6}><LabeledValue label="E-mail">{r.email}</LabeledValue></Grid>
          <Grid size={6}><LabeledValue label="Téléphone">{r.phone}</LabeledValue></Grid>
          <Grid size={12}><LabeledValue label="Adresse">{[r.street, [r.zip, r.city].filter(Boolean).join(' '), r.country].filter(Boolean).join(', ')}</LabeledValue></Grid>
          <Grid size={6}><LabeledValue label="Langue">{String(s.language ?? 'fr')}</LabeledValue></Grid>
          <Grid size={6}><LabeledValue label="Notifications">{s.notifications === false ? 'Désactivées' : 'Activées'}</LabeledValue></Grid>
          <Grid size={6}><LabeledValue label="Newsletter">{s.newsletter ? 'Oui' : 'Non'}</LabeledValue></Grid>
          <Grid size={6}><LabeledValue label="Token push">{r.push_token ? 'Enregistré' : 'Aucun'}</LabeledValue></Grid>
        </Grid>
      </Grid>
      {r.role === 'pro' ? (
        <Grid size={12}>
          <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
            Vérification
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 6, md: 3 }}><LabeledValue label="Statut">{verificationLabel(r.verification_status)}</LabeledValue></Grid>
            <Grid size={{ xs: 6, md: 3 }}><LabeledValue label="Vérifié le">{fmtStamp(r.verified_at)}</LabeledValue></Grid>
            <Grid size={{ xs: 12, md: 6 }}><LabeledValue label="Note de vérification">{r.verification_note}</LabeledValue></Grid>
          </Grid>
        </Grid>
      ) : null}
      {r.is_blocked ? (
        <Grid size={12}>
          <LabeledValue label="Motif du blocage">{r.blocked_reason}</LabeledValue>
        </Grid>
      ) : null}
    </Grid>
  );
}

function DocumentCard() {
  const d = useRecordContext<ProDocumentRow>();
  if (!d) return null;
  const label = [documentKindLabel(d.kind), documentSideLabel(d.side), d.label].filter(Boolean).join(' · ');
  return (
    <Card variant="outlined" sx={{ p: 1.5, height: '100%' }}>
      <Typography variant="caption" color="text.secondary" component="div" sx={{ mb: 1 }}>
        {label} · déposé le {fmtDate(d.created_at)}
      </Typography>
      <SignedFile bucket="documents" path={d.file_path} mime={d.mime_type} />
    </Card>
  );
}

function ProServices() {
  return (
    <ReferenceManyField reference="pro_services" target="pro_id" perPage={50}>
      <Datagrid bulkActionButtons={false} rowClick={false}>
        <ReferenceField source="service_id" reference="services" link="edit">
          <TextField source="name" />
        </ReferenceField>
        <DateField source="created_at" label="Ajoutée le" locales="fr-CH" />
      </Datagrid>
    </ReferenceManyField>
  );
}

function ProfileTabs() {
  const r = useRecordContext<ProfileRow>();
  if (!r) return null;
  const isPro = r.role === 'pro';
  return (
    <TabbedShowLayout syncWithLocation={false}>
      <TabbedShowLayout.Tab label="Profil">
        <ProfileDetails />
      </TabbedShowLayout.Tab>
      {isPro ? (
        <TabbedShowLayout.Tab label="Documents" path="documents">
          <ReferenceManyField reference="pro_documents" target="pro_id" sort={{ field: 'created_at', order: 'ASC' }} perPage={50}>
            <Datagrid bulkActionButtons={false} rowClick={false} expand={<DocumentCard />} expandSingle={false}>
              <FunctionField label="Type" render={(d: ProDocumentRow) => documentKindLabel(d.kind)} />
              <FunctionField label="Face" render={(d: ProDocumentRow) => documentSideLabel(d.side)} />
              <TextField source="label" />
              <TextField source="mime_type" />
              <DateField source="created_at" locales="fr-CH" />
            </Datagrid>
          </ReferenceManyField>
        </TabbedShowLayout.Tab>
      ) : null}
      {isPro ? (
        <TabbedShowLayout.Tab label="Prestations proposées" path="services">
          <ProServices />
        </TabbedShowLayout.Tab>
      ) : null}
      <TabbedShowLayout.Tab label="Missions" path="missions">
        <ReferenceManyField
          reference="missions"
          target={isPro ? 'pro_id' : 'client_id'}
          sort={{ field: 'start_date', order: 'DESC' }}
          perPage={10}
          pagination={<Pagination />}
        >
          <Datagrid bulkActionButtons={false} rowClick="show">
            <FunctionField label="Date" source="start_date" render={(m: { start_date: string; time_start: string; time_end: string }) => `${fmtDate(m.start_date)} · ${fmtRange(m.time_start, m.time_end)}`} />
            <ReferenceField source="service_id" reference="services" link={false}>
              <TextField source="name" />
            </ReferenceField>
            <UserField source={isPro ? 'client_id' : 'pro_id'} />
            <TextField source="city" />
            <MissionStatusField source="status" />
            <MoneyField source="total_ttc_chf" fallbackSource="base_amount_chf" textAlign="right" />
          </Datagrid>
        </ReferenceManyField>
      </TabbedShowLayout.Tab>
      <TabbedShowLayout.Tab label="Avis reçus" path="reviews">
        <ReferenceManyField reference="reviews" target="target_id" sort={{ field: 'created_at', order: 'DESC' }} perPage={10} pagination={<Pagination />}>
          <Datagrid bulkActionButtons={false} rowClick={false}>
            <DateField source="created_at" locales="fr-CH" />
            <UserField source="author_id" />
            <ReviewRatingField source="rating" />
            <TextField source="comment" />
          </Datagrid>
        </ReferenceManyField>
      </TabbedShowLayout.Tab>
      <TabbedShowLayout.Tab label="Notifications" path="notifications">
        <ReferenceManyField reference="notifications" target="user_id" sort={{ field: 'created_at', order: 'DESC' }} perPage={10} pagination={<Pagination />}>
          <Datagrid bulkActionButtons={false} rowClick={false}>
            <DateField source="created_at" showTime locales="fr-CH" />
            <TextField source="title" />
            <TextField source="body" />
            <DateField source="read_at" showTime locales="fr-CH" emptyText="Non lue" />
          </Datagrid>
        </ReferenceManyField>
      </TabbedShowLayout.Tab>
    </TabbedShowLayout>
  );
}

export function ProfileShow() {
  return (
    <Show title={<ProfileTitle />} actions={<ProfileShowActions />} component="div">
      <ProfileHeader />
      <Card>
        <ProfileTabs />
      </Card>
    </Show>
  );
}

