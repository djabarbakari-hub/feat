# Contexte pour les Agents IA — MonProgrammeFit

## Choix Techniques
### Vanilla JS
- **Pourquoi** : Éviter la sur-ingénierie pour un MVP (landing + quiz). Pas de framework (React/Vue) pour réduire la complexité.
- **Impact** : Code plus simple à maintenir, mais nécessite une modularisation manuelle (ex: `js/pages/`).

### Palette de Couleurs
- **Pourquoi** : Palette sobre et élégante (`--ink`, `--ember`, `--moss`) pour éviter les clichés "fitness" (bleu néon, noir agressif).
- **Référence** : `css/tokens.css` (variables `--ink`, `--ember`, `--moss`, `--chalk`).

### Typographie
- **Polices** : `Archivo Black` (titres), `Archivo` (corps), `IBM Plex Mono` (utilitaire).
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
- **Modularisation** : Chaque page a son fichier dans `js/pages/` (ex: `quiz.js`, `admin.js`).