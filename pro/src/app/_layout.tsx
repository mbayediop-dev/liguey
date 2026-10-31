import React from 'react';
import { initSupabase, RootLayout, type AppConfig } from '@heroes/shared';

initSupabase(process.env.EXPO_PUBLIC_SUPABASE_URL, process.env.EXPO_PUBLIC_SUPABASE_KEY);

const config: AppConfig = { role: 'pro', appName: 'HEROES PRO', brandSuffix: 'PRO', scheme: 'heroespro' };

export default function Layout() {
  return <RootLayout config={config} />;
}
