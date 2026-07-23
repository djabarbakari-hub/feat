/* ==========================================================
   render.js — Rendu principal : navbar + page courante + footer.
   ========================================================== */

import { state } from "./state.js";
import { renderNavbar, renderFooter } from "./navbar.js";
import { PAGES } from "./pages/index.js";
import { renderNotFound } from "./pages/guest.js";
import { createIcons, icons } from "lucide";

let stopwatchInterval = null;

function speakWorkoutTime(totalSeconds) {
  if (totalSeconds <= 0 || totalSeconds % 10 !== 0) return;

  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;

  let phrase = "";
  if (mins > 0) {
    if (mins === 1) {
      phrase += "1 minute";
    } else {
      phrase += `${mins} minutes`;
    }

    if (secs > 0) {
      phrase += ` ${secs}`;
    }
  } else {
    phrase += `${secs}`;
  }

  if ('speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(phrase);
      utterance.lang = "fr-FR";
      utterance.rate = 1.1; // Légèrement plus dynamique pour l'effort
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("SpeechSynthesis error:", e);
    }
  }
}

function startWorkoutStopwatch() {
  if (stopwatchInterval) return;
  stopwatchInterval = setInterval(() => {
    const el = document.getElementById("workout-timer");
    if (el) {
      state.activeSessionSeconds = (state.activeSessionSeconds || 0) + 1;
      const mins = Math.floor(state.activeSessionSeconds / 60).toString().padStart(2, '0');
      const secs = (state.activeSessionSeconds % 60).toString().padStart(2, '0');
      el.textContent = `${mins}:${secs}`;
      
      // Notification vocale toutes les 10 secondes
      speakWorkoutTime(state.activeSessionSeconds);
    } else {
      stopWorkoutStopwatch();
    }
  }, 1000);
}

function stopWorkoutStopwatch() {
  if (stopwatchInterval) {
    clearInterval(stopwatchInterval);
    stopwatchInterval = null;
  }
}

export function render() {
  const navContainer = document.getElementById("app");
  const main = document.getElementById("main-content");
  const footerContainer = document.getElementById("appFooter");
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
  
  // Gérer le chronomètre de séance d'entraînement si présent dans le DOM
  if (document.getElementById("workout-timer")) {
    startWorkoutStopwatch();
  } else {
    stopWorkoutStopwatch();
  }
  
  createIcons({ icons });
}
