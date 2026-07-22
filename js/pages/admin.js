/* ==========================================================
   pages/admin.js — Espace admin (vue d'ensemble, clients, programmes, messages).
   ========================================================== */

import { TRACKS } from "../data.js";
import { state } from "../state.js";
import { icon, escapeHtml } from "../helpers.js";

// === MOCK DATA REALISTE POUR L'ADMIN ===
const MOCK_CLIENTS = [
  { id: 1, name: "Amara Diallo", initials: "AD", avatar: "av-1", goal: "Prise de muscle", track: "Salle de gym", trackId: "gym", week: 4, maxWeek: 12, pct: 78, status: "active" },
  { id: 2, name: "Fatou Koné", initials: "FK", avatar: "av-2", goal: "Perte de poids", track: "Maison — sans matos", trackId: "bodyweight", week: 2, maxWeek: 8, pct: 45, status: "active" },
  { id: 3, name: "Ibrahim Traoré", initials: "IT", avatar: "av-3", goal: "Endurance", track: "Maison — avec matos", trackId: "home-equip", week: 7, maxWeek: 10, pct: 91, status: "active" },
  { id: 4, name: "Mariama Bah", initials: "MB", avatar: "av-4", goal: "Santé générale", track: "Maison — sans matos", trackId: "bodyweight", week: 1, maxWeek: 8, pct: 20, status: "active" },
  { id: 5, name: "Ousmane Sylla", initials: "OS", avatar: "av-5", goal: "Prise de muscle", track: "Salle de gym", trackId: "gym", week: 9, maxWeek: 12, pct: 88, status: "active" },
  { id: 6, name: "Aïssatou Barry", initials: "AB", avatar: "av-6", goal: "Perte de poids", track: "Maison — avec matos", trackId: "home-equip", week: 3, maxWeek: 10, pct: 60, status: "late" },
  { id: 7, name: "Mamadou Camara", initials: "MC", avatar: "av-7", goal: "Endurance", track: "Salle de gym", trackId: "gym", week: 5, maxWeek: 12, pct: 72, status: "active" },
  { id: 8, name: "Kadiatou Sow", initials: "KS", avatar: "av-8", goal: "Prise de muscle", track: "Maison — sans matos", trackId: "bodyweight", week: 6, maxWeek: 8, pct: 84, status: "active" },
  { id: 9, name: "Boubacar Baldé", initials: "BB", avatar: "av-9", goal: "Santé générale", track: "Maison — avec matos", trackId: "home-equip", week: 2, maxWeek: 10, pct: 35, status: "late" },
  { id: 10, name: "Fatoumata Diallo", initials: "FD", avatar: "av-10", goal: "Perte de poids", track: "Salle de gym", trackId: "gym", week: 8, maxWeek: 12, pct: 95, status: "active" },
  { id: 11, name: "Saliou Kouyaté", initials: "SK", avatar: "av-11", goal: "Endurance", track: "Maison — sans matos", trackId: "bodyweight", week: 4, maxWeek: 8, pct: 66, status: "active" },
  { id: 12, name: "Bintou Keita", initials: "BK", avatar: "av-12", goal: "Prise de muscle", track: "Salle de gym", trackId: "gym", week: 1, maxWeek: 12, pct: 15, status: "active" },
];

const MOCK_MESSAGES = [
  { from: "Amara Diallo", initials: "AD", avatar: "av-1", time: "Il y a 2h", preview: "Coach, est-ce que je peux remplacer le développé couché par...", unread: true },
  { from: "Fatou Koné", initials: "FK", avatar: "av-2", time: "Il y a 5h", preview: "J'ai du mal avec les squats, mon genou gauche...", unread: true },
  { from: "Ibrahim Traoré", initials: "IT", avatar: "av-3", time: "Il y a 1j", preview: "Super séance aujourd'hui ! J'ai battu mon record sur...", unread: false },
  { from: "Ousmane Sylla", initials: "OS", avatar: "av-5", time: "Il y a 1j", preview: "Semaine 9 terminée, je me sens en pleine forme...", unread: false },
  { from: "Fatoumata Diallo", initials: "FD", avatar: "av-10", time: "Il y a 2j", preview: "Puis-je décaler ma séance de vendredi ?", unread: false },
];

