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