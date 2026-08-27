# Contexte IA — MonProgrammeFit

## Prompts Système
- **Prompt principal** : "Crée une interface utilisateur pour un quiz de fitness en 3 étapes."

## Choix Techniques
### Vanilla JS
- **Pourquoi** : Éviter la sur-ingénierie pour un MVP (landing + quiz). Pas de framework (React/Vue) pour réduire la complexité.
- **Impact** : Code plus simple à maintenir, mais nécessite une modularisation manuelle (ex: `js/pages/`).

### Palette de Couleurs
- **Pourquoi** : Palette sobre et élégante (`--ink`, `--ember`, `--moss`) pour éviter les clichés "fitness" (bleu néon, noir agressif).
- **Référence** : `css/tokens.css` (variables `--ink`, `--ember`, `--moss`, `--chalk`).

### Typographie
- **Polices** : `Inter` (titres, corps, utilitaire) — Google Fonts, poids 300–900.
- **Rationale** : Équilibre entre élégance et lisibilité pour une app fitness premium.

### Animations
- **Pourquoi** : Micro-interactions fluides (`fadeIn`, `--transition`) pour améliorer l'UX sans surcharger le rendu.
- **Contrainte** : Respect de `prefers-reduced-motion` pour l'accessibilité.

### Animations
- **Pourquoi** : Micro-interactions fluides (hover, transitions) pour améliorer l'UX sans surcharger le rendu.
- **Contrainte** : Respect de `prefers-reduced-motion` pour l'accessibilité.

## Fonctionnalités Abandonnées
### Système de Feedback Utilisateur
- **Statut** : Reporté (ADR-002 dans `docs/decisions_log.md`).
- **Raison** : MVP sans backend. À implémenter après l'intégration de Firebase.

### Authentification Firebase
- **Statut** : Reporté (ADR-003 dans `docs/decisions_log.md`).
- **Raison** : MVP sans backend. À implémenter pour sécuriser les données sensibles.

## Contexte pour les Développeurs
### Structure du Projet
- **Point d'entrée** : `index.html` (charge `app.js` et `styles.css`).
- **État global** : Géré dans `js/state.js` (objet `state`).
- **Navigation** : `js/router.js` (gestion des routes et rôles).

### Sécurité
- **Risque identifié** : Stockage des données sensibles en clair dans `state.drafts` (voir ADR-003).
- **Solution temporaire** : Aucune. À corriger après l'intégration de Firebase.

### Bonnes Pratiques
- **Échappement HTML** : Utiliser `escapeHtml()` de `js/helpers.js` pour toute valeur utilisateur injectée dans le DOM.
- **Modularisation** : Chaque page a son fichier dans `js/pages/` (ex: `quiz.js`, `admin.js`), et les fonctionnalités autonomes sont isolées dans `js/modules/` (`workoutTimer.js`, `privacy.js`, `consent-modal.js`, `program.js`).
- **Programmes coach** : `js/modules/program.js` applique un programme à un compte (écrase les séances Firestore), et lit les exercices par `session.id` dans le programme assigné — jamais par le mot « lundi » dans tout le catalogue.
- **Chronomètre & Diction Écran Éteint** : `js/modules/workoutTimer.js` combine Web Worker, Web Audio API, Screen Wake Lock et MediaSession API pour assurer l'énonciation vocale continue même smartphone verrouillé.
- **Assets Visuels Critiques (Base64)** : La photo du coach et l'icône WhatsApp sont exportées sous forme de Data URIs Base64 autonomes dans `js/assets.js` (`COACH_AVATAR`, `WHATSAPP_ICON`). Cela garantit un rendu instantané à 100% sur tout serveur ou déploiement Vercel/Netlify sans dépendre de requêtes d'images HTTP externes.
- **Programmes de Entraînement Officiels (Coach Abdou BAKARI)** : La constante `COACH_PROGRAMS` dans `js/data.js` centralise les programmes rédigés sur-mesure par le coach (ex: "Programme Prise de Muscle — Maison avec matériel"). Les modules `js/pages/client.js`, `js/pages/guest.js` et `js/events.js` l'exploitent pour générer la feuille de route des séances, le player interactif, le calcul des repos/tempo et le plan de progression sur 8 semaines.