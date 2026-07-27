/* ==========================================================
   pages/privacy.js — Page de gestion des données personnelles.
   Interface type "Console Firebase" compacte avec accordéons & KPI.
   ========================================================== */

import { state } from "../state.js";
import { escapeHtml, icon } from "../helpers.js";
import { auth } from "../firebase.js";
import {
  exportUserData,
  getAnalyticsConsent,
  hasGoogleAnalytics,
  hasMicrosoftClarity,
  getDeletionLogs,
} from "../modules/privacy.js";

const goalLabels = {
  remise: "Remise en forme",
  "perte-poids": "Perte de poids",
  musculation: "Musculation / Prise de masse",
  endurance: "Endurance",
  sante: "Santé générale",
  "endurance-sante": "Endurance & Santé",
};

const trackLabels = {
  salle: "Salle de gym (Machines & Poids libres)",
  gym: "Salle de gym (Machines & Poids libres)",
  "maison-mat": "Maison (avec haltères / élastiques)",
  "home-equip": "Maison (avec haltères / élastiques)",
  "poids-corps": "Maison (au poids du corps)",
  bodyweight: "Maison (au poids du corps)",
};

const levelLabels = {
  debutant: "Débutant (moins de 6 mois)",
  intermediaire: "Intermédiaire (6 mois à 2 ans)",
  avance: "Avancé (plus de 2 ans)",
};

