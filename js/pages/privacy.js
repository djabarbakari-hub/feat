/* ==========================================================
   pages/privacy.js — Page de gestion des données personnelles.
   Affiche les données, consentements, et contrôles de suppression.
   ========================================================== */

import { state } from "../state.js";
import { escapeHtml, icon } from "../helpers.js";
import {
  exportUserData,
  getAnalyticsConsent,
  hasGoogleAnalytics,
  hasMicrosoftClarity,
  getDeletionLogs,
} from "../modules/privacy.js";

export function renderPrivacyPage() {
  const userData = exportUserData();
  const consent = getAnalyticsConsent();
  const hasGA = hasGoogleAnalytics();
  const hasClarity = hasMicrosoftClarity();
  const deletionLogs = state.role === "admin" ? getDeletionLogs() : [];

  const googleAnalyticsStatus = hasGA
    ? `<span style="
        display: inline-flex; align-items: center; gap: 4px;
        padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600;
        background: ${consent.googleAnalytics ? "rgba(60,150,80,0.2)" : "rgba(200,60,60,0.2)"};
        color: ${consent.googleAnalytics ? "var(--moss)" : "var(--ember)"};
      ">${consent.googleAnalytics ? "✓ Accepté" : "✗ Refusé"}</span>`
    : `<span style="padding: 4px 10px; border-radius: 20px; font-size: 12px; background: rgba(128,128,128,0.15); color: var(--slate);">Non installé</span>`;

  const microsoftClarityStatus = hasClarity
    ? `<span style="
        display: inline-flex; align-items: center; gap: 4px;
        padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600;
        background: ${consent.microsoftClarity ? "rgba(60,150,80,0.2)" : "rgba(200,60,60,0.2)"};
        color: ${consent.microsoftClarity ? "var(--moss)" : "var(--ember)"};
      ">${consent.microsoftClarity ? "✓ Accepté" : "✗ Refusé"}</span>`
    : `<span style="padding: 4px 10px; border-radius: 20px; font-size: 12px; background: rgba(128,128,128,0.15); color: var(--slate);">Non installé</span>`;

  // Audit : données stockées
  const hasProfile = !!state.clientProfile?.firstName;
  const hasQuiz = Object.keys(state.quizAnswers || {}).length > 0;
  const hasDrafts =
    state.drafts.contact.name || state.drafts.contact.message || state.drafts.signup.firstName;
  const hasHistory = (state.history || []).length > 0;
  const hasDeletionLogs =
    JSON.parse(window.localStorage.getItem("monprogrammefit-deletion-log") || "[]").length > 0;

  const adminLogsSection =
    state.role === "admin"
      ? `
      <div class="section wrap" style="margin-top: 48px;">
        <h2 class="h3 font-display">Journaux de suppression (Admin)</h2>
        <p style="color: var(--slate); margin-bottom: 16px;">Historique d'audit des suppressions de données — conservé pour la sécurité.</p>
        ${
          deletionLogs.length > 0
            ? `
          <div style="border: 1px solid var(--line); border-radius: 2px; overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
              <thead>
                <tr style="background: var(--ink); color: var(--chalk);">
                  <th style="padding: 8px; text-align: left; border-right: 1px solid var(--line2);">Date</th>
                  <th style="padding: 8px; text-align: left; border-right: 1px solid var(--line2);">Action</th>
                  <th style="padding: 8px; text-align: left;">Rôle</th>
                </tr>
              </thead>
              <tbody>
                ${deletionLogs
                  .slice()
                  .reverse()
                  .slice(0, 20)
                  .map(
                    (log) => `
                  <tr style="border-bottom: 1px solid var(--line);">
                    <td style="padding: 8px; border-right: 1px solid var(--line2);">${new Date(log.timestamp).toLocaleString("fr-FR")}</td>
                    <td style="padding: 8px; border-right: 1px solid var(--line2); color: var(--ember); font-weight: 600;">${escapeHtml(log.action)}</td>
                    <td style="padding: 8px;">${escapeHtml(log.userRole)}</td>
                  </tr>
                `
                  )
                  .join("")}
              </tbody>
            </table>
          </div>
        `
            : `<p style="color: var(--slate);">Aucune suppression enregistrée.</p>`
        }
      </div>
    `
      : "";

  return `
  <div style="min-height: 80vh;">
    <div class="section wrap">
      <h1 class="font-display" style="margin-bottom: 8px;">Mes données</h1>
      <p style="color: var(--slate); margin-bottom: 32px;">
        Consultez, exportez ou supprimez vos données personnelles.<br/>
        Exercez votre droit à l'oubli conformément au RGPD.
      </p>

      <!-- SECTION: Dernière activité (mise en avant) -->
      <div style="
        display: flex; align-items: center; gap: 12px;
        padding: 16px 20px; border-radius: 4px;
        background: rgba(255,255,255,0.04);
        border: 1px solid var(--line);
        margin-bottom: 24px;
      ">
        ${icon("clock", 18)}
        <div>
          <div style="font-size: 12px; color: var(--slate); text-transform: uppercase; letter-spacing: 0.05em;">Dernière activité</div>
          <div style="font-weight: 600; margin-top: 2px;">
            ${state.lastVisitedAt
              ? new Date(state.lastVisitedAt).toLocaleString("fr-FR", {
                  weekday: "long", year: "numeric", month: "long",
                  day: "numeric", hour: "2-digit", minute: "2-digit"
                })
              : "Jamais enregistrée"
            }
          </div>
        </div>
      </div>

      <!-- SECTION: Audit des données stockées -->
      <div class="card" style="margin-bottom: 24px;">
        <h2 class="h3 font-display">Données stockées</h2>
        <p style="color: var(--slate); font-size: 14px; margin-bottom: 16px;">
          Récapitulatif de toutes les informations conservées sur cet appareil.
        </p>
        <div style="display: grid; gap: 8px;">

          <!-- Profil -->
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 12px; background: rgba(255,255,255,0.03); border-radius: 2px; border: 1px solid var(--line);">
            <div style="display: flex; align-items: center; gap: 8px;">
              ${icon("user", 14)}
              <span style="font-size: 14px;">Profil personnel</span>
            </div>
            <span style="font-size: 12px; font-weight: 600; color: ${hasProfile ? "var(--moss)" : "var(--slate)"};">
              ${hasProfile ? `✓ ${escapeHtml(state.clientProfile.firstName)} ${escapeHtml(state.clientProfile.lastName || "")}` : "Vide"}
            </span>
          </div>

          <!-- Rôle -->
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 12px; background: rgba(255,255,255,0.03); border-radius: 2px; border: 1px solid var(--line);">
            <div style="display: flex; align-items: center; gap: 8px;">
              ${icon("shield", 14)}
              <span style="font-size: 14px;">Rôle utilisateur</span>
            </div>
            <span style="font-size: 12px; font-weight: 600;">${escapeHtml(state.role || "Invité")}</span>
          </div>

          <!-- Quiz -->
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 12px; background: rgba(255,255,255,0.03); border-radius: 2px; border: 1px solid var(--line);">
            <div style="display: flex; align-items: center; gap: 8px;">
              ${icon("clipboard-list", 14)}
              <span style="font-size: 14px;">Réponses au quiz</span>
            </div>
            <span style="font-size: 12px; font-weight: 600; color: ${hasQuiz ? "var(--moss)" : "var(--slate)"};">
              ${hasQuiz ? `✓ ${Object.keys(state.quizAnswers).length} réponse(s)` : "Aucune"}
            </span>
          </div>

          <!-- Brouillons -->
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 12px; background: rgba(255,255,255,0.03); border-radius: 2px; border: 1px solid var(--line);">
            <div style="display: flex; align-items: center; gap: 8px;">
              ${icon("file-text", 14)}
              <span style="font-size: 14px;">Brouillons de formulaire</span>
            </div>
            <span style="font-size: 12px; font-weight: 600; color: ${hasDrafts ? "var(--ember)" : "var(--slate)"};">
              ${hasDrafts ? "⚠ Brouillons présents" : "Aucun"}
            </span>
          </div>

          <!-- Historique navigation -->
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 12px; background: rgba(255,255,255,0.03); border-radius: 2px; border: 1px solid var(--line);">
            <div style="display: flex; align-items: center; gap: 8px;">
              ${icon("navigation", 14)}
              <span style="font-size: 14px;">Historique de navigation</span>
            </div>
            <span style="font-size: 12px; font-weight: 600; color: ${hasHistory ? "var(--ink-muted2)" : "var(--slate)"};">
              ${hasHistory ? `${state.history.length} page(s)` : "Vide"}
            </span>
          </div>

          <!-- Consentement -->
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 12px; background: rgba(255,255,255,0.03); border-radius: 2px; border: 1px solid var(--line);">
            <div style="display: flex; align-items: center; gap: 8px;">
              ${icon("check-circle", 14)}
              <span style="font-size: 14px;">Préférences de consentement</span>
            </div>
            <span style="font-size: 12px; font-weight: 600; color: ${consent.userChoice ? "var(--moss)" : "var(--slate)"};">
              ${consent.userChoice ? "✓ Choix enregistré" : "Non renseigné"}
            </span>
          </div>

          <!-- Logs audit (conservés pour sécurité) -->
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 12px; background: rgba(255,165,0,0.05); border-radius: 2px; border: 1px solid rgba(255,165,0,0.2);">
            <div style="display: flex; align-items: center; gap: 8px;">
              ${icon("lock", 14)}
              <div>
                <span style="font-size: 14px;">Journaux de sécurité</span>
                <div style="font-size: 11px; color: var(--slate);">Conservés pour audit — non supprimables</div>
              </div>
            </div>
            <span style="font-size: 12px; font-weight: 600; color: var(--slate);">
              ${hasDeletionLogs ? "Présents" : "Vides"}
            </span>
          </div>

        </div>
      </div>

      <!-- SECTION: Consentements Analytics -->
      <div class="card" style="margin-bottom: 24px; border: 1px solid var(--line);">
        <h2 class="h3 font-display">Consentement et suivi analytics</h2>
        <p style="color: var(--slate); font-size: 14px; margin-bottom: 16px;">
          Nous utilisons des outils de mesure d'audience afin d'améliorer l'expérience utilisateur.
          Vous pouvez retirer votre consentement à tout moment.
        </p>

        <div style="display: grid; gap: 16px;">
          ${
            hasGA
              ? `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: rgba(255,255,255,0.04); border-radius: 2px;">
              <div>
                <strong>Google Analytics</strong>
                <p style="font-size: 12px; color: var(--slate); margin-top: 4px;">Analyse du comportement utilisateur et des pages consultées</p>
              </div>
              ${googleAnalyticsStatus}
            </div>
          `
              : ""
          }

          ${
            hasClarity
              ? `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: rgba(255,255,255,0.04); border-radius: 2px;">
              <div>
                <strong>Microsoft Clarity</strong>
                <p style="font-size: 12px; color: var(--slate); margin-top: 4px;">Heatmaps et enregistrements de session pour optimiser l'UX</p>
              </div>
              ${microsoftClarityStatus}
            </div>
          `
              : ""
          }

          ${
            hasGA || hasClarity
              ? `
            <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 4px;">
              <button class="btn btn-outline-dark" data-privacy-consent="accept" style="flex: 1; min-width: 120px; justify-content: center;">
                ${icon("check", 14)} Accepter tout
              </button>
              <button class="btn btn-outline-dark" data-privacy-consent="customize" style="flex: 1; min-width: 120px; justify-content: center;">
                ${icon("sliders", 14)} Personnaliser
              </button>
              <button class="btn" data-privacy-consent="refuse" style="
                flex: 1; min-width: 120px; justify-content: center;
                background: transparent; color: var(--ember);
                border: 1.5px solid var(--ember); font-weight: 600;
              ">
                ${icon("x-circle", 14)} Retirer mon consentement
              </button>
            </div>
            ${consent.lastUpdated ? `
              <p style="font-size: 11px; color: var(--slate); margin-top: 4px;">
                Dernière mise à jour : ${new Date(consent.lastUpdated).toLocaleString("fr-FR")}
              </p>
            ` : ""}
          `
              : `<p style="color: var(--slate); font-style: italic;">Aucun service d'analytics détecté sur cette instance.</p>`
          }
        </div>
      </div>

      <!-- SECTION: Actions de Suppression -->
      <div class="card" style="margin-bottom: 24px; border: 2px solid var(--ember-soft);">
        <h2 class="h3 font-display" style="color: var(--ember);">Gestion et suppression des données</h2>
        <p style="color: var(--slate); font-size: 14px; margin-bottom: 16px;">
          Toute suppression est <strong>journalisée</strong> et <strong>irréversible</strong> après confirmation.
        </p>

        <div style="display: grid; gap: 12px;">
          <!-- Exporter -->
          <button class="btn btn-outline-dark" data-privacy-export="data" style="justify-content: center;">
            ${icon("download", 14)} Télécharger mes données (JSON)
          </button>

          <!-- Effacer brouillons -->
          <button class="btn btn-outline-dark" data-privacy-delete="drafts" style="justify-content: center;">
            ${icon("trash-2", 14)} Effacer mes brouillons
          </button>

          <!-- Effacer historique -->
          <button class="btn btn-outline-dark" data-privacy-delete="history" style="justify-content: center;">
            ${icon("trash-2", 14)} Effacer tout mon historique
          </button>

          <!-- Supprimer profil -->
          ${
            hasProfile
              ? `
            <button class="btn btn-outline-dark" data-privacy-delete="profile" style="justify-content: center; color: var(--ember); border-color: var(--ember-soft);">
              ${icon("user-x", 14)} Supprimer mon profil
            </button>
          `
              : ""
          }

          <!-- Supprimer compte (DESTRUCTIVE) -->
          <div style="border-top: 1px solid var(--ember-soft); padding-top: 12px; margin-top: 4px;">
            <p style="font-size: 12px; color: var(--ember); margin-bottom: 10px; font-weight: 600;">
              ⚠ Zone dangereuse — action irréversible
            </p>
            <button class="btn" style="background: var(--ember); color: white; justify-content: center; font-weight: 600; padding: 12px 16px; width: 100%;" data-privacy-delete="account">
              ${icon("alert-circle", 14)} Supprimer mon compte définitivement
            </button>
          </div>
        </div>
      </div>

      <!-- SECTION: Informations RGPD -->
      <div class="card" style="background: rgba(255,255,255,0.04); border: 1px solid var(--line);">
        <h2 class="h3 font-display">Vos droits (RGPD)</h2>
        <ul style="list-style: none; padding: 0; gap: 12px; display: grid; font-size: 14px;">
          <li>✓ <strong>Droit d'accès</strong> : Téléchargez vos données au format JSON</li>
          <li>✓ <strong>Droit à l'oubli</strong> : Suppression complète et irréversible</li>
          <li>✓ <strong>Droit de rectification</strong> : Modifiez vos informations dans votre profil</li>
          <li>✓ <strong>Droit à la portabilité</strong> : Exportez au format JSON standard</li>
          <li>✓ <strong>Droit d'opposition</strong> : Refusez ou retirez le suivi analytics</li>
          <li style="color: var(--slate); font-size: 12px; margin-top: 8px;">
            🔒 Les journaux de sécurité sont conservés à des fins légales et ne peuvent pas être supprimés par l'utilisateur.
          </li>
        </ul>
      </div>
    </div>

    ${adminLogsSection}

    <!-- Modal de confirmation (sera inséré par events.js) -->
    <div id="privacy-modal-container"></div>
  </div>
  `;
}
