/* ==========================================================
   pages/quiz.js — Quiz d'onboarding (personnalisation du programme).
   ========================================================== */

import { QUIZ_STEPS } from "../data.js";
import { state } from "../state.js";
import { icon, trackById, escapeHtml } from "../helpers.js";

function getBmiAssessment(physique) {
  const weight = Number(physique?.poids);
  const height = Number(physique?.taille);
  const bmi = weight > 0 && height > 0 ? weight / ((height / 100) ** 2) : null;

  if (bmi === null) return null;
  if (bmi < 18.5) {
    return {
      value: bmi,
      status: "Insuffisance pondérale",
      advice: "Une orientation vers un programme de prise de muscle, avec progression progressive et récupération suffisante, peut être pertinente."
    };
  }
  if (bmi < 25) {
    return {
      value: bmi,
      status: "Corpulence dans la norme",
      advice: "Tu peux suivre l'objectif que tu as choisi : le programme sera ajusté à ton niveau et à ton environnement."
    };
  }
  if (bmi < 30) {
    return {
      value: bmi,
      status: "Surpoids",
      advice: "Une orientation vers un programme de perte de poids progressif, combinant renforcement et endurance, peut être adaptée."
    };
  }
  return {
    value: bmi,
    status: "Obésité",
    advice: "Une reprise progressive, orientée vers la perte de poids et adaptée à tes capacités, est recommandée. Un avis médical peut compléter cet accompagnement."
  };
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
      .quiz-resume { display: grid; gap: 0.75rem; max-width: 420px; text-align: left; }
      .quiz-resume-item { padding: 0.75rem; background: var(--surface); border-radius: 0.125rem; border-left: 0.1875rem solid var(--accent-primary); }
      .bmi-resume-grid { display: grid; grid-template-columns: minmax(220px, 0.85fr) minmax(280px, 1.15fr); gap: 1rem; margin-top: 0.25rem; }
      .bmi-chart { padding: 1rem; border: 1px solid rgba(247, 245, 240, 0.16); border-radius: 0.125rem; background: rgba(247, 245, 240, 0.06); }
      .bmi-chart-head { display: flex; align-items: center; justify-content: space-between; gap: 1rem; color: var(--ink-muted2); }
      .bmi-chart-head span { font-size: 0.7rem; }
      .bmi-chart-head strong { color: var(--ember); font-size: 1.75rem; }
      .bmi-chart-scale { display: flex; position: relative; height: 0.75rem; margin-top: 1.25rem; border-radius: 1rem; overflow: visible; }
      .bmi-chart-segment { height: 100%; }
      .bmi-chart-low { width: 46.25%; background: #6b9ee8; border-radius: 1rem 0 0 1rem; }
      .bmi-chart-normal { width: 16.25%; background: var(--moss); }
      .bmi-chart-high { width: 12.5%; background: #d97706; }
      .bmi-chart-very-high { width: 25%; background: var(--ember); border-radius: 0 1rem 1rem 0; }
      .bmi-chart-marker { position: absolute; top: 50%; width: 1rem; height: 1rem; border: 0.2rem solid var(--chalk); border-radius: 50%; background: var(--ink); transform: translate(-50%, -50%); box-shadow: 0 0 0 0.15rem var(--ember); }
      .bmi-chart-labels { display: flex; justify-content: space-between; gap: 0.25rem; margin-top: 0.6rem; color: var(--ink-muted3); font-size: 0.65rem; }
      .bmi-chart-note { margin: 0.8rem 0 0; color: var(--ink-muted3); font-size: 0.7rem; line-height: 1.4; }
      @media (max-width: 640px) { .bmi-resume-grid { grid-template-columns: 1fr; } }
    </style>
  `;

  if (state.quizStep >= QUIZ_STEPS.length) {
    const result = trackById(state.quizAnswers.lieu);
    const physique = state.quizAnswers.physique || {};
    const weight = Number(physique.poids);
    const height = Number(physique.taille);
    const bmi = weight > 0 && height > 0 ? weight / ((height / 100) ** 2) : null;
    let bmiStatus = "";
    let bmiMessage = "";
    let bmiColor = "var(--moss)";

    if (bmi !== null) {
      if (bmi < 18.5) {
        bmiStatus = "Insuffisance pondérale";
        bmiMessage = "Ton programme va t'aider à progresser progressivement, avec un travail adapté à ton niveau et à ta récupération.";
        bmiColor = "#2563eb";
      } else if (bmi < 25) {
        bmiStatus = "Corpulence dans la norme";
        bmiMessage = "Tu as une bonne base pour construire un programme régulier et progresser durablement vers ton objectif.";
      } else if (bmi < 30) {
        bmiStatus = "Surpoids";
        bmiMessage = "Un accompagnement progressif peut t'aider à retrouver plus d'aisance, d'énergie et de régularité dans tes séances.";
        bmiColor = "#d97706";
      } else {
        bmiStatus = "Obésité";
        bmiMessage = "Un programme progressif et personnalisé peut t'aider à reprendre l'activité en respectant ton rythme et tes capacités.";
        bmiColor = "var(--ember)";
      }
    }

    const bmiHtml = bmi !== null
      ? `<div style="margin-top: 1.5rem; padding: 1rem; border: 1px solid var(--line); border-left: 4px solid ${bmiColor}; background: var(--chalk-soft); border-radius: 6px;">
          <div class="font-mono" style="font-size: 0.75rem; color: var(--slate); text-transform: uppercase;">Ton résultat IMC</div>
          <div style="display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap; margin-top: 4px;">
            <strong style="font-size: 2rem; color: ${bmiColor};">${bmi.toFixed(1)}</strong>
            <span style="font-weight: 700; color: ${bmiColor};">${bmiStatus}</span>
          </div>
          <p style="font-size: 0.875rem; color: var(--text-secondary); line-height: 1.6; margin: 0.5rem 0 0;">${bmiMessage}</p>
          <p style="font-size: 0.75rem; color: var(--slate); line-height: 1.5; margin: 0.75rem 0 0;">L'IMC est un indicateur général, pas un diagnostic médical.</p>
        </div>`
      : state.bmiConsent === false
      ? `<div style="margin-top: 1.5rem; padding: 1rem; border: 1px dashed var(--line); background: var(--chalk-soft); border-radius: 6px;">
          <strong style="color: var(--ink);">IMC non calculé</strong>
          <p style="font-size: 0.875rem; color: var(--slate); line-height: 1.6; margin: 0.5rem 0 0;">Tu as choisi de ne pas utiliser tes données physiques. Ton programme est personnalisé à partir de tes autres réponses.</p>
        </div>`
      : `<div style="margin-top: 1.5rem; padding: 1rem; border: 1px dashed var(--line); background: var(--chalk-soft); border-radius: 6px;">
          <strong style="color: var(--ink);">Obtiens aussi ton IMC personnalisé</strong>
          <p style="font-size: 0.875rem; color: var(--slate); line-height: 1.6; margin: 0.5rem 0 0;">Renseigne ton poids et ta taille à l'étape précédente pour recevoir ce repère avec ton programme.</p>
        </div>`;
    const actionButton = state.role === 'client'
      ? `<div style="display: flex; gap: 12px; flex-wrap: wrap; margin-top: 1.5rem;">
           <button class="btn btn-ember" data-nav="client-dashboard" aria-label="Voir mon tableau de bord">Voir mon tableau de bord ${icon("arrow-right", 14)}</button>
           <button type="button" class="btn btn-outline-dark" data-quiz-restart>${icon("rotate-ccw", 14)} Refaire le questionnaire</button>
         </div>`
      : `<div style="display: flex; gap: 12px; flex-wrap: wrap; margin-top: 1.5rem;">
           <button class="btn btn-ember" data-nav="signup" aria-label="Créer mon compte et démarrer">Créer mon compte et démarrer ${icon("arrow-right", 14)}</button>
           <button type="button" class="btn btn-outline-dark" data-quiz-restart>${icon("rotate-ccw", 14)} Recommencer le test</button>
         </div>`;

    return `
    ${quizAnimation}
    <div class="section" style="background: var(--ink); color: var(--chalk); min-height: 100%;">
      <div class="wrap">
      <p class="eyebrow-ember font-mono">RÉSULTAT</p>
      <h1 class="h2 font-display" style="color: var(--chalk);">Ton point de départ : ${result.label}</h1>
      <div class="card" style="padding:2rem; animation: fadeIn 0.6s ease-out;max-width:100%; background: rgba(247, 245, 240, 0.06); border-color: rgba(247, 245, 240, 0.16);">
        ${icon(result.icon, 1.75, "var(--accent-primary)")}
        <p style="font-size:1rem;color:var(--ink-muted2);margin-top:1rem; line-height: 1.7;">${result.desc}</p>
        <div class="font-mono" style="font-size:0.875rem;color:var(--ember);margin-top:1rem">${result.dist}</div>
        ${bmiHtml}
        ${state.role === 'guest' ? `<p style="font-size: 0.95rem; color: var(--ink); font-weight: 700; line-height: 1.6; margin: 1.5rem 0 0;">Ton analyse est prête. Crée ton compte pour enregistrer ton résultat IMC et commencer ton programme personnalisé.</p>` : ""}
        ${actionButton}
      </div>
      </div>
    </div>`;
  }

  const s = QUIZ_STEPS[state.quizStep];
  const pct = Math.round((state.quizStep / (QUIZ_STEPS.length - 1)) * 100); // Exclut l'étape "resume"

  let options = s.options || [];
  if (s.key === "lieu") {
    const list = state.tracks && state.tracks.length > 0 ? state.tracks : s.options;
    options = list.map(t => ({
      v: t.id,
      l: t.label,
      icon: t.icon
    }));
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
        <button type="button" class="btn btn-outline-dark" data-nav="${state.role === 'client' ? 'client-dashboard' : 'home'}">Reprendre plus tard</button>
      </div>
    `;
  } else if (s.type === "info") {
    // Écran d'accueil du quiz
    content = `
      <div style="margin-top: 1.75rem;">
        <p style="font-size: 1.125rem; color: var(--slate); line-height: 1.7; max-width: 500px;">Réponds simplement à 2 questions pour découvrir le programme d'entraînement idéal en fonction de ton environnement et de tes objectifs.</p>
        <div class="quiz-buttons" style="margin-top: 2rem;">
          <button type="button" class="btn btn-ember" data-quiz-next>${s.button || "Commencer"}</button>
        </div>
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
      <div class="quiz-buttons" style="flex-wrap: wrap;">
        ${state.quizStep > 0 ? `<button type="button" class="btn btn-outline-dark" data-quiz-back>${icon("arrow-left", 14)} Retour</button>` : ``}
        <button type="button" class="btn btn-outline-dark" data-quiz-skip>Passer</button>
        <button type="button" class="btn btn-ember" data-quiz-next>Suivant</button>
        ${state.quizStep > 0 ? `<button type="button" class="btn btn-outline-dark" data-quiz-restart style="margin-left:auto;">${icon("rotate-ccw", 14)} Recommencer</button>` : ``}
        <button type="button" class="btn btn-outline-dark" data-nav="${state.role === 'client' ? 'client-dashboard' : 'home'}">Reprendre plus tard</button>
      </div>
    `;
  } else if (s.type === "resume") {
    const result = trackById(state.quizAnswers.lieu);
    const bmiAssessment = state.bmiConsent === true
      ? getBmiAssessment(state.quizAnswers.physique)
      : null;
    const bmiChartHtml = bmiAssessment
      ? `<div class="bmi-chart" role="img" aria-label="Échelle de l'IMC : ${bmiAssessment.value.toFixed(1)}, ${bmiAssessment.status}">
          <div class="bmi-chart-head">
            <span class="font-mono">REPÈRE IMC</span>
            <strong>${bmiAssessment.value.toFixed(1)}</strong>
          </div>
          <div class="bmi-chart-scale">
            <span class="bmi-chart-segment bmi-chart-low"></span>
            <span class="bmi-chart-segment bmi-chart-normal"></span>
            <span class="bmi-chart-segment bmi-chart-high"></span>
            <span class="bmi-chart-segment bmi-chart-very-high"></span>
            <span class="bmi-chart-marker" style="left: ${Math.min(98, Math.max(2, (bmiAssessment.value / 40) * 100))}%;"></span>
          </div>
          <div class="bmi-chart-labels">
            <span>&lt; 18,5</span>
            <span>18,5–24,9</span>
            <span>25–29,9</span>
            <span>30+</span>
          </div>
          <p class="bmi-chart-note">Indicateur général, pas un diagnostic médical.</p>
        </div>`
      : "";
    const bmiResumeHtml = state.bmiConsent === false
      ? `<div class="quiz-resume-item">
          <strong>IMC non calculé</strong>
          <p style="margin: 0.5rem 0 0; color: var(--slate); line-height: 1.5;">Tu as refusé l'utilisation de tes données physiques. L'orientation repose sur tes autres réponses.</p>
        </div>`
      : bmiAssessment
      ? `<div class="bmi-resume-grid">
          ${bmiChartHtml}
          <div class="quiz-resume-item" style="border-left-color: var(--ember);">
            <div style="display: flex; align-items: baseline; gap: 0.5rem; flex-wrap: wrap;">
              <strong>IMC : ${bmiAssessment.value.toFixed(1)}</strong>
              <span style="color: var(--ember); font-weight: 700;">${bmiAssessment.status}</span>
            </div>
            <p style="margin: 0.5rem 0 0; color: var(--slate); line-height: 1.5;"><strong>Orientation :</strong> ${bmiAssessment.advice}</p>
          </div>
        </div>`
      : `<div class="quiz-resume-item">
          <strong>IMC non calculé</strong>
          <p style="margin: 0.5rem 0 0; color: var(--slate); line-height: 1.5;">Renseigne ton poids et ta taille pour obtenir ton IMC et une orientation plus précise.</p>
        </div>`;
    content = `
      <div class="quiz-resume">
        <div class="quiz-resume-item">Objectif : <strong>${escapeHtml(state.quizAnswers.objectif)}</strong></div>
        <div class="quiz-resume-item">Lieu : <strong>${escapeHtml(result.label)}</strong></div>
        ${state.quizAnswers.physique?.poids ? `<div class="quiz-resume-item">Poids : <strong>${escapeHtml(state.quizAnswers.physique.poids)} kg</strong></div>` : ""}
        ${state.quizAnswers.physique?.taille ? `<div class="quiz-resume-item">Taille : <strong>${escapeHtml(state.quizAnswers.physique.taille)} cm</strong></div>` : ""}
        ${state.quizAnswers.physique?.age ? `<div class="quiz-resume-item">Âge : <strong>${escapeHtml(state.quizAnswers.physique.age)} ans</strong></div>` : ""}
        ${bmiResumeHtml}
      </div>
      <div class="quiz-buttons" style="flex-wrap: wrap; margin-top: 1.5rem;">
        <button type="button" class="btn btn-outline-dark" data-quiz-back>${icon("arrow-left", 14)} Retour</button>
        <button type="button" class="btn btn-ember" data-quiz-confirm>Confirmer et commencer</button>
        <button type="button" class="btn btn-outline-dark" data-quiz-restart style="margin-left:auto;">${icon("rotate-ccw", 14)} Recommencer</button>
      </div>
    `;
  } else {
    content = `
      <div class="quiz-options" style="margin-top:1.75rem">
        ${options.map(opt => `
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
        <button type="button" class="btn btn-outline-dark" data-nav="${state.role === 'client' ? 'client-dashboard' : 'home'}">Reprendre plus tard</button>
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
