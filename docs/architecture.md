# Architecture — MonProgrammeFit

## Vue d'Ensemble
Application monopage (SPA) en vanilla JS avec rendu côté client. L'état global est géré via un objet `state` centralisé, et le DOM est mis à jour dynamiquement via des fonctions de rendu (`render()`, `renderNavbar()`, etc.).

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   index.html│    │  styles.css │    │    app.js   │
│ (Structure) │───▶│ (Présentation)───▶│ (Logique)   │
└─────────────┘    └─────────────┘    └─────────────┘
```

## Structure du Projet
| Chemin               | Rôle                                                                 | Responsabilité                          | Ce qui casse s'il disparaît              |
|----------------------|----------------------------------------------------------------------|-----------------------------------------|------------------------------------------|
| `index.html`         | Point d'entrée HTML. Charge les assets et initialise l'app.         | Structure de base, meta tags.           | L'app ne se lance pas.                   |
| `styles.css`         | Styles globaux et tokens de design.                                  | Palette, typographie, animations.       | UI cassée (couleurs, espacements).       |
| `app.js`             | Logique métier et rendu dynamique.                                  | État, navigation, interactions.         | Aucune fonctionnalité ne marche.         |
| `js/pages/quiz.js`   | Gestion du quiz de personnalisation.                                 | Rendu des étapes, animations.           | Le quiz ne s'affiche pas.                |
| `js/pages/admin.js`  | Espace admin (clients, programmes, messages).                        | Tableau de bord, statistiques.          | L'admin ne fonctionne plus.              |
| `docs/`              | Documentation technique et mémoire du projet.                       | Traçabilité, onboarding.                | Perte de contexte pour les futurs devs.  |

## Flux Applicatifs
1. **Initialisation** :
   - `index.html` charge `app.js` et `styles.css`.
   - `app.js` initialise `state` et appelle `render()`.
2. **Navigation** :
   - L'utilisateur clique sur un bouton (`data-nav`).
   - `navigate(page)` met à jour `state.page` et appelle `render()`.
3. **Quiz** :
   - L'utilisateur répond aux questions (`data-quiz-answer`).
   - `state.quizAnswers` est mis à jour, `renderQuiz()` affiche la suite.

## Conventions Utilisées
- **Nommage** :
  - Fichiers : `kebab-case` (ex: `client-dashboard.js`).
  - Variables : `camelCase` (ex: `quizStep`).
  - Constantes : `UPPER_SNAKE_CASE` (ex: `TRACKS`).
- **Commits** :
  - Format : `type(scope): description` (ex: `feat(quiz): add progress bar`).
- **Imports** :
  - Pas de bundler → scripts chargés via `<script>` dans `index.html`.

## Dépendances Clés
| Dépendance       | Version | Rôle                          | Critique ? | Alternative si supprimée       |
|------------------|---------|-------------------------------|------------|--------------------------------|
| Lucide           | latest  | Icônes (CDN).                 | Non.       | Heroicons, Feather Icons.      |
| Google Fonts     | -       | Polices (Archivo Black, Archivo, IBM Plex Mono). | Oui.       | Polices système (dégradation). |

## Alias de compatibilité dans `tokens.css`
Pour éviter de casser des écrans existants (ex: `js/pages/quiz.js`), certaines variables CSS sont **aliasées** vers la palette actuelle :
- `--accent-primary` → `--ember` (`#E2622D`).
- `--accent-secondary` → `--moss` (`#3C5A46`).
- `--bg-dark` → `--chalk` (`#F7F5F0`).
- `--text-primary` → `--ink` (`#16232C`).

Ces alias permettent une transition progressive vers la nouvelle palette sans casser le code existant.

## Points Critiques
- **État global** : `state` est un objet mutable → risque d'effets de bord si modifié directement.
- **Animations** : `prefers-reduced-motion` doit être respecté pour l'accessibilité.
- **Images** : URLs externes (Unsplash) → risque de 404 si supprimées.

## Zones d'Amélioration
- **Modularité** : Découper `app.js` en modules (ex: `quiz.js`, `dashboard.js`).
- **Tests** : Ajouter Jest pour les fonctions pures (ex: `trackById`, `isQuizComplete`).
- **Backend** : Intégrer Firebase pour l'authentification et le stockage des données.