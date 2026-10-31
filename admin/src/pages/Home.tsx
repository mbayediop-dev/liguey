import { useMemo, useState, type ReactNode } from 'react';
import { Alert, Box, Button, Chip, Divider, InputBase, LinearProgress, Menu, MenuItem, Stack, Typography, type SxProps, type Theme } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CalendarIcon from '@mui/icons-material/CalendarMonthOutlined';
import SupportAgentIcon from '@mui/icons-material/SupportAgentOutlined';
import AssignmentIcon from '@mui/icons-material/AssignmentOutlined';
import PersonAddIcon from '@mui/icons-material/PersonAddAltOutlined';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUserOutlined';
import TodayIcon from '@mui/icons-material/TodayOutlined';
import InsightsIcon from '@mui/icons-material/InsightsOutlined';
import TimelineIcon from '@mui/icons-material/TimelineOutlined';
import PaymentsIcon from '@mui/icons-material/PaymentsOutlined';
import SearchIcon from '@mui/icons-material/Search';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import Face1 from '@mui/icons-material/SentimentVeryDissatisfiedOutlined';
import Face2 from '@mui/icons-material/SentimentDissatisfiedOutlined';
import Face3 from '@mui/icons-material/SentimentNeutralOutlined';
import Face4 from '@mui/icons-material/SentimentSatisfiedOutlined';
import Face5 from '@mui/icons-material/SentimentVerySatisfiedOutlined';
import { useQuery } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Title, useAuthState, useGetIdentity, useGetList, useGetMany, useTranslate } from 'react-admin';
import { useNavigate } from 'react-router-dom';
import type { MissionRow, ProfileRow, ReviewRow, ServiceRow, SupportRequestRow } from '@shared/supabase/database.types';
import { admin, type DashboardStats } from '../lib/admin';
import { chf, fmtTime, fullName, missionTone, statusLabel } from '../lib/format';
import { ToneChip } from '../components/StatusChip';
import { DotGrid, Lollipops, MiniBars, NestedCircles, Ring, Sparkline } from '../components/charts';
import { CircleButton, OPEN_SUPPORT_FILTER, TO_VERIFY_FILTER, listLink } from '../layout/AdminLayout';
import { brand, radius } from '../theme';

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const kchf = (v: number) => (v >= 1000 ? `${Math.round(v / 100) / 10}k` : String(Math.round(v)));
const today = () => format(new Date(), 'yyyy-MM-dd');

/* ------------------------------------------------------------------ briques */

