/* ==========================================================
   pages/admin.js — Espace admin connecté aux données Firestore réelles.
   ========================================================== */

import { TRACKS } from "../data.js";
import { state } from "../state.js";
import { icon, escapeHtml } from "../helpers.js";

/**
 * Helper pour formater l'initiale d'un client.
 */
function getInitials(firstName, lastName, email) {
  if (firstName || lastName) {
    const f = (firstName || "")[0] || "";
    const l = (lastName || "")[0] || "";
    return (f + l).toUpperCase() || "CL";
  }
  return (email || "CL")[0].toUpperCase();
}

/**
 * Helper pour formater la date relative (ex: "Il y a 2h" ou date lisible).
 */
function formatTimeAgo(isoString) {
  if (!isoString) return "";
  const d = new Date(isoString);
  const diffMinutes = Math.floor((Date.now() - d.getTime()) / (1000 * 60));
  if (diffMinutes < 60) return `Il y a ${Math.max(1, diffMinutes)} min`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

/**
 * Helper pour traduire l'ID de parcours en libellé propre.
 */
function getTrackLabel(trackId) {
  const t = TRACKS.find(tr => tr.id === trackId);
  return t ? t.label : (trackId || "Non défini");
}

/**
 * Helper pour traduire l'objectif en français.
 */
function getGoalLabel(goalId) {
  const map = {
    "perte-poids": "Perte de poids",
    "prise-muscle": "Prise de muscle",
    "endurance-sante": "Endurance & Santé",
    "remise": "Remise en forme",
  };
  return map[goalId] || goalId || "Non défini";
}

const renderNotice = () => state.adminNotice ? `<div class="adm-notice">${icon("info", 16)} ${escapeHtml(state.adminNotice)}</div>` : "";

/**
 * 1. DASHBOARD PRINCIPAL ADMIN
 */
export function renderAdminDashboard() {
  const clients = state.adminData.clients || [];
  const messages = state.adminData.messages || [];
  const unreadCount = messages.filter(m => !m.read).length;
  const todayDate = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

  const topClients = clients.slice(0, 4);
  const recentMessages = messages.slice(0, 4);

  return `
  <div class="wrap adm-page">
    <!-- HEADER -->
    <div class="adm-header">
      <div class="adm-header-inner">
        <div>
          <p class="adm-eyebrow">${todayDate}</p>
          <h1 class="adm-title">Bonjour Coach Abdoul</h1>
          <p class="adm-subtitle">Voici l'activité réelle de vos clients. ${unreadCount} message(s) non lu(s).</p>
        </div>
        <div class="adm-actions">
          <button class="btn btn-primary" data-nav="admin-clients">${icon("plus", 14)} Voir les clients</button>
        </div>
      </div>
    </div>

    ${renderNotice()}

    <!-- KPI GRID RÉEL -->
    <div class="adm-kpi-grid">
      <div class="adm-kpi-card kpi-blue">
        <div class="adm-kpi-icon bg-blue">${icon("users", 20)}</div>
        <div class="adm-kpi-value">${clients.length}</div>
        <div class="adm-kpi-label">Clients inscrits</div>
        <div class="adm-kpi-delta up">${icon("trending-up", 12)} Base Firestore</div>
      </div>
      <div class="adm-kpi-card kpi-green">
        <div class="adm-kpi-icon bg-green">${icon("activity", 20)}</div>
        <div class="adm-kpi-value">${messages.length}</div>
        <div class="adm-kpi-label">Messages reçus</div>
        <div class="adm-kpi-delta up">${icon("message-square", 12)} Total contact</div>
      </div>
      <div class="adm-kpi-card kpi-purple">
        <div class="adm-kpi-icon bg-purple">${icon("target", 20)}</div>
        <div class="adm-kpi-value">${clients.length ? Math.round((clients.filter(c => c.track === 'gym').length / clients.length) * 100) : 0}%</div>
        <div class="adm-kpi-label">Clients en Salle</div>
        <div class="adm-kpi-delta up">${icon("dumbbell", 12)} Option Gym</div>
      </div>
      <div class="adm-kpi-card kpi-orange">
        <div class="adm-kpi-icon bg-orange">${icon("message-circle", 20)}</div>
        <div class="adm-kpi-value">${unreadCount}</div>
        <div class="adm-kpi-label">Messages non lus</div>
        <div class="adm-kpi-delta ${unreadCount > 0 ? 'down' : 'up'}">${icon("clock", 12)} À traiter</div>
      </div>
    </div>

    <!-- MAIN BODY -->
    <div class="adm-dashboard-body">
      <!-- Progression des clients réels -->
      <div class="adm-section-card">
        <div class="adm-section-card-header">
          <h2 class="adm-section-card-title">Derniers clients inscrits</h2>
          <button class="adm-section-card-link" data-nav="admin-clients">Voir tous →</button>
        </div>
        <div>
          ${clients.length === 0 ? `
            <p style="padding: 20px; color: var(--slate); font-size: 14px;">Aucun client inscrit pour le moment dans la base Firestore.</p>
          ` : topClients.map(c => {
            const name = `${c.firstName || ''} ${c.lastName || ''}`.trim() || c.email;
            const initials = getInitials(c.firstName, c.lastName, c.email);
            const trackLbl = getTrackLabel(c.track);
            const week = c.week || 1;
            const maxWeek = c.totalWeeks || 8;

            return `
            <div class="adm-client-row" style="grid-template-columns: 38px 1fr 120px;">
              <div class="adm-avatar av-1">${initials}</div>
              <div>
                <div style="font-size: 14px; font-weight: 600;">${escapeHtml(name)}</div>
                <div style="font-size: 12px; color: var(--slate); margin-top: 2px;">${escapeHtml(getGoalLabel(c.goal))} · ${escapeHtml(trackLbl)}</div>
              </div>
              <div style="font-size: 12px; font-weight: 600; text-align: right; color: var(--moss);">
                Actif (S${week}/${maxWeek})
              </div>
            </div>`;
          }).join("")}
        </div>
      </div>

      <!-- Messages réels -->
      <div class="adm-section-card">
        <div class="adm-section-card-header">
          <h2 class="adm-section-card-title">Derniers messages reçus</h2>
          <button class="adm-section-card-link" data-nav="admin-messages">Messagerie →</button>
        </div>
        <div>
          ${messages.length === 0 ? `
            <p style="padding: 20px; color: var(--slate); font-size: 14px;">Aucun message reçu pour le moment.</p>
          ` : recentMessages.map(m => {
            const initials = getInitials(m.fromName, "", m.fromEmail);
            return `
            <div class="adm-msg-row ${!m.read ? 'unread' : ''}" data-nav="admin-messages">
              <div class="adm-avatar adm-avatar-sm av-2">${initials}</div>
              <div class="adm-msg-body">
                <div class="adm-msg-name">${escapeHtml(m.fromName || m.fromEmail || "Visiteur")}</div>
                <div class="adm-msg-preview">${escapeHtml(m.message || "")}</div>
              </div>
              <div class="adm-msg-meta">
                <div class="adm-msg-time">${formatTimeAgo(m.createdAt)}</div>
                ${!m.read ? '<div class="adm-unread-dot"></div>' : ''}
              </div>
            </div>`;
          }).join("")}
        </div>
      </div>
    </div>
  </div>`;
}

/**
 * 2. GESTION DES CLIENTS RÉELS
 */
export function renderAdminClients() {
  const clients = state.adminData.clients || [];

  return `
  <div class="wrap adm-page">
    <div class="adm-header">
      <div class="adm-header-inner">
        <div>
          <p class="adm-eyebrow">Annuaire Firestore</p>
          <h1 class="adm-title">Clients réels (${clients.length})</h1>
        </div>
      </div>
    </div>

    ${renderNotice()}

    <div class="adm-section-card">
      <div class="adm-client-row-head">
        <div></div>
        <div class="adm-col-head">Client</div>
        <div class="adm-col-head adm-col-prog">Programme</div>
        <div class="adm-col-head adm-col-week">Semaine</div>
        <div class="adm-col-head">E-mail</div>
        <div class="adm-col-head adm-col-status">Statut</div>
      </div>
      
      ${clients.length === 0 ? `
        <div style="padding: 32px; text-align: center; color: var(--slate); font-size: 14px;">
          Aucun client enregistré dans la base de données Firestore.
        </div>
      ` : clients.map(c => {
        const name = `${c.firstName || ''} ${c.lastName || ''}`.trim() || c.email;
        const initials = getInitials(c.firstName, c.lastName, c.email);
        const trackLbl = getTrackLabel(c.track);
        const goalLbl = getGoalLabel(c.goal);
        const week = c.week || 1;
        const maxWeek = c.totalWeeks || 8;

        return `
        <div class="adm-client-row">
          <div class="adm-avatar av-1">${initials}</div>
          <div>
            <div style="font-size: 14px; font-weight: 600; color: var(--ink);">${escapeHtml(name)}</div>
            <div style="font-size: 12px; color: var(--slate); margin-top: 2px;">Objectif: ${escapeHtml(goalLbl)}</div>
          </div>
          <div class="adm-col-prog" style="font-size: 13px; color: var(--slate);">${escapeHtml(trackLbl)}</div>
          <div class="adm-col-week" style="font-size: 13px; font-weight: 600;">S${week} / ${maxWeek}</div>
          <div style="font-size: 13px; color: var(--slate);">${escapeHtml(c.email || "")}</div>
          <div class="adm-col-status">
            <span class="adm-badge active">Inscrit</span>
          </div>
        </div>`;
      }).join("")}
    </div>
  </div>`;
}

/**
 * 3. GESTION DES PROGRAMMES & RÉPARTITION RÉELLE
 */
export function renderAdminPrograms() {
  const clients = state.adminData.clients || [];
  const totalClients = clients.length;

  return `
  <div class="wrap adm-page">
    <div class="adm-header">
      <div class="adm-header-inner">
        <div>
          <p class="adm-eyebrow">Catalogue & Statistiques</p>
          <h1 class="adm-title">Programmes d'entraînement</h1>
        </div>
      </div>
    </div>

    ${renderNotice()}

    <div class="grid-3">
      ${TRACKS.map((t) => {
        const subs = clients.filter(c => c.track === t.id).length;
        const pctChoice = totalClients > 0 ? Math.round((subs / totalClients) * 100) : 0;
        
        return `
        <div class="adm-prog-card">
          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div class="adm-prog-icon">${icon(t.icon, 24)}</div>
          </div>
          <h3 style="font-size: 18px; margin: 12px 0 8px;">${t.label}</h3>
          <p style="font-size: 13px; color: var(--slate); margin: 0 0 16px; line-height: 1.5;">${t.desc}</p>
          
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            <span class="adm-badge active">${t.dist}</span>
            <span class="adm-badge" style="background: var(--chalk-soft); color: var(--slate);">3 séances/sem</span>
          </div>

          <div class="adm-prog-stats">
            <div class="adm-prog-stat-item">
              <span class="adm-prog-stat-val">${subs}</span>
              <span class="adm-prog-stat-lbl">Clients inscrits</span>
            </div>
            <div class="adm-prog-stat-item">
              <span class="adm-prog-stat-val">${pctChoice}%</span>
              <span class="adm-prog-stat-lbl">Choix des clients</span>
            </div>
          </div>
        </div>`;
      }).join("")}
    </div>
  </div>`;
}

/**
 * 4. MESSAGERIE RÉELLE
 */
export function renderAdminMessages() {
  const messages = state.adminData.messages || [];

  return `
  <div class="wrap adm-page">
    <div class="adm-header">
      <div class="adm-header-inner">
        <div>
          <p class="adm-eyebrow">Communication</p>
          <h1 class="adm-title">Messagerie Firestore (${messages.length})</h1>
        </div>
      </div>
    </div>

    <div class="adm-dashboard-body" style="grid-template-columns: 1fr; align-items: start;">
      
      <!-- Liste des messages réels -->
      <div class="adm-section-card" style="min-height: 300px;">
        <div class="adm-section-card-header" style="padding: 14px 22px;">
          <h2 class="adm-section-card-title">Tous les messages reçus</h2>
        </div>
        <div style="padding: 12px 22px;">
          ${messages.length === 0 ? `
            <p style="color: var(--slate); font-size: 14px; padding: 16px 0;">Aucun message dans la base Firestore pour le moment.</p>
          ` : messages.map(m => `
            <div class="adm-msg-row ${!m.read ? 'unread' : ''}" style="margin-bottom: 12px; border: 1px solid var(--line); border-radius: 4px; padding: 16px;">
              <div class="adm-avatar adm-avatar-sm av-1">${getInitials(m.fromName, "", m.fromEmail)}</div>
              <div class="adm-msg-body" style="flex: 1;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                  <div class="adm-msg-name" style="font-weight:700;">${escapeHtml(m.fromName || "Anonyme")} (${escapeHtml(m.fromEmail || "Pas d'email")})</div>
                  <div class="adm-msg-time" style="font-size:12px; color:var(--slate);">${formatTimeAgo(m.createdAt)}</div>
                </div>
                <div style="font-size: 12px; font-weight: 600; color: var(--ember); margin-bottom: 6px;">Sujet: ${escapeHtml(m.subject || "Sans sujet")}</div>
                <div class="adm-msg-preview" style="font-size:14px; color:var(--ink); line-height:1.5; white-space:pre-wrap;">${escapeHtml(m.message || "")}</div>
              </div>
            </div>
          `).join("")}
        </div>
      </div>

    </div>
  </div>`;
}
