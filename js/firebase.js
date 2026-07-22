/* ==========================================================
   js/firebase.js — Initialisation unique du SDK Firebase.
   
   Règle : ce fichier ne contient AUCUNE clé en dur.
   Toutes les valeurs viennent de variables d'environnement
   préfixées VITE_, exposées au front par Vite via import.meta.env.
   
   Importer `auth` ou `db` depuis n'importe quel module JS :
     import { auth, db } from "./firebase.js";
   ========================================================== */

import { initializeApp } from "firebase/app";
import { getAuth }        from "firebase/auth";
import { getFirestore }   from "firebase/firestore";

/**
 * Configuration Firebase lue depuis les variables d'environnement Vite.
 * Vite remplace import.meta.env.VITE_* à la compilation — aucun secret
 * n'est jamais écrit dans le code source.
 */
const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
};

/* Initialise l'app Firebase (singleton — appelé une seule fois). */
const app = initializeApp(firebaseConfig);

/* Service d'authentification (email/mot de passe). */
export const auth = getAuth(app);

/* Base de données Firestore (stockage des profils clients, programmes, etc.). */
export const db = getFirestore(app);
