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
import { doc, getDoc } from "firebase/firestore";
import { state } from "./js/state.js";

setRenderer(render);

restorePersistedState(Object.keys(PAGES));
window.addEventListener("popstate", handleBackNavigation);
window.addEventListener("pageshow", () => {
  persistState();
});

// Écouteur d'état d'authentification Firebase (restauration automatique de la session)
// Explication : Firebase gère la persistance des jetons d'accès. Firestore fournit le rôle ("client" ou "admin").
onAuthStateChanged(auth, async (user) => {
  if (user) {
    try {
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        state.role = userData.role || "client";
        state.clientProfile = {
          ...state.clientProfile,
          ...userData,
          email: user.email,
          uid: user.uid,
        };
      } else {
        state.role = "client";
        state.clientProfile = {
          ...state.clientProfile,
          email: user.email,
          uid: user.uid,
        };
      }
    } catch (error) {
      console.warn("Impossible d'obtenir les données du rôle Firestore:", error);
      state.role = "client";
    }
  } else {
    state.role = "guest";
    state.clientProfile = {};
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
