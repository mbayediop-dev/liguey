/**
 * Mode démo : données fictives en mémoire, sans Supabase. Activé par `VITE_DEMO=1` (script `npm run admin:demo`)
 * ou en ajoutant `?demo=1` à l'URL. Sert à présenter et vérifier l'interface.
 */
export const isDemo: boolean =
  import.meta.env.VITE_DEMO === '1' || (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('demo') === '1');
