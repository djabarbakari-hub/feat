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
  if (e.target.matches('[data-signup-age]')) {
    state.drafts.signup.age = e.target.value;
    persistState();
  }
  if (e.target.matches('[data-signup-goal]')) {
    state.drafts.signup.goal = e.target.value;
    persistState();
  }
  if (e.target.matches('[data-signup-weight]')) {
    state.drafts.signup.weight = e.target.value;
    persistState();
  }
  if (e.target.matches('[data-signup-height]')) {
    state.drafts.signup.height = e.target.value;
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

document.addEventListener("click", (e) => {
  const navBtn = e.target.closest("[data-nav]");
  if (navBtn) {
    if (navBtn.dataset.logout) { state.role = "guest"; }
    navigate(navBtn.dataset.nav);
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
  if (contactSendBtn) {
    const form = contactSendBtn.closest('.card') || document;
    const name = (form.querySelector('input[type="text"]') || {}).value || "";
    const email = (form.querySelector('input[type="email"]') || {}).value || "";
    const message = (form.querySelector('textarea') || {}).value || "";
    const subject = encodeURIComponent('Demande MonProgrammeFit');
    const body = encodeURIComponent(`Nom: ${name}\nEmail: ${email}\n\nMessage:\n${message}`);
    window.location.href = `mailto:contact@monprogrammefit.com?subject=${subject}&body=${body}`;
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
    render();
    return;
  }

  const signupSubmitBtn = e.target.closest("[data-signup-submit]");
  if (signupSubmitBtn) {
    const card = signupSubmitBtn.closest('.card') || document;
    const firstName = (card.querySelector('[data-signup-firstname]') || {}).value || "";
    const lastName = (card.querySelector('[data-signup-lastname]') || {}).value || "";
    const email = (card.querySelector('[data-signup-email]') || {}).value || "";
    const ageVal = (card.querySelector('[data-signup-age]') || {}).value || null;
    const goal = (card.querySelector('[data-signup-goal]') || {}).value || "";
    const weightVal = (card.querySelector('[data-signup-weight]') || {}).value || null;
    const heightVal = (card.querySelector('[data-signup-height]') || {}).value || null;
    const age = ageVal ? parseInt(ageVal, 10) : null;
    const weight = weightVal ? parseFloat(weightVal) : null;
    const height = heightVal ? parseFloat(heightVal) : null;
    state.clientProfile = { firstName, lastName, email, age, goal, weight, height };
    state.role = 'client';
    navigate('quiz');
    return;
  }

  const loginSubmitBtn = e.target.closest("[data-login-submit]");
  if (loginSubmitBtn) {
    state.role = state.loginTab;
    navigate(state.loginTab === "client" ? "client-dashboard" : "admin-dashboard");
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
});
