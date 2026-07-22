/* ==========================================================
   pages/client.js — Espace client (tableau de bord, programme, progression).
   ========================================================== */

import { state } from "../state.js";
import { icon, trackById, escapeHtml } from "../helpers.js";

export function renderClientDashboard() {
  const profile = state.clientProfile || {};
  const program = profile.program || null;
  const clientName = `${profile.firstName || "Client"}${profile.lastName ? ` ${profile.lastName}` : ""}`.trim();
  const goalLabel = {
    remise: "Remise en forme",
    "perte-poids": "Perte de poids",
    musculation: "Musculation",
    endurance: "Endurance",
    sante: "Santé générale",
  }[profile.goal] || profile.goal || "Objectif à définir";
  const week = program?.week || 0;
  const totalWeeks = program?.totalWeeks || 0;
  const progressPct = totalWeeks ? Math.round((week / totalWeeks) * 100) : 0;
  const history = program?.history || [];
  const nextSession = program?.nextSession || null;
  const totalDone = history.reduce((sum, h) => sum + (h.done || 0), 0);
  const completedWeeks = history.filter((h) => h.done === h.total).length;

  if (!program || !program.sessions?.length) {
    return `
    <div class="section wrap">
      <div class="client-dashboard">
        <div class="client-dashboard-header">
          <div>
            <p class="eyebrow-moss font-mono">Tableau de bord</p>
            <h1 class="client-dashboard-title font-display">Ton programme personnalisé n'est pas encore prêt</h1>
            <p class="client-dashboard-subtitle">Réponds à quelques questions pour recevoir un programme adapté à ton niveau, ton objectif et ton équipement.</p>
          </div>
          <div class="client-dashboard-meta">
            <div class="client-dashboard-action">
              <div>
                <strong>Objectif</strong>
                <span>${escapeHtml(goalLabel)}</span>
              </div>
            </div>
            <div class="client-dashboard-action">
              <div>
                <strong>Étape suivante</strong>
                <span>Onboarding</span>
              </div>
            </div>
          </div>
        </div>

        <div class="client-dashboard-card client-dashboard-card--panel">
          <h2>Commence ton onboarding</h2>
          <p>Plus tu termines vite, plus le programme correspondra à ton emploi du temps et à ton rythme.</p>
          <div class="client-dashboard-actions">
            <button class="btn-primary" data-nav="quiz">Continuer l'onboarding</button>
            <button class="btn btn-outline-dark" data-nav="home">Retour à l'accueil</button>
          </div>
        </div>
      </div>
    </div>`;
  }

  return `
  <div class="section wrap">
    <div class="client-dashboard">
      <div class="client-dashboard-header">
        <div>
          <p class="eyebrow-moss font-mono">Tableau de bord</p>
          <h1 class="client-dashboard-title font-display">Bonjour ${escapeHtml(profile.firstName || "Client")}, voici ton suivi.</h1>
          <p class="client-dashboard-subtitle">Ton programme est prêt. Reprends une séance, garde le rythme et reste motivé avec des objectifs clairs.</p>
        </div>
        <div class="client-dashboard-meta">
          <div class="client-dashboard-action">
            <strong>${week} / ${totalWeeks}</strong>
            <span>Semaines complétées</span>
          </div>
          <div class="client-dashboard-action">
            <strong>${progressPct}%</strong>
            <span>Avancement global</span>
          </div>
        </div>
      </div>

      <div class="client-dashboard-grid">
        <div class="client-dashboard-card">
          <h2>Prochaine séance</h2>
          <p>${escapeHtml(nextSession || "Aucune séance programmée pour le moment.")}</p>
          <div class="client-dashboard-actions">
            <button class="btn-primary" data-nav="client-program">Démarrer maintenant</button>
            <button class="btn btn-outline-dark" data-nav="client-progress">Voir l'historique</button>
          </div>
        </div>

        <div class="client-dashboard-card">
          <h2>Focus de la semaine</h2>
          <div class="client-dashboard-card-list">
            <div><span class="label">Séances prévues</span><span class="value">${history.length || 0}</span></div>
            <div><span class="label">Séances terminées</span><span class="value">${totalDone}</span></div>
            <div><span class="label">Semaines complètes</span><span class="value">${completedWeeks}</span></div>
          </div>
        </div>

        <div class="client-dashboard-card">
          <h2>Actions rapides</h2>
          <div class="client-dashboard-card-list">
            <div><span class="label">Reprendre ton programme</span><span class="value">${week <= totalWeeks ? `Semaine ${week}` : "Terminé"}</span></div>
            <div><span class="label">Objectif</span><span class="value">${escapeHtml(goalLabel)}</span></div>
            <div><span class="label">Équipement</span><span class="value">${escapeHtml(program.trackLabel || "Standard")}</span></div>
          </div>
          <div class="client-dashboard-actions">
            <button class="btn-primary" data-nav="client-program">Voir le programme</button>
            <button class="btn btn-outline-dark" data-nav="contact">Contacter coach</button>
          </div>
        </div>
      </div>

      <div class="client-dashboard-summary">
        <div class="client-dashboard-summary-item">
          <h3>Ton rythme</h3>
          <p>${history.length ? `Tu as complété ${totalDone} séances et ${completedWeeks} semaines entièrement.` : "Aucune séance validée encore. Commence aujourd'hui pour faire avancer ton suivi."}</p>
        </div>
        <div class="client-dashboard-summary-item">
          <h3>Motivation</h3>
          <p>${history.length ? "Continue sur cette lancée : la régularité est le meilleur levier pour des résultats durables." : "Fais ta première séance dès maintenant pour lancer ton programme."}</p>
        </div>
      </div>
    </div>
  </div>`;
}

