import { Typography } from '@mui/material';
import {
  Create,
  Datagrid,
  DateField,
  Edit,
  FunctionField,
  List,
  NumberField,
  NumberInput,
  SimpleForm,
  TextField,
  TextInput,
  minValue,
  required,
  useRecordContext,
} from 'react-admin';
import type { LegalPageRow, VatRateRow } from '@shared/supabase/database.types';

/* ------------------------------------------------------------------ TVA */

export function VatRateList() {
  return (
    <List sort={{ field: 'code', order: 'ASC' }} exporter={false} pagination={false}>
      <Datagrid rowClick="edit" bulkActionButtons={false}>
        <NumberField source="code" />
        <TextField source="label" />
        <FunctionField label="Taux" textAlign="right" render={(r: VatRateRow) => `${Number(r.rate).toFixed(2)} %`} />
      </Datagrid>
    </List>
  );
}

function VatTitle() {
  const r = useRecordContext<VatRateRow>();
  return <span>{r ? `TVA – ${r.label}` : ''}</span>;
}

export function VatRateEdit() {
  return (
    <Edit mutationMode="pessimistic" redirect="list" title={<VatTitle />}>
      <SimpleForm>
        <NumberInput source="code" disabled helperText="Le code est référencé par les frais de mission" />
        <TextInput source="label" validate={required()} fullWidth />
        <NumberInput source="rate" step={0.1} validate={[required(), minValue(0)]} helperText="Taux en pourcentage, TVA incluse dans les montants TTC" />
      </SimpleForm>
    </Edit>
  );
}

export function VatRateCreate() {
  return (
    <Create redirect="list">
      <SimpleForm>
        <NumberInput source="code" validate={[required(), minValue(1)]} helperText="Entier unique (1 = taux normal, 2 = taux réduit…)" />
        <TextInput source="label" validate={required()} fullWidth />
        <NumberInput source="rate" step={0.1} validate={[required(), minValue(0)]} />
      </SimpleForm>
    </Create>
  );
}

/* --------------------------------------------------------- Pages légales */

export function LegalPageList() {
  return (
    <List sort={{ field: 'slug', order: 'ASC' }} exporter={false} pagination={false}>
      <Datagrid rowClick="edit" bulkActionButtons={false}>
        <TextField source="slug" />
        <TextField source="title" />
        <DateField source="updated_at" showTime locales="fr-CH" />
      </Datagrid>
    </List>
  );
}

function LegalTitle() {
  const r = useRecordContext<LegalPageRow>();
  return <span>{r ? r.title : ''}</span>;
}

function LegalFields({ create }: { create?: boolean }) {
  return (
    <>
      <TextInput source="slug" disabled={!create} fullWidth helperText={create ? 'Identifiant utilisé par les apps (ex. cgu, privacy, about)' : undefined} />
      <TextInput source="title" validate={required()} fullWidth />
      <TextInput
        source="body"
        validate={required()}
        multiline
        minRows={22}
        fullWidth
        sx={{ '& textarea': { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 13, lineHeight: 1.5 } }}
      />
      <Typography variant="caption" color="text.secondary">
        Markdown simple : titres avec #, listes avec -, gras avec **texte**. Le rendu est visible dans les apps (Réglages → pages légales).
      </Typography>
    </>
  );
}

export function LegalPageEdit() {
  return (
    <Edit mutationMode="pessimistic" redirect={false} title={<LegalTitle />}>
      <SimpleForm>
        <LegalFields />
      </SimpleForm>
    </Edit>
  );
}

export function LegalPageCreate() {
  return (
    <Create redirect="list">
      <SimpleForm>
        <LegalFields create />
      </SimpleForm>
    </Create>
  );
}
