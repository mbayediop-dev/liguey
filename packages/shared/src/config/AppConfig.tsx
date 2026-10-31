import React, { createContext, useContext } from 'react';

export type AppRole = 'client' | 'pro';

export interface AppConfig {
  /** Rôle attendu pour les comptes de cette app. */
  role: AppRole;
  /** Nom affiché (HEROES ou HEROES PRO). */
  appName: string;
  /** Suffixe du wordmark : '' pour l'app client, 'PRO' pour l'app prestataire. */
  brandSuffix: string;
  /** Scheme de deep link (heroes:// ou heroespro://). */
  scheme: string;
}

const AppConfigContext = createContext<AppConfig | null>(null);

export function AppConfigProvider({ config, children }: { config: AppConfig; children: React.ReactNode }) {
  return <AppConfigContext.Provider value={config}>{children}</AppConfigContext.Provider>;
}

export function useAppConfig(): AppConfig {
  const ctx = useContext(AppConfigContext);
  if (!ctx) throw new Error('AppConfigProvider manquant');
  return ctx;
}

export function useIsPro(): boolean {
  return useAppConfig().role === 'pro';
}
