/* ==========================================================
   pages/auth.js — Connexion et inscription.
   ========================================================== */

import { state } from "../state.js";
import { escapeHtml, icon } from "../helpers.js";

export function renderLogin() {
  const login = state.drafts.login;
  return `
  <div class="auth-page-container" style="background: var(--chalk);">
    <div class="auth-wrap">
      
      <div class="auth-grid">
        
        <!-- COLONNE GAUCHE: BRANDING & FIABILITÉ (Masquée sur Mobile) -->
        <div class="auth-branding-col">
          
          <div style="position: relative; z-index: 2;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px;">
              <span class="font-mono" style="font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; padding: 3px 8px; background: rgba(226, 98, 45, 0.2); color: var(--ember); border-radius: 4px; font-weight: 800;">
                [ ESPACE MEMBRE ]
              </span>
            </div>

            <h1 class="font-display auth-title" style="color: #ffffff;">
              Ravi de vous revoir sur MonProgrammeFit.
            </h1>

            <p class="auth-desc">
              Connectez-vous pour reprendre votre suivi, enregistrer vos séances et consulter vos consignes.
            </p>

            <!-- AVANTAGES MEMBRE -->
            <div class="auth-features-list">
              <div class="auth-feature-item">
                <div class="auth-feature-icon" style="background: rgba(226, 98, 45, 0.15); color: var(--ember);">
                  ${icon("activity", 16)}
                </div>
                <div>
                  <h4 class="auth-feature-title">Programmes & Exercices</h4>
                  <p class="auth-feature-text">Accédez immédiatement aux séances et conseils ciblés.</p>
                </div>
              </div>

              <div class="auth-feature-item">
                <div class="auth-feature-icon" style="background: rgba(60, 150, 80, 0.15); color: var(--moss);">
                  ${icon("trending-up", 16)}
                </div>
                <div>
                  <h4 class="auth-feature-title">Suivi de Progression</h4>
                  <p class="auth-feature-text">Consignez votre évolution physique et vos mensurations.</p>
                </div>
              </div>

              <div class="auth-feature-item">
                <div class="auth-feature-icon" style="background: rgba(255, 255, 255, 0.1); color: #ffffff;">
                  ${icon("shield-check", 16)}
                </div>
                <div>
                  <h4 class="auth-feature-title">Espace 100% Sécurisé</h4>
                  <p class="auth-feature-text">Données personnelles protégées et synchronisées.</p>
                </div>
              </div>
            </div>
          </div>

          <!-- CITATION / BADGE EN BAS -->
          <div style="margin-top: 16px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.1); display: flex; align-items: center; gap: 10px;">
            <div style="width: 30px; height: 30px; border-radius: 50%; background: var(--ember); color: white; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 11px; flex-shrink: 0;">
              AB
            </div>
            <div>
              <div style="font-size: 12px; font-weight: 700; color: #ffffff;">Coach Abdou BAKARI</div>
              <div style="font-size: 10.5px; color: var(--ink-muted2);">Fondateur & Préparateur Physique</div>
            </div>
          </div>

        </div>

        <!-- COLONNE DROITE: FORMULAIRE DE CONNEXION -->
        <div class="auth-form-card">
          
          <div style="margin-bottom: 12px;">
            <h2 class="font-display auth-title" style="color: var(--ink);">Connexion</h2>
            <p class="auth-desc" style="margin: 0;">Saisissez vos identifiants pour vous connecter.</p>
          </div>

          <!-- BOUTON AUTH GOOGLE -->
          <button type="button" class="auth-google-btn" data-google-auth="login" ${state.ui.googleAuthPending ? "disabled" : ""}>
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            ${state.ui.googleAuthPending ? "Connexion Google…" : "Continuer avec Google"}
          </button>

          <!-- SEPARATEUR -->
          <div class="auth-divider">
            <div style="flex: 1; height: 1px; background: var(--line);"></div>
            <span style="padding: 0 10px;" class="font-mono">ou avec email</span>
            <div style="flex: 1; height: 1px; background: var(--line);"></div>
          </div>

          <!-- FORMULAIRE EMAIL/MDP -->
          <div class="auth-input-group">
            <div>
              <label class="font-mono auth-input-label">
                Adresse e-mail
              </label>
              <input class="auth-input text-input" type="email" data-login-email value="${escapeHtml(login.email)}" placeholder="nom@exemple.com" autocomplete="username" />
            </div>

            <div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 3px;">
                <label class="font-mono auth-input-label" style="margin-bottom: 0;">
                  Mot de passe
                </label>
                <button type="button" id="btn-forgot-password-link" style="background: none; border: none; padding: 0; color: var(--ember); font-size: 11px; font-weight: 600; cursor: pointer;">
                  Mot de passe oublié ?
                </button>
              </div>

              <div class="password-field" style="position: relative;">
                <input class="auth-input text-input" type="${state.ui.loginShowPassword ? "text" : "password"}" data-login-password value="${escapeHtml(login.password)}" placeholder="•••••••••" autocomplete="current-password" />
                <button type="button" class="toggle-password" data-login-toggle-password style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; color: var(--slate); font-size: 11px; font-weight: 600; cursor: pointer;">
                  ${state.ui.loginShowPassword ? "Masquer" : "Afficher"}
                </button>
              </div>
            </div>

            <!-- BANNÈRES DE NOTIFICATION -->
            ${state.ui.loginSuccessMessage ? `
              <div class="form-success" role="alert" style="background: rgba(60, 150, 80, 0.1); color: var(--moss); border: 1px solid rgba(60, 150, 80, 0.2); padding: 8px 10px; border-radius: 6px; font-size: 12px; font-weight: 600;">
                ${escapeHtml(state.ui.loginSuccessMessage)}
              </div>
            ` : ""}

            ${state.ui.loginError ? `
              <div class="form-error" role="alert" style="background: rgba(226, 98, 45, 0.1); color: var(--ember); border: 1px solid rgba(226, 98, 45, 0.2); padding: 8px 10px; border-radius: 6px; font-size: 12px; font-weight: 600;">
                ${escapeHtml(state.ui.loginError)}
              </div>
            ` : ""}

            <!-- BOUTON VALIDER -->
            <button class="btn btn-ember auth-submit-btn" data-login-submit="1" ${state.ui.loginPending ? "disabled" : ""}>
              ${state.ui.loginPending ? `<span class="btn-spinner"></span> Connexion…` : "Se connecter"}
            </button>
          </div>

          <!-- ACCÈS INSCRIPTION -->
          <div style="margin-top: 12px; text-align: center; border-top: 1px solid var(--line); padding-top: 10px;">
            <p style="font-size: 12px; color: var(--slate); margin: 0 0 4px 0;">Nouveau sur MonProgrammeFit ?</p>
            <button class="btn btn-outline" style="font-size: 12px; font-weight: 700; padding: 6px 14px; border: 1px solid var(--line); border-radius: 6px; color: var(--ink); background: var(--chalk-soft); cursor: pointer;" data-nav="signup">
              Créer mon compte
            </button>
          </div>

        </div>

      </div>

    </div>
  </div>`;
}

