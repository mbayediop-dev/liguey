import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Alert } from 'react-native';
import type { Session, User } from '@supabase/supabase-js';
import { useQueryClient } from '@tanstack/react-query';
import { sb } from '../supabase/client';
import type { Profile } from '../types/models';
import { useAppConfig } from '../config/AppConfig';

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  /** true tant que la session initiale et le profil ne sont pas connus */
  loading: boolean;
  refreshProfile: () => Promise<Profile | null>;
  setProfile: (p: Profile | null) => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function fetchProfile(userId: string, attempts = 6): Promise<Profile | null> {
  for (let i = 0; i < attempts; i++) {
    const { data, error } = await sb().from('profiles').select('*').eq('id', userId).maybeSingle();
    if (data) return data;
    if (error) console.warn('[auth] profil', error.message);
    await new Promise((r) => setTimeout(r, 350 * (i + 1)));
  }
  return null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const config = useAppConfig();
  const qc = useQueryClient();
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfileState] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const userIdRef = useRef<string | null>(null);

  const loadFor = useCallback(
    async (s: Session | null) => {
      if (!s) {
        userIdRef.current = null;
        setProfileState(null);
        return;
      }
      let p = await fetchProfile(s.user.id);
      if (p && p.role !== config.role && !p.onboarding_completed) {
        // Compte créé via OAuth (rôle par défaut) et jamais finalisé : on l'aligne sur cette app.
        const { data } = await sb().from('profiles').update({ role: config.role }).eq('id', s.user.id).select('*').maybeSingle();
        if (data) p = data;
      }
      if (p && p.role !== config.role) {
        const other = config.role === 'pro' ? 'HEROES' : 'HEROES PRO';
        const kind = p.role === 'pro' ? 'prestataire' : 'client';
        Alert.alert('Mauvaise application', `Ce compte est un compte ${kind}. Connectez-vous avec l'application ${other}.`);
        await sb().auth.signOut();
        return;
      }
      userIdRef.current = s.user.id;
      setProfileState(p);
    },
    [config.role],
  );

  useEffect(() => {
    const { data } = sb().auth.onAuthStateChange((event, s) => {
      setSession(s);
      // Aucun appel Supabase directement dans le callback (verrou interne) : on diffère.
      setTimeout(async () => {
        try {
          if (event === 'TOKEN_REFRESHED') return;
          if (event === 'SIGNED_OUT' || !s) {
            userIdRef.current = null;
            setProfileState(null);
            qc.clear();
            return;
          }
          if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || event === 'USER_UPDATED' || s.user.id !== userIdRef.current) {
            await loadFor(s);
          }
        } finally {
          if (event === 'INITIAL_SESSION') setLoading(false);
        }
      }, 0);
    });
    // Filet de sécurité : ne jamais rester bloqué sur l'écran INTRO.
    const fallback = setTimeout(() => setLoading(false), 8000);
    return () => {
      clearTimeout(fallback);
      data.subscription.unsubscribe();
    };
  }, [loadFor, qc]);

  const refreshProfile = useCallback(async () => {
    const id = userIdRef.current ?? session?.user.id;
    if (!id) return null;
    const p = await fetchProfile(id, 2);
    if (p) setProfileState(p);
    return p;
  }, [session?.user.id]);

  const signOut = useCallback(async () => {
    await sb().auth.signOut();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      profile,
      loading,
      refreshProfile,
      setProfile: setProfileState,
      signOut,
    }),
    [session, profile, loading, refreshProfile, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('AuthProvider manquant');
  return ctx;
}

/** Identifiant de l'utilisateur connecté (lance si absent : à n'utiliser que dans les écrans protégés). */
export function useUserId(): string {
  const { session } = useAuth();
  if (!session) throw new Error('Session absente');
  return session.user.id;
}
