/* ==========================================================
   navbar.js — Barre de navigation et pied de page.
   ========================================================== */

import { state } from "./state.js";
import { icon, escapeHtml } from "./helpers.js";

/**
 * Génère les liens de navigation en fonction du rôle de l'utilisateur.
 * @param {string} role - Rôle de l'utilisateur (guest, client, admin).
 * @returns {Array} Liste de liens sous forme de tableaux [id, label].
 */
export function navLinksFor(role) {
  if (role === "client") return [["client-dashboard", "Tableau de bord"], ["client-program", "Mon programme"], ["client-progress", "Ma progression"], ["privacy", "Mes données"]];
  if (role === "admin") return [["admin-dashboard", "Vue d'ensemble"], ["admin-clients", "Clients"], ["admin-programs", "Programmes"], ["admin-messages", "Messages"], ["privacy", "Données"]];
  return [["home", "Accueil"], ["programs", "Programmes"], ["about", "À propos"], ["contact", "Contact"]];
}

/**
 * Rend la barre de navigation en fonction du rôle et de la page actuelle.
 * Gère les rôles (guest, client, admin) et les états actifs.
 * Respecte les standards d'accessibilité (focus visible, clavier navigable).
 * @returns {string} HTML de la navbar.
 */
export function renderNavbar() {
  const links = navLinksFor(state.role);
  const homeTarget = state.role === "guest" ? "home" : state.role === "client" ? "client-dashboard" : "admin-dashboard";

  const linkHtml = (id, label) =>
    `<button class="nav-link ${state.page === id ? "active" : ""}" data-nav="${id}" aria-current="${state.page === id ? "page" : "false"}">${label}</button>`;

  const rightGuest = `<button class="btn-primary" data-nav="login" aria-label="Se connecter">Se connecter</button>`;
  
  // Badge de profil dynamique de l'utilisateur connecté
  const isDocAdmin = state.role === "admin";
  const firstName = state.clientProfile?.firstName || (isDocAdmin ? "Abdou" : "Athlète");
  const lastName = state.clientProfile?.lastName || "";
  const initial = firstName.charAt(0).toUpperCase() || "U";

  const rightUser = `
    <div class="navbar-right-user" style="display: flex; align-items: center; gap: 14px;">
      <div class="user-badge-header" style="display: flex; align-items: center; gap: 8px; padding: 6px 14px; background: rgba(255, 255, 255, 0.06); border-radius: 9999px; border: 1px solid rgba(255, 255, 255, 0.12); cursor: default;">
        <span style="width: 22px; height: 22px; border-radius: 50%; background: var(--accent-primary); color: var(--ink); display: inline-flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800; font-family: 'Archivo', sans-serif;">
          ${escapeHtml(initial)}
        </span>
        <span style="font-size: 13px; color: var(--chalk); font-weight: 600; white-space: nowrap; max-width: 120px; overflow: hidden; text-overflow: ellipsis; display: inline-block;">
          ${escapeHtml(isDocAdmin ? "Coach Abdou" : firstName)}
        </span>
      </div>
      <button class="btn-logout" data-nav="home" data-logout="1" aria-label="Quitter" style="padding: 8px 14px; font-size: 13px; font-weight: 600; height: auto;">
        ${icon("log-out", 14)} Quitter
      </button>
    </div>
  `;

  const rightUserMobile = `
    <div style="display: flex; flex-direction: column; gap: 12px; border-top: 1px dashed rgba(255, 255, 255, 0.12); padding-top: 12px; margin-top: 12px;">
      <div style="display: flex; align-items: center; gap: 10px; padding: 8px 12px; background: rgba(255, 255, 255, 0.06); border-radius: 6px; border: 1px solid rgba(255, 255, 255, 0.08);">
        <span style="width: 26px; height: 26px; border-radius: 50%; background: var(--accent-primary); color: var(--ink); display: inline-flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 800;">
          ${escapeHtml(initial)}
        </span>
        <span style="font-size: 13px; color: var(--chalk); font-weight: 600;">
          Session active : ${escapeHtml(isDocAdmin ? `Coach Abdou` : `${firstName} ${lastName}`.trim())}
        </span>
      </div>
      <button class="btn-logout" data-nav="home" data-logout="1" aria-label="Quitter" style="width: 100%; justify-content: flex-start; padding: 12px 14px;">
        ${icon("log-out", 14)} Quitter la session
      </button>
    </div>
  `;

  return `
  <div class="navbar">
    <div class="wrap">
      <button class="logo" data-nav="${homeTarget}" aria-label="Accueil">
        <span class="logo-badge font-display">M</span>
        <span class="logo-text brand-name font-display">MonProgramme<span>Fit</span></span>
      </button>
      <div class="nav-links" role="navigation" aria-label="Navigation principale">
        ${links.map(([id, l]) => linkHtml(id, l)).join("")}
      </div>
      ${state.role === "guest" ? rightGuest : rightUser}
      <button class="nav-toggle" id="navToggle" aria-label="Menu mobile" aria-controls="navMobile" aria-expanded="false">
        ${icon("menu", 22)}
      </button>
    </div>
    <div class="nav-mobile" id="navMobile" role="navigation" aria-label="Navigation mobile">
      ${links.map(([id, l]) => linkHtml(id, l)).join("")}
      ${state.role === "guest" ? rightGuest : rightUserMobile}
    </div>
  </div>`;
}

export function renderFooter() {
  const isLogged = state.role !== "guest";
  
  return `
  <div class="wrap">
    <div class="footer-brand">
      <div class="logo"><span class="logo-badge font-display">M</span><span class="logo-text font-display">MonProgramme<span>Fit</span></span></div>
      <p class="font-mono">© 2026 <span class="brand-name">MonProgramme<span>Fit</span></span> — coaching sportif personnalisé</p>
    </div>
    <div class="footer-links">
      <button class="nav-link" data-nav="contact">Contact</button>
      <button class="nav-link" data-nav="legal">Mentions légales</button>
      ${isLogged ? `<button class="nav-link" data-nav="privacy">Mes données</button>` : ""}
    </div>
  </div>
  
  <!-- Bouton WhatsApp flottant -->
  <a href="https://wa.me/2290191720596" class="whatsapp-float" target="_blank" rel="noopener noreferrer" aria-label="Contacter sur WhatsApp">
    <img src="/images/icone-whatsapp.jfif" alt="WhatsApp" style="width:100%;height:100%;object-fit:cover;border-radius:50%;transform:scale(1.4);" />
  </a>`;
}
