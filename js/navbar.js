/* ==========================================================
   navbar.js — Barre de navigation et pied de page.
   ========================================================== */

import { state } from "./state.js";
import { icon } from "./helpers.js";

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
  const rightUser = `<button class="btn-outline-dark" data-nav="home" data-logout="1" aria-label="Quitter">${icon("log-out", 14)} Quitter</button>`;

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
      ${state.role === "guest" ? rightGuest : rightUser}
    </div>
  </div>`;
}

export function renderFooter() {
  return `
  <div class="wrap">
    <div class="footer-brand">
      <div class="logo"><span class="logo-badge font-display">M</span><span class="logo-text font-display">MonProgramme<span>Fit</span></span></div>
      <p class="font-mono">© 2026 <span class="brand-name">MonProgramme<span>Fit</span></span> — coaching sportif personnalisé</p>
    </div>
    <div class="footer-links">
      <button class="nav-link" data-nav="contact">Contact</button>
      <button class="nav-link" data-nav="legal">Mentions légales</button>
      <button class="nav-link" data-nav="privacy">Mes données</button>
    </div>
  </div>`;
}

