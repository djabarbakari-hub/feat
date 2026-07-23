/* ==========================================================
   pages/admin.js — Espace admin connecté aux données Firestore réelles.
   ========================================================== */

import { TRACKS } from "../data.js";
import { state } from "../state.js";
import { icon, escapeHtml } from "../helpers.js";
import { auth } from "../firebase.js";

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
 * Helper pour afficher soit la vraie photo de profil Google (photoURL),
 * soit un avatar avec les initiales en cas d'absence d'image.
 */
function renderAvatarHtml(photoURL, firstName, lastName, email, avatarClass = "adm-avatar av-1", customStyle = "") {
  const initials = getInitials(firstName, lastName, email);
  let photo = photoURL || "";

  if (!photo && auth.currentUser) {
    const currEmail = (auth.currentUser.email || "").toLowerCase().trim();
    const targetEmail = (email || "").toLowerCase().trim();
    if (currEmail && targetEmail && currEmail === targetEmail) {
      photo = auth.currentUser.photoURL || "";
    }
  }

  if (photo && typeof photo === "string" && photo.startsWith("http")) {
    return `
      <div class="${avatarClass}" style="padding: 0; overflow: hidden; display: flex; align-items: center; justify-content: center; ${customStyle}">
        <img src="${escapeHtml(photo)}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%; display: block;" alt="${escapeHtml(initials)}" referrerpolicy="no-referrer" onerror="this.style.display='none'; if(this.nextElementSibling) this.nextElementSibling.style.display='flex';" />
        <span style="display: none; align-items: center; justify-content: center; width: 100%; height: 100%;">${initials}</span>
      </div>
    `;
  }
  return `<div class="${avatarClass}" style="${customStyle}">${initials}</div>`;
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

  const SUPER_ADMIN_EMAIL = "djabarbakari.032003@gmail.com";
  const currentUserEmail = (state.clientProfile?.email || auth.currentUser?.email || "").toLowerCase().trim();
  const isSuperAdmin = currentUserEmail === SUPER_ADMIN_EMAIL.toLowerCase();
  const adminList = state.adminData.admins || [
    { email: SUPER_ADMIN_EMAIL, firstName: "Abdou", lastName: "BAKARI", role: "admin", isSuperAdmin: true }
  ];

  const topClients = clients.slice(0, 4);
  const recentMessages = messages.slice(0, 4);

  const coachFirstName = state.clientProfile?.firstName || "Abdoul";
  const coachName = `Coach ${coachFirstName}`;

  return `
  <div class="wrap adm-page">
    <!-- HEADER -->
    <div class="adm-header">
      <div class="adm-header-inner">
        <div>
          <p class="adm-eyebrow">${todayDate}</p>
          <h1 class="adm-title">Bonjour ${escapeHtml(coachName)}</h1>
          <p class="adm-subtitle">Voici l'activité réelle de vos clients. ${unreadCount} message(s) non lu(s).</p>
        </div>
        <div class="adm-actions" style="display: flex; gap: 10px; flex-wrap: wrap;">
          <button class="btn btn-outline-dark" id="btn-start-test-simulation" style="display: inline-flex; align-items: center; gap: 8px;">
            ${icon("eye", 14)} Aperçu Espace Client (Compte Test)
          </button>
          <button class="btn btn-primary" data-nav="admin-clients">${icon("users", 14)} Gérer les clients</button>
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
            const trackLbl = getTrackLabel(c.track);
            const week = c.week || 1;
            const maxWeek = c.totalWeeks || 8;
            const clientId = escapeHtml(c.id || c.uid || c.email || "");
            const avatarHtml = renderAvatarHtml(c.photoURL || c.photoUrl, c.firstName, c.lastName, c.email, "adm-avatar av-1");

            return `
            <div class="adm-client-row" style="grid-template-columns: 38px 1fr 100px 100px; cursor: pointer; transition: background 0.2s;" data-view-client="${clientId}">
              ${avatarHtml}
              <div>
                <div style="font-size: 14px; font-weight: 600;">${escapeHtml(name)}</div>
                <div style="font-size: 12px; color: var(--slate); margin-top: 2px;">${escapeHtml(getGoalLabel(c.goal))} · ${escapeHtml(trackLbl)}</div>
              </div>
              <div style="font-size: 12px; font-weight: 600; text-align: right; color: var(--moss);">
                Actif (S${week}/${maxWeek})
              </div>
              <div style="text-align: right;">
                <button class="btn btn-outline-dark" style="padding: 4px 8px; font-size: 12px;" data-view-client="${clientId}">
                  Voir profil
                </button>
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
            const avatarHtml = renderAvatarHtml(m.photoURL || m.photoUrl, m.fromName, "", m.fromEmail, "adm-avatar adm-avatar-sm av-2");
            return `
            <div class="adm-msg-row ${!m.read ? 'unread' : ''}" data-nav="admin-messages">
              ${avatarHtml}
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

    <!-- SECTION GESTION DES ADMINISTRATEURS -->
    <div class="adm-section-card" style="margin-top: 24px;">
      <div class="adm-section-card-header">
        <div>
          <h2 class="adm-section-card-title" style="display:flex;align-items:center;gap:8px;">
            ${icon("shield-check", 18, "var(--ember)")} Gestion des Administrateurs
          </h2>
          <p style="font-size:12px;color:var(--slate);margin:4px 0 0;">
            Administrateur principal autorisé : <strong style="color:var(--ink);">djabarbakari.032003@gmail.com</strong>
          </p>
        </div>
      </div>

      <div style="padding: 20px;">
        <!-- Formulaire d'ajout d'administrateur (réservé à l'administrateur principal) -->
        <div style="margin-bottom: 24px; padding: 16px; background: rgba(0,0,0,0.02); border: 1px solid var(--line); border-radius: 6px;">
          <h3 style="font-size: 14px; font-weight: 700; margin: 0 0 8px; color: var(--ink);">Ajouter un nouvel administrateur</h3>
          <p style="font-size: 12px; color: var(--slate); margin: 0 0 12px;">
            Seule l'adresse email principale (<strong>djabarbakari.032003@gmail.com</strong>) peut promouvoir d'autres comptes au statut d'administrateur.
          </p>
          <div style="display: flex; gap: 10px; flex-wrap: wrap;">
            <input type="email" id="input-new-admin-email" placeholder="adresse.email@exemple.com" class="text-input" style="flex: 1; min-width: 240px; padding: 10px;" ${!isSuperAdmin ? "disabled" : ""} />
            <button class="btn btn-ember" data-admin-action="add-admin" style="white-space: nowrap;" ${!isSuperAdmin ? "disabled" : ""}>
              ${icon("user-plus", 14)} Accorder l'accès Admin
            </button>
          </div>
          ${!isSuperAdmin ? `
            <p style="font-size: 11px; color: var(--ember); margin-top: 8px; font-weight: 600;">
              🔒 Action restreinte : Vous devez être connecté avec l'email principal (djabarbakari.032003@gmail.com) pour gérer les administrateurs.
            </p>
          ` : ""}
        </div>

        <!-- Liste des administrateurs actuels -->
        <h3 style="font-size: 14px; font-weight: 700; margin: 0 0 12px; color: var(--ink);">Administrateurs actuels (${adminList.length})</h3>
        <div style="display: grid; gap: 10px;">
          ${adminList.map(a => {
            const email = (a.email || "").toLowerCase();
            const isMain = email === "djabarbakari.032003@gmail.com";
            const name = `${a.firstName || ''} ${a.lastName || ''}`.trim() || a.email;
            const avatarHtml = renderAvatarHtml(a.photoURL || a.photoUrl, a.firstName, a.lastName, a.email, "adm-avatar av-2");

            return `
              <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; border: 1px solid var(--line); border-radius: 6px; background: var(--chalk, #fff);">
                <div style="display: flex; align-items: center; gap: 12px;">
                  ${avatarHtml}
                  <div>
                    <div style="font-size: 14px; font-weight: 600; color: var(--ink);">${escapeHtml(name)}</div>
                    <div style="font-size: 12px; color: var(--slate);">${escapeHtml(a.email || "")}</div>
                  </div>
                </div>
                <div style="display: flex; align-items: center; gap: 10px;">
                  ${isMain ? `
                    <span class="adm-badge active" style="background: rgba(60,150,80,0.15); color: var(--moss); border: 1px solid rgba(60,150,80,0.3);">
                      Admin Principal
                    </span>
                  ` : `
                    <span class="adm-badge" style="background: rgba(224,70,50,0.1); color: var(--ember);">
                      Administrateur
                    </span>
                    ${isSuperAdmin ? `
                      <button class="btn btn-outline-dark" data-admin-action="revoke-admin" data-admin-email="${escapeHtml(a.email)}" style="padding: 4px 10px; font-size: 12px; color: var(--ember); border-color: var(--ember-soft);">
                        Révoquer
                      </button>
                    ` : ""}
                  `}
                </div>
              </div>
            `;
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
        const trackLbl = getTrackLabel(c.track);
        const goalLbl = getGoalLabel(c.goal);
        const week = c.week || 1;
        const maxWeek = c.totalWeeks || 8;

        const clientId = escapeHtml(c.id || c.uid || c.email || "");
        const avatarHtml = renderAvatarHtml(c.photoURL || c.photoUrl, c.firstName, c.lastName, c.email, "adm-avatar av-1");

        return `
        <div class="adm-client-row" style="cursor: pointer;" data-view-client="${clientId}">
          ${avatarHtml}
          <div>
            <div style="font-size: 14px; font-weight: 600; color: var(--ink);">${escapeHtml(name)}</div>
            <div style="font-size: 12px; color: var(--slate); margin-top: 2px;">Objectif: ${escapeHtml(goalLbl)}</div>
          </div>
          <div class="adm-col-prog" style="font-size: 13px; color: var(--slate);">${escapeHtml(trackLbl)}</div>
          <div class="adm-col-week" style="font-size: 13px; font-weight: 600;">S${week} / ${maxWeek}</div>
          <div style="font-size: 13px; color: var(--slate);">${escapeHtml(c.email || "")}</div>
          <div class="adm-col-status">
            <button class="btn btn-ember" style="padding: 6px 12px; font-size: 12px;" data-view-client="${clientId}">
              ${icon("user", 12)} Voir profil
            </button>
          </div>
        </div>`;
      }).join("")}
    </div>
  </div>`;
}

/**
 * Modal d'affichage complet du profil d'un client pour l'administrateur.
 */
export function showClientDetailsModal(client) {
  if (!client) return;

  const existing = document.getElementById("client-details-modal");
  if (existing) existing.remove();

  const fullName = `${client.firstName || ''} ${client.lastName || ''}`.trim() || client.email || "Client Anonyme";
  const initials = getInitials(client.firstName, client.lastName, client.email);
  const goalLbl = getGoalLabel(client.goal || client.quizAnswers?.objectif);
  const trackLbl = getTrackLabel(client.track || client.quizAnswers?.lieu);
  const levelLbl = client.niveau || client.quizAnswers?.niveau || "Non spécifié";
  const phone = client.phone || client.telephone || "Non renseigné";
  const email = client.email || "Non renseigné";
  const createdAt = client.createdAt ? new Date(client.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) : "Non renseignée";
  const week = client.week || 1;
  const totalWeeks = client.totalWeeks || 8;
  
  // Données physiques
  const physique = client.physique || {};
  const weight = physique.poids ? `${physique.poids} kg` : (client.poids ? `${client.poids} kg` : "Non renseigné");
  const height = physique.taille ? `${physique.taille} cm` : (client.taille ? `${client.taille} cm` : "Non renseigné");
  const age = physique.age ? `${physique.age} ans` : (client.age ? `${client.age} ans` : "Non renseigné");
  const equipment = client.equipment || client.quizAnswers?.equipement || "Non spécifié";
  const frequence = client.frequence || client.quizAnswers?.frequence || "3 séances / semaine";

  const modal = document.createElement("div");
  modal.id = "client-details-modal";
  modal.style.cssText = `
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(10, 15, 20, 0.75);
    backdrop-filter: blur(4px);
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    animation: fadeIn 0.2s ease-out;
  `;

  modal.innerHTML = `
    <div style="
      background: var(--chalk, #ffffff);
      border: 1px solid var(--line);
      border-radius: 12px;
      max-width: 650px;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 20px 40px rgba(0,0,0,0.25);
      color: var(--ink);
      font-family: inherit;
    ">
      <!-- HEADER PROFIL -->
      <div style="
        padding: 24px;
        border-bottom: 1px solid var(--line);
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        background: var(--surface, #f8f9fa);
        border-top-left-radius: 12px;
        border-top-right-radius: 12px;
      ">
        <div style="display: flex; align-items: center; gap: 16px;">
          ${renderAvatarHtml(client.photoURL || client.photoUrl, client.firstName, client.lastName, client.email, "adm-avatar av-1", "width: 56px; height: 56px; font-size: 20px; border-radius: 50%; box-shadow: 0 4px 12px rgba(0,0,0,0.1); flex-shrink: 0;")}
          <div>
            <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
              <h2 style="font-size: 20px; font-weight: 800; margin: 0; color: var(--ink);">${escapeHtml(fullName)}</h2>
              <span class="adm-badge active" style="font-size: 11px;">Actif (S${week}/${totalWeeks})</span>
            </div>
            <p style="font-size: 13px; color: var(--slate); margin: 4px 0 0;">
              Inscrit le ${createdAt}
            </p>
          </div>
        </div>
        <button id="close-client-details-modal" style="
          background: transparent;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: var(--slate);
          padding: 4px 8px;
          border-radius: 4px;
          line-height: 1;
        " title="Fermer">&times;</button>
      </div>

      <!-- CORPS DU PROFIL -->
      <div style="padding: 24px; display: grid; gap: 20px;">
        
        <!-- SECTION 1: CONTACT -->
        <div>
          <h3 style="font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: var(--ember); margin: 0 0 12px; display: flex; align-items: center; gap: 6px;">
            ${icon("mail", 14)} Coordonnées & Contact
          </h3>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; background: rgba(0,0,0,0.02); padding: 14px; border-radius: 8px; border: 1px solid var(--line);">
            <div>
              <span style="font-size: 11px; color: var(--slate); display: block; margin-bottom: 2px;">Adresse E-mail</span>
              <strong style="font-size: 13px; color: var(--ink); word-break: break-all;">${escapeHtml(email)}</strong>
            </div>
            <div>
              <span style="font-size: 11px; color: var(--slate); display: block; margin-bottom: 2px;">Téléphone</span>
              <strong style="font-size: 13px; color: var(--ink);">${escapeHtml(phone)}</strong>
            </div>
          </div>
        </div>

        <!-- SECTION 2: PROGRAMME & OBJECTIFS -->
        <div>
          <h3 style="font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: var(--ember); margin: 0 0 12px; display: flex; align-items: center; gap: 6px;">
            ${icon("target", 14)} Profil Sportif & Programme
          </h3>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px;">
            <div style="padding: 12px 14px; border: 1px solid var(--line); border-radius: 8px; background: #fff;">
              <span style="font-size: 11px; color: var(--slate); display: block;">Objectif principal</span>
              <strong style="font-size: 14px; color: var(--ink);">${escapeHtml(goalLbl)}</strong>
            </div>
            <div style="padding: 12px 14px; border: 1px solid var(--line); border-radius: 8px; background: #fff;">
              <span style="font-size: 11px; color: var(--slate); display: block;">Lieu & Format</span>
              <strong style="font-size: 14px; color: var(--ink);">${escapeHtml(trackLbl)}</strong>
            </div>
            <div style="padding: 12px 14px; border: 1px solid var(--line); border-radius: 8px; background: #fff;">
              <span style="font-size: 11px; color: var(--slate); display: block;">Niveau d'expérience</span>
              <strong style="font-size: 14px; color: var(--ink);">${escapeHtml(levelLbl)}</strong>
            </div>
            <div style="padding: 12px 14px; border: 1px solid var(--line); border-radius: 8px; background: #fff;">
              <span style="font-size: 11px; color: var(--slate); display: block;">Fréquence d'entraînement</span>
              <strong style="font-size: 14px; color: var(--ink);">${escapeHtml(frequence)}</strong>
            </div>
          </div>
        </div>

        <!-- SECTION 3: MENSURATIONS & ÉQUIPEMENT -->
        <div>
          <h3 style="font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: var(--ember); margin: 0 0 12px; display: flex; align-items: center; gap: 6px;">
            ${icon("activity", 14)} Données Physiques & Équipement
          </h3>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 12px;">
            <div style="padding: 10px; text-align: center; border: 1px solid var(--line); border-radius: 8px; background: rgba(0,0,0,0.01);">
              <span style="font-size: 11px; color: var(--slate); display: block;">Poids</span>
              <span style="font-size: 15px; font-weight: 700; color: var(--ink);">${escapeHtml(weight)}</span>
            </div>
            <div style="padding: 10px; text-align: center; border: 1px solid var(--line); border-radius: 8px; background: rgba(0,0,0,0.01);">
              <span style="font-size: 11px; color: var(--slate); display: block;">Taille</span>
              <span style="font-size: 15px; font-weight: 700; color: var(--ink);">${escapeHtml(height)}</span>
            </div>
            <div style="padding: 10px; text-align: center; border: 1px solid var(--line); border-radius: 8px; background: rgba(0,0,0,0.01);">
              <span style="font-size: 11px; color: var(--slate); display: block;">Âge</span>
              <span style="font-size: 15px; font-weight: 700; color: var(--ink);">${escapeHtml(age)}</span>
            </div>
          </div>
          <div style="padding: 12px; border: 1px solid var(--line); border-radius: 8px; background: #fff; font-size: 13px;">
            <span style="font-size: 11px; color: var(--slate); display: block; margin-bottom: 2px;">Équipement disponible</span>
            <strong style="color: var(--ink);">${escapeHtml(equipment)}</strong>
          </div>
        </div>

      </div>

      <!-- FOOTER ACTIONS -->
      <div style="
        padding: 16px 24px;
        border-top: 1px solid var(--line);
        background: var(--surface, #f8f9fa);
        border-bottom-left-radius: 12px;
        border-bottom-right-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        flex-wrap: wrap;
      ">
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <button class="btn btn-ember btn-simulate-client" data-client-id="${escapeHtml(client.id || client.uid || "")}" style="font-size: 13px; display: inline-flex; align-items: center; gap: 6px;">
            ${icon("eye", 14)} Simuler cet espace
          </button>
          ${email && email.includes("@") ? `
            <a href="mailto:${encodeURIComponent(email)}?subject=Suivi%20MonProgrammeFit" class="btn btn-outline-dark" style="font-size: 13px; text-decoration: none; display: inline-flex; align-items: center; gap: 6px;">
              ${icon("mail", 14)} Écrire un e-mail
            </a>
          ` : ""}
          ${phone && phone !== "Non renseigné" ? `
            <a href="tel:${encodeURIComponent(phone)}" class="btn btn-outline-dark" style="font-size: 13px; text-decoration: none; display: inline-flex; align-items: center; gap: 6px;">
              ${icon("phone", 14)} Appeler
            </a>
          ` : ""}
        </div>
        <button id="btn-close-client-modal" class="btn btn-primary" style="font-size: 13px;">
          Fermer
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const closeModal = () => modal.remove();
  modal.querySelector("#close-client-details-modal")?.addEventListener("click", closeModal);
  modal.querySelector("#btn-close-client-modal")?.addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });
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
              ${renderAvatarHtml(m.photoURL || m.photoUrl, m.fromName, "", m.fromEmail, "adm-avatar adm-avatar-sm av-1")}
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
