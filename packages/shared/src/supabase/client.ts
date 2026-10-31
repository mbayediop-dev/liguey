import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { AppState } from 'react-native';
import type { Database } from './database.types';

export type Supabase = SupabaseClient<Database>;

let client: Supabase | null = null;

/** À appeler une seule fois, au démarrage de l'app, avec l'URL et la clé publishable. */
export function initSupabase(url: string | undefined, key: string | undefined): Supabase {
  if (client) return client;
  if (!url || !key) {
    throw new Error('EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_KEY manquants (voir .env.example)');
  }
  client = createClient<Database>(url, key, {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
  AppState.addEventListener('change', (state) => {
    if (!client) return;
    if (state === 'active') client.auth.startAutoRefresh();
    else client.auth.stopAutoRefresh();
  });
  return client;
}

export function sb(): Supabase {
  if (!client) throw new Error('Supabase non initialisé : appelez initSupabase() dans le layout racine');
  return client;
}
