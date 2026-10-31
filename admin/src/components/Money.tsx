import { useRecordContext } from 'react-admin';
import { chf } from '../lib/format';
import { brand } from '../theme';

export function Money({ value, sign, strong }: { value: number | null | undefined; sign?: boolean; strong?: boolean }) {
  if (value === null || value === undefined) return <span style={{ color: brand.muted }}>–</span>;
  return <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: strong ? 600 : undefined }}>{chf(Number(value), { sign })}</span>;
}

/** Montant CHF dans un Datagrid. `fallbackSource` est utilisé quand la valeur principale est encore nulle. */
export function MoneyField({
  source,
  fallbackSource,
}: {
  source: string;
  fallbackSource?: string;
  label?: string;
  sortBy?: string;
  textAlign?: 'left' | 'right' | 'center';
}) {
  const record = useRecordContext<Record<string, unknown>>();
  if (!record) return null;
  const raw = record[source] ?? (fallbackSource ? record[fallbackSource] : null);
  if (raw === null || raw === undefined) return <span style={{ color: brand.muted }}>–</span>;
  return <Money value={Number(raw)} />;
}
