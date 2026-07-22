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

setRenderer(render);

restorePersistedState(Object.keys(PAGES));
window.addEventListener("popstate", handleBackNavigation);
window.addEventListener("pageshow", () => {
  persistState();
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
