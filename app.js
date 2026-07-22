/* ==========================================================
   app.js — Point d'entrée. Charge tous les modules et démarre l'app.
   Nécessite <script type="module" src="app.js"> dans index.html.
   ========================================================== */

import { restorePersistedState, persistState } from "./js/state.js";
import { setRenderer, handleBackNavigation } from "./js/router.js";
import { render } from "./js/render.js";
import { PAGES } from "./js/pages/index.js";
import "./js/events.js"; // enregistre les écouteurs globaux (input/click)
import {
  cleanupExpiredData,
  hasAnalyticsServices,
  getAnalyticsConsent,
} from "./js/modules/privacy.js";
import { renderConsentModal } from "./js/modules/consent-modal.js";

import { auth, db } from "./js/firebase.js";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, collection, getDocs, query, where } from "firebase/firestore";
import { state } from "./js/state.js";

setRenderer(render);

restorePersistedState(Object.keys(PAGES));
window.addEventListener("popstate", handleBackNavigation);
window.addEventListener("pageshow", () => {
  persistState();
});

/**
 * Charge les données Firestore réelles pour le panneau administrateur.
 * Explication : Récupère la liste des clients et des messages pour alimenter les KPIs.
 */
export async function refreshAdminData() {
  if (state.role !== "admin") return;
  state.adminData.loading = true;
  try {
    // 1. Tous les utilisateurs ayant le rôle "client"
    const clientsQuery = query(collection(db, "users"), where("role", "==", "client"));
    const clientsSnap = await getDocs(clientsQuery);
    const clients = [];
    clientsSnap.forEach((docSnap) => {
      clients.push({ id: docSnap.id, ...docSnap.data() });
    });

    // 2. Tous les messages de contact envoyés par les clients/visiteurs
    const messagesSnap = await getDocs(collection(db, "messages"));
    const messages = [];
    messagesSnap.forEach((docSnap) => {
      messages.push({ id: docSnap.id, ...docSnap.data() });
    });

    // Tri chronologique inverse (plus récents en premier)
    messages.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    state.adminData.clients = clients;
    state.adminData.messages = messages;
    state.adminData.loaded = true;
    state.adminData.loading = false;
  } catch (err) {
    console.error("Erreur de chargement des données admin Firestore:", err);
    state.adminData.loading = false;
  }
}

// Écouteur d'état d'authentification Firebase (restauration automatique de la session)
onAuthStateChanged(auth, async (user) => {
  if (user) {
    try {
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      let userData = {};
      if (userDocSnap.exists()) {
        userData = userDocSnap.data();
      }

      state.role = userData.role || "client";

      // Récupération des séances réelles depuis la sous-collection users/{uid}/sessions
      const sessionsSnap = await getDocs(collection(db, "users", user.uid, "sessions"));
      const sessions = [];
      sessionsSnap.forEach((sDoc) => {
        sessions.push({ id: sDoc.id, ...sDoc.data() });
      });

      const program = userData.program || {};
      if (sessions.length > 0) {
        program.sessions = sessions;
      }

      state.clientProfile = {
        ...state.clientProfile,
        ...userData,
        email: user.email,
        uid: user.uid,
        program
      };

      if (state.role === "admin") {
        await refreshAdminData();
      }
    } catch (error) {
      console.warn("Impossible d'obtenir les données Firestore:", error);
      state.role = "client";
    }
  } else {
    state.role = "guest";
    state.clientProfile = {};
    state.adminData = { clients: [], messages: [], loaded: false, loading: false };
    if (state.page.startsWith("client") || state.page.startsWith("admin")) {
      state.page = "home";
    }
  }
  render();
});

// 1. Nettoyage automatique des données expirées (14 jours)
cleanupExpiredData();

// 2. Rendu initial
render();

// 3. Bannière de consentement analytics (si services présents et pas encore choisi)
(function initConsentBanner() {
  const consent = getAnalyticsConsent();
  if (hasAnalyticsServices() && !consent.userChoice) {
    const container = document.createElement("div");
    container.innerHTML = renderConsentModal();
    const modal = container.firstElementChild;
    if (modal) {
      document.body.appendChild(modal);
    }
  }
})();
