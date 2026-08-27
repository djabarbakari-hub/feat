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
  const { name, email, message, subject } = state.drafts.contact;
  const isSending = state.ui.isSending;
  const sendSuccess = state.ui.sendSuccess;

  if (sendSuccess) {
    return `
    <div style="background: var(--chalk); padding: 60px 0 80px;">
      <div class="wrap" style="max-width: 680px; margin: 0 auto;">
        <div class="card" style="text-align: center; padding: 48px 32px; border: 1px solid var(--line); border-radius: 12px; background: #ffffff; box-shadow: 0 8px 30px rgba(0,0,0,0.04);">
          <div style="width: 56px; height: 56px; border-radius: 50%; background: rgba(60, 150, 80, 0.12); color: var(--moss); display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
            ${icon("check-circle-2", 32)}
          </div>
          <span class="font-mono" style="font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--moss); font-weight: 700;">
            [ MESSAGE ENVOYÉ AVEC SUCCÈS ]
          </span>
          <h1 class="h2 font-display" style="margin: 12px 0 12px 0; color: var(--ink);">Merci pour ton message !</h1>
          <p style="font-size: 15px; color: var(--slate); line-height: 1.6; max-width: 480px; margin: 0 auto 28px;">
            Ton message a bien été transmis à notre équipe. Nous te répondrons sous 24h (du lundi au vendredi, 8h–18h).
          </p>
          <button class="btn btn-ember" style="padding: 12px 24px; font-weight: 700; font-size: 14px;" data-contact-reset>
            Envoyer un autre message
          </button>
        </div>
      </div>
    </div>`;
  }

  return `
  <div style="background: var(--chalk); padding-bottom: 60px;">
    
    <!-- HERO CINÉMATIQUE HAUT DE PAGE -->
    <section class="hero" style="background: radial-gradient(circle at 85% 15%, rgba(226, 98, 45, 0.12) 0%, transparent 65%), var(--ink) !important; padding: 60px 0 50px; border-bottom: 1px solid rgba(255,255,255,0.1);">
      <div class="wrap" style="max-width: 1120px; margin: 0 auto; position: relative; z-index: 2;">
        
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
          <span class="font-mono" style="font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; padding: 4px 10px; background: rgba(226, 98, 45, 0.15); color: var(--ember); border-radius: 4px; font-weight: 700;">
            [ CONTACT & SUPPORT ]
          </span>
          <span style="font-size: 12px; color: var(--ink-muted2); font-family: var(--font-mono);">MonProgrammeFit — À votre écoute</span>
        </div>

        <h1 class="font-display h1" style="max-width: 800px; margin: 0 0 16px 0; font-size: clamp(28px, 4.5vw, 44px); line-height: 1.15; color: var(--chalk) !important;">
          Une question sur votre programme ? Contactez-nous.
        </h1>

        <p class="hero-sub" style="max-width: 680px; font-size: 16px; line-height: 1.6; color: var(--ink-muted2) !important; margin: 0;">
          Besoin d'un conseil sur vos séances, d'une assistance sur votre compte ou d'informations complémentaires ? Notre équipe vous répond sous 24h (du lundi au vendredi, 8h–18h).
        </p>

      </div>
    </section>

    <!-- CONTENU PRINCIPAL -->
    <div class="wrap" style="max-width: 1120px; margin: 40px auto 0;">
      
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 32px; align-items: start;">
        
        <!-- COLONNE 1 : COORDONNÉES ET ENGAGEMENTS -->
        <div style="display: flex; flex-direction: column; gap: 20px;">
          
          <div class="card" style="padding: 28px; border: 1px solid var(--line); border-radius: 12px; background: #ffffff; box-shadow: 0 4px 20px rgba(0,0,0,0.03);">
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 20px; padding-bottom: 12px; border-bottom: 1px solid var(--line);">
              <div style="width: 36px; height: 36px; border-radius: 6px; background: rgba(226, 98, 45, 0.1); display: flex; align-items: center; justify-content: center; color: var(--ember);">
                ${icon("message-square", 20)}
              </div>
              <h2 class="h3 font-display" style="margin: 0; font-size: 20px; color: var(--ink);">Nos Coordonnées Directes</h2>
            </div>

            <div style="display: grid; gap: 20px;">
              
              <div style="display: flex; gap: 14px; align-items: start;">
                <div style="width: 32px; height: 32px; border-radius: 6px; background: rgba(0,0,0,0.04); display: flex; align-items: center; justify-content: center; color: var(--ink); flex-shrink: 0; margin-top: 2px;">
                  ${icon("mail", 16)}
                </div>
                <div>
                  <div class="font-mono" style="font-size: 11px; text-transform: uppercase; color: var(--slate); font-weight: 700; letter-spacing: 0.05em;">Adresse Email</div>
                  <a href="mailto:djabarbakari.032003@gmail.com" style="font-size: 14px; font-weight: 600; color: var(--ink); text-decoration: none; word-break: break-all;">
                    djabarbakari.032003@gmail.com
                  </a>
                </div>
              </div>

              <div style="display: flex; gap: 14px; align-items: start;">
                <div style="width: 32px; height: 32px; border-radius: 6px; background: rgba(0,0,0,0.04); display: flex; align-items: center; justify-content: center; color: var(--ink); flex-shrink: 0; margin-top: 2px;">
                  ${icon("phone", 16)}
                </div>
                <div>
                  <div class="font-mono" style="font-size: 11px; text-transform: uppercase; color: var(--slate); font-weight: 700; letter-spacing: 0.05em;">Téléphone / WhatsApp</div>
                  <a href="tel:+2290191720596" style="font-size: 14px; font-weight: 600; color: var(--ink); text-decoration: none;">
                    +229 01 91 72 05 96
                  </a>
                </div>
              </div>

              <div style="display: flex; gap: 14px; align-items: start;">
                <div style="width: 32px; height: 32px; border-radius: 6px; background: rgba(0,0,0,0.04); display: flex; align-items: center; justify-content: center; color: var(--ink); flex-shrink: 0; margin-top: 2px;">
                  ${icon("clock", 16)}
                </div>
                <div>
                  <div class="font-mono" style="font-size: 11px; text-transform: uppercase; color: var(--slate); font-weight: 700; letter-spacing: 0.05em;">Horaires d'ouverture</div>
                  <div style="font-size: 14px; font-weight: 600; color: var(--ink);">
                    Du Lundi au Vendredi · 8h00 – 18h00
                  </div>
                </div>
              </div>

              <div style="display: flex; gap: 14px; align-items: start;">
                <div style="width: 32px; height: 32px; border-radius: 6px; background: rgba(0,0,0,0.04); display: flex; align-items: center; justify-content: center; color: var(--ink); flex-shrink: 0; margin-top: 2px;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                </div>
                <div>
                  <div class="font-mono" style="font-size: 11px; text-transform: uppercase; color: var(--slate); font-weight: 700; letter-spacing: 0.05em;">Réseaux Sociaux</div>
                  <a href="https://www.instagram.com/menblvck/#" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; gap: 6px; font-size: 14px; font-weight: 600; color: var(--ember); text-decoration: none; margin-top: 2px;">
                    Suivre sur Instagram
                    ${icon("external-link", 14)}
                  </a>
                </div>
              </div>

            </div>
          </div>

        </div>

        <!-- COLONNE 2 : FORMULAIRE DE CONTACT -->
        <div class="card" style="padding: 32px; border: 1px solid var(--line); border-radius: 12px; background: #ffffff; box-shadow: 0 4px 20px rgba(0,0,0,0.03);">
          
          <div style="margin-bottom: 24px;">
            <span class="font-mono" style="font-size: 11px; color: var(--ember); font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;">
              [ FORMULAIRE DIRECT ]
            </span>
            <h2 class="h3 font-display" style="margin: 4px 0 0 0; font-size: 22px; color: var(--ink);">Envoyez-nous un message</h2>
          </div>

          <form onsubmit="return false;" style="display: grid; gap: 18px;">
            
            <div>
              <label class="font-mono" style="display: block; font-size: 12px; font-weight: 700; color: var(--ink); margin-bottom: 6px;">
                Sujet de votre demande <span style="color: var(--ember);">*</span>
              </label>
              <select class="text-input" data-contact-subject required style="width: 100%; padding: 10px 14px; border-radius: 6px; border: 1px solid var(--line); font-size: 14px; background: #ffffff; color: var(--ink);">
                <option value="" ${!subject ? "selected" : ""}>Choisissez un sujet</option>
                <option value="programme" ${subject === "programme" ? "selected" : ""}>Question sur mon programme</option>
                <option value="inscription" ${subject === "inscription" ? "selected" : ""}>Inscription / Paiement</option>
                <option value="technique" ${subject === "technique" ? "selected" : ""}>Problème technique</option>
                <option value="autre" ${subject === "autre" ? "selected" : ""}>Autre demande</option>
              </select>
            </div>

            <div>
              <label class="font-mono" style="display: block; font-size: 12px; font-weight: 700; color: var(--ink); margin-bottom: 6px;">
                Votre nom <span style="color: var(--ember);">*</span>
              </label>
              <input class="text-input" type="text" data-contact-name value="${escapeHtml(name)}" placeholder="Ex: Aïcha" required style="width: 100%; padding: 10px 14px; border-radius: 6px; border: 1px solid var(--line); font-size: 14px;" />
            </div>

            <div>
              <label class="font-mono" style="display: block; font-size: 12px; font-weight: 700; color: var(--ink); margin-bottom: 6px;">
                Votre adresse email <span style="color: var(--ember);">*</span>
              </label>
              <input class="text-input" type="email" data-contact-email value="${escapeHtml(email)}" placeholder="ton@email.com" required style="width: 100%; padding: 10px 14px; border-radius: 6px; border: 1px solid var(--line); font-size: 14px;" />
            </div>

            <div>
              <label class="font-mono" style="display: block; font-size: 12px; font-weight: 700; color: var(--ink); margin-bottom: 6px;">
                Votre message <span style="color: var(--ember);">*</span>
              </label>
              <textarea class="text-input" rows="5" data-contact-message placeholder="Décrivez précisément votre demande..." required style="width: 100%; padding: 10px 14px; border-radius: 6px; border: 1px solid var(--line); font-size: 14px; font-family: inherit; resize: vertical;">${escapeHtml(message)}</textarea>
            </div>


            <button class="btn btn-ember" style="width: 100%; padding: 14px; font-weight: 700; font-size: 15px; margin-top: 6px;" data-contact-send="${isSending ? "0" : "1"}" ${isSending ? "disabled" : ""}>
              ${isSending ? "Envoi en cours..." : "Envoyer mon message"}
            </button>

          </form>

        </div>

      </div>

    </div>
  </div>`;
}