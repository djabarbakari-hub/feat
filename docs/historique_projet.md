# MonProgrammeFit

## Présentation du Projet
- **Nom** : MonProgrammeFit
- **Objectif** : Plateforme de coaching sportif personnalisé pour débutants, avec ou sans matériel.
- **Utilisateurs cibles** : Personnes souhaitant une transformation physique adaptée à leur environnement (salle, maison, poids du corps).
- **Fonctionnalités principales** :
  - Quiz de personnalisation (lieu, niveau, fréquence).
  - Tableau de bord client (progression, historique, messages).
  - Espace admin (statistiques, gestion des clients).

## Architecture
- **Description** : Application vanilla JS (sans framework) avec rendu côté client.
- **Technologies** :
  - Interface : HTML5, CSS3, JavaScript (ES6).
  - Icônes : Lucide (CDN).
  - Hébergement : Statique (déploiement prévu sur Vercel/Netlify).
- **Flux de données** : État global géré en mémoire (objet `state`), pas de backend pour l'instant.

## Décisions Techniques
- **Vanilla JS** : Choix délibéré pour éviter la sur-ingénierie (pas de React/Vue pour une landing + quiz).
- **Dark mode** : Palette premium "Émeraude & Or Massif" pour éviter les clichés "fitness" (bleu néon, noir agressif).
- **Animations** : Micro-interactions fluides (hover, transitions) avec respect de `prefers-reduced-motion`.

## Historique des Modifications
| Date       | Version | Description                                                                 | Impact                          | Documents mis à jour                     |
|------------|---------|-----------------------------------------------------------------------------|---------------------------------|------------------------------------------|
| 2026-07-14 | 1.0     | Refonte premium (palette, typographie, animations).                        | UI/UX, accessibilité.           | `styles.css`, `app.js`, `index.html`     |
| 2026-07-14 | 0.1     | Initialisation du projet (structure de base, quiz, tableau de bord).       | MVP fonctionnel.                | `app.js`, `index.html`, `styles.css`     |