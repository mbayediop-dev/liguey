import { Rating, Stack, Typography } from '@mui/material';
import { useRecordContext } from 'react-admin';
import type { ProfileRow, ReviewRow } from '@shared/supabase/database.types';
import { brand } from '../theme';

type FieldProps = { source?: string; label?: string; sortBy?: string; textAlign?: 'left' | 'right' | 'center' };

export function Stars({ value, count }: { value: number; count?: number }) {
  return (
    <Stack direction="row" spacing={0.75} alignItems="center">
      <Rating value={value} precision={0.5} readOnly size="small" />
      <Typography variant="caption" color="text.secondary" sx={{ fontVariantNumeric: 'tabular-nums' }}>
        {value.toFixed(1)}
        {count !== undefined ? ` (${count})` : ''}
      </Typography>
    </Stack>
  );
}

/** Note moyenne d'un profil (héros uniquement). */
export function ProfileRatingField(_: FieldProps) {
  const r = useRecordContext<ProfileRow>();
  if (!r) return null;
  if (r.role !== 'pro' || !r.rating_count) return <span style={{ color: brand.muted }}>–</span>;
  return <Stars value={Number(r.rating_avg)} count={r.rating_count} />;
}

/** Note d'un avis. */
export function ReviewRatingField(_: FieldProps) {
  const r = useRecordContext<ReviewRow>();
  if (!r) return null;
  return <Stars value={Number(r.rating)} />;
}
