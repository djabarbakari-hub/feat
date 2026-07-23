/* ==========================================================
   pages/privacy.js — Page de gestion des données personnelles.
   Affiche les données, consentements, et contrôles de suppression.
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
  const hasQuiz = Object.keys(state.quizAnswers || {}).length > 0;
  const hasDrafts =
    !!(state.drafts?.contact?.name || state.drafts?.contact?.message || state.drafts?.signup?.firstName);
  const hasHistory = (state.history || []).length > 0;
  const progressCount = (state.progressLogs || []).length;
  const activeProgramName = profile.program?.title || state.clientProgram?.title || null;

  const isGoogleAuth = auth.currentUser?.providerData?.some((p) => p.providerId === "google.com");
  const pendingDeletion = profile.pendingDeletion || null;

  const googleAnalyticsStatus = hasGA
    ? `<span style="
        display: inline-flex; align-items: center; gap: 4px;
        padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600;
        background: ${consent.googleAnalytics ? "rgba(60,150,80,0.2)" : "rgba(200,60,60,0.2)"};
        color: ${consent.googleAnalytics ? "var(--moss)" : "var(--ember)"};
      ">${consent.googleAnalytics ? "✓ Accepté & Actif" : "✗ Refusé par l'utilisateur"}</span>`
    : `<span style="padding: 4px 10px; border-radius: 20px; font-size: 12px; background: rgba(128,128,128,0.15); color: var(--slate); border: 1px solid var(--line);">⚪ Non configuré / Non détecté</span>`;

  const microsoftClarityStatus = hasClarity
    ? `<span style="
        display: inline-flex; align-items: center; gap: 4px;
        padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600;
        background: ${consent.microsoftClarity ? "rgba(60,150,80,0.2)" : "rgba(200,60,60,0.2)"};
        color: ${consent.microsoftClarity ? "var(--moss)" : "var(--ember)"};
      ">${consent.microsoftClarity ? "✓ Accepté & Actif" : "✗ Refusé par l'utilisateur"}</span>`
    : `<span style="padding: 4px 10px; border-radius: 20px; font-size: 12px; background: rgba(128,128,128,0.15); color: var(--slate); border: 1px solid var(--line);">⚪ Non configuré / Non détecté</span>`;

  if (state.role === "admin") {
    return `
    <div style="min-height: 80vh;">
      <div class="section wrap">
        <div style="margin-bottom: 32px;">
          <p class="eyebrow-moss font-mono" style="margin-bottom: 6px;">CONFIDENTIALITÉ & TRANSPARENCE</p>
          <h1 class="font-display" style="margin-bottom: 8px;">Mes données de Coach</h1>
          <p style="color: var(--slate); max-width: 680px; line-height: 1.6; font-size: 15px;">
            Consultez vos données de compte administrateur, gérez vos identifiants de sécurité et accédez au journal d'audit de sécurité de la plateforme.
          </p>
        </div>

        <!-- BANDEAU: Statut de session & Dernière activité -->
        <div style="
          display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 16px;
          padding: 18px 22px; border-radius: 6px;
          background: var(--surface, rgba(255,255,255,0.04));
          border: 1px solid var(--line);
          margin-bottom: 32px;
        ">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="width: 40px; height: 40px; border-radius: 50%; background: rgba(224, 70, 50, 0.15); display: flex; align-items: center; justify-content: center; color: var(--ember);">
              ${icon("shield", 22)}
            </div>
            <div>
              <div style="font-size: 12px; color: var(--slate); text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;">Espace sécurisé Administrateur</div>
              <div style="font-size: 15px; font-weight: 600; margin-top: 2px; color: var(--text-primary);">
                Rôle: <strong style="color: var(--ember);">Coach / Administrateur</strong> — Statut: <span style="color: var(--moss);">Connecté / Session active</span>
              </div>
            </div>
          </div>

          <div style="font-size: 13px; color: var(--slate); display: flex; align-items: center; gap: 6px;">
            ${icon("clock", 14)} Dernière visite : 
            <strong style="color: var(--text-primary);">
              ${
                state.lastVisitedAt
                  ? new Date(state.lastVisitedAt).toLocaleString("fr-FR", {
                      weekday: "short",
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "Aujourd'hui"
              }
            </strong>
          </div>
        </div>

        <div style="display: grid; gap: 24px;">

          <!-- CARD 1: Identité & Coordonnées -->
          <div class="card" style="padding: 24px; border: 1px solid var(--line);">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 16px; margin-bottom: 20px;">
              <div>
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                  ${icon("user", 18, "var(--ember)")}
                  <h2 class="h3 font-display" style="margin: 0;">Coordonnées de l'Administrateur</h2>
                </div>
                <p style="color: var(--slate); font-size: 14px; margin: 0;">Vos informations d'identification de coach.</p>
              </div>
              <button class="btn btn-outline-dark" id="btn-open-edit-profile" style="display: inline-flex; align-items: center; gap: 8px; font-size: 13px;">
                ${icon("edit", 14)} Modifier mes informations
              </button>
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; background: rgba(0,0,0,0.02); padding: 16px; border-radius: 4px; border: 1px solid var(--line2, var(--line));">
              <div>
                <div style="font-size: 12px; color: var(--slate); font-weight: 600;">Prénom</div>
                <div style="font-size: 15px; font-weight: 600; margin-top: 4px; color: var(--text-primary);">${escapeHtml(profile.firstName || "Abdou")}</div>
              </div>
              <div>
                <div style="font-size: 12px; color: var(--slate); font-weight: 600;">Nom</div>
                <div style="font-size: 15px; font-weight: 600; margin-top: 4px; color: var(--text-primary);">${escapeHtml(profile.lastName || "BAKARI")}</div>
              </div>
              <div>
                <div style="font-size: 12px; color: var(--slate); font-weight: 600;">Adresse email</div>
                <div style="font-size: 15px; font-weight: 600; margin-top: 4px; color: var(--text-primary);">${escapeHtml(profile.email || "djabarbakari.032003@gmail.com")}</div>
              </div>
              <div>
                <div style="font-size: 12px; color: var(--slate); font-weight: 600;">Téléphone</div>
                <div style="font-size: 15px; font-weight: 600; margin-top: 4px; color: var(--text-primary);">${escapeHtml(profile.phone || "Non renseigné")}</div>
              </div>
            </div>
          </div>

          <!-- CARD 2: Mot de passe & Sécurité -->
          <div class="card" style="padding: 24px; border: 1px solid var(--line);">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 16px; margin-bottom: 16px;">
              <div>
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                  ${icon("lock", 18, "var(--ember)")}
                  <h2 class="h3 font-display" style="margin: 0;">Mot de passe & Sécurité de connexion</h2>
                </div>
                <p style="color: var(--slate); font-size: 14px; margin: 0;">Gestion de vos identifiants, mot de passe et méthode d'authentification.</p>
              </div>
            </div>

            <div style="background: rgba(0,0,0,0.02); padding: 18px; border-radius: 6px; border: 1px solid var(--line); display: grid; gap: 16px;">
              ${
                isGoogleAuth
                  ? `
                <div style="display: flex; align-items: center; gap: 12px; background: #ffffff; padding: 12px 16px; border-radius: 6px; border: 1px solid var(--line);">
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <div>
                    <strong style="font-size: 14px; color: var(--ink);">Connexion sécurisée via Google Authentification</strong>
                    <p style="font-size: 12px; color: var(--slate); margin: 2px 0 0;">Votre compte est associé directement à votre identité Google. Aucun mot de passe brut n'est hébergé par notre application.</p>
                  </div>
                </div>
                <div>
                  <p style="font-size: 13px; color: var(--slate); margin-bottom: 10px;">
                    Si vous souhaitez également pouvoir vous connecter directement par e-mail et mot de passe :
                  </p>
                  <button class="btn btn-outline-dark" id="btn-request-password-reset" style="display: inline-flex; align-items: center; gap: 8px;">
                    ${icon("mail", 14)} Envoyer un lien par e-mail pour définir un mot de passe
                  </button>
                </div>
              `
                  : `
                <div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 12px; background: #ffffff; padding: 14px 16px; border-radius: 6px; border: 1px solid var(--line);">
                  <div>
                    <div style="font-size: 12px; color: var(--slate); font-weight: 600;">Mot de passe de compte</div>
                    <div style="font-size: 15px; font-weight: 600; color: var(--ink); margin-top: 2px; display: flex; align-items: center; gap: 8px;">
                      ••••••••••••• <span style="font-size: 12px; font-weight: 600; color: var(--moss); background: rgba(60,150,80,0.1); padding: 2px 8px; border-radius: 12px;">✓ Protégé & Chiffré</span>
                    </div>
                    <p style="font-size: 12px; color: var(--slate); margin: 4px 0 0;">
                      Par sécurité, les mots de passe sont hachés de manière unidirectionnelle et ne peuvent pas être affichés en clair.
                    </p>
                  </div>
                  <button class="btn btn-outline-dark" id="btn-toggle-password-view-info" style="font-size: 12px; padding: 6px 12px;">
                    ${icon("eye", 13)} Pourquoi n'est-il pas lisible ?
                  </button>
                </div>

                <div id="password-security-info" style="display: none; padding: 14px; background: rgba(60,150,80,0.08); border-left: 3px solid var(--moss); border-radius: 4px; font-size: 13px; color: var(--ink); line-height: 1.5;">
                  <strong>Normes de protection des données (RGPD & Cybersécurité) :</strong><br/>
                  Afin d'empêcher tout risque de fuite de données, les mots de passe sont salés et hachés de façon irréversible. Personne (ni le coach, ni l'administrateur, ni les serveurs) n'a accès à votre mot de passe en texte clair. Pour le modifier, vous disposez des deux options sécurisées ci-dessous.
                </div>

                <div style="display: flex; flex-wrap: wrap; gap: 10px; margin-top: 6px;">
                  <button class="btn btn-ember" id="btn-request-password-reset" style="display: inline-flex; align-items: center; gap: 8px;">
                    ${icon("mail", 14)} Réinitialiser par e-mail (Lien de vérification)
                  </button>
                  <button class="btn btn-outline-dark" id="btn-open-change-password-modal" style="display: inline-flex; align-items: center; gap: 8px;">
                    ${icon("key", 14)} Modifier directement dans l'application
                  </button>
                </div>
              `
              }
            </div>
          </div>

          <!-- CARD 3: Privilèges d'administration -->
          <div class="card" style="padding: 24px; border: 1px solid var(--line);">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
              ${icon("shield", 18, "var(--moss)")}
              <h2 class="h3 font-display" style="margin: 0;">Privilèges d'administration</h2>
            </div>
            <p style="color: var(--slate); font-size: 14px; margin-bottom: 16px; line-height: 1.5;">
              En tant qu'administrateur de la plateforme, vous disposez des habilitations suivantes pour accompagner les clients :
            </p>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; font-size: 13px; line-height: 1.5;">
              <div style="background: rgba(0,0,0,0.02); padding: 12px; border-radius: 4px; border: 1px solid var(--line);">
                <strong style="color: var(--ink);">✓ Gestion des comptes clients</strong>
                <p style="color: var(--slate); font-size: 12px; margin-top: 2px;">Visualisation des fiches d'onboarding, assignation et modification des programmes d'entraînement sur-mesure.</p>
              </div>
              <div style="background: rgba(0,0,0,0.02); padding: 12px; border-radius: 4px; border: 1px solid var(--line);">
                <strong style="color: var(--ink);">✓ Gestion de la messagerie</strong>
                <p style="color: var(--slate); font-size: 12px; margin-top: 2px;">Consultation et traitement des demandes d'assistance et de contact formulées par les visiteurs.</p>
              </div>
              <div style="background: rgba(0,0,0,0.02); padding: 12px; border-radius: 4px; border: 1px solid var(--line);">
                <strong style="color: var(--ink);">✓ Suivi analytique & Stats</strong>
                <p style="color: var(--slate); font-size: 12px; margin-top: 2px;">Indicateurs globaux de fréquentation des clients, séances validées et inscriptions hebdomadaires.</p>
              </div>
            </div>
          </div>

          <!-- CARD 4: Journaux d'audit de sécurité -->
          <div class="card" style="padding: 24px; border: 1px solid var(--line);">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
              ${icon("database", 18, "var(--text-primary)")}
              <h2 class="h3 font-display" style="margin: 0;">Journaux de sécurité et suppression (Audit Trail)</h2>
            </div>
            <p style="color: var(--slate); font-size: 14px; margin-bottom: 16px;">
              Historique d'audit des suppressions de données — conservé de manière inaltérable à des fins de conformité et de sécurité.
            </p>
            ${
              deletionLogs.length > 0
                ? `
              <div style="border: 1px solid var(--line); border-radius: 4px; overflow-x: auto; background: var(--surface);">
                <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                  <thead>
                    <tr style="background: var(--ink); color: var(--chalk);">
                      <th style="padding: 10px; text-align: left; border-right: 1px solid var(--line2);">Date</th>
                      <th style="padding: 10px; text-align: left; border-right: 1px solid var(--line2);">Action de suppression / purge</th>
                      <th style="padding: 10px; text-align: left;">Rôle</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${deletionLogs
                      .slice()
                      .reverse()
                      .slice(0, 10)
                      .map(
                        (log) => `
                      <tr style="border-bottom: 1px solid var(--line);">
                        <td style="padding: 10px; border-right: 1px solid var(--line2); white-space: nowrap;">${new Date(log.timestamp).toLocaleString("fr-FR")}</td>
                        <td style="padding: 10px; border-right: 1px solid var(--line2); color: var(--ember); font-weight: 600;">${escapeHtml(log.action)}</td>
                        <td style="padding: 10px; font-weight: 600;">${escapeHtml(log.userRole)}</td>
                      </tr>
                    `
                      )
                      .join("")}
                  </tbody>
                </table>
              </div>
            `
                : `<p style="color: var(--slate); font-size: 13px; font-style: italic;">Aucune action de suppression enregistrée dans ce navigateur.</p>`
            }
          </div>

          <!-- CARD 5: Portabilité des données - Coach -->
          <div class="card" style="padding: 24px; border: 1px solid var(--line); background: var(--surface);">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 16px;">
              <div style="max-width: 580px;">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                  ${icon("download", 18, "var(--moss)")}
                  <h2 class="h3 font-display" style="margin: 0;">Portabilité de la configuration de Coach (RGPD)</h2>
                </div>
                <p style="color: var(--slate); font-size: 14px; margin: 0; line-height: 1.5;">
                  Téléchargez un fichier JSON contenant vos paramètres de compte et vos traces de session.
                </p>
              </div>
              <button class="btn btn-ember" data-privacy-export="data" style="display: inline-flex; align-items: center; gap: 8px; font-weight: 600; padding: 12px 20px;">
                ${icon("download", 16)} Télécharger mes données (JSON)
              </button>
            </div>
          </div>

          <!-- CARD 6: Consentement & Mesure d'audience -->
          <div class="card" style="padding: 24px; border: 1px solid var(--line);">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px; margin-bottom: 8px;">
              <div>
                <h2 class="h3 font-display" style="margin: 0 0 4px 0;">Consentement & Outils Analytics de la Plateforme</h2>
                <p style="color: var(--slate); font-size: 14px; margin: 0;">
                  Gestion de l'utilisation des outils de statistiques d'audience en tant que visiteur ou administrateur.
                </p>
              </div>
            </div>

            <div style="display: grid; gap: 16px; margin-top: 16px;">
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; background: rgba(255,255,255,0.03); border-radius: 4px; border: 1px solid var(--line);">
                <div>
                  <strong style="font-size: 14px;">Google Analytics (GA4)</strong>
                  <p style="font-size: 12px; color: var(--slate); margin-top: 2px;">
                    ${hasGA ? "Script détecté — Mesure d'audience anonyme et fréquentation des pages." : "Non configuré actuellement."}
                  </p>
                </div>
                ${googleAnalyticsStatus}
              </div>

              <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; background: rgba(255,255,255,0.03); border-radius: 4px; border: 1px solid var(--line);">
                <div>
                  <strong style="font-size: 14px;">Microsoft Clarity</strong>
                  <p style="font-size: 12px; color: var(--slate); margin-top: 2px;">
                    ${hasClarity ? "Script détecté — Analyse d'ergonomie et cartes de chaleur." : "Non configuré actuellement."}
                  </p>
                </div>
                ${microsoftClarityStatus}
              </div>

              <div style="display: flex; flex-wrap: wrap; gap: 10px; margin-top: 4px;">
                <button class="btn btn-outline-dark" data-privacy-consent="accept" style="flex: 1; min-width: 140px; justify-content: center;">
                  ${icon("check", 14)} Accepter tout
                </button>
                <button class="btn btn-outline-dark" data-privacy-consent="customize" style="flex: 1; min-width: 140px; justify-content: center;">
                  ${icon("sliders", 14)} Personnaliser
                </button>
                <button class="btn" data-privacy-consent="refuse" style="
                  flex: 1; min-width: 140px; justify-content: center;
                  background: transparent; color: var(--ember);
                  border: 1.5px solid var(--ember); font-weight: 600;
                ">
                  ${icon("x-circle", 14)} Retirer mon consentement
                </button>
              </div>
            </div>
          </div>

          <!-- CARD 7: Zone de sécurité admin -->
          <div class="card" style="padding: 24px; border: 2px solid var(--ember-soft); background: rgba(224, 70, 50, 0.02);">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
              ${icon("alert-triangle", 20, "var(--ember)")}
              <h2 class="h3 font-display" style="color: var(--ember); margin: 0;">Sécurité du compte administrateur</h2>
            </div>
            <p style="color: var(--slate); font-size: 14px; margin-bottom: 12px;">
              Les comptes détenant des droits d'administration de la plateforme sont protégés contre la suppression accidentelle.
            </p>

            <div style="background: rgba(224, 70, 50, 0.08); border: 1px solid var(--ember); padding: 14px 16px; border-radius: 6px; color: var(--ember); font-size: 13px; line-height: 1.4; display: flex; align-items: flex-start; gap: 10px; max-width: 580px;">
              ${icon("shield-off", 18, "var(--ember)")}
              <div>
                <strong style="display: block; margin-bottom: 2px;">Suppression bloquée par sécurité</strong>
                <span style="color: var(--ink);">
                  Conformément à la politique de sécurité, vous ne pouvez pas supprimer ce compte directement. Pour toute désactivation ou transfert de droits d'administration de la plateforme, veuillez contacter l'administrateur principal (djabarbakari.032003@gmail.com).
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
    `;
  }

  const adminLogsSection = "";

  return `
  <div style="min-height: 80vh;">
    <div class="section wrap">
      <div style="margin-bottom: 32px;">
        <p class="eyebrow-moss font-mono" style="margin-bottom: 6px;">CONFIDENTIALITÉ & TRANSPARENCE</p>
        <h1 class="font-display" style="margin-bottom: 8px;">Mes données personnelles</h1>
        <p style="color: var(--slate); max-width: 680px; line-height: 1.6; font-size: 15px;">
          Consultez l'ensemble de vos données enregistrées, modifiez vos coordonnées ou votre profil sportif, gérez vos identifiants de sécurité ou supprimez vos données conformément au RGPD.
        </p>
      </div>

      ${
        pendingDeletion
          ? `
        <div style="
          background: rgba(224, 70, 50, 0.08); border: 2px solid var(--ember); border-radius: 8px;
          padding: 18px 22px; margin-bottom: 28px; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 16px;
        ">
          <div>
            <div style="font-size: 15px; font-weight: 700; color: var(--ember); display: flex; align-items: center; gap: 8px;">
              ${icon("alert-triangle", 18)} DEMANDE DE SUPPRESSION DE COMPTE EN COURS
            </div>
            <p style="font-size: 13px; color: var(--ink); margin: 6px 0 0; line-height: 1.4;">
              Votre compte est actuellement en délai de grâce. Il sera définitivement supprimé le 
              <strong>${new Date(pendingDeletion.executeAt).toLocaleDateString("fr-FR", { weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}</strong>.
            </p>
          </div>
          <button class="btn btn-ember" id="btn-cancel-account-deletion" style="white-space: nowrap; gap: 8px;">
            ${icon("rotate-ccw", 14)} Annuler la suppression et restaurer mon compte
          </button>
        </div>
      `
          : ""
      }

      <!-- BANDEAU: Statut de session & Dernière activité -->
      <div style="
        display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 16px;
        padding: 18px 22px; border-radius: 6px;
        background: var(--surface, rgba(255,255,255,0.04));
        border: 1px solid var(--line);
        margin-bottom: 32px;
      ">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 40px; height: 40px; border-radius: 50%; background: rgba(60,150,80,0.15); display: flex; align-items: center; justify-content: center; color: var(--moss);">
            ${icon("shield-check", 22)}
          </div>
          <div>
            <div style="font-size: 12px; color: var(--slate); text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;">Espace sécurisé client</div>
            <div style="font-size: 15px; font-weight: 600; margin-top: 2px; color: var(--text-primary);">
              Rôle: <strong style="color: var(--ember);">${escapeHtml(state.role || "Client")}</strong> — Statut: <span style="color: var(--moss);">Connecté / Actif</span>
            </div>
          </div>
        </div>

        <div style="font-size: 13px; color: var(--slate); display: flex; align-items: center; gap: 6px;">
          ${icon("clock", 14)} Dernière visite : 
          <strong style="color: var(--text-primary);">
            ${
              state.lastVisitedAt
                ? new Date(state.lastVisitedAt).toLocaleString("fr-FR", {
                    weekday: "short",
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "Aujourd'hui"
            }
          </strong>
        </div>
      </div>

      <div style="display: grid; gap: 24px;">

        <!-- CARD 1: Identité & Coordonnées -->
        <div class="card" style="padding: 24px; border: 1px solid var(--line);">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 16px; margin-bottom: 20px;">
            <div>
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                ${icon("user", 18, "var(--ember)")}
                <h2 class="h3 font-display" style="margin: 0;">Coordonnées & Identité</h2>
              </div>
              <p style="color: var(--slate); font-size: 14px; margin: 0;">Vos informations personnelles d'identification.</p>
            </div>
            <button class="btn btn-outline-dark" id="btn-open-edit-profile" style="display: inline-flex; align-items: center; gap: 8px; font-size: 13px;">
              ${icon("edit", 14)} Modifier mes informations
            </button>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; background: rgba(0,0,0,0.02); padding: 16px; border-radius: 4px; border: 1px solid var(--line2, var(--line));">
            <div>
              <div style="font-size: 12px; color: var(--slate); font-weight: 600;">Prénom</div>
              <div style="font-size: 15px; font-weight: 600; margin-top: 4px; color: var(--text-primary);">${escapeHtml(profile.firstName || "Non renseigné")}</div>
            </div>
            <div>
              <div style="font-size: 12px; color: var(--slate); font-weight: 600;">Nom</div>
              <div style="font-size: 15px; font-weight: 600; margin-top: 4px; color: var(--text-primary);">${escapeHtml(profile.lastName || "Non renseigné")}</div>
            </div>
            <div>
              <div style="font-size: 12px; color: var(--slate); font-weight: 600;">Adresse email</div>
              <div style="font-size: 15px; font-weight: 600; margin-top: 4px; color: var(--text-primary);">${escapeHtml(profile.email || state.drafts?.signup?.email || "Non renseignée")}</div>
            </div>
            <div>
              <div style="font-size: 12px; color: var(--slate); font-weight: 600;">Téléphone</div>
              <div style="font-size: 15px; font-weight: 600; margin-top: 4px; color: var(--text-primary);">${escapeHtml(profile.phone || "Non renseigné")}</div>
            </div>
          </div>
        </div>

        <!-- CARD 1.5: Mot de passe & Sécurité -->
        <div class="card" style="padding: 24px; border: 1px solid var(--line);">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 16px; margin-bottom: 16px;">
            <div>
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                ${icon("lock", 18, "var(--ember)")}
                <h2 class="h3 font-display" style="margin: 0;">Mot de passe & Sécurité de connexion</h2>
              </div>
              <p style="color: var(--slate); font-size: 14px; margin: 0;">Gestion de vos identifiants, mot de passe et méthode d'authentification.</p>
            </div>
          </div>

          <div style="background: rgba(0,0,0,0.02); padding: 18px; border-radius: 6px; border: 1px solid var(--line); display: grid; gap: 16px;">
            ${
              isGoogleAuth
                ? `
              <div style="display: flex; align-items: center; gap: 12px; background: #ffffff; padding: 12px 16px; border-radius: 6px; border: 1px solid var(--line);">
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <div>
                  <strong style="font-size: 14px; color: var(--ink);">Connexion sécurisée via Google Authentification</strong>
                  <p style="font-size: 12px; color: var(--slate); margin: 2px 0 0;">Votre compte est associé directement à votre identité Google. Aucun mot de passe brut n'est hébergé par notre application.</p>
                </div>
              </div>
              <div>
                <p style="font-size: 13px; color: var(--slate); margin-bottom: 10px;">
                  Si vous souhaitez également pouvoir vous connecter directement par e-mail et mot de passe :
                </p>
                <button class="btn btn-outline-dark" id="btn-request-password-reset" style="display: inline-flex; align-items: center; gap: 8px;">
                  ${icon("mail", 14)} Envoyer un lien par e-mail pour définir un mot de passe
                </button>
              </div>
            `
                : `
              <div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 12px; background: #ffffff; padding: 14px 16px; border-radius: 6px; border: 1px solid var(--line);">
                <div>
                  <div style="font-size: 12px; color: var(--slate); font-weight: 600;">Mot de passe de compte</div>
                  <div style="font-size: 15px; font-weight: 600; color: var(--ink); margin-top: 2px; display: flex; align-items: center; gap: 8px;">
                    ••••••••••••• <span style="font-size: 12px; font-weight: 600; color: var(--moss); background: rgba(60,150,80,0.1); padding: 2px 8px; border-radius: 12px;">✓ Protégé & Chiffré</span>
                  </div>
                  <p style="font-size: 12px; color: var(--slate); margin: 4px 0 0;">
                    Par sécurité, les mots de passe sont hachés de manière unidirectionnelle et ne peuvent pas être affichés en clair.
                  </p>
                </div>
                <button class="btn btn-outline-dark" id="btn-toggle-password-view-info" style="font-size: 12px; padding: 6px 12px;">
                  ${icon("eye", 13)} Pourquoi n'est-il pas lisible ?
                </button>
              </div>

              <div id="password-security-info" style="display: none; padding: 14px; background: rgba(60,150,80,0.08); border-left: 3px solid var(--moss); border-radius: 4px; font-size: 13px; color: var(--ink); line-height: 1.5;">
                <strong>Normes de protection des données (RGPD & Cybersécurité) :</strong><br/>
                Afin d'empêcher tout risque de fuite de données, les mots de passe sont salés et hachés de façon irréversible. Personne (ni le coach, ni l'administrateur, ni les serveurs) n'a accès à votre mot de passe en texte clair. Pour le modifier, vous disposez des deux options sécurisées ci-dessous.
              </div>

              <div style="display: flex; flex-wrap: wrap; gap: 10px; margin-top: 6px;">
                <button class="btn btn-ember" id="btn-request-password-reset" style="display: inline-flex; align-items: center; gap: 8px;">
                  ${icon("mail", 14)} Réinitialiser par e-mail (Lien de vérification)
                </button>
                <button class="btn btn-outline-dark" id="btn-open-change-password-modal" style="display: inline-flex; align-items: center; gap: 8px;">
                  ${icon("key", 14)} Modifier directement dans l'application
                </button>
              </div>
            `
            }
          </div>
        </div>

        <!-- CARD 2: Profil Sportif & Paramètres Santé -->
        <div class="card" style="padding: 24px; border: 1px solid var(--line);">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 16px; margin-bottom: 20px;">
            <div>
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                ${icon("activity", 18, "var(--moss)")}
                <h2 class="h3 font-display" style="margin: 0;">Profil sportif & Santé</h2>
              </div>
              <p style="color: var(--slate); font-size: 14px; margin: 0;">Paramètres utilisés par le coach pour concevoir vos entraînements.</p>
            </div>
            <button class="btn btn-outline-dark" id="btn-open-edit-sports" style="display: inline-flex; align-items: center; gap: 8px; font-size: 13px;">
              ${icon("sliders", 14)} Ajuster mon profil sportif
            </button>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; background: rgba(0,0,0,0.02); padding: 16px; border-radius: 4px; border: 1px solid var(--line2, var(--line));">
            <div>
              <div style="font-size: 12px; color: var(--slate); font-weight: 600;">Objectif principal</div>
              <div style="font-size: 14px; font-weight: 600; margin-top: 4px; color: var(--ember);">${escapeHtml(goalLabels[profile.goal] || profile.goal || "Non défini")}</div>
            </div>
            <div>
              <div style="font-size: 12px; color: var(--slate); font-weight: 600;">Lieu / Format</div>
              <div style="font-size: 14px; font-weight: 600; margin-top: 4px; color: var(--text-primary);">${escapeHtml(trackLabels[profile.track] || profile.track || "Non défini")}</div>
            </div>
            <div>
              <div style="font-size: 12px; color: var(--slate); font-weight: 600;">Niveau d'expérience</div>
              <div style="font-size: 14px; font-weight: 600; margin-top: 4px; color: var(--text-primary);">${escapeHtml(levelLabels[profile.niveau] || profile.niveau || "Non défini")}</div>
            </div>
            <div>
              <div style="font-size: 12px; color: var(--slate); font-weight: 600;">Fréquence d'entraînement</div>
              <div style="font-size: 14px; font-weight: 600; margin-top: 4px; color: var(--text-primary);">${profile.frequence ? escapeHtml(profile.frequence) + " séances / semaine" : "Non définie"}</div>
            </div>
            <div>
              <div style="font-size: 12px; color: var(--slate); font-weight: 600;">Poids & Taille</div>
              <div style="font-size: 14px; font-weight: 600; margin-top: 4px; color: var(--text-primary);">
                ${physique.poids || profile.weight ? (physique.poids || profile.weight) + " kg" : "—"} / 
                ${physique.taille || profile.height ? (physique.taille || profile.height) + " cm" : "—"}
              </div>
            </div>
            <div>
              <div style="font-size: 12px; color: var(--slate); font-weight: 600;">Âge</div>
              <div style="font-size: 14px; font-weight: 600; margin-top: 4px; color: var(--text-primary);">${physique.age || profile.age ? (physique.age || profile.age) + " ans" : "—"}</div>
            </div>
            <div style="grid-column: 1 / -1;">
              <div style="font-size: 12px; color: var(--slate); font-weight: 600;">Contraintes physiques / Remarques médicales</div>
              <div style="font-size: 14px; margin-top: 4px; color: var(--text-primary); font-style: italic;">
                ${escapeHtml(physique.remarques || profile.medicalNotes || "Aucune contrainte enregistrée")}
              </div>
            </div>
          </div>
        </div>

        <!-- CARD 3: Données Techniques, Programme & Progression -->
        <div class="card" style="padding: 24px; border: 1px solid var(--line);">
          <div style="margin-bottom: 20px;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
              ${icon("database", 18, "var(--text-primary)")}
              <h2 class="h3 font-display" style="margin: 0;">Programme & Inventaire des données</h2>
            </div>
            <p style="color: var(--slate); font-size: 14px; margin: 0;">Vue synthétique de toutes les entités de données associées à votre compte.</p>
          </div>

          <div style="display: grid; gap: 10px;">

            <!-- Programme -->
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 14px; background: rgba(255,255,255,0.03); border-radius: 4px; border: 1px solid var(--line);">
              <div style="display: flex; align-items: center; gap: 10px;">
                ${icon("calendar", 16)}
                <div>
                  <span style="font-size: 14px; font-weight: 600;">Programme personnalisé</span>
                  <div style="font-size: 12px; color: var(--slate);">Plan d'entraînement actif</div>
                </div>
              </div>
              <span style="font-size: 13px; font-weight: 600; color: ${activeProgramName ? "var(--moss)" : "var(--slate)"};">
                ${activeProgramName ? `✓ ${escapeHtml(activeProgramName)}` : "Aucun programme attribué"}
              </span>
            </div>

            <!-- Quiz -->
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 14px; background: rgba(255,255,255,0.03); border-radius: 4px; border: 1px solid var(--line);">
              <div style="display: flex; align-items: center; gap: 10px;">
                ${icon("clipboard-list", 16)}
                <div>
                  <span style="font-size: 14px; font-weight: 600;">Questionnaire onboarding</span>
                  <div style="font-size: 12px; color: var(--slate);">Réponses enregistrées pour la personnalisation</div>
                </div>
              </div>
              <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 13px; font-weight: 600; color: ${hasQuiz ? "var(--moss)" : "var(--slate)"};">
                  ${hasQuiz ? `✓ ${Object.keys(state.quizAnswers).length} réponse(s)` : "Non renseigné"}
                </span>
                <button class="btn btn-outline-dark" data-nav="quiz" style="padding: 4px 10px; font-size: 12px;">Repasser</button>
              </div>
            </div>

            <!-- Progression & séances -->
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 14px; background: rgba(255,255,255,0.03); border-radius: 4px; border: 1px solid var(--line);">
              <div style="display: flex; align-items: center; gap: 10px;">
                ${icon("check-circle", 16)}
                <div>
                  <span style="font-size: 14px; font-weight: 600;">Journal de progression</span>
                  <div style="font-size: 12px; color: var(--slate);">Historique des séances et performances</div>
                </div>
              </div>
              <span style="font-size: 13px; font-weight: 600; color: ${progressCount > 0 ? "var(--moss)" : "var(--slate)"};">
                ${progressCount > 0 ? `${progressCount} entrée(s) de progression` : "0 séance validée"}
              </span>
            </div>

            <!-- Brouillons -->
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 14px; background: rgba(255,255,255,0.03); border-radius: 4px; border: 1px solid var(--line);">
              <div style="display: flex; align-items: center; gap: 10px;">
                ${icon("file-text", 16)}
                <div>
                  <span style="font-size: 14px; font-weight: 600;">Brouillons de formulaire</span>
                  <div style="font-size: 12px; color: var(--slate);">Données temporaires de contact ou d'inscription</div>
                </div>
              </div>
              <span style="font-size: 13px; font-weight: 600; color: ${hasDrafts ? "var(--ember)" : "var(--slate)"};">
                ${hasDrafts ? "⚠ Brouillons en mémoire" : "Aucun brouillon"}
              </span>
            </div>

          </div>
        </div>

        <!-- CARD 4: Exportation & Portabilité des Données -->
        <div class="card" style="padding: 24px; border: 1px solid var(--line); background: var(--surface);">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 16px;">
            <div style="max-width: 580px;">
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                ${icon("download", 18, "var(--moss)")}
                <h2 class="h3 font-display" style="margin: 0;">Portabilité des données (Droit d'accès RGPD)</h2>
              </div>
              <p style="color: var(--slate); font-size: 14px; margin: 0; line-height: 1.5;">
                Téléchargez un fichier JSON contenant l'intégralité de vos informations (profil, questionnaire, programme attribué, journal de progression et préférences).
              </p>
            </div>
            <button class="btn btn-ember" data-privacy-export="data" style="display: inline-flex; align-items: center; gap: 8px; font-weight: 600; padding: 12px 20px;">
              ${icon("download", 16)} Télécharger mes données (JSON)
            </button>
          </div>
        </div>

        <!-- CARD 5: Consentements Analytics & Suivi (Auto-détection) -->
        <div class="card" style="padding: 24px; border: 1px solid var(--line);">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px; margin-bottom: 8px;">
            <div>
              <h2 class="h3 font-display" style="margin: 0 0 4px 0;">Consentement & Mesure d'audience</h2>
              <p style="color: var(--slate); font-size: 14px; margin: 0;">
                Gestion de l'utilisation des outils de statistiques pour optimiser l'expérience utilisateur.
              </p>
            </div>
            <span style="font-size: 11px; padding: 4px 10px; border-radius: 20px; background: rgba(0,0,0,0.05); color: var(--slate); border: 1px solid var(--line); font-family: var(--font-mono, monospace);">
              ⚡ Script de détection dynamique actif
            </span>
          </div>

          <div style="display: grid; gap: 16px; margin-top: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; background: rgba(255,255,255,0.03); border-radius: 4px; border: 1px solid var(--line);">
              <div>
                <strong style="font-size: 14px;">Google Analytics (GA4)</strong>
                <p style="font-size: 12px; color: var(--slate); margin-top: 2px;">
                  ${hasGA ? "Script détecté — Mesure d'audience anonyme et fréquentation des pages." : "Non configuré actuellement. Le script d'écoute activé sur l'application le détectera dès son ajout."}
                </p>
              </div>
              ${googleAnalyticsStatus}
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; background: rgba(255,255,255,0.03); border-radius: 4px; border: 1px solid var(--line);">
              <div>
                <strong style="font-size: 14px;">Microsoft Clarity</strong>
                <p style="font-size: 12px; color: var(--slate); margin-top: 2px;">
                  ${hasClarity ? "Script détecté — Analyse d'ergonomie et cartes de chaleur d'interaction." : "Non configuré actuellement. Détection automatique du script Clarity en tâche de fond."}
                </p>
              </div>
              ${microsoftClarityStatus}
            </div>

            <div style="padding: 12px; background: rgba(0,0,0,0.02); border-radius: 4px; border: 1px solid var(--line); font-size: 12px; color: var(--slate); line-height: 1.4;">
              ℹ️ <strong>Note d'intégration :</strong> Aucun cookie tiers n'est déposé tant qu'aucun outil de mesure d'audience n'est actif. Dès qu'un des scripts (Google Analytics ou Microsoft Clarity) est implanté sur le site, vos préférences de consentement s'appliqueront immédiatement.
            </div>

            <div style="display: flex; flex-wrap: wrap; gap: 10px; margin-top: 4px;">
              <button class="btn btn-outline-dark" data-privacy-consent="accept" style="flex: 1; min-width: 140px; justify-content: center;">
                ${icon("check", 14)} Accepter tout
              </button>
              <button class="btn btn-outline-dark" data-privacy-consent="customize" style="flex: 1; min-width: 140px; justify-content: center;">
                ${icon("sliders", 14)} Personnaliser
              </button>
              <button class="btn" data-privacy-consent="refuse" style="
                flex: 1; min-width: 140px; justify-content: center;
                background: transparent; color: var(--ember);
                border: 1.5px solid var(--ember); font-weight: 600;
              ">
                ${icon("x-circle", 14)} Retirer mon consentement
              </button>
            </div>
            ${
              consent.lastUpdated
                ? `
              <p style="font-size: 11px; color: var(--slate); margin-top: 4px;">
                Dernière mise à jour des préférences : ${new Date(consent.lastUpdated).toLocaleString("fr-FR")}
              </p>
            `
                : ""
            }
          </div>
        </div>

        <!-- CARD 6: Effacement & Zone Dangereuse (Droit à l'oubli) -->
        <div class="card" style="padding: 24px; border: 2px solid var(--ember-soft); background: rgba(224, 70, 50, 0.02);">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
            ${icon("alert-triangle", 20, "var(--ember)")}
            <h2 class="h3 font-display" style="color: var(--ember); margin: 0;">Gestion et suppression des données</h2>
          </div>
          <p style="color: var(--slate); font-size: 14px; margin-bottom: 20px;">
            Toute action de suppression de données est strictement journalisée pour des motifs de conformité auditables.
          </p>

          <div style="display: grid; gap: 12px; max-width: 520px;">
            <!-- Effacer brouillons -->
            <button class="btn btn-outline-dark" data-privacy-delete="drafts" style="justify-content: flex-start; gap: 10px;">
              ${icon("trash-2", 15)} Effacer uniquement les brouillons de formulaires
            </button>

            <!-- Supprimer profil -->
            ${
              hasProfile
                ? `
              <button class="btn btn-outline-dark" data-privacy-delete="profile" style="justify-content: flex-start; gap: 10px; color: var(--ember); border-color: var(--ember-soft);">
                ${icon("user-x", 15)} Effacer les informations du profil sportif
              </button>
            `
                : ""
            }

            <!-- Supprimer compte (DESTRUCTIVE / DÉLAI ET IMMÉDIAT) -->
            <div style="border-top: 1px solid var(--ember-soft); padding-top: 16px; margin-top: 8px;">
              <p style="font-size: 12px; color: var(--ember); margin-bottom: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">
                ⚠ Zone sensible — suppression du compte
              </p>
              ${
                state.role === "admin"
                  ? `
                <div style="background: rgba(224, 70, 50, 0.08); border: 1px solid var(--ember); padding: 14px 16px; border-radius: 6px; color: var(--ember); font-size: 13px; line-height: 1.4; display: flex; align-items: flex-start; gap: 10px;">
                  ${icon("shield-off", 18, "var(--ember)")}
                  <div>
                    <strong style="display: block; margin-bottom: 2px;">Suppression impossible pour les administrateurs</strong>
                    <span style="color: var(--ink);">
                      Pour des raisons de sécurité de la plateforme, les comptes dotés du statut Administrateur ne peuvent pas être supprimés directement. Veuillez contacter l'administrateur principal (djabarbakari.032003@gmail.com) pour révoquer vos privilèges d'administration.
                    </span>
                  </div>
                </div>
              `
                  : `
                <button class="btn" style="background: var(--ember); color: white; justify-content: center; font-weight: 600; padding: 12px 18px; width: 100%; display: flex; align-items: center; gap: 8px;" data-privacy-delete="account">
                  ${icon("trash-2", 16)} Demander la suppression du compte
                </button>
              `
              }
            </div>
          </div>
        </div>

        <!-- CARD 7: Informations & Droits RGPD -->
        <div class="card" style="padding: 24px; background: rgba(255,255,255,0.02); border: 1px solid var(--line);">
          <h2 class="h3 font-display" style="margin-bottom: 12px;">Rappel de vos droits (RGPD & CNIL)</h2>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; font-size: 14px; line-height: 1.5;">
            <div>
              <strong>✓ Droit d'accès & portabilité</strong>
              <p style="color: var(--slate); font-size: 13px; margin-top: 2px;">Vous pouvez télécharger à tout moment l'ensemble de vos données structurées au format JSON.</p>
            </div>
            <div>
              <strong>✓ Droit de rectification</strong>
              <p style="color: var(--slate); font-size: 13px; margin-top: 2px;">Vous avez la possibilité de corriger directement vos nom, prénom, email, téléphone et paramètres sportifs.</p>
            </div>
            <div>
              <strong>✓ Droit à l'effacement (oubli)</strong>
              <p style="color: var(--slate); font-size: 13px; margin-top: 2px;">Chaque utilisateur peut demander la suppression intégrale de ses données personnelles de nos serveurs.</p>
            </div>
            <div>
              <strong>✓ Droit d'opposition</strong>
              <p style="color: var(--slate); font-size: 13px; margin-top: 2px;">Vous pouvez accepter ou refuser à tout moment le traitement statistique des données d'audience.</p>
            </div>
          </div>
        </div>

      </div>
    </div>

    ${adminLogsSection}

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
