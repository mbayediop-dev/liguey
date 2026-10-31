import { useEffect, useState, type ReactNode } from 'react';
import { Avatar, Badge, Box, IconButton, InputBase, ListItemIcon, ListItemText, Menu as MuiMenu, MenuItem, Stack, Typography } from '@mui/material';
import DashboardIcon from '@mui/icons-material/SpaceDashboardOutlined';
import PeopleIcon from '@mui/icons-material/PeopleOutline';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUserOutlined';
import AssignmentIcon from '@mui/icons-material/AssignmentOutlined';
import PaymentsIcon from '@mui/icons-material/PaymentsOutlined';
import StarIcon from '@mui/icons-material/StarOutline';
import SupportAgentIcon from '@mui/icons-material/SupportAgentOutlined';
import NotificationsIcon from '@mui/icons-material/NotificationsNoneOutlined';
import DescriptionIcon from '@mui/icons-material/DescriptionOutlined';
import HandymanIcon from '@mui/icons-material/HandymanOutlined';
import PercentIcon from '@mui/icons-material/Percent';
import GavelIcon from '@mui/icons-material/GavelOutlined';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import { AppBar, Layout, Logout, Menu, TitlePortal, UserMenu, useAuthState, useGetIdentity, useGetList, useSidebarState, useTranslate } from 'react-admin';
import { useNavigate } from 'react-router-dom';
import { brand } from '../theme';
import { initials } from '../lib/format';

export const TO_VERIFY_FILTER = { role: 'pro', verification_status: 'pending', onboarding_completed: true };
export const OPEN_SUPPORT_FILTER = { status: 'open' };

export function listLink(resource: string, filter: Record<string, unknown>): string {
  return `/${resource}?filter=${encodeURIComponent(JSON.stringify(filter))}&displayedFilters=${encodeURIComponent(
    JSON.stringify(Object.fromEntries(Object.keys(filter).map((k) => [k, true]))),
  )}`;
}

/** Bouton rond blanc à bordure fine, comme dans le modèle. */
export function CircleButton({
  children,
  onClick,
  title,
  size = 48,
  badge,
  to,
}: {
  children: ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  title?: string;
  size?: number;
  badge?: number;
  to?: string;
}) {
  const nav = useNavigate();
  const btn = (
    <IconButton
      title={title}
      aria-label={title}
      onClick={to ? () => nav(to) : onClick}
      sx={{ width: size, height: size, bgcolor: brand.white, border: `1px solid ${brand.line}`, '&:hover': { bgcolor: brand.surface }, '& svg': { fontSize: size * 0.42 } }}
    >
      {children}
    </IconButton>
  );
  return badge ? (
    <Badge badgeContent={badge} color="primary" max={99} overlap="circular">
      {btn}
    </Badge>
  ) : (
    btn
  );
}

function MenuGroup({ label }: { label: string }) {
  const [open] = useSidebarState();
  if (!open) return <Box sx={{ borderTop: `1px solid ${brand.line}`, my: 1, mx: 3 }} />;
  return (
    <Typography variant="overline" sx={{ display: 'block', px: 3.5, pt: 2, pb: 0.5, color: brand.muted, lineHeight: 1.6, fontSize: 11 }}>
      {label}
    </Typography>
  );
}

function CountBadge({ count, children }: { count: number | undefined; children: ReactNode }) {
  const [open] = useSidebarState();
  if (!count) return <>{children}</>;
  if (!open) {
    // rail replié : simple point rouge dans le coin du bouton rond
    return (
      <>
        {children}
        <Box component="span" sx={{ position: 'absolute', top: 7, right: 7, width: 9, height: 9, borderRadius: 5, bgcolor: brand.red, border: `2px solid ${brand.white}` }} />
      </>
    );
  }
  return (
    <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 1.5 }}>
      {children}
      <Box component="span" sx={{ px: 0.9, py: 0.1, borderRadius: 99, bgcolor: brand.red, color: '#fff', fontSize: 11, fontWeight: 600, lineHeight: 1.6 }}>
        {count > 99 ? '99+' : count}
      </Box>
    </Box>
  );
}

