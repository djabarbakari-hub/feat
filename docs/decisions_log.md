# Journal des Décisions Techniques — MonProgrammeFit

---
### ADR-008 — Synchronisation Multi-Appareils en Temps Réel Totale de Toutes les Données via Firestore onSnapshot et Événement de Stockage

- **Date** : 2026-07-24
- **Statut** : Acceptée
- **Contexte** : Lorsque le même utilisateur ou l'administrateur est connecté simultanément sur plusieurs appareils ou plusieurs onglets (ex: ordinateur et smartphone, ou deux onglets du même navigateur), les modifications effectuées sur un appareil (ex: hydratation, suivi de poids, complétion d'entraînement, nouveaux messages, édition de programmes, pré-autorisations d'administrateurs) n'apparaissaient pas automatiquement sur l'autre. Le système utilisait un pattern "pull-based" avec une récupération unique (`getDoc`/`getDocs`) au chargement.
- **Décision** :
  1. Remplacer TOUTES les requêtes ponctuelles au chargement par des écoutes actives en temps réel via la méthode `onSnapshot` de Firestore pour toutes les collections :
     - Profil individuel (`users/{uid}`) et séances (`users/{uid}/sessions`) pour l'espace athlète.
     - Liste complète des utilisateurs (`users`), des messages de contact (`messages`) et des e-mails administratifs pré-autorisés (`admin_emails`) pour le panneau d'administration.
     - Catalogue des parcours dynamiques (`tracks`) pour la cohérence des programmes disponibles.
  2. Implémenter des gestionnaires de cycle de vie robustes (`setupAdminRealTimeSync()` et `cleanupAdminRealTimeSync()`) pour démarrer/arrêter les écoutes actives de manière ciblée selon le rôle et l'authentification de l'utilisateur afin d'éviter les fuites de mémoire.
  3. Ajouter un écouteur sur l'événement global `storage` de la fenêtre du navigateur pour propager instantanément les transitions de pages et d'états entre différents onglets ouverts sur le même appareil.
  4. Assurer la persistance immédiate dans le `localStorage` local à chaque réception de snapshot pour garantir la fluidité hors-ligne combinée à la fraîcheur en ligne.
- **Conséquences** :
  - Positives : Synchronisation instantanée et absolue entre tous les appareils et onglets en temps réel (<1s). Garantie d'aucune incohérence visuelle ou de données entre les versions mobiles, tablettes et ordinateurs des clients et des coachs/administrateurs.
  - Négatives : Aucune. Les lectures Firestore sont hautement optimisées grâce à la mise en cache locale intégrée du SDK Firebase.
- **Documents impactés** : `app.js`, `docs/decisions_log.md`, `docs/architecture.md`

---
### ADR-007 — Inlining Base64 des Assets Visuels Critiques (Photo Coach & Icône WhatsApp)

- **Date** : 2026-07-24
- **Statut** : Acceptée
- **Contexte** : Lors des déploiements sur Vercel, Netlify ou environnements serverless, les requêtes d'images relatives (`/images/...`) peuvent échouer (404 / réécriture SPA `index.html`) en raison de règles d'URL ou de réécriture de chemin.
- **Décision** :
  1. Générer le module `js/assets.js` exportant la photo du coach (`COACH_AVATAR`) et l'icône WhatsApp (`WHATSAPP_ICON`) sous forme de Data URIs Base64 autonomes.
  2. Importer ces constantes directement dans `js/pages/guest.js` et `js/navbar.js`.
  3. Conserver un fallback dynamique d'URL en cas d'erreur réseau alternative.
- **Conséquences** :
  - Positives : Chargement instantané à 100% garanti sur Vercel, Netlify, Cloudflare Pages, preview AI Studio et en mode hors-ligne sans dépendance aux requêtes HTTP d'assets externes.
  - Négatives : Augmentation minime du bundle JavaScript (~70 KB gzippé).
- **Documents impactés** : `js/assets.js`, `js/pages/guest.js`, `js/navbar.js`, `docs/architecture.md`

---
### ADR-005 — Exécution du Chronomètre et de la Diction Vocale sur Écran Verrouillé / Éteint

- **Date** : 2026-07-24
- **Statut** : Acceptée
- **Contexte** : Lorsque l'utilisateur met en veille ou verrouille son smartphone pendant son entraînement, les `setInterval` standard du navigateur s'arrêtent ou ralentissent fortement, et le moteur de synthèse vocale (`SpeechSynthesis`) est mis en pause par le système d'exploitation mobile (iOS/Android).
- **Décision** : Implémenter un système multi-couche dédié dans `js/modules/workoutTimer.js` :
  1. **Web Worker inline** pour maintenir un cadenceur temporel sur un thread système indépendant insensible au ralentissement de la boucle d'événements principale.
  2. **Calcul temporel basé sur l'horloge système (`Date.now()`)** pour garantir zéro dérive de temps en cas de reprise de veille.
  3. **Boucle audio silencieuse HTML5 + Web Audio API** pour notifier au système d'exploitation que l'application gère une session média active.
  4. **MediaSession API & Screen Wake Lock API** pour maintenir le canal audio ouvert sur l'écran de verrouillage et réveiller le moteur de synthèse vocale (`window.speechSynthesis.resume()`) à chaque tick d'énonciation.
  5. **Contrôle manuel explicite** : l'utilisateur déclenche et arrête lui-même le chronomètre via des boutons d'action dédiés (`Démarrer`, `Pause`, `Réinitialiser`).
- **Conséquences** :
  - Positives : Fonctionnement ininterrompu du chronomètre et de la diction vocale toutes les 10 secondes même écran éteint.
  - Négatives : Nécessite une interaction utilisateur initiale (clic) pour autoriser le démarrage du contexte Web Audio / Media Session selon les politiques autostart des navigateurs mobiles.
