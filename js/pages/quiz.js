/* ==========================================================
   pages/quiz.js — Quiz d'onboarding (personnalisation du programme).
   ========================================================== */

import { QUIZ_STEPS, TRACKS } from "../data.js";
import { state } from "../state.js";
import { icon, trackById, escapeHtml, getMatchingCoachProgram } from "../helpers.js";
import { getGoalLabel, getCoachProgramDisplayName } from "../modules/program.js";

/**
 * Calcule l'IMC et renvoie statut + conseil, ou null si données insuffisantes.
 */
export function getBmiAssessment(physique) {
  const weight = Number(physique?.poids);
  const height = Number(physique?.taille);
  const bmi = weight > 0 && height > 0 ? weight / ((height / 100) ** 2) : null;

  if (bmi === null || Number.isNaN(bmi)) return null;
  if (bmi < 18.5) {
    return {
      value: bmi,
      status: "Insuffisance pondérale",
      advice: "Une orientation vers un programme de prise de muscle, avec progression progressive et récupération suffisante, peut être pertinente.",
      color: "#2563eb",
    };
  }
  if (bmi < 25) {
    return {
      value: bmi,
      status: "Corpulence dans la norme",
      advice: "Tu as une bonne base : le programme sera ajusté à ton objectif, ton niveau et ton environnement.",
      color: "var(--moss)",
    };
  }
  if (bmi < 30) {
    return {
      value: bmi,
      status: "Surpoids",
      advice: "Une orientation vers un programme de perte de poids progressif, combinant renforcement et endurance, peut être adaptée.",
      color: "#d97706",
    };
  }
  return {
    value: bmi,
    status: "Obésité",
    advice: "Une reprise progressive, orientée vers la perte de poids et adaptée à tes capacités, est recommandée. Un avis médical peut compléter cet accompagnement.",
    color: "var(--ember)",
  };
}

/** Affiche l'IMC sauf refus explicite du consentement. */
function shouldComputeBmi() {
  return state.bmiConsent !== false;
}

function renderBmiChart(assessment) {
  if (!assessment) return "";
  const left = Math.min(98, Math.max(2, (assessment.value / 40) * 100));
  return `
    <div class="bmi-chart" role="img" aria-label="Échelle de l'IMC : ${assessment.value.toFixed(1)}, ${assessment.status}">
      <div class="bmi-chart-head">
        <span class="font-mono">REPÈRE IMC</span>
        <strong style="color: ${assessment.color};">${assessment.value.toFixed(1)}</strong>
      </div>
      <div class="bmi-chart-scale">
        <span class="bmi-chart-segment bmi-chart-low"></span>
        <span class="bmi-chart-segment bmi-chart-normal"></span>
        <span class="bmi-chart-segment bmi-chart-high"></span>
        <span class="bmi-chart-segment bmi-chart-very-high"></span>
        <span class="bmi-chart-marker" style="left: ${left}%;"></span>
      </div>
      <div class="bmi-chart-labels">
        <span>&lt; 18,5</span>
        <span>18,5–24,9</span>
        <span>25–29,9</span>
        <span>30+</span>
      </div>
      <p class="bmi-chart-note">Indicateur général, pas un diagnostic médical.</p>
    </div>`;
}

