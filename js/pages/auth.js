/* ==========================================================
   pages/auth.js — Connexion et inscription.
   ========================================================== */

import { state } from "../state.js";
import { escapeHtml } from "../helpers.js";

export function renderLogin() {
  const login = state.drafts.login;
  return `
  <div class="section wrap">
    <div class="login-wrap">
      <h1 class="font-display" style="font-size:24px;text-align:center;color:var(--ink);margin-bottom:4px">Connexion</h1>
      <p style="font-size:14px;text-align:center;color:var(--slate);margin-bottom:24px">Accède à ton espace et reprends ton suivi où tu l’as laissé.</p>
      <div class="tabs">
        <button class="tab ${state.loginTab === "client" ? "active" : ""}" data-login-tab="client">Espace client</button>
        <button class="tab ${state.loginTab === "admin" ? "active" : ""}" data-login-tab="admin">Espace admin</button>
      </div>
      <div class="login-form card">
        <label class="font-mono" style="font-size:12px">Adresse e-mail</label>
        <input class="text-input" type="email" data-login-email value="${escapeHtml(login.email)}" placeholder="ton@exemple.com" autocomplete="username" />
        <p class="login-help">Utilise l’adresse liée à ton compte MonProgrammeFit.</p>

        <label class="font-mono" style="font-size:12px">Mot de passe</label>
        <div class="password-field">
          <input class="text-input" type="${state.ui.loginShowPassword ? "text" : "password"}" data-login-password value="${escapeHtml(login.password)}" placeholder="•••••••••" autocomplete="current-password" />
          <button type="button" class="toggle-password" data-login-toggle-password>${state.ui.loginShowPassword ? "Masquer" : "Afficher"}</button>
        </div>
        <p class="login-help">Ton mot de passe reste confidentiel et n’est pas enregistré en clair.</p>

        ${state.ui.loginError ? `<div class="form-error" role="alert">${escapeHtml(state.ui.loginError)}</div>` : ""}

        <button class="btn btn-ember" style="justify-content:center;margin-top:8px" data-login-submit="1" ${state.ui.loginPending ? "disabled" : ""}>
          ${state.ui.loginPending ? "Connexion en cours…" : "Se connecter"}
        </button>
      </div>
      <p class="hint">Pas encore de compte ? <button class="btn btn-ember" style="font-size:14px;padding:10px 14px;color:var(--ink);" data-nav="signup">S'inscrire</button></p>
    </div>
  </div>`;
}

export function renderSignup() {
  const d = state.drafts.signup;
  return `
  <div class="section wrap">
    <div class="card" style="max-width:560px;margin:0 auto;padding:24px">
      <h1 class="font-display" style="font-size:22px;margin-bottom:8px">Créer mon compte</h1>
      <p style="font-size:14px;color:var(--slate);margin-bottom:16px">Indique ton objectif et tes mesures actuelles pour démarrer ta transformation.</p>
      <div class="form-grid">
        <label class="font-mono" style="font-size:12px">Prénom</label>
        <input class="text-input" type="text" data-signup-firstname value="${escapeHtml(d.firstName)}" placeholder="Ex: Julie" />

        <label class="font-mono" style="font-size:12px">Nom</label>
        <input class="text-input" type="text" data-signup-lastname value="${escapeHtml(d.lastName)}" placeholder="Ex: Dubois" />

        <label class="font-mono" style="font-size:12px">Adresse e-mail</label>
        <input class="text-input" type="email" data-signup-email value="${escapeHtml(d.email)}" placeholder="ton@exemple.com" />

        <label class="font-mono" style="font-size:12px">Âge</label>
        <input class="text-input" type="number" min="13" data-signup-age value="${escapeHtml(d.age)}" placeholder="Ex: 28" />

        <label class="font-mono" style="font-size:12px">Objectif</label>
        <select class="text-input" data-signup-goal>
          <option value="remise" ${d.goal === "remise" ? "selected" : ""}>Remise en forme</option>
          <option value="perte" ${d.goal === "perte" ? "selected" : ""}>Perte de poids</option>
          <option value="musculation" ${d.goal === "musculation" ? "selected" : ""}>Musculation</option>
        </select>

        <label class="font-mono" style="font-size:12px">Poids (kg)</label>
        <input class="text-input" type="number" step="0.1" data-signup-weight value="${escapeHtml(d.weight)}" placeholder="Ex: 72.5" />

        <label class="font-mono" style="font-size:12px">Taille (cm)</label>
        <input class="text-input" type="number" step="0.1" data-signup-height value="${escapeHtml(d.height)}" placeholder="Ex: 175" />

        <button class="btn btn-ember" style="justify-content:center;margin-top:8px" data-signup-submit="1">Créer mon compte et démarrer</button>
      </div>
    </div>
  </div>`;
}
