# Rapport de Conformité — Audit MonProgrammeFit

**Date** : 2026-07-19
**Auditeur** : GitHub Copilot

---

## 1. Incohérences Identifiées

| **Fichier**               | **Problème Identifié**                                                                 | **Correction Proposée**                                                                                     | **Priorité** |
|-----------------------|---------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------|--------------|
| `docs/architecture.md` | Fichiers critiques manquants (`js/pages/quiz.js`, `js/pages/admin.js`).                | Ajouter ces fichiers dans le tableau de la **Structure du Projet**.                                          | Haute        |
|                       | Alias de compatibilité dans `tokens.css` non documentés.                              | Ajouter une section pour expliquer les alias et leur raison d'être.                                          | Moyenne      |
| `docs/charte_graphique.md` | Palette de couleurs obsolète (ne reflète pas `tokens.css`).                         | Mettre à jour la palette pour correspondre à `--ink`, `--ember`, `--moss`, etc.                              | Haute        |
|                       | Polices obsolètes (`Bodoni Moda`, `Cormorant`).                                      | Remplacer par `Archivo Black`, `Archivo`, et `IBM Plex Mono`.                                                 | Haute        |
|                       | Animations (`fadeIn`, `--transition`) non documentées.                              | Ajouter une section pour documenter les animations.                                                          | Moyenne      |
| `AGENT-FEEDBACK.md`    | Système de feedback non implémenté dans le code.                                    | Ajouter une section **Statut** pour préciser qu'il est **en attente d'implémentation**.                     | Moyenne      |
| `docs/decisions_log.md` | Aucune trace du statut du système de feedback.                                        | Ajouter une entrée **ADR-002** pour documenter son report.                                                   | Moyenne      |
|                       | Problème de sécurité (stockage des données sensibles) non documenté.                  | Ajouter une entrée **ADR-003** pour expliquer le risque et les solutions.                                    | Haute        |
| `docs/analyse_antigravity.md` | Bug 1 (`renderQuiz()`) non marqué comme résolu.                                      | Mettre à jour pour indiquer que le bug est **résolu**.                                                       | Haute        |
| `js/state.js`          | Données sensibles stockées en clair dans `state.drafts`.                              | Ajouter un **avertissement** dans `docs/architecture.md` pour rappeler de ne pas stocker de données sensibles en clair. | Haute        |
| `js/router.js`         | Aucune vérification d'accès pour les pages réservées (ex: `admin-dashboard`).         | Documenter dans `docs/decisions_log.md` la nécessité d'ajouter une vérification d'accès.                     | Moyenne      |
| `js/pages/quiz.js`     | JSDoc incomplet pour `renderQuiz()`.                                                  | Compléter le JSDoc dans `docs/decisions_log.md` pour préciser les paramètres et la valeur de retour.         | Moyenne      |

---

## 2. Prérequis Manquants pour les Fonctionnalités Futures

| **Fonctionnalité**        | **Prérequis Manquant**                                                                 | **Solution Proposée**                                                                                       |
|-----------------------|---------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------|
| Panel Admin           | Authentification (rôles `guest`, `client`, `admin`).                                   | Utiliser Firebase Auth ou un backend personnalisé.                                                          |
|                       | Base de données pour stocker les données du panel.                                    | Utiliser Firestore ou une base de données relationnelle (ex: PostgreSQL).                                   |
|                       | Contrôle d'accès serveur pour protéger le panel admin.                                | Vérifier les rôles côté serveur (ex: règles Firestore).                                                      |
| Système de Feedback   | Base de données pour stocker les feedbacks.                                           | Utiliser Firestore ou une API dédiée.                                                                       |
|                       | Mécanismes anti-abus (rate limiting, double soumission).                              | Implémenter des limites de fréquence et empêcher les doubles soumissions.                                    |

---

## 3. Recommandations

### 3.1 Corrections pour `docs/architecture.md`
**Problème** : Fichiers manquants et alias de compatibilité non documentés.

**Correction proposée** :
```markdown
| Chemin               | Rôle                                                                 | Responsabilité                          | Ce qui casse s'il disparaît              |
|----------------------|----------------------------------------------------------------------|-----------------------------------------|------------------------------------------|
| `js/pages/quiz.js`   | Gestion du quiz de personnalisation.                                 | Rendu des étapes, animations.           | Le quiz ne s'affiche pas.                |
| `js/pages/admin.js`  | Espace admin (clients, programmes, messages).                        | Tableau de bord, statistiques.          | L'admin ne fonctionne plus.              |

## Alias de compatibilité dans `tokens.css`
Pour éviter de casser des écrans existants (ex: `js/pages/quiz.js`), certaines variables CSS sont **aliasées** vers la palette actuelle :
- `--accent-primary` → `--ember` (`#E2622D`).
- `--accent-secondary` → `--moss` (`#3C5A46`).
- `--bg-dark` → `--chalk` (`#F7F5F0`).
- `--text-primary` → `--ink` (`#16232C`).

