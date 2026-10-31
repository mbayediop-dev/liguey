import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { MissionStatus, RecurrenceKind } from '../supabase/database.types';

const cap = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

/** CHF 1'241.30 (séparateur de milliers suisse). */
export function chf(n: number | null | undefined, opts: { prefix?: boolean; sign?: boolean } = {}): string {
  const v = Number(n ?? 0);
  const abs = Math.abs(v).toFixed(2);
  const [int, dec] = abs.split('.');
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, "'");
  const sign = v < 0 ? '- ' : opts.sign && v > 0 ? '+ ' : '';
  return opts.prefix === false ? `${sign}${grouped}.${dec}` : `${sign}CHF ${grouped}.${dec}`;
}

export function rateLabel(n: number | null | undefined): string {
  return `${chf(n, { prefix: false })} CHF/Hr TTC`;
}

export function parseDate(d: string): Date {
  return d.length <= 10 ? parseISO(`${d}T00:00:00`) : parseISO(d);
}

/** "14 Mars" */
export function fmtDay(d: string | Date): string {
  const date = typeof d === 'string' ? parseDate(d) : d;
  const [day, month] = format(date, 'd MMMM', { locale: fr }).split(' ');
  return `${day} ${cap(month ?? '')}`;
}

/** "12 Juillet 2018" */
export function fmtDayYear(d: string | Date): string {
  const date = typeof d === 'string' ? parseDate(d) : d;
  const [day, month, year] = format(date, 'd MMMM yyyy', { locale: fr }).split(' ');
  return `${day} ${cap(month ?? '')} ${year}`;
}

/** "Jeudi, 12 juillet 2018" */
export function fmtDayFull(d: string | Date): string {
  const date = typeof d === 'string' ? parseDate(d) : d;
  return cap(format(date, "EEEE, d MMMM yyyy", { locale: fr }));
}

/** "Lundi" */
export function weekdayLabel(d: string | Date): string {
  const date = typeof d === 'string' ? parseDate(d) : d;
  return cap(format(date, 'EEEE', { locale: fr }));
}

/** "Juin 2018" */
export function fmtMonthYear(d: string | Date): string {
  const date = typeof d === 'string' ? parseDate(d) : d;
  return cap(format(date, 'MMMM yyyy', { locale: fr }));
}

/** "14:34" */
export function fmtClock(iso: string): string {
  return format(parseISO(iso), 'HH:mm');
}

export function fmtDateTime(iso: string): string {
  return cap(format(parseISO(iso), "d MMM 'à' HH:mm", { locale: fr }));
}

/** "10:30:00" → "10:30" */
export function fmtTime(t: string | null | undefined): string {
  return (t ?? '').slice(0, 5);
}

export function fmtRange(a: string, b: string): string {
  return `${fmtTime(a)}-${fmtTime(b)}`;
}

export function hoursLabel(h: number | null | undefined): string {
  const v = Number(h ?? 0);
  const whole = Math.floor(v);
  const min = Math.round((v - whole) * 60);
  if (min === 0) return `${whole}h`;
  return `${whole}h${String(min).padStart(2, '0')}`;
}

export function toISODate(d: Date): string {
  return format(d, 'yyyy-MM-dd');
}

export function fullName(p: { first_name?: string | null; last_name?: string | null } | null | undefined): string {
  if (!p) return '';
  return [p.first_name, p.last_name].filter(Boolean).join(' ').trim();
}

export function shortName(p: { first_name?: string | null; last_name?: string | null } | null | undefined): string {
  if (!p) return '';
  const last = (p.last_name ?? '').trim();
  return [p.first_name, last ? `${last.charAt(0)}.` : ''].filter(Boolean).join(' ');
}

export function initials(p: { first_name?: string | null; last_name?: string | null } | null | undefined): string {
  if (!p) return '?';
  return `${(p.first_name ?? '').charAt(0)}${(p.last_name ?? '').charAt(0)}`.toUpperCase() || '?';
}

export function statusLabel(status: MissionStatus): string {
  switch (status) {
    case 'searching':
      return 'RECHERCHE';
    case 'posted':
      return 'POSTÉE';
    case 'pending_validation':
      return 'EN ATTENTE';
    case 'confirmed':
      return 'PRÊT';
    case 'start_requested':
      return 'DÉMARRÉE';
    case 'in_progress':
      return 'EN COURS';
    case 'completed':
      return 'TERMINÉE';
    case 'cancelled':
      return 'ANNULÉE';
  }
}

export function recurrenceLabel(r: RecurrenceKind): string {
  switch (r) {
    case 'once':
      return 'une seule fois';
    case 'weekdays':
      return 'tous les jours de la semaine';
    case 'daily':
      return 'tous les jours';
    case 'weekly':
      return 'chaque semaine';
  }
}

export const RECURRENCE_OPTIONS: { value: RecurrenceKind; label: string }[] = [
  { value: 'once', label: 'Une seule fois' },
  { value: 'weekdays', label: 'Tous les jours de la semaine' },
  { value: 'daily', label: 'Tous les jours' },
  { value: 'weekly', label: 'Chaque semaine' },
];

export function companyTypeLabel(t: string | null | undefined): string {
  if (t === 'independant') return 'Indépendant';
  return t ?? '';
}

export function ratingColor(r: number): 'green' | 'orange' | 'redDeep' {
  if (r >= 4) return 'green';
  if (r >= 2.5) return 'orange';
  return 'redDeep';
}
