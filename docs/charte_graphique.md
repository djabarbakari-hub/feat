# Charte Graphique — MonProgrammeFit
> *"Palettes d'origine restaurées : chaleur minérale et élégance discrète."*

**Version** : 1.1
**Thème** : light (palette d'origine)
**Dernière mise à jour** : 2026-07-20

---
## Couleurs
> **Note** : Les couleurs ci-dessous correspondent à la **palette d'origine** du projet (fichiers `abdou.zip`).
> La palette jaune (`#D4AF37`) utilisée temporairement a été **remplacée** pour restaurer la cohérence visuelle.

| Nom sémantique   | Valeur hex | Token CSS          | Rôle primaire                          | Restrictions                     | Niveau       |
|------------------|------------|--------------------|----------------------------------------|----------------------------------|--------------|
| Encre           | `#16232C`  | `--ink`           | Texte principal, bordures.             |                                  | Principale   |
| Encre (ligne)    | `#2A3A45`  | `--ink-line`       | Bordures, séparateurs.                 |                                  | Secondaire   |
| Encre (muet)     | `#8A9199`  | `--ink-muted`      | Texte secondaire, placeholders.        |                                  | Secondaire   |
| Craie            | `#F7F5F0`  | `--chalk`          | Fond principal, surfaces claires.      |                                  | Principale   |
| Mousse           | `#3C5A46`  | `--moss`           | Zones de repos, icônes, accents secondaires. |                          | Secondaire   |
| Braise           | `#E2622D`  | `--ember`          | CTA, boutons, liens actifs.            | Pas en texte sur fond clair.     | Principale   |
| Surface          | `#F1EFE9`  | `--surface`        | Cartes, modales.                       |                                  | Sémantique   |

---
## Typographie

### Archivo Black (Display)
- **Source** : Google Fonts (`Archivo+Black&family=Archivo:wght@400;500;600;700`).
- **Substituts** : `sans-serif`, Arial.
- **Poids utilisés** : 900.
- **Rôle** : Logo, titres h1.
- **Rationale** : Police géométrique et moderne → équilibre entre élégance et lisibilité pour une app fitness.

### Archivo (Body)
- **Source** : Google Fonts (`Archivo:wght@400;500;600;700`).
- **Substituts** : `sans-serif`, Helvetica.
- **Poids utilisés** : 400, 500, 600, 700.
- **Rôle par poids** :
  - 400 : Texte courant.
  - 500 : Boutons secondaires, liens.
  - 600 : Sous-titres h2/h3.
  - 700 : Boutons primaires.
- **Rationale** : Sans-serif lisible et moderne → complémentaire à Archivo Black.

### IBM Plex Mono (Utilitaire)
- **Source** : Google Fonts (`IBM+Plex+Mono:wght@500`).
- **Substituts** : `monospace`, Courier New.
- **Rôle** : Chiffres, icônes, captions, code.

**Échelle typographique** :

| Rôle          | Taille (px) | Line-height | Letter-spacing | Token CSS       |
|---------------|-------------|-------------|----------------|-----------------|
| h1            | 48          | 1.1         | -0.02em        | `--font-size-h1`|
| h2            | 32          | 1.2         | -0.01em        | `--font-size-h2`|
| h3            | 24          | 1.3         | 0              | `--font-size-h3`|
| Body          | 16          | 1.6         | 0              | `--font-size-body`|
| Caption       | 14          | 1.5         | 0.05em         | `--font-size-caption`|

## Animations

| Nom            | Durée  | Fonction de timing          | Rôle                                  | Définition CSS                          |
|----------------|--------|-----------------------------|----------------------------------------|------------------------------------------|
| `fadeIn`       | 0.5s   | `ease-out`                  | Apparition progressive des éléments.   | `@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }` |
| `--transition` | 0.2s   | `ease`                      | Transitions pour les couleurs, opacité, transformations. | `transition: var(--transition);` |

## Alias de compatibilité

Pour éviter de casser des écrans existants, certaines variables CSS sont **aliasées** vers la palette actuelle. Voici les alias utilisés dans `tokens.css` :

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
|---------------|-------------|-------------|----------------|-----------------|
| h1            | 48          | 1.1         | -0.02em        | `--font-size-h1`|
| h2            | 32          | 1.2         | -0.01em        | `--font-size-h2`|
| h3            | 24          | 1.3         | 0              | `--font-size-h3`|
| Body          | 16          | 1.6         | 0              | `--font-size-body`|
| Caption       | 14          | 1.5         | 0.05em         | `--font-size-caption`|

---
## Espacement
- **Unité de base** : 4px.
- **Échelle complète** :
  | Token CSS       | Valeur (px) | Usage                          |
  |-----------------|-------------|--------------------------------|
  | `--space-xs`    | 4           | Micro-espacements (icônes).    |
  | `--space-sm`    | 8           | Padding boutons.               |
  | `--space-md`    | 16          | Gap entre éléments.            |
  | `--space-lg`    | 24          | Marges sections.               |
  | `--space-xl`    | 32          | Espacement entre sections.     |
- **Densité** : `comfortable` (espacements généreux pour le premium).

---
## Border Radius
| Élément       | Valeur (px) | Token CSS          |
|---------------|-------------|--------------------|
| Bouton        | 2           | `--radius-button`  |
| Carte         | 2           | `--radius-card`    |
| Input         | 2           | `--radius-input`   |
| Nav           | 0           | `--radius-nav`     |
| Modal         | 4           | `--radius-modal`   |

**Règle globale** : Géométrie uniforme (tout est `2px` sauf exceptions).

---
## Composants UI

### Bouton Primaire
| Champ            | Valeur                                                                 |
|------------------|------------------------------------------------------------------------|
| Rôle             | Action principale (CTA).                                               |
| Background       | `--accent-primary` (`#D4AF37`).                                        |
| Couleur texte    | `--bg-dark` (`#0F1A14`).                                               |
| Taille police    | 16px (`--font-size-body`).                                             |
| Poids police     | 500 (Cormorant).                                                       |
| Padding          | 14px 24px.                                                             |
| Border-radius    | `--radius-button` (2px).                                               |
| Border           | none.                                                                  |
| Ombre            | `0 4px 12px rgba(15, 26, 20, 0.3)` (au hover).                         |

**États interactifs** :
| État            | Changement                                                                 |
|-----------------|---------------------------------------------------------------------------|
| Hover           | `transform: translateY(-2px)`, `box-shadow: 0 8px 24px rgba(15, 26, 20, 0.4)`. |
| Focus-visible   | Outline : `2px solid --accent-primary`, offset `2px`.                    |
| Active          | `transform: scale(0.98)`.                                                 |
| Disabled        | Opacité `0.5`, curseur `not-allowed`.                                     |

---
## Accessibilité
| Combinaison               | Ratio WCAG | Niveau | Statut          |
|---------------------------|------------|--------|-----------------|
| `--text-primary` / `--bg-dark` | 15.3:1     | AAA    | ✅ Conforme      |
| `--accent-primary` / `--bg-dark` | 7.5:1      | AA     | ✅ Conforme      |
| `--text-secondary` / `--bg-dark` | 9.2:1      | AAA    | ✅ Conforme      |

**Focus visible** :
- Tous les éléments interactifs ont un outline personnalisé (`2px solid --accent-primary`).

**Motion** :
- Respect de `prefers-reduced-motion` : désactive toutes les animations si activé.

---
## Do's & Don'ts

### Do's
1. **Utiliser `--accent-primary` pour les CTA** → Cohérence avec la palette premium.
   *Pourquoi* : L'or vieilli évite le look "gym générique" (rouge/bleu néon).
2. **Limiter les animations à 300ms** → Fluidité sans distraction.
   *Pourquoi* : Respecte les standards UX (Section 2bis de `Agents_Standards_Interface_Web.md`).
3. **Appliquer `loading="lazy"` aux images** → Performance optimisée.
   *Pourquoi* : Réduit le CLS (Cumulative Layout Shift).

### Don'ts
1. **Ne pas utiliser de polices système par défaut** → Dégrade l'identité premium.
   *Exemple* : `font-sans` (Inter) → remplace par Cormorant.
2. **Ne pas empiler les signaux visuels sur mobile** → Évite la surcharge (Section 6.8.9 de `Documentation_Architect.md`).
   *Exemple* : Une carte ne doit pas avoir à la fois une ombre, une bordure ET un radius.
3. **Ne pas ignorer `prefers-reduced-motion`** → Risque d'exclusion des utilisateurs sensibles aux animations.