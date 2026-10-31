# Backend Supabase – HEROES

Projet : `https://ocyuuakgkrmzjivsuvch.supabase.co`

## Appliquer le schéma

Le projet distant est vide. Deux options :

**Option A – éditeur SQL (le plus simple)**
1. Dashboard Supabase → SQL Editor → New query.
2. Coller le contenu de `migrations/20261030000000_init.sql`, exécuter.
3. Coller le contenu de `migrations/20261031000000_admin.sql` (back-office), exécuter.
4. Coller le contenu de `seed.sql`, exécuter.
5. Premier administrateur du back-office : créer un compte (app mobile ou *Authentication → Users → Add user*), puis
   ```sql
   update public.profiles set is_admin = true
   where id = (select id from auth.users where email = 'admin@exemple.ch');
   ```

**Option B – CLI**
```bash
npx supabase login
npx supabase link --project-ref ocyuuakgkrmzjivsuvch
npx supabase db push          # applique les migrations
psql "$DATABASE_URL" -f supabase/seed.sql   # ou coller seed.sql dans l'éditeur SQL
```

## Réglages Auth à faire dans le dashboard

- **Authentication → Providers → Email** : pour tester l'inscription sans e-mail de confirmation, désactiver
  « Confirm email ». Si la confirmation reste active, l'app affiche un écran « Vérifiez votre e-mail »
  et l'onboarding reprend à la première connexion.
- **Authentication → URL Configuration** : ajouter `heroes://**` et `heroespro://**` aux Redirect URLs
  (nécessaire pour la connexion Facebook).
- **Authentication → Providers → Facebook** : à activer avec un App ID / Secret Meta si la connexion Facebook est souhaitée.

## Ce que contient le schéma

| Table | Rôle |
|---|---|
| `profiles` | un profil par utilisateur, `role` = `client` ou `pro`, note moyenne, paramètres ; `is_admin`, `is_blocked`, `verification_status` (gérés par le back-office) |
| `services`, `sub_services` | catalogue (10 services, tarif client et gain pro à l'heure, outils nécessaires) |
| `pro_services` | prestations proposées par un pro |
| `pro_documents` | CV, registre du commerce, pièce d'identité (bucket privé `documents`) |
| `payment_methods` | cartes : marque, 4 derniers chiffres, expiration uniquement |
| `missions` | demandes, machine à états (`searching` → `pending_validation` → `confirmed` → `start_requested` → `in_progress` → `completed`) |
| `mission_expenses` | frais supplémentaires (matériel / temps / autre) avec code TVA et justificatif |
| `mission_reschedules` | propositions de changement d'horaire |
| `payments` | prépaiements (simulés tant qu'aucun PSP n'est branché) |
| `messages` | chat par mission (texte + photo, accusé de lecture) |
| `reviews` | avis bidirectionnels, recalcul automatique de la note |
| `notifications` | alimentées par triggers à chaque étape |
| `support_requests` | demandes d'aide, statut et note interne traités dans le back-office |
| `conversations` (vue) | liste des conversations avec dernier message et non-lus |

Toutes les transitions de statut passent par des fonctions RPC `security definer`
(`accept_mission`, `validate_mission`, `request_start`, `confirm_start`, `complete_mission`,
`cancel_mission`, `propose_reschedule`, `respond_reschedule`, …) qui vérifient l'appelant.

### Back-office (`20261031000000_admin.sql`)

- `public.is_admin()` lit `profiles.is_admin` ; des politiques RLS `*_admin` donnent aux administrateurs l'accès à toutes
  les tables et la lecture des buckets privés (`documents`, `receipts`, `chat`).
- Le trigger `profiles_protect_admin_columns` empêche un utilisateur de modifier lui-même `is_admin`, `is_blocked`,
  `verification_status`, les notes et sa note moyenne.
- RPC réservées aux administrateurs : `admin_set_verification`, `admin_set_blocked`, `admin_set_admin`,
  `admin_cancel_mission`, `admin_notify`, `admin_dashboard_stats`. Chacune notifie l'utilisateur concerné.
- Un compte bloqué ne peut plus créer de demande ni accepter de mission et n'est plus compté parmi les héros disponibles ;
  l'app lui affiche un écran « Compte suspendu ».

## Points ouverts

- **Paiement** : aucun PSP n'est intégré. `validate_mission` enregistre un paiement `mock`. Pour la production,
  brancher Stripe (`@stripe/stripe-react-native` + Edge Function) et stocker le `provider_token`.
- **TVA** : taux suisses actuels (8.1 % / 2.6 %) dans `vat_rates`. Les maquettes montrent les anciens taux 7.7 % / 2.5 %.
- **Push** : la table `notifications` est prête ; l'envoi de push (Expo Notifications + Edge Function) reste à faire.

## Tester le schéma en local

`supabase/tests/run_local.sh` monte un PostgreSQL temporaire, crée des stubs `auth`/`storage`, applique les migrations
et le seed, puis déroule avec la RLS active `tests/10_scenario.sql` (inscription client + pro, demande, acceptation,
prépaiement, changement d'horaire, démarrage, frais, clôture, avis, chat, compteurs, accès refusés aux tiers) et
`tests/20_admin.sql` (droits d'administration, vérification et blocage, annulation par HEROES, support, statistiques,
garde-fous).

```bash
PGBIN=/opt/homebrew/opt/postgresql@17/bin ./supabase/tests/run_local.sh
```
