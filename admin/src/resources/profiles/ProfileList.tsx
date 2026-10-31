import { Datagrid, DateField, FunctionField, List, NullableBooleanInput, SearchInput, SelectInput, TextField } from 'react-admin';
import { ROLE_CHOICES, VERIFICATION_CHOICES } from '../../lib/format';
import { ProfileInline } from '../../components/UserField';
import { FlagsField, RoleField, VerificationField } from '../../components/StatusChip';
import { ProfileRatingField } from '../../components/Rating';

const filters = [
  <SearchInput key="q" source="search@ilike" alwaysOn placeholder="Nom, e-mail, ville, téléphone" sx={{ minWidth: 320 }} />,
  <SelectInput key="role" source="role" choices={ROLE_CHOICES} alwaysOn emptyText="Tous" />,
  <SelectInput key="verif" source="verification_status" choices={VERIFICATION_CHOICES} emptyText="Toutes" />,
  <NullableBooleanInput key="blocked" source="is_blocked" nullLabel="Tous" trueLabel="Bloqués" falseLabel="Actifs" />,
  <NullableBooleanInput key="onb" source="onboarding_completed" nullLabel="Toutes" trueLabel="Terminée" falseLabel="Incomplète" />,
  <NullableBooleanInput key="admin" source="is_admin" nullLabel="Tous" trueLabel="Administrateurs" falseLabel="Non" />,
];

export function ProfileList() {
  return (
    <List filters={filters} sort={{ field: 'created_at', order: 'DESC' }} perPage={25} exporter={false}>
      <Datagrid rowClick="show" bulkActionButtons={false}>
        <FunctionField label="Utilisateur" source="last_name" render={() => <ProfileInline withEmail />} />
        <RoleField source="role" />
        <TextField source="city" />
        <TextField source="phone" sortable={false} />
        <ProfileRatingField source="rating_avg" />
        <VerificationField source="verification_status" />
        <FlagsField label="Indicateurs" />
        <DateField source="created_at" locales="fr-CH" />
      </Datagrid>
    </List>
  );
}
