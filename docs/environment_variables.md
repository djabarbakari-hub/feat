# Variables d'Environnement — MonProgrammeFit

## Variables Actuelles
Aucune variable d'environnement n'est requise pour le MVP. Les futures intégrations (Firebase, FedaPay) nécessiteront les variables suivantes :

---

## Firebase
| Variable                  | Description                          | Exemple de Valeur               | Obligatoire |
|---------------------------|--------------------------------------|----------------------------------|-------------|
| `FIREBASE_API_KEY`        | Clé API Firebase.                    | `AIzaSy...`                      | Oui         |
| `FIREBASE_AUTH_DOMAIN`    | Domaine d'authentification Firebase. | `monprogrammefit.firebaseapp.com`| Oui         |
| `FIREBASE_PROJECT_ID`     | ID du projet Firebase.               | `monprogrammefit`                | Oui         |
| `FIREBASE_STORAGE_BUCKET` | Bucket de stockage Firebase.         | `monprogrammefit.appspot.com`    | Non         |
| `FIREBASE_MESSAGING_ID`   | ID de messagerie Firebase.           | `1234567890`                     | Non         |
| `FIREBASE_APP_ID`         | ID de l'application Firebase.        | `1:1234567890:web:abcdef`        | Non         |

---

## FedaPay
| Variable               | Description                          | Exemple de Valeur | Obligatoire |
|------------------------|--------------------------------------|-------------------|-------------|
| `FEDAPAY_API_KEY`      | Clé API FedaPay.                     | `sk_live_...`     | Oui         |
| `FEDAPAY_ENV`          | Environnement (sandbox/live).        | `sandbox`         | Oui         |

---

## SendGrid (Notifications Email)
| Variable               | Description                          | Exemple de Valeur | Obligatoire |
|------------------------|--------------------------------------|-------------------|-------------|
| `SENDGRID_API_KEY`     | Clé API SendGrid.                    | `SG.xxx`          | Oui         |

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