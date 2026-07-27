/* ==========================================================
   pages/admin.js — Espace admin connecté aux données Firestore réelles.
   ========================================================== */

import { TRACKS, COACH_PROGRAMS } from "../data.js";
import { state } from "../state.js";
import { icon, escapeHtml, showToast } from "../helpers.js";
import { auth, db } from "../firebase.js";
import { doc, setDoc } from "firebase/firestore";

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
  const list = state.tracks && state.tracks.length > 0 ? state.tracks : TRACKS;
  const t = list.find(tr => tr.id === trackId);
  return t ? t.label : (trackId || "Non défini");
}

/**
 * Helper pour traduire l'objectif en français.
 */
function getGoalLabel(goalId) {
  const map = {
    "perte-poids": "Perte de poids",
    "prise-muscle": "Prise de muscle",
    "musculation": "Prise de muscle / Hypertrophie",
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
          <!-- [COMMENTAIRE] Bouton permettant à l'administrateur de supprimer définitivement le compte d'un client et de purger ses données -->
          <button class="btn btn-delete-client-account" data-client-id="${escapeHtml(client.id || client.uid || "")}" data-client-email="${escapeHtml(client.email || "")}" data-client-name="${escapeHtml(fullName)}" style="font-size: 13px; background: #dc2626; color: white; border: none; padding: 10px 14px; border-radius: 6px; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; font-weight: 600; transition: background 0.2s;" onmouseover="this.style.background='#b91c1c'" onmouseout="this.style.background='#dc2626'">
            ${icon("trash-2", 14)} Supprimer le compte
          </button>
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
  const list = state.tracks && state.tracks.length > 0 ? state.tracks : TRACKS;
  const coachProgs = COACH_PROGRAMS;

  return `
  <div class="wrap adm-page">
    <div class="adm-header">
      <div class="adm-header-inner">
        <div>
          <p class="adm-eyebrow">Catalogue & Statistiques</p>
          <h1 class="adm-title">Gestion des Programmes</h1>
        </div>
      </div>
    </div>

    ${renderNotice()}

    <!-- SECTION 1: PISTES D'ONBOARDING -->
    <div style="margin-bottom: 40px;">
      <h2 class="font-display" style="font-size: 22px; margin-bottom: 12px; color: var(--ink); border-left: 4px solid var(--ember); padding-left: 12px; font-weight: 800;">
        Pistes Globales d'Onboarding (${list.length})
      </h2>
      <p style="font-size: 14px; color: var(--slate); margin-bottom: 24px; max-width: 800px;">
        Ces pistes représentent les grands parcours d'orientation proposés aux clients lors du questionnaire d'onboarding. Elles déterminent le type d'environnement et de matériel.
      </p>
      <div class="grid-3">
        ${list.map((t) => {
          const subs = clients.filter(c => c.track === t.id).length;
          const pctChoice = totalClients > 0 ? Math.round((subs / totalClients) * 100) : 0;
          
          return `
          <div class="adm-prog-card" style="display: flex; flex-direction: column; height: 100%;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
              <div class="adm-prog-icon">${icon(t.icon, 24)}</div>
            </div>
            <h3 style="font-size: 18px; margin: 12px 0 8px;">${t.label}</h3>
            <p style="font-size: 13px; color: var(--slate); margin: 0 0 16px; line-height: 1.5; flex-grow: 1;">${t.desc}</p>
            
            <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 16px;">
              <span class="adm-badge active">${t.dist}</span>
              <span class="adm-badge" style="background: var(--chalk-soft); color: var(--slate);">3 séances/sem</span>
            </div>

            <div class="adm-prog-stats" style="margin-bottom: 16px;">
              <div class="adm-prog-stat-item">
                <span class="adm-prog-stat-val">${subs}</span>
                <span class="adm-prog-stat-lbl">Clients inscrits</span>
              </div>
              <div class="adm-prog-stat-item">
                <span class="adm-prog-stat-val">${pctChoice}%</span>
                <span class="adm-prog-stat-lbl">Choix des clients</span>
              </div>
            </div>

            <button class="btn btn-line btn-edit-program" data-program-id="${escapeHtml(t.id)}" style="width: 100%; justify-content: center; font-size: 13px; font-weight: 600; padding: 10px 0;">
              ${icon("edit-2", 14)} Modifier la piste
            </button>
          </div>`;
        }).join("")}
      </div>
    </div>

    <!-- SECTION 2: PROGRAMMES COCHÉS DÉTAILLÉS -->
    <div style="margin-top: 48px; border-top: 1px dashed var(--line); padding-top: 40px; margin-bottom: 40px;">
      <h2 class="font-display" style="font-size: 22px; margin-bottom: 12px; color: var(--ink); border-left: 4px solid var(--moss); padding-left: 12px; font-weight: 800;">
        Fiches de Programmes Détaillées (${coachProgs.length})
      </h2>
      <p style="font-size: 14px; color: var(--slate); margin-bottom: 24px; max-width: 800px;">
        Ces fiches contiennent le contenu réel des séances d'entraînement (lundi, mercredi, vendredi...), les exercices, les répétitions, les temps de repos et les échauffements. Toute modification est répercutée instantanément pour tous les clients concernés.
      </p>
      <div class="grid-3" style="gap: 24px;">
        ${coachProgs.map((p) => {
          const isPriseDeMuscle = p.id.includes("prise-de-muscle");
          const isPertePoids = p.id.includes("perte-poids");
          const goalLabel = isPriseDeMuscle ? "Hypertrophie" : (isPertePoids ? "Perte de Poids" : "Santé & Endurance");
          const badgeColor = isPriseDeMuscle ? "var(--ember)" : (isPertePoids ? "#f2a654" : "var(--moss)");
          
          return `
          <div class="card" style="padding: 24px; display: flex; flex-direction: column; justify-content: space-between; border-top: 4px solid ${badgeColor}; background: var(--surface); box-shadow: 0 4px 20px rgba(0,0,0,0.02); border-radius: 8px;">
            <div>
              <div style="display: flex; gap: 8px; margin-bottom: 12px; flex-wrap: wrap;">
                <span style="font-size: 10px; font-weight: 800; padding: 3px 8px; border-radius: 4px; text-transform: uppercase; font-family: 'IBM Plex Mono', monospace; background: ${badgeColor}; color: white;">
                  ${goalLabel}
                </span>
                <span style="font-size: 10px; font-weight: 700; color: var(--slate); background: rgba(0,0,0,0.05); padding: 3px 8px; border-radius: 4px; font-family: 'IBM Plex Mono', monospace;">
                  ${p.level || "Tous niveaux"}
                </span>
              </div>
              <h3 class="font-display" style="font-size: 16px; font-weight: 800; line-height: 1.3; margin: 0 0 6px; color: var(--ink);">
                ${p.title.replace("MONPROGRAMMEFIT : ", "")}
              </h3>
              <p style="font-size: 13px; font-weight: 600; color: var(--slate); margin-bottom: 12px;">
                ${p.subtitle}
              </p>
              <div style="font-size: 12px; color: var(--slate); margin-bottom: 16px; line-height: 1.5;">
                <div style="display:flex; align-items:center; gap:6px; margin-bottom:4px;">
                  ${icon("calendar", 12)} <span>Durée : <strong>${p.duration || "12 semaines"}</strong></span>
                </div>
                <div style="display:flex; align-items:center; gap:6px; margin-bottom:4px;">
                  ${icon("activity", 12)} <span>Séances : <strong>${p.sessions?.length || 0} par semaine</strong></span>
                </div>
                <div style="display:flex; align-items:center; gap:6px;">
                  ${icon("dumbbell", 12)} <span>Exercices : <strong>${p.sessions?.reduce((acc, s) => acc + (s.exercises?.length || 0), 0) || 0} au total</strong></span>
                </div>
              </div>
            </div>
            
            <button class="btn btn-line btn-edit-coach-program" data-program-id="${escapeHtml(p.id)}" style="width: 100%; justify-content: center; font-size: 13px; font-weight: 600; padding: 10px 0; border-color: ${badgeColor}; color: ${badgeColor};">
              ${icon("settings", 14)} Éditer le contenu
            </button>
          </div>`;
        }).join("")}
      </div>
    </div>
  </div>`;
}

/**
 * Modal d'édition d'un programme d'entraînement pour l'administrateur.
 */
export function showProgramEditModal(track) {
  if (!track) return;

  const existing = document.getElementById("program-edit-modal");
  if (existing) existing.remove();

  const modal = document.createElement("div");
  modal.id = "program-edit-modal";
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
      max-width: 550px;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 20px 40px rgba(0,0,0,0.25);
      color: var(--ink);
      font-family: inherit;
    ">
      <!-- HEADER -->
      <div style="
        padding: 20px 24px;
        border-bottom: 1px solid var(--line);
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: var(--surface, #f8f9fa);
        border-top-left-radius: 12px;
        border-top-right-radius: 12px;
      ">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div class="adm-prog-icon" style="margin: 0; padding: 8px; background: rgba(224, 86, 36, 0.1); color: var(--ember); border-radius: 8px;">
            ${icon(track.icon || "dumbbell", 20)}
          </div>
          <div>
            <h2 style="font-size: 18px; font-weight: 800; margin: 0; color: var(--ink);">Modifier le programme</h2>
            <p style="font-size: 12px; color: var(--slate); margin: 2px 0 0;">ID : ${escapeHtml(track.id)}</p>
          </div>
        </div>
        <button id="close-program-edit-modal" style="
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

      <!-- FORM BODY -->
      <div style="padding: 24px; display: grid; gap: 16px;">
        <div>
          <label style="font-size: 12px; font-weight: 700; color: var(--slate); display: block; margin-bottom: 6px;">Nom du programme</label>
          <input type="text" id="edit-prog-label" class="text-input" style="width: 100%; padding: 10px; border: 1px solid var(--line); border-radius: 6px;" value="${escapeHtml(track.label)}" />
        </div>

        <div>
          <label style="font-size: 12px; font-weight: 700; color: var(--slate); display: block; margin-bottom: 6px;">Slogan / Accroche</label>
          <input type="text" id="edit-prog-tagline" class="text-input" style="width: 100%; padding: 10px; border: 1px solid var(--line); border-radius: 6px;" value="${escapeHtml(track.tagline || "")}" />
        </div>

        <div>
          <label style="font-size: 12px; font-weight: 700; color: var(--slate); display: block; margin-bottom: 6px;">Durée du programme (ex : 12 semaines)</label>
          <input type="text" id="edit-prog-dist" class="text-input" style="width: 100%; padding: 10px; border: 1px solid var(--line); border-radius: 6px;" value="${escapeHtml(track.dist)}" />
        </div>

        <div>
          <label style="font-size: 12px; font-weight: 700; color: var(--slate); display: block; margin-bottom: 6px;">Nom de l'icône Lucide (ex: dumbbell, home, user)</label>
          <input type="text" id="edit-prog-icon" class="text-input" style="width: 100%; padding: 10px; border: 1px solid var(--line); border-radius: 6px;" value="${escapeHtml(track.icon)}" />
        </div>

        <div>
          <label style="font-size: 12px; font-weight: 700; color: var(--slate); display: block; margin-bottom: 6px;">URL de l'image de couverture</label>
          <input type="text" id="edit-prog-img" class="text-input" style="width: 100%; padding: 10px; border: 1px solid var(--line); border-radius: 6px;" value="${escapeHtml(track.img || "")}" />
        </div>

        <div>
          <label style="font-size: 12px; font-weight: 700; color: var(--slate); display: block; margin-bottom: 6px;">Description complète</label>
          <textarea id="edit-prog-desc" class="text-input" style="width: 100%; min-height: 100px; padding: 10px; border: 1px solid var(--line); border-radius: 6px; resize: vertical; line-height: 1.5;">${escapeHtml(track.desc)}</textarea>
        </div>

        <div id="edit-prog-error" style="color: var(--ember); font-size: 13px; font-weight: 600; display: none; padding: 10px; background: rgba(224, 86, 36, 0.08); border-radius: 6px; border: 1px solid rgba(224, 86, 36, 0.15);"></div>
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
        justify-content: flex-end;
        gap: 12px;
      ">
        <button id="btn-cancel-program-edit" class="btn btn-outline-dark" style="font-size: 13px; padding: 10px 18px;">
          Annuler
        </button>
        <button id="btn-save-program-edit" class="btn btn-ember" style="font-size: 13px; padding: 10px 18px; display: inline-flex; align-items: center; gap: 6px;">
          ${icon("save", 14)} Enregistrer
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const closeModal = () => modal.remove();
  modal.querySelector("#close-program-edit-modal")?.addEventListener("click", closeModal);
  modal.querySelector("#btn-cancel-program-edit")?.addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  const saveBtn = modal.querySelector("#btn-save-program-edit");
  saveBtn?.addEventListener("click", async () => {
    const errorDiv = modal.querySelector("#edit-prog-error");
    if (errorDiv) {
      errorDiv.style.display = "none";
      errorDiv.textContent = "";
    }

    const label = modal.querySelector("#edit-prog-label").value.trim();
    const tagline = modal.querySelector("#edit-prog-tagline").value.trim();
    const dist = modal.querySelector("#edit-prog-dist").value.trim();
    const iconName = modal.querySelector("#edit-prog-icon").value.trim();
    const img = modal.querySelector("#edit-prog-img").value.trim();
    const desc = modal.querySelector("#edit-prog-desc").value.trim();

    if (!label || !dist || !desc) {
      if (errorDiv) {
        errorDiv.textContent = "Veuillez remplir les champs obligatoires (Nom, Durée, Description).";
        errorDiv.style.display = "block";
      }
      return;
    }

    const originalText = saveBtn.innerHTML;
    saveBtn.disabled = true;
    saveBtn.innerHTML = `${icon("loader-2", 14)} Enregistrement...`;

    const updatedTrack = {
      id: track.id,
      label,
      tagline: tagline || track.tagline || "",
      dist,
      icon: iconName || track.icon || "dumbbell",
      img: img || track.img || "",
      desc,
      updatedAt: new Date().toISOString()
    };

    try {
      // Sauvegarder dans Firestore collection 'tracks'
      await setDoc(doc(db, "tracks", track.id), updatedTrack);

      // Mettre à jour l'état local immédiatement
      if (!state.tracks) state.tracks = [];
      const index = state.tracks.findIndex(t => t.id === track.id);
      if (index !== -1) {
        state.tracks[index] = updatedTrack;
      } else {
        state.tracks.push(updatedTrack);
      }

      state.adminNotice = `Le programme "${label}" a été mis à jour avec succès.`;
      showToast("Programme mis à jour avec succès !");
      closeModal();
      
      const { render } = await import("../render.js");
      render();
    } catch (err) {
      console.error("Erreur d'enregistrement du programme dans Firestore:", err);
      if (errorDiv) {
        errorDiv.textContent = `Erreur lors de la sauvegarde: ${err.message || err}`;
        errorDiv.style.display = "block";
      }
      saveBtn.disabled = false;
      saveBtn.innerHTML = originalText;
    }
  });
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

/**
 * Modal d'édition des programmes officiels (COACH_PROGRAMS) par le coach.
 */
export function showCoachProgramEditModal(program) {
  if (!program) return;

  const existing = document.getElementById("coach-program-edit-modal");
  if (existing) existing.remove();

  const modal = document.createElement("div");
  modal.id = "coach-program-edit-modal";
  modal.style.cssText = `
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(10, 15, 20, 0.8);
    backdrop-filter: blur(4px);
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    animation: fadeIn 0.2s ease-out;
  `;

  // Clone profond pour ne pas modifier l'original en mémoire de manière transitoire
  const progClone = JSON.parse(JSON.stringify(program));

  // Générateur HTML pour les exercices d'une séance
  const renderExercisesHTML = (sessionIndex) => {
    const session = progClone.sessions[sessionIndex];
    if (!session || !session.exercises) return "";
    return session.exercises.map((ex, exIndex) => `
      <div class="exercise-row" data-session="${sessionIndex}" data-index="${exIndex}" style="background: var(--chalk-soft, #f8f9fa); padding: 16px; border-radius: 8px; margin-bottom: 12px; border-left: 4px solid var(--ember); position: relative; border: 1px solid var(--line);">
        <button class="btn-delete-exercise" data-session="${sessionIndex}" data-index="${exIndex}" style="position: absolute; top: 12px; right: 12px; background: none; border: none; color: var(--ember); cursor: pointer; font-size: 13px; font-weight: bold; padding: 4px;" title="Supprimer cet exercice">
          &times; Supprimer
        </button>
        <div class="grid-2" style="gap: 12px; margin-bottom: 10px; margin-right: 90px;">
          <div>
            <label style="font-size: 11px; font-weight: 700; color: var(--slate); display: block; margin-bottom: 4px;">Nom de l'exercice</label>
            <input type="text" class="text-input input-ex-name" style="width: 100%; padding: 6px 10px; border: 1px solid var(--line); border-radius: 4px; font-size: 13px; background:white; color:var(--ink);" value="${escapeHtml(ex.name || "")}" />
          </div>
          <div>
            <label style="font-size: 11px; font-weight: 700; color: var(--slate); display: block; margin-bottom: 4px;">Séries</label>
            <input type="text" class="text-input input-ex-sets" style="width: 100%; padding: 6px 10px; border: 1px solid var(--line); border-radius: 4px; font-size: 13px; background:white; color:var(--ink);" value="${escapeHtml(String(ex.sets || ""))}" />
          </div>
        </div>
        <div class="grid-3" style="gap: 12px; margin-bottom: 10px;">
          <div>
            <label style="font-size: 11px; font-weight: 700; color: var(--slate); display: block; margin-bottom: 4px;">Répétitions</label>
            <input type="text" class="text-input input-ex-reps" style="width: 100%; padding: 6px 10px; border: 1px solid var(--line); border-radius: 4px; font-size: 13px; background:white; color:var(--ink);" value="${escapeHtml(ex.reps || "")}" />
          </div>
          <div>
            <label style="font-size: 11px; font-weight: 700; color: var(--slate); display: block; margin-bottom: 4px;">Récupération / Repos</label>
            <input type="text" class="text-input input-ex-rest" style="width: 100%; padding: 6px 10px; border: 1px solid var(--line); border-radius: 4px; font-size: 13px; background:white; color:var(--ink);" value="${escapeHtml(ex.rest || "")}" />
          </div>
          <div>
            <label style="font-size: 11px; font-weight: 700; color: var(--slate); display: block; margin-bottom: 4px;">Type / Intensité</label>
            <input type="text" class="text-input input-ex-type" style="width: 100%; padding: 6px 10px; border: 1px solid var(--line); border-radius: 4px; font-size: 13px; background:white; color:var(--ink);" value="${escapeHtml(ex.type || "")}" />
          </div>
        </div>
        <div>
          <label style="font-size: 11px; font-weight: 700; color: var(--slate); display: block; margin-bottom: 4px;">Consigne technique / Description</label>
          <textarea class="text-input input-ex-desc" style="width: 100%; padding: 6px 10px; border: 1px solid var(--line); border-radius: 4px; font-size: 13px; height: 50px; resize: vertical; line-height: 1.4; background:white; color:var(--ink);">${escapeHtml(ex.desc || "")}</textarea>
        </div>
      </div>
    `).join("");
  };

  modal.innerHTML = `
    <div style="
      background: var(--chalk, #ffffff);
      border: 1px solid var(--line);
      border-radius: 12px;
      max-width: 850px;
      width: 100%;
      max-height: 92vh;
      overflow-y: auto;
      box-shadow: 0 20px 40px rgba(0,0,0,0.3);
      color: var(--ink);
      font-family: inherit;
      display: flex;
      flex-direction: column;
    ">
      <!-- HEADER -->
      <div style="
        padding: 20px 24px;
        border-bottom: 1px solid var(--line);
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: var(--surface, #f8f9fa);
        border-top-left-radius: 12px;
        border-top-right-radius: 12px;
      ">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div class="adm-prog-icon" style="margin: 0; padding: 8px; background: rgba(60, 90, 70, 0.1); color: var(--moss); border-radius: 8px;">
            ${icon("settings", 20)}
          </div>
          <div>
            <h2 style="font-size: 18px; font-weight: 800; margin: 0; color: var(--ink);">Édition du Programme Officiel</h2>
            <p style="font-size: 12px; color: var(--slate); margin: 2px 0 0;">Fiche : <strong>${escapeHtml(program.title.replace("MONPROGRAMMEFIT : ", "") + " (" + program.subtitle + ")")}</strong></p>
          </div>
        </div>
        <button id="close-coach-program-edit-modal" style="
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

      <!-- TABS HEADER -->
      <div style="
        display: flex;
        background: var(--chalk-soft, #f8f9fa);
        border-bottom: 1px solid var(--line);
        padding: 0 16px;
      ">
        <button class="coach-tab-btn active" data-tab="infos" style="padding: 14px 20px; font-size: 13px; font-weight: 700; border: none; background: none; color: var(--slate); cursor: pointer; border-bottom: 2px solid transparent; outline: none; transition: all 0.2s;">
          1. Informations Générales
        </button>
        <button class="coach-tab-btn" data-tab="sessions" style="padding: 14px 20px; font-size: 13px; font-weight: 700; border: none; background: none; color: var(--slate); cursor: pointer; border-bottom: 2px solid transparent; outline: none; transition: all 0.2s;">
          2. Séances & Exercices
        </button>
        <button class="coach-tab-btn" data-tab="progression" style="padding: 14px 20px; font-size: 13px; font-weight: 700; border: none; background: none; color: var(--slate); cursor: pointer; border-bottom: 2px solid transparent; outline: none; transition: all 0.2s;">
          3. Échauffement & Conseils
        </button>
      </div>

      <!-- FORM CONTENT -->
      <div style="padding: 24px; flex-grow: 1; overflow-y: auto; max-height: 60vh;">
        
        <!-- TAB 1: INFOS GENERALES -->
        <div class="coach-tab-pane active" id="pane-infos">
          <div class="grid-2" style="gap: 16px; margin-bottom: 16px;">
            <div>
              <label style="font-size: 12px; font-weight: 700; color: var(--slate); display: block; margin-bottom: 6px;">Titre du programme</label>
              <input type="text" id="coach-edit-title" class="text-input" style="width: 100%; padding: 10px; border: 1px solid var(--line); border-radius: 6px;" value="${escapeHtml(progClone.title)}" />
            </div>
            <div>
              <label style="font-size: 12px; font-weight: 700; color: var(--slate); display: block; margin-bottom: 6px;">Sous-titre (Environnement)</label>
              <input type="text" id="coach-edit-subtitle" class="text-input" style="width: 100%; padding: 10px; border: 1px solid var(--line); border-radius: 6px;" value="${escapeHtml(progClone.subtitle)}" />
            </div>
          </div>

          <div class="grid-3" style="gap: 16px; margin-bottom: 16px;">
            <div>
              <label style="font-size: 12px; font-weight: 700; color: var(--slate); display: block; margin-bottom: 6px;">Durée (ex: 12 semaines)</label>
              <input type="text" id="coach-edit-duration" class="text-input" style="width: 100%; padding: 10px; border: 1px solid var(--line); border-radius: 6px;" value="${escapeHtml(progClone.duration || "12 semaines")}" />
            </div>
            <div>
              <label style="font-size: 12px; font-weight: 700; color: var(--slate); display: block; margin-bottom: 6px;">Niveau (ex: Tous niveaux)</label>
              <input type="text" id="coach-edit-level" class="text-input" style="width: 100%; padding: 10px; border: 1px solid var(--line); border-radius: 6px;" value="${escapeHtml(progClone.level || "Tous niveaux")}" />
            </div>
            <div>
              <label style="font-size: 12px; font-weight: 700; color: var(--slate); display: block; margin-bottom: 6px;">Fréquence (ex: 3 séances/semaine)</label>
              <input type="text" id="coach-edit-frequency" class="text-input" style="width: 100%; padding: 10px; border: 1px solid var(--line); border-radius: 6px;" value="${escapeHtml(progClone.frequency || "3 séances / semaine")}" />
            </div>
          </div>

          <div style="background: var(--surface); padding: 16px; border-radius: 8px; border: 1px dashed var(--line); margin-bottom: 16px;">
            <h4 style="font-size: 14px; margin: 0 0 12px; font-weight: 700; color: var(--moss);">Règles d'Entraînement Générales</h4>
            <div class="grid-3" style="gap: 16px;">
              <div>
                <label style="font-size: 11px; font-weight: 700; color: var(--slate); display: block; margin-bottom: 4px;">Temps de repos général</label>
                <input type="text" id="coach-edit-rules-rest" class="text-input" style="width: 100%; padding: 8px; border: 1px solid var(--line); border-radius: 6px;" value="${escapeHtml(progClone.generalRules?.rest || "1 min 30 à 2 min")}" />
              </div>
              <div>
                <label style="font-size: 11px; font-weight: 700; color: var(--slate); display: block; margin-bottom: 4px;">Tempo d'exécution</label>
                <input type="text" id="coach-edit-rules-tempo" class="text-input" style="width: 100%; padding: 8px; border: 1px solid var(--line); border-radius: 6px;" value="${escapeHtml(progClone.generalRules?.tempo || "Contrôlé")}" />
              </div>
              <div>
                <label style="font-size: 11px; font-weight: 700; color: var(--slate); display: block; margin-bottom: 4px;">Intensité (RPE / Effort)</label>
                <input type="text" id="coach-edit-rules-intensity" class="text-input" style="width: 100%; padding: 8px; border: 1px solid var(--line); border-radius: 6px;" value="${escapeHtml(progClone.generalRules?.intensity || "Proche de l'échec (RPE 8-9)")}" />
              </div>
            </div>
          </div>
        </div>

        <!-- TAB 2: SEANCES & EXERCICES -->
        <div class="coach-tab-pane" id="pane-sessions" style="display:none;">
          <div style="display: flex; gap: 8px; border-bottom: 1px solid var(--line); padding-bottom: 12px; margin-bottom: 20px; overflow-x: auto;">
            ${progClone.sessions.map((s, idx) => `
              <button class="coach-session-tab-btn ${idx === 0 ? "active" : ""}" data-session-idx="${idx}" style="padding: 8px 16px; font-size: 12px; font-weight: 700; border-radius: 20px; border: 1px solid var(--line); background: white; color: var(--slate); cursor: pointer; white-space: nowrap;">
                ${escapeHtml(s.day)} : ${escapeHtml(s.name.split(":")[0])}
              </button>
            `).join("")}
          </div>

          ${progClone.sessions.map((s, idx) => `
            <div class="coach-session-pane" id="session-pane-${idx}" style="${idx === 0 ? "" : "display:none;"}">
              <div class="grid-2" style="gap: 16px; margin-bottom: 16px; background: rgba(60, 90, 70, 0.04); padding: 16px; border-radius: 8px;">
                <div>
                  <label style="font-size: 12px; font-weight: 700; color: var(--slate); display: block; margin-bottom: 6px;">Nom de la séance (ex: Séance A : Poussée)</label>
                  <input type="text" class="text-input edit-session-name" data-session="${idx}" style="width: 100%; padding: 10px; border: 1px solid var(--line); border-radius: 6px; font-weight: 700;" value="${escapeHtml(s.name)}" />
                </div>
                <div>
                  <label style="font-size: 12px; font-weight: 700; color: var(--slate); display: block; margin-bottom: 6px;">Durée estimée (ex: 45-60 min)</label>
                  <input type="text" class="text-input edit-session-duration" data-session="${idx}" style="width: 100%; padding: 10px; border: 1px solid var(--line); border-radius: 6px;" value="${escapeHtml(s.duration || "45-60 min")}" />
                </div>
              </div>

              <div style="margin-bottom: 12px;">
                <label style="font-size: 12px; font-weight: 700; color: var(--slate); display: block; margin-bottom: 6px;">Consignes de repos de la séance</label>
                <input type="text" class="text-input edit-session-rest-note" data-session="${idx}" style="width: 100%; padding: 8px 12px; border: 1px solid var(--line); border-radius: 6px; font-size: 13px;" value="${escapeHtml(s.restNote || "1 min 30 à 2 min entre les séries")}" />
              </div>

              <h4 style="font-size: 14px; font-weight: 800; color: var(--ink); margin: 24px 0 12px; display: flex; align-items: center; gap: 8px;">
                ${icon("dumbbell", 16)} Exercices de la séance (${s.exercises?.length || 0})
              </h4>

              <div class="exercises-container" id="exercises-container-${idx}">
                ${renderExercisesHTML(idx)}
              </div>

              <button class="btn btn-outline-dark btn-add-exercise" data-session="${idx}" style="width: 100%; justify-content: center; padding: 12px; border-style: dashed; border-width: 2px; font-weight: 700; margin-top: 12px;">
                + Ajouter un exercice à la séance
              </button>
            </div>
          `).join("")}
        </div>

        <!-- TAB 3: PROGRESSION & CONSEILS -->
        <div class="coach-tab-pane" id="pane-progression" style="display:none;">
          <div style="margin-bottom: 24px;">
            <label style="font-size: 12px; font-weight: 700; color: var(--slate); display: block; margin-bottom: 6px;">Échauffement : Durée</label>
            <input type="text" id="coach-edit-warmup-duration" class="text-input" style="width: 100%; padding: 10px; border: 1px solid var(--line); border-radius: 6px;" value="${escapeHtml(progClone.warmup?.duration || "5-10 min")}" />
          </div>

          <div style="margin-bottom: 24px;">
            <label style="font-size: 12px; font-weight: 700; color: var(--slate); display: block; margin-bottom: 6px;">Étapes de l'échauffement (Une consigne par ligne)</label>
            <textarea id="coach-edit-warmup-steps" class="text-input" style="width: 100%; min-height: 120px; padding: 10px; border: 1px solid var(--line); border-radius: 6px; resize: vertical; line-height: 1.5; font-size: 13px;">${(progClone.warmup?.steps || []).join("\n")}</textarea>
          </div>

          <div style="margin-bottom: 24px; border-top: 1px dashed var(--line); padding-top: 20px;">
            <label style="font-size: 12px; font-weight: 700; color: var(--slate); display: block; margin-bottom: 6px;">Conseils clés du coach (Un conseil par ligne)</label>
            <textarea id="coach-edit-keytips" class="text-input" style="width: 100%; min-height: 120px; padding: 10px; border: 1px solid var(--line); border-radius: 6px; resize: vertical; line-height: 1.5; font-size: 13px;">${(progClone.keyTips || []).join("\n")}</textarea>
          </div>
        </div>

        <div id="coach-edit-prog-error" style="color: var(--ember); font-size: 13px; font-weight: 600; display: none; padding: 10px; background: rgba(224, 86, 36, 0.08); border-radius: 6px; border: 1px solid rgba(224, 86, 36, 0.15); margin-top: 16px;"></div>
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
        justify-content: flex-end;
        gap: 12px;
      ">
        <button id="btn-cancel-coach-program-edit" class="btn btn-outline-dark" style="font-size: 13px; padding: 10px 18px;">
          Annuler
        </button>
        <button id="btn-save-coach-program-edit" class="btn btn-ember" style="font-size: 13px; padding: 10px 18px; display: inline-flex; align-items: center; gap: 6px;">
          ${icon("save", 14)} Enregistrer pour tous
        </button>
      </div>
    </div>
  `;

  // Injecter des styles d'appui
  const styles = document.createElement("style");
  styles.id = "coach-editor-custom-styles";
  styles.textContent = `
    .coach-tab-btn {
      border-radius: 0 !important;
    }
    .coach-tab-btn.active {
      color: var(--ember) !important;
      border-bottom: 2px solid var(--ember) !important;
    }
    .coach-session-tab-btn.active {
      background: var(--moss) !important;
      color: white !important;
      border-color: var(--moss) !important;
    }
  `;
  document.head.appendChild(styles);

  document.body.appendChild(modal);

  const closeModal = () => {
    modal.remove();
    styles.remove();
  };

  modal.querySelector("#close-coach-program-edit-modal")?.addEventListener("click", closeModal);
  modal.querySelector("#btn-cancel-coach-program-edit")?.addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  // Switch tabs
  const tabBtns = modal.querySelectorAll(".coach-tab-btn");
  tabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      tabBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const targetTab = btn.dataset.tab;
      modal.querySelectorAll(".coach-tab-pane").forEach(pane => pane.style.display = "none");
      modal.querySelector(`#pane-${targetTab}`).style.display = "block";
    });
  });

  // Switch sessions
  const sessionBtns = modal.querySelectorAll(".coach-session-tab-btn");
  sessionBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      sessionBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const idx = btn.dataset.sessionIdx;
      modal.querySelectorAll(".coach-session-pane").forEach(pane => pane.style.display = "none");
      modal.querySelector(`#session-pane-${idx}`).style.display = "block";
    });
  });

  // Gérer l'ajout et suppression des exercices via délégation sur le modal
  modal.addEventListener("click", (e) => {
    const addBtn = e.target.closest(".btn-add-exercise");
    if (addBtn) {
      const sessionIndex = parseInt(addBtn.dataset.session);
      if (!progClone.sessions[sessionIndex].exercises) {
        progClone.sessions[sessionIndex].exercises = [];
      }
      progClone.sessions[sessionIndex].exercises.push({
        name: "Nouvel Exercice",
        sets: "3",
        reps: "10-12",
        rest: "90s",
        type: "Hypertrophie",
        desc: "Description technique de l'exercice."
      });
      modal.querySelector(`#exercises-container-${sessionIndex}`).innerHTML = renderExercisesHTML(sessionIndex);
    }

    const delBtn = e.target.closest(".btn-delete-exercise");
    if (delBtn) {
      const sessionIndex = parseInt(delBtn.dataset.session);
      const exIndex = parseInt(delBtn.dataset.index);
      progClone.sessions[sessionIndex].exercises.splice(exIndex, 1);
      modal.querySelector(`#exercises-container-${sessionIndex}`).innerHTML = renderExercisesHTML(sessionIndex);
    }
  });

  // Sauvegarder
  const saveBtn = modal.querySelector("#btn-save-coach-program-edit");
  saveBtn.addEventListener("click", async () => {
    // 1. Rassembler les infos globales
    progClone.title = modal.querySelector("#coach-edit-title").value.trim();
    progClone.subtitle = modal.querySelector("#coach-edit-subtitle").value.trim();
    progClone.duration = modal.querySelector("#coach-edit-duration").value.trim();
    progClone.level = modal.querySelector("#coach-edit-level").value.trim();
    progClone.frequency = modal.querySelector("#coach-edit-frequency").value.trim();

    // Règles
    if (!progClone.generalRules) progClone.generalRules = {};
    progClone.generalRules.rest = modal.querySelector("#coach-edit-rules-rest").value.trim();
    progClone.generalRules.tempo = modal.querySelector("#coach-edit-rules-tempo").value.trim();
    progClone.generalRules.intensity = modal.querySelector("#coach-edit-rules-intensity").value.trim();

    // 2. Rassembler le nom de séance, durée, consigne de repos et exercices
    progClone.sessions.forEach((s, sIdx) => {
      const nameInput = modal.querySelector(`.edit-session-name[data-session="${sIdx}"]`);
      if (nameInput) s.name = nameInput.value.trim();
      const durInput = modal.querySelector(`.edit-session-duration[data-session="${sIdx}"]`);
      if (durInput) s.duration = durInput.value.trim();
      const restInput = modal.querySelector(`.edit-session-rest-note[data-session="${sIdx}"]`);
      if (restInput) s.restNote = restInput.value.trim();

      // Parcourir les lignes d'exercices
      const exRows = modal.querySelectorAll(`.exercise-row[data-session="${sIdx}"]`);
      s.exercises = [];
      exRows.forEach((row) => {
        const name = row.querySelector(".input-ex-name").value.trim();
        const sets = row.querySelector(".input-ex-sets").value.trim();
        const reps = row.querySelector(".input-ex-reps").value.trim();
        const rest = row.querySelector(".input-ex-rest").value.trim();
        const type = row.querySelector(".input-ex-type").value.trim();
        const desc = row.querySelector(".input-ex-desc").value.trim();

        s.exercises.push({ name, sets, reps, rest, type, desc });
      });
    });

    // 3. Échauffement
    if (!progClone.warmup) progClone.warmup = {};
    progClone.warmup.duration = modal.querySelector("#coach-edit-warmup-duration").value.trim();
    const warmupStepsRaw = modal.querySelector("#coach-edit-warmup-steps").value;
    progClone.warmup.steps = warmupStepsRaw.split("\n").map(line => line.trim()).filter(Boolean);

    // 4. Conseils clés
    const keyTipsRaw = modal.querySelector("#coach-edit-keytips").value;
    progClone.keyTips = keyTipsRaw.split("\n").map(line => line.trim()).filter(Boolean);

    // Validation simple
    if (!progClone.title || !progClone.subtitle) {
      const errDiv = modal.querySelector("#coach-edit-prog-error");
      errDiv.textContent = "Le titre et le sous-titre sont obligatoires.";
      errDiv.style.display = "block";
      return;
    }

    // Sauvegarde Firestore
    saveBtn.disabled = true;
    saveBtn.innerHTML = `${icon("loader-2", 14)} Sauvegarde...`;

    try {
      await setDoc(doc(db, "coach_programs", program.id), progClone);
      showToast("Programme officiel sauvegardé avec succès et mis à jour pour tous !");
      closeModal();
      
      const { render } = await import("../render.js");
      render();
    } catch (err) {
      console.error("Erreur d'enregistrement:", err);
      const errDiv = modal.querySelector("#coach-edit-prog-error");
      errDiv.textContent = `Erreur lors de la sauvegarde: ${err.message || err}`;
      errDiv.style.display = "block";
      saveBtn.disabled = false;
      saveBtn.innerHTML = `${icon("save", 14)} Enregistrer pour tous`;
    }
  });
}
