/* ==========================================================
   pages/consent.js — Consentement préalable au calcul de l'IMC.
   ========================================================== */

import { icon } from "../helpers.js";

/**
 * Écran avant l'onboarding : accepter ou refuser l'usage des données physiques.
 */
export function renderConsent() {
  return `
    <style>
      .consent-page {
        min-height: calc(100vh - 160px);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 40px 0 64px;
        background:
          radial-gradient(ellipse 80% 50% at 50% -10%, rgba(226, 98, 45, 0.08), transparent 55%),
          radial-gradient(ellipse 60% 40% at 100% 100%, rgba(60, 90, 70, 0.06), transparent 50%),
          var(--chalk);
      }
      .consent-shell {
        width: 100%;
        max-width: 560px;
        margin: 0 auto;
        text-align: center;
      }
      .consent-eyebrow {
        margin: 0 0 12px;
        font-size: 11px;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        color: var(--ember);
        font-weight: 800;
      }
      .consent-title {
        margin: 0 0 28px;
        font-size: clamp(1.6rem, 4vw, 2.1rem);
        line-height: 1.2;
        color: var(--ink);
        font-weight: 900;
      }
      .consent-panel {
        background: #fff;
        border: 1px solid var(--line);
        border-radius: 14px;
        padding: 28px 28px 24px;
        box-shadow: 0 12px 40px rgba(22, 35, 44, 0.06);
        text-align: left;
      }
      .consent-icon {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        background: var(--ember-soft);
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 16px;
      }
      .consent-lead {
        margin: 0;
        color: var(--ink);
        font-size: 15px;
        line-height: 1.65;
        font-weight: 500;
      }
      .consent-note {
        margin: 12px 0 0;
        color: var(--slate);
        font-size: 14px;
        line-height: 1.6;
      }
      .consent-actions {
        display: grid;
        gap: 10px;
        margin-top: 24px;
      }
      .consent-actions .btn {
        width: 100%;
        justify-content: center;
        padding: 12px 18px;
        font-weight: 700;
        border-radius: 8px;
      }
      .consent-actions .btn-ember {
        min-height: 48px;
      }
      .consent-home {
        display: inline-flex;
        margin-top: 20px;
        padding: 0;
        border: none;
        background: none;
        color: var(--slate);
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        text-decoration: underline;
        text-underline-offset: 3px;
      }
      .consent-home:hover {
        color: var(--ink);
      }
      @media (min-width: 520px) {
        .consent-actions {
          grid-template-columns: 1.15fr 1fr;
          align-items: stretch;
        }
        .consent-actions .btn {
          white-space: nowrap;
        }
      }
    </style>
    <div class="consent-page">
      <div class="wrap consent-shell">
        <p class="consent-eyebrow font-mono">Avant ton onboarding</p>
        <h1 class="consent-title font-display">Autorises-tu le calcul<br>de ton IMC&nbsp;?</h1>

        <div class="consent-panel">
          <div class="consent-icon" aria-hidden="true">
            ${icon("shield-check", 24, "var(--ember)")}
          </div>
          <p class="consent-lead">
            Pour afficher ton Indice de Masse Corporelle, MonProgrammeFit utilise ton poids et ta taille renseignés dans le quiz.
          </p>
          <p class="consent-note">
            Ces données servent uniquement à te donner un repère personnalisé avec ton programme. Tu peux refuser et continuer sans calcul d'IMC.
          </p>

          <div class="consent-actions">
            <button type="button" class="btn btn-ember" data-bmi-consent="accepted">
              J'accepte et je continue ${icon("arrow-right", 16)}
            </button>
            <button type="button" class="btn btn-outline-dark" data-bmi-consent="refused">
              Je refuse et continue
            </button>
          </div>
        </div>

        <button type="button" class="consent-home" data-nav="home">Retour à l'accueil</button>
      </div>
    </div>`;
}
