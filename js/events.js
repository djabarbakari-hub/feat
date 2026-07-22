/* ==========================================================
   events.js — Délégation d'événements globale (input + click).

   CORRECTIFS APPORTÉS PAR RAPPORT À L'ORIGINAL :
   1. Les blocs `if (navBtn)` et `if (quizBtn)` étaient dupliqués plus bas
      dans le fichier original, après un `return` qui les rendait
      inatteignables (code mort). La logique de déconnexion
      (`data-logout`) qui vivait dans le second bloc mort ne s'exécutait
      donc JAMAIS. Elle est réintégrée ici, une seule fois.
   2. Les boutons `data-quiz-skip`, `data-quiz-next` et `data-quiz-confirm`
      n'avaient AUCUN gestionnaire : impossible de terminer le quiz à
      partir de l'étape "physique" ou de l'étape "résumé". Ajoutés ici.
   3. Les champs texte du quiz (prénom, poids/taille/âge) n'étaient
      captés par aucun listener "input" : les valeurs tapées étaient
      perdues. Ajoutés ici (data-quiz-text, data-quiz-physique).
   4. Tous les `console.log` de debug ont été retirés.
   ========================================================== */

import { state, persistState } from "./state.js";
import { navigate, goBack } from "./router.js";
import { render } from "./render.js";
import { QUIZ_STEPS } from "./data.js";
import { trackById, closeMobileMenu } from "./helpers.js";
import { auth, db } from "./firebase.js";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

/**
 * Traduit les codes d'erreur Firebase Auth en français lisible.
 * Explication : évite d'afficher des erreurs d'API brutes à l'utilisateur.
 */
function getReadableAuthError(error) {
  const code = error?.code || "";
  switch (code) {
    case "auth/email-already-in-use":
      return "Cette adresse e-mail est déjà associée à un compte.";
    case "auth/invalid-email":
      return "L'adresse e-mail saisie n'est pas valide.";
    case "auth/operation-not-allowed":
      return "L'authentification e-mail/mot de passe n'est pas activée.";
    case "auth/weak-password":
      return "Le mot de passe est trop faible. Il doit contenir au moins 8 caractères avec majuscule, minuscule, chiffre et caractère spécial.";
    case "auth/user-disabled":
      return "Ce compte utilisateur a été désactivé.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Adresse e-mail ou mot de passe incorrect.";
    case "auth/too-many-requests":
      return "Trop de tentatives infructueuses. Veuillez répliquer plus tard.";
    case "auth/network-request-failed":
      return "Connexion réseau impossible. Vérifiez votre connexion Internet.";
    default:
      return error.message || "Une erreur est survenue lors de l'authentification.";
  }
}

/**
 * Valide les exigences de complexité du mot de passe côté client.
 * Explication : Majuscule, minuscule, chiffre et caractère spécial obligatoires.
 */
function validatePasswordComplexity(password) {
  if (password.length < 8) {
    return "Le mot de passe doit contenir au moins 8 caractères.";
  }
  if (!/[A-Z]/.test(password)) {
    return "Le mot de passe doit contenir au moins une lettre majuscule (A-Z).";
  }
  if (!/[a-z]/.test(password)) {
    return "Le mot de passe doit contenir au moins une lettre minuscule (a-z).";
  }
  if (!/[0-9]/.test(password)) {
    return "Le mot de passe doit contenir au moins un chiffre (0-9).";
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    return "Le mot de passe doit contenir au moins un caractère spécial (ex: @, #, !, $, %).";
  }
  return null;
}

document.addEventListener("input", (e) => {
  if (e.target.matches('[data-contact-name]')) {
    state.drafts.contact.name = e.target.value;
    persistState();
  }
  if (e.target.matches('[data-contact-email]')) {
    state.drafts.contact.email = e.target.value;
    persistState();
  }
  if (e.target.matches('[data-contact-message]')) {
    state.drafts.contact.message = e.target.value;
    persistState();
  }
  if (e.target.matches('[data-signup-firstname]')) {
    state.drafts.signup.firstName = e.target.value;
    persistState();
  }
  if (e.target.matches('[data-signup-lastname]')) {
    state.drafts.signup.lastName = e.target.value;
    persistState();
  }
  if (e.target.matches('[data-signup-email]')) {
    state.drafts.signup.email = e.target.value;
    persistState();
  }
  if (e.target.matches('[data-signup-password]')) {
    state.drafts.signup.password = e.target.value;
    persistState();
  }
  if (e.target.matches('[data-login-email]')) {
    state.drafts.login.email = e.target.value;
    persistState();
  }
  if (e.target.matches('[data-login-password]')) {
    state.drafts.login.password = e.target.value;
    persistState();
  }
  if (e.target.matches('[data-quiz-text]')) {
    state.quizAnswers[e.target.dataset.quizText] = e.target.value;
    persistState();
  }
  if (e.target.matches('[data-quiz-physique]')) {
    if (!state.quizAnswers.physique) state.quizAnswers.physique = {};
    state.quizAnswers.physique[e.target.dataset.quizPhysique] = e.target.value;
    persistState();
  }
});

