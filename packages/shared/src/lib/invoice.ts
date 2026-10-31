import type { Expense, Mission } from '../types/models';
import type { VatRateRow } from '../supabase/database.types';

export interface InvoiceLine {
  key: string;
  label: string;
  detail?: string;
  amount: number;
  vatCode: number;
  isBase: boolean;
}

export interface Invoice {
  lines: InvoiceLine[];
  subtotal: number;
  vatLines: { code: number; rate: number; base: number; amount: number }[];
  total: number;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

/**
 * Construit le décompte d'une mission. Les montants sont TTC (TVA incluse, pratique suisse).
 * perspective 'client' : temps initial au tarif client ; 'pro' : au gain horaire du pro.
 */
export function buildInvoice(
  mission: Pick<Mission, 'base_hours' | 'client_rate_chf' | 'pro_rate_chf'>,
  expenses: Expense[],
  vatRates: VatRateRow[],
  perspective: 'client' | 'pro' = 'client',
): Invoice {
  const rateOf = (code: number) => vatRates.find((v) => v.code === code)?.rate ?? 0;
  const hours = Number(mission.base_hours ?? 0);
  const hourly = Number(perspective === 'pro' ? mission.pro_rate_chf : mission.client_rate_chf) || 0;
  const base = round2(hours * hourly);

  const lines: InvoiceLine[] = [
    { key: 'base', label: 'Temps initial de la mission', detail: hoursText(hours), amount: base, vatCode: 1, isBase: true },
    ...expenses.map((e) => ({
      key: e.id,
      label: e.label,
      detail: e.kind === 'time' && e.minutes ? `+${e.minutes}min` : undefined,
      amount: Number(e.amount_chf),
      vatCode: e.vat_code,
      isBase: false,
    })),
  ];

  const subtotal = round2(lines.reduce((s, l) => s + l.amount, 0));
  const byCode = new Map<number, { base: number; amount: number }>();
  for (const l of lines) {
    const r = rateOf(l.vatCode);
    const vat = round2(l.amount - l.amount / (1 + r / 100));
    const cur = byCode.get(l.vatCode) ?? { base: 0, amount: 0 };
    byCode.set(l.vatCode, { base: round2(cur.base + l.amount), amount: round2(cur.amount + vat) });
  }
  const vatLines = [...byCode.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([code, v]) => ({ code, rate: rateOf(code), base: v.base, amount: v.amount }));

  return { lines, subtotal, vatLines, total: subtotal };
}

function hoursText(h: number): string {
  const whole = Math.floor(h);
  const min = Math.round((h - whole) * 60);
  return min ? `${whole}h${String(min).padStart(2, '0')}` : `${whole}h`;
}