const renderNotice = () => state.adminNotice ? `<div class="adm-notice">${icon("info", 16)} ${escapeHtml(state.adminNotice)}</div>` : "";

/**
 * 1. DASHBOARD PRINCIPAL
 */
export function renderAdminDashboard() {
  const topClients = MOCK_CLIENTS.slice(0, 4); // Les 4 premiers
  const recentMessages = MOCK_MESSAGES.slice(0, 3); // 3 derniers messages
  const todayDate = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

  return `
  <div class="wrap adm-page">
    <!-- HEADER -->
    <div class="adm-header">
      <div class="adm-header-inner">
        <div>
          <p class="adm-eyebrow">${todayDate}</p>
          <h1 class="adm-title">Bonjour Coach Abdou</h1>
          <p class="adm-subtitle">Voici l'activité de vos clients aujourd'hui. 2 messages nécessitent votre attention.</p>
        </div>
        <div class="adm-actions">
          <button class="btn btn-outline-dark" data-admin-action="export">${icon("download", 14)} Exporter données</button>
          <button class="btn btn-primary" data-nav="admin-clients">${icon("plus", 14)} Nouveau client</button>
        </div>
      </div>
    </div>

    ${renderNotice()}

    <!-- KPI GRID -->
    <div class="adm-kpi-grid">
      <div class="adm-kpi-card kpi-blue">
        <div class="adm-kpi-icon bg-blue">${icon("users", 20)}</div>
        <div class="adm-kpi-value">12</div>
        <div class="adm-kpi-label">Clients actifs</div>
        <div class="adm-kpi-delta up">${icon("trending-up", 12)} +2 ce mois</div>
      </div>
      <div class="adm-kpi-card kpi-green">
        <div class="adm-kpi-icon bg-green">${icon("activity", 20)}</div>
        <div class="adm-kpi-value">28</div>
        <div class="adm-kpi-label">Séances validées (7j)</div>
        <div class="adm-kpi-delta up">${icon("trending-up", 12)} +14%</div>
      </div>
      <div class="adm-kpi-card kpi-purple">
        <div class="adm-kpi-icon bg-purple">${icon("target", 20)}</div>
        <div class="adm-kpi-value">71%</div>
        <div class="adm-kpi-label">Complétion moyenne</div>
        <div class="adm-kpi-delta down">${icon("trending-down", 12)} -2%</div>
      </div>
      <div class="adm-kpi-card kpi-orange">
        <div class="adm-kpi-icon bg-orange">${icon("message-circle", 20)}</div>
        <div class="adm-kpi-value">2</div>
        <div class="adm-kpi-label">Messages non lus</div>
        <div class="adm-kpi-delta up">${icon("clock", 12)} Rép. moy. 4h</div>
      </div>
    </div>

    <!-- MAIN BODY -->
    <div class="adm-dashboard-body">
      <!-- Top Clients -->
      <div class="adm-section-card">
        <div class="adm-section-card-header">
          <h2 class="adm-section-card-title">Progression des clients</h2>
          <button class="adm-section-card-link" data-nav="admin-clients">Voir tous →</button>
        </div>
        <div>
          ${topClients.map(c => `
            <div class="adm-client-row" style="grid-template-columns: 38px 1fr 100px;">
              <div class="adm-avatar ${c.avatar}">${c.initials}</div>
              <div>
                <div style="font-size: 14px; font-weight: 600;">${c.name}</div>
                <div style="font-size: 12px; color: var(--slate); margin-top: 2px;">Semaine ${c.week}/${c.maxWeek} · ${c.track}</div>
              </div>
              <div>
                <div style="display:flex; justify-content:space-between; font-size:11px; font-weight:600; margin-bottom:4px;">
                  <span>Complétion</span>
                  <span>${c.pct}%</span>
                </div>
                <div class="adm-prog-bar-bg"><div class="adm-prog-bar-fill" style="width: ${c.pct}%"></div></div>
              </div>
            </div>
          `).join("")}
        </div>
      </div>

      <!-- Messages -->
      <div class="adm-section-card">
        <div class="adm-section-card-header">
          <h2 class="adm-section-card-title">Derniers messages</h2>
          <button class="adm-section-card-link" data-nav="admin-messages">Messagerie →</button>
        </div>
        <div>
          ${recentMessages.map(m => `
            <div class="adm-msg-row ${m.unread ? 'unread' : ''}" data-nav="admin-messages">
              <div class="adm-avatar adm-avatar-sm ${m.avatar}">${m.initials}</div>
              <div class="adm-msg-body">
                <div class="adm-msg-name">${m.from}</div>
                <div class="adm-msg-preview">${m.preview}</div>
              </div>
              <div class="adm-msg-meta">
                <div class="adm-msg-time">${m.time}</div>
                ${m.unread ? '<div class="adm-unread-dot"></div>' : ''}
              </div>
            </div>
          `).join("")}
        </div>
      </div>
    </div>
  </div>`;
}

