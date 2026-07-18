# ORCHESTRATEUR — Bibliothèque d'Agents IA

> **Non-exhaustif.** Basé sur les fichiers vus au 15 juillet 2026 (2 sources : projet Claude +
> upload `Code.zip`). D'autres fichiers existent ailleurs, pas encore centralisés. À mettre à
> jour à chaque nouvel ajout — ne pas supposer cette liste complète.

Deux fonctions dans ce fichier : (1) index de tous les agents disponibles, par catégorie,
(2) règles d'exécution quand plusieurs agents se chevauchent sur le même périmètre — actuellement
les 3 agents d'audit (section 10).

---

## Comment lire cet index
Chaque agent est **scopé à un domaine précis**. Ne pas activer deux agents qui se chevauchent
sur le même périmètre dans la même session sans arbitrer lequel prévaut (voir section 10 pour
les audits — même logique déjà utilisée pour Global/Frontend/Backend dans `PROMPTS-AUDIT-SECURITE.md`).

---

## 1. Gouvernance / Meta (à lire avant les autres)

| Fichier | Rôle | Statut |
|---|---|---|
| `AGENTS.md` | Charte opérationnelle générale — source unique de vérité pour raisonnement, doc, protocoles spéciaux | ⚠️ Champs `Projet`/`Version`/`Dernière mise à jour` vides — à remplir par projet avant usage |
| `Documentation_Architect.md` | Agent documentaliste — maintien d'une doc vivante, résolution de conflits documentaires |  |
| `AUDIT-COHERENCE.md` | Audit des incohérences de texte/terminologie/format dans le code et l'UI | Commandes : `audit:cohérence`, `audit:cohérence [dossier]`, `audit:cohérence --type [type]` — voir section 10 |

## 2. Code — Qualité, Revue, Debug

| Fichier | Rôle |
|---|---|
| `Agents_Revue_Code.md` | Revue de code senior — classement À MODIFIER ABSOLUMENT / SOUHAITÉ / FACULTATIF, jamais de préférence de style bloquante |
| `Agents_Debug_Correction.md` | Debug — cause racine obligatoire, fix minimal, jamais de correction de symptôme |
| `Agents_Commentaire_Code.md` | Documentation du code — commente le pourquoi, jamais le quoi, ne touche jamais à la logique |
| `Antigravity_Analysts.md` | Audit projet complet (frontend/fullstack/monolithique) en 4 phases : Reconnaissance → Inspection → Diagnostic → Restitution — voir section 10 |
| `PROMPTS-AUDIT-SECURITE.md` | Audit sécurité applicatif (AppSec) — 3 sous-prompts Global/Frontend/Backend, score /100, grille de gravité fixe — voir section 10 |
| `AGENT-CONTRAT-LOGIQUE.md` | Intégrité intention↔implémentation — audit rétroactif (contrat reconstruit) + contrat préventif avant construction. Invocation manuelle uniquement (`logique:audit` / `logique:contrat` / `logique:verifier`), aucun déclencheur automatique — voir section 10 pour sa place dans la séquence d'audit |
## 3. Design / Direction Artistique

| Fichier | Rôle |
|---|---|
| `Agents_Direction_Artistique.md` | DA senior — identité visuelle sur-mesure par client, anti-template, auto-critique contre 3 looks génériques IA |
| `Agents_Bibliotheque_Palettes.md` | Gestion des palettes couleur — historique anti-répétition entre projets, croisement obligatoire avec Direction Artistique |
| `Agents_Design_Reference.md` | Analyse UI/UX/Motion Design d'une référence externe — sépare fait observé vs hypothèse, généralisation du principe (pas copie littérale) |

## 4. Panel Admin

| Fichier | Rôle |
|---|---|
| `prompt-audit-panel-admin.md` | Audit d'un panel admin existant — fonctionnel + sécurité (OWASP Broken Access Control) + design/UX, 5 étapes |
| `prompt-conception-panel-admin-client.md` | Conception d'un panel admin from scratch pour client non-développeur — 7 modules sectoriels (e-commerce, blog, réservation, etc.) |
| `AGENT-FEEDBACK.md` | Système de feedback utilisateur + panel admin dédié (statuts, filtres, accès protégé) |

## 5. Intégrations tierces

| Fichier | Rôle |
|---|---|
| `AGENT-ANALYTICS-GA4.md` | Audit + intégration Google Analytics 4, Consent Mode v2, dashboard interne |
| `AGENT-CLARITY.md` | Audit + intégration Microsoft Clarity (session replay/heatmap), coordonné avec GA4 sur le consentement |
| `AGENT-EMAIL-RESEND.md` | Audit + intégration Resend (email transactionnel/marketing), coordonné avec GA4/Clarity sur le consentement |
| `Agents_Integration_Fedapay.md` | Intégration FedaPay — n'utilise QUE les infos du document fourni, interdiction explicite de patterns Stripe |

## 6. SEO / GEO / Contenu

| Fichier | Rôle |
|---|---|
| `REFERENCEMENT.md` | Checklist SEO/GEO transverse — technique, on-page, Open Graph, données structurées, GEO, format de rapport imposé |
| `LLMS-TXT.md` | Génération de `llms.txt` conforme au standard llmstxt.org |
| `prompts-site-complet.md` | Bibliothèque de prompts par section de site (header, menu mobile, breadcrumb, sidebar, pagination, etc.) |

## 7. Légal / Licences

