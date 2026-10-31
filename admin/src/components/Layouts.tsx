import type { ReactNode } from 'react';
import { Card, CardContent, CardHeader, Stack, Typography } from '@mui/material';
import { brand } from '../theme';

/** Libellé discret + valeur, pour les pages de détail. */
export function LabeledValue({ label, children }: { label: string; children?: ReactNode }) {
  const empty = children === null || children === undefined || children === '';
  return (
    <Stack spacing={0.25} sx={{ minWidth: 0 }}>
      <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.4, fontSize: 11 }}>
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={500} component="div" sx={{ wordBreak: 'break-word' }}>
        {empty ? <span style={{ color: brand.muted }}>–</span> : children}
      </Typography>
    </Stack>
  );
}

export function SectionCard({ title, action, children, dense }: { title: string; action?: ReactNode; children: ReactNode; dense?: boolean }) {
  return (
    <Card>
      <CardHeader
        title={title}
        action={action}
        slotProps={{ title: { variant: 'subtitle1', fontWeight: 600 } }}
        sx={{ pb: 0.5, '& .MuiCardHeader-action': { alignSelf: 'center', m: 0 } }}
      />
      <CardContent sx={{ pt: 1.5, ...(dense ? { px: 0, '&:last-child': { pb: 0 } } : {}) }}>{children}</CardContent>
    </Card>
  );
}
