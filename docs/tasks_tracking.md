# Suivi d'Avancement — MonProgrammeFit

> Ce fichier a été corrigé le 2026-07-25 : plusieurs entrées listaient comme "futures" ou
> "en cours" des tâches en réalité déjà terminées et vérifiées (authentification Firebase,
> modularisation du code, contrôle des accès par rôle). Voir aussi `decisions_log.md`.

## Fonctionnalités Implémentées
- [x] Quiz de personnalisation (3 étapes : lieu, niveau, fréquence). — 2026-07-14
- [x] Affichage du résultat du quiz (programme recommandé). — 2026-07-14
- [x] Tableau de bord client (progression, historique). — 2026-07-14
- [x] Espace admin (statistiques, messages). — 2026-07-14
- [x] Navigation responsive (mobile/desktop). — 2026-07-14
- [x] Palette et typographie d'origine restaurées après un intermède de palette premium sombre. — 2026-07-18
- [x] Modularisation du code (`app.js` découpé en modules ES6 : `state.js`, `router.js`, `events.js`, `render.js`, `pages/*.js`). — 2026-07-18
- [x] Migration vers Vite (bundler). — 2026-07-19
- [x] Authentification Firebase (inscription/connexion par e-mail et mot de passe). — 2026-07-19
- [x] Attribution du rôle (client/admin) via Firestore, vérifiée dans `js/router.js` et `js/events.js` — plus de rôle choisi manuellement dans l'interface. — 2026-07-19
- [x] Règles de sécurité Firestore (accès restreint par propriétaire et par rôle). — 2026-07-19
- [x] Tarifs réels en FCFA sur la page Programmes, avec circuit de souscription via WhatsApp (remplace l'ancien affichage en euros). — 2026-07-22
- [x] Chronomètre de séance manuel avec commandes Démarrer / Pause / Réinitialiser. — 2026-07-24
- [x] Diction vocale continue (SpeechSynthesis) avec écran verrouillé / éteint via Web Worker, Web Audio API, Screen Wake Lock et MediaSession API. — 2026-07-24
- [x] Purge intégrale destructive de toutes les données Firestore associées à un utilisateur (document principal, sous-collections et messages). — 2026-07-24
- [x] Bundling des assets statiques (photo du coach et icône WhatsApp) via imports ES Module et configuration des réécritures Vercel (`vercel.json`). — 2026-07-24
- [x] Ajout des états de chargement (spinners, désactivation au clic) pour les formulaires de mise à jour (hydratation, profil, entraînement). — 2026-07-24
- [x] Synchronisation en temps réel de l'état local du profil (poids, hydratation) pour conserver la cohérence entre les pages. — 2026-07-24

## Bugs Corrigés
- [x] Problème de rafraîchissement du cache navigateur. — 2026-07-14 — Sévérité : P1
- [x] Boutons du quiz (étape optionnelle et étape résumé) sans gestionnaire de clic, empêchant de terminer le quiz. — 2026-07-18 — Sévérité : P1
- [x] Bloc de gestion de clic dupliqué rendant la déconnexion (`data-logout`) inopérante. — 2026-07-18 — Sévérité : P2
- [x] Absence d'échappement HTML sur les champs saisis par l'utilisateur (contact, inscription, quiz). — 2026-07-18 — Sévérité : P1 (sécurité)

## Dette Technique
- [ ] Remplacer les alias CSS de compatibilité (`--accent-primary`, `--bg-dark`, etc., définis dans `css/tokens.css`) par les variables d'origine directement dans les fichiers qui les utilisent encore, pour supprimer la couche d'alias. — Impact : Faible — Effort : 1h
- [ ] Ajouter des tests unitaires (Jest ou équivalent). — Impact : Élevé — Effort : 4h
- [ ] Optimiser les images (compression, WebP). — Impact : Faible — Effort : 1h
- [ ] Supprimer les fichiers résiduels du dépôt (dossier `MonProgrammeFit/` dupliqué, `bun.lock` vide, fichier `-quality` vide, doublons d'images et de fichiers programme). — Impact : Faible — Effort : 15 min

## Tâches Futures
- [ ] Intégration FedaPay pour un paiement en ligne direct (le circuit actuel passe par WhatsApp, fonctionnel mais manuel). — Priorité : Moyenne
- [ ] Notifications par e-mail (SendGrid ou équivalent) — non implémenté à ce jour, aucune dépendance installée. — Priorité : Basse
- [ ] Implémentation du système de feedback utilisateur (ADR-002). — Priorité : Moyenne

## Mise à jour UX récente
- [x] Les boutons visibles du site déclenchent désormais des actions réelles (retour, contact, progression, administration). — 2026-07-14
- [x] Séances lues par id dans le programme assigné (plus de mélange entre jours / plans). — 2026-08-14
- [x] Changement de programme réel (client + admin) : confirmation, reset semaine 1, suppression des anciennes séances. — 2026-08-14
- [x] Demande d’ajustement client → messagerie admin, avec lien vers la fiche pour réassigner. — 2026-08-14
- [x] Résultat du quiz : titre du programme coach, pas seulement le lieu. — 2026-08-14
