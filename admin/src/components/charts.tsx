import { useEffect, useRef, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { brand } from '../theme';

/** Largeur mesurée d'un conteneur (ResizeObserver). */
export function useWidth<T extends HTMLElement>(): [React.RefObject<T | null>, number] {
  const ref = useRef<T>(null);
  const [w, setW] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver((e) => setW(e[0]?.contentRect.width ?? 0));
    ro.observe(el);
    setW(el.clientWidth);
    return () => ro.disconnect();
  }, []);
  return [ref, w];
}

/** Anneau de progression (0 → 1). */
export function Ring({
  value,
  size = 124,
  stroke = 10,
  color = brand.red,
  track = 'rgba(255,255,255,0.14)',
  children,
}: {
  value: number;
  size?: number;
  stroke?: number;
  color?: string;
  track?: string;
  children?: React.ReactNode;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(1, value));
  return (
    <Box sx={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} role="img" aria-label={`${Math.round(v * 100)} %`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${c * v} ${c}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>{children}</Box>
    </Box>
  );
}

/** Grille de points : un point par jour, coloré quand il y a eu de l'activité. */
export function DotGrid({ values, cols = 10, active = brand.red, idle = brand.line, size = 11, labels }: { values: number[]; cols?: number; active?: string; idle?: string; size?: number; labels?: string[] }) {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, ${size}px)`, gap: `${Math.round(size * 0.55)}px` }} role="img" aria-label="activité quotidienne">
      {values.map((v, i) => (
        <Box key={i} title={labels?.[i] ? `${labels[i]} : ${v}` : String(v)} sx={{ width: size, height: size, borderRadius: size, bgcolor: v > 0 ? active : idle, opacity: v > 0 ? Math.min(1, 0.45 + v * 0.18) : 1 }} />
      ))}
    </Box>
  );
}

/** « Sucettes » mensuelles : une tige par mois, la dernière mise en avant avec son étiquette. */
export function Lollipops({ data, height = 150, format = (v: number) => String(v) }: { data: { label: string; value: number }[]; height?: number; format?: (v: number) => string }) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const n = data.length;
  const max = Math.max(1, ...data.map((d) => d.value));
  const padTop = 34;
  const padBottom = 22;
  const plotH = height - padTop - padBottom;
  const [hover, setHover] = useState<number | null>(null);
  const slot = n ? width / n : 0;
  const focus = hover ?? n - 1;
  return (
    <Box ref={ref} sx={{ position: 'relative', width: '100%', height }}>
      {width > 0 ? (
        <svg width={width} height={height} role="img" aria-label="évolution mensuelle" style={{ display: 'block' }}>
          <defs>
            <pattern id="dots" width="14" height="14" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="1" fill={brand.line} />
            </pattern>
          </defs>
          <rect x={0} y={padTop - 10} width={width} height={plotH + 10} fill="url(#dots)" />
          {data.map((d, i) => {
            const x = slot * i + slot / 2;
            const y = padTop + plotH - (d.value / max) * plotH;
            const on = i === focus;
            return (
              <g key={d.label} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
                <rect x={slot * i} y={0} width={slot} height={height} fill="transparent" />
                <line x1={x} x2={x} y1={padTop + plotH} y2={y} stroke={on ? brand.red : brand.line} strokeWidth={on ? 3 : 2} strokeLinecap="round" />
                <circle cx={x} cy={y} r={on ? 7 : 5} fill={on ? brand.red : brand.white} stroke={on ? brand.red : brand.line} strokeWidth={2} />
                <text x={x} y={height - 6} textAnchor="middle" fontSize={11} fill={on ? brand.ink : brand.muted} fontWeight={on ? 600 : 400}>
                  {d.label}
                </text>
                {on ? (
                  <g transform={`translate(${Math.min(Math.max(x, 34), width - 34)}, ${Math.max(14, y - 20)})`}>
                    <rect x={-32} y={-12} width={64} height={22} rx={11} fill={brand.red} />
                    <text x={0} y={3} textAnchor="middle" fontSize={11} fontWeight={600} fill="#fff">
                      {format(d.value)}
                    </text>
                  </g>
                ) : null}
              </g>
            );
          })}
        </svg>
      ) : null}
    </Box>
  );
}

function smoothPath(points: [number, number][]): string {
  if (points.length < 2) return '';
  let d = `M${points[0][0]},${points[0][1]}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C${c1x},${c1y} ${c2x},${c2y} ${p2[0]},${p2[1]}`;
  }
  return d;
}

/** Courbe lissée sans axes. */
export function Sparkline({ values, height = 72, color = brand.red, labels }: { values: number[]; height?: number; color?: string; labels?: string[] }) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  const n = values.length;
  const max = Math.max(1, ...values);
  const pad = 6;
  const pts: [number, number][] = values.map((v, i) => [pad + (i * (width - 2 * pad)) / Math.max(1, n - 1), pad + (height - 2 * pad) * (1 - v / max)]);
  return (
    <Box ref={ref} sx={{ position: 'relative', width: '100%', height }}>
      {width > 0 && n > 1 ? (
        <svg width={width} height={height} role="img" aria-label="tendance" style={{ display: 'block', overflow: 'visible' }}>
          <path d={smoothPath(pts)} fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" />
          {pts.map(([x, y], i) => (
            <g key={i}>
              <rect x={x - (width / n) / 2} y={0} width={width / n} height={height} fill="transparent" onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} />
              {hover === i ? <circle cx={x} cy={y} r={5} fill={color} stroke="#fff" strokeWidth={2} /> : null}
            </g>
          ))}
        </svg>
      ) : null}
      {hover !== null && pts[hover] ? (
        <Box sx={{ position: 'absolute', left: pts[hover][0], top: pts[hover][1] - 10, transform: 'translate(-50%, -100%)', bgcolor: brand.ink, color: '#fff', px: 1, py: 0.25, borderRadius: 1.5, fontSize: 11, whiteSpace: 'nowrap', pointerEvents: 'none' }}>
          <strong>{values[hover]}</strong>
          {labels?.[hover] ? ` · ${labels[hover]}` : ''}
        </Box>
      ) : null}
    </Box>
  );
}

/** Cercles emboîtés tangents en bas : surface ∝ valeur, écart minimal garanti entre les sommets, étiquette dans chaque croissant. */
export function NestedCircles({ items, height = 300, format = (v: number) => String(v) }: { items: { label: string; value: number }[]; height?: number; format?: (v: number) => string }) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const sorted = [...items].filter((i) => i.value > 0).sort((a, b) => b.value - a.value).slice(0, 4);
  const max = sorted[0]?.value ?? 1;
  const chartH = height - 34;
  const rMax = Math.min(width, chartH) / 2 - 4;
  const cx = width / 2;
  const bottom = chartH - 4;
  const radii = sorted.map((it) => Math.max(24, rMax * Math.sqrt(it.value / max)));
  for (let i = 1; i < radii.length; i++) radii[i] = Math.max(22, Math.min(radii[i]!, radii[i - 1]! - 15));
  const tints = ['#FFE6EA', '#FFC9D1', '#FF9DAB', brand.red];
  const colorOf = (i: number) => (i === sorted.length - 1 ? brand.red : tints[Math.min(i, tints.length - 1)]!);
  return (
    <Box ref={ref} sx={{ width: '100%' }}>
      {width > 0 ? (
        <svg width={width} height={chartH} role="img" aria-label="répartition" style={{ display: 'block' }}>
          {sorted.map((it, i) => {
            const r = radii[i]!;
            const cy = bottom - r;
            const top = cy - r;
            const deepest = i === sorted.length - 1;
            const nextTop = deepest ? cy : bottom - 2 * radii[i + 1]!;
            const labelY = deepest ? cy + 5 : (top + nextTop) / 2 + 5;
            return (
              <g key={it.label}>
                <circle cx={cx} cy={cy} r={r} fill={colorOf(i)} />
                <text x={cx} y={labelY} textAnchor="middle" fontSize={14} fontWeight={600} fill={deepest ? '#fff' : brand.ink}>
                  {format(it.value)}
                </text>
              </g>
            );
          })}
        </svg>
      ) : null}
      {sorted.length ? (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, justifyContent: 'center', mt: 1 }}>
          {sorted.map((it, i) => (
            <Box key={it.label} sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, fontSize: 12, color: brand.inkSoft }}>
              <Box sx={{ width: 10, height: 10, borderRadius: 5, bgcolor: colorOf(i), border: `1px solid ${brand.line}` }} />
              {it.label}
            </Box>
          ))}
        </Box>
      ) : (
        <Typography variant="body2" color="text.secondary">
          Aucune donnée
        </Typography>
      )}
    </Box>
  );
}

/** Barres fines arrondies façon « onde », pour une petite série. */
export function MiniBars({ values, height = 72, color = brand.red, idle = brand.line }: { values: number[]; height?: number; color?: string; idle?: string }) {
  const max = Math.max(1, ...values);
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px', height }} role="img" aria-label="série récente">
      {values.map((v, i) => {
        const h = Math.max(6, (v / max) * height);
        return <Box key={i} title={String(v)} sx={{ width: 5, height: h, borderRadius: 3, bgcolor: v > 0 ? color : idle, opacity: v > 0 ? 0.55 + 0.45 * (v / max) : 1 }} />;
      })}
    </Box>
  );
}
