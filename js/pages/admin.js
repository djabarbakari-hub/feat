/* ==========================================================
   pages/admin.js — Espace admin (vue d'ensemble, clients, programmes, messages).
   ========================================================== */

import { TRACKS } from "../data.js";
import { state } from "../state.js";
import { icon, escapeHtml } from "../helpers.js";

export function renderAdminDashboard() {
  const a = state.adminStats || { clients: 0, activeToday: 0, newThisWeek: 0, popular: [], messages: [] };
  const notice = state.adminNotice ? `<div class="admin-dashboard-notice"><p>${escapeHtml(state.adminNotice)}</p></div>` : "";
  const popularContent = a.popular.length ? a.popular.map((p) => `
            <div class="admin-dashboard-card-item">
              <span class="label">${escapeHtml(p.name)}</span>
              <span class="value">${p.pct}%</span>
            </div>`).join("") : `<div class="admin-dashboard-empty">Aucun programme favori enregistré pour le moment.</div>`;
  const messagesContent = a.messages.length ? a.messages.map((m) => `
            <div class="admin-dashboard-card-item">
              <span class="label">${escapeHtml(m.from)}</span>
              <span class="value">${escapeHtml(m.time)}</span>
            </div>
            <div class="admin-dashboard-card-item">
              <span class="label">${escapeHtml(m.preview)}</span>
              <span class="value">&nbsp;</span>
            </div>`).join("") : `<div class="admin-dashboard-empty">Aucun message client à afficher pour le moment.</div>`;

  return `
  <div class="section wrap">
    <div class="admin-dashboard">
      <section class="admin-dashboard-hero">
        <div class="admin-dashboard-hero-top">
          <div>
            <p class="eyebrow-moss font-mono">Tableau de bord admin</p>
            <h1 class="font-display" style="margin:0;">Bonjour Coach, voici l’état du compte.</h1>
            <p class="admin-dashboard-hero-copy">Supervise les clients, les programmes et les échanges en un seul endroit. Chaque nouvelle action doit te rapprocher d’un coaching plus rapide et plus clair.</p>
          </div>
          <div class="admin-dashboard-hero-actions">
            <button class="btn-primary" data-nav="admin-clients">Ajouter un client</button>
            <button class="btn btn-line" data-admin-action="export">Télécharger rapport</button>
          </div>
        </div>
        <div class="admin-dashboard-hero-stats">
          <div class="admin-dashboard-stat-card">
            <strong>${a.clients}</strong>
            <span>Clients inscrits</span>
          </div>
          <div class="admin-dashboard-stat-card">
            <strong>${a.activeToday}</strong>
            <span>Actifs aujourd'hui</span>
          </div>
          <div class="admin-dashboard-stat-card">
            <strong>${a.newThisWeek}</strong>
            <span>Nouveaux cette semaine</span>
          </div>
        </div>
      </section>

      ${notice}

      <div class="admin-dashboard-grid">
        <div class="admin-dashboard-card">
          <h2>Performance</h2>
          <p>Suivi des indicateurs clés pour piloter le programme client et mesurer l’engagement.</p>
          <div class="admin-dashboard-card-list">
            <div class="admin-dashboard-card-item"><span class="label">Taux d’activation</span><span class="value">${a.activeToday > 0 ? `${Math.round((a.activeToday / Math.max(a.clients, 1)) * 100)}%` : "0%"}</span></div>
            <div class="admin-dashboard-card-item"><span class="label">Nouveaux clients</span><span class="value">${a.newThisWeek}</span></div>
            <div class="admin-dashboard-card-item"><span class="label">Clients totaux</span><span class="value">${a.clients}</span></div>
          </div>
        </div>

        <div class="admin-dashboard-card">
          <h2>Programmes populaires</h2>
          <p>Les parcours les plus demandés par tes clients. Utilise ces tendances pour prioriser les ajustements.</p>
          <div class="admin-dashboard-card-list">
            ${popularContent}
          </div>
        </div>

        <div class="admin-dashboard-card">
          <h2>Messages récents</h2>
          <p>Conversations clients nécessitant un suivi. Garde une communication fluide sans perdre de temps.</p>
          <div class="admin-dashboard-card-list">
            ${messagesContent}
          </div>
        </div>
      </div>
    </div>
  </div>`;
}

export function renderAdminClients() {
  return `
  <div class="section wrap">
    <p class="eyebrow-moss font-mono">GESTION</p>
    <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:12px;margin-bottom:32px">
      <h1 class="font-display" style="font-size:28px;color:var(--ink);margin:0">Clients</h1>
      <div class="search-box" style="width:min(100%,360px);">${icon("search", 14, "var(--ink-muted3)")}<input placeholder="Rechercher..." /></div>
    </div>
    <div class="card" style="padding:0">
      <div class="table-row" style="justify-content:center;padding:32px 0;color:var(--slate);font-size:14px">
        Aucune liste de clients disponible sans back-end connecté.
      </div>
    </div>
  </div>`;
}

export function renderAdminPrograms() {
  const notice = state.adminNotice ? `<div class="card" style="margin-bottom:16px;background:rgba(78,154,122,0.08);border-color:rgba(78,154,122,0.2);">${escapeHtml(state.adminNotice)}</div>` : "";
  return `
  <div class="section wrap">
    ${notice}
    <p class="eyebrow-moss font-mono">GESTION</p>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:32px">
      <h1 class="font-display" style="font-size:28px;color:var(--ink);margin:0">Programmes</h1>
      <button class="btn btn-ember" data-admin-action="new-program">${icon("plus", 14)} Nouveau programme</button>
    </div>
    <div class="grid-3">
      ${TRACKS.map((t) => `
        <div class="card">
          <div style="display:flex;justify-content:space-between">
            ${icon(t.icon, 22, "var(--ember)")}
            <button style="font-size:12px;color:var(--slate);display:flex;align-items:center;gap:4px" data-admin-action="edit-program">${icon("edit-3", 12)} Modifier</button>
          </div>
          <h3 class="font-display" style="font-size:14px;color:var(--ink);margin-top:16px">${t.label}</h3>
          <p style="font-size:12px;color:var(--slate);margin-top:8px">${t.dist} · 3 séances / semaine</p>
        </div>`).join("")}
    </div>
  </div>`;
}

export function renderAdminMessages() {
  const a = state.adminStats || { messages: [] };
  return `
  <div class="section wrap">
    <p class="eyebrow-moss font-mono">ÉCHANGES</p>
    <h1 class="h2 font-display">Messages clients</h1>
    <div class="card" style="padding:0">
      ${a.messages.length ? a.messages.map((m) => `
        <div class="table-row" style="justify-content:flex-start;gap:16px;align-items:flex-start">
          <div style="width:36px;height:36px;border-radius:100px;background:var(--chalk-soft);display:flex;align-items:center;justify-content:center;flex-shrink:0">${icon("user", 16, "var(--slate)")}</div>
          <div style="flex:1">
            <div style="display:flex;justify-content:space-between"><span style="font-weight:600;font-size:14px;color:var(--ink)">${m.from}</span><span class="font-mono" style="font-size:10px;color:var(--ink-muted3)">${m.time}</span></div>
            <p style="font-size:14px;color:var(--slate);margin:4px 0 0">${m.preview}</p>
          </div>
        </div>`).join("") : `<div class="table-row" style="justify-content:center;padding:32px 0;color:var(--slate);font-size:14px">Aucun message client à afficher pour le moment.</div>`}
    </div>
  </div>`;
}
