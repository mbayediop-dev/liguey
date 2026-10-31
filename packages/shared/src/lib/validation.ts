export const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
export const isPassword = (v: string) => v.length >= 8;
export const isZip = (v: string) => /^\d{4,5}$/.test(v.trim());
export const nonEmpty = (v: string | null | undefined) => !!v && v.trim().length > 0;

export function errorMessage(e: unknown, fallback = 'Une erreur est survenue'): string {
  if (!e) return fallback;
  if (typeof e === 'string') return e;
  if (typeof e === 'object' && e && 'message' in e && typeof (e as { message: unknown }).message === 'string') {
    return translateSupabaseError((e as { message: string }).message);
  }
  return fallback;
}

function translateSupabaseError(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes('invalid login credentials')) return 'E-mail ou mot de passe incorrect';
  if (m.includes('email not confirmed')) return 'Veuillez confirmer votre adresse e-mail avant de vous connecter';
  if (m.includes('user already registered') || m.includes('already been registered')) return 'Un compte existe déjà avec cet e-mail';
  if (m.includes('password should be at least')) return 'Le mot de passe doit contenir au moins 8 caractères';
  if (m.includes('rate limit')) return 'Trop de tentatives, réessayez dans quelques minutes';
  if (m.includes('network request failed')) return 'Pas de connexion internet';
  if (m.includes('provider is not enabled') || m.includes('unsupported provider')) return "Ce mode de connexion n'est pas activé";
  return msg;
}
