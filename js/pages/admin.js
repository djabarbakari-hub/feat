/* ==========================================================
   pages/admin.js — Espace admin (vue d'ensemble, clients, programmes, messages).
   ========================================================== */

import { TRACKS } from "../data.js";
import { state } from "../state.js";
import { icon, escapeHtml } from "../helpers.js";

export function renderAdminDashboard() {
  const a = state.adminStats || { clients: 0, activeToday: 0, newThisWeek: 0, popular: [], messages: [] };
  const notice = state.adminNotice ? `<div class="card" style="margin:16px 0 0;background:rgba(78,154,122,0.08);border-color:rgba(78,154,122,0.2);">${escapeHtml(state.adminNotice)}</div>` : "";
  return `
  <div class="admin-panel">
    <section class="admin-cover">
      <div class="admin-cover-toolbar">
        <button class="icon-btn" data-back="1" aria-label="Retour"></button>
        <div class="admin-cover-actions">
          <button class="icon-btn" data-admin-action="notifications" aria-label="Notifications">${icon("bell", 16)}</button>
          <button class="icon-btn" data-admin-action="settings" aria-label="Paramètres">${icon("settings", 16)}</button>
        </div>
      </div>
      <div class="admin-cover-content">
        <div class="admin-avatar-group">
          <div class="admin-avatar-ring">
            <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80" alt="Portrait du coach" />
          </div>
          <div>
            <div class="font-mono" style="color:var(--chalk);font-size:0.75rem;letter-spacing:0.15em;">COACH</div>
            <h1 class="font-display" style="font-size:2.1rem;line-height:1.05;margin:8px 0 4px;color:var(--chalk);">Admin</h1>
            <div class="admin-avatar-badge">En ligne</div>
          </div>
        </div>
        <div class="admin-points">
          <div class="admin-point">${icon("users", 16, "var(--ember)")} ${a.clients} clients</div>
          <div class="admin-point">${icon("activity", 16, "var(--ember)")} ${a.activeToday} actifs</div>
          <div class="admin-point">${icon("plus", 16, "var(--ember)")} ${a.newThisWeek} nouveaux</div>
        </div>
      </div>
    </section>
    <div class="wrap" style="margin-top:-52px;">
      <div class="admin-cta-row">
        <button class="btn btn-ember" data-nav="admin-clients">${icon("user-plus", 14)} Ajouter un client</button>
        <button class="btn btn-line" data-nav="admin-programs">${icon("bar-chart", 14)} Voir rapports</button>
      </div>
      <div class="admin-tabs">
        <button class="tab active" data-admin-action="go-dashboard">Vue d'ensemble <span class="tab-badge">${a.clients}</span></button>
        <button class="tab" data-admin-action="go-clients">Clients <span class="tab-badge">4</span></button>
        <button class="tab" data-admin-action="go-messages">Messages <span class="tab-badge">${a.messages.length}</span></button>
      </div>
      <div class="admin-sections">
        <section class="admin-section-card">
          <div class="admin-section-title">
            <div>
              <div class="font-mono" style="letter-spacing:0.12em;font-size:0.75rem;color:var(--moss);">PERFORMANCE</div>
              <h2 class="font-display" style="font-size:22px;margin:8px 0 0;color:var(--ink);">Trafic et engagement</h2>
            </div>
            <button class="btn btn-line" data-admin-action="export">${icon("download", 14)} Export</button>
          </div>
          <div class="admin-stat-grid">
            <div class="admin-stat-card"><div class="stat-val">${a.clients}</div><div class="stat-label">Clients inscrits</div></div>
            <div class="admin-stat-card"><div class="stat-val">${a.activeToday}</div><div class="stat-label">Actifs aujourd'hui</div></div>
            <div class="admin-stat-card"><div class="stat-val">${a.newThisWeek}</div><div class="stat-label">Nouveaux cette semaine</div></div>
          </div>
        </section>
        <section class="admin-section-card">
          <div class="admin-section-title">
            <div>
              <h3 class="font-display" style="font-size:18px;color:var(--ink);margin:0">Programmes favoris</h3>
            </div>
          </div>
          ${notice}
          ${a.popular.map((p) => `
            <div class="admin-section-item">
              <div class="item-icon">${icon("target", 14)}</div>
              <div class="item-label">${p.name}</div>
              <div class="font-mono" style="font-size:12px;color:var(--slate);">${p.pct}%</div>
            </div>`).join("")}
        </section>
        <section class="admin-section-card">
          <div class="admin-section-title">
            <div>
              <h3 class="font-display" style="font-size:18px;color:var(--ink);margin:0">Messages récents</h3>
            </div>
          </div>
          ${a.messages.map((m) => `
            <div class="admin-section-item">
              <div class="item-icon">${icon("message-square", 14)}</div>
              <div>
                <div style="font-weight:700;color:var(--ink);font-size:14px">${m.from}</div>
                <div style="font-size:12px;color:var(--slate);margin-top:4px">${m.preview}</div>
              </div>
              <span class="font-mono" style="font-size:10px;color:var(--ink-muted3);">${m.time}</span>
            </div>`).join("")}
        </section>
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