function renderBmiResultCard(assessment) {
  if (!shouldComputeBmi()) {
    return `
      <div class="bmi-result-card bmi-result-card--muted">
        <strong>IMC non calculé</strong>
        <p>Tu as choisi de ne pas utiliser tes données physiques. Ton programme est personnalisé à partir de tes autres réponses.</p>
      </div>`;
  }
  if (!assessment) {
    return `
      <div class="bmi-result-card bmi-result-card--muted">
        <strong>IMC non calculé</strong>
        <p>Renseigne ton poids et ta taille à l'étape optionnelle pour obtenir ce repère avec ton programme.</p>
      </div>`;
  }
  return `
    <div class="bmi-result-card" style="border-left-color: ${assessment.color};">
      <div class="font-mono bmi-result-card__label">Ton résultat IMC</div>
      <div class="bmi-result-card__value">
        <strong style="color: ${assessment.color};">${assessment.value.toFixed(1)}</strong>
        <span style="color: ${assessment.color};">${assessment.status}</span>
      </div>
      <p>${escapeHtml(assessment.advice)}</p>
      <p class="bmi-result-card__note">L'IMC est un indicateur général, pas un diagnostic médical.</p>
      ${renderBmiChart(assessment)}
    </div>`;
}

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
      .quiz-resume { display: grid; gap: 0.75rem; max-width: 640px; text-align: left; }
      .quiz-resume-item { padding: 0.75rem; background: var(--surface); border-radius: 0.125rem; border-left: 0.1875rem solid var(--accent-primary); }
      .bmi-resume-grid { display: grid; grid-template-columns: minmax(220px, 0.9fr) minmax(260px, 1.1fr); gap: 1rem; margin-top: 0.25rem; }
      .bmi-chart { padding: 1rem; border: 1px solid var(--line); border-radius: 8px; background: var(--chalk-soft); margin-top: 0.75rem; }
      .bmi-chart-head { display: flex; align-items: center; justify-content: space-between; gap: 1rem; color: var(--slate); }
      .bmi-chart-head span { font-size: 0.7rem; letter-spacing: 0.06em; }
      .bmi-chart-head strong { font-size: 1.75rem; }
      .bmi-chart-scale { display: flex; position: relative; height: 0.75rem; margin-top: 1.25rem; border-radius: 1rem; overflow: visible; }
      .bmi-chart-segment { height: 100%; }
      .bmi-chart-low { width: 46.25%; background: #6b9ee8; border-radius: 1rem 0 0 1rem; }
      .bmi-chart-normal { width: 16.25%; background: var(--moss); }
      .bmi-chart-high { width: 12.5%; background: #d97706; }
      .bmi-chart-very-high { width: 25%; background: var(--ember); border-radius: 0 1rem 1rem 0; }
      .bmi-chart-marker { position: absolute; top: 50%; width: 1rem; height: 1rem; border: 0.2rem solid var(--chalk); border-radius: 50%; background: var(--ink); transform: translate(-50%, -50%); box-shadow: 0 0 0 0.15rem var(--ember); }
      .bmi-chart-labels { display: flex; justify-content: space-between; gap: 0.25rem; margin-top: 0.6rem; color: var(--slate); font-size: 0.65rem; }
      .bmi-chart-note { margin: 0.8rem 0 0; color: var(--slate); font-size: 0.7rem; line-height: 1.4; }
      .bmi-result-card { margin-top: 1.5rem; padding: 1rem 1.1rem; border: 1px solid var(--line); border-left: 4px solid var(--moss); background: var(--chalk-soft); border-radius: 8px; }
      .bmi-result-card--muted { border-left-style: dashed; border-left-color: var(--line); }
      .bmi-result-card__label { font-size: 0.75rem; color: var(--slate); text-transform: uppercase; letter-spacing: 0.06em; }
      .bmi-result-card__value { display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap; margin-top: 4px; }
      .bmi-result-card__value strong { font-size: 2rem; }
      .bmi-result-card__value span { font-weight: 700; }
      .bmi-result-card p { font-size: 0.875rem; color: var(--text-secondary); line-height: 1.6; margin: 0.5rem 0 0; }
      .bmi-result-card__note { font-size: 0.75rem !important; color: var(--slate) !important; margin-top: 0.75rem !important; }
      @media (max-width: 640px) { .bmi-resume-grid { grid-template-columns: 1fr; } }
    </style>
  `;

  if (state.quizStep >= QUIZ_STEPS.length) {
    const coachP = getMatchingCoachProgram(state.quizAnswers.objectif, state.quizAnswers.lieu);
    const programName = getCoachProgramDisplayName(coachP);
    const assessment = shouldComputeBmi() ? getBmiAssessment(state.quizAnswers.physique) : null;
    const actionButton = state.role === "client"
      ? `<div style="display: flex; gap: 12px; flex-wrap: wrap; margin-top: 1.5rem;">
           <button class="btn btn-ember" data-nav="client-dashboard" aria-label="Voir mon tableau de bord">Voir mon tableau de bord ${icon("arrow-right", 14)}</button>
           <button type="button" class="btn btn-outline-dark" data-quiz-restart>${icon("rotate-ccw", 14)} Refaire le questionnaire</button>
         </div>`
      : `<div style="display: flex; gap: 12px; flex-wrap: wrap; margin-top: 1.5rem;">
           <button class="btn btn-ember" data-quiz-confirm aria-label="Créer mon compte et démarrer">Créer mon compte pour continuer ${icon("arrow-right", 14)}</button>
           <button type="button" class="btn btn-outline-dark" data-quiz-restart>${icon("rotate-ccw", 14)} Recommencer le test</button>
         </div>`;

    return `
    ${quizAnimation}
    <div class="section wrap">
      <p class="eyebrow-moss font-mono">RÉSULTAT</p>
      <h1 class="h2 font-display">Ton programme : ${escapeHtml(programName)}</h1>
      <div class="card" style="padding:2rem; animation: fadeIn 0.6s ease-out;max-width:100%;">
        ${icon(coachP.icon || "dumbbell", 1.75, "var(--accent-primary)")}
        <p style="font-size:1rem;color:var(--text-secondary);margin-top:1rem; line-height: 1.7;">${escapeHtml(coachP.objective || coachP.subtitle || "")}</p>
        <div class="font-mono" style="font-size:0.875rem;color:var(--accent-secondary);margin-top:1rem">${escapeHtml(coachP.duration || "")} · ${escapeHtml(coachP.frequency || "")}</div>
        ${renderBmiResultCard(assessment)}
        ${state.role === "guest" && assessment ? `<p style="font-size: 0.95rem; color: var(--ink); font-weight: 700; line-height: 1.6; margin: 1.25rem 0 0;">Crée ton compte pour enregistrer ton IMC et démarrer ce programme.</p>` : ""}
        ${actionButton}
      </div>
    </div>`;
  }

  const s = QUIZ_STEPS[state.quizStep];
  const pct = Math.round((state.quizStep / (QUIZ_STEPS.length - 1)) * 100);

  let options = s.options || [];
  if (s.key === "lieu") {
    const list = (state.tracks && state.tracks.length > 0) ? state.tracks : (s.options?.length ? s.options : TRACKS);
    options = list.map((t) => ({
      v: t.v || t.id,
      l: t.l || t.label || t.name || "",
      icon: t.icon || "dumbbell",
    })).filter((opt) => opt.v && opt.l);
  }

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
      <div class="quiz-buttons" style="flex-wrap: wrap;">
        ${state.quizStep > 0 ? `<button type="button" class="btn btn-outline-dark" data-quiz-back>${icon("arrow-left", 14)} Retour</button>` : ``}
        <button type="button" class="btn btn-ember" data-quiz-next>${s.button || "Suivant"}</button>
        ${state.quizStep > 0 ? `<button type="button" class="btn btn-outline-dark" data-quiz-restart style="margin-left:auto;">${icon("rotate-ccw", 14)} Recommencer</button>` : ``}
        <button type="button" class="btn btn-outline-dark" data-nav="${state.role === "client" ? "client-dashboard" : "home"}">Reprendre plus tard</button>
      </div>
    `;
  } else if (s.type === "info") {
    content = `
      <div style="margin-top: 1.75rem;">
        <p style="font-size: 1.125rem; color: var(--slate); line-height: 1.7; max-width: 500px;">Réponds simplement pour découvrir le programme idéal. Si tu acceptes, ton IMC sera calculé à partir de ton poids et ta taille.</p>
        <div class="quiz-buttons" style="margin-top: 2rem;">
          <button type="button" class="btn btn-ember" data-quiz-next>${s.button || "Commencer"}</button>
        </div>
      </div>
    `;
  } else if (s.type === "optional") {
    content = `
      <p style="max-width: 520px; color: var(--slate); line-height: 1.6; margin: 0 0 1rem;">Ces infos permettent de calculer ton IMC et de l'afficher sur ton résumé de programme.</p>
      <div class="quiz-optional-fields">
        ${s.fields.map((field) => `
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
      <div class="quiz-buttons" style="flex-wrap: wrap;">
        ${state.quizStep > 0 ? `<button type="button" class="btn btn-outline-dark" data-quiz-back>${icon("arrow-left", 14)} Retour</button>` : ``}
        <button type="button" class="btn btn-outline-dark" data-quiz-skip>Passer</button>
        <button type="button" class="btn btn-ember" data-quiz-next>Suivant</button>
        ${state.quizStep > 0 ? `<button type="button" class="btn btn-outline-dark" data-quiz-restart style="margin-left:auto;">${icon("rotate-ccw", 14)} Recommencer</button>` : ``}
        <button type="button" class="btn btn-outline-dark" data-nav="${state.role === "client" ? "client-dashboard" : "home"}">Reprendre plus tard</button>
      </div>
    `;
  } else if (s.type === "resume") {
    const result = trackById(state.quizAnswers.lieu);
    const coachP = getMatchingCoachProgram(state.quizAnswers.objectif, state.quizAnswers.lieu);
    const assessment = shouldComputeBmi() ? getBmiAssessment(state.quizAnswers.physique) : null;
    const bmiResumeHtml = !shouldComputeBmi()
      ? `<div class="quiz-resume-item">
          <strong>IMC non calculé</strong>
          <p style="margin: 0.5rem 0 0; color: var(--slate); line-height: 1.5;">Tu as refusé l'utilisation de tes données physiques. L'orientation repose sur tes autres réponses.</p>
        </div>`
      : assessment
      ? `<div class="bmi-resume-grid">
          ${renderBmiChart(assessment)}
          <div class="quiz-resume-item" style="border-left-color: ${assessment.color};">
            <div style="display: flex; align-items: baseline; gap: 0.5rem; flex-wrap: wrap;">
              <strong>IMC : ${assessment.value.toFixed(1)}</strong>
              <span style="color: ${assessment.color}; font-weight: 700;">${assessment.status}</span>
            </div>
            <p style="margin: 0.5rem 0 0; color: var(--slate); line-height: 1.5;"><strong>Orientation :</strong> ${escapeHtml(assessment.advice)}</p>
          </div>
        </div>`
      : `<div class="quiz-resume-item">
          <strong>IMC non calculé</strong>
          <p style="margin: 0.5rem 0 0; color: var(--slate); line-height: 1.5;">Renseigne ton poids et ta taille pour obtenir ton IMC et une orientation plus précise.</p>
        </div>`;

    content = `
      <div class="quiz-resume">
        <div class="quiz-resume-item">Objectif : <strong>${escapeHtml(getGoalLabel(state.quizAnswers.objectif))}</strong></div>
        <div class="quiz-resume-item">Lieu : <strong>${escapeHtml(result.label)}</strong></div>
        <div class="quiz-resume-item">Programme : <strong>${escapeHtml(getCoachProgramDisplayName(coachP))}</strong></div>
        ${state.quizAnswers.physique?.poids ? `<div class="quiz-resume-item">Poids : <strong>${escapeHtml(state.quizAnswers.physique.poids)} kg</strong></div>` : ""}
        ${state.quizAnswers.physique?.taille ? `<div class="quiz-resume-item">Taille : <strong>${escapeHtml(state.quizAnswers.physique.taille)} cm</strong></div>` : ""}
        ${state.quizAnswers.physique?.age ? `<div class="quiz-resume-item">Âge : <strong>${escapeHtml(state.quizAnswers.physique.age)} ans</strong></div>` : ""}
        ${bmiResumeHtml}
      </div>
      <div class="quiz-buttons" style="flex-wrap: wrap; margin-top: 1.5rem;">
        <button type="button" class="btn btn-outline-dark" data-quiz-back>${icon("arrow-left", 14)} Retour</button>
        <button type="button" class="btn btn-ember" data-quiz-confirm>${state.role === "guest" ? "Créer mon compte pour continuer" : "Confirmer et commencer"}</button>
        <button type="button" class="btn btn-outline-dark" data-quiz-restart style="margin-left:auto;">${icon("rotate-ccw", 14)} Recommencer</button>
      </div>
    `;
  } else {
    content = `
      <div class="quiz-options" style="margin-top:1.75rem">
        ${options.map((opt) => `
          <button type="button" class="quiz-option" data-quiz-answer="${s.key}:${opt.v}" aria-label="${opt.l}">
            ${opt.icon ? icon(opt.icon, 1) : ""}
            <span>${opt.l}</span>
            <span>${icon("arrow-right", 1)}</span>
          </button>
        `).join("")}
      </div>
      <div class="quiz-buttons" style="margin-top: 24px; flex-wrap: wrap;">
        ${state.quizStep > 0 ? `<button type="button" class="btn btn-outline-dark" data-quiz-back>${icon("arrow-left", 14)} Retour</button>` : ``}
        ${state.quizStep > 0 ? `<button type="button" class="btn btn-outline-dark" data-quiz-restart>${icon("rotate-ccw", 14)} Recommencer</button>` : ``}
        <button type="button" class="btn btn-outline-dark" data-nav="${state.role === "client" ? "client-dashboard" : "home"}">Reprendre plus tard</button>
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