export function renderPrivacyPage() {
  const userData = exportUserData();
  const consent = getAnalyticsConsent();
  const hasGA = hasGoogleAnalytics();
  const hasClarity = hasMicrosoftClarity();
  const deletionLogs = state.role === "admin" ? getDeletionLogs() : [];

  const profile = state.clientProfile || {};
  const physique = profile.physique || {};
  const hasProfile = !!profile.firstName || !!profile.lastName || !!profile.email;
  const effectiveQuiz = (state.quizAnswers && Object.keys(state.quizAnswers).length > 0)
    ? state.quizAnswers
    : (profile.quizAnswers || {});
  const quizCount = Object.keys(effectiveQuiz).length;
  const hasQuiz = quizCount > 0 || !!profile.goal || !!profile.track;
  const quizDisplayCount = quizCount > 0 ? quizCount : (profile.goal || profile.track ? 2 : 0);
  const hasDrafts =
    !!(state.drafts?.contact?.name || state.drafts?.contact?.message || state.drafts?.signup?.firstName);
  const progressCount = (state.progressLogs || []).length;
  const activeProgramName = profile.program?.title || state.clientProgram?.title || null;

  const isGoogleAuth = auth.currentUser?.providerData?.some((p) => p.providerId === "google.com");
  const pendingDeletion = profile.pendingDeletion || null;

  const googleAnalyticsStatus = hasGA
    ? `<span style="
        display: inline-flex; align-items: center; gap: 4px;
        padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600;
        background: ${consent.googleAnalytics ? "rgba(60,150,80,0.15)" : "rgba(226,98,45,0.15)"};
        color: ${consent.googleAnalytics ? "var(--moss)" : "var(--ember)"};
      ">${consent.googleAnalytics ? "✓ Accepté" : "✗ Refusé"}</span>`
    : `<span style="padding: 4px 10px; border-radius: 20px; font-size: 12px; background: rgba(107,114,128,0.1); color: var(--slate); border: 1px solid var(--line);">⚪ Non détecté</span>`;

  const microsoftClarityStatus = hasClarity
    ? `<span style="
        display: inline-flex; align-items: center; gap: 4px;
        padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600;
        background: ${consent.microsoftClarity ? "rgba(60,150,80,0.15)" : "rgba(226,98,45,0.15)"};
        color: ${consent.microsoftClarity ? "var(--moss)" : "var(--ember)"};
      ">${consent.microsoftClarity ? "✓ Accepté" : "✗ Refusé"}</span>`
    : `<span style="padding: 4px 10px; border-radius: 20px; font-size: 12px; background: rgba(107,114,128,0.1); color: var(--slate); border: 1px solid var(--line);">⚪ Non détecté</span>`;

  // --- VUE ADMIN / COACH ---
  if (state.role === "admin") {
    return `
    <div style="min-height: 80vh; background: var(--chalk); padding-bottom: 40px;">
      <div class="section wrap" style="max-width: 1120px; margin: 0 auto;">
        
        <!-- HEADER EN-TÊTE MARQUE & REBRANDING -->
        <div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: flex-end; gap: 16px; margin-bottom: 24px;">
          <div>
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
              <span class="font-mono" style="font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; padding: 3px 8px; background: rgba(226,98,45,0.1); color: var(--ember); border-radius: 3px; font-weight: 600;">
                CONSOLE DE GESTION ADMINISTRATEUR
              </span>
              <span style="font-size: 12px; color: var(--slate); font-family: var(--font-mono, monospace);">[ID: ${auth.currentUser?.uid?.substring(0, 8) || "admin"}]</span>
            </div>
            <h1 class="font-display" style="font-size: 28px; margin: 0 0 6px 0; color: var(--ink);">Mes données & Audit Coach</h1>
            <p style="color: var(--slate); margin: 0; font-size: 14px; max-width: 640px;">
              Interface console unifiée : données de compte administrateur, sécurité des identifiants et journal d'audit.
            </p>
          </div>

          <div style="display: flex; align-items: center; gap: 10px;">
            <button class="btn btn-outline-dark" id="btn-open-edit-profile" style="font-size: 13px; padding: 8px 14px; display: inline-flex; align-items: center; gap: 6px;">
              ${icon("edit", 14)} Modifier identité
            </button>
            <button class="btn btn-ember" data-privacy-export="data" style="font-size: 13px; padding: 8px 14px; display: inline-flex; align-items: center; gap: 6px; font-weight: 600;">
              ${icon("download", 14)} Export JSON
            </button>
          </div>
        </div>

        <!-- TOP CONSOLE KPI GRID (Firebase Console style) -->
        <div class="console-kpi-grid">
          <div class="console-kpi-card">
            <div>
              <div style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: var(--slate); letter-spacing: 0.05em;">Compte Coach</div>
              <div style="font-size: 15px; font-weight: 700; color: var(--ink); margin-top: 4px;">
                ${escapeHtml((profile.firstName || "Abdou") + " " + (profile.lastName || "BAKARI"))}
              </div>
              <div style="font-size: 12px; color: var(--slate); margin-top: 2px;">${escapeHtml(profile.email || "djabarbakari.032003@gmail.com")}</div>
            </div>
            <div style="margin-top: 10px; display: flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 600; color: var(--ember);">
              <span style="width: 8px; height: 8px; border-radius: 50%; background: var(--ember); display: inline-block;"></span>
              Role Administrateur Principal
            </div>
          </div>

          <div class="console-kpi-card">
            <div>
              <div style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: var(--slate); letter-spacing: 0.05em;">Session Active</div>
              <div style="font-size: 15px; font-weight: 700; color: var(--moss); margin-top: 4px;">
                Connecté / Sécurisé
              </div>
              <div style="font-size: 12px; color: var(--slate); margin-top: 2px;">
                ${state.lastVisitedAt ? "Dernière visite: " + new Date(state.lastVisitedAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) : "Aujourd'hui"}
              </div>
            </div>
            <div style="margin-top: 10px; display: flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 600; color: var(--moss);">
              <span style="width: 8px; height: 8px; border-radius: 50%; background: var(--moss); display: inline-block;"></span>
              Session Firebase Auth active
            </div>
          </div>

          <div class="console-kpi-card">
            <div>
              <div style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: var(--slate); letter-spacing: 0.05em;">Journal d'Audit</div>
              <div style="font-size: 15px; font-weight: 700; color: var(--ink); margin-top: 4px;">
                ${deletionLogs.length} action(s) d'audit
              </div>
              <div style="font-size: 12px; color: var(--slate); margin-top: 2px;">Traçabilité RGPD active</div>
            </div>
            <div style="margin-top: 10px; font-size: 11px; font-weight: 600; color: var(--slate);">
              Dernière purge: Inaltérable
            </div>
          </div>

          <div class="console-kpi-card">
            <div>
              <div style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: var(--slate); letter-spacing: 0.05em;">Analytics Plateforme</div>
              <div style="font-size: 15px; font-weight: 700; color: var(--ink); margin-top: 4px;">
                ${hasGA || hasClarity ? "Détecté" : "Script inactif"}
              </div>
              <div style="font-size: 12px; color: var(--slate); margin-top: 2px;">GA4 & Clarity auto-check</div>
            </div>
            <div style="margin-top: 10px; font-size: 11px; font-weight: 600; color: var(--slate);">
              Respect règles CNIL / RGPD
            </div>
          </div>
        </div>

        <!-- ACCORDÉONS COMPACTS STYLE CONSOLE FIREBASE -->
        <div>

          <!-- ACCORDÉON 1: Coordonnées & Mot de passe Coach -->
          <details class="console-accordion" open>
            <summary>
              <div style="display: flex; align-items: center; gap: 12px;">
                <div style="width: 32px; height: 32px; border-radius: 4px; background: rgba(226,98,45,0.1); display: flex; align-items: center; justify-content: center; color: var(--ember);">
                  ${icon("user", 16)}
                </div>
                <div>
                  <strong style="font-size: 15px; color: var(--ink);">1. Coordonnées de l'Administrateur & Mot de passe</strong>
                  <div style="font-size: 12px; color: var(--slate);">Identité coach, téléphone, adresse e-mail et réinitialisation de passe</div>
                </div>
              </div>
              <div style="display: flex; align-items: center; gap: 12px;">
                <span style="font-size: 12px; font-weight: 600; color: var(--moss); background: rgba(60,150,80,0.1); padding: 3px 10px; border-radius: 12px;">
                  ✓ Configuré
                </span>
                <span class="accordion-chevron">${icon("chevron-down", 16)}</span>
              </div>
            </summary>
            <div class="accordion-content">
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px; background: rgba(0,0,0,0.02); padding: 14px; border-radius: 4px; border: 1px solid var(--line); margin-bottom: 16px;">
                <div>
                  <div style="font-size: 11px; color: var(--slate); font-weight: 600;">Prénom & Nom</div>
                  <div style="font-size: 14px; font-weight: 600; margin-top: 2px; color: var(--ink);">${escapeHtml(profile.firstName || "Abdou")} ${escapeHtml(profile.lastName || "BAKARI")}</div>
                </div>
                <div>
                  <div style="font-size: 11px; color: var(--slate); font-weight: 600;">E-mail principal</div>
                  <div style="font-size: 14px; font-weight: 600; margin-top: 2px; color: var(--ink);">${escapeHtml(profile.email || "djabarbakari.032003@gmail.com")}</div>
                </div>
                <div>
                  <div style="font-size: 11px; color: var(--slate); font-weight: 600;">Téléphone</div>
                  <div style="font-size: 14px; font-weight: 600; margin-top: 2px; color: var(--ink);">${escapeHtml(profile.phone || "Non renseigné")}</div>
                </div>
                <div>
                  <div style="font-size: 11px; color: var(--slate); font-weight: 600;">Statut compte</div>
                  <div style="font-size: 14px; font-weight: 600; margin-top: 2px; color: var(--ember);">Coach Administrateur</div>
                </div>
              </div>

              <div style="display: flex; flex-wrap: wrap; gap: 10px;">
                <button class="btn btn-outline-dark" id="btn-open-edit-profile" style="font-size: 13px;">
                  ${icon("edit", 14)} Modifier mes coordonnées
                </button>
                <button class="btn btn-outline-dark" id="btn-request-password-reset" style="font-size: 13px;">
                  ${icon("mail", 14)} Réinitialiser le mot de passe par e-mail
                </button>
                <button class="btn btn-outline-dark" id="btn-open-change-password-modal" style="font-size: 13px;">
                  ${icon("key", 14)} Modifier le mot de passe
                </button>
              </div>
            </div>
          </details>

          <!-- ACCORDÉON 2: Privilèges Admin & Audit Trail -->
          <details class="console-accordion" open>
            <summary>
              <div style="display: flex; align-items: center; gap: 12px;">
                <div style="width: 32px; height: 32px; border-radius: 4px; background: rgba(60,150,80,0.1); display: flex; align-items: center; justify-content: center; color: var(--moss);">
                  ${icon("shield", 16)}
                </div>
                <div>
                  <strong style="font-size: 15px; color: var(--ink);">2. Privilèges d'administration & Audit Trail</strong>
                  <div style="font-size: 12px; color: var(--slate);">Habilitations sur les comptes clients et journal d'audit de sécurité</div>
                </div>
              </div>
              <div style="display: flex; align-items: center; gap: 12px;">
                <span style="font-size: 12px; font-weight: 600; color: var(--ink); background: rgba(0,0,0,0.05); padding: 3px 10px; border-radius: 12px;">
                  ${deletionLogs.length} Log(s)
                </span>
                <span class="accordion-chevron">${icon("chevron-down", 16)}</span>
              </div>
            </summary>
            <div class="accordion-content">
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; font-size: 13px; margin-bottom: 16px;">
                <div style="background: rgba(0,0,0,0.02); padding: 12px; border-radius: 4px; border: 1px solid var(--line);">
                  <strong style="color: var(--ink);">✓ Suivi des fiches clients</strong>
                  <p style="color: var(--slate); font-size: 12px; margin: 2px 0 0;">Consultation des réponses d'onboarding et attribution des programmes d'entraînement.</p>
                </div>
                <div style="background: rgba(0,0,0,0.02); padding: 12px; border-radius: 4px; border: 1px solid var(--line);">
                  <strong style="color: var(--ink);">✓ Messagerie & Support</strong>
                  <p style="color: var(--slate); font-size: 12px; margin: 2px 0 0;">Traitement des messages des visiteurs et clients.</p>
                </div>
                <div style="background: rgba(0,0,0,0.02); padding: 12px; border-radius: 4px; border: 1px solid var(--line);">
                  <strong style="color: var(--ink);">✓ Statistiques & Fréquentation</strong>
                  <p style="color: var(--slate); font-size: 12px; margin: 2px 0 0;">Aperçu analytique global des séances effectuées.</p>
                </div>
              </div>

              <div style="margin-top: 12px;">
                <h4 style="font-size: 13px; font-weight: 700; margin: 0 0 8px 0; color: var(--ink);">Historique des logs d'audit de sécurité</h4>
                ${
                  deletionLogs.length > 0
                    ? `
                  <div style="border: 1px solid var(--line); border-radius: 4px; overflow-x: auto;">
                    <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                      <thead>
                        <tr style="background: var(--ink); color: var(--chalk);">
                          <th style="padding: 8px 12px; text-align: left;">Horodatage</th>
                          <th style="padding: 8px 12px; text-align: left;">Action enregistrée</th>
                          <th style="padding: 8px 12px; text-align: left;">Exécutant</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${deletionLogs
                          .slice()
                          .reverse()
                          .slice(0, 5)
                          .map(
                            (log) => `
                          <tr style="border-bottom: 1px solid var(--line);">
                            <td style="padding: 8px 12px; white-space: nowrap;">${new Date(log.timestamp).toLocaleString("fr-FR")}</td>
                            <td style="padding: 8px 12px; color: var(--ember); font-weight: 600;">${escapeHtml(log.action)}</td>
                            <td style="padding: 8px 12px;">${escapeHtml(log.userRole)}</td>
                          </tr>
                        `
                          )
                          .join("")}
                      </tbody>
                    </table>
                  </div>
                `
                    : `<p style="font-size: 12px; color: var(--slate); font-style: italic; margin: 0;">Aucun log d'action enregistré.</p>`
                }
              </div>
            </div>
          </details>

          <!-- ACCORDÉON 3: Analytics & Exportation JSON -->
          <details class="console-accordion">
            <summary>
              <div style="display: flex; align-items: center; gap: 12px;">
                <div style="width: 32px; height: 32px; border-radius: 4px; background: rgba(0,0,0,0.05); display: flex; align-items: center; justify-content: justify; color: var(--ink);">
                  ${icon("download", 16)}
                </div>
                <div>
                  <strong style="font-size: 15px; color: var(--ink);">3. Analytics & Portabilité des Données (JSON)</strong>
                  <div style="font-size: 12px; color: var(--slate);">Téléchargement du fichier de configuration et consentement d'audience</div>
                </div>
              </div>
              <div style="display: flex; align-items: center; gap: 12px;">
                <span style="font-size: 12px; font-weight: 600; color: var(--slate); background: rgba(0,0,0,0.05); padding: 3px 10px; border-radius: 12px;">
                  Portabilité RGPD
                </span>
                <span class="accordion-chevron">${icon("chevron-down", 16)}</span>
              </div>
            </summary>
            <div class="accordion-content">
              <div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 16px; margin-bottom: 16px; padding: 12px 14px; background: rgba(0,0,0,0.02); border-radius: 4px; border: 1px solid var(--line);">
                <div>
                  <strong style="font-size: 14px; color: var(--ink);">Fichier d'exportation au format JSON</strong>
                  <p style="font-size: 12px; color: var(--slate); margin: 2px 0 0;">Contient vos paramètres de compte et vos logs de session.</p>
                </div>
                <button class="btn btn-ember" data-privacy-export="data" style="font-size: 13px; font-weight: 600; padding: 8px 16px;">
                  ${icon("download", 14)} Télécharger mes données (JSON)
                </button>
              </div>

              <div style="display: grid; gap: 10px; font-size: 13px;">
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 12px; background: rgba(0,0,0,0.01); border-radius: 4px; border: 1px solid var(--line);">
                  <div><strong>Google Analytics (GA4)</strong></div>
                  ${googleAnalyticsStatus}
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 12px; background: rgba(0,0,0,0.01); border-radius: 4px; border: 1px solid var(--line);">
                  <div><strong>Microsoft Clarity</strong></div>
                  ${microsoftClarityStatus}
                </div>
              </div>
            </div>
          </details>

          <!-- ACCORDÉON 4: Protection du compte Administrateur -->
          <details class="console-accordion">
            <summary>
              <div style="display: flex; align-items: center; gap: 12px;">
                <div style="width: 32px; height: 32px; border-radius: 4px; background: rgba(226,98,45,0.1); display: flex; align-items: center; justify-content: center; color: var(--ember);">
                  ${icon("shield-off", 16)}
                </div>
                <div>
                  <strong style="font-size: 15px; color: var(--ember);">4. Sécurité du compte administrateur</strong>
                  <div style="font-size: 12px; color: var(--slate);">Protection contre la suppression accidentelle</div>
                </div>
              </div>
              <div style="display: flex; align-items: center; gap: 12px;">
                <span style="font-size: 12px; font-weight: 600; color: var(--ember); background: rgba(226,98,45,0.1); padding: 3px 10px; border-radius: 12px;">
                  Protections Actives
                </span>
                <span class="accordion-chevron">${icon("chevron-down", 16)}</span>
              </div>
            </summary>
            <div class="accordion-content">
              <div style="background: rgba(226,98,45,0.05); border: 1px solid rgba(226,98,45,0.2); padding: 14px; border-radius: 4px; font-size: 13px; color: var(--ink); line-height: 1.5;">
                <strong style="color: var(--ember);">Compte protégé par politique de sécurité :</strong><br/>
                La suppression directe du compte administrateur est bloquée pour prévenir toute perte d'accès au système. Pour toute demande de modification de privilèges, contactez l'administrateur principal (djabarbakari.032003@gmail.com).
              </div>
            </div>
          </details>

        </div>
      </div>
    </div>
    `;
  }

  // --- VUE CLIENT / MEMBRE ---
  return `
  <div style="min-height: 80vh; background: var(--chalk); padding-bottom: 40px;">
    <div class="section wrap" style="max-width: 1120px; margin: 0 auto;">
      
      <!-- HEADER EN-TÊTE MARQUE & REBRANDING -->
      <div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: flex-end; gap: 16px; margin-bottom: 24px;">
        <div>
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
            <span class="font-mono" style="font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; padding: 3px 8px; background: rgba(60,150,80,0.12); color: var(--moss); border-radius: 3px; font-weight: 600;">
              CONSOLE DE GESTION DES DONNÉES (RGPD)
            </span>
            <span style="font-size: 12px; color: var(--slate); font-family: var(--font-mono, monospace);">[ESPACE CLIENT SÉCURISÉ]</span>
          </div>
          <h1 class="font-display" style="font-size: 28px; margin: 0 0 6px 0; color: var(--ink);">Mes données personnelles</h1>
          <p style="color: var(--slate); margin: 0; font-size: 14px; max-width: 640px;">
            Consultez votre profil, gérez votre sécurité, ajustez vos paramètres sportifs et téléchargez vos données en un clic.
          </p>
        </div>

        <div style="display: flex; align-items: center; gap: 10px;">
          <button class="btn btn-outline-dark" id="btn-open-edit-profile" style="font-size: 13px; padding: 8px 14px; display: inline-flex; align-items: center; gap: 6px;">
            ${icon("edit", 14)} Modifier mon profil
          </button>
          <button class="btn btn-ember" data-privacy-export="data" style="font-size: 13px; padding: 8px 14px; display: inline-flex; align-items: center; gap: 6px; font-weight: 600;">
            ${icon("download", 14)} Export JSON
          </button>
        </div>
      </div>

      ${
        pendingDeletion
          ? `
        <div style="
          background: rgba(226, 98, 45, 0.08); border: 1.5px solid var(--ember); border-radius: 6px;
          padding: 14px 18px; margin-bottom: 20px; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px;
        ">
          <div>
            <div style="font-size: 14px; font-weight: 700; color: var(--ember); display: flex; align-items: center; gap: 6px;">
              ${icon("alert-triangle", 16)} DEMANDE DE SUPPRESSION DE COMPTE EN COURS
            </div>
            <p style="font-size: 12px; color: var(--ink); margin: 2px 0 0; line-height: 1.4;">
              Suppression prévue le <strong>${new Date(pendingDeletion.executeAt).toLocaleDateString("fr-FR", { weekday: "short", year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</strong>.
            </p>
          </div>
          <button class="btn btn-ember" id="btn-cancel-account-deletion" style="white-space: nowrap; gap: 6px; font-size: 12px; padding: 6px 12px;">
            ${icon("rotate-ccw", 13)} Annuler la suppression
          </button>
        </div>
      `
          : ""
      }

      <!-- TOP CONSOLE KPI GRID (Firebase Console Overview Style) -->
      <div class="console-kpi-grid">
        <!-- KPI 1: Identité -->
        <div class="console-kpi-card">
          <div>
            <div style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: var(--slate); letter-spacing: 0.05em;">Compte Client</div>
            <div style="font-size: 15px; font-weight: 700; color: var(--ink); margin-top: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
              ${escapeHtml((profile.firstName || "Mon") + " " + (profile.lastName || "Profil"))}
            </div>
            <div style="font-size: 12px; color: var(--slate); margin-top: 2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
              ${escapeHtml(profile.email || state.drafts?.signup?.email || "Connecté")}
            </div>
          </div>
          <div style="margin-top: 10px; display: flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 600; color: var(--moss);">
            <span style="width: 8px; height: 8px; border-radius: 50%; background: var(--moss); display: inline-block;"></span>
            Compte Actif
          </div>
        </div>

        <!-- KPI 2: Profil Sportif -->
        <div class="console-kpi-card">
          <div>
            <div style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: var(--slate); letter-spacing: 0.05em;">Profil Sportif</div>
            <div style="font-size: 14px; font-weight: 700; color: var(--ember); margin-top: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
              ${escapeHtml(goalLabels[profile.goal] || profile.goal || "À configurer")}
            </div>
            <div style="font-size: 12px; color: var(--slate); margin-top: 2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
              ${escapeHtml(trackLabels[profile.track] || profile.track || "Lieu non défini")}
            </div>
          </div>
          <div style="margin-top: 10px; font-size: 11px; font-weight: 600; color: var(--ink);">
            ${profile.frequence ? profile.frequence + " séances / sem" : "Fréquence non définie"}
          </div>
        </div>

        <!-- KPI 3: Questionnaire & Programme -->
        <div class="console-kpi-card">
          <div>
            <div style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: var(--slate); letter-spacing: 0.05em;">Programme & Quiz</div>
            <div style="font-size: 14px; font-weight: 700; color: var(--ink); margin-top: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
              ${activeProgramName ? escapeHtml(activeProgramName) : "Aucun attribué"}
            </div>
            <div style="font-size: 12px; color: var(--slate); margin-top: 2px;">
              ${hasQuiz ? `✓ ${quizDisplayCount} réponse(s) enregistrée(s)` : "Quiz non renseigné"}
            </div>
          </div>
          <div style="margin-top: 10px; font-size: 11px; font-weight: 600; color: ${hasQuiz ? "var(--moss)" : "var(--slate)"};">
            ${hasQuiz ? "✓ Onboarding complété" : "⚪ Compléter l'onboarding"}
          </div>
        </div>

        <!-- KPI 4: Sécurité & Analytics -->
        <div class="console-kpi-card">
          <div>
            <div style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: var(--slate); letter-spacing: 0.05em;">Sécurité & RGPD</div>
            <div style="font-size: 14px; font-weight: 700; color: var(--ink); margin-top: 4px;">
              ${isGoogleAuth ? "Authentification Google" : "E-mail & Mot de passe"}
            </div>
            <div style="font-size: 12px; color: var(--slate); margin-top: 2px;">
              ${consent.lastUpdated ? "Consentement à jour" : "Préférences par défaut"}
            </div>
          </div>
          <div style="margin-top: 10px; font-size: 11px; font-weight: 600; color: var(--moss);">
            ✓ Données protégées RGPD
          </div>
        </div>
      </div>

      <!-- ACCORDÉONS COMPACTS STYLE CONSOLE FIREBASE -->
      <div>

        <!-- ACCORDÉON 1: Coordonnées & Sécurité du Compte -->
        <details class="console-accordion" open>
          <summary>
            <div style="display: flex; align-items: center; gap: 12px;">
              <div style="width: 32px; height: 32px; border-radius: 4px; background: rgba(226,98,45,0.1); display: flex; align-items: center; justify-content: center; color: var(--ember);">
                ${icon("user", 16)}
              </div>
              <div>
                <strong style="font-size: 15px; color: var(--ink);">1. Coordonnées & Sécurité de connexion</strong>
                <div style="font-size: 12px; color: var(--slate);">Informations personnelles, adresse e-mail, téléphone et gestion du mot de passe</div>
              </div>
            </div>
            <div style="display: flex; align-items: center; gap: 12px;">
              <span style="font-size: 12px; font-weight: 600; color: var(--moss); background: rgba(60,150,80,0.1); padding: 3px 10px; border-radius: 12px;">
                ✓ Identité vérifiée
              </span>
              <span class="accordion-chevron">${icon("chevron-down", 16)}</span>
            </div>
          </summary>
          <div class="accordion-content">
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 14px; background: rgba(0,0,0,0.02); padding: 14px; border-radius: 4px; border: 1px solid var(--line); margin-bottom: 16px;">
              <div>
                <div style="font-size: 11px; color: var(--slate); font-weight: 600;">Prénom</div>
                <div style="font-size: 14px; font-weight: 600; margin-top: 2px; color: var(--ink);">${escapeHtml(profile.firstName || "Non renseigné")}</div>
              </div>
              <div>
                <div style="font-size: 11px; color: var(--slate); font-weight: 600;">Nom</div>
                <div style="font-size: 14px; font-weight: 600; margin-top: 2px; color: var(--ink);">${escapeHtml(profile.lastName || "Non renseigné")}</div>
              </div>
              <div>
                <div style="font-size: 11px; color: var(--slate); font-weight: 600;">Adresse email</div>
                <div style="font-size: 14px; font-weight: 600; margin-top: 2px; color: var(--ink);">${escapeHtml(profile.email || state.drafts?.signup?.email || "Non renseignée")}</div>
              </div>
              <div>
                <div style="font-size: 11px; color: var(--slate); font-weight: 600;">Téléphone</div>
                <div style="font-size: 14px; font-weight: 600; margin-top: 2px; color: var(--ink);">${escapeHtml(profile.phone || "Non renseigné")}</div>
              </div>
            </div>

            <div style="background: rgba(0,0,0,0.015); padding: 14px; border-radius: 4px; border: 1px solid var(--line); display: grid; gap: 12px;">
              ${
                isGoogleAuth
                  ? `
                <div style="display: flex; align-items: center; gap: 10px;">
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <span style="font-size: 13px; font-weight: 600; color: var(--ink);">Compte associé à Google Authentification</span>
                </div>
                <button class="btn btn-outline-dark" id="btn-request-password-reset" style="font-size: 12px; display: inline-flex; align-items: center; gap: 6px; width: fit-content;">
                  ${icon("mail", 13)} Définir également un mot de passe par e-mail
                </button>
              `
                  : `
                <div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 10px;">
                  <div>
                    <div style="font-size: 13px; font-weight: 600; color: var(--ink);">Mot de passe de compte : •••••••••••••</div>
                    <div style="font-size: 12px; color: var(--slate); margin-top: 2px;">Chiffré de manière unidirectionnelle conformément aux normes RGPD</div>
                  </div>
                  <button class="btn btn-outline-dark" id="btn-toggle-password-view-info" style="font-size: 11px; padding: 4px 10px;">
                    ${icon("eye", 12)} En savoir plus
                  </button>
                </div>

                <div id="password-security-info" style="display: none; padding: 10px 12px; background: rgba(60,150,80,0.06); border-left: 3px solid var(--moss); border-radius: 3px; font-size: 12px; color: var(--ink);">
                  Afin de garantir une sécurité maximale, les mots de passe ne sont jamais stockés en clair. Seule la réinitialisation par e-mail sécurisé ou la mise à jour authentifiée est possible.
                </div>

                <div style="display: flex; flex-wrap: wrap; gap: 10px; margin-top: 4px;">
                  <button class="btn btn-ember" id="btn-request-password-reset" style="font-size: 12px; padding: 8px 14px; display: inline-flex; align-items: center; gap: 6px;">
                    ${icon("mail", 13)} Réinitialiser par e-mail
                  </button>
                  <button class="btn btn-outline-dark" id="btn-open-change-password-modal" style="font-size: 12px; padding: 8px 14px; display: inline-flex; align-items: center; gap: 6px;">
                    ${icon("key", 13)} Modifier dans l'application
                  </button>
                </div>
              `
              }
            </div>

            <div style="margin-top: 14px; text-align: right;">
              <button class="btn btn-outline-dark" id="btn-open-edit-profile" style="font-size: 13px;">
                ${icon("edit", 14)} Modifier mes coordonnées
              </button>
            </div>
          </div>
        </details>

        <!-- ACCORDÉON 2: Profil Sportif & Santé -->
        <details class="console-accordion" open>
          <summary>
            <div style="display: flex; align-items: center; gap: 12px;">
              <div style="width: 32px; height: 32px; border-radius: 4px; background: rgba(60,150,80,0.1); display: flex; align-items: center; justify-content: center; color: var(--moss);">
                ${icon("activity", 16)}
              </div>
              <div>
                <strong style="font-size: 15px; color: var(--ink);">2. Profil sportif & Santé</strong>
                <div style="font-size: 12px; color: var(--slate);">Objectifs, lieu d'entraînement, niveau, mensurations et remarques médicales</div>
              </div>
            </div>
            <div style="display: flex; align-items: center; gap: 12px;">
              <span style="font-size: 12px; font-weight: 600; color: ${profile.goal ? "var(--moss)" : "var(--slate)"}; background: ${profile.goal ? "rgba(60,150,80,0.1)" : "rgba(0,0,0,0.05)"}; padding: 3px 10px; border-radius: 12px;">
                ${profile.goal ? "✓ Paramètres Renseignés" : "⚪ Non Renseigné"}
              </span>
              <span class="accordion-chevron">${icon("chevron-down", 16)}</span>
            </div>
          </summary>
          <div class="accordion-content">
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 14px; background: rgba(0,0,0,0.02); padding: 14px; border-radius: 4px; border: 1px solid var(--line); margin-bottom: 14px;">
              <div>
                <div style="font-size: 11px; color: var(--slate); font-weight: 600;">Objectif principal</div>
                <div style="font-size: 14px; font-weight: 600; margin-top: 2px; color: var(--ember);">${escapeHtml(goalLabels[profile.goal] || profile.goal || "Non défini")}</div>
              </div>
              <div>
                <div style="font-size: 11px; color: var(--slate); font-weight: 600;">Lieu / Équipement</div>
                <div style="font-size: 14px; font-weight: 600; margin-top: 2px; color: var(--ink);">${escapeHtml(trackLabels[profile.track] || profile.track || "Non défini")}</div>
              </div>
              <div>
                <div style="font-size: 11px; color: var(--slate); font-weight: 600;">Niveau d'expérience</div>
                <div style="font-size: 14px; font-weight: 600; margin-top: 2px; color: var(--ink);">${escapeHtml(levelLabels[profile.niveau] || profile.niveau || "Non défini")}</div>
              </div>
              <div>
                <div style="font-size: 11px; color: var(--slate); font-weight: 600;">Fréquence hebdomadaire</div>
                <div style="font-size: 14px; font-weight: 600; margin-top: 2px; color: var(--ink);">${profile.frequence ? escapeHtml(profile.frequence) + " séances / semaine" : "Non définie"}</div>
              </div>
              <div>
                <div style="font-size: 11px; color: var(--slate); font-weight: 600;">Poids & Taille</div>
                <div style="font-size: 14px; font-weight: 600; margin-top: 2px; color: var(--ink);">
                  ${physique.poids || profile.weight ? (physique.poids || profile.weight) + " kg" : "—"} / 
                  ${physique.taille || profile.height ? (physique.taille || profile.height) + " cm" : "—"}
                </div>
              </div>
              <div>
                <div style="font-size: 11px; color: var(--slate); font-weight: 600;">Âge</div>
                <div style="font-size: 14px; font-weight: 600; margin-top: 2px; color: var(--ink);">${physique.age || profile.age ? (physique.age || profile.age) + " ans" : "—"}</div>
              </div>
              <div style="grid-column: 1 / -1;">
                <div style="font-size: 11px; color: var(--slate); font-weight: 600;">Contraintes physiques / Medical notes</div>
                <div style="font-size: 13px; margin-top: 2px; color: var(--ink); font-style: italic;">
                  ${escapeHtml(physique.remarques || profile.medicalNotes || "Aucune contrainte enregistrée")}
                </div>
              </div>
            </div>

            <div style="text-align: right;">
              <button class="btn btn-outline-dark" id="btn-open-edit-sports" style="font-size: 13px;">
                ${icon("sliders", 14)} Ajuster mon profil sportif
              </button>
            </div>
          </div>
        </details>

        <!-- ACCORDÉON 3: Inventaire des données & Programme -->
        <details class="console-accordion">
          <summary>
            <div style="display: flex; align-items: center; gap: 12px;">
              <div style="width: 32px; height: 32px; border-radius: 4px; background: rgba(0,0,0,0.05); display: flex; align-items: center; justify-content: center; color: var(--ink);">
                ${icon("database", 16)}
              </div>
              <div>
                <strong style="font-size: 15px; color: var(--ink);">3. Programme & Inventaire des données</strong>
                <div style="font-size: 12px; color: var(--slate);">Plan actif, questionnaire d'onboarding, journal de progression et brouillons</div>
              </div>
            </div>
            <div style="display: flex; align-items: center; gap: 12px;">
              <span style="font-size: 12px; font-weight: 600; color: var(--moss); background: rgba(60,150,80,0.1); padding: 3px 10px; border-radius: 12px;">
                ${activeProgramName ? "Programme Actif" : "Inventaire OK"}
              </span>
              <span class="accordion-chevron">${icon("chevron-down", 16)}</span>
            </div>
          </summary>
          <div class="accordion-content">
            <div style="display: grid; gap: 8px;">

              <!-- Programme -->
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 12px; background: rgba(0,0,0,0.015); border-radius: 4px; border: 1px solid var(--line);">
                <div style="display: flex; align-items: center; gap: 8px;">
                  ${icon("calendar", 15)}
                  <span style="font-size: 13px; font-weight: 600;">Programme personnalisé</span>
                </div>
                <span style="font-size: 12px; font-weight: 600; color: ${activeProgramName ? "var(--moss)" : "var(--slate)"};">
                  ${activeProgramName ? `✓ ${escapeHtml(activeProgramName)}` : "Aucun programme attribué"}
                </span>
              </div>

              <!-- Questionnaire -->
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 12px; background: rgba(0,0,0,0.015); border-radius: 4px; border: 1px solid var(--line);">
                <div style="display: flex; align-items: center; gap: 8px;">
                  ${icon("clipboard-list", 15)}
                  <span style="font-size: 13px; font-weight: 600;">Questionnaire onboarding</span>
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span style="font-size: 12px; font-weight: 600; color: ${hasQuiz ? "var(--moss)" : "var(--slate)"};">
                    ${hasQuiz ? `✓ ${quizDisplayCount} réponse(s)` : "Non renseigné"}
                  </span>
                  <button class="btn btn-outline-dark" data-nav="quiz" style="padding: 2px 8px; font-size: 11px;">Repasser</button>
                </div>
              </div>

              <!-- Progression -->
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 12px; background: rgba(0,0,0,0.015); border-radius: 4px; border: 1px solid var(--line);">
                <div style="display: flex; align-items: center; gap: 8px;">
                  ${icon("check-circle", 15)}
                  <span style="font-size: 13px; font-weight: 600;">Journal de progression</span>
                </div>
                <span style="font-size: 12px; font-weight: 600; color: ${progressCount > 0 ? "var(--moss)" : "var(--slate)"};">
                  ${progressCount > 0 ? `${progressCount} séance(s) enregistrée(s)` : "0 séance validée"}
                </span>
              </div>

              <!-- Brouillons -->
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 12px; background: rgba(0,0,0,0.015); border-radius: 4px; border: 1px solid var(--line);">
                <div style="display: flex; align-items: center; gap: 8px;">
                  ${icon("file-text", 15)}
                  <span style="font-size: 13px; font-weight: 600;">Brouillons de formulaires</span>
                </div>
                <span style="font-size: 12px; font-weight: 600; color: ${hasDrafts ? "var(--ember)" : "var(--slate)"};">
                  ${hasDrafts ? "⚠ Brouillons en mémoire" : "Aucun brouillon"}
                </span>
              </div>

            </div>
          </div>
        </details>

        <!-- ACCORDÉON 4: Consentements Analytics & Portabilité JSON -->
        <details class="console-accordion">
          <summary>
            <div style="display: flex; align-items: center; gap: 12px;">
              <div style="width: 32px; height: 32px; border-radius: 4px; background: rgba(60,150,80,0.1); display: flex; align-items: center; justify-content: center; color: var(--moss);">
                ${icon("download", 16)}
              </div>
              <div>
                <strong style="font-size: 15px; color: var(--ink);">4. Consentement Analytics & Portabilité des Données (JSON)</strong>
                <div style="font-size: 12px; color: var(--slate);">Droit d'accès RGPD, téléchargement JSON et préférences de cookies</div>
              </div>
            </div>
            <div style="display: flex; align-items: center; gap: 12px;">
              <span style="font-size: 12px; font-weight: 600; color: var(--moss); background: rgba(60,150,80,0.1); padding: 3px 10px; border-radius: 12px;">
                Conforme RGPD
              </span>
              <span class="accordion-chevron">${icon("chevron-down", 16)}</span>
            </div>
          </summary>
          <div class="accordion-content">
            <div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 16px; margin-bottom: 16px; padding: 12px 14px; background: rgba(0,0,0,0.015); border-radius: 4px; border: 1px solid var(--line);">
              <div>
                <strong style="font-size: 14px; color: var(--ink);">Télécharger l'intégralité de mes données (JSON)</strong>
                <p style="font-size: 12px; color: var(--slate); margin: 2px 0 0;">Fichier structuré contenant profil, réponses au quiz, programme et journal de progression.</p>
              </div>
              <button class="btn btn-ember" data-privacy-export="data" style="font-size: 13px; font-weight: 600; padding: 8px 16px;">
                ${icon("download", 14)} Télécharger mes données (JSON)
              </button>
            </div>

            <div style="display: grid; gap: 10px; font-size: 13px; margin-bottom: 14px;">
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 12px; background: rgba(0,0,0,0.01); border-radius: 4px; border: 1px solid var(--line);">
                <div>
                  <strong>Google Analytics (GA4)</strong>
                  <div style="font-size: 11px; color: var(--slate);">Statistiques anonymes d'audience</div>
                </div>
                ${googleAnalyticsStatus}
              </div>

              <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 12px; background: rgba(0,0,0,0.01); border-radius: 4px; border: 1px solid var(--line);">
                <div>
                  <strong>Microsoft Clarity</strong>
                  <div style="font-size: 11px; color: var(--slate);">Ergonomie et cartes de chaleur</div>
                </div>
                ${microsoftClarityStatus}
              </div>
            </div>

            <div style="display: flex; flex-wrap: wrap; gap: 8px;">
              <button class="btn btn-outline-dark" data-privacy-consent="accept" style="flex: 1; font-size: 12px; padding: 6px 10px; justify-content: center;">
                ${icon("check", 13)} Accepter tout
              </button>
              <button class="btn btn-outline-dark" data-privacy-consent="customize" style="flex: 1; font-size: 12px; padding: 6px 10px; justify-content: center;">
                ${icon("sliders", 13)} Personnaliser
              </button>
              <button class="btn" data-privacy-consent="refuse" style="
                flex: 1; font-size: 12px; padding: 6px 10px; justify-content: center;
                background: transparent; color: var(--ember); border: 1px solid var(--ember); font-weight: 600;
              ">
                ${icon("x-circle", 13)} Retirer mon consentement
              </button>
            </div>
          </div>
        </details>

        <!-- ACCORDÉON 5: Zone de sécurité & Suppression (Droit à l'oubli) -->
        <details class="console-accordion">
          <summary>
            <div style="display: flex; align-items: center; gap: 12px;">
              <div style="width: 32px; height: 32px; border-radius: 4px; background: rgba(226,98,45,0.1); display: flex; align-items: center; justify-content: center; color: var(--ember);">
                ${icon("alert-triangle", 16)}
              </div>
              <div>
                <strong style="font-size: 15px; color: var(--ember);">5. Zone Sensible & Suppression (Droit à l'oubli)</strong>
                <div style="font-size: 12px; color: var(--slate);">Purge des brouillons, suppression du profil ou effacement du compte</div>
              </div>
            </div>
            <div style="display: flex; align-items: center; gap: 12px;">
              <span style="font-size: 12px; font-weight: 600; color: var(--ember); background: rgba(226,98,45,0.1); padding: 3px 10px; border-radius: 12px;">
                Zone Sensible
              </span>
              <span class="accordion-chevron">${icon("chevron-down", 16)}</span>
            </div>
          </summary>
          <div class="accordion-content">
            <p style="font-size: 13px; color: var(--slate); margin: 0 0 14px 0;">
              Conformément à l'article 17 du RGPD (Droit à l'effacement), vous pouvez réclamer la suppression de vos données à tout moment.
            </p>

            <div style="display: grid; gap: 10px; max-width: 520px;">
              <button class="btn btn-outline-dark" data-privacy-delete="drafts" style="font-size: 12px; justify-content: flex-start; gap: 8px;">
                ${icon("trash-2", 14)} Effacer uniquement les brouillons de formulaires
              </button>

              ${
                hasProfile
                  ? `
                <button class="btn btn-outline-dark" data-privacy-delete="profile" style="font-size: 12px; justify-content: flex-start; gap: 8px; color: var(--ember); border-color: rgba(226,98,45,0.3);">
                  ${icon("user-x", 14)} Effacer les informations du profil sportif
                </button>
              `
                  : ""
              }

              <div style="border-top: 1px solid var(--line); padding-top: 12px; margin-top: 4px;">
                <button class="btn" style="background: var(--ember); color: white; justify-content: center; font-weight: 600; padding: 10px 16px; width: 100%; display: flex; align-items: center; gap: 8px; font-size: 13px;" data-privacy-delete="account">
                  ${icon("trash-2", 15)} Demander la suppression définitive du compte
                </button>
              </div>
            </div>

            <!-- RAPPEL DES DROITS RGPD -->
            <div style="margin-top: 20px; padding-top: 16px; border-top: 1px solid var(--line); display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; font-size: 12px; color: var(--slate);">
              <div>
                <strong style="color: var(--ink);">✓ Droit d'accès (Art. 15)</strong>
                <p style="margin: 2px 0 0;">Téléchargez à tout moment vos données brutes en JSON.</p>
              </div>
              <div>
                <strong style="color: var(--ink);">✓ Droit de rectification (Art. 16)</strong>
                <p style="margin: 2px 0 0;">Modifiez vos nom, prénom, e-mail et profil sportif sans délai.</p>
              </div>
              <div>
                <strong style="color: var(--ink);">✓ Droit à l'effacement (Art. 17)</strong>
                <p style="margin: 2px 0 0;">Droit d'exiger la suppression intégrale des données.</p>
              </div>
              <div>
                <strong style="color: var(--ink);">✓ Droit d'opposition (Art. 21)</strong>
                <p style="margin: 2px 0 0;">Possibilité de refuser tout suivi statistique d'audience.</p>
              </div>
            </div>
          </div>
        </details>

      </div>
    </div>

    <!-- Modal de confirmation -->
    <div id="privacy-modal-container"></div>
  </div>
  `;
}

/**
 * Affiche le modal d'édition des informations personnelles et du profil sportif.
 */
export function showEditProfileModal() {
  const profile = state.clientProfile || {};
  const physique = profile.physique || {};

  const modal = document.createElement("div");
  modal.id = "edit-profile-modal";
  modal.style.cssText = `
    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.8); display: flex; align-items: center;
    justify-content: center; z-index: 130; padding: 16px; overflow-y: auto;
  `;

  modal.innerHTML = `
    <div style="
      background: var(--chalk); color: var(--ink);
      border-radius: 6px; padding: 28px; max-width: 560px;
      width: 100%; box-shadow: 0 20px 60px rgba(0,0,0,0.4);
      max-height: 90vh; overflow-y: auto; border: 1px solid var(--line);
    ">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid var(--line); padding-bottom: 14px;">
        <h2 style="margin: 0; font-size: 20px; font-family: var(--font-display, sans-serif); display: flex; align-items: center; gap: 10px;">
          ${icon("edit", 18, "var(--ember)")} Modifier mes informations personnelles
        </h2>
        <button id="close-edit-modal" style="background: none; border: none; font-size: 24px; cursor: pointer; color: var(--slate); font-weight: bold;">&times;</button>
      </div>

      <form id="edit-profile-form" style="display: grid; gap: 16px;">
        <!-- Identité & Coordonnées -->
        <h3 style="font-size: 13px; font-weight: 700; margin: 0; color: var(--ember); text-transform: uppercase; letter-spacing: 0.05em;">1. Coordonnées personnelles</h3>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div>
            <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 4px; color: var(--ink);">Prénom</label>
            <input type="text" name="firstName" value="${escapeHtml(profile.firstName || "")}" class="form-input" style="width: 100%; padding: 10px; border: 1px solid var(--line); border-radius: 4px; background: var(--surface);" placeholder="Votre prénom" required />
          </div>
          <div>
            <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 4px; color: var(--ink);">Nom</label>
            <input type="text" name="lastName" value="${escapeHtml(profile.lastName || "")}" class="form-input" style="width: 100%; padding: 10px; border: 1px solid var(--line); border-radius: 4px; background: var(--surface);" placeholder="Votre nom" />
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div>
            <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 4px; color: var(--ink);">Email</label>
            <input type="email" name="email" value="${escapeHtml(profile.email || state.drafts?.signup?.email || "")}" class="form-input" style="width: 100%; padding: 10px; border: 1px solid var(--line); border-radius: 4px; background: var(--surface);" placeholder="nom@exemple.com" />
          </div>
          <div>
            <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 4px; color: var(--ink);">Téléphone</label>
            <input type="tel" name="phone" value="${escapeHtml(profile.phone || "")}" class="form-input" style="width: 100%; padding: 10px; border: 1px solid var(--line); border-radius: 4px; background: var(--surface);" placeholder="+229..." />
          </div>
        </div>

        <!-- Profil sportif -->
        <hr style="border: none; border-top: 1px solid var(--line); margin: 6px 0;" />
        <h3 style="font-size: 13px; font-weight: 700; margin: 0; color: var(--moss); text-transform: uppercase; letter-spacing: 0.05em;">2. Profil sportif & Santé</h3>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div>
            <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 4px; color: var(--ink);">Objectif principal</label>
            <select name="goal" class="form-input" style="width: 100%; padding: 10px; border: 1px solid var(--line); border-radius: 4px; background: var(--surface);">
              <option value="remise" ${profile.goal === "remise" ? "selected" : ""}>Remise en forme</option>
              <option value="perte-poids" ${profile.goal === "perte-poids" ? "selected" : ""}>Perte de poids</option>
              <option value="musculation" ${profile.goal === "musculation" ? "selected" : ""}>Musculation / Prise de masse</option>
              <option value="endurance" ${profile.goal === "endurance" ? "selected" : ""}>Endurance</option>
              <option value="sante" ${profile.goal === "sante" ? "selected" : ""}>Santé générale</option>
              <option value="endurance-sante" ${profile.goal === "endurance-sante" ? "selected" : ""}>Endurance & Santé</option>
            </select>
          </div>
          <div>
            <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 4px; color: var(--ink);">Format / Lieu</label>
            <select name="track" class="form-input" style="width: 100%; padding: 10px; border: 1px solid var(--line); border-radius: 4px; background: var(--surface);">
              <option value="gym" ${profile.track === "gym" || profile.track === "salle" ? "selected" : ""}>Salle de gym</option>
              <option value="home-equip" ${profile.track === "home-equip" || profile.track === "maison-mat" ? "selected" : ""}>Maison avec matériel</option>
              <option value="bodyweight" ${profile.track === "bodyweight" || profile.track === "poids-corps" ? "selected" : ""}>Maison poids du corps</option>
            </select>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div>
            <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 4px; color: var(--ink);">Niveau</label>
            <select name="niveau" class="form-input" style="width: 100%; padding: 10px; border: 1px solid var(--line); border-radius: 4px; background: var(--surface);">
              <option value="debutant" ${profile.niveau === "debutant" ? "selected" : ""}>Débutant</option>
              <option value="intermediaire" ${profile.niveau === "intermediaire" ? "selected" : ""}>Intermédiaire</option>
              <option value="avance" ${profile.niveau === "avance" ? "selected" : ""}>Avancé</option>
            </select>
          </div>
          <div>
            <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 4px; color: var(--ink);">Fréquence hebdo</label>
            <select name="frequence" class="form-input" style="width: 100%; padding: 10px; border: 1px solid var(--line); border-radius: 4px; background: var(--surface);">
              <option value="2" ${profile.frequence == "2" ? "selected" : ""}>2 séances / semaine</option>
              <option value="3" ${profile.frequence == "3" ? "selected" : ""}>3 séances / semaine</option>
              <option value="4" ${profile.frequence == "4" ? "selected" : ""}>4 séances / semaine</option>
              <option value="5" ${profile.frequence == "5" ? "selected" : ""}>5 séances / semaine</option>
            </select>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px;">
          <div>
            <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 4px; color: var(--ink);">Poids (kg)</label>
            <input type="number" step="0.1" name="poids" value="${physique.poids || profile.weight || ""}" class="form-input" style="width: 100%; padding: 10px; border: 1px solid var(--line); border-radius: 4px; background: var(--surface);" placeholder="Ex: 75" />
          </div>
          <div>
            <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 4px; color: var(--ink);">Taille (cm)</label>
            <input type="number" name="taille" value="${physique.taille || profile.height || ""}" class="form-input" style="width: 100%; padding: 10px; border: 1px solid var(--line); border-radius: 4px; background: var(--surface);" placeholder="Ex: 175" />
          </div>
          <div>
            <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 4px; color: var(--ink);">Âge</label>
            <input type="number" name="age" value="${physique.age || profile.age || ""}" class="form-input" style="width: 100%; padding: 10px; border: 1px solid var(--line); border-radius: 4px; background: var(--surface);" placeholder="Ex: 28" />
          </div>
        </div>

        <div>
          <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 4px; color: var(--ink);">Contraintes physiques / Remarques médicales</label>
          <textarea name="medicalNotes" rows="2" class="form-input" style="width: 100%; padding: 10px; border: 1px solid var(--line); border-radius: 4px; background: var(--surface);" placeholder="Douleurs, blessures, contre-indications...">${escapeHtml(physique.remarques || profile.medicalNotes || "")}</textarea>
        </div>

        <div style="display: flex; gap: 12px; margin-top: 16px;">
          <button type="button" id="cancel-edit-modal" class="btn btn-outline-dark" style="flex: 1; justify-content: center;">Annuler</button>
          <button type="submit" class="btn btn-ember" style="flex: 1; justify-content: center; font-weight: 600;">Enregistrer les modifications</button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(modal);

  const close = () => modal.remove();
  modal.querySelector("#close-edit-modal").addEventListener("click", close);
  modal.querySelector("#cancel-edit-modal").addEventListener("click", close);

  modal.querySelector("#edit-profile-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = e.target;
    const { updateUserProfile } = await import("../modules/privacy.js");
    
    await updateUserProfile({
      firstName: form.firstName.value.trim(),
      lastName: form.lastName.value.trim(),
      email: form.email.value.trim(),
      phone: form.phone.value.trim(),
      goal: form.goal.value,
      track: form.track.value,
      niveau: form.niveau.value,
      frequence: form.frequence.value,
      poids: form.poids.value ? parseFloat(form.poids.value) : null,
      taille: form.taille.value ? parseFloat(form.taille.value) : null,
      age: form.age.value ? parseInt(form.age.value, 10) : null,
      medicalNotes: form.medicalNotes.value.trim(),
    });

    modal.remove();
    const { render } = await import("../../app.js");
    render();
  });
}