Ces alias permettent une transition progressive vers la nouvelle palette sans casser le code existant.
```

---

### 3.2 Corrections pour `docs/charte_graphique.md`
**Problème** : Palette de couleurs et polices obsolètes.

**Correction proposée** :
```markdown
| Nom sémantique   | Valeur hex | Token CSS          | Rôle primaire                          | Restrictions                     |
|------------------|------------|--------------------|----------------------------------------|----------------------------------|
| Encre           | `#16232C`  | `--ink`           | Texte principal, bordures.             |                                  |
| Encre (ligne)    | `#2A3A45`  | `--ink-line`       | Bordures, séparateurs.                 |                                  |
| Encre (muet)     | `#8A9199`  | `--ink-muted`      | Texte secondaire, placeholders.        |                                  |
| Craie            | `#F7F5F0`  | `--chalk`          | Fond principal, surfaces claires.      |                                  |
| Mousse           | `#3C5A46`  | `--moss`           | Zones de repos, icônes, accents secondaires. |                          |
| Braise           | `#E2622D`  | `--ember`          | CTA, boutons, liens actifs.            | Pas en texte sur fond clair.     |

## Animations

| Nom            | Durée  | Fonction de timing          | Rôle                                  |
|----------------|--------|-----------------------------|----------------------------------------|
| `fadeIn`       | 0.5s   | `ease-out`                  | Apparition progressive des éléments.   |
| `--transition` | 0.2s   | `ease`                      | Transitions pour les couleurs, opacité, transformations, etc. |
```

---

### 3.3 Corrections pour `docs/decisions_log.md`
**Problème** : Statut du système de feedback et risque de sécurité non documentés.

**Correction proposée** :
```markdown
### ADR-002 — Système de Feedback Utilisateur (Reporté)

- **Date** : 2026-07-19
- **Statut** : Reporté
- **Contexte** : Besoin d'un système de feedback utilisateur pour recueillir les signalements de bugs, suggestions et avis. Un agent dédié (`AGENT-FEEDBACK.md`) a été conçu pour cette fonctionnalité.
- **Décision** : Reporter l'implémentation du système de feedback en raison des prérequis manquants.
- **Prérequis manquants** :
  1. **Authentification** : Nécessaire pour identifier les utilisateurs (rôles `guest`, `client`, `admin`).
  2. **Base de données** : Nécessaire pour stocker les feedbacks.
  3. **Contrôle d'accès serveur** : Nécessaire pour protéger le panel admin.
- **Étapes restantes pour implémentation** :
  1. Implémenter l'authentification (ex: JWT, sessions).
  2. Choisir une base de données (ex: Firebase, MongoDB, PostgreSQL).
  3. Développer le formulaire de feedback et le panel admin.
  4. Ajouter des mécanismes anti-abus (rate limiting, double soumission).

---

### ADR-003 — Stockage des Données Sensibles (Risque de Sécurité)

- **Date** : 2026-07-19
- **Statut** : À traiter
- **Contexte** : Les données saisies dans les formulaires (ex: email, nom, réponses du quiz) sont stockées dans `state.drafts` sans chiffrement. Cela expose les utilisateurs à des risques de fuite de données en cas d'attaque XSS ou d'accès non autorisé au stockage local.
- **Risque identifié** :
  - **Exposition des données** : Les données sensibles (ex: email) sont stockées en clair dans `localStorage` via `state.drafts`.
  - **Non-conformité RGPD** : Le stockage de données personnelles sans chiffrement peut violer les réglementations sur la protection des données.
- **Décision** : Ne pas stocker de données sensibles en clair dans `state.drafts`.
- **Solutions envisagées** :
  1. **Chiffrement local** : Utiliser une bibliothèque comme `crypto-js` pour chiffrer les données avant stockage.
  2. **Backend dédié** : Stocker les données sensibles sur un serveur sécurisé (ex: Firebase, API personnalisée).
  3. **Réduire la collecte** : Limiter les données stockées localement aux informations non sensibles.
```

---

### 3.4 Corrections pour `docs/analyse_antigravity.md`
**Problème** : Bug 1 non marqué comme résolu.

**Correction proposée** :
```markdown
### Bug 1 : Erreurs de syntaxe dans `renderQuiz()` (P0) — **Résolu**
```

---

### 3.5 Recommandations pour le Code
1. **Compléter le JSDoc de `renderQuiz()`** dans `js/pages/quiz.js` :
   - Préciser que la fonction ne prend **aucun paramètre** et retourne un **`string` HTML**.

2. **Ajouter une vérification d'accès dans `js/router.js`** :
   - Bloquer l'accès aux pages réservées (ex: `admin-dashboard` pour un `guest`).
   - Exemple de code à ajouter :
     ```javascript
     export function navigate(page, { replace = false } = {}) {
       if (page.startsWith("admin-") && state.role !== "admin") {
         showToast("Accès refusé", "error");
         return;
       }
       // ... reste du code
     }
     ```

3. **Ajouter un avertissement dans `docs/architecture.md`** :
   - Rappeler que les **données sensibles ne doivent pas être stockées en clair** dans `state.drafts`.