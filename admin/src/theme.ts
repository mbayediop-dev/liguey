import { deepmerge } from '@mui/utils';
import { defaultLightTheme, type RaThemeOptions } from 'react-admin';

/** Couleurs HEROES (maquettes mobiles) + neutres chauds du modèle de tableau de bord. */
export const brand = {
  red: '#FE0F2E',
  redSoft: '#FFB7C1',
  redTint: '#FFE6EA',
  blue: '#383495',
  bg: '#F3F3F1', // fond de page
  sheet: '#FFFFFF', // feuille blanche qui porte les cartes
  surface: '#F6F6F4', // fond des champs et pastilles
  ink: '#111111',
  inkSoft: '#5F5F66',
  muted: '#9A9AA0',
  line: '#EBEBE8',
  white: '#FFFFFF',
  black: '#111111',
};

export const radius = { card: 28, inner: 20, field: 16, pill: 999 };

export const theme: RaThemeOptions = deepmerge(defaultLightTheme, {
  palette: {
    mode: 'light',
    primary: { main: brand.red, contrastText: '#fff' },
    secondary: { main: brand.blue, contrastText: '#fff' },
    background: { default: brand.bg, paper: brand.white },
    text: { primary: brand.ink, secondary: brand.inkSoft },
    divider: brand.line,
    action: { hover: 'rgba(17, 17, 17, 0.04)' },
  },
  shape: { borderRadius: radius.inner },
  breakpoints: { values: { xs: 0, sm: 600, md: 900, lg: 1200, xl: 1400 } },
  sidebar: { width: 236, closedWidth: 84 },
  typography: {
    fontFamily: 'Poppins, system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
    h3: { fontWeight: 600, letterSpacing: -1, fontSize: '2.4rem' },
    h4: { fontWeight: 600, letterSpacing: -0.6 },
    h5: { fontWeight: 600, letterSpacing: -0.3 },
    h6: { fontWeight: 600 },
    subtitle1: { fontWeight: 600 },
    subtitle2: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 500 },
    caption: { color: brand.inkSoft },
  },
  components: {
    MuiCssBaseline: { styleOverrides: { body: { backgroundColor: brand.bg } } },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
        rounded: { borderRadius: radius.inner },
        elevation1: { boxShadow: 'none', border: `1px solid ${brand.line}` },
      },
    },
    MuiCard: {
      styleOverrides: { root: { borderRadius: radius.card, border: `1px solid ${brand.line}`, boxShadow: 'none' } },
    },
    MuiCardHeader: { styleOverrides: { root: { padding: '20px 24px 8px' } } },
    MuiCardContent: { styleOverrides: { root: { padding: '16px 24px' } } },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: radius.pill, paddingLeft: 18, paddingRight: 18, minHeight: 40, fontWeight: 500 },
        sizeSmall: { minHeight: 34, paddingLeft: 14, paddingRight: 14 },
        sizeLarge: { minHeight: 52, paddingLeft: 26, paddingRight: 26, fontSize: '1rem' },
        outlined: { borderColor: brand.line, color: brand.ink, backgroundColor: brand.white, '&:hover': { backgroundColor: brand.surface, borderColor: brand.line } },
        text: { color: brand.ink },
      },
    },
    MuiIconButton: { styleOverrides: { root: { color: brand.ink } } },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: radius.pill, fontWeight: 500, backgroundColor: brand.white, border: `1px solid ${brand.line}` },
        sizeSmall: { height: 26 },
      },
    },
    MuiFilledInput: {
      defaultProps: { disableUnderline: true },
      styleOverrides: {
        root: {
          borderRadius: radius.field,
          backgroundColor: brand.surface,
          border: '1px solid transparent',
          transition: 'border-color .15s, background-color .15s',
          '&:hover': { backgroundColor: brand.surface },
          '&.Mui-focused': { backgroundColor: brand.white, borderColor: brand.ink },
          '&.Mui-error': { borderColor: brand.red },
          '&:before, &:after': { display: 'none' },
        },
        input: { paddingTop: 22, paddingBottom: 8 },
        inputSizeSmall: { paddingTop: 18, paddingBottom: 6 },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: { borderRadius: radius.field, backgroundColor: brand.white, '& fieldset': { borderColor: brand.line } },
      },
    },
    MuiInputLabel: { styleOverrides: { root: { color: brand.muted }, filled: { transform: 'translate(12px, 14px) scale(1)', '&.MuiInputLabel-shrink': { transform: 'translate(12px, 5px) scale(0.75)' } } } },
    MuiFormHelperText: { styleOverrides: { root: { marginLeft: 12 } } },
    MuiTableCell: {
      styleOverrides: {
        root: { borderBottomColor: brand.line, paddingTop: 14, paddingBottom: 14 },
        head: { fontWeight: 500, color: brand.inkSoft, fontSize: 12.5, backgroundColor: brand.white },
      },
    },
    MuiTabs: { styleOverrides: { indicator: { height: 3, borderRadius: 3 } } },
    MuiTab: { styleOverrides: { root: { fontWeight: 500 } } },
    MuiDialog: { styleOverrides: { paper: { borderRadius: radius.card } } },
    MuiMenu: { styleOverrides: { paper: { borderRadius: radius.inner, border: `1px solid ${brand.line}`, boxShadow: '0 12px 32px rgba(17,17,17,0.08)' } } },
    MuiTooltip: { styleOverrides: { tooltip: { borderRadius: 10, fontFamily: 'Poppins, sans-serif' } } },
    MuiLinearProgress: { styleOverrides: { root: { borderRadius: 4 } } },

    RaLayout: {
      styleOverrides: {
        root: {
          backgroundColor: brand.bg,
          '& .RaLayout-appFrame': { marginTop: 80 },
          '& .RaLayout-content': { padding: '8px 24px 32px 8px', backgroundColor: brand.bg },
        },
      },
    },
    RaAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: brand.bg,
          color: brand.ink,
          boxShadow: 'none',
          '& .RaAppBar-toolbar': { minHeight: 80, paddingLeft: 24, paddingRight: 24 },
          '& .RaAppBar-menuButton': {
            width: 48,
            height: 48,
            marginRight: 16,
            border: `1px solid ${brand.line}`,
            backgroundColor: brand.white,
            '& svg': { fontSize: 20 },
          },
        },
      },
    },
    RaSidebar: {
      styleOverrides: {
        root: {
          '& .RaSidebar-fixed': { backgroundColor: brand.bg, paddingTop: 4 },
          '& .RaSidebar-paper': { backgroundColor: brand.bg },
        },
      },
    },
    RaMenuItemLink: {
      styleOverrides: {
        root: {
          borderRadius: radius.pill,
          margin: '4px 12px',
          padding: '10px 14px',
          color: brand.inkSoft,
          border: '1px solid transparent',
          '& .RaMenuItemLink-icon': { color: brand.ink, minWidth: 36 },
          '&:hover': { backgroundColor: brand.white, borderColor: brand.line },
          '&.RaMenuItemLink-active': {
            backgroundColor: brand.ink,
            color: brand.white,
            '& .RaMenuItemLink-icon': { color: brand.white },
          },
        },
      },
    },
    RaList: {
      styleOverrides: {
        root: {
          '& .RaList-content': { borderRadius: radius.card, border: `1px solid ${brand.line}`, boxShadow: 'none', overflow: 'hidden' },
          '& .RaList-actions': { paddingTop: 8, paddingBottom: 8, alignItems: 'flex-end' },
        },
      },
    },
    RaDatagrid: {
      styleOverrides: {
        root: {
          '& .RaDatagrid-headerCell': { backgroundColor: brand.white, color: brand.inkSoft, fontSize: 12.5, fontWeight: 500, whiteSpace: 'nowrap' },
          '& .RaDatagrid-rowCell': { paddingTop: 12, paddingBottom: 12 },
          '& .RaDatagrid-row:hover': { backgroundColor: '#FAFAF8' },
          '& .RaDatagrid-clickableRow': { cursor: 'pointer' },
        },
      },
    },
    RaTopToolbar: {
      styleOverrides: {
        root: {
          gap: 8,
          '& .MuiButton-root': { border: `1px solid ${brand.line}`, backgroundColor: brand.white, borderRadius: radius.pill, paddingLeft: 14, paddingRight: 14 },
        },
      },
    },
    RaFilterForm: { styleOverrides: { root: { alignItems: 'flex-end', gap: 8 } } },
    RaFilterButton: { styleOverrides: { root: { '& .MuiButton-root': { border: `1px solid ${brand.line}`, backgroundColor: brand.white } } } },
    RaShow: { styleOverrides: { root: { '& .RaShow-card': { borderRadius: radius.card } } } },
    RaEdit: { styleOverrides: { root: { '& .RaEdit-card': { borderRadius: radius.card } } } },
    RaCreate: { styleOverrides: { root: { '& .RaCreate-card': { borderRadius: radius.card } } } },
    RaToolbar: { styleOverrides: { root: { backgroundColor: 'transparent', borderTop: `1px solid ${brand.line}` } } },
    RaTabbedShowLayout: { styleOverrides: { root: { '& .RaTabbedShowLayout-content': { padding: 24 } } } },
    RaLogin: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: brand.bg,
          '& .RaLogin-card': { borderRadius: radius.card, border: `1px solid ${brand.line}`, boxShadow: 'none', minWidth: 360, padding: '16px 12px 8px' },
          '& .RaLogin-avatar': { display: 'none' },
        },
      },
    },
    RaNotification: { styleOverrides: { root: { '& .MuiPaper-root': { borderRadius: radius.field } } } },
  },
});
