import { Grid } from '@mui/material';
import { BooleanInput, DateInput, Edit, SelectInput, SimpleForm, TextInput, email, required, useRecordContext } from 'react-admin';
import type { ProfileRow } from '@shared/supabase/database.types';
import { COMPANY_TYPE_CHOICES, ROLE_CHOICES, fullName } from '../../lib/format';

function Title() {
  const r = useRecordContext<ProfileRow>();
  return <span>{r ? `Modifier ${fullName(r) || r.email || ''}` : ''}</span>;
}

export function ProfileEdit() {
  return (
    <Edit mutationMode="pessimistic" redirect="show" title={<Title />}>
      <SimpleForm>
        <Grid container spacing={2} sx={{ width: '100%' }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextInput source="first_name" fullWidth validate={required()} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextInput source="last_name" fullWidth validate={required()} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextInput source="email" type="email" fullWidth validate={email()} helperText="Copie informative : ne modifie pas l'identifiant de connexion" />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextInput source="phone" fullWidth />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <DateInput source="birth_date" fullWidth />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <SelectInput source="role" choices={ROLE_CHOICES} fullWidth validate={required()} helperText="Un compte n'est utilisable que dans l'app correspondant à son rôle" />
          </Grid>
          <Grid size={12}>
            <TextInput source="street" fullWidth />
          </Grid>
          <Grid size={{ xs: 4, md: 3 }}>
            <TextInput source="zip" fullWidth />
          </Grid>
          <Grid size={{ xs: 8, md: 5 }}>
            <TextInput source="city" fullWidth />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextInput source="country" fullWidth />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <SelectInput source="company_type" choices={COMPANY_TYPE_CHOICES} fullWidth emptyText="–" />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <BooleanInput source="onboarding_completed" helperText="Décocher renvoie l'utilisateur dans le parcours d'inscription" />
          </Grid>
        </Grid>
      </SimpleForm>
    </Edit>
  );
}
