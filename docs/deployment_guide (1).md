# DEPLOYMENT GUIDE — MonProgrammeFit
Généré le : 2026-07-24
Stack : Vite / Vanilla JS
Plateforme(s) : Vercel (Frontend), Firebase (Backend/Firestore)

---

## 1. PRÉREQUIS
- Node.js (v20+)
- npm
- Firebase CLI (installé globalement) : `npm install -g firebase-tools`
- Compte Vercel configuré

## 2. VARIABLES D'ENVIRONNEMENT
Assurez-vous que votre fichier `.env` (non commité dans Git) contient les clés nécessaires. Référez-vous à `.env.example` pour les noms des clés attendues.

## 3. BUILD DE PRODUCTION
```bash
npm run build
```
Le dossier de sortie est `dist/`.

## 4. FICHIERS DE CONFIGURATION
Votre fichier `vercel.json` est configuré pour gérer le routage de votre SPA :
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

## 5. DÉPLOIEMENT

### Frontend (Vercel)
Pour déployer le frontend :
```bash
vercel --prod
```

### Règles Firestore
Pour déployer vos règles de sécurité Firestore :
```bash
firebase deploy --only firestore:rules
```

## 6. DOMAINE ET HTTPS
- **Vercel** : Configurez votre domaine dans le tableau de bord Vercel (Project Settings > Domains). SSL est automatique.
- **Firebase** : Aucune configuration spécifique requise pour les règles.

## 7. SEO
- Vérifiez la présence de `robots.txt` et `sitemap.xml` dans le dossier `public/`.
- Assurez-vous que les balises `<title>` et `<meta description>` sont correctement définies dans votre `index.html`.

## 8. PWA
- Votre projet semble structuré pour être une PWA. Vérifiez la présence et la validité du fichier `manifest.json` et de l'enregistrement du service worker dans votre code.

## 9. ANALYTICS
- Configurez vos clés dans les variables d'environnement de la plateforme de déploiement (jamais dans le code source).

## 10. MONITORING
- Configurez Sentry ou un outil équivalent si nécessaire via les variables d'environnement.

## 11. SAUVEGARDES
- Firebase gère automatiquement les sauvegardes de Firestore.

## 12. CI/CD GITHUB ACTIONS
Un fichier `.github/workflows/` devrait être présent si vous utilisez l'automatisation. Assurez-vous que les secrets nécessaires (`VERCEL_TOKEN`, etc.) sont configurés sur GitHub.

## 13. ROLLBACK
- **Vercel** : Utilisez l'onglet "Deployments" du dashboard Vercel pour promouvoir une version précédente en production.

## 14. CHECKLIST FINALE
- [ ] Build local (`npm run build`) réussi sans erreur.
- [ ] Variables d'environnement configurées sur Vercel et Firebase.
- [ ] Règles Firestore testées localement.
- [ ] Domaine et SSL actifs.
