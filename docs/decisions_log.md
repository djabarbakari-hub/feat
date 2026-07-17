# Journal des Décisions Architecturales (ADR) — MonProgrammeFit

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
### ADR-002 — Palette "Émeraude & Or Massif"

- **Date** : 2026-07-14
- **Statut** : Acceptée
- **Contexte** : Éviter les clichés "fitness" (bleu néon, noir agressif) et adopter un positionnement premium.
- **Décision** : Palette "Émeraude & Or Massif" (vert-noir profond + or vieilli).
- **Alternatives envisagées** :
  1. **Terre Cuite & Olive** — Rejeté car trop "artisanal" pour un positionnement premium.
  2. **Ardoise & Cuivre** — Rejeté car trop industriel.
- **Conséquences** :
  - Positives : Identité visuelle distinctive, contrastes WCAG AA.
  - Négatives : L'or vieilli peut sembler trop luxueux pour certains utilisateurs.
- **Documents impactés** : `charte_graphique.md`, `styles.css`

---
### ADR-003 — Typographie Bodoni Moda + Cormorant

- **Date** : 2026-07-14
- **Statut** : Acceptée
- **Contexte** : Besoin d'une typographie premium pour renforcer le positionnement haut de gamme.
- **Décision** : Bodoni Moda (display) + Cormorant (body).
- **Alternatives envisagées** :
  1. **Fraunces + Work Sans** — Rejeté car trop proche de la palette "Terre Cuite & Olive".
  2. **Inter (sans-serif)** — Rejeté car trop générique.
- **Conséquences** :
  - Positives : Élégance théâtrale, lisibilité optimale.
  - Négatives : Bodoni Moda peut être difficile à lire en petits corps.
- **Documents impactés** : `charte_graphique.md`, `index.html`