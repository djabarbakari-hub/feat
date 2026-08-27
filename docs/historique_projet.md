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
| 2026-07-19 | 1.1     | Audit de cohérence et mise à jour de la documentation.                     | Correction des écarts entre `docs/` et `code/`. Ajout des ADR-002 et ADR-003. | `docs/architecture.md`, `docs/charte_graphique.md`, `docs/decisions_log.md` |

# Historique du Projet — MonProgrammeFit

## Présentation du Projet
- **Nom** : MonProgrammeFit
- **Objectif** : Plateforme de coaching sportif personnalisé pour débutants.
- **Utilisateurs cibles** : Particuliers débutants en fitness.
- **Fonctionnalités principales** : Quiz de personnalisation, tableau de bord client, espace admin.

## Architecture
- **Description** : SPA en Vanilla JS avec Vite, état géré via Firebase.
- **Technologies** :
  - Interface : HTML/CSS/JS
  - Backend : Firebase (Auth, Firestore)
  - Bundler : Vite

## Historique des Modifications
| Date       | Version | Description | Impact | Documents mis à jour |
|------------|---------|-------------|--------|----------------------|
| 2026-07-22 | 1.0     | Initialisation du projet avec Vite et Firebase. | Majeur | `architecture.md`, `cahier_des_charges.md` |
| 2026-07-22 | 1.1     | Mise à jour de la documentation pour refléter l'état actuel du projet. | Mineur | `historique_projet.md`, `decisions_log.md`, `tasks_tracking.md` |
| 2026-07-24 | 1.2     | Chronomètre manuel & diction vocale écran éteint (Web Worker + Audio Session + MediaSession), purge intégrale Firestore des données utilisateur. | Majeur | `workoutTimer.js`, `privacy.js`, `architecture.md`, `decisions_log.md`, `tasks_tracking.md` |
| 2026-07-24 | 1.3     | Résolution définitive des d'assets sur Vercel : inlining Base64 autonomes dans `js/assets.js` (`COACH_AVATAR`, `WHATSAPP_ICON`). | Majeur | `assets.js`, `guest.js`, `navbar.js`, `decisions_log.md`, `historique_projet.md` |
| 2026-07-24 | 1.4     | Intégration complète du "Programme Prise de Muscle (Maison avec matériel)" rédigé par Coach Abdou BAKARI (données structurées `COACH_PROGRAMS`, player interactif, consignes, tempo, échauffement, plan de progression 8 semaines). | Majeur | `data.js`, `client.js`, `guest.js`, `events.js`, `ai_context.md`, `historique_projet.md` |
| 2026-07-24 | 1.5     | Remplacement de la photo officielle de Coach Abdou BAKARI par la nouvelle image (`Coach Abdou BAKARI-1.JPG`), optimisée à 70 KB et inlinée en Base64 dans `js/assets.js` pour une garantie d'affichage à 100% en production Vercel. | Mineur | `assets.js`, `guest.js`, `public/images/team/abdou_bakari.jpg`, `historique_projet.md` |
| 2026-07-24 | 1.6     | Gestion dynamique des programmes d'entraînement par l'administrateur avec persistance Firestore (collection `tracks`), modal d'édition complet (titre, accroche, durée, icône, image, description) et synchronisation en temps réel. | Majeur | `admin.js`, `app.js`, `state.js`, `helpers.js`, `guest.js`, `events.js`, `firebase-blueprint.json`, `firestore.rules` |
| 2026-07-24 | 1.7     | Suppression complète de la section de diction vocale et de maintien écran éteint dans le chronomètre d'entraînement client (simplification UX suite au retour utilisateur). | Mineur | `client.js`, `events.js`, `historique_projet.md` |
| 2026-07-24 | 1.8     | Dynamisation complète du questionnaire d'onboarding (quiz) et des calculs de durée d'entraînement à partir des programmes éditables par l'administrateur, assurant une parfaite adaptation en temps réel de toutes les interfaces utilisateurs. | Majeur | `quiz.js`, `events.js`, `historique_projet.md` |
| 2026-07-24 | 1.9     | Correction de l'affichage des séries d'exercices : dynamisation automatique du nombre de cases à cocher (Séries) selon le descriptif exact de l'exercice (évite l'affichage fixe incohérent de 4 cases pour 3 séries). | Mineur | `client.js`, `historique_projet.md` |
| 2026-07-24 | 1.10    | Amélioration de l'UX des formulaires de mise à jour (indicateurs de chargement, désactivation au clic) et synchronisation immédiate de l'état local pour éviter toute divergence d'information entre les vues après une mise à jour du profil. | Mineur | `events.js`, `historique_projet.md` |
| 2026-08-14 | 1.12    | Séances du bon jour (lookup par id), changement de programme réel, demandes d’ajustement client→coach, libellé quiz = programme coach. | Majeur | `program.js`, `client.js`, `admin.js`, `quiz.js`, `events.js` |