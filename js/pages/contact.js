/* ==========================================================
   pages/contact.js — Page Contact dédiée.
   ==========================================================
   ⚠️ Ce fichier utilise des TEMPLATES LITTÉRAUX JAVASCRIPT (backticks `)
   et non du JSX. Ne pas le traiter comme du JSX/TSX.
   ========================================================== */

import { state } from "../state.js";
import { icon, escapeHtml } from "../helpers.js";

/**
 * Rend la page Contact avec formulaire et informations.
 * Structure : Hero + Grille 2 colonnes (informations + formulaire).
 * @returns {string} HTML de la page Contact.
 */
export function renderContact() {
  console.log("[DEBUG] renderContact() appelée");
  const { name, email, message, subject } = state.drafts.contact;
  const isSending = state.ui.isSending;
  const sendSuccess = state.ui.sendSuccess;

  if (sendSuccess) {
    return `
    <div class="section wrap">
      <div class="card" style="text-align:center;">
        <h1 class="h2 font-display">Merci pour ton message !</h1>
        <p style="margin-top:16px;">Nous te répondrons sous 24h (du lundi au vendredi).</p>
        <button class="btn btn-ember" style="margin-top:24px;" data-contact-reset>Envoyer un autre message</button>
      </div>
    </div>`;
  }

  return `
  <div class="section wrap">
    <p class="eyebrow-moss font-mono">CONTACT</p>
    <h1 class="h2 font-display">Besoin d'aide ? On est là pour toi.</h1>
    <p class="hero-sub" style="max-width:620px; margin-top:12px;">Tu as une question sur ton programme, ton inscription ou ton suivi ? Écris-nous et nous te répondrons sous 24h (du lundi au vendredi, 8h–18h).</p>

    <div class="grid-2" style="gap:24px; margin-top:32px;">
      <!-- Colonne 1 : Informations -->
      <div class="card">
        <p style="font-size:16px;color:var(--ink);line-height:1.8;">Tu préfères nous contacter directement ? Voici nos coordonnées :</p>
        <div style="margin-top:24px; display:grid; gap:14px;">
          <div><strong>Email</strong><p style="margin:6px 0 0;color:var(--slate);">contact@monprogrammefit.com</p></div>
          <div><strong>Téléphone</strong><p style="margin:6px 0 0;color:var(--slate);">+229 90 00 00 00</p></div>
          <div><strong>Heures</strong><p style="margin:6px 0 0;color:var(--slate);">Lun–Ven · 8h–18h</p></div>
          <div style="margin-top:16px;">
            <a href="#faq" class="btn btn-line" style="display:inline-block; margin-right:8px;">Voir la FAQ</a>
            <div style="display:flex; gap:8px; margin-top:8px;">
              <a href="https://www.instagram.com/menblvck/#" target="_blank" aria-label="Instagram">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--slate);">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- Colonne 2 : Formulaire -->
      <div class="card">
        <label class="font-mono" style="font-size:12px">Sujet de ta demande</label>
        <select class="text-input" data-contact-subject required>
          <option value="" ${!subject ? "selected" : ""}>Choisis un sujet</option>
          <option value="programme" ${subject === "programme" ? "selected" : ""}>Question sur mon programme</option>
          <option value="inscription" ${subject === "inscription" ? "selected" : ""}>Inscription / Paiement</option>
          <option value="technique" ${subject === "technique" ? "selected" : ""}>Problème technique</option>
          <option value="autre" ${subject === "autre" ? "selected" : ""}>Autre</option>
        </select>

        <label class="font-mono" style="font-size:12px">Ton nom</label>
        <input class="text-input" type="text" data-contact-name value="${escapeHtml(name)}" placeholder="Ex: Aïcha" required />

        <label class="font-mono" style="font-size:12px">Ton email</label>
        <input class="text-input" type="email" data-contact-email value="${escapeHtml(email)}" placeholder="ton@email.com" required />

        <label class="font-mono" style="font-size:12px">Message</label>
        <textarea class="text-input" rows="5" data-contact-message placeholder="Décris ta demande..." required>${escapeHtml(message)}</textarea>

        <div style="margin-top:12px;">
          <label class="font-mono" style="font-size:12px">Combien font 2 + 3 ? (anti-spam)</label>
          <input class="text-input" type="text" data-contact-captcha placeholder="Réponse" required />
        </div>

        <button class="btn btn-ember" style="margin-top:16px;" data-contact-send="${isSending ? "0" : "1"}" ${isSending ? "disabled" : ""}>
          ${isSending ? "Envoi en cours..." : "Envoyer le message"}
        </button>
      </div>
    </div>
  </div>`;
}