export function renderSignup() {
  const d = state.drafts.signup;
  const fromOnboarding = !!(state.pendingProgramId || (state.quizAnswers?.objectif && state.quizAnswers?.lieu));
  return `
  <div class="auth-page-container" style="background: var(--chalk);">
    <div class="auth-wrap">
      
      <div class="auth-grid">
        
        <!-- COLONNE GAUCHE: BRANDING INSCRIPTION (Masquée sur Mobile) -->
        <div class="auth-branding-col">
          
          <div style="position: relative; z-index: 2;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px;">
              <span class="font-mono" style="font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; padding: 3px 8px; background: rgba(226, 98, 45, 0.2); color: var(--ember); border-radius: 4px; font-weight: 800;">
                [ INSCRIPTION MEMBRE ]
              </span>
            </div>

            <h1 class="font-display auth-title" style="color: #ffffff;">
              ${fromOnboarding ? "Ton programme est prêt. Crée ton compte pour continuer." : "Commencez votre transformation dès aujourd'hui."}
            </h1>

            <p class="auth-desc">
              ${fromOnboarding
                ? "Tes réponses d'onboarding sont enregistrées. Un compte te permet de sauvegarder ton programme et d'accéder à ton espace athlète."
                : "Créez votre profil en quelques secondes pour accéder à vos programmes personnalisés."}
            </p>

            <!-- POINTS FORTS INSCRIPTION -->
            <div class="auth-features-list">
              <div class="auth-feature-item">
                <div class="auth-feature-icon" style="background: rgba(226, 98, 45, 0.15); color: var(--ember);">
                  ${icon("check-circle-2", 16)}
                </div>
                <div>
                  <h4 class="auth-feature-title">Diagnostic personnalisé</h4>
                  <p class="auth-feature-text">Questionnaire guidé pour définir vos cibles sportives.</p>
                </div>
              </div>

              <div class="auth-feature-item">
                <div class="auth-feature-icon" style="background: rgba(60, 150, 80, 0.15); color: var(--moss);">
                  ${icon("dumbbell", 16)}
                </div>
                <div>
                  <h4 class="auth-feature-title">Programmes au choix</h4>
                  <p class="auth-feature-text">Accès aux parcours en Salle, Maison & Poids du corps.</p>
                </div>
              </div>

              <div class="auth-feature-item">
                <div class="auth-feature-icon" style="background: rgba(255, 255, 255, 0.1); color: #ffffff;">
                  ${icon("user-check", 16)}
                </div>
                <div>
                  <h4 class="auth-feature-title">Accompagnement Coach</h4>
                  <p class="auth-feature-text">Méthode conçue par le Coach Abdou BAKARI.</p>
                </div>
              </div>
            </div>
          </div>

          <!-- FOOTER GAUCHE -->
          <div style="margin-top: 16px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: space-between;">
            <span class="font-mono" style="font-size: 11px; color: var(--ink-muted2);">MonProgrammeFit © 2026</span>
            <span style="font-size: 11px; color: var(--moss); font-weight: 700;">Inscription gratuite</span>
          </div>

        </div>

        <!-- COLONNE DROITE: FORMULAIRE D'INSCRIPTION -->
        <div class="auth-form-card">
          
          <div style="margin-bottom: 12px;">
            <h2 class="font-display auth-title" style="color: var(--ink);">${fromOnboarding ? "Dernière étape" : "Créer mon compte"}</h2>
            <p class="auth-desc" style="margin: 0;">${fromOnboarding ? "Crée ton compte pour enregistrer ton programme et continuer." : "Rejoignez-nous et commencez votre entraînement."}</p>
          </div>

          <!-- BOUTON GOOGLE -->
          <button type="button" class="auth-google-btn" data-google-auth="signup" ${state.ui.googleAuthPending ? "disabled" : ""}>
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            ${state.ui.googleAuthPending ? "Création en cours avec Google…" : "S'inscrire avec Google"}
          </button>

          <!-- SEPARATEUR -->
          <div class="auth-divider">
            <div style="flex: 1; height: 1px; background: var(--line);"></div>
            <span style="padding: 0 10px;" class="font-mono">ou par e-mail</span>
            <div style="flex: 1; height: 1px; background: var(--line);"></div>
          </div>

          <!-- CHAMPS FORMULAIRE -->
          <div class="auth-input-group">
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: clamp(8px, 1.2vw, 12px);">
              <div>
                <label class="font-mono auth-input-label">Prénom</label>
                <input class="auth-input text-input" type="text" data-signup-firstname value="${escapeHtml(d.firstName)}" placeholder="Ex: Thomas" />
              </div>

              <div>
                <label class="font-mono auth-input-label">Nom</label>
                <input class="auth-input text-input" type="text" data-signup-lastname value="${escapeHtml(d.lastName)}" placeholder="Ex: Martin" />
              </div>
            </div>

            <div>
              <label class="font-mono auth-input-label">Adresse e-mail</label>
              <input class="auth-input text-input" type="email" data-signup-email value="${escapeHtml(d.email)}" placeholder="nom@exemple.com" autocomplete="username" />
            </div>

            <div>
              <label class="font-mono auth-input-label">
                Téléphone <span style="color: var(--slate); font-weight: normal; text-transform: none;">(optionnel)</span>
              </label>
              <input class="auth-input text-input" type="tel" data-signup-phone value="${escapeHtml(d.phone || '')}" placeholder="Ex: +229 90000000" />
            </div>

            <div>
              <label class="font-mono auth-input-label">Mot de passe</label>
              <div class="password-field" style="position: relative;">
                <input class="auth-input text-input" type="${state.ui.signupShowPassword ? "text" : "password"}" data-signup-password value="${escapeHtml(d.password)}" placeholder="•••••••••" autocomplete="new-password" />
                <button type="button" class="toggle-password" data-signup-toggle-password style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; color: var(--slate); font-size: 11px; font-weight: 600; cursor: pointer;">
                  ${state.ui.signupShowPassword ? "Masquer" : "Afficher"}
                </button>
              </div>
              <p style="font-size: 10px; color: var(--slate); margin: 2px 0 0 0;">Au moins 8 caractères avec majuscule, chiffre et symbole.</p>
            </div>

            <!-- BANNÈRES CONFIRMATION & ERREUR -->
            ${state.ui.signupSuccessMessage ? `
              <div class="form-success" role="alert" style="background: rgba(60, 150, 80, 0.1); color: var(--moss); border: 1px solid rgba(60, 150, 80, 0.2); padding: 8px 10px; border-radius: 6px; font-size: 12px; font-weight: 600;">
                ${escapeHtml(state.ui.signupSuccessMessage)}
              </div>
            ` : ""}

            ${state.ui.signupError ? `
              <div class="form-error" role="alert" style="background: rgba(226, 98, 45, 0.1); color: var(--ember); border: 1px solid rgba(226, 98, 45, 0.2); padding: 8px 10px; border-radius: 6px; font-size: 12px; font-weight: 600;">
                ${escapeHtml(state.ui.signupError)}
              </div>
            ` : ""}

            <!-- BOUTON VALIDER INSCRIPTION -->
            <button class="btn btn-ember auth-submit-btn" data-signup-submit="1" ${state.ui.signupPending ? "disabled" : ""}>
              ${state.ui.signupPending ? `<span class="btn-spinner"></span> Création en cours…` : "Créer mon compte"}
            </button>
          </div>

          <!-- ACCÈS CONNEXION -->
          <div style="margin-top: 12px; text-align: center; border-top: 1px solid var(--line); padding-top: 10px;">
            <p style="font-size: 12px; color: var(--slate); margin: 0 0 4px 0;">Vous avez déjà un compte ?</p>
            <button class="btn btn-outline" style="font-size: 12px; font-weight: 700; padding: 6px 14px; border: 1px solid var(--line); border-radius: 6px; color: var(--ink); background: var(--chalk-soft); cursor: pointer;" data-nav="login">
              Se connecter
            </button>
          </div>

        </div>

      </div>

    </div>
  </div>`;
}
