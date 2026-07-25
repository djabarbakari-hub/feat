# DEPLOYMENT GUIDE — MonProgrammeFit
Corrigé le : 2026-07-25 (voir note en bas de fichier)
Stack : Vite / Vanilla JS
Plateforme(s) : Vercel (Frontend), Firebase (Backend/Firestore)

---

## 1. PRÉREQUIS
- Node.js (v20+)
- npm
- Firebase CLI (installé globalement, optionnel — voir alternative sans CLI plus bas) : `npm install -g firebase-tools`
- Compte Vercel configuré

## 2. VARIABLES D'ENVIRONNEMENT
Le fichier `.env` (non commité dans Git) doit contenir les 6 clés Firebase. Voir `docs/environment_variables.md` pour la liste exacte et `.env.example` pour le format attendu.

## 3. BUILD DE PRODUCTION
```bash
npm run build
```
Le dossier de sortie est `dist/`.

## 4. FICHIER DE CONFIGURATION VERCEL

Contenu réel de `vercel.json` (à ne pas remplacer par une version simplifiée — la règle de réécriture exclut volontairement `assets/`, `images/` et les fichiers avec extension, pour ne pas casser le chargement des ressources statiques) :
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/((?!assets|images|.*\\.[a-zA-Z0-9]+$).*)",
      "destination": "/index.html"
    }
  ]
}
```

## 5. DÉPLOIEMENT

### Frontend (Vercel)
Le déploiement se fait automatiquement à chaque `git push` sur la branche connectée à Vercel — aucune commande manuelle n'est nécessaire dans l'usage courant. Pour un déploiement manuel ponctuel (rare) :
```bash
vercel --prod
```

### Règles Firestore
**Option sans terminal (recommandée) :** Console Firebase → Firestore Database → onglet Règles → coller le contenu de `firestore.rules` → Publier.

**Option CLI :**
```bash
firebase deploy --only firestore:rules
```

## 6. DOMAINE ET AUTHENTIFICATION

- **Vercel** : configurer le domaine dans Project Settings → Domains. Le SSL est automatique.
- **Firebase Authentication — étape à ne pas oublier :** ajouter le domaine Vercel final (et tout domaine personnalisé) dans Console Firebase → Authentication → Settings → Domaines autorisés. **Sans cette étape, la connexion peut fonctionner en local mais échouer silencieusement une fois le site en ligne** — c'est l'erreur de déploiement la plus fréquente sur ce type de projet et elle n'affiche aucun message clair pour la diagnostiquer.

## 7. SEO
- Vérifier la présence de `robots.txt` et `sitemap.xml` dans le dossier `public/`, s'ils sont jugés nécessaires pour le référencement.
- Vérifier que les balises `<title>` et `<meta description>` sont définies dans `index.html`.

## 8. PWA (Progressive Web App)
**État actuel : non implémenté.** Aucun fichier `manifest.json` ni service worker n'est présent dans le projet à ce jour. Cette section reste comme aide-mémoire pour une évolution future, pas comme description de l'existant — à activer uniquement si cette fonctionnalité est explicitement souhaitée.

## 9. ANALYTICS
- Si un outil d'analytics est ajouté un jour, ses clés doivent être configurées via des variables d'environnement, jamais écrites en dur dans le code source.

## 10. MONITORING
- Aucun outil de monitoring (Sentry ou équivalent) n'est configuré à ce jour. À évaluer selon le besoin une fois le trafic réel observé.

## 11. SAUVEGARDES
- Firebase gère automatiquement la disponibilité de Firestore ; pour une sauvegarde exportable indépendante, voir la fonctionnalité d'export planifié de Firestore (à activer manuellement dans la console si souhaité, non configurée actuellement).

## 12. CI/CD
**État actuel : non configuré.** Aucun dossier `.github/workflows/` n'existe dans le projet — le déploiement repose entièrement sur l'intégration automatique Vercel ↔ GitHub (section 5), ce qui est suffisant pour l'usage actuel. Une automatisation GitHub Actions plus poussée (tests automatiques avant déploiement, par exemple) resterait à mettre en place si le besoin s'en fait sentir.

## 13. ROLLBACK
- **Vercel** : onglet "Deployments" du dashboard → sélectionner une version précédente → "Promote to Production".

## 14. CHECKLIST FINALE AVANT MISE EN LIGNE
- [ ] Build local (`npm run build`) réussi sans erreur.
- [ ] `.env` jamais commité (vérifier `git status`).
- [ ] Variables d'environnement configurées sur Vercel (Production **et** Preview).
- [ ] Règles Firestore publiées dans la console (pas seulement présentes dans le dossier).
- [ ] Domaine Vercel ajouté dans Firebase → Authentication → Domaines autorisés.
- [ ] Test réel d'inscription/connexion effectué sur le site en ligne, pas seulement en local.

---

**Note sur cette correction (2026-07-25) :** la version précédente de ce document contenait une règle `vercel.json` simplifiée ne correspondant pas au fichier réel du projet, ne mentionnait pas l'étape des domaines autorisés Firebase (cause fréquente d'échec silencieux de connexion en production), et présentait les sections PWA et CI/CD comme si ces fonctionnalités existaient déjà alors qu'aucun fichier correspondant n'est présent dans le projet. Corrections faites après vérification directe du code et de la configuration réels.
