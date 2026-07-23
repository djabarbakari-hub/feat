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
      <div class="login-form card">
        <div style="margin-bottom:16px;">
          <button type="button" class="btn" data-google-auth="login" style="width:100%;justify-content:center;gap:10px;background:#ffffff;color:#1f2937;border:1px solid var(--line, #e5e7eb);padding:12px;font-weight:600;border-radius:8px;cursor:pointer;display:flex;align-items:center;transition:all 0.2s;box-shadow:0 1px 3px rgba(0,0,0,0.05);" ${state.ui.googleAuthPending ? "disabled" : ""}>
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            ${state.ui.googleAuthPending ? "Connexion Google en cours…" : "Continuer avec Google"}
          </button>
        </div>

        <div style="display:flex;align-items:center;margin:16px 0;color:var(--slate, #6b7280);font-size:12px;font-weight:500;text-transform:uppercase;letter-spacing:0.5px;">
          <div style="flex:1;height:1px;background:var(--line, #e5e7eb);"></div>
          <span style="padding:0 10px;">ou avec email</span>
          <div style="flex:1;height:1px;background:var(--line, #e5e7eb);"></div>
        </div>

        <label class="font-mono" style="font-size:12px">Adresse e-mail</label>
        <input class="text-input" type="email" data-login-email value="${escapeHtml(login.email)}" placeholder="ton@exemple.com" autocomplete="username" />
        <p class="login-help">Utilise l’adresse liée à ton compte MonProgrammeFit.</p>

        <label class="font-mono" style="font-size:12px">Mot de passe</label>
        <div class="password-field">
          <input class="text-input" type="${state.ui.loginShowPassword ? "text" : "password"}" data-login-password value="${escapeHtml(login.password)}" placeholder="•••••••••" autocomplete="current-password" />
          <button type="button" class="toggle-password" data-login-toggle-password>${state.ui.loginShowPassword ? "Masquer" : "Afficher"}</button>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:2px;margin-bottom:12px;">
          <p class="login-help" style="margin:0;">Ton mot de passe reste confidentiel.</p>
          <button type="button" id="btn-forgot-password-link" style="background:none;border:none;padding:0;color:var(--ember);font-size:12px;font-weight:600;cursor:pointer;text-decoration:underline;">Mot de passe oublié ?</button>
        </div>

        ${state.ui.loginError ? `<div class="form-error" role="alert">${escapeHtml(state.ui.loginError)}</div>` : ""}

        <button class="btn btn-ember" style="justify-content:center;margin-top:8px" data-login-submit="1" ${state.ui.loginPending ? "disabled" : ""}>
          ${state.ui.loginPending ? `<span class="btn-spinner"></span>Connexion en cours…` : "Se connecter"}
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
      <p style="font-size:14px;color:var(--slate);margin-bottom:16px">Commence avec ton profil et choisis ton programme après inscription.</p>

      <div style="margin-bottom:16px;">
        <button type="button" class="btn" data-google-auth="signup" style="width:100%;justify-content:center;gap:10px;background:#ffffff;color:#1f2937;border:1px solid var(--line, #e5e7eb);padding:12px;font-weight:600;border-radius:8px;cursor:pointer;display:flex;align-items:center;transition:all 0.2s;box-shadow:0 1px 3px rgba(0,0,0,0.05);" ${state.ui.googleAuthPending ? "disabled" : ""}>
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          ${state.ui.googleAuthPending ? "Création en cours avec Google…" : "S'inscrire avec Google"}
        </button>
      </div>

      <div style="display:flex;align-items:center;margin:16px 0;color:var(--slate, #6b7280);font-size:12px;font-weight:500;text-transform:uppercase;letter-spacing:0.5px;">
        <div style="flex:1;height:1px;background:var(--line, #e5e7eb);"></div>
        <span style="padding:0 10px;">ou par e-mail</span>
        <div style="flex:1;height:1px;background:var(--line, #e5e7eb);"></div>
      </div>

      <div class="form-grid">
        <label class="font-mono" style="font-size:12px">Prénom</label>
        <input class="text-input" type="text" data-signup-firstname value="${escapeHtml(d.firstName)}" placeholder="Ex: Julie" />

        <label class="font-mono" style="font-size:12px">Nom</label>
        <input class="text-input" type="text" data-signup-lastname value="${escapeHtml(d.lastName)}" placeholder="Ex: Dubois" />

        <label class="font-mono" style="font-size:12px">Adresse e-mail</label>
        <input class="text-input" type="email" data-signup-email value="${escapeHtml(d.email)}" placeholder="ton@exemple.com" autocomplete="username" />
        <p class="login-help">Ton adresse email permettra de te reconnecter plus tard.</p>

        <label class="font-mono" style="font-size:12px">Téléphone <span style="color:var(--slate);font-weight:normal;">(optionnel)</span></label>
        <input class="text-input" type="tel" data-signup-phone value="${escapeHtml(d.phone || '')}" placeholder="Ex: +229 90000000" />
        <p class="login-help">Optionnel — Utile si tu souhaites être contacté par SMS ou WhatsApp par le coach.</p>

        <label class="font-mono" style="font-size:12px">Mot de passe</label>
        <input class="text-input" type="password" data-signup-password value="${escapeHtml(d.password)}" placeholder="•••••••••" autocomplete="new-password" />
        <p class="login-help">Au moins 8 caractères avec majuscule, minuscule, chiffre et caractère spécial (ex: @, #, !).</p>

        ${state.ui.signupError ? `<div class="form-error" role="alert">${escapeHtml(state.ui.signupError)}</div>` : ""}

        <button class="btn btn-ember" style="justify-content:center;margin-top:8px" data-signup-submit="1" ${state.ui.signupPending ? "disabled" : ""}>
          ${state.ui.signupPending ? `<span class="btn-spinner"></span>Création en cours…` : "Créer mon compte"}
        </button>
      </div>
      <p class="hint">Déjà un compte ? <button class="btn btn-ember" style="font-size:14px;padding:10px 14px;color:var(--ink);" data-nav="login">Se connecter</button></p>
    </div>
  </div>`;
}