/**
 * 2. GESTION DES CLIENTS
 */
export function renderAdminClients() {
  return `
  <div class="wrap adm-page">
    <div class="adm-header">
      <div class="adm-header-inner">
        <div>
          <p class="adm-eyebrow">Annuaire</p>
          <h1 class="adm-title">Clients (${MOCK_CLIENTS.length})</h1>
        </div>
        <div class="adm-actions">
          <div class="search-box" style="width: 250px;">
            ${icon("search", 14, "var(--ink-muted3)")}
            <input placeholder="Rechercher un client..." />
          </div>
          <button class="btn btn-primary">${icon("user-plus", 14)} Nouveau</button>
        </div>
      </div>
      <div class="adm-filter-tabs" style="margin-top: 20px;">
        <button class="adm-filter-tab active">Tous</button>
        <button class="adm-filter-tab">Actifs (10)</button>
        <button class="adm-filter-tab">En retard (2)</button>
        <button class="adm-filter-tab">Terminés (0)</button>
      </div>
    </div>

    ${renderNotice()}

    <div class="adm-section-card">
      <div class="adm-client-row-head">
        <div></div>
        <div class="adm-col-head">Client</div>
        <div class="adm-col-head adm-col-prog">Programme</div>
        <div class="adm-col-head adm-col-week">Semaine</div>
        <div class="adm-col-head">Progression</div>
        <div class="adm-col-head adm-col-status">Statut</div>
      </div>
      
      ${MOCK_CLIENTS.map(c => `
        <div class="adm-client-row">
          <div class="adm-avatar ${c.avatar}">${c.initials}</div>
          <div>
            <div style="font-size: 14px; font-weight: 600; color: var(--ink);">${c.name}</div>
            <div style="font-size: 12px; color: var(--slate); margin-top: 2px;">Objectif: ${c.goal}</div>
          </div>
          <div class="adm-col-prog" style="font-size: 13px; color: var(--slate);">${c.track}</div>
          <div class="adm-col-week" style="font-size: 13px; font-weight: 600;">S${c.week} / ${c.maxWeek}</div>
          <div>
            <div style="font-size: 11px; font-weight: 600; margin-bottom: 4px; text-align: right;">${c.pct}%</div>
            <div class="adm-prog-bar-bg">
              <div class="adm-prog-bar-fill ${c.pct < 40 ? 'warn' : c.pct < 70 ? 'low' : ''}" style="width: ${c.pct}%"></div>
            </div>
          </div>
          <div class="adm-col-status">
            <span class="adm-badge ${c.status}">${c.status === 'active' ? 'Actif' : 'En retard'}</span>
          </div>
        </div>
      `).join("")}
    </div>
  </div>`;
}

/**
 * 3. GESTION DES PROGRAMMES
 */
export function renderAdminPrograms() {
  const getSubCount = (id) => MOCK_CLIENTS.filter(c => c.trackId === id).length;

  return `
  <div class="wrap adm-page">
    <div class="adm-header">
      <div class="adm-header-inner">
        <div>
          <p class="adm-eyebrow">Catalogue</p>
          <h1 class="adm-title">Programmes d'entraînement</h1>
        </div>
        <button class="btn btn-primary" data-admin-action="new-program">${icon("plus", 14)} Créer un programme</button>
      </div>
    </div>

    ${renderNotice()}

    <div class="grid-3">
      ${TRACKS.map((t) => {
        const subs = getSubCount(t.id);
        const randCompletion = Math.floor(Math.random() * (90 - 60) + 60); // Mock completion rate
        
        return `
        <div class="adm-prog-card">
          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div class="adm-prog-icon">${icon(t.icon, 24)}</div>
            <button class="adm-btn-action" data-admin-action="edit-program">${icon("edit-3", 12)} Éditer</button>
          </div>
          <h3 style="font-size: 18px; margin: 0 0 8px;">${t.label}</h3>
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
              <span class="adm-prog-stat-val">${randCompletion}%</span>
              <span class="adm-prog-stat-lbl">Complétion moy.</span>
            </div>
          </div>
        </div>
      `}).join("")}
    </div>
  </div>`;
}

