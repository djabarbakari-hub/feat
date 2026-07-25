# Règles de Référencement (SEO) et d'Optimisation IA (GEO)

## 0. Intégration obligatoire (à faire une seule fois par projet)

Avant toute modification du projet, lire et appliquer les règles de REFERENCEMENT.md.
Après toute modification significative, exécuter la section "Procédure après chaque modification" de ce fichier et produire le rapport au format défini en section 9.

## 1. Détection du contexte (étape obligatoire avant toute vérification)

Avant d'appliquer une règle ci-dessous, l'assistant IA doit :

1. Identifier le stack réel du projet (framework, générateur de site, CMS, ou code custom).
2. Identifier où vivent, dans ce stack précis, les équivalents de : robots.txt, sitemap, meta tags, service worker, manifest.
3. Si un élément n'a pas d'équivalent dans le stack détecté (ex : pas de Service Worker sur un site non-PWA), marquer **N/A** avec la raison — ne jamais l'ignorer silencieusement, ne jamais inventer un fichier qui n'existe pas.

Exemples de correspondance (non exhaustif, à vérifier au cas par cas) :

| Élément | Next.js (App Router) | Site statique | WordPress |
|---|---|---|---|
| robots.txt | `app/robots.ts` | `public/robots.txt` | plugin SEO ou route virtuelle |
| sitemap | `app/sitemap.ts` | `public/sitemap.xml` (généré) | plugin SEO |
| meta tags | `generateMetadata()` | balises `<head>` en dur | plugin SEO / champs ACF |

## 2. Comportement attendu de l'assistant IA

**Avant toute modification :**
- analyser le projet existant ;
- identifier l'impact SEO et GEO des modifications ;
- vérifier si des fichiers de référencement doivent être mis à jour.

**Après chaque modification :**
- mettre à jour automatiquement tous les éléments concernés ;
- signaler les impacts éventuels ;
- proposer les améliorations pertinentes.

**Ne jamais :**
- supprimer des métadonnées sans justification ;
- générer du contenu dupliqué ;
- inventer des informations (fonctionnalité, fichier, score) qui n'ont pas été vérifiées ;
- laisser des références obsolètes ;
- marquer un point ✅ sans l'avoir réellement vérifié dans le code.

## 3. SEO Technique

- [ ] robots.txt existe et est cohérent avec les pages à indexer/bloquer
- [ ] sitemap.xml existe, à jour, accessible
- [ ] URLs canoniques définies (`<link rel="canonical">` ou équivalent)
- [ ] balises meta robots correctes (index/noindex selon le besoin réel de chaque page)
- [ ] gestion des erreurs 404 (page dédiée, pas un crash)
- [ ] gestion des erreurs 500
- [ ] redirections propres (301 pour permanent, pas de chaînes de redirections)
- [ ] compression HTTP activée (gzip/brotli)
- [ ] cache navigateur configuré (headers Cache-Control)
- [ ] HTTPS actif
- [ ] certificat SSL valide et non expirant bientôt
- [ ] structure des URLs lisible (pas de paramètres illisibles en cascade)
- [ ] absence de contenu dupliqué (vérifier via canonical, pas juste supposer)

## 4. SEO On-Page

Chaque page publique doit avoir :

- [ ] un Title unique (pas copié d'une autre page)
- [ ] une Meta Description unique
- [ ] une URL descriptive
- [ ] une balise H1 unique
- [ ] une hiérarchie H2/H3/H4 cohérente (pas de saut de niveau)
- [ ] des images avec attribut ALT pertinent (pas juste rempli pour cocher la case)
- [ ] des liens internes cohérents
- [ ] des liens externes pertinents (pas de liens morts)
- [ ] un contenu clair et non dupliqué d'une autre page du site
- [ ] un maillage interne logique

## 5. Open Graph & Twitter Cards

Chaque page publique doit contenir :

**Open Graph** : `og:title`, `og:description`, `og:image`, `og:url`, `og:type`
**Twitter Cards** : `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`

À vérifier concrètement avec un outil de preview (pas juste supposer que les balises sont bonnes parce qu'elles existent).

## 6. Données structurées (JSON-LD uniquement)

Générer, quand pertinent au contenu réel de la page (pas par défaut partout) :

- Organization / LocalBusiness
- SoftwareApplication
- Product
- FAQPage
- BreadcrumbList
- Article
- Person
- Event

**Règle stricte** : un schema Schema.org qui ne correspond pas au contenu réel de la page est une pénalité potentielle, pas un bonus. Ne pas ajouter FAQPage s'il n'y a pas de vraies FAQ sur la page.

## 7. Optimisation GEO (moteurs IA / LLM)

Maintenir automatiquement :

- `llms.txt`
- documentation publique
- FAQ
- pages d'aide
- documentation API
- changelog

**Règle stricte** : le fichier `llms.txt` doit refléter fidèlement l'état réel du projet. Si une fonctionnalité décrite dedans n'existe plus ou n'existe pas encore, corriger immédiatement. Ne jamais inventer une fonctionnalité pour "faire complet". Si une information manque pour le rédiger correctement, l'indiquer explicitement plutôt que de combler par supposition.

## 8. Documentation, Performance, Accessibilité, PWA, Indexation

**Documentation** — vérifier après chaque évolution importante : `README.md`, `LICENSE`, `llms.txt`.
**Performance** — vérifier : Core Web Vitals, Lazy Loading, compression des images, minification CSS/JS, code splitting, cache, préchargement des ressources critiques.
**Accessibilité** — respecter au minimum : HTML sémantique, attributs ARIA quand nécessaires, navigation clavier, contraste suffisant, textes alternatifs, formulaires accessibles.
**PWA** (si applicable au projet — sinon marquer N/A) — vérifier : `manifest.json`, icônes, Service Worker, mode hors connexion, installation, raccourcis.
**Indexation** — vérifier : pages bloquées inutilement, sitemap à jour, robots.txt cohérent, URLs orphelines, liens cassés, redirections incorrectes.

## 9. Format obligatoire du rapport d'audit

Chaque audit doit produire **exactement** cette structure — pas de format libre :

```
## Rapport SEO/GEO — [date] — [nom du projet]

### Scores (0 à 100, avec justification courte)
- SEO technique : X/100
- SEO on-page : X/100
- GEO : X/100
- Accessibilité : X/100
- Performance : X/100

### Erreurs critiques
- [liste, ou "aucune"]

### Avertissements
- [liste, ou "aucun"]

### Améliorations recommandées (priorisées)
1. ...
2. ...

### Points marqués N/A (et pourquoi)
- [liste, ou "aucun"]
```

## 10. Procédure après chaque modification

1. Identifier les pages/fichiers concernés.
2. Vérifier les impacts SEO (section 3-5).
3. Vérifier les impacts GEO (section 7).
4. Mettre à jour les métadonnées concernées.
5. Mettre à jour les données structurées concernées.
6. Mettre à jour `llms.txt` si nécessaire.
7. Mettre à jour le sitemap si nécessaire.
8. Vérifier `robots.txt`.
9. Vérifier les performances impactées.
10. Générer le rapport au format de la section 9.

## 11. Principe fondamental

Chaque nouvelle fonctionnalité, page, API ou modification a un impact potentiel sur le référencement. Tu doit systématiquement vérifier cet impact, proposer les corrections nécessaires, et maintenir tous les fichiers liés au SEO et au GEO à jour — **en s'appuyant sur une lecture réelle du code, jamais sur une supposition.**
