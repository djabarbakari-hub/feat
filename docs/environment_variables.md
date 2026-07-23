# Variables d'Environnement — MonProgrammeFit

## Registre
| Variable | Description | Obligatoire ? |
|----------|-------------|---------------|
| `VITE_FIREBASE_API_KEY` | Clé API Firebase | ✅ Oui |
| `VITE_FIREBASE_AUTH_DOMAIN` | Domaine d'authentification Firebase | ✅ Oui |
| `VITE_FIREBASE_PROJECT_ID` | ID du projet Firebase | ✅ Oui |

## Fichier `.env.example`
```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
```

## FedaPay
| Variable               | Description                          | Exemple de Valeur | Obligatoire |
|------------------------|--------------------------------------|-------------------|-------------|
| `FEDAPAY_API_KEY`      | Clé API FedaPay.                     | `sk_live_...`     | Oui         |
| `FEDAPAY_ENV`          | Environnement (sandbox/live).        | `sandbox`         | Oui         |
---

## Configuration
1. Créer un fichier `.env` à la racine du projet.
2. Ajouter les variables ci-dessus avec leurs valeurs.
3. Ne jamais commiter le fichier `.env` (ajouté à `.gitignore`).

---

## Exemple de Fichier `.env`
```env
# Firebase
FIREBASE_API_KEY=AIzaSy...
FIREBASE_AUTH_DOMAIN=monprogrammefit.firebaseapp.com
FIREBASE_PROJECT_ID=monprogrammefit

# FedaPay
FEDAPAY_API_KEY=sk_live_...
FEDAPAY_ENV=sandbox

# SendGrid
SENDGRID_API_KEY=SG.xxx
```