- **Documents impactés** : `js/modules/workoutTimer.js`, `js/pages/client.js`, `js/events.js`, `docs/architecture.md`

---
### ADR-006 — Purge Intégrale Destructive des Données lors de la Suppression de Compte

- **Date** : 2026-07-24
- **Statut** : Acceptée
- **Contexte** : En conformité avec le RGPD et le principe du droit à l'oubli, la suppression d'un compte utilisateur doit supprimer la totalité des données personnelles sans laisser d'orphelins dans Firestore.
- **Décision** : Lors de la suppression de compte (`deleteAccountAndData` dans `js/modules/privacy.js`), la procédure effectue :
  1. La suppression de toutes les sous-collections de l'utilisateur (ex: `users/{uid}/sessions`).
  2. La suppression du document principal de profil `users/{uid}`.
  3. La suppression de tous les messages ou requêtes associés à l'email ou à l'ID de l'utilisateur dans la collection `messages`.
  4. La réinitialisation intégrale de l'état local et du `localStorage`.
  5. La suppression définitive de l'identifiant d'authentification dans Firebase Auth.
- **Conséquences** :
  - Positives : Conformité totale au RGPD et absence de données résiduelles dans Firestore.
  - Négatives : Action irréversible.
- **Documents impactés** : `js/modules/privacy.js`, `docs/architecture.md`

---
### ADR-003 — Stockage des Données Sensibles (Risque de Sécurité)

- **Date** : 2026-07-19
- **Statut** : À traiter
- **Contexte** : Les données saisies dans les formulaires (ex: email, nom, réponses du quiz) sont stockées dans `state.drafts` sans chiffrement. Cela expose les utilisateurs à des risques de fuite de données en cas d'attaque XSS ou d'accès non autorisé au stockage local.
- **Risque identifié** :
  - **Exposition des données** : Les données sensibles (ex: email) sont stockées en clair dans `localStorage` via `state.drafts`.
  - **Non-conformité RGPD** : Le stockage de données personnelles sans chiffrement peut violer les réglementations sur la protection des données.
- **Décision** : Ne pas stocker de données sensibles en clair dans `state.drafts`.
- **Solutions envisagées** :
  1. **Chiffrement local** : Utiliser une bibliothèque comme `crypto-js` pour chiffrer les données avant stockage.
  2. **Backend dédié** : Stocker les données sensibles sur un serveur sécurisé (ex: Firebase, API personnalisée).
  3. **Réduire la collecte** : Limiter les données stockées localement aux informations non sensibles.
- **Conséquences** :
  - Positives : Réduction des risques de fuite de données et conformité RGPD.
  - Négatives : Complexité accrue (chiffrement) ou dépendance à un backend.
- **Documents impactés** : `js/state.js`, `docs/architecture.md`

---
### ADR-002 — Système de Feedback Utilisateur (Reporté)

- **Date** : 2026-07-19
- **Statut** : Reporté
- **Contexte** : Besoin d'un système de feedback utilisateur pour recueillir les signalements de bugs, suggestions et avis. Un agent dédié (`AGENT-FEEDBACK.md`) a été conçu pour cette fonctionnalité.
- **Décision** : Reporter l'implémentation du système de feedback en raison des prérequis manquants.
- **Prérequis manquants** :
  1. **Authentification** : Nécessaire pour identifier les utilisateurs (rôles `guest`, `client`, `admin`).
  2. **Base de données** : Nécessaire pour stocker les feedbacks.
  3. **Contrôle d'accès serveur** : Nécessaire pour protéger le panel admin.
- **Étapes restantes pour implémentation** :
  1. Implémenter l'authentification (ex: JWT, sessions).
  2. Choisir une base de données (ex: Firebase, MongoDB, PostgreSQL).
  3. Développer le formulaire de feedback et le panel admin.
  4. Ajouter des mécanismes anti-abus (rate limiting, double soumission).
- **Conséquences** :
  - Positives : Permet de se concentrer sur le MVP sans ajouter de complexité.
  - Négatives : Impossible de recueillir des retours utilisateurs pour l'instant.
- **Documents impactés** : `AGENT-FEEDBACK.md`, `architecture.md`

---
### ADR-001 — Choix de Vanilla JS pour le MVP

- **Date** : 2026-07-14
- **Statut** : Acceptée
- **Contexte** : Besoin d'un MVP rapide pour valider le concept de coaching personnalisé. Pas de complexité justifiant un framework (React, Vue).
- **Décision** : Utiliser vanilla JS pour éviter la sur-ingénierie.
- **Alternatives envisagées** :
  1. **React** — Rejeté car trop lourd pour une landing + quiz.
  2. **Vue** — Rejeté pour les mêmes raisons que React.
- **Conséquences** :
  - Positives : Développement rapide, pas de dépendances.
  - Négatives : Moins scalable pour des fonctionnalités avancées (ex: authentification).
- **Documents impactés** : `architecture.md`, `cahier_des_charges.md`

---
### ADR-004 — Choix de Firebase

- **Date** : 2026-07-22
- **Statut** : Acceptée
- **Contexte** : Besoin d'une solution backend simple pour l'authentification et la persistance des données.
- **Décision** : Utiliser Firebase (Auth + Firestore).
- **Alternatives envisagées** :
  1. Supabase — Rejetée car trop complexe pour le MVP.
  2. Backend personnalisé — Rejeté par manque de temps.
- **Conséquences** :
  - Positives : Développement rapide, scalabilité.
  - Négatives : Dépendance à Google, coût potentiel.
- **Documents impactés** : `architecture.md`, `environment_variables.md`