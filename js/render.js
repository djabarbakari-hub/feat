/* ==========================================================
   render.js — Rendu principal : navbar + page courante + footer.
   ========================================================== */

import { state } from "./state.js";
import { renderNavbar, renderFooter } from "./navbar.js";
import { PAGES } from "./pages/index.js";
import { renderNotFound } from "./pages/guest.js";
import { createIcons, icons } from "lucide";
import { updateTimerUI } from "./modules/workoutTimer.js";
import { WHATSAPP_ICON } from "./assets.js";

export function render() {
  const navContainer = document.getElementById("app");
  const main = document.getElementById("main-content");
  const footerContainer = document.getElementById("appFooter");
  const whatsappContainer = document.getElementById("whatsapp-float-root");
  const pageFn = PAGES[state.page] || renderNotFound;
  
  if (navContainer) navContainer.innerHTML = renderNavbar();
  
  let pageHtml = pageFn();
  if (state.simulationActive) {
    const bannerHtml = `
      <div id="simulation-banner" style="background: var(--ember, #e04632); color: white; padding: 12px 16px; font-size: 13px; font-weight: bold; display: flex; justify-content: space-between; align-items: center; z-index: 100000; position: sticky; top: 0; box-shadow: 0 4px 12px rgba(0,0,0,0.15); font-family: inherit;">
        <span style="display: flex; align-items: center; gap: 8px;">
          <span>🚨</span>
          <span><strong>MODE APERÇU ADMIN :</strong> Vous simulez l'espace de l'athlète <strong>${state.clientProfile?.firstName || "Test Account"}</strong> pour prévisualiser l'interface client.</span>
        </span>
        <button id="btn-exit-simulation" style="background: white; color: var(--ember, #e04632); border: 1px solid white; padding: 6px 12px; font-size: 11px; font-weight: 800; border-radius: 4px; cursor: pointer; transition: all 0.2s; text-transform: uppercase;">
          Quitter l'Aperçu
        </button>
      </div>
    `;
    pageHtml = bannerHtml + pageHtml;
  }
  
  if (main) main.innerHTML = pageHtml;
  if (footerContainer) footerContainer.innerHTML = renderFooter();
  
  // Rendre l'icône WhatsApp toujours visible au niveau de la racine
  if (whatsappContainer && !whatsappContainer.innerHTML) {
    whatsappContainer.innerHTML = `
      <a href="https://wa.me/2290191720596" class="whatsapp-float" target="_blank" rel="noopener noreferrer" aria-label="Contacter sur WhatsApp" style="z-index: 999999;">
        <img src="${WHATSAPP_ICON}" alt="WhatsApp" style="width:100%;height:100%;object-fit:cover;border-radius:50%;transform:scale(1.4);" onerror="this.onerror=null;this.src='/images/icone-whatsapp.png';" />
      </a>
    `;
  }
  
  // Synchroniser le chronomètre d'entraînement si présent dans le DOM
  if (document.getElementById("workout-timer")) {
    updateTimerUI();
  }
  
  createIcons({ icons });
}

