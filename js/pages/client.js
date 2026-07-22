/* ==========================================================
   pages/client.js — Espace client (tableau de bord, programme, progression).
   Refonte Premium / Professionnel
   ========================================================== */

import { state } from "../state.js";
import { icon, escapeHtml } from "../helpers.js";

/**
 * 1. TABLEAU DE BORD (DASHBOARD)
 */
export function renderClientDashboard() {
  const profile = state.clientProfile || {};
  const program = profile.program || null;
  const firstName = profile.firstName || "Cher client";
  
  const goalLabel = {
    remise: "Remise en forme",
    "perte-poids": "Perte de poids",
    musculation: "Musculation",
    endurance: "Endurance",
    sante: "Santé générale",
    "endurance-sante": "Endurance & Santé",
  }[profile.goal] || profile.goal || "Objectif à définir";

  // --- SI AUCUN PROGRAMME (En attente d'onboarding) ---
  if (!program || !program.sessions?.length) {
    return `
    <div class="wrap client-page">
      <div class="client-header">
        <p class="client-eyebrow">Bienvenue</p>
        <h1 class="client-title">Bonjour ${escapeHtml(firstName)}, prêt à commencer ?</h1>
        <p class="client-subtitle">Nous avons besoin de quelques informations pour construire un programme 100% adapté à votre profil et vos objectifs.</p>
      </div>

      <div class="client-empty-state">
        <div class="client-empty-icon">
          ${icon("activity", 40)}
        </div>
        <h2 class="client-empty-title">Votre programme personnalisé vous attend</h2>
        <p class="client-empty-text">Répondez à quelques questions rapides sur vos habitudes, votre matériel et vos attentes. Je m'occupe du reste pour vous fournir un plan d'action précis.</p>
        <button class="btn btn-primary" data-nav="quiz" style="font-size: 16px; padding: 16px 32px;">
          Démarrer mon onboarding ${icon("arrow-right", 18)}
        </button>
      </div>
    </div>`;
  }

  // --- SI PROGRAMME ACTIF ---
  const week = program.week || 1;
  const totalWeeks = program.totalWeeks || 8;
  const progressPct = totalWeeks ? Math.round((week / totalWeeks) * 100) : 0;
  const sessions = program.sessions || [];
  const totalDone = sessions.filter(s => s.done).length;
  
  return `
  <div class="wrap client-page">
    <div class="client-header">
      <p class="client-eyebrow">Tableau de bord</p>
      <h1 class="client-title">Ravi de vous revoir, ${escapeHtml(firstName)}.</h1>
      <p class="client-subtitle">La régularité est la clé de votre transformation. Voici où vous en êtes dans votre parcours.</p>
    </div>

    <!-- PROCHAINE SÉANCE (Hero Card) -->
    <div class="client-hero-card">
      <div class="client-hero-content">
        <span class="client-hero-label">Prochaine séance</span>
        <h2 class="client-hero-title">${escapeHtml(nextSession)}</h2>
        <div class="client-hero-actions">
          <button class="btn btn-primary" data-nav="client-program">${icon("play-circle", 16)} Démarrer maintenant</button>
          <button class="btn btn-outline-dark" data-nav="client-program">Voir mon plan</button>
        </div>
      </div>
      <div class="client-hero-bg">
        ${icon("zap", 200)}
      </div>
    </div>

    <!-- RÉSUMÉ DE PROGRESSION -->
    <div class="client-progress-row">
      <div class="client-progress-box">
        <div class="client-pb-head">
          <div class="client-pb-lbl">Semaine active</div>
          <div class="client-pb-val">${week} <span style="font-size:16px;color:var(--slate);">/ ${totalWeeks}</span></div>
        </div>
        <div class="client-pb-bar"><div class="client-pb-fill" style="width: ${progressPct}%"></div></div>
      </div>
      
      <div class="client-progress-box">
        <div class="client-pb-head">
          <div class="client-pb-lbl">Séances complétées</div>
          <div class="client-pb-val" style="color: var(--moss);">${totalDone}</div>
        </div>
        <div class="client-pb-bar"><div class="client-pb-fill" style="width: ${totalDone > 0 ? 100 : 0}%"></div></div>
      </div>
    </div>

    <!-- INFORMATIONS & ACTIONS -->
    <div class="client-grid-2">
      <div class="client-card">
        <h3 class="client-card-title">Votre Profil</h3>
        <div class="client-list-item">
          <div class="client-list-label">${icon("target", 16)} Objectif</div>
          <div class="client-list-val">${escapeHtml(goalLabel)}</div>
        </div>
        <div class="client-list-item">
          <div class="client-list-label">${icon("dumbbell", 16)} Équipement</div>
          <div class="client-list-val">${escapeHtml(program.trackLabel || "Standard")}</div>
        </div>
        <div class="client-list-item" style="border: none; padding-bottom: 0;">
          <div class="client-list-label">${icon("calendar", 16)} Fréquence</div>
          <div class="client-list-val">3-4 séances / sem</div>
        </div>
      </div>

      <div class="client-card" style="display:flex; flex-direction:column; justify-content:center; text-align:center;">
        <div style="color:var(--ember); margin-bottom:16px;">${icon("message-circle", 40)}</div>
        <h3 class="client-card-title">Besoin d'aide ?</h3>
        <p style="color:var(--slate); font-size:14px; margin:0 0 24px; line-height:1.5;">Je suis disponible pour ajuster votre programme ou répondre à vos questions sur un mouvement.</p>
        <a href="https://wa.me/33600000000" target="_blank" rel="noopener noreferrer" class="btn btn-outline-dark" style="margin: 0 auto; text-decoration: none; display: inline-flex; align-items: center; gap: 8px;">Contacter Coach Abdoul</a>
      </div>
    </div>
  </div>`;
}

