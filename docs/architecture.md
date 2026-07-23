# Architecture — MonProgrammeFit

## Vue d'Ensemble
Application monopage (SPA) en JavaScript modulaire, bundlée avec Vite. L'état global est géré via un objet `state` centralisé, et le DOM est mis à jour dynamiquement via des fonctions de rendu (`render()`, `renderNavbar()`, etc.). L'authentification et la persistance des données sont gérées par Firebase (Authentication et Firestore).

## Outils et Technologies
- **Bundler** : Vite (pour le développement et la production).
- **Backend** : Firebase (Authentication, Firestore, Storage).
- **Gestion d'état** : Objet `state` centralisé avec réactivité manuelle.
- **Styles** : CSS moderne avec variables (tokens) pour la cohérence visuelle.

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   index.html│    │  styles.css │    │    app.js   │    │   Firebase  │
│ (Structure) │───▶│ (Présentation)───▶│ (Logique)   │───▶│ (Auth/DB)   │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
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

## Flux API
- **Firebase Authentication** : Gestion des utilisateurs (inscription, connexion, déconnexion).
  - Endpoints : `signUp`, `signIn`, `signOut`.
  - Payload : `{ email, password }`.
  - Réponse : `{ user, error }`.
- **Firestore** : Base de données NoSQL pour les profils clients, programmes, messages et données admin.
  - Collections :
    - `users` : Stocke les profils utilisateurs.
    - `sessions` (sous-collection) : Historique des sessions d'entraînement.
    - `messages` : Messages de contact.
  - Opérations : `get`, `add`, `update`, `delete`.
- **Firebase Storage** : Stockage des images de programmes (si applicable).

## Flux Base de Données
- **Collection `users`** : Stocke les informations de profil utilisateur (rôle, email, programme).
  - **Sous-collection `sessions`** : Pour chaque utilisateur, stocke l'historique de ses sessions d'entraînement.
- **Collection `messages`** : Stocke les messages de contact envoyés via le formulaire.

## Conventions Utilisées
- **Nommage** :
  - Fichiers : `kebab-case` (ex: `client-dashboard.js`).
  - Variables : `camelCase` (ex: `quizStep`).
  - Constantes : `UPPER_SNAKE_CASE` (ex: `TRACKS`).
- **Commits** :
  - Format : `type(scope): description` (ex: `feat(quiz): add progress bar`).
- **Imports** :
  - Utilisation de modules ES (`import/export`) gérés par Vite. Les dépendances npm sont résolues automatiquement.

## Dépendances Clés
| Dépendance | Version | Rôle | Critique ? | Alternative si supprimée |
|---|---|---|---|---|
| Vite | ^6.3.5 | Bundler, serveur de dev. | Oui. | Webpack, Parcel. |
| Firebase | ^11.3.0 | Authentification, BDD (Firestore).| Oui. | Supabase, AWS Amplify. |
| Lucide | ^0.507.0 | Icônes (via npm). | Non. | Heroicons, Feather Icons. |
| Google Fonts | - | Polices (Archivo Black, Archivo, IBM Plex Mono). | Oui. | Polices système (dégradation). |
| Firebase Storage | ^11.3.0 | Stockage des médias (images, vidéos). | Non (MVP). | AWS S3, Cloudinary. |

## Alias de compatibilité dans `tokens.css`

Pour garantir la rétrocompatibilité avec les écrans existants, certaines variables CSS sont aliasées vers la palette d'origine. Voici les alias définis dans `tokens.css` :

| Alias                | Variable Cible       | Rôle                                  |
|----------------------|----------------------|----------------------------------------|
| `--bg-dark`          | `--chalk`            | Fond principal.                        |
| `--text-primary`     | `--ink`              | Texte principal.                       |
| `--text-secondary`   | `--slate`            | Texte secondaire.                      |
| `--accent-primary`   | `--ember`            | Couleur d'accent principale (CTA).     |
| `--accent-secondary` | `--moss`             | Couleur d'accent secondaire.           |
| `--surface`          | `--chalk-soft`       | Surface des cartes et modales.         |
| `--focus-outline`    | `--ember`            | Contour de focus pour l'accessibilité. |
| `--shadow`           | -                    | Ombre pour les éléments surélevés.     |
| `--transition`       | -                    | Transition pour les animations.        |

## Fichiers CSS

| Fichier              | Rôle                                  | Dépendances                     |
|----------------------|----------------------------------------|----------------------------------|
| `tokens.css`         | Source unique de vérité pour les couleurs, polices et animations. | -                                |
| `components.css`     | Styles des composants réutilisables (boutons, cartes, etc.).      | `tokens.css`                     |
| `navbar.css`         | Styles de la barre de navigation.      | `tokens.css`                     |
| `hero.css`           | Styles de la section hero.             | `tokens.css`                     |
| `dashboards.css`     | Styles des tableaux de bord.           | `tokens.css`                     |
Pour éviter de casser des écrans existants (ex: `js/pages/quiz.js`), certaines variables CSS sont **aliasées** vers la palette actuelle :
- `--accent-primary` → `--ember` (`#E2622D`).
- `--accent-secondary` → `--moss` (`#3C5A46`).
- `--bg-dark` → `--chalk` (`#F7F5F0`).
- `--text-primary` → `--ink` (`#16232C`).

Ces alias permettent une transition progressive vers la nouvelle palette sans casser le code existant.

⚠️ **Avertissement** : Ne pas stocker de **données sensibles** (ex: email, mot de passe) en clair dans `state.drafts`. Utiliser un chiffrement local ou un backend dédié pour les données personnelles. Voir [`ADR-003`](decisions_log.md) pour plus de détails.

## Points Critiques
- **État global** : `state` est un objet mutable → risque d'effets de bord si modifié directement.
- **Animations** : `prefers-reduced-motion` doit être respecté pour l'accessibilité.
- **Images** : URLs externes (Unsplash) → risque de 404 si supprimées.

## Zones d'Amélioration
- **Tests** : Ajouter Jest pour les fonctions pures (ex: `trackById`, `isQuizComplete`).
- **Backend** : Intégrer Firebase pour l'authentification et le stockage des données.