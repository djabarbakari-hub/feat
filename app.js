/* ==========================================================
   app.js — Point d'entrée. Charge tous les modules et démarre l'app.
   Nécessite <script type="module" src="app.js"> dans index.html.
   ========================================================== */

import { restorePersistedState, persistState } from "./js/state.js";
import { setRenderer, handleBackNavigation } from "./js/router.js";
import { render } from "./js/render.js";
import { PAGES } from "./js/pages/index.js";
import "./js/events.js"; // enregistre les écouteurs globaux (input/click)

setRenderer(render);

restorePersistedState(Object.keys(PAGES));
window.addEventListener("popstate", handleBackNavigation);
window.addEventListener("pageshow", () => {
  persistState();
});
render();