document.addEventListener("click", async (e) => {
  const navBtn = e.target.closest("[data-nav]");
  if (navBtn) {
    if (navBtn.dataset.logout) {
      try {
        await signOut(auth);
      } catch (err) {
        console.error("Erreur de déconnexion Firebase:", err);
      }
      state.role = "guest";
      state.clientProfile = {};
      state.drafts.login.password = "";
      state.drafts.signup.password = "";
    }
    navigate(navBtn.dataset.nav);
    closeMobileMenu();
    return;
  }

  const quizBtn = e.target.closest("[data-quiz-answer]");
  if (quizBtn) {
    const [key, val] = quizBtn.dataset.quizAnswer.split(":");
    state.quizAnswers[key] = val;
    state.quizStep += 1;
    persistState();
    render();
    return;
  }

  const quizBackBtn = e.target.closest("[data-quiz-back]");
  if (quizBackBtn && state.quizStep > 0) {
    state.quizStep--;
    persistState();
    render();
    return;
  }

  const quizRestartBtn = e.target.closest("[data-quiz-restart]");
  if (quizRestartBtn) {
    state.quizStep = 0;
    state.quizAnswers = {};
    persistState();
    render();
    return;
  }

  const quizSkipBtn = e.target.closest("[data-quiz-skip]");
  if (quizSkipBtn) {
    state.quizStep++;
    persistState();
    render();
    return;
  }

  const quizNextBtn = e.target.closest("[data-quiz-next]");
  if (quizNextBtn) {
    state.quizStep++;
    persistState();
    render();
    return;
  }

  const quizConfirmBtn = e.target.closest("[data-quiz-confirm]");
  if (quizConfirmBtn) {
    const answers = state.quizAnswers || {};
    const track = trackById(answers.lieu || "home-equip");
    const weekLength = track.id === "gym" ? 12 : track.id === "bodyweight" ? 8 : 10;
    const program = {
      trackLabel: track.label,
      track: track.id,
      week: 1,
      totalWeeks: weekLength,
      nextSession: `${track.label} — Séance 1`,
      history: [
        { name: "Semaine 1", done: 0, total: 3 }
      ],
      sessions: [
        { name: "Séance 1 — Focus technique", exos: 6, duree: "35 min", done: false },
        { name: "Séance 2 — Intensité maîtrisée", exos: 7, duree: "40 min", done: false },
        { name: "Séance 3 — Endurance active", exos: 5, duree: "30 min", done: false },
      ]
    };

    state.clientProfile = {
      ...state.clientProfile,
      goal: answers.objectif,
      track: answers.lieu,
      niveau: answers.niveau,
      frequence: answers.frequence,
      physique: answers.physique,
      program,
    };
    state.quizStep = QUIZ_STEPS.length;
    persistState();
    render();
    return;
  }

  const roleNavBtn = e.target.closest("[data-role-nav]");
  if (roleNavBtn) {
    const [role, page] = roleNavBtn.dataset.roleNav.split(":");
    state.role = role;
    navigate(page);
    return;
  }

  const backBtn = e.target.closest("[data-back]");
  if (backBtn) {
    goBack();
    return;
  }

  const contactSendBtn = e.target.closest("[data-contact-send]");
  if (contactSendBtn && contactSendBtn.dataset.contactSend === "1") {
    const form = contactSendBtn.closest('.card') || document;
    const name = form.querySelector('[data-contact-name]')?.value || "";
    const email = form.querySelector('[data-contact-email]')?.value || "";
    const message = form.querySelector('[data-contact-message]')?.value || "";
    const subject = form.querySelector('[data-contact-subject]')?.value || "";
    const captcha = form.querySelector('[data-contact-captcha]')?.value || "";
    
    // Validation
    if (!name || !email || !message || !subject || !captcha) {
      alert("Tous les champs sont obligatoires.");
      return;
    }
    
    if (!/^[^@]+@[^@]+\.[^@]+$/.test(email)) {
      alert("Veuillez entrer un email valide.");
      return;
    }
    
    if (captcha !== "5") {
      alert("Réponse anti-spam incorrecte.");
      return;
    }
    
    // Envoi
    state.ui.isSending = true;
    state.drafts.contact = { name: "", email: "", message: "", subject: "", captcha: "" };
    persistState();
    render();
    
    // Simulation d'envoi (remplacer par un appel API réel)
    setTimeout(() => {
      state.ui.isSending = false;
      state.ui.sendSuccess = true;
      persistState();
      render();
    }, 1500);
    return;
  }
  
  const contactResetBtn = e.target.closest("[data-contact-reset]");
  if (contactResetBtn) {
    state.ui.sendSuccess = false;
    state.drafts.contact = { name: "", email: "", message: "", subject: "", captcha: "" };
    persistState();
    render();
    return;
  }

  const sessionActionBtn = e.target.closest("[data-session-action]");
  if (sessionActionBtn) {
    const action = sessionActionBtn.dataset.sessionAction;
    const sessionName = sessionActionBtn.dataset.sessionName || "";
    state.activeSession = sessionName;
    if (action === 'start' || action === 'review') {
      navigate('client-progress');
      return;
    }
  }

  const adminActionBtn = e.target.closest("[data-admin-action]");
  if (adminActionBtn) {
    const action = adminActionBtn.dataset.adminAction;
    if (action === "notifications") {
      state.adminNotice = "Centre de notifications — 3 messages non lus à traiter.";
      navigate("admin-messages");
      return;
    }
    if (action === "settings") {
      state.adminNotice = "Paramètres du coach — l'éditeur de configuration arrive dans la prochaine itération.";
      render();
      return;
    }
    if (action === "export") {
      state.adminNotice = "Export lancé. Le fichier sera généré dès la connexion au back-end.";
      render();
      return;
    }
    if (action === "go-dashboard") {
      navigate("admin-dashboard");
      return;
    }
    if (action === "go-clients") {
      navigate("admin-clients");
      return;
    }
    if (action === "go-messages") {
      navigate("admin-messages");
      return;
    }
    if (action === "new-program") {
      state.adminNotice = "Création de programme — l'éditeur de contenu sera branché dans la prochaine version.";
      render();
      return;
    }
    if (action === "edit-program") {
      state.adminNotice = "Édition du programme — le formulaire d'édition est prévu dans la prochaine itération.";
      render();
      return;
    }
  }

  const loginTabBtn = e.target.closest("[data-login-tab]");
  if (loginTabBtn) {
    state.loginTab = loginTabBtn.dataset.loginTab;
    state.ui.loginError = "";
    state.ui.loginPending = false;
    render();
    return;
  }

  const loginPasswordToggle = e.target.closest("[data-login-toggle-password]");
  if (loginPasswordToggle) {
    state.ui.loginShowPassword = !state.ui.loginShowPassword;
    render();
    return;
  }

  const signupSubmitBtn = e.target.closest("[data-signup-submit]");
  if (signupSubmitBtn) {
    const card = signupSubmitBtn.closest('.card') || document;
    const firstName = (card.querySelector('[data-signup-firstname]') || {}).value.trim();
    const lastName = (card.querySelector('[data-signup-lastname]') || {}).value.trim();
    const email = (card.querySelector('[data-signup-email]') || {}).value.trim();
    const password = (card.querySelector('[data-signup-password]') || {}).value || "";
    const emailValid = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);

    state.drafts.signup.firstName = firstName;
    state.drafts.signup.lastName = lastName;
    state.drafts.signup.email = email;
    state.drafts.signup.password = password;

    if (!firstName) {
      state.ui.signupError = "Veuillez saisir votre prénom.";
      render();
      return;
    }

    if (!email) {
      state.ui.signupError = "Veuillez saisir votre adresse e-mail.";
      render();
      return;
    }

    if (!emailValid) {
      state.ui.signupError = "Veuillez saisir une adresse e-mail valide.";
      render();
      return;
    }

    const passwordComplexityError = validatePasswordComplexity(password);
    if (passwordComplexityError) {
      state.ui.signupError = passwordComplexityError;
      render();
      return;
    }

    state.ui.signupError = "";
    state.ui.signupPending = true;
    render();

    try {
      // 1. Création de l'utilisateur dans Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Création du document Firestore dans la collection "users"
      // Le rôle est TOUJOURS "client" à l'inscription publique
      await setDoc(doc(db, "users", user.uid), {
        firstName,
        lastName,
        email,
        role: "client",
        createdAt: new Date().toISOString(),
      });

      // 3. Mise à jour de l'état global et redirection vers le quiz
      state.clientProfile = { firstName, lastName, email, uid: user.uid };
      state.role = "client";
      state.drafts.signup.password = "";
      state.ui.signupPending = false;
      state.ui.signupError = "";

      persistState();
      navigate("quiz");
    } catch (error) {
      state.ui.signupPending = false;
      state.ui.signupError = getReadableAuthError(error);
      render();
    }
    return;
  }

  const loginSubmitBtn = e.target.closest("[data-login-submit]");
  if (loginSubmitBtn) {
    const form = loginSubmitBtn.closest('.login-wrap') || document;
    const email = (form.querySelector('[data-login-email]') || {}).value.trim();
    const password = (form.querySelector('[data-login-password]') || {}).value || "";
    const emailValid = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);

    state.drafts.login.email = email;
    state.drafts.login.password = password;

    if (!email) {
      state.ui.loginError = "Veuillez saisir votre adresse e-mail.";
      render();
      return;
    }

    if (!emailValid) {
      state.ui.loginError = "Veuillez saisir une adresse e-mail valide.";
      render();
      return;
    }

    if (!password) {
      state.ui.loginError = "Veuillez saisir votre mot de passe.";
      render();
      return;
    }

    state.ui.loginError = "";
    state.ui.loginPending = true;
    render();

    try {
      // 1. Connexion via Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Lecture du rôle réel et des données depuis la collection "users" dans Firestore
      let userRole = "client";
      let userProfile = { email: user.email, uid: user.uid };

      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const data = userDocSnap.data();
        userRole = data.role || "client";
        userProfile = { ...userProfile, ...data };
      }

      // 3. Mise à jour de l'état local et redirection selon le rôle Firestore (client ou admin)
      state.role = userRole;
      state.clientProfile = userProfile;
      state.drafts.login.password = "";
      state.ui.loginPending = false;
      state.ui.loginError = "";

      persistState();
      navigate(userRole === "admin" ? "admin-dashboard" : "client-dashboard");
    } catch (error) {
      state.ui.loginPending = false;
      state.ui.loginError = getReadableAuthError(error);
      render();
    }
    return;
  }

  const toggleBtn = e.target.closest("#navToggle");
  if (toggleBtn) {
    const navMobile = document.getElementById("navMobile");
    if (navMobile) {
      navMobile.classList.toggle("open-mobile");
      toggleBtn.setAttribute("aria-expanded", navMobile.classList.contains("open-mobile") ? "true" : "false");
    }
    return;
  }

  // === ÉVÉNEMENTS PRIVACY ===
  const privacyDeleteBtn = e.target.closest("[data-privacy-delete]");
  if (privacyDeleteBtn) {
    const type = privacyDeleteBtn.dataset.privacyDelete;
    showPrivacyConfirmModal(type);
    return;
  }

  const privacyExportBtn = e.target.closest("[data-privacy-export]");
  if (privacyExportBtn) {
    const { downloadUserDataAsJson } = await import("./modules/privacy.js");
    downloadUserDataAsJson();
    return;
  }

  const privacyConsentBtn = e.target.closest("[data-privacy-consent]");
  if (privacyConsentBtn) {
    const choice = privacyConsentBtn.dataset.privacyConsent;
    const { setAnalyticsConsent } = await import("./modules/privacy.js");
    if (choice === "accept") setAnalyticsConsent(true, "all");
    if (choice === "refuse") setAnalyticsConsent(false, "all");
    if (choice === "customize") showConsentCustomizeModal();
    return;
  }

  // === ÉVÉNEMENTS MODAL CONSENTEMENT ===
  const consentAccept = e.target.closest("#consent-accept-all");
  if (consentAccept) {
    const { setAnalyticsConsent } = await import("./modules/privacy.js");
    setAnalyticsConsent(true, "all");
    const modal = document.getElementById("consent-modal");
    if (modal) modal.remove();
    return;
  }

  const consentRefuse = e.target.closest("#consent-refuse-all");
  if (consentRefuse) {
    const { setAnalyticsConsent } = await import("./modules/privacy.js");
    setAnalyticsConsent(false, "all");
    const modal = document.getElementById("consent-modal");
    if (modal) modal.remove();
    return;
  }

  const consentCustomize = e.target.closest("#consent-customize");
  if (consentCustomize) {
    showConsentCustomizeModal();
    return;
  }

  const consentClose = e.target.closest("#consent-close");
  if (consentClose) {
    const modal = document.getElementById("consent-modal");
    if (modal) modal.remove();
    return;
  }

  const consentCustomizeSave = e.target.closest("#consent-customize-save");
  if (consentCustomizeSave) {
    const gaCheckbox = document.getElementById("consent-ga");
    const clarityCheckbox = document.getElementById("consent-clarity");
    const { setAnalyticsConsent } = await import("./modules/privacy.js");
    
    if (gaCheckbox) setAnalyticsConsent(gaCheckbox.checked, "analytics");
    if (clarityCheckbox) setAnalyticsConsent(clarityCheckbox.checked, "clarity");
    
    const customizeModal = document.getElementById("consent-customize-modal");
    if (customizeModal) customizeModal.remove();
    return;
  }

  const consentCustomizeCancel = e.target.closest("#consent-customize-cancel");
  if (consentCustomizeCancel) {
    const customizeModal = document.getElementById("consent-customize-modal");
    if (customizeModal) customizeModal.remove();
    return;
  }
});