export function renderClientProgram() {
  const program = state.clientProfile.program || null;
  if (!program || !program.sessions?.length) {
    return `
    <div class="section wrap">
      <p class="eyebrow-moss font-mono">MON PROGRAMME</p>
      <h1 class="h2 font-display">Programme non défini</h1>
      <div class="client-dashboard-card client-dashboard-card--panel">
        <p style="font-size:14px;color:var(--slate);line-height:1.7">Ton programme apparaîtra ici une fois ton onboarding complété. Pour le moment, avance dans le quiz pour recevoir une proposition personnalisée.</p>
        <button class="btn btn-ember" data-nav="quiz" style="margin-top:16px;">Continuer l'onboarding</button>
      </div>
    </div>`;
  }
  return `
  <div class="section wrap">
    <p class="eyebrow-moss font-mono">MON PROGRAMME</p>
    <h1 class="h2 font-display">${escapeHtml(program.trackLabel || "Programme personnalisé")} · Semaine ${program.week}</h1>
    ${program.sessions.map((s) => `
      <div class="session-row">
        <div class="session-left">
          <div class="session-icon" style="background:${s.done ? "var(--moss)" : "var(--chalk-soft)"}">${icon(s.done ? "check" : "video", 16, s.done ? "#F7F5F0" : "#6B7280")}</div>
          <div>
            <div class="font-display" style="font-size:14px;color:var(--ink)">${s.name}</div>
            <div style="font-size:12px;color:var(--slate);margin-top:2px">${s.exos} exercices · ${s.duree}</div>
          </div>
        </div>
        <button type="button" data-session-action="${s.done ? "review" : "start"}" data-session-name="${escapeHtml(s.name)}" style="font-size:14px;font-weight:600;padding:8px 16px;border-radius:2px;${s.done ? "background:transparent;color:var(--moss);border:1px solid var(--line)" : "background:var(--ember);color:var(--ink)"}">${s.done ? "Revoir" : "Commencer"}</button>
      </div>`).join("")}
  </div>`;
}

export function renderClientProgress() {
  const program = state.clientProfile.program || null;
  const history = program?.history || [];
  const activeLabel = state.activeSession ? `<p class="client-progress-active-label">Tu as ouvert : ${escapeHtml(state.activeSession)}</p>` : "";
  if (!history.length) {
    return `
    <div class="section wrap">
      <p class="eyebrow-moss font-mono">MA PROGRESSION</p>
      <h1 class="h2 font-display">Aucun historique pour le moment</h1>
      <div class="client-dashboard-card client-dashboard-card--panel">
        <p style="font-size:14px;color:var(--slate);line-height:1.7">La progression apparaît ici dès que tu auras commencé ton programme. Termine l'onboarding pour générer les séances.</p>
        <button class="btn btn-ember" data-nav="quiz" style="margin-top:16px;">Continuer l'onboarding</button>
      </div>
    </div>`;
  }
  return `
  <div class="section wrap">
    <p class="eyebrow-moss font-mono">MA PROGRESSION</p>
    <h1 class="h2 font-display">Historique des séances</h1>
    ${activeLabel}
    <div class="client-dashboard-grid">
      ${history.map((h) => `
        <div class="client-dashboard-card">
          <div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap;min-width:0">
            <span class="font-mono" style="font-size:12px;color:var(--ink-muted3);width:80px;min-width:0">${h.name}</span>
            <div class="progress-bar-bg" style="flex:1;min-width:0;margin-top:0"><div class="progress-bar-fill" style="width:${(h.done / h.total) * 100}%"></div></div>
            <span class="font-mono" style="font-size:12px;color:var(--ink);width:48px;min-width:0;text-align:right">${h.done}/${h.total}</span>
          </div>
        </div>`).join("")}
    </div>
  </div>`;
}
