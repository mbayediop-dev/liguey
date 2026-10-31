import { useEffect, useState } from 'react';
import { Box, Button, Card, IconButton, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, Tooltip, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import SaveIcon from '@mui/icons-material/Save';
import {
  BooleanField,
  BooleanInput,
  Confirm,
  Create,
  Datagrid,
  Edit,
  List,
  NumberField,
  NumberInput,
  ReferenceManyCount,
  SimpleForm,
  TextArrayInput,
  TextInput,
  minValue,
  required,
  useCreate,
  useDelete,
  useGetManyReference,
  useNotify,
  useRecordContext,
  useUpdate,
} from 'react-admin';
// TextField de react-admin renommé localement pour ne pas le confondre avec celui de MUI.
import { TextField as TextField_ } from 'react-admin';
import type { ServiceRow, SubServiceRow } from '@shared/supabase/database.types';
import { MoneyField } from '../../components/Money';
import { SectionCard } from '../../components/Layouts';

export function ServiceList() {
  return (
    <List sort={{ field: 'sort_order', order: 'ASC' }} perPage={50} exporter={false}>
      <Datagrid rowClick="edit" bulkActionButtons={false}>
        <NumberField source="sort_order" />
        <TextField_ source="name" />
        <TextField_ source="slug" />
        <MoneyField source="client_rate_chf" textAlign="right" />
        <MoneyField source="pro_rate_chf" textAlign="right" />
        <ReferenceManyCount label="Sous-prestations" reference="sub_services" target="service_id" />
        <BooleanField source="is_active" />
      </Datagrid>
    </List>
  );
}

function ServiceFormFields() {
  return (
    <Stack spacing={1} sx={{ width: '100%', maxWidth: 720 }}>
      <TextInput source="name" fullWidth validate={required()} />
      <TextInput source="slug" fullWidth helperText="Laisser vide pour le générer depuis le nom. Les visuels des apps mobiles sont associés à ce slug." />
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <NumberInput source="client_rate_chf" step={0.1} validate={[required(), minValue(0)]} fullWidth />
        <NumberInput source="pro_rate_chf" step={0.1} validate={[required(), minValue(0)]} fullWidth />
        <NumberInput source="sort_order" fullWidth />
      </Stack>
      <TextArrayInput source="required_tools" fullWidth helperText="Entrée pour ajouter un outil" />
      <TextInput source="tools_note" multiline minRows={2} fullWidth />
      <BooleanInput source="is_active" helperText="Une prestation inactive n'est plus proposée aux clients" />
    </Stack>
  );
}

function ServiceTitle() {
  const r = useRecordContext<ServiceRow>();
  return <span>{r ? r.name : ''}</span>;
}

export function ServiceEdit() {
  return (
    <Edit mutationMode="pessimistic" redirect={false} title={<ServiceTitle />} component="div">
      <Card>
        <SimpleForm>
          <ServiceFormFields />
        </SimpleForm>
      </Card>
      <Box sx={{ mt: 2 }}>
        <SubServicesPanel />
      </Box>
    </Edit>
  );
}

export function ServiceCreate() {
  return (
    <Create redirect="edit">
      <SimpleForm defaultValues={{ sort_order: 99, client_rate_chf: 40, pro_rate_chf: 29.9, is_active: true, required_tools: [] }}>
        <ServiceFormFields />
      </SimpleForm>
    </Create>
  );
}

function SubServiceEditor({ row }: { row: SubServiceRow }) {
  const [name, setName] = useState(row.name);
  const [order, setOrder] = useState(String(row.sort_order));
  const [confirm, setConfirm] = useState(false);
  const notify = useNotify();
  const [update, { isPending: saving }] = useUpdate();
  const [remove, { isPending: deleting }] = useDelete();
  useEffect(() => {
    setName(row.name);
    setOrder(String(row.sort_order));
  }, [row.name, row.sort_order]);
  const dirty = name.trim() !== row.name || Number(order) !== row.sort_order;
  const save = () =>
    update(
      'sub_services',
      { id: row.id, data: { name: name.trim(), sort_order: Number(order) || 0 }, previousData: row },
      { onSuccess: () => notify('Sous-prestation enregistrée', { type: 'success' }), onError: (e) => notify((e as Error).message, { type: 'error' }) },
    );
  return (
    <TableRow>
      <TableCell sx={{ width: 90 }}>
        <TextField size="small" type="number" value={order} onChange={(e) => setOrder(e.target.value)} slotProps={{ htmlInput: { style: { width: 50 } } }} />
      </TableCell>
      <TableCell>
        <TextField size="small" fullWidth value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && dirty && save()} />
      </TableCell>
      <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
        <Tooltip title="Enregistrer">
          <span>
            <IconButton size="small" color="primary" disabled={!dirty || saving || !name.trim()} onClick={save}>
              <SaveIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="Supprimer">
          <span>
            <IconButton size="small" color="error" disabled={deleting} onClick={() => setConfirm(true)}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
        <Confirm
          isOpen={confirm}
          title={`Supprimer « ${row.name} » ?`}
          content="Les missions existantes qui la référencent conserveront leur libellé via la prestation parente."
          onConfirm={() => {
            setConfirm(false);
            remove('sub_services', { id: row.id, previousData: row }, { onError: (e) => notify((e as Error).message, { type: 'error' }) });
          }}
          onClose={() => setConfirm(false)}
        />
      </TableCell>
    </TableRow>
  );
}

function SubServicesPanel() {
  const service = useRecordContext<ServiceRow>();
  const notify = useNotify();
  const [name, setName] = useState('');
  const { data, isPending } = useGetManyReference<SubServiceRow>(
    'sub_services',
    { target: 'service_id', id: service?.id ?? '', pagination: { page: 1, perPage: 100 }, sort: { field: 'sort_order', order: 'ASC' } },
    { enabled: !!service },
  );
  const [create, { isPending: creating }] = useCreate();
  if (!service) return null;
  const add = () => {
    const n = name.trim();
    if (!n) return;
    create(
      'sub_services',
      { data: { service_id: service.id, name: n, sort_order: (data?.length ?? 0) + 1 } },
      {
        onSuccess: () => {
          setName('');
          notify('Sous-prestation ajoutée', { type: 'success' });
        },
        onError: (e) => notify((e as Error).message, { type: 'error' }),
      },
    );
  };
  return (
    <SectionCard title={`Sous-prestations de « ${service.name} »`} dense>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Ordre</TableCell>
            <TableCell>Nom</TableCell>
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {(data ?? []).map((row) => (
            <SubServiceEditor key={row.id} row={row} />
          ))}
          {!isPending && !data?.length ? (
            <TableRow>
              <TableCell colSpan={3}>
                <Typography variant="body2" color="text.secondary">
                  Aucune sous-prestation : le client choisira directement la prestation.
                </Typography>
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
      <Stack direction="row" spacing={1} sx={{ p: 2 }}>
        <TextField size="small" fullWidth label="Nouvelle sous-prestation" value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && add()} />
        <Button variant="contained" onClick={add} disabled={creating || !name.trim()}>
          Ajouter
        </Button>
      </Stack>
    </SectionCard>
  );
}
