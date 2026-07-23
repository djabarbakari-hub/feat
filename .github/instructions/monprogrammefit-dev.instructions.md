# monprogrammefit-dev.instructions.md

## Objectif
Ce fichier formalise les règles de comportement du robot d'agent pour le projet MonProgrammeFit. Il doit être utilisé comme guide principal chaque fois qu'une tâche de développement, d'audit, ou de documentation est demandée dans ce workspace.

## Contexte projet
- Application frontend vanilla JS en migration vers Vite + Firebase.
- Architecture modulaire simple, sans framework : `index.html`, `app.js`, `js/`, `css/`.
- `css/tokens.css` est la source unique de vérité pour les couleurs et les polices.
- `js/events.js` gère la logique des interactions pour tous les attributs `data-*`.
- `js/helpers.js` fournit utilitaires critiques comme `escapeHtml()`.

## Principes généraux
- Toujours respecter le contenu de `.github/agents/monprogrammefit-dev.md` et `code/Agents_Commentaire_Code.md`.
- Ne jamais inventer de données business réelles : prix, valeurs monétaires, comptes, clés API.
- Ne jamais committer ou suggérer des secrets dans le code.
- Toujours échapper les entrées utilisateur avant injection HTML.
- Ne jamais laisser de `console.log` de debug dans le code livré.
- Si le contexte est insuffisant pour prendre une décision, poser une question claire plutôt que deviner.

## Règles de code
- Si une nouvelle interaction est ajoutée au markup, ajouter le gestionnaire correspondant dans `js/events.js`.
- Si une nouvelle variable CSS est utilisée, définir sa custom property dans `css/tokens.css` avant de l'utiliser.
- Vérifier que chaque import correspond à un export réel du module ciblé.
- Respecter les règles d'architecture : nouveaux composants page dans `js/pages/`, enregistrement dans `js/pages/index.js`.

## Règles de documentation et de commentaire
- Pour tout travail de documentation de code, appliquer la logique de `Agents_Commentaire_Code.md` : commenter le pourquoi, pas le quoi.
- Si un champ obligatoire manque dans la demande de documentation, signaler le manque et demander la clarification.
- Utiliser le français pour les commentaires et explications de code.

## Sécurité et cohérence
- Ne jamais supposer que Firebase est déjà initialisé sans confirmation explicite.
- Avant de livrer une modification CSS, s'assurer qu'aucune `var(--x)` n'est orpheline.
- Ne pas réintroduire des polices ou palettes verrouillées interdites par la charte existante.
- Les animations doivent avoir un rôle fonctionnel clair, pas uniquement décoratif.

## Comportement de réponse
- Être direct et honnête sur les limites du contexte.
- Si l'on est incertain, indiquer ce qui manque pour trancher.
- Ne pas donner de faux résultats ou affirmer qu'une modification est prête si elle ne l'est pas.

## Exemples de prompts adaptés
- "Ajoute le mot de passe oublié au formulaire de connexion en respectant la structure existante."  
- "Documente cette fonction JS en suivant le protocole de `code/Agents_Commentaire_Code.md`."  
- "Vérifie que ce nouveau composant page n'introduit pas de variables CSS non définies."

## Fichier de référence
- `code/Agents_Commentaire_Code.md` pour la documentation du code.
- `.github/agents/monprogrammefit-dev.md` pour l'architecture globale et les contraintes.
- `code/AGENTS.md` pour la gouvernance des agents du projet.
