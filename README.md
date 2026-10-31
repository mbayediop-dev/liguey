# HEROES – monorepo

Plateforme de services à domicile en Suisse : une app client, une app prestataire, un back-office web
et un backend Supabase.

| Dossier | Rôle | Démarrer |
|---|---|---|
| `user/` | app mobile **HEROES** (mandataire / client), Expo | `npm run user` |
| `pro/` | app mobile **HEROES PRO** (prestataire / héros), Expo | `npm run pro` |
| `admin/` | back-office web (react-admin + Supabase) | `npm run admin` |
| `packages/shared/` | thème, composants, hooks, types et écrans communs aux deux apps | – |
| `supabase/` | migrations SQL, seed, tests locaux | voir `supabase/README.md` |
| `models/` | anciens modèles KeystoneJS (2023), conservés pour référence, dont le modèle de tarification `Tarif.js` | – |

## Mise en route

```bash
npm install
# 1. Appliquer supabase/migrations/*.sql puis supabase/seed.sql dans l'éditeur SQL Supabase
# 2. Renseigner user/.env, pro/.env et admin/.env (URL + clé publiable, voir les .env.example)
npm run user      # ou npm run pro : ouvrir dans Expo Go
npm run admin     # http://localhost:5173, compte avec profiles.is_admin = true
npm run admin:demo # back-office avec données fictives, sans Supabase
npm run typecheck # les quatre workspaces
```

Le `.env` à la racine contient des clés secrètes et n'est jamais lu par les apps.

## Vérifier le schéma sans projet Supabase

```bash
PGBIN=/opt/homebrew/opt/postgresql@17/bin ./supabase/tests/run_local.sh
```

Le script monte un PostgreSQL temporaire, applique les migrations et le seed, puis rejoue deux
scénarios de bout en bout sous RLS : le cycle complet d'une mission (`10_scenario.sql`) et les
actions du back-office (`20_admin.sql`).
