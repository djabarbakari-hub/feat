# Stratégie SEO — MonProgrammeFit

## SEO Technique
- **Performance** :
  - Objectif : Score Lighthouse ≥ 90 (Performance, Accessibilité, SEO).
  - Actions :
    - Lazy loading des images (`loading="lazy"`).
    - Minification du CSS/JS (à ajouter via un build tool).
    - Pas de CLS (Cumulative Layout Shift).
- **Sitemap** : À générer manuellement pour le MVP (ex: `sitemap.xml`).
- **Robots.txt** : Autoriser l'indexation.
- **Structured Data** : Ajouter JSON-LD pour les programmes (ex: `Course`, `FAQPage`).

## SEO Contenu
### Mots-clés principaux
| Mot-clé                     | Volume estimé | Difficulté | Pages ciblées               |
|-----------------------------|---------------|------------|-----------------------------|
| "programme sportif débutant" | 10 000/mois   | Moyenne    | `/`, `/programs`            |
| "coaching personnalisé maison" | 5 000/mois    | Moyenne    | `/`, `/quiz`                |
| "salle de sport programme" | 8 000/mois    | Élevée     | `/programs`, `/blog`        |

### Mots-clés secondaires / Longue traîne
| Mot-clé                     | Intention de recherche       | Page ciblée               |
| "programme musculation sans matériel" | Informationnelle | `/programs` |
| "combien de séances par semaine" | Informationnelle | `/blog`    |
| "meilleur programme fitness débutant" | Commerciale     | `/`        |

## SEO Structure (par page)
| Page               | H1                                      | Meta Title (≤60 car.)                     | Meta Description (≤160 car.)                          |
|--------------------|------------------------------------------|--------------------------------------------|--------------------------------------------------------|
| `/`                | Avec le bon programme, votre objectif physique est à votre portée. | MonProgrammeFit — Coaching Sportif Personnalisé | Des programmes sur mesure pour débutants, avec ou sans matériel. |
| `/programs`        | Nos programmes                           | Programmes Sportifs Personnalisés — MonProgrammeFit | Découvrez nos programmes adaptés à votre niveau et environnement. |
| `/quiz`            | Quel est votre point de départ ?         | Quiz Sportif — Trouvez Votre Programme | Répondez à 3 questions pour obtenir un programme 100% adapté. |

## Open Graph & Twitter Cards
| Propriété          | Valeur                                                                 |
|--------------------|-----------------------------------------------------------------------|
| `og:title`         | MonProgrammeFit — Coaching Sportif Personnalisé                       |
| `og:description`   | Des programmes sur mesure pour votre transformation physique.        |
| `og:image`         | `https://monprogrammefit.com/og-image.jpg` (à créer)                 |
| `og:url`           | `https://monprogrammefit.com`                                         |
| `twitter:card`     | `summary_large_image`                                                 |

## Stratégie Long Terme
- **3 mois** :
  - Publier 4 articles de blog (ex: "Comment choisir son programme sportif ?").
  - Obtenir 10 backlinks (partenariats avec des blogs fitness).
- **6 mois** :
  - Intégrer un blog avec CMS (ex: Strapi).
  - Ajouter des témoignages clients (rich snippets).
- **12 mois** :
  - Cibler des mots-clés compétitifs (ex: "meilleur coaching sportif").