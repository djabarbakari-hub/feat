# Installation Locale — MonProgrammeFit

## Prérequis
| Outil       | Version requise | Vérification          |
|-------------|-----------------|-----------------------|
| Navigateur  | Chrome ≥ 90     | `chrome://version`    |
| Node.js     | N/A             | Pas de backend.       |

## Point d'Entrée
`index.html` (ouvrir directement dans un navigateur).

## Installation
Aucune installation requise. Cloner le dépôt et ouvrir `index.html` :
```bash
git clone <url_du_depot>
cd abdoul
start index.html  # Windows
open index.html   # Mac
xdg-open index.html # Linux
```

## Développement
1. Modifier les fichiers (`app.js`, `styles.css`, `index.html`).
2. Rafraîchir le navigateur (`Ctrl + F5` pour vider le cache).

## Build
Aucun build nécessaire (projet statique).

## Variables d'Environnement
Aucune variable d'environnement n'est requise pour le MVP. Pour les futures intégrations (Firebase, FedaPay), créer un fichier `.env` à la racine du projet avec les variables suivantes :

```env
# Firebase (exemple)
GEMINI_API_KEY=your_api_key_here
FIREBASE_API_KEY=your_api_key_here
FIREBASE_AUTH_DOMAIN=your_auth_domain_here
FIREBASE_PROJECT_ID=your_project_id_here

# FedaPay (exemple)
FEDAPAY_API_KEY=your_api_key_here
FEDAPAY_ENV=sandbox
```

## Tests
Aucun test configuré pour l'instant.

## Fichiers Importants
| Fichier       | Rôle                          | À modifier quand ?                     |
|---------------|-------------------------------|----------------------------------------|
| `app.js`      | Logique métier.               | Ajout de fonctionnalités.              |
| `styles.css`  | Styles et animations.         | Changements de design.                 |
| `index.html`  | Structure et meta tags.       | Ajout de scripts ou balises SEO.       |