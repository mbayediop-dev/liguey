import { createClient } from '@supabase/supabase-js';
import type { Database } from '@shared/supabase/database.types';

import { isDemo } from './demo/flag';

let url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
let key = import.meta.env.VITE_SUPABASE_KEY as string | undefined;
if (!url || !key) {
  if (!isDemo) throw new Error('VITE_SUPABASE_URL et VITE_SUPABASE_KEY sont requis : copiez admin/.env.example vers admin/.env');
  url = 'https://demo.invalid';
  key = 'demo';
}

export const SUPABASE_URL = url;
export const SUPABASE_KEY = key;

/** Client Supabase du back-office : clé publiable uniquement, les droits viennent de la RLS (profiles.is_admin). */
export const supabase = createClient<Database>(url, key, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
});

export type PrivateBucket = 'documents' | 'receipts' | 'chat';

/** URL publique d'un avatar (bucket public "avatars"). */
export function avatarUrl(path: string | null | undefined): string | undefined {
  if (!path) return undefined;
  if (/^https?:\/\//.test(path)) return path;
  return supabase.storage.from('avatars').getPublicUrl(path).data.publicUrl;
}

/** URL signée temporaire d'un fichier d'un bucket privé (documents, reçus, images de chat). */
export async function signedUrl(bucket: PrivateBucket, path: string, expiresInSeconds = 600): Promise<string> {
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresInSeconds);
  if (error) throw new Error(error.message);
  return data.signedUrl;
}
