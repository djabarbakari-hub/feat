/* ==========================================================
   modules/consent-modal.js — Modal de consentement analytics.
   Affiche un consentement RGPD conforme.
   ========================================================== */

import { hasGoogleAnalytics, hasMicrosoftClarity, hasAnalyticsServices } from "./privacy.js";
import { icon } from "../helpers.js";

/**
 * Crée le modal de consentement analytics.
 * Retourne le HTML du modal s'il y a des services analytics, sinon empty string.
 */
export function renderConsentModal() {
  if (!hasAnalyticsServices()) return "";

  const hasGA = hasGoogleAnalytics();
  const hasClarity = hasMicrosoftClarity();

  return `
    <div id="consent-modal" style="
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: 100;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: flex-end;
      animation: slideUp 0.3s ease-out;
    ">
      <style>
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      </style>
      <div style="
        width: 100%;
        background: var(--ink);
        border-top: 2px solid var(--accent-primary);
        padding: 20px;
        max-height: 80vh;
        overflow-y: auto;
        box-shadow: 0 -10px 28px rgba(0,0,0,0.3);
      ">
        <div style="max-width: 1152px; margin: 0 auto;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 16px;">
            <div style="flex: 1;">
              <h2 style="color: var(--chalk); font-size: 18px; font-weight: 600; margin: 0 0 8px 0;">
                Votre consentement pour les analytics
              </h2>
              <p style="color: var(--ink-muted2); font-size: 14px; margin: 0 0 12px 0; line-height: 1.5;">
                Nous utilisons des outils de mesure d'audience afin d'améliorer l'expérience utilisateur.
                ${hasGA ? "<br/>• Google Analytics pour analyser votre navigation" : ""}
                ${hasClarity ? "<br/>• Microsoft Clarity pour optimiser l'interface" : ""}
              </p>
              <p style="color: var(--slate); font-size: 12px; margin: 8px 0 0 0;">
                Vous pouvez gérer vos préférences à tout moment dans "Mes données".
              </p>
            </div>

            <button id="consent-close" style="
              background: transparent;
              border: none;
              color: var(--chalk);
              font-size: 20px;
              cursor: pointer;
              padding: 0;
              width: 24px;
              height: 24px;
              display: flex;
              align-items: center;
              justify-content: center;
            " aria-label="Fermer">✕</button>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 8px; margin-top: 16px;">
            <button id="consent-accept-all" class="btn btn-primary" style="justify-content: center; padding: 10px 16px;">
              Accepter tout
            </button>
            <button id="consent-refuse-all" class="btn btn-outline-dark" style="justify-content: center; padding: 10px 16px;">
              Refuser
            </button>
            <button id="consent-customize" class="btn btn-outline-dark" style="justify-content: center; padding: 10px 16px;">
              Personnaliser
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Crée le modal de personnalisation du consentement.
 */
export function renderConsentCustomizeModal() {
  const hasGA = hasGoogleAnalytics();
  const hasClarity = hasMicrosoftClarity();

  return `
    <div id="consent-customize-modal" style="
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 110;
      animation: fadeIn 0.2s ease-out;
    ">
      <style>
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      </style>
      <div style="
        background: var(--chalk);
        color: var(--ink);
        border-radius: 4px;
        padding: 32px;
        max-width: 500px;
        width: 90%;
        box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        max-height: 80vh;
        overflow-y: auto;
      ">
        <h2 style="margin: 0 0 8px 0; font-size: 20px; font-weight: 600;">
          Gérer les consentements
        </h2>
        <p style="color: var(--slate); font-size: 14px; margin: 0 0 24px 0;">
          Sélectionnez ce pour lequel vous souhaitez donner votre consentement.
        </p>

        <div style="display: grid; gap: 12px;">
          ${
            hasGA
              ? `
            <div style="display: flex; align-items: center; gap: 12px; padding: 12px; background: rgba(60,90,70,0.1); border-radius: 4px;">
              <input type="checkbox" id="consent-ga" checked style="width: 18px; height: 18px; cursor: pointer;" />
              <div style="flex: 1;">
                <label for="consent-ga" style="display: block; font-weight: 600; cursor: pointer; margin-bottom: 4px;">
                  Google Analytics
                </label>
                <p style="font-size: 12px; color: var(--slate); margin: 0;">
                  Suivi des pages consultées et des comportements de navigation
                </p>
              </div>
            </div>
          `
              : ""
          }

          ${
            hasClarity
              ? `
            <div style="display: flex; align-items: center; gap: 12px; padding: 12px; background: rgba(60,90,70,0.1); border-radius: 4px;">
              <input type="checkbox" id="consent-clarity" checked style="width: 18px; height: 18px; cursor: pointer;" />
              <div style="flex: 1;">
                <label for="consent-clarity" style="display: block; font-weight: 600; cursor: pointer; margin-bottom: 4px;">
                  Microsoft Clarity
                </label>
                <p style="font-size: 12px; color: var(--slate); margin: 0;">
                  Heatmaps et enregistrements de session pour optimiser l'UX
                </p>
              </div>
            </div>
          `
              : ""
          }
        </div>

        <div style="display: flex; gap: 8px; margin-top: 24px;">
          <button id="consent-customize-save" class="btn" style="
            background: var(--ink);
            color: var(--chalk);
            flex: 1;
            padding: 10px 16px;
            font-weight: 600;
            border-radius: 2px;
            cursor: pointer;
            border: none;
          ">
            Confirmer
          </button>
          <button id="consent-customize-cancel" class="btn" style="
            background: var(--line);
            color: var(--ink);
            flex: 1;
            padding: 10px 16px;
            font-weight: 600;
            border-radius: 2px;
            cursor: pointer;
            border: none;
          ">
            Annuler
          </button>
        </div>
      </div>
    </div>
  `;
}
