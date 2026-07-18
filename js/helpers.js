/* ==========================================================
   helpers.js — Fonctions utilitaires partagées.
   ========================================================== */

import { TRACKS, QUIZ_STEPS } from "./data.js";
import { state } from "./state.js";

/**
 * Génère une icône Lucide dynamique.
 * @param {string} name - Nom de l'icône (ex: "dumbbell").
 * @param {number} [size=16] - Taille de l'icône en pixels.
 * @param {string} [color] - Couleur de l'icône (ex: "var(--ember)").
 * @returns {string} HTML de l'icône.
 */
export const icon = (name, size = 16, color) =>
  `<i data-lucide="${name}" style="width:${size}px;height:${size}px${color ? `;color:${color}` : ""}"></i>`;

/**
 * Récupère un programme par son ID.
 * @param {string} id - ID du programme (ex: "gym").
 * @returns {Object} Objet programme correspondant ou le programme par défaut.
 */
export const trackById = (id) => TRACKS.find((t) => t.id === id) || TRACKS[2];

/**
 * Vérifie si le quiz est complet.
 * @returns {boolean} True si toutes les réponses obligatoires du quiz sont remplies.
 */
export function isQuizComplete() {
  // Les étapes obligatoires sont toutes sauf "physique" (optionnelle)
  const requiredSteps = QUIZ_STEPS.filter(step => step.key !== "physique");
  return requiredSteps.every((step) => !!state.quizAnswers[step.key]);
}

/**
 * Échappe une valeur avant de l'injecter dans du HTML (attribut ou contenu texte).
 * CORRECTIF SÉCURITÉ : toute valeur saisie par l'utilisateur (nom, email, message,
 * champs du quiz) doit passer par cette fonction avant d'être interpolée dans un
 * template. Sans ça, un guillemet ou une balise tapée par l'utilisateur casse
 * l'attribut HTML ou injecte du contenu arbitraire dans la page (d'autant plus
 * grave ici que ces valeurs sont aussi persistées dans localStorage et
 * ré-affichées à chaque rendu).
 * @param {*} value
 * @returns {string}
 */
export function escapeHtml(value) {
  if (value === null || value === undefined) return "";
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

/**
 * Affiche un toast temporaire (message flottant).
 * @param {string} message
 */
export function showToast(message) {
  const existing = document.getElementById("app-toast");
  if (existing) existing.remove();
  const toast = document.createElement("div");
  toast.id = "app-toast";
  toast.setAttribute("role", "status");
  toast.setAttribute("aria-live", "polite");
  toast.textContent = message; // textContent : pas de risque d'injection ici
  toast.style.position = "fixed";
  toast.style.left = "50%";
  toast.style.bottom = "max(18px, env(safe-area-inset-bottom))";
  toast.style.transform = "translateX(-50%)";
  toast.style.background = "rgba(15, 26, 20, 0.96)";
  toast.style.color = "#F8F5EB";
  toast.style.padding = "12px 16px";
  toast.style.borderRadius = "999px";
  toast.style.zIndex = "120";
  toast.style.boxShadow = "0 10px 28px rgba(0, 0, 0, 0.28)";
  document.body.appendChild(toast);
  window.setTimeout(() => toast.remove(), 1900);
}

/**
 * Ferme le menu mobile s'il est ouvert.
 */
export function closeMobileMenu() {
  const navMobile = document.getElementById("navMobile");
  const toggleBtn = document.getElementById("navToggle");
  if (navMobile) {
    navMobile.classList.remove("open-mobile");
  }
  if (toggleBtn) {
    toggleBtn.setAttribute("aria-expanded", "false");
  }
}
