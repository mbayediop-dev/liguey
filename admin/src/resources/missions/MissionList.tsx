import {
  AutocompleteInput,
  Datagrid,
  DateField,
  DateInput,
  FunctionField,
  List,
  ReferenceField,
  ReferenceInput,
  SelectInput,
  TextField,
  TextInput,
} from 'react-admin';
import type { MissionRow, ProfileRow } from '@shared/supabase/database.types';
import { MISSION_STATUS_CHOICES, fmtDate, fmtRange, fullName } from '../../lib/format';
import { UserField } from '../../components/UserField';
import { MissionStatusField } from '../../components/StatusChip';
import { MoneyField } from '../../components/Money';

const profileText = (p: ProfileRow) => fullName(p) || p.email || '';
const profileQuery = (q: string) => ({ 'search@ilike': q });

const filters = [
  <SelectInput key="status" source="status" choices={MISSION_STATUS_CHOICES} alwaysOn emptyText="Tous les statuts" />,
  <ReferenceInput key="service" source="service_id" reference="services" sort={{ field: 'sort_order', order: 'ASC' }} perPage={100} alwaysOn>
    <SelectInput optionText="name" emptyText="Toutes les prestations" />
  </ReferenceInput>,
  <ReferenceInput key="client" source="client_id" reference="profiles" filter={{ role: 'client' }}>
    <AutocompleteInput optionText={profileText} filterToQuery={profileQuery} />
  </ReferenceInput>,
  <ReferenceInput key="pro" source="pro_id" reference="profiles" filter={{ role: 'pro' }}>
    <AutocompleteInput optionText={profileText} filterToQuery={profileQuery} />
  </ReferenceInput>,
  <DateInput key="from" source="start_date@gte" />,
  <DateInput key="to" source="start_date@lte" />,
  <TextInput key="city" source="city@ilike" label="Ville" />,
];

export function MissionList() {
  return (
    <List filters={filters} sort={{ field: 'created_at', order: 'DESC' }} perPage={25} exporter={false}>
      <Datagrid rowClick="show" bulkActionButtons={false}>
        <FunctionField label="Date" source="start_date" render={(m: MissionRow) => `${fmtDate(m.start_date)} · ${fmtRange(m.time_start, m.time_end)}`} />
        <ReferenceField source="service_id" reference="services" link={false}>
          <TextField source="name" />
        </ReferenceField>
        <ReferenceField source="sub_service_id" reference="sub_services" link={false} emptyText="–">
          <TextField source="name" />
        </ReferenceField>
        <UserField source="client_id" />
        <UserField source="pro_id" />
        <TextField source="city" />
        <MissionStatusField source="status" />
        <MoneyField source="total_ttc_chf" fallbackSource="base_amount_chf" textAlign="right" />
        <DateField source="created_at" showTime locales="fr-CH" />
      </Datagrid>
    </List>
  );
}