function AdminMenu() {
  const t = useTranslate();
  const [open] = useSidebarState();
  const { authenticated } = useAuthState();
  const pending = useGetList(
    'profiles',
    { filter: TO_VERIFY_FILTER, pagination: { page: 1, perPage: 1 }, sort: { field: 'created_at', order: 'DESC' } },
    { enabled: authenticated === true, refetchInterval: 60_000 },
  );
  const support = useGetList(
    'support_requests',
    { filter: OPEN_SUPPORT_FILTER, pagination: { page: 1, perPage: 1 }, sort: { field: 'created_at', order: 'DESC' } },
    { enabled: authenticated === true, refetchInterval: 60_000 },
  );
  // Barre repliée : rail d'icônes rondes
  const closedSx = open
    ? {}
    : {
        // le libellé est un nœud texte direct : on l'efface via fontSize 0 et on redonne sa taille à l'icône
        '& .RaMenuItemLink-root': { width: 48, height: 48, margin: '6px auto', padding: 0, justifyContent: 'center', overflow: 'hidden', fontSize: 0, backgroundColor: brand.white, border: `1px solid ${brand.line}` },
        '& .RaMenuItemLink-icon': { minWidth: 0, margin: 0, '& svg': { fontSize: 22 } },
        '& .RaMenuItemLink-root.RaMenuItemLink-active': { backgroundColor: brand.ink, borderColor: brand.ink },
        '& .RaMenuItemLink-active .RaMenuItemLink-icon': { color: brand.white },
      };
  return (
    <Menu sx={{ pb: 3, pt: 1, ...closedSx }}>
      <Menu.DashboardItem primaryText={t('heroes.dashboard.title')} leftIcon={<DashboardIcon />} />
      <MenuGroup label={t('heroes.menu.users')} />
      <Menu.ResourceItem name="profiles" />
      <Menu.Item
        to={listLink('profiles', TO_VERIFY_FILTER)}
        primaryText={<CountBadge count={pending.total}>{t('heroes.menu.to_verify')}</CountBadge>}
        leftIcon={<VerifiedUserIcon />}
      />
      <Menu.ResourceItem name="pro_documents" />
      <MenuGroup label={t('heroes.menu.activity')} />
      <Menu.ResourceItem name="missions" />
      <Menu.ResourceItem name="payments" />
      <Menu.ResourceItem name="reviews" />
      <Menu.Item
        to={listLink('support_requests', OPEN_SUPPORT_FILTER)}
        primaryText={<CountBadge count={support.total}>{t('resources.support_requests.name', { smart_count: 2 })}</CountBadge>}
        leftIcon={<SupportAgentIcon />}
      />
      <Menu.ResourceItem name="notifications" />
      <MenuGroup label={t('heroes.menu.catalog')} />
      <Menu.ResourceItem name="services" />
      <Menu.ResourceItem name="vat_rates" />
      <Menu.ResourceItem name="legal_pages" />
    </Menu>
  );
}

/** Logo rond noir + « HEROES » et titre de page en gris (comme « Financial / Dashboard » dans le modèle). */
function BrandTitle() {
  return (
    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
      <Box sx={{ width: 48, height: 48, borderRadius: 24, bgcolor: brand.black, color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 900, fontSize: 20, letterSpacing: -1, flexShrink: 0 }}>
        H
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ fontWeight: 600, lineHeight: 1.15, fontSize: 18, letterSpacing: -0.3 }}>HEROES</Typography>
        <TitlePortal
          variant="body1"
          sx={{ flex: 'none', color: brand.inkSoft, fontWeight: 400, lineHeight: 1.15, fontSize: 16, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 320 }}
        />
      </Box>
    </Stack>
  );
}

