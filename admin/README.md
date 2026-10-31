# HEROES Admin – back-office

Application web d'administration de HEROES (clients) et HEROES PRO (héros), construite avec
[Vite](https://vite.dev), [react-admin](https://marmelab.com/react-admin/) et
[ra-supabase](https://github.com/marmelab/ra-supabase). Elle parle directement à Supabase avec la
clé publiable : tous les droits viennent de la RLS et de la colonne `profiles.is_admin`.

## Démarrer

1. Appliquer les migrations `supabase/migrations/20261030000000_init.sql` puis
   `supabase/migrations/20261031000000_admin.sql` (voir `supabase/README.md`).
2. Créer le premier administrateur : inscrire un compte (app mobile ou *Authentication → Users → Add user*
   dans le dashboard Supabase), puis dans l'éditeur SQL :
   ```sql
   update public.profiles set is_admin = true
   where id = (select id from auth.users where email = 'admin@exemple.ch');
   ```
3. Copier `admin/.env.example` vers `admin/.env` et renseigner l'URL du projet et la clé publiable
   (`sb_publishable_…`). Jamais la clé secrète ni la service role.
4. À la racine du monorepo :
   ```bash
   npm install
   npm run admin          # http://localhost:5173
   npm run admin:build    # build de production dans admin/dist
   ```

Un utilisateur connecté qui n'est pas administrateur est déconnecté avec le message
« Accès réservé aux administrateurs HEROES » (vérification serveur via la RPC `is_admin()`).

## Mode démo (sans Supabase)

```bash
npm run admin:demo     # à la racine, ou  VITE_DEMO=1 npm run dev  dans admin/
```

Charge des données fictives en mémoire (profils, missions, paiements, avis, support…) et accepte n'importe quel
identifiant de connexion. Pratique pour présenter l'interface ou travailler sur le design. Les filtres avancés
des listes (recherche, dates) sont approximés et les fichiers des buckets privés ne sont pas disponibles.
On peut aussi ajouter `?demo=1` à l'URL d'un build.

## Interface

Habillage inspiré d'un tableau de bord « bento » : fond gris chaud, cartes blanches très arrondies à bordure
fine, boutons pilules, boutons ronds, barre du haut avec logo, titre de page, bouton « + » (créations rapides),
identité de l'administrateur et recherche globale, rail d'icônes à gauche (dépliable avec le bouton menu).
Le tableau de bord combine chiffre d'affaires et marge, missions terminées et nouveaux inscrits, héros à vérifier,
note moyenne, activité du jour, CA mensuel, prestations demandées, flux d'activité (missions, support,
vérifications), tendance des demandes et satisfaction des avis. Les styles globaux sont dans `src/theme.ts`,
la barre et le menu dans `src/layout/AdminLayout.tsx`, les graphiques SVG dans `src/components/charts.tsx`.

## Ce que l'on peut faire

| Écran | Contenu | Actions |
|---|---|---|
| Tableau de bord | clients, héros, héros à vérifier, missions actives et du jour, CA et marge du mois, support ouvert, demandes par jour (30 j), CA mensuel (6 mois), missions par statut, top prestations | liens vers les listes filtrées |
| Utilisateurs | recherche (nom, e-mail, ville, téléphone), filtres rôle / vérification / bloqué / inscription / admin ; fiche avec profil, documents (URL signées), prestations proposées, missions, avis reçus, notifications | valider ou refuser un héros, bloquer / débloquer, nommer ou retirer administrateur, envoyer une notification, modifier le profil |
| Documents | file des justificatifs déposés par les héros avec aperçu | – |
| Missions | filtres statut / prestation / client / héros / dates / ville ; fiche avec parties, détails, décompte client et héros (TVA incluse), frais et tickets, paiements, reports, chronologie, messagerie en lecture seule, avis | annuler une mission (les deux parties sont notifiées) |
| Paiements, Avis, Notifications | listes filtrables | suppression d'avis (modération) |
| Support | demandes des utilisateurs, statut, note interne | répondre par notification |
| Prestations | nom, slug, prix client, gain héros, outils requis, note matériel, active ; sous-prestations éditables en ligne | créer, modifier, désactiver |
| Taux de TVA, Pages légales | édition du catalogue et des textes (Markdown) | créer, modifier |

## Sécurité

- Les colonnes sensibles de `profiles` (`is_admin`, `is_blocked`, `verification_status`, notes,
  `rating_*`) ne sont modifiables que par un administrateur (trigger `profiles_protect_admin_columns`),
  et uniquement via les RPC `admin_*` depuis le back-office.
- Un administrateur ne peut ni retirer ses propres droits ni se bloquer lui-même.
- Les fichiers des buckets privés (`documents`, `receipts`, `chat`) sont lus via des URL signées de
  10 minutes, autorisées par la politique `admin_read_private_buckets`.
- Les moyens de paiement ne sont visibles qu'en lecture (marque, 4 derniers chiffres, expiration).

## Structure

```
admin/
  src/App.tsx                 ressources react-admin et routes
  src/providers/              authProvider (contrôle is_admin) et dataProvider (PostgREST)
  src/lib/admin.ts            appels aux RPC admin_* et statistiques
  src/lib/format.ts           libellés, choix et palette de statuts (réutilise packages/shared)
  src/layout/AdminLayout.tsx  menu groupé avec compteurs, barre d'en-tête
  src/pages/Home.tsx          tableau de bord (widgets)
  src/demo/                   données fictives et fournisseurs du mode démo
  src/resources/              profiles, missions, services, catalog (TVA, pages légales), activity
  src/components/             pastilles de statut, montants, avatars, fichiers signés, dialogues, histogramme
```

Les types de la base viennent de `packages/shared/src/supabase/database.types.ts` (alias `@shared`),
comme pour les apps mobiles.
