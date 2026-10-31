import type { AuthProvider } from 'react-admin';
import { supabaseAuthProvider } from 'ra-supabase';
import type { SupabaseClient } from '@supabase/supabase-js';
import { avatarUrl, supabase } from '../supabase';

const NOT_ADMIN = 'Accès réservé aux administrateurs HEROES';

const base = supabaseAuthProvider(supabase as unknown as SupabaseClient, {
  redirectTo: window.location.origin,
  getIdentity: async (user) => {
    const { data } = await supabase
      .from('profiles')
      .select('first_name, last_name, avatar_url, email')
      .eq('id', user.id)
      .maybeSingle();
    const fullName = [data?.first_name, data?.last_name].filter(Boolean).join(' ').trim();
    return { id: user.id, fullName: fullName || data?.email || user.email || 'Administrateur', avatar: avatarUrl(data?.avatar_url) };
  },
});

let adminCheck: { userId: string; ok: boolean } | null = null;

/** Vérifie côté serveur (RPC is_admin) que la session appartient à un administrateur ; sinon déconnecte. */
async function assertAdmin(): Promise<void> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error('Session expirée');
  if (adminCheck?.userId !== session.user.id) {
    const { data, error } = await supabase.rpc('is_admin');
    if (error) throw new Error(error.message);
    adminCheck = { userId: session.user.id, ok: data === true };
  }
  if (!adminCheck.ok) {
    adminCheck = null;
    await supabase.auth.signOut();
    throw new Error(NOT_ADMIN);
  }
}

export const authProvider: AuthProvider = {
  ...base,
  login: async (params) => {
    const result = await base.login(params);
    await assertAdmin();
    return result;
  },
  checkAuth: async (params) => {
    await base.checkAuth(params);
    await assertAdmin();
  },
  logout: async (params) => {
    adminCheck = null;
    return base.logout(params);
  },
  getPermissions: async () => 'admin',
};