function QuickAdd() {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const nav = useNavigate();
  const go = (to: string) => {
    setAnchor(null);
    nav(to);
  };
  return (
    <>
      <CircleButton title="Créer" onClick={(e) => setAnchor(e.currentTarget)}>
        <AddIcon />
      </CircleButton>
      <MuiMenu anchorEl={anchor} open={!!anchor} onClose={() => setAnchor(null)} transformOrigin={{ horizontal: 'right', vertical: 'top' }} anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}>
        <MenuItem onClick={() => go('/services/create')}>
          <ListItemIcon>
            <HandymanIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Nouvelle prestation</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => go('/legal_pages/create')}>
          <ListItemIcon>
            <GavelIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Nouvelle page légale</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => go('/vat_rates/create')}>
          <ListItemIcon>
            <PercentIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Nouveau taux de TVA</ListItemText>
        </MenuItem>
      </MuiMenu>
    </>
  );
}

function Identity() {
  const { identity } = useGetIdentity();
  const name = identity?.fullName ?? '';
  const parts = name.split(' ');
  return (
    <Stack direction="row" spacing={1.25} alignItems="center" sx={{ '& .RaUserMenu-userButton': { fontSize: 0, minWidth: 0, p: 0.25, '& .MuiButton-startIcon': { m: 0 } } }}>
      <UserMenu
        icon={
          <Avatar src={identity?.avatar} sx={{ width: 44, height: 44, bgcolor: brand.blue, fontWeight: 600, fontSize: 16 }}>
            {initials({ first_name: parts[0], last_name: parts.slice(1).join(' ') })}
          </Avatar>
        }
      >
        <Logout />
      </UserMenu>
      <Box sx={{ display: { xs: 'none', md: 'block' } }}>
        <Typography sx={{ fontWeight: 600, lineHeight: 1.2, fontSize: 15 }}>{name || 'Administrateur'}</Typography>
        <Typography variant="caption" sx={{ color: brand.inkSoft, lineHeight: 1.2 }}>
          Administrateur HEROES
        </Typography>
      </Box>
    </Stack>
  );
}

/** Recherche globale : ouvre la liste des utilisateurs filtrée. */
function GlobalSearch() {
  const [q, setQ] = useState('');
  const nav = useNavigate();
  const submit = () => {
    const term = q.trim();
    if (!term) return;
    nav(listLink('profiles', { 'search@ilike': term }));
  };
  return (
    <Stack direction="row" spacing={1} alignItems="center" sx={{ display: { xs: 'none', lg: 'flex' } }}>
      <CircleButton title="Rechercher" onClick={submit}>
        <SearchIcon />
      </CircleButton>
      <InputBase
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && submit()}
        placeholder="Rechercher un utilisateur…"
        sx={{ width: 236, fontSize: 15, color: brand.ink, '& input::placeholder': { color: brand.muted, opacity: 1 } }}
        inputProps={{ 'aria-label': 'Rechercher un utilisateur' }}
      />
    </Stack>
  );
}

function AdminAppBar() {
  return (
    <AppBar color="transparent" elevation={0} userMenu={false} toolbar={<></>}>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ flex: 1, minWidth: 0 }}>
        <BrandTitle />
        <Box sx={{ flex: 1 }} />
        <QuickAdd />
        <Identity />
        <GlobalSearch />
      </Stack>
    </AppBar>
  );
}

/**
 * Chaque page (listes, fiches, tableau de bord) exige elle-même une session via react-admin ; les routes
 * publiques set-password / forgot-password sont déclarées `noLayout`. On n'utilise ni `requireAuth` sur <Admin>
 * ni <Authenticated> ici : sans session, ils provoquent une boucle de rendu avec ra-supabase.
 */
export function AdminLayout({ children }: { children: ReactNode }) {
  const [, setOpen] = useSidebarState();
  useEffect(() => {
    // Rail d'icônes par défaut (comme le modèle) ; le choix de l'utilisateur est ensuite mémorisé par react-admin.
    if (localStorage.getItem('RaStore.sidebar.open') === null) setOpen(false);
  }, [setOpen]);
  return (
    <Layout menu={AdminMenu} appBar={AdminAppBar}>
      {children}
    </Layout>
  );
}

export const icons = {
  profiles: PeopleIcon,
  missions: AssignmentIcon,
  payments: PaymentsIcon,
  reviews: StarIcon,
  support: SupportAgentIcon,
  notifications: NotificationsIcon,
  documents: DescriptionIcon,
  services: HandymanIcon,
  vat: PercentIcon,
  legal: GavelIcon,
};
