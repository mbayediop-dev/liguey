import { format, parseISO } from 'date-fns';
import type {
  CompanyType,
  DocumentKind,
  DocumentSide,
  ExpenseKind,
  MissionStatus,
  NotificationKind,
  PaymentStatus,
  SupportStatus,
  UserRole,
  VerificationStatus,
} from '@shared/supabase/database.types';

export {
  chf,
  fullName,
  shortName,
  initials,
  statusLabel,
  fmtDateTime,
  fmtTime,
  fmtRange,
  hoursLabel,
  fmtDayYear,
  fmtDayFull,
  recurrenceLabel,
  companyTypeLabel,
  rateLabel,
} from '@shared/lib/format';
export { buildInvoice } from '@shared/lib/invoice';

/** "30.10.2026" */
export function fmtDate(iso: string | null | undefined): string {
  if (!iso) return '';
  return format(parseISO(iso.length <= 10 ? `${iso}T00:00:00` : iso), 'dd.MM.yyyy');
}

/** "30.10.2026 20:12" */
export function fmtStamp(iso: string | null | undefined): string {
  if (!iso) return '';
  return format(parseISO(iso), 'dd.MM.yyyy HH:mm');
}

export function slugify(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function shortId(id: string | null | undefined): string {
  return id ? id.slice(0, 8).toUpperCase() : '';
}

type Choice<T extends string> = { id: T; name: string };

export const ROLE_CHOICES: Choice<UserRole>[] = [
  { id: 'client', name: 'Client' },
  { id: 'pro', name: 'Héros (prestataire)' },
];
export const roleLabel = (r: UserRole | null | undefined) => ROLE_CHOICES.find((c) => c.id === r)?.name ?? r ?? '';

export const MISSION_STATUS_CHOICES: Choice<MissionStatus>[] = [
  { id: 'searching', name: 'Recherche de héros' },
  { id: 'posted', name: 'Postée (aucun héros)' },
  { id: 'pending_validation', name: 'En attente de validation' },
  { id: 'confirmed', name: 'Prête (prépayée)' },
  { id: 'start_requested', name: 'Démarrage demandé' },
  { id: 'in_progress', name: 'En cours' },
  { id: 'completed', name: 'Terminée' },
  { id: 'cancelled', name: 'Annulée' },
];
export const missionStatusName = (s: MissionStatus) => MISSION_STATUS_CHOICES.find((c) => c.id === s)?.name ?? s;

export const VERIFICATION_CHOICES: Choice<VerificationStatus>[] = [
  { id: 'pending', name: 'À vérifier' },
  { id: 'verified', name: 'Vérifié' },
  { id: 'rejected', name: 'Refusé' },
];
export const verificationLabel = (v: VerificationStatus | null | undefined) =>
  VERIFICATION_CHOICES.find((c) => c.id === v)?.name ?? v ?? '';

export const PAYMENT_STATUS_CHOICES: Choice<PaymentStatus>[] = [
  { id: 'pending', name: 'En attente' },
  { id: 'succeeded', name: 'Réussi' },
  { id: 'failed', name: 'Échoué' },
  { id: 'refunded', name: 'Remboursé' },
];
export const paymentStatusLabel = (s: PaymentStatus) => PAYMENT_STATUS_CHOICES.find((c) => c.id === s)?.name ?? s;

export const SUPPORT_STATUS_CHOICES: Choice<SupportStatus>[] = [
  { id: 'open', name: 'Ouverte' },
  { id: 'in_progress', name: 'En traitement' },
  { id: 'closed', name: 'Clôturée' },
];
export const supportStatusLabel = (s: SupportStatus) => SUPPORT_STATUS_CHOICES.find((c) => c.id === s)?.name ?? s;

export const COMPANY_TYPE_CHOICES: Choice<CompanyType>[] = [
  { id: 'independant', name: 'Indépendant' },
  { id: 'SARL', name: 'SARL' },
  { id: 'SA', name: 'SA' },
];

export const DOCUMENT_KIND_CHOICES: Choice<DocumentKind>[] = [
  { id: 'experience', name: "Justificatif d'expérience" },
  { id: 'commerce', name: 'Registre du commerce' },
  { id: 'id_card', name: "Carte d'identité" },
  { id: 'passport', name: 'Passeport' },
  { id: 'residence_permit', name: 'Permis de séjour' },
];
export const documentKindLabel = (k: DocumentKind) => DOCUMENT_KIND_CHOICES.find((c) => c.id === k)?.name ?? k;
export const documentSideLabel = (s: DocumentSide | null | undefined) => (s === 'recto' ? 'Recto' : s === 'verso' ? 'Verso' : '');

export const EXPENSE_KIND_CHOICES: Choice<ExpenseKind>[] = [
  { id: 'material', name: 'Matériel' },
  { id: 'time', name: 'Temps supplémentaire' },
  { id: 'other', name: 'Autre' },
];
export const expenseKindLabel = (k: ExpenseKind) => EXPENSE_KIND_CHOICES.find((c) => c.id === k)?.name ?? k;

export const NOTIFICATION_KIND_CHOICES: Choice<NotificationKind>[] = [
  { id: 'mission', name: 'Mission' },
  { id: 'message', name: 'Message' },
  { id: 'system', name: 'Système' },
];

/** Palette de statut réservée (jamais réutilisée pour des séries) : fond pastel + encre lisible, toujours avec un libellé. */
export type Tone = 'neutral' | 'info' | 'warning' | 'good' | 'critical';
export const TONES: Record<Tone, { bg: string; fg: string; dot: string }> = {
  neutral: { bg: '#EEEEF1', fg: '#3C3C43', dot: '#8E8E93' },
  info: { bg: '#E8E7F5', fg: '#2B2873', dot: '#383495' },
  warning: { bg: '#FFF1D6', fg: '#7A4B00', dot: '#C77A00' },
  good: { bg: '#DDF3E6', fg: '#0F5A33', dot: '#1E9E5A' },
  critical: { bg: '#FFE1E5', fg: '#8A0A1A', dot: '#FE0F2E' },
};

export function missionTone(s: MissionStatus): Tone {
  switch (s) {
    case 'searching':
    case 'posted':
      return 'info';
    case 'pending_validation':
      return 'warning';
    case 'confirmed':
      return 'info';
    case 'start_requested':
    case 'in_progress':
      return 'good';
    case 'completed':
      return 'neutral';
    case 'cancelled':
      return 'critical';
  }
}

export function verificationTone(v: VerificationStatus): Tone {
  return v === 'verified' ? 'good' : v === 'rejected' ? 'critical' : 'warning';
}

export function paymentTone(s: PaymentStatus): Tone {
  return s === 'succeeded' ? 'good' : s === 'failed' ? 'critical' : s === 'refunded' ? 'neutral' : 'warning';
}

export function supportTone(s: SupportStatus): Tone {
  return s === 'closed' ? 'neutral' : s === 'in_progress' ? 'info' : 'warning';
}