/**
 * 2. MON PROGRAMME (TIMELINE)
 */
export function renderClientProgram() {
  const program = state.clientProfile?.program || null;
  
  if (!program || !program.sessions?.length) {
    return `
    <div class="wrap client-page">
      <div class="client-header">
        <p class="client-eyebrow">Mon Programme</p>
        <h1 class="client-title">Programme non défini</h1>
      </div>
      <div class="client-empty-state">
        <div class="client-empty-icon">${icon("calendar", 40)}</div>
        <h2 class="client-empty-title">Rien à afficher pour le moment</h2>
        <p class="client-empty-text">Terminez d'abord votre onboarding pour que je puisse construire vos séances.</p>
        <button class="btn btn-primary" data-nav="quiz">Continuer l'onboarding</button>
      </div>
    </div>`;
  }

  return `
  <div class="wrap client-page">
    <div class="client-header">
      <p class="client-eyebrow">Mon Programme</p>
      <h1 class="client-title">${escapeHtml(program.trackLabel || "Parcours sur-mesure")}</h1>
      <p class="client-subtitle">Semaine ${program.week} — Retrouvez ci-dessous le détail de vos séances. Cochez-les au fur et à mesure pour suivre votre avancée.</p>
    </div>

    <div class="client-timeline">
      ${program.sessions.map((s) => `
        <div class="client-tl-item ${s.done ? 'done' : ''}">
          <div class="client-tl-icon">
            ${icon(s.done ? "check" : "play", 20)}
          </div>
          <div class="client-tl-content">
            <h3 class="client-tl-title">${escapeHtml(s.name)}</h3>
            <div class="client-tl-meta">${s.exos} exercices · ${s.duree} estimée</div>
          </div>
          <div>
            <button type="button" class="${s.done ? 'btn btn-outline-dark' : 'btn btn-primary'}" data-session-action="${s.done ? 'review' : 'start'}" data-session-name="${escapeHtml(s.name)}">
              ${s.done ? "Revoir la séance" : "Commencer"}
            </button>
          </div>
        </div>
      `).join("")}
    </div>
  </div>`;
}

/**
 * 3. MA PROGRESSION
 */
export function renderClientProgress() {
  const program = state.clientProfile?.program || null;
  const history = program?.history || [];
  
  if (!history.length) {
    return `
    <div class="wrap client-page">
      <div class="client-header">
        <p class="client-eyebrow">Ma Progression</p>
        <h1 class="client-title">Historique vierge</h1>
      </div>
      <div class="client-empty-state">
        <div class="client-empty-icon">${icon("trending-up", 40)}</div>
        <h2 class="client-empty-title">C'est le moment de vous lancer</h2>
        <p class="client-empty-text">Dès que vous aurez terminé votre première séance, vos statistiques apparaîtront ici.</p>
        <button class="btn btn-primary" data-nav="client-program">Voir mon programme</button>
      </div>
    </div>`;
  }

  return `
  <div class="wrap client-page">
    <div class="client-header">
      <p class="client-eyebrow">Ma Progression</p>
      <h1 class="client-title">Historique de vos efforts</h1>
      <p class="client-subtitle">Visualisez vos semaines passées et célébrez vos victoires.</p>
    </div>

    <div class="client-grid-2">
      ${history.map((h) => {
        const pct = Math.round((h.done / h.total) * 100);
        return `
        <div class="client-progress-box">
          <div class="client-pb-head">
            <div class="client-pb-lbl" style="font-family:'Archivo Black', sans-serif; font-size:16px; color:var(--ink);">${h.name}</div>
            <div class="client-pb-val" style="font-size: 16px; color: var(--slate);">${h.done}/${h.total} Séances</div>
          </div>
          <div class="client-pb-bar"><div class="client-pb-fill" style="width: ${pct}%"></div></div>
          <div style="font-size:12px; color:var(--moss); font-weight:600; text-align:right; margin-top:8px;">
            ${pct === 100 ? "Semaine validée ! 🏆" : ""}
          </div>
        </div>`;
      }).join("")}
    </div>
  </div>`;
}