| Fichier | Rôle |
|---|---|
| `AGENT-LICENCES.md` | Génération/audit de licences de code + documents produit (CGU/CGV/EULA/politique de confidentialité), cadre OAPI/Bangui + APDP |

## 8. Déploiement

| Fichier | Rôle |
|---|---|
| `Agents_Deployment_Instructions.md` | Génère `deployment_guide.md` en autonomie à partir du scan du projet, pose zéro question sauf info indéductible — **propriétaire du contenu réel** |

## 9. Stratégie / Business

| Fichier | Rôle |
|---|---|
| `AGENT-STRATEGIE-PRICING.md` | Challenger stratégie SaaS/PM/UX/Pricing/Business Model — auto-détecte pricing/stack via le code (Étape 0), ne demande que ce qui n'est pas dans le repo, formats [COURT]/[COMPLET] selon l'ampleur, benchmark concurrent obligatoirement passé par web_search ou marqué non vérifié, renvoi vers `AUDIT-COHERENCE.md` si contradiction de pricing détectée |

---

## 10. Orchestration — les 3 agents d'audit

`Antigravity_Analysts.md`, `PROMPTS-AUDIT-SECURITE.md` et `AUDIT-COHERENCE.md` auditent le même
projet à des niveaux différents et se chevauchent partiellement (ex : secrets en clair vérifiés
par `Antigravity_Analysts` ET `PROMPTS-AUDIT-SECURITE`). Règles ci-dessous — aucune des 3 n'est
court-circuitée, chacune garde ses propres gates de validation internes.

### Ordre d'exécution obligatoire

**1. `Antigravity_Analysts.md` — toujours en premier.**
Vue d'ensemble large et peu coûteuse : architecture, dépendances, qualité, sécurité de surface.
Sert de carte du projet pour les deux agents suivants.

**2. `PROMPTS-AUDIT-SECURITE.md` — en second, sur ce que Antigravity a signalé sécurité.**
Reprend chaque point sécurité soulevé en phase 1 et va plus loin (SSTI, IDOR, BFLA, etc.).
Choisir Global/Frontend/Backend selon la règle déjà définie dans ce fichier. Ne pas relancer
Antigravity_Analysts après coup pour la sécurité — l'audit dédié est strictement plus profond.

**3. `AUDIT-COHERENCE.md` — toujours en dernier.**
Corrige libellés/messages une fois le code fonctionnel et sécurisé stabilisé. Corriger une
faille de sécurité change souvent le texte affiché (ex : message d'erreur trop verbeux) —
faire la cohérence avant obligerait à la refaire après.

### Règle de précédence en cas de contradiction

**Sécurité > Fonctionnel/Architecture > Cohérence de texte.**

- `PROMPTS-AUDIT-SECURITE` gagne toujours sur `AUDIT-COHERENCE` — jamais harmoniser un message
  d'erreur d'une façon qui réintroduit une fuite d'info (ex : réunifier "email inconnu" et
  "mot de passe incorrect" casserait la protection anti-énumération déjà couverte par l'audit
  sécurité).
- `Antigravity_Analysts` gagne sur `AUDIT-COHERENCE` pour tout ce qui touche architecture/config.
- Si `Antigravity_Analysts` et `PROMPTS-AUDIT-SECURITE` se contredisent sur un même finding :
  `PROMPTS-AUDIT-SECURITE` prévaut — seul des deux à appliquer une grille de gravité fixe et
  une exigence de preuve fichier+ligne.

### Règle anti-doublon

Jamais les 3 en parallèle sur le même périmètre dans la même session. Un finding qui apparaît
dans 2 rapports (ex : secret exposé signalé par Antigravity ET l'audit sécurité) n'est traité
qu'une fois, au niveau de l'agent le plus profond concerné.

### Cas où un seul agent suffit

- Petit projet, premier passage, rien de sensible → `Antigravity_Analysts` seul peut suffire.
- Après intégration paiement/webhook/auth → `PROMPTS-AUDIT-SECURITE` obligatoire.
- Avant livraison client / mise en prod → les 3, dans l'ordre ci-dessus, systématiquement.

### Annonce avant de lancer la séquence

```
ORCHESTRATEUR AUDITS — séquence prévue :
1. Antigravity_Analysts.md
2. PROMPTS-AUDIT-SECURITE.md (Global/Frontend/Backend — préciser lequel)
3. AUDIT-COHERENCE.md
Attendre validation de chaque rapport avant de passer à l'agent suivant.
```
### Agent complémentaire — AGENT-CONTRAT-LOGIQUE.md (optionnel, invocation manuelle)

Contrairement aux 3 agents ci-dessus, `AGENT-CONTRAT-LOGIQUE.md` ne fait jamais partie de la
séquence automatique — il n'a aucun déclencheur par mot-clé et s'invoque explicitement
(`logique:audit`). Utile en particulier après une phase où des fonctionnalités ont été
ajoutées sans définition de structure préalable.

Si l'user choisit de l'inclure dans un audit complet :
- Le lancer **après `Antigravity_Analysts.md`** (qui sert de carte du projet) et **avant
  `AUDIT-COHERENCE.md`** (corriger un écart de logique change souvent le texte affiché,
  même raisonnement que pour la séquence sécurité → cohérence).
- Indépendant de `PROMPTS-AUDIT-SECURITE.md` — les deux peuvent tourner dans l'ordre qui
  arrange, sauf si un écart trouvé ici a une implication sécurité, auquel cas la règle de
  précédence habituelle s'applique (Sécurité > Fonctionnel > Cohérence).
---