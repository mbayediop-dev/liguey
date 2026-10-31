import { Chip, type ChipProps } from '@mui/material';
import { useRecordContext } from 'react-admin';
import type { MissionRow, PaymentRow, ProfileRow, SupportRequestRow } from '@shared/supabase/database.types';
import {
  TONES,
  type Tone,
  missionStatusName,
  missionTone,
  paymentStatusLabel,
  paymentTone,
  roleLabel,
  supportStatusLabel,
  supportTone,
  verificationLabel,
  verificationTone,
} from '../lib/format';

/** Pastille de statut : couleur de la palette réservée + point + libellé (jamais la couleur seule). */
export function ToneChip({ tone, label, size = 'small', sx, ...rest }: { tone: Tone; label: string } & Omit<ChipProps, 'label'>) {
  const t = TONES[tone];
  return (
    <Chip
      size={size}
      label={label}
      icon={<span style={{ width: 8, height: 8, borderRadius: 4, background: t.dot, display: 'inline-block' }} />}
      sx={{ bgcolor: t.bg, color: t.fg, '& .MuiChip-icon': { ml: '8px', mr: '-2px' }, ...sx }}
      {...rest}
    />
  );
}

/* Les props `source` / `label` ne servent qu'au Datagrid (en-tête et tri). */
type FieldProps = { source?: string; label?: string; sortBy?: string; textAlign?: 'left' | 'right' | 'center' };

export function MissionStatusField(_: FieldProps) {
  const r = useRecordContext<MissionRow>();
  if (!r) return null;
  return <ToneChip tone={missionTone(r.status)} label={missionStatusName(r.status)} />;
}

export function VerificationField(_: FieldProps) {
  const r = useRecordContext<ProfileRow>();
  if (!r || r.role !== 'pro') return null;
  return <ToneChip tone={verificationTone(r.verification_status)} label={verificationLabel(r.verification_status)} />;
}

export function RoleField(_: FieldProps) {
  const r = useRecordContext<ProfileRow>();
  if (!r) return null;
  return <ToneChip tone={r.role === 'pro' ? 'info' : 'neutral'} label={roleLabel(r.role)} />;
}

export function FlagsField(_: FieldProps) {
  const r = useRecordContext<ProfileRow>();
  if (!r) return null;
  return (
    <span style={{ display: 'inline-flex', gap: 6 }}>
      {r.is_blocked ? <ToneChip tone="critical" label="Bloqué" /> : null}
      {r.is_admin ? <ToneChip tone="info" label="Admin" /> : null}
      {!r.onboarding_completed ? <ToneChip tone="neutral" label="Inscription incomplète" /> : null}
    </span>
  );
}

export function PaymentStatusField(_: FieldProps) {
  const r = useRecordContext<PaymentRow>();
  if (!r) return null;
  return <ToneChip tone={paymentTone(r.status)} label={paymentStatusLabel(r.status)} />;
}

export function SupportStatusField(_: FieldProps) {
  const r = useRecordContext<SupportRequestRow>();
  if (!r) return null;
  return <ToneChip tone={supportTone(r.status)} label={supportStatusLabel(r.status)} />;
}
