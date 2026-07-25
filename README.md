# MonProgrammeFit

Plateforme de coaching sportif personnalisé pour débutants, conçue pour accompagner les utilisateurs dans leur transformation physique, avec ou sans matériel.

## 🚀 Fonctionnalités

- **Quiz d'Onboarding** : Personnalisation du programme selon le profil, le niveau et l'équipement.
- **Tableau de bord Athlète** : Suivi de la progression, historique des entraînements et hydratation.
- **Programmes Officiels** : Accès à des programmes structurés rédigés par le Coach Abdou BAKARI.
- **Espace Admin** : Gestion dynamique des programmes d'entraînement.

## 🛠️ Stack Technique

- **Bundler** : Vite
- **Langage** : JavaScript (Vanilla ES6+)
- **Interface** : HTML5, CSS3
- **Backend/Base de données** : Firebase (Authentication & Firestore)

## 💻 Installation & Développement

1. **Cloner le repository** :
   ```bash
   git clone <votre-repo>
   cd <nom-du-projet>
   ```

2. **Installer les dépendances** :
   ```bash
   npm install
   ```

3. **Variables d'environnement** :
   Copiez le fichier `.env.example` vers `.env` et remplissez les valeurs nécessaires :
   ```bash
   cp .env.example .env
   ```

4. **Lancer le serveur de développement** :
   ```bash
   npm run dev
   ```

## 🚀 Déploiement

Consultez le fichier `deployment_guide.md` pour des instructions détaillées sur le déploiement de l'application sur Vercel et la configuration de Firebase.

## 📂 Structure du projet

- `js/` : Logique applicative (pages, modules, événements).
- `css/` : Styles CSS (tokens, sections, composants).
- `public/` : Assets statiques.
- `docs/` : Documentation complète du projet.
