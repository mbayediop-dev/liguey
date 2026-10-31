import { withLifecycleCallbacks, type DataProvider } from 'react-admin';
import { supabaseDataProvider } from 'ra-supabase';
import type { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_KEY, SUPABASE_URL, supabase } from '../supabase';
import { slugify } from '../lib/format';

const base = supabaseDataProvider({
  instanceUrl: SUPABASE_URL,
  apiKey: SUPABASE_KEY,
  supabaseClient: supabase as unknown as SupabaseClient,
  // Tables dont la clé primaire n'est pas "id"
  primaryKeys: new Map([
    ['vat_rates', ['code']],
    ['legal_pages', ['slug']],
    ['mission_declines', ['mission_id', 'pro_id']],
    ['pro_services', ['pro_id', 'service_id']],
  ]),
});

/** Fournisseur de données : PostgREST via la RLS, avec quelques normalisations avant enregistrement. */
export const dataProvider: DataProvider = withLifecycleCallbacks(base, [
  {
    resource: 'services',
    beforeSave: async (data) => ({
      ...data,
      slug: slugify(data.slug || data.name || ''),
      required_tools: Array.isArray(data.required_tools)
        ? data.required_tools.map((t: unknown) => String(t).trim()).filter(Boolean)
        : [],
      tools_note: data.tools_note || null,
    }),
  },
  {
    resource: 'legal_pages',
    beforeSave: async (data) => ({ ...data, slug: slugify(data.slug || data.title || ''), updated_at: new Date().toISOString() }),
  },
  {
    resource: 'profiles',
    beforeUpdate: async (params) => {
      // Les colonnes protégées passent par des RPC dédiées ; on ne les renvoie jamais depuis le formulaire.
      const {
        is_admin: _a,
        is_blocked: _b,
        blocked_reason: _c,
        verification_status: _d,
        verification_note: _e,
        verified_at: _f,
        rating_avg: _g,
        rating_count: _h,
        search: _i,
        ...data
      } = params.data;
      void [_a, _b, _c, _d, _e, _f, _g, _h, _i];
      return { ...params, data: { ...data, email: data.email || null, phone: data.phone || null } };
    },
  },
]);
