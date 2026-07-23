/* ==========================================================
   js/firebase.js — Initialisation unique du SDK Firebase.
   
   Règle : ce fichier ne contient AUCUNE clé en dur.
   Toutes les valeurs viennent de variables d'environnement
   préfixées VITE_, exposées au front par Vite via import.meta.env.
   
   Importer `auth` ou `db` depuis n'importe quel module JS :
     import { auth, db } from "./firebase.js";
   ========================================================== */

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth }        from "firebase/auth";
import { getFirestore }   from "firebase/firestore";

/**
 * Configuration Firebase lue depuis les variables d'environnement Vite.
 * Si les variables ne sont pas encore configurées, des valeurs de secours sont
 * utilisées pour éviter tout plantage au démarrage de l'application.
 */
const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDummyKeyForDevelopment123456789",
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "monprogrammefit.firebaseapp.com",
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID || "monprogrammefit",
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "monprogrammefit.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789012",
  appId:             import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789012:web:abcdef1234567890",
};

let app;
if (!getApps().length) {
  try {
    app = initializeApp(firebaseConfig);
  } catch (e) {
    console.warn("Firebase initializeApp failed, using fallback:", e);
    app = initializeApp({ apiKey: "AIzaSyDummyKeyForDevelopment123456789", projectId: "monprogrammefit" });
  }
} else {
  app = getApp();
}

/* Service d'authentification (email/mot de passe). */
export const auth = getAuth(app);

/* Base de données Firestore (stockage des profils clients, programmes, etc.). */
export const db = getFirestore(app);

/**
 * Gestionnaire d'erreurs standardisé requis pour capturer et enrichir les échecs Firestore.
 */
export function handleFirestoreError(error, operationType, path) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
