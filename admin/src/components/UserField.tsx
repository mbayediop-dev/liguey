import { Avatar, Box, Stack, Typography } from '@mui/material';
import { ReferenceField, useRecordContext } from 'react-admin';
import type { ProfileRow } from '@shared/supabase/database.types';
import { fullName, initials, roleLabel, shortId } from '../lib/format';
import { avatarUrl } from '../supabase';
import { brand } from '../theme';

type ProfileLite = Pick<ProfileRow, 'first_name' | 'last_name' | 'avatar_url'>;

export function UserAvatar({ profile, size = 32 }: { profile: ProfileLite | null | undefined; size?: number }) {
  return (
    <Avatar src={avatarUrl(profile?.avatar_url)} sx={{ width: size, height: size, fontSize: size * 0.38, bgcolor: brand.blue, fontWeight: 600 }}>
      {initials(profile)}
    </Avatar>
  );
}

/** Avatar + nom du profil courant (RecordContext). */
export function ProfileInline({ size = 28, withRole = false, withEmail = false }: { size?: number; withRole?: boolean; withEmail?: boolean }) {
  const p = useRecordContext<ProfileRow>();
  if (!p) return null;
  const name = fullName(p) || p.email || shortId(p.id);
  const sub = withEmail ? p.email : withRole ? roleLabel(p.role) : null;
  return (
    <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
      <UserAvatar profile={p} size={size} />
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="body2" fontWeight={600} noWrap>
          {name}
        </Typography>
        {sub ? (
          <Typography variant="caption" color="text.secondary" noWrap component="div">
            {sub}
          </Typography>
        ) : null}
      </Box>
    </Stack>
  );
}

/** Référence vers un profil (client, héros, auteur…) affichée avec avatar et nom, cliquable. */
export function UserField({
  source,
  link = 'show',
  withRole,
}: {
  source: string;
  label?: string;
  sortBy?: string;
  link?: 'show' | 'edit' | false;
  withRole?: boolean;
}) {
  return (
    <ReferenceField source={source} reference="profiles" link={link} emptyText="–">
      <ProfileInline withRole={withRole} />
    </ReferenceField>
  );
}