function Tile({ children, sx, to, dark }: { children: ReactNode; sx?: SxProps<Theme>; to?: string; dark?: boolean }) {
  const nav = useNavigate();
  return (
    <Box
      onClick={to ? () => nav(to) : undefined}
      sx={[
        {
          bgcolor: dark ? brand.ink : brand.white,
          color: dark ? '#fff' : brand.ink,
          border: `1px solid ${dark ? brand.ink : brand.line}`,
          borderRadius: `${radius.card}px`,
          p: 3,
          position: 'relative',
          minWidth: 0,
          cursor: to ? 'pointer' : undefined,
          transition: 'box-shadow .15s',
          '&:hover': to ? { boxShadow: '0 10px 28px rgba(17,17,17,.07)' } : undefined,
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {children}
    </Box>
  );
}

function IconCircle({ children, size = 44, bg = brand.surface, color = brand.ink }: { children: ReactNode; size?: number; bg?: string; color?: string }) {
  return (
    <Box sx={{ width: size, height: size, borderRadius: size, bgcolor: bg, color, display: 'grid', placeItems: 'center', flexShrink: 0, '& svg': { fontSize: size * 0.48 } }}>
      {children}
    </Box>
  );
}

function Label({ children, light }: { children: ReactNode; light?: boolean }) {
  return (
    <Typography variant="body2" sx={{ color: light ? 'rgba(255,255,255,.7)' : brand.inkSoft }}>
      {children}
    </Typography>
  );
}

function Value({ children, size = 28 }: { children: ReactNode; size?: number }) {
  return <Typography sx={{ fontSize: size, fontWeight: 600, letterSpacing: -0.8, lineHeight: 1.15, fontVariantNumeric: 'tabular-nums' }}>{children}</Typography>;
}

function PillSelect<T extends string>({ value, options, onChange }: { value: T; options: { id: T; name: string }[]; onChange: (v: T) => void }) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  return (
    <>
      <Button size="small" variant="outlined" endIcon={<ExpandMoreIcon />} onClick={(e) => setAnchor(e.currentTarget)} sx={{ fontSize: 13, px: 1.75, minHeight: 36, whiteSpace: 'nowrap' }}>
        {options.find((o) => o.id === value)?.name}
      </Button>
      <Menu anchorEl={anchor} open={!!anchor} onClose={() => setAnchor(null)}>
        {options.map((o) => (
          <MenuItem
            key={o.id}
            selected={o.id === value}
            onClick={() => {
              onChange(o.id);
              setAnchor(null);
            }}
          >
            {o.name}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

function AccentLink({ to, icon, children }: { to: string; icon: ReactNode; children: ReactNode }) {
  const nav = useNavigate();
  return (
    <Stack direction="row" spacing={1} alignItems="center" onClick={() => nav(to)} sx={{ cursor: 'pointer', color: brand.red, '&:hover': { textDecoration: 'underline' } }}>
      <IconCircle size={30} bg={brand.redTint} color={brand.red}>
        {icon}
      </IconCircle>
      <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: 1.2 }}>
        {children}
      </Typography>
    </Stack>
  );
}

function PillButton({ to, dark, children }: { to: string; dark?: boolean; children: ReactNode }) {
  const nav = useNavigate();
  return (
    <Button
      onClick={() => nav(to)}
      sx={{
        bgcolor: dark ? brand.ink : brand.surface,
        color: dark ? '#fff' : brand.ink,
        px: 2.5,
        minHeight: 44,
        fontWeight: 500,
        '&:hover': { bgcolor: dark ? '#2b2b2b' : brand.line },
      }}
    >
      {children}
    </Button>
  );
}

/* --------------------------------------------------------------- en-tête */

function Greeting({ stats }: { stats?: DashboardStats }) {
  const { identity } = useGetIdentity();
  const first = (identity?.fullName ?? '').split(' ')[0] || 'bienvenue';
  const d = new Date();
  const dayFilter = { 'start_date@gte': today(), 'start_date@lte': today() };
  return (
    <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3} alignItems={{ xs: 'flex-start', lg: 'center' }} justifyContent="space-between" sx={{ px: 1, py: 2.5 }}>
      <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" useFlexGap>
        <Box sx={{ width: 108, height: 108, borderRadius: 54, border: `1px solid ${brand.line}`, bgcolor: brand.white, display: 'grid', placeItems: 'center' }}>
          <Typography sx={{ fontSize: 40, fontWeight: 500, letterSpacing: -1 }}>{format(d, 'd')}</Typography>
        </Box>
        <Box>
          <Typography sx={{ fontSize: 22, lineHeight: 1.2 }}>{cap(format(d, 'EEE', { locale: fr }))},</Typography>
          <Typography sx={{ fontSize: 22, lineHeight: 1.2 }}>{cap(format(d, 'MMMM', { locale: fr }))}</Typography>
        </Box>
        <Divider orientation="vertical" flexItem sx={{ mx: 1, display: { xs: 'none', sm: 'block' } }} />
        <Button variant="contained" size="large" endIcon={<ArrowForwardIcon />} onClick={undefined} href={`#${listLink('missions', dayFilter)}`} sx={{ px: 3 }}>
          Missions du jour{stats ? ` (${stats.missions_today})` : ''}
        </Button>
        <CircleButton title="Agenda des missions" to={listLink('missions', { 'start_date@gte': today() })} size={56}>
          <CalendarIcon />
        </CircleButton>
      </Stack>
      <Stack direction="row" spacing={3} alignItems="center">
        <Box sx={{ textAlign: { xs: 'left', lg: 'right' } }}>
          <Typography variant="h3" sx={{ lineHeight: 1.1 }}>
            Hey, {first} 👋
          </Typography>
          <Typography sx={{ fontSize: 30, fontWeight: 300, color: brand.muted, lineHeight: 1.2, letterSpacing: -0.6 }}>Voici l’activité HEROES aujourd’hui.</Typography>
        </Box>
        <CircleButton title="Demandes de support" to={listLink('support_requests', OPEN_SUPPORT_FILTER)} size={68} badge={stats?.support_open}>
          <SupportAgentIcon />
        </CircleButton>
      </Stack>
    </Stack>
  );
}

/* ---------------------------------------------------------------- widgets */

type Period = 'month' | 'total';
const PERIODS: { id: Period; name: string }[] = [
  { id: 'month', name: 'Ce mois' },
  { id: 'total', name: 'Depuis le début' },
];

function RevenueTile({ s }: { s: DashboardStats }) {
  const [period, setPeriod] = useState<Period>('month');
  const revenue = period === 'month' ? s.revenue_month : s.revenue_total;
  const margin = period === 'month' ? s.margin_month : s.margin_total;
  return (
    <Tile sx={{ gridColumn: { xl: 'span 5' }, display: 'flex', flexDirection: 'column' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Box component="img" src="/wordmark-heroes.png" alt="HEROES" sx={{ height: 16 }} />
        <PillSelect value={period} options={PERIODS} onChange={setPeriod} />
      </Stack>
      <Label>Chiffre d’affaires TTC</Label>
      <Value size={32}>{chf(revenue)}</Value>
      <Stack direction="row" spacing={1.5} sx={{ mt: 2.5 }}>
        <PillButton dark to={listLink('missions', { status: 'completed' })}>
          Missions terminées
        </PillButton>
        <PillButton to="/payments">Paiements</PillButton>
      </Stack>
      <Divider sx={{ my: 2.5 }} />
      <Stack direction="row" justifyContent="space-between" alignItems="flex-end" spacing={2}>
        <Box>
          <Label>Marge HEROES</Label>
          <Value size={22}>{chf(margin)}</Value>
        </Box>
        <AccentLink to="/payments" icon={<PaymentsIcon />}>
          Voir les paiements
        </AccentLink>
      </Stack>
    </Tile>
  );
}

function StatsTile({ s }: { s: DashboardStats }) {
  const [period, setPeriod] = useState<Period>('month');
  const completedMonth = s.revenue_monthly[s.revenue_monthly.length - 1]?.missions ?? 0;
  const completed = period === 'month' ? completedMonth : (s.missions_by_status.completed ?? 0);
  return (
    <Tile sx={{ gridColumn: { xl: 'span 5' }, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
        <Stack direction="row" spacing={1.5} alignItems="center">
          <IconCircle>
            <AssignmentIcon />
          </IconCircle>
          <Box>
            <Label>Missions terminées</Label>
            <Value>{completed}</Value>
          </Box>
        </Stack>
        <PillSelect value={period} options={PERIODS} onChange={setPeriod} />
      </Stack>
      <Divider sx={{ my: 2 }} />
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
        <Stack direction="row" spacing={1.5} alignItems="center">
          <IconCircle>
            <PersonAddIcon />
          </IconCircle>
          <Box>
            <Label>Nouveaux inscrits</Label>
            <Value>{s.new_users_30d}</Value>
          </Box>
        </Stack>
        <Chip size="small" label="30 jours" />
      </Stack>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-end" sx={{ mt: 2 }}>
        <Box>
          <Label>Actives en ce moment</Label>
          <Value size={22}>{s.missions_active}</Value>
        </Box>
        <AccentLink to="/missions" icon={<InsightsIcon />}>
          Toutes les missions
        </AccentLink>
      </Stack>
    </Tile>
  );
}

function RoundColumn({ s }: { s: DashboardStats }) {
  const rating = Number(s.avg_rating_pros);
  return (
    <Box sx={{ gridColumn: { xl: 'span 3' }, display: 'grid', gap: 2, alignContent: 'start', justifyItems: 'center' }}>
      <Tile to={listLink('profiles', TO_VERIFY_FILTER)} sx={{ width: '100%', maxWidth: 170, aspectRatio: '1 / 1', borderRadius: '50%', p: 1.5, display: 'grid', placeItems: 'center', textAlign: 'center' }}>
        <Box>
          <IconCircle size={36} bg={s.pros_pending ? brand.redTint : brand.surface} color={s.pros_pending ? brand.red : brand.ink}>
            <VerifiedUserIcon />
          </IconCircle>
          <Typography sx={{ fontSize: 22, fontWeight: 600, lineHeight: 1.1, mt: 1 }}>{s.pros_pending}</Typography>
          <Typography variant="caption" sx={{ lineHeight: 1.2, display: 'block' }}>
            héros à vérifier
          </Typography>
        </Box>
      </Tile>
      <Tile dark to={listLink('profiles', { role: 'pro' })} sx={{ width: '100%', maxWidth: 170, aspectRatio: '1 / 1', borderRadius: '50%', p: 1.5, display: 'grid', placeItems: 'center' }}>
        <Ring value={rating / 5} size={132} stroke={9}>
          <Typography sx={{ fontSize: 22, fontWeight: 600, lineHeight: 1 }}>{rating ? rating.toFixed(1) : '–'}</Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,.7)', lineHeight: 1.2 }}>
            note héros
          </Typography>
        </Ring>
      </Tile>
    </Box>
  );
}

function DaysTile({ s }: { s: DashboardStats }) {
  const created30 = s.missions_daily.reduce((a, d) => a + d.created, 0);
  return (
    <Tile sx={{ gridColumn: { xl: 'span 3' } }} to={listLink('missions', { 'start_date@gte': today(), 'start_date@lte': today() })}>
      <IconCircle>
        <TodayIcon />
      </IconCircle>
      <Value size={26}>
        {s.missions_today} <Typography component="span" sx={{ fontSize: 15, color: brand.inkSoft }}>mission{s.missions_today > 1 ? 's' : ''} aujourd’hui</Typography>
      </Value>
      <Label>{created30} demandes sur 30 jours</Label>
      <Box sx={{ mt: 2 }}>
        <DotGrid values={s.missions_daily.map((d) => d.created)} labels={s.missions_daily.map((d) => format(parseISO(d.day), 'd MMM', { locale: fr }))} />
      </Box>
    </Tile>
  );
}

function MonthlyTile({ s }: { s: DashboardStats }) {
  return (
    <Tile sx={{ gridColumn: { xl: 'span 4' }, p: 2.5 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
        <IconCircle size={38}>
          <InsightsIcon />
        </IconCircle>
        <Typography variant="caption">CA mensuel</Typography>
      </Stack>
      <Lollipops data={s.revenue_monthly.map((m) => ({ label: cap(format(parseISO(`${m.month}-01`), 'MMM', { locale: fr }).replace('.', '')), value: Number(m.revenue) }))} format={kchf} height={150} />
    </Tile>
  );
}

function TopServicesTile({ s }: { s: DashboardStats }) {
  return (
    <Tile sx={{ gridColumn: { xl: 'span 5' } }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
        <Typography sx={{ fontSize: 18, fontWeight: 600 }}>Prestations demandées</Typography>
        <Chip size="small" label="Toutes périodes" />
      </Stack>
      <NestedCircles items={s.top_services.map((t) => ({ label: t.name, value: t.missions }))} height={300} />
    </Tile>
  );
}

function useProfiles(ids: string[]) {
  const { data } = useGetMany<ProfileRow>('profiles', { ids }, { enabled: ids.length > 0 });
  return useMemo(() => new Map((data ?? []).map((p) => [p.id, p])), [data]);
}

function ActivityTile({ s, authenticated }: { s: DashboardStats; authenticated: boolean }) {
  const nav = useNavigate();
  const [q, setQ] = useState('');
  const [show, setShow] = useState({ missions: true, support: true, verifs: true });
  const missions = useGetList<MissionRow>('missions', { pagination: { page: 1, perPage: 8 }, sort: { field: 'created_at', order: 'DESC' } }, { enabled: authenticated });
  const services = useGetList<ServiceRow>('services', { pagination: { page: 1, perPage: 100 }, sort: { field: 'sort_order', order: 'ASC' } }, { enabled: authenticated });
  const support = useGetList<SupportRequestRow>('support_requests', { filter: OPEN_SUPPORT_FILTER, pagination: { page: 1, perPage: 3 }, sort: { field: 'created_at', order: 'DESC' } }, { enabled: authenticated });
  const serviceName = useMemo(() => new Map((services.data ?? []).map((x) => [x.id, x.name])), [services.data]);
  const people = useProfiles([...(missions.data ?? []).map((m) => m.client_id), ...(support.data ?? []).map((r) => r.user_id)]);
  const term = q.trim().toLowerCase();
  const recent = (missions.data ?? [])
    .filter((m) => !term || `${serviceName.get(m.service_id) ?? ''} ${m.city} ${fullName(people.get(m.client_id))}`.toLowerCase().includes(term))
    .slice(0, 4);
  const toggle = (k: keyof typeof show) => setShow((v) => ({ ...v, [k]: !v[k] }));
  const chip = (k: keyof typeof show, label: string, count?: number) => (
    <Chip
      size="small"
      label={count ? `${label} · ${count}` : label}
      onClick={() => toggle(k)}
      onDelete={show[k] ? () => toggle(k) : undefined}
      sx={{ bgcolor: show[k] ? brand.white : brand.surface, color: show[k] ? brand.ink : brand.muted, borderColor: show[k] ? brand.line : 'transparent' }}
    />
  );
  return (
    <Tile sx={{ gridColumn: { xl: 'span 10' }, display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography sx={{ fontSize: 18, fontWeight: 600 }}>Activité</Typography>
        <Stack direction="row" spacing={1}>
          <CircleButton size={40} title="Toutes les missions" to="/missions">
            <MoreHorizIcon />
          </CircleButton>
          <Button variant="outlined" size="small" startIcon={<SearchIcon />} onClick={() => nav(listLink('missions', { status: 'searching' }))}>
            En recherche · {s.missions_searching}
          </Button>
        </Stack>
      </Stack>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} alignItems={{ md: 'center' }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ flex: 1 }}>
          <IconCircle size={40}>
            <SearchIcon />
          </IconCircle>
          <InputBase value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher…" sx={{ flex: 1, fontSize: 15, '& input::placeholder': { color: brand.muted, opacity: 1 } }} />
        </Stack>
        <Stack direction="row" spacing={1}>
          {chip('missions', 'Missions')}
          {chip('support', 'Support', s.support_open)}
          {chip('verifs', 'Vérifications', s.pros_pending)}
        </Stack>
      </Stack>
      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' } }}>
        {show.missions ? (
          <Box sx={{ border: `1px solid ${brand.line}`, borderRadius: `${radius.inner}px`, p: 2.5 }}>
            <Value size={26}>
              {s.missions_active} <Typography component="span" sx={{ fontSize: 13, color: brand.inkSoft }}>actives</Typography>
            </Value>
            <Box sx={{ my: 2 }}>
              <MiniBars values={s.missions_daily.slice(-14).map((d) => d.created)} />
            </Box>
            <Stack spacing={1}>
              {recent.length === 0 ? <Typography variant="body2" color="text.secondary">Aucune demande récente</Typography> : null}
              {recent.map((m) => (
                <Stack key={m.id} direction="row" spacing={1} alignItems="center" onClick={() => nav(`/missions/${m.id}/show`)} sx={{ cursor: 'pointer', '&:hover': { opacity: 0.75 } }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: 4, bgcolor: brand.red, flexShrink: 0 }} />
                  <Typography variant="body2" noWrap sx={{ flex: 1, minWidth: 0 }}>
                    {serviceName.get(m.service_id) ?? 'Mission'} · {m.city} · {fmtTime(m.time_start)}
                  </Typography>
                  <ToneChip tone={missionTone(m.status)} label={statusLabel(m.status)} sx={{ height: 22, fontSize: 10.5 }} />
                </Stack>
              ))}
            </Stack>
          </Box>
        ) : null}
        {show.support ? (
          <Box sx={{ border: `1px solid ${brand.line}`, borderRadius: `${radius.inner}px`, p: 2.5 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
              <Typography sx={{ fontWeight: 600 }}>Support</Typography>
              <CircleButton size={32} title="Toutes les demandes" to={listLink('support_requests', OPEN_SUPPORT_FILTER)}>
                <MoreHorizIcon />
              </CircleButton>
            </Stack>
            <Stack spacing={1.5} sx={{ position: 'relative', pl: 2.5, '&:before': { content: '""', position: 'absolute', left: 7, top: 10, bottom: 10, width: 2, bgcolor: brand.line } }}>
              {(support.data ?? []).map((r) => {
                const u = people.get(r.user_id);
                return (
                  <Stack key={r.id} direction="row" spacing={1} alignItems="flex-start" onClick={() => nav(`/support_requests/${r.id}`)} sx={{ cursor: 'pointer', position: 'relative', '&:hover': { opacity: 0.75 } }}>
                    <Box sx={{ position: 'absolute', left: -22, top: 4, width: 12, height: 12, borderRadius: 6, bgcolor: brand.redTint, border: `2px solid ${brand.red}` }} />
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }} noWrap>
                        {fullName(u) || 'Utilisateur'}
                      </Typography>
                      <Typography variant="caption" sx={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {r.message}
                      </Typography>
                    </Box>
                  </Stack>
                );
              })}
              {!support.data?.length ? <Typography variant="body2" color="text.secondary">Aucune demande ouverte</Typography> : null}
            </Stack>
          </Box>
        ) : null}
        {show.verifs ? (
          <Box sx={{ border: `1px solid ${brand.line}`, borderRadius: `${radius.inner}px`, p: 2.5, display: 'flex', flexDirection: 'column' }}>
            <VerifiedUserIcon sx={{ fontSize: 56, color: brand.red, mb: 1 }} />
            <Typography sx={{ fontWeight: 600 }}>Vérification des héros</Typography>
            <Typography variant="caption" sx={{ mb: 2 }}>
              {s.pros_pending ? `${s.pros_pending} profil${s.pros_pending > 1 ? 's' : ''} en attente de validation des documents.` : 'Aucun profil en attente.'}
            </Typography>
            <Button variant="contained" onClick={() => nav(listLink('profiles', TO_VERIFY_FILTER))} sx={{ mt: 'auto', alignSelf: 'flex-start', px: 3 }}>
              Vérifier
            </Button>
          </Box>
        ) : null}
      </Box>
    </Tile>
  );
}

function TrendTile({ s }: { s: DashboardStats }) {
  const values = s.missions_daily.map((d) => d.created);
  const recent = values.slice(-15).reduce((a, b) => a + b, 0);
  const previous = values.slice(0, 15).reduce((a, b) => a + b, 0);
  const pct = previous ? Math.round(((recent - previous) / previous) * 100) : recent ? 100 : 0;
  return (
    <Tile sx={{ gridColumn: { xl: 'span 5' } }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <IconCircle>
          <TimelineIcon />
        </IconCircle>
        <Value size={26}>{values.reduce((a, b) => a + b, 0)}</Value>
      </Stack>
      <Box sx={{ my: 1.5 }}>
        <Sparkline values={values} labels={s.missions_daily.map((d) => format(parseISO(d.day), 'd MMM', { locale: fr }))} />
      </Box>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-end">
        <Box>
          <Typography sx={{ fontSize: 18, fontWeight: 600 }}>Demandes de mission</Typography>
          <Label>30 derniers jours</Label>
        </Box>
        <Chip size="small" label={`${pct >= 0 ? '+' : ''}${pct} %`} sx={{ color: pct >= 0 ? '#0F5A33' : '#8A0A1A', bgcolor: pct >= 0 ? '#DDF3E6' : '#FFE1E5', borderColor: 'transparent', fontWeight: 600 }} title="15 derniers jours vs 15 précédents" />
      </Stack>
    </Tile>
  );
}

const FACES = [Face1, Face2, Face3, Face4, Face5];

function ReviewsTile({ authenticated }: { authenticated: boolean }) {
  const nav = useNavigate();
  const { data } = useGetList<ReviewRow>('reviews', { pagination: { page: 1, perPage: 200 }, sort: { field: 'created_at', order: 'DESC' } }, { enabled: authenticated });
  const counts = useMemo(() => {
    const c = [0, 0, 0, 0, 0];
    for (const r of data ?? []) c[Math.min(4, Math.max(0, Math.round(Number(r.rating)) - 1))] += 1;
    return c;
  }, [data]);
  const max = Math.max(...counts);
  const total = counts.reduce((a, b) => a + b, 0);
  return (
    <Tile sx={{ gridColumn: { xl: 'span 5' } }}>
      <Stack direction="row" spacing={0.75} sx={{ mb: 3 }}>
        {[0, 1, 2].map((i) => (
          <Box key={i} sx={{ width: i === 2 ? 18 : 6, height: 6, borderRadius: 3, bgcolor: i === 2 ? brand.ink : brand.line }} />
        ))}
      </Stack>
      <Label>Avis récents · {total}</Label>
      <Typography sx={{ fontSize: 22, fontWeight: 500, lineHeight: 1.25, mt: 0.5, mb: 2.5, letterSpacing: -0.4 }}>Comment se passent les missions ?</Typography>
      <Stack direction="row" spacing={1} justifyContent="space-between">
        {FACES.map((Face, i) => {
          const n = counts[i] ?? 0;
          const top = n > 0 && n === max;
          return (
            <Stack key={i} spacing={0.5} alignItems="center" onClick={() => nav(listLink('reviews', { 'rating@gte': i + 0.5, 'rating@lte': i + 1.5 }))} sx={{ cursor: 'pointer' }}>
              <IconCircle size={48} bg={top ? brand.redTint : brand.surface} color={top ? brand.red : brand.ink}>
                <Face />
              </IconCircle>
              <Typography variant="caption" sx={{ fontVariantNumeric: 'tabular-nums', color: top ? brand.red : brand.inkSoft, fontWeight: top ? 600 : 400 }}>
                {n}
              </Typography>
            </Stack>
          );
        })}
      </Stack>
    </Tile>
  );
}

/* ------------------------------------------------------------------- page */

export function Dashboard() {
  const t = useTranslate();
  const { authenticated } = useAuthState();
  const ok = authenticated === true;
  const { data, error, isPending } = useQuery({ queryKey: ['admin', 'dashboard_stats'], queryFn: admin.stats, refetchInterval: 60_000, enabled: ok });
  return (
    <Box>
      <Title title={t('heroes.dashboard.title')} />
      <Greeting stats={data} />
      {isPending && ok ? <LinearProgress sx={{ mb: 2, mx: 1 }} /> : null}
      {error ? (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 3 }}>
          {(error as Error).message}
        </Alert>
      ) : null}
      {data ? (
        <Box sx={{ bgcolor: brand.sheet, border: `1px solid ${brand.line}`, borderRadius: '32px', p: { xs: 1.5, md: 2.5 } }}>
          <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))', xl: 'repeat(20, minmax(0, 1fr))' } }}>
            <RevenueTile s={data} />
            <StatsTile s={data} />
            <RoundColumn s={data} />
            <DaysTile s={data} />
            <MonthlyTile s={data} />
            <TopServicesTile s={data} />
            <ActivityTile s={data} authenticated={ok} />
            <Box sx={{ gridColumn: { xl: 'span 5' }, display: 'grid', gap: 2, alignContent: 'start' }}>
              <TrendTile s={data} />
              <ReviewsTile authenticated={ok} />
            </Box>
          </Box>
        </Box>
      ) : null}
    </Box>
  );
}
