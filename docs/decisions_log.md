# Journal des Décisions Techniques — MonProgrammeFit

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