# Variables d'Environnement — MonProgrammeFit

## Registre

Ces 6 variables sont lues directement dans `js/firebase.js`. Les 6 sont obligatoires : si l'une d'elles est absente, mal orthographiée, ou sans le préfixe `VITE_`, le code bascule silencieusement sur des valeurs factices de secours (voir `js/firebase.js`, constante `firebaseConfig`) — le site peut alors sembler fonctionner sans qu'aucune inscription ni connexion ne soit réellement enregistrée.

| Variable | Description | Obligatoire ? |
|----------|-------------|---------------|
| `VITE_FIREBASE_API_KEY` | Clé API Firebase | ✅ Oui |
| `VITE_FIREBASE_AUTH_DOMAIN` | Domaine d'authentification Firebase | ✅ Oui |
| `VITE_FIREBASE_PROJECT_ID` | ID du projet Firebase | ✅ Oui |
| `VITE_FIREBASE_STORAGE_BUCKET` | Bucket de stockage Firebase | ✅ Oui |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | ID de l'expéditeur Firebase Cloud Messaging | ✅ Oui |
| `VITE_FIREBASE_APP_ID` | ID de l'application Firebase | ✅ Oui |

**Important :** le préfixe `VITE_` n'est pas optionnel. Vite n'expose au code frontend que les variables préfixées ainsi (`import.meta.env.VITE_...`) ; toute variable sans ce préfixe est invisible pour le code, même si elle existe dans `.env`.

## Fichier `.env.example`

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

## Configuration

1. Créer un fichier `.env` à la racine du projet (jamais dans un sous-dossier).
2. Renseigner les 6 variables ci-dessus avec les valeurs du projet Firebase (Console Firebase → Paramètres du projet → Vos applications → configuration de l'app Web).
3. Ne jamais commiter le fichier `.env` (déjà exclu via `.gitignore`).
4. Sur Vercel : renseigner les mêmes 6 variables dans Project Settings → Environment Variables (scope Production **et** Preview).

## Variables non utilisées actuellement

Les intégrations suivantes sont évoquées ailleurs dans le projet (page tarifs, roadmap) mais **ne sont pas implémentées dans le code à ce jour** — aucune variable d'environnement les concernant n'est nécessaire pour l'instant :

- FedaPay (paiement en ligne) — non intégré. Le circuit de souscription actuel passe par WhatsApp.
- SendGrid / notifications par e-mail — non intégré.

Si l'une de ces intégrations est ajoutée plus tard, ce document devra être mis à jour avec les variables réellement utilisées par le code à ce moment-là — pas avant.