/**
 * Affiche le modal de confirmation de suppression.
 */
async function showPrivacyConfirmModal(type) {
  const messages = {
    drafts: {
      title: "Supprimer les brouillons?",
      text: "Les brouillons non envoyés seront supprimés définitivement.",
      action: "delete-drafts",
    },
    history: {
      title: "Effacer l'historique?",
      text: "Votre historique de navigation et vos réponses au quiz seront supprimés.",
      action: "delete-history",
    },
    profile: {
      title: "Supprimer le profil?",
      text: "Vos données personnelles seront supprimées. Vous devrez recommencer l'onboarding.",
      action: "delete-profile",
    },
    account: {
      title: "⚠️ ATTENTION: Suppression du compte",
      text: "Cette action est IRRÉVERSIBLE. Toutes vos données seront supprimées définitivement.",
      action: "delete-account",
      isDestructive: true,
    },
  };

  const config = messages[type];
  if (!config) return;

  const modal = document.createElement("div");
  modal.id = "privacy-confirm-modal";
  modal.style.cssText = `
    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.7); display: flex; align-items: center;
    justify-content: center; z-index: 120;
  `;

  modal.innerHTML = `
    <div style="
      background: var(--chalk); color: var(--ink);
      border-radius: 4px; padding: 32px; max-width: 400px;
      width: 90%; box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    ">
      <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 600;">
        ${config.title}
      </h2>
      <p style="color: var(--slate); font-size: 14px; margin: 0 0 24px 0; line-height: 1.5;">
        ${config.text}
      </p>

      <div style="display: flex; gap: 8px;">
        <button class="privacy-confirm-no" style="
          background: var(--line); color: var(--ink);
          flex: 1; padding: 10px; font-weight: 600; border-radius: 2px;
          cursor: pointer; border: none;
        ">
          Annuler
        </button>
        <button class="privacy-confirm-yes" data-privacy-confirm="${config.action}" style="
          background: ${config.isDestructive ? "var(--ember)" : "var(--moss)"}; 
          color: white; flex: 1; padding: 10px; font-weight: 600;
          border-radius: 2px; cursor: pointer; border: none;
        ">
          Confirmer
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Événements du modal
  modal.querySelector(".privacy-confirm-no").addEventListener("click", () => {
    modal.remove();
  });

  const confirmBtn = modal.querySelector(".privacy-confirm-yes");
  confirmBtn.addEventListener("click", async () => {
    modal.remove();
    const {
      clearDrafts,
      clearHistory,
      deleteClientProfile,
      deleteEntireAccount,
    } = await import("./modules/privacy.js");

    switch (config.action) {
      case "delete-drafts":
        clearDrafts();
        break;
      case "delete-history":
        clearHistory();
        break;
      case "delete-profile":
        deleteClientProfile();
        persistState();
        render();
        break;
      case "delete-account":
        if (confirm("DERNIÈRE CONFIRMATION: Êtes-vous vraiment sûr? Cette action est irréversible.")) {
          deleteEntireAccount();
        }
        break;
    }
  });
}

/**
 * Affiche le modal de personnalisation du consentement.
 */
async function showConsentCustomizeModal() {
  const { renderConsentCustomizeModal } = await import("./modules/consent-modal.js");
  const modalHtml = renderConsentCustomizeModal();
  const container = document.createElement("div");
  container.innerHTML = modalHtml;
  document.body.appendChild(container.firstElementChild);
}
