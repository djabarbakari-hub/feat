/* ==========================================================
   render.js — Rendu principal : navbar + page courante + footer.
   ========================================================== */

import { state } from "./state.js";
import { renderNavbar, renderFooter } from "./navbar.js";
import { PAGES } from "./pages/index.js";
import { renderNotFound } from "./pages/guest.js";

export function render() {
  const navContainer = document.getElementById("app");
  const main = document.getElementById("main-content");
  const footerContainer = document.getElementById("appFooter");
  const pageFn = PAGES[state.page] || renderNotFound;
  if (navContainer) navContainer.innerHTML = renderNavbar();
  if (main) main.innerHTML = pageFn();
  if (footerContainer) footerContainer.innerHTML = renderFooter();
  if (window.lucide) window.lucide.createIcons();
}
