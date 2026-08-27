/* ==========================================================
   modules/consent-modal.js — Bannière cookies & confidentialité.
   Affichée à la première visite, jusqu'à ce que l'utilisateur choisisse.
   ========================================================== */

import { hasGoogleAnalytics, hasMicrosoftClarity, hasAnalyticsServices } from "./privacy.js";

/**
 * Bannière de consentement cookies / données personnelles.
 * Toujours affichée tant que l'utilisateur n'a pas fait de choix.
 */
export function renderConsentModal() {
  const hasAnalytics = hasAnalyticsServices();

  return `
    <div id="consent-modal" role="dialog" aria-labelledby="consent-title" style="
      position: fixed;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 100000;
      padding: 12px 16px 16px;
      pointer-events: none;
    ">
      <style>
        @keyframes consent-slide-up {
          from { transform: translateY(24px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        #consent-modal .consent-panel {
          animation: consent-slide-up 0.28s ease-out;
          pointer-events: auto;
        }
        @media (prefers-reduced-motion: reduce) {
          #consent-modal .consent-panel { animation: none; }
        }
      </style>
      <div class="consent-panel" style="
        width: 100%;
        max-width: 760px;
        margin: 0 auto;
        background: var(--chalk, #F7F5F0);
        color: var(--ink, #16232C);
        border: 1px solid var(--line, #E4E0D6);
        border-radius: 12px;
        padding: 22px 24px;
        box-shadow: 0 -8px 32px rgba(22, 35, 44, 0.18);
      ">
        <p class="font-mono" style="margin: 0 0 8px; font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--ember, #E2622D); font-weight: 800;">
          Cookies & confidentialité
        </p>
        <h2 id="consent-title" style="margin: 0 0 10px; font-size: 18px; font-weight: 800; font-family: var(--font-display); line-height: 1.25;">
          Nous utilisons vos informations pour personnaliser votre coaching
        </h2>
        <p style="margin: 0 0 10px; font-size: 14px; color: var(--slate, #6B7280); line-height: 1.55;">
          MonProgrammeFit enregistre des cookies techniques nécessaires au fonctionnement du site
          (session, préférences, sécurité). Si vous créez un compte, des données comme votre poids,
          votre taille, vos réponses au quiz ou votre hydratation peuvent servir à calculer votre IMC,
          vos estimations nutritionnelles et à adapter votre programme d'entraînement.
        </p>
        <p style="margin: 0 0 16px; font-size: 13px; color: var(--slate, #6B7280); line-height: 1.5;">
          ${hasAnalytics
            ? "Avec votre accord, nous pouvons aussi mesurer l'audience (pages consultées) pour améliorer l'expérience. Vous pouvez refuser ces cookies non essentiels."
            : "Vous pouvez accepter pour continuer, ou limiter le suivi aux seuls cookies essentiels. Vous pourrez modifier ce choix plus tard dans « Mes données »."}
        </p>
        <div style="display: flex; flex-wrap: wrap; gap: 8px;">
          <button type="button" id="consent-accept-all" class="btn btn-ember" style="justify-content: center; padding: 10px 16px; font-weight: 700;">
            Tout accepter
          </button>
          <button type="button" id="consent-refuse-all" class="btn btn-outline-dark" style="justify-content: center; padding: 10px 16px; font-weight: 700;">
            Essentiels uniquement
          </button>
          <button type="button" id="consent-customize" class="btn btn-outline-dark" style="justify-content: center; padding: 10px 16px; font-weight: 700;">
            Personnaliser
          </button>
        </div>
        <p style="margin: 12px 0 0; font-size: 12px; color: var(--slate, #6B7280);">
          En savoir plus : page <button type="button" class="nav-link" data-nav="legal" id="consent-legal-link" style="display:inline; padding:0; font-size:12px; color: var(--ember); font-weight:700; background:none; border:none; cursor:pointer; text-decoration:underline;">Mentions légales</button>
          et <button type="button" class="nav-link" data-nav="privacy" id="consent-privacy-link" style="display:inline; padding:0; font-size:12px; color: var(--ember); font-weight:700; background:none; border:none; cursor:pointer; text-decoration:underline;">Mes données</button>.
        </p>
      </div>
    </div>
  `;
}

/**
 * Modal de personnalisation du consentement.
 */
