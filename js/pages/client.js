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
  const track = trackById(profile.track || "home-equip");
  const week = program?.week || 1;
  const totalWeeks = program?.totalWeeks || 10;
  const pct = totalWeeks ? Math.round((week / totalWeeks) * 100) : 0;
  const history = program?.history || [];
  const currentWeek = history.length ? history[history.length - 1] : { name: "Semaine 1", done: 0, total: 0 };
  const totalDone = history.reduce((sum, h) => sum + (h.done || 0), 0);
  const nextSession = program?.nextSession || "Programme non défini";
  return `
  <div class="section wrap">
    <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:16px">
      <div>
        <h1 class="h2 font-display" style="margin-bottom:6px">Tableau de bord</h1>
        <div style="font-size:15px;color:var(--ink);font-weight:700">${escapeHtml(clientName)}</div>
        <div style="font-size:13px;color:var(--slate);margin-top:4px">Objectif : ${escapeHtml(goalLabel)}</div>
      </div>
    </div>
    <div class="grid-2" style="grid-template-columns:2fr 1fr">
      <div class="card">
        <div class="font-mono" style="font-size:12px;color:var(--ink-muted3);display:flex;align-items:center;gap:8px">${icon(track.icon, 14, "var(--ember)")} ${track.label}</div>
        <h2 class="font-display" style="font-size:18px;color:var(--ink);margin-top:8px">Semaine ${week} / ${totalWeeks}</h2>
        <div class="progress-bar-bg"><div class="progress-bar-fill" style="width:${pct}%"></div></div>
        <p style="font-size:14px;color:var(--slate);margin-top:16px">Prochaine séance</p>
        <div style="display:flex;align-items:center;justify-content:space-between;margin-top:8px;padding:16px;border-radius:2px;background:var(--chalk-soft)">
          <div style="display:flex;align-items:center;gap:12px">${icon("play", 18, "var(--ember)")}<span style="font-size:14px;font-weight:600;color:var(--ink)">${escapeHtml(nextSession)}</span></div>
          <button class="btn-primary" data-nav="client-program">Démarrer</button>
        </div>
      </div>
      <div class="card">
        <div class="font-mono" style="font-size:12px;color:var(--ink-muted3);display:flex;align-items:center;gap:8px">${icon("bar-chart-3", 14)} RÉGULARITÉ</div>
        <div style="margin-top:16px;display:flex;align-items:flex-end;gap:8px;height:96px">
          ${history.length ? history.map((h, i) => `
            <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px">
              <div style="width:100%;display:flex;flex-direction:column;justify-content:flex-end;height:64px">
                <div style="width:100%;border-radius:2px 2px 0 0;height:${(h.done / h.total) * 100}%;background:${h.done === h.total ? "var(--moss)" : "var(--ember)"}"></div>
              </div>
              <span class="font-mono" style="font-size:10px;color:var(--ink-muted3)">S${i + 1}</span>
            </div>`).join("") : `<div style="font-size:14px;color:var(--slate);padding:16px 0;">Pas encore de données d'historique. Termine l'onboarding pour générer ton programme.</div>`}
        </div>
      </div>
    </div>
    <div class="grid-3" style="margin-top:24px">
      <div class="stat-card">${icon("calendar", 20, "var(--moss)")}<div><div class="stat-val font-display">${currentWeek.done} / ${currentWeek.total}</div><div class="stat-label">Séances cette semaine</div></div></div>
      <div class="stat-card">${icon("trending-up", 20, "var(--moss)")}<div><div class="stat-val font-display">${totalDone}</div><div class="stat-label">Séances totales validées</div></div></div>
      <div class="stat-card" style="flex-direction:column;align-items:flex-start;gap:12px">
        ${icon("mail", 20, "var(--moss)")}
        <div>
          <div class="stat-val font-display">Contact coach</div>
          <div class="stat-label">Envoyer une demande via Gmail</div>
        </div>
        <a class="btn btn-ember" href="https://mail.google.com/mail/?view=cm&fs=1&to=djabaraboul.032003@gmail.com" target="_blank" rel="noreferrer noopener">Contacter coach</a>
        <button class="btn-logout" data-nav="home" data-logout="1" aria-label="Se déconnecter">${icon("log-out", 14)} Déconnexion</button>
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
      <div class="card" style="max-width:560px;padding:24px">
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
  const activeLabel = state.activeSession ? `<p class="font-mono" style="font-size:0.9rem;color:var(--ink-muted3);margin-bottom:18px">Tu as ouvert : ${escapeHtml(state.activeSession)}</p>` : "";
  if (!history.length) {
    return `
    <div class="section wrap">
      <p class="eyebrow-moss font-mono">MA PROGRESSION</p>
      <h1 class="h2 font-display">Aucun historique pour le moment</h1>
      <div class="card" style="max-width:560px;padding:24px">
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
    <div style="display:grid;gap:16px">
      ${history.map((h) => `
        <div style="display:flex;align-items:center;gap:16px">
          <span class="font-mono" style="font-size:12px;color:var(--ink-muted3);width:80px">${h.name}</span>
          <div class="progress-bar-bg" style="flex:1;margin-top:0"><div class="progress-bar-fill" style="width:${(h.done / h.total) * 100}%"></div></div>
          <span class="font-mono" style="font-size:12px;color:var(--ink);width:48px;text-align:right">${h.done}/${h.total}</span>
        </div>`).join("")}
    </div>
  </div>`;
}
