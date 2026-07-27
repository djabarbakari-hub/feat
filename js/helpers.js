/* ==========================================================
   helpers.js — Fonctions utilitaires partagées.
   ========================================================== */

import { TRACKS, QUIZ_STEPS } from "./data.js";
import { state } from "./state.js";
import { auth } from "./firebase.js";

/**
 * Génère le HTML d'avatar dynamique pour un utilisateur.
 * Affiche la véritable photo de profil Google / email si disponible,
 * ou tente la photo liée à l'adresse e-mail via unavatar.io,
 * avec un repli automatique et propre sur les initiales si l'image est indisponible.
 */
export function getUserAvatarHtml({
  photoURL = "",
  email = "",
  firstName = "",
  lastName = "",
  size = 28,
  border = "1px solid rgba(255, 255, 255, 0.2)",
  className = "",
  customStyle = ""
} = {}) {
  const cleanEmail = (email || "").trim().toLowerCase();
  const fName = (firstName || "").trim();
  const lName = (lastName || "").trim();
  const initials = ((fName[0] || "") + (lName[0] || "")).toUpperCase() || (cleanEmail[0] || "U").toUpperCase();

  let photo = photoURL || "";

  if (!photo && auth?.currentUser) {
    const currEmail = (auth.currentUser.email || "").trim().toLowerCase();
    if (currEmail && cleanEmail && currEmail === cleanEmail && auth.currentUser.photoURL) {
      photo = auth.currentUser.photoURL;
    } else if (!cleanEmail && auth.currentUser.photoURL) {
      photo = auth.currentUser.photoURL;
    }
  }

  if (!photo && cleanEmail) {
    photo = `https://unavatar.io/${encodeURIComponent(cleanEmail)}?fallback=false`;
  }

  const containerStyle = `width:${size}px; height:${size}px; border-radius:50%; flex-shrink:0; overflow:hidden; display:inline-flex; align-items:center; justify-content:center; position:relative; ${border ? `border:${border};` : ""} ${customStyle}`;

  if (photo && (photo.startsWith("http") || photo.startsWith("data:"))) {
    return `
      <div class="user-avatar-wrap ${className}" style="${containerStyle}">
        <img src="${escapeHtml(photo)}" style="width:100%; height:100%; object-fit:cover; border-radius:50%; display:block;" alt="${escapeHtml(initials)}" referrerpolicy="no-referrer" onerror="this.style.display='none'; if(this.nextElementSibling) this.nextElementSibling.style.display='flex';" />
        <span style="display:none; align-items:center; justify-content:center; width:100%; height:100%; background:var(--ember); color:#ffffff; font-size:${Math.round(size * 0.42)}px; font-weight:800; font-family:'Archivo', sans-serif;">${escapeHtml(initials)}</span>
      </div>
    `;
  }

  return `
    <div class="user-avatar-wrap ${className}" style="${containerStyle} background:var(--ember); color:#ffffff; font-size:${Math.round(size * 0.42)}px; font-weight:800; font-family:'Archivo', sans-serif;">
      ${escapeHtml(initials)}
    </div>
  `;
}

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
export const trackById = (id) => {
  const list = state.tracks && state.tracks.length > 0 ? state.tracks : TRACKS;
  return list.find((t) => t.id === id) || list[2];
};

/**
 * Vérifie si le quiz est complet.
 * @returns {boolean} True si toutes les réponses obligatoires du quiz sont remplies.
 */
export function isQuizComplete() {
  // Les étapes obligatoires sont les questions à choix multiples (hors info, optional, resume)
  const requiredSteps = QUIZ_STEPS.filter(step => step.type !== "info" && step.type !== "optional" && step.type !== "resume");
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
