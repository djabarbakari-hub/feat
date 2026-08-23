/* ==========================================================
   pages/consent.js — Consentement préalable au calcul de l'IMC.
   ========================================================== */

import { icon } from "../helpers.js";

/**
 * Rend l'écran de choix avant le quiz d'onboarding.
 * Le refus permet de continuer sans collecter ni utiliser les données physiques.
 * @returns {string} HTML de l'écran de consentement.
 */
export function renderConsent() {
  return `
    <div class="section wrap">
      <p class="eyebrow-moss font-mono">AVANT TON ONBOARDING</p>
      <h1 class="h2 font-display" style="max-width: 680px;">Autorises-tu l'utilisation de tes données physiques ?</h1>
      <div class="card" style="max-width: 680px; padding: 2rem; margin-top: 1.5rem;">
        <div style="display: flex; gap: 1rem; align-items: flex-start;">
          ${icon("shield-check", 28, "var(--ember)")}
          <div>
            <p style="margin: 0; color: var(--ink); line-height: 1.7;">
              Pour personnaliser ton analyse et calculer ton IMC, MonProgrammeFit peut utiliser ton poids, ta taille et ton âge renseignés dans le quiz.
            </p>
            <p style="margin: 0.75rem 0 0; color: var(--slate); line-height: 1.7;">
              Ces informations servent uniquement à personnaliser ton résultat. Tu peux refuser et continuer le quiz sans calcul d'IMC.
            </p>
          </div>
        </div>
        <div class="quiz-buttons" style="flex-wrap: wrap; margin-top: 2rem;">
          <button type="button" class="btn btn-ember" data-bmi-consent="accepted">
            J'accepte ${icon("arrow-right", 14)}
          </button>
          <button type="button" class="btn btn-outline-dark" data-bmi-consent="refused">
            Je refuse et continue
          </button>
        </div>
        <button type="button" class="btn btn-line" data-nav="home" style="margin-top: 1rem;">Retour à l'accueil</button>
      </div>
    </div>`;
}