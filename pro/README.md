# HEROES – apps mobiles Expo

Deux applications React Native (Expo SDK 58, Expo Router) partageant un même backend Supabase :

| Dossier | App | Rôle |
|---|---|---|
| `user/` | **HEROES** | mandataire / client : demande un service, valide le héros, prépaie, suit la mission, note |
| `pro/` | **HEROES PRO** | prestataire : reçoit les demandes en direct, accepte, démarre la mission, ajoute des frais, clôture |
| `packages/shared/` | `@heroes/shared` | thème, composants, hooks Supabase/React Query, écrans communs (auth, chat, agenda, profil, réglages…) |
| `supabase/` | backend | migration SQL (schéma, RLS, RPC, storage), seed, README |
| `pro/design/`, `user/design/` | maquettes | JPG/PDF d'origine (identiques dans les deux dossiers) |

## Démarrage

```bash
npm install                      # à la racine (workspaces npm)
# 1. appliquer supabase/migrations/*.sql puis supabase/seed.sql (voir supabase/README.md)
# 2. vérifier user/.env et pro/.env (URL + clé publishable Supabase)
npm run user                     # ou : cd user && npx expo start
npm run pro                      # ou : cd pro  && npx expo start
npm run typecheck                # tsc sur les 3 workspaces
```

Les deux apps tournent dans **Expo Go** (aucun module natif hors SDK). Face ID et les notifications push
nécessiteront un development build (`npx expo run:ios|android`).

Pour tester le parcours complet : créer un compte **client** dans HEROES et un compte **pro** dans HEROES PRO
(deux e-mails différents, un compte = un rôle), choisir la même prestation côté pro, puis lancer une demande côté client.
Si « Confirm email » est actif dans Supabase, l'app affiche un écran « Vérifiez votre e-mail » et l'onboarding
reprend à la première connexion.

## Parcours implémentés

**Client** : intro → bienvenue (Facebook / créer un compte / se connecter) → inscription en 3 étapes
(compte, infos, carte, photo, CGU, « Mission validée ! ») → dashboard (« J'ai besoin d'un service ! » + demandes à venir)
→ liste des services (bannières) → sous-services → confirmation à chips (sous-service, adresse, jour, fréquence, créneau)
→ outils nécessaires → recherche animée (compteur de héros disponibles, « aucun résultat » : poster / relancer / annuler)
→ « X a accepté la mission » → fiche du héros + tarif horaire → prépaiement (choix de carte, total, avertissement 24 h)
→ « Votre mission a été agendée ! » → carte mission (annuler, changement d'heure, chat, re-commander)
→ confirmation du démarrage → « Hop, c'est parti ! » → résumé de la mission → « Notez votre hero ».

**Pro** : inscription (compte, infos, prestations, expérience/CV, registre du commerce SA/SARL/indépendant,
pièce d'identité recto/verso ou passeport ou permis, photo, CGU) → dashboard (résultat du mois, 4 KPI,
mission en cours, demandes LIVE en temps réel, page « Offres acceptées ») → offre (accepter / proposer un autre horaire / refuser)
→ mission (prêt → démarrer → en cours : adresse + Google Maps, frais matériel/temps/autre avec TVA et justificatif,
décompte TTC) → « Mission terminée » → « Notez votre client ».

**Commun** : agenda groupé par mois, chat par mission (texte + photo, « Vu »), notifications in-app, profil
(édition, avis, documents pour un pro), paramètres (Touch ID, notifications, newsletter, noter/partager, cartes),
informations légales, contact, aide (FAQ + requête), heroes.swiss.

## Architecture

- **Navigation** : `src/app/` de chaque app, trois groupes protégés par `Stack.Protected` dans
  `packages/shared/src/shell/RootLayout.tsx` : `(auth)` sans session, `(onboarding)` tant que
  `profiles.onboarding_completed` est faux, `(app)` ensuite. Les écrans partagés sont ré-exportés depuis les routes.
- **Données** : React Query + une souscription Realtime unique (`RealtimeSync`) qui invalide le cache à chaque
  changement de `missions`, `messages`, `notifications`, `mission_expenses`, `mission_reschedules`.
- **Machine à états des missions** : uniquement via les RPC SQL (`accept_mission`, `validate_mission`, `request_start`,
  `confirm_start`, `complete_mission`, `cancel_mission`, `propose_reschedule`, `respond_reschedule`).
- **Fichiers** : buckets `avatars` (public), `documents`, `receipts`, `chat` (privés, URLs signées).
- **Design** : couleurs échantillonnées sur les maquettes (`#FE0F2E`, `#383495`, fond `#F5F5F5`), police Poppins,
  visuels découpés depuis les JPG (bannières de services, visuel du dashboard, illustrations) dans
  `packages/shared/assets/images`. Les sources vectorielles du designer donneraient un rendu plus net.

## Reste à faire avant production

- **Paiement** : aucun PSP n'est branché. La saisie de carte ne conserve que marque / 4 derniers chiffres / expiration,
  et `validate_mission` enregistre un paiement simulé. Intégrer Stripe (`@stripe/stripe-react-native` + Edge Function).
- **Facebook** : activer le provider dans Supabase et ajouter `heroes://**` / `heroespro://**` aux Redirect URLs.
- **Push** : la table `notifications` est alimentée ; l'envoi via Expo Notifications reste à faire.
- **TVA** : taux suisses actuels (8.1 % / 2.6 %) ; les maquettes montraient 7.7 % / 2.5 %.
- **CGU / textes légaux** : textes des maquettes (exemples) à remplacer par les textes définitifs (`legal_pages`).
- **Lint** : `npx expo lint` dans chaque app pour générer la config ESLint.
