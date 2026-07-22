/* ==========================================================
   pages/quiz.js — Quiz d'onboarding (personnalisation du programme).
   ========================================================== */

import { QUIZ_STEPS } from "../data.js";
import { state } from "../state.js";
import { icon, trackById, escapeHtml } from "../helpers.js";

/**
 * Rend le quiz de personnalisation avec animations et gestion des étapes.
 * @returns {string} HTML du quiz ou du résultat.
 */
export function renderQuiz() {
  const quizAnimation = `
    <style>
      .quiz-progress { height: 0.25rem; background: var(--line); border-radius: 0.125rem; margin-bottom: 1.5rem; overflow: hidden; }
      .quiz-progress-bar { height: 100%; background: var(--accent-primary); width: 0%; transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
      .quiz-option { transition: var(--transition); }
      .quiz-option:hover { transform: translateY(-0.125rem); box-shadow: var(--shadow); }
      .quiz-option:focus-visible { outline: 0.125rem solid var(--focus-outline); outline-offset: 0.125rem; }
      .quiz-options { display: grid; gap: 0.75rem; max-width: 420px; }
      .quiz-option { text-align: left; border: 1px solid var(--line); border-radius: 0.125rem; padding: 1rem 1.25rem; display: flex; align-items: center; justify-content: space-between; font-size: 0.875rem; color: var(--color-ink); }
      .quiz-optional-fields { display: grid; gap: 1rem; max-width: 420px; }
      .quiz-optional-field { display: flex; flex-direction: column; gap: 0.25rem; }
      .quiz-buttons { display: flex; gap: 0.75rem; margin-top: 1.5rem; }
      .quiz-resume { display: grid; gap: 0.75rem; max-width: 420px; text-align: left; }
      .quiz-resume-item { padding: 0.75rem; background: var(--surface); border-radius: 0.125rem; border-left: 0.1875rem solid var(--accent-primary); }
    </style>
  `;

  if (state.quizStep >= QUIZ_STEPS.length) {
    const result = trackById(state.quizAnswers.lieu);
    const actionButton = state.role === 'client'
      ? `<button class="btn btn-ember" style="margin-top:1.5rem" data-nav="client-dashboard" aria-label="Voir mon tableau de bord">Voir mon tableau de bord ${icon("arrow-right", 1)}</button>`
      : `<button class="btn btn-ember" style="margin-top:1.5rem" data-nav="signup" aria-label="Créer mon compte et démarrer">Créer mon compte et démarrer ${icon("arrow-right", 1)}</button>`;

    return `
    ${quizAnimation}
    <div class="section wrap">
      <p class="eyebrow-moss font-mono">RÉSULTAT</p>
      <h1 class="h2 font-display">Ton point de départ : ${result.label}</h1>
      <div class="card" style="padding:2rem; animation: fadeIn 0.6s ease-out;max-width:100%;">
        ${icon(result.icon, 1.75, "var(--accent-primary)")}
        <p style="font-size:1rem;color:var(--text-secondary);margin-top:1rem; line-height: 1.7;">${result.desc}</p>
        <div class="font-mono" style="font-size:0.875rem;color:var(--accent-secondary);margin-top:1rem">${result.dist}</div>
        ${actionButton}
      </div>
    </div>`;
  }

  const s = QUIZ_STEPS[state.quizStep];
  const pct = Math.round((state.quizStep / (QUIZ_STEPS.length - 1)) * 100); // Exclut l'étape "resume"

  let content;
  if (s.type === "text") {
    content = `
      <input
        type="text"
        class="text-input"
        data-quiz-text="${s.key}"
        placeholder="${s.placeholder}"
        value="${escapeHtml(state.quizAnswers[s.key] || "")}"
        style="width: 100%; max-width: 420px; margin-top: 1.75rem;"
      />
      <div class="quiz-buttons">
        <button type="button" class="btn btn-ember" data-quiz-next>${s.button || "Suivant"}</button>
      </div>
    `;
  } else if (s.type === "optional") {
    // CORRECTIF : ces champs texte n'étaient captés par aucun listener "input" —
    // les valeurs tapées ici (poids/taille/âge) étaient perdues silencieusement.
    // data-quiz-physique + l'écouteur "input" dans events.js règlent ça.
    content = `
      <div class="quiz-optional-fields">
        ${s.fields.map(field => `
          <div class="quiz-optional-field">
            <label for="${field.key}">${field.label}</label>
            <input
              type="${field.type}"
              id="${field.key}"
              step="${field.step || "1"}"
              class="text-input"
              data-quiz-physique="${field.key}"
              placeholder="${field.placeholder}"
              value="${escapeHtml(state.quizAnswers[s.key]?.[field.key] || "")}"
            />
          </div>
        `).join("")}
      </div>
      <div class="quiz-buttons">
        ${state.quizStep > 0 ? `<button type="button" class="btn btn-outline-dark" data-quiz-back>Retour</button>` : ``}
        <button type="button" class="btn btn-outline-dark" data-quiz-skip>Passer</button>
        <button type="button" class="btn btn-ember" data-quiz-next>Suivant</button>
      </div>
    `;
  } else if (s.type === "resume") {
    const result = trackById(state.quizAnswers.lieu);
    content = `
      <div class="quiz-resume">
        <div class="quiz-resume-item">Objectif : <strong>${escapeHtml(state.quizAnswers.objectif)}</strong></div>
        <div class="quiz-resume-item">Lieu : <strong>${escapeHtml(result.label)}</strong></div>
        <div class="quiz-resume-item">Niveau : <strong>${escapeHtml(state.quizAnswers.niveau)}</strong></div>
        <div class="quiz-resume-item">Fréquence : <strong>${escapeHtml(state.quizAnswers.frequence)}</strong></div>
        ${state.quizAnswers.physique?.poids ? `<div class="quiz-resume-item">Poids : <strong>${escapeHtml(state.quizAnswers.physique.poids)} kg</strong></div>` : ""}
        ${state.quizAnswers.physique?.taille ? `<div class="quiz-resume-item">Taille : <strong>${escapeHtml(state.quizAnswers.physique.taille)} cm</strong></div>` : ""}
        ${state.quizAnswers.physique?.age ? `<div class="quiz-resume-item">Âge : <strong>${escapeHtml(state.quizAnswers.physique.age)} ans</strong></div>` : ""}
      </div>
      <button type="button" class="btn btn-ember" data-quiz-confirm style="margin-top: 1.5rem;">Confirmer et commencer</button>
    `;
  } else {
    content = `
      <div class="quiz-options" style="margin-top:1.75rem">
        ${s.options.map(opt => `
          <button type="button" class="quiz-option" data-quiz-answer="${s.key}:${opt.v}" aria-label="${opt.l}">
            ${opt.icon ? icon(opt.icon, 1) : ""}
            <span>${opt.l}</span>
            <span>${icon("arrow-right", 1)}</span>
          </button>
        `).join("")}
      </div>
    `;
  }

  return `
  ${quizAnimation}
  <div class="section wrap">
    <div class="quiz-progress">
      <div class="quiz-progress-bar" style="width: ${pct}%" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"></div>
    </div>
    <div class="font-mono" style="font-size:0.875rem;color:var(--ink-muted3);margin-bottom:0.75rem">ÉTAPE ${state.quizStep + 1} / ${QUIZ_STEPS.length - 1}</div>
    <h1 class="h2 font-display" style="max-width:560px">${s.q}</h1>
    <p class="hero-sub" style="max-width:620px; margin-top:0.75rem;">Réponds simplement et découvre le programme le plus adapté à ton cadre d'entraînement.</p>
    <div>${content}</div>
  </div>
</div>`;
}