/**
 * 4. MESSAGERIE
 */
export function renderAdminMessages() {
  return `
  <div class="wrap adm-page">
    <div class="adm-header">
      <div class="adm-header-inner">
        <div>
          <p class="adm-eyebrow">Communication</p>
          <h1 class="adm-title">Messagerie</h1>
        </div>
        <div class="adm-filter-tabs">
          <button class="adm-filter-tab active">Tous</button>
          <button class="adm-filter-tab">Non lus (2)</button>
          <button class="adm-filter-tab">Archivés</button>
        </div>
      </div>
    </div>

    <div class="adm-dashboard-body" style="grid-template-columns: 350px 1fr; align-items: start;">
      
      <!-- Liste des messages (Sidebar) -->
      <div class="adm-section-card" style="min-height: 500px;">
        <div class="adm-section-card-header" style="padding: 14px 22px;">
          <div class="search-box" style="width: 100%; border: none; padding: 0;">
            ${icon("search", 14, "var(--ink-muted3)")}
            <input placeholder="Chercher une conversation..." style="background: transparent;" />
          </div>
        </div>
        <div style="overflow-y: auto; max-height: 600px;">
          ${MOCK_MESSAGES.map(m => `
            <div class="adm-msg-row ${m.unread ? 'unread' : ''}">
              <div class="adm-avatar adm-avatar-sm ${m.avatar}">${m.initials}</div>
              <div class="adm-msg-body">
                <div class="adm-msg-name">${m.from}</div>
                <div class="adm-msg-preview">${m.preview}</div>
              </div>
              <div class="adm-msg-meta">
                <div class="adm-msg-time">${m.time}</div>
                ${m.unread ? '<div class="adm-unread-dot"></div>' : ''}
              </div>
            </div>
          `).join("")}
        </div>
      </div>

      <!-- Aperçu Message (Main) -->
      <div class="adm-section-card" style="min-height: 500px; display: flex; flex-direction: column;">
        <div class="adm-section-card-header">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div class="adm-avatar av-1">AD</div>
            <div>
              <div style="font-size: 15px; font-weight: 600;">Amara Diallo</div>
              <div style="font-size: 12px; color: var(--moss);">Client actif — Programme Salle de gym</div>
            </div>
          </div>
          <button class="adm-btn-action">${icon("more-vertical", 14)}</button>
        </div>
        
        <div style="flex: 1; padding: 24px; display: flex; flex-direction: column; gap: 20px; overflow-y: auto;">
          <!-- Message du client -->
          <div style="display: flex; gap: 12px;">
            <div class="adm-avatar adm-avatar-sm av-1">AD</div>
            <div style="background: var(--chalk-soft); padding: 14px 18px; border-radius: 2px 16px 16px 16px; font-size: 14px; max-width: 80%;">
              <p style="margin: 0 0 8px;">Bonjour Coach,</p>
              <p style="margin: 0 0 8px;">Est-ce que je peux remplacer le développé couché par des haltères cette semaine ? Mon épaule droite me tire un peu quand je charge à la barre.</p>
              <p style="margin: 0; font-size: 11px; color: var(--slate); text-align: right; margin-top: 12px;">Aujourd'hui, 09:42</p>
            </div>
          </div>
        </div>

        <div style="padding: 16px 24px; border-top: 1px solid var(--line); background: var(--chalk-soft);">
          <textarea placeholder="Écrire votre réponse..." style="width: 100%; border: 1px solid var(--line); border-radius: 4px; padding: 12px; font-size: 14px; resize: none; height: 80px; font-family: inherit; margin-bottom: 12px;"></textarea>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <button class="adm-btn-action" style="border: none;">${icon("paperclip", 16)}</button>
            <button class="btn btn-primary" style="padding: 8px 16px; font-size: 13px;">${icon("send", 14)} Envoyer</button>
          </div>
        </div>
      </div>

    </div>
  </div>`;
}
