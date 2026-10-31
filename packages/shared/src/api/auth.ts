import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import { sb } from '../supabase/client';
import type { UserRole } from '../supabase/database.types';

WebBrowser.maybeCompleteAuthSession();

export async function signUpWithEmail(role: UserRole, email: string, password: string) {
  const { data, error } = await sb().auth.signUp({
    email: email.trim().toLowerCase(),
    password,
    options: { data: { role } },
  });
  if (error) throw error;
  return data;
}

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await sb().auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
  if (error) throw error;
  return data;
}

export async function resendConfirmation(email: string) {
  const { error } = await sb().auth.resend({ type: 'signup', email: email.trim().toLowerCase() });
  if (error) throw error;
}

export async function sendPasswordReset(email: string, scheme: string) {
  const { error } = await sb().auth.resetPasswordForEmail(email.trim().toLowerCase(), { redirectTo: `${scheme}://reset-password` });
  if (error) throw error;
}

/** Extrait les paramètres de la query (?a=b) et du fragment (#access_token=…) d'une URL de redirection. */
export function parseAuthParams(url: string): Record<string, string> {
  const out: Record<string, string> = {};
  const qIndex = url.indexOf('?');
  const hIndex = url.indexOf('#');
  const query = qIndex >= 0 ? url.slice(qIndex + 1, hIndex > qIndex ? hIndex : undefined) : '';
  const hash = hIndex >= 0 ? url.slice(hIndex + 1) : '';
  for (const part of `${query}&${hash}`.split('&')) {
    if (!part) continue;
    const eq = part.indexOf('=');
    const k = eq >= 0 ? part.slice(0, eq) : part;
    const v = eq >= 0 ? part.slice(eq + 1) : '';
    try {
      out[decodeURIComponent(k)] = decodeURIComponent(v.replace(/\+/g, ' '));
    } catch {
      out[k] = v;
    }
  }
  return out;
}

async function createSessionFromUrl(url: string) {
  const params = parseAuthParams(url);
  if (params.error_description || params.error) throw new Error(params.error_description ?? params.error);
  const { access_token, refresh_token } = params;
  if (!access_token || !refresh_token) return null;
  const { data, error } = await sb().auth.setSession({ access_token, refresh_token });
  if (error) throw error;
  return data.session;
}

/** Connexion Facebook via le navigateur système (nécessite le provider activé dans Supabase). */
export async function signInWithFacebook(scheme: string) {
  const redirectTo = makeRedirectUri({ scheme, path: 'auth/callback' });
  const { data, error } = await sb().auth.signInWithOAuth({
    provider: 'facebook',
    options: { redirectTo, skipBrowserRedirect: true },
  });
  if (error) throw error;
  const res = await WebBrowser.openAuthSessionAsync(data?.url ?? '', redirectTo);
  if (res.type === 'success') return createSessionFromUrl(res.url);
  return null;
}