export function renderConsentCustomizeModal() {
  const hasGA = hasGoogleAnalytics();
  const hasClarity = hasMicrosoftClarity();
  const hasAnalytics = hasGA || hasClarity;

  return `
    <div id="consent-customize-modal" role="dialog" aria-modal="true" aria-labelledby="consent-customize-title" style="
      position: fixed;
      inset: 0;
      background: rgba(22, 35, 44, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 100010;
      padding: 16px;
    ">
      <div style="
        background: var(--chalk, #F7F5F0);
        color: var(--ink, #16232C);
        border-radius: 12px;
        border: 1px solid var(--line, #E4E0D6);
        padding: 28px;
        max-width: 520px;
        width: 100%;
        max-height: 85vh;
        overflow-y: auto;
      ">
        <h2 id="consent-customize-title" style="margin: 0 0 8px; font-size: 20px; font-weight: 800; font-family: var(--font-display);">
          Gérer mes préférences
        </h2>
        <p style="color: var(--slate, #6B7280); font-size: 14px; margin: 0 0 20px; line-height: 1.5;">
          Choisissez ce que MonProgrammeFit est autorisé à enregistrer.
        </p>

        <div style="display: grid; gap: 12px;">
          <div style="padding: 14px; background: var(--chalk-soft, #F1EFE9); border: 1px solid var(--line, #E4E0D6); border-radius: 8px;">
            <div style="display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 4px;">
              <strong style="font-size: 14px;">Cookies essentiels</strong>
              <span class="font-mono" style="font-size: 11px; font-weight: 800; color: var(--moss, #3C5A46); text-transform: uppercase;">Toujours actifs</span>
            </div>
            <p style="font-size: 12px; color: var(--slate, #6B7280); margin: 0; line-height: 1.45;">
              Connexion, session, sécurité et mémorisation de vos choix. Indispensables au fonctionnement du site.
            </p>
          </div>

          <div style="padding: 14px; background: var(--chalk-soft, #F1EFE9); border: 1px solid var(--line, #E4E0D6); border-radius: 8px;">
            <div style="display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 4px;">
              <strong style="font-size: 14px;">Données de coaching</strong>
              <span class="font-mono" style="font-size: 11px; font-weight: 800; color: var(--moss, #3C5A46); text-transform: uppercase;">Compte requis</span>
            </div>
            <p style="font-size: 12px; color: var(--slate, #6B7280); margin: 0; line-height: 1.45;">
              Profil, quiz, poids, hydratation et séances : utilisés uniquement pour calculer et suivre votre programme, une fois connecté.
            </p>
          </div>

          ${hasGA ? `
            <div style="display: flex; align-items: flex-start; gap: 12px; padding: 14px; background: var(--moss-soft, #E9F0EB); border: 1px solid var(--line, #E4E0D6); border-radius: 8px;">
              <input type="checkbox" id="consent-ga" checked style="width: 18px; height: 18px; margin-top: 2px; cursor: pointer; accent-color: var(--ember);" />
              <div style="flex: 1;">
                <label for="consent-ga" style="display: block; font-weight: 700; cursor: pointer; margin-bottom: 4px; font-size: 14px;">
                  Google Analytics
                </label>
                <p style="font-size: 12px; color: var(--slate, #6B7280); margin: 0; line-height: 1.45;">
                  Mesure anonymisée des pages consultées pour améliorer le site.
                </p>
              </div>
            </div>
          ` : ""}

          ${hasClarity ? `
            <div style="display: flex; align-items: flex-start; gap: 12px; padding: 14px; background: var(--moss-soft, #E9F0EB); border: 1px solid var(--line, #E4E0D6); border-radius: 8px;">
              <input type="checkbox" id="consent-clarity" checked style="width: 18px; height: 18px; margin-top: 2px; cursor: pointer; accent-color: var(--ember);" />
              <div style="flex: 1;">
                <label for="consent-clarity" style="display: block; font-weight: 700; cursor: pointer; margin-bottom: 4px; font-size: 14px;">
                  Microsoft Clarity
                </label>
                <p style="font-size: 12px; color: var(--slate, #6B7280); margin: 0; line-height: 1.45;">
                  Analyse d'usage de l'interface pour corriger les frictions.
                </p>
              </div>
            </div>
          ` : ""}

          ${!hasAnalytics ? `
            <div style="padding: 14px; border: 1px dashed var(--line, #E4E0D6); border-radius: 8px;">
              <p style="font-size: 12px; color: var(--slate, #6B7280); margin: 0; line-height: 1.45;">
                Aucun outil d'audience optionnel n'est actif pour le moment. Votre choix porte surtout sur les cookies essentiels et l'usage des données de coaching.
              </p>
            </div>
          ` : ""}
        </div>

        <div style="display: flex; gap: 8px; margin-top: 22px; flex-wrap: wrap;">
          <button type="button" id="consent-customize-save" class="btn btn-ember" style="flex: 1; min-width: 140px; justify-content: center; padding: 10px 16px; font-weight: 700;">
            Enregistrer mon choix
          </button>
          <button type="button" id="consent-customize-cancel" class="btn btn-outline-dark" style="flex: 1; min-width: 120px; justify-content: center; padding: 10px 16px; font-weight: 700;">
            Annuler
          </button>
        </div>
      </div>
    </div>
  `;
}
