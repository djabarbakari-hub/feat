/* ==========================================================
   router.js — Navigation entre pages, historique navigateur.
   ========================================================== */

import { state, persistState } from "./state.js";
import { showToast, closeMobileMenu } from "./helpers.js";

// Assigné depuis main.js pour éviter une dépendance circulaire avec render.js
let renderFn = () => {};
export function setRenderer(fn) {
  renderFn = fn;
}

export function updateBrowserHistory(page, { replace = false } = {}) {
  const base = window.location.pathname + window.location.search;
  const hash = page === "home" ? "" : `#${page}`;
  const url = `${base}${hash}`;
  if (replace) {
    window.history.replaceState({ page }, "", url);
  } else {
    window.history.pushState({ page }, "", url);
  }
}

/**
 * Navigue vers une page et déclenche un rendu.
 * @param {string} page - Nom de la page (ex: "home", "programs").
 */
export function navigate(page, { replace = false } = {}) {
  if (!replace && state.page && state.page !== page) {
    state.history.push(state.page);
  }
  state.page = page;
  state.backExitAttempted = false;
  persistState();
  updateBrowserHistory(page, { replace });
  renderFn();
  window.scrollTo({ top: 0, behavior: "smooth" });

  // Réinitialiser le quiz si on retourne à l'accueil
  if (page === "home") {
    state.quizStep = 0;
    state.quizAnswers = {};
  }
}

export function goBack() {
  if (state.history.length > 0) {
    const previous = state.history.pop();
    state.page = previous || "home";
    state.backExitAttempted = false;
    persistState();
    updateBrowserHistory(state.page, { replace: true });
    renderFn();
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }
  state.backExitAttempted = false;
  navigate("home", { replace: true });
}

export function handleBackNavigation() {
  const navMobile = document.getElementById("navMobile");
  if (navMobile && navMobile.classList.contains("open-mobile")) {
    closeMobileMenu();
    return;
  }

  if (state.history.length > 0) {
    goBack();
    return;
  }

  if (!state.backExitAttempted) {
    state.backExitAttempted = true;
    showToast("Appuyez à nouveau pour revenir à l'accueil");
    if (state.backNoticeTimer) window.clearTimeout(state.backNoticeTimer);
    state.backNoticeTimer = window.setTimeout(() => {
      state.backExitAttempted = false;
    }, 1800);
    updateBrowserHistory(state.page, { replace: true });
    return;
  }

  state.backExitAttempted = false;
  navigate("home", { replace: true });
}
