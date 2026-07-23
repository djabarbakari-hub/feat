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
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, setDoc, getDoc, addDoc, collection, writeBatch, query, where, getDocs, updateDoc, deleteDoc } from "firebase/firestore";
import { refreshAdminData } from "../app.js";

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
    case "auth/popup-closed-by-user":
      return "Connexion annulée : la fenêtre Google a été fermée avant la fin.";
    case "auth/popup-blocked":
      return "La fenêtre pop-up Google a été bloquée. Autorisez les pop-ups pour continuer.";
    case "auth/account-exists-with-different-credential":
      return "Un compte existe déjà avec cette adresse e-mail via un autre moyen de connexion.";
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
        { id: "s1", name: "Séance 1 — Focus technique", exos: 6, duree: "35 min", done: false, weekNumber: 1 },
        { id: "s2", name: "Séance 2 — Intensité maîtrisée", exos: 7, duree: "40 min", done: false, weekNumber: 1 },
        { id: "s3", name: "Séance 3 — Endurance active", exos: 5, duree: "30 min", done: false, weekNumber: 1 },
      ]
    };

    state.clientProfile = {
      ...state.clientProfile,
      goal: answers.objectif || "",
      track: answers.lieu || "",
      niveau: answers.niveau || "",
      frequence: answers.frequence || "",
      physique: answers.physique || {},
      quizAnswers: answers,
      program,
    };
    state.quizStep = QUIZ_STEPS.length;
    persistState();

    // Écriture dans Firestore pour l'utilisateur connecté
    const currentUser = auth.currentUser;
    if (currentUser) {
      try {
        const userRef = doc(db, "users", currentUser.uid);
        await setDoc(userRef, {
          goal: answers.objectif || "",
          track: answers.lieu || "",
          niveau: answers.niveau || "",
          frequence: answers.frequence || "",
          weight: answers.physique?.poids ? parseFloat(answers.physique.poids) : null,
          height: answers.physique?.taille ? parseFloat(answers.physique.taille) : null,
          age: answers.physique?.age ? parseInt(answers.physique.age, 10) : null,
          quizAnswers: answers,
          program,
          updatedAt: new Date().toISOString()
        }, { merge: true });

        // Enregistrement des séances dans la sous-collection users/{uid}/sessions
        const batch = writeBatch(db);
        program.sessions.forEach((s) => {
          const sRef = doc(db, "users", currentUser.uid, "sessions", s.id);
          batch.set(sRef, s);
        });
        await batch.commit();
      } catch (err) {
        console.error("Erreur d'enregistrement Firestore du quiz:", err);
      }
    }

    render();
    navigate("client-dashboard");
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
    
    if (captcha.trim() !== "5") {
      alert("Réponse anti-spam incorrecte (2 + 3 = 5).");
      return;
    }
    
    state.ui.isSending = true;
    render();

    try {
      // Écriture du message dans la collection Firestore "messages"
      await addDoc(collection(db, "messages"), {
        fromUid: auth.currentUser?.uid || null,
        fromName: name,
        fromEmail: email,
        subject,
        message,
        createdAt: new Date().toISOString(),
        read: false
      });

      state.ui.isSending = false;
      state.ui.sendSuccess = true;
      state.drafts.contact = { name: "", email: "", message: "", subject: "", captcha: "" };
      persistState();
      render();
    } catch (err) {
      console.error("Erreur d'envoi de message Firestore:", err);
      state.ui.isSending = false;
      alert("Erreur lors de l'envoi du message.");
      render();
    }
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

  // --- CONTROLLER D'ENTRAÎNEMENT ACTIVE ET SIMULATION ---
  const exitSimBtn = e.target.closest("#btn-exit-simulation");
  if (exitSimBtn) {
    state.simulationActive = false;
    state.role = "admin";
    state.clientProfile = state.adminClientProfileBackup || {};
    state.page = "admin-dashboard";
    persistState();
    render();
    return;
  }

  const startTestSimBtn = e.target.closest("#btn-start-test-simulation");
  if (startTestSimBtn) {
    // Rendons le bouton inactif pendant la synchronisation Firestore
    const originalText = startTestSimBtn.innerHTML;
    startTestSimBtn.disabled = true;
    startTestSimBtn.innerHTML = `
      <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true" style="width: 1rem; height: 1rem; border-width: 0.15em;"></span>
      Synchronisation Firestore...
    `;

    const testUid = "test-client-uid";
    const userDocRef = doc(db, "users", testUid);

    // Générons des dates de poids relatives au jour actuel pour une crédibilité maximale
    const now = new Date();
    const formatDateRelative = (daysAgo) => {
      const d = new Date();
      d.setDate(now.getDate() - daysAgo);
      const day = d.getDate().toString().padStart(2, '0');
      const month = (d.getMonth() + 1).toString().padStart(2, '0');
      return `${day}/${month}`;
    };

    const testProfileTemplate = {
      firstName: "Alexandre",
      lastName: "Testeur",
      email: "test.client@monprogrammefit.com",
      role: "client",
      goal: "musculation",
      track: "gym",
      niveau: "intermediaire",
      frequence: "4 séances / semaine",
      weight: 78.5,
      height: 182,
      age: 26,
      medicalNotes: "Légère sensibilité à l'épaule gauche, faire attention sur le développé incliné.",
      program: {
        trackLabel: "Force & Hypertrophie (Gym)",
        track: "gym",
        week: 1,
        totalWeeks: 12,
        nextSession: "Séance 1 — Force Athlétique",
        history: [
          { name: "Semaine 1", done: 1, total: 3 }
        ],
        sessions: [
          { id: "s1", name: "Séance 1 — Poussée pectoraux / épaules", exos: 5, duree: "45 min", done: true, weekNumber: 1 },
          { id: "s2", name: "Séance 2 — Tirage dos / biceps", exos: 6, duree: "50 min", done: false, weekNumber: 1 },
          { id: "s3", name: "Séance 3 — Bas du corps & cuisses", exos: 5, duree: "40 min", done: false, weekNumber: 1 },
        ]
      },
      dailyWaterLog: { date: now.toDateString(), amount: 1250 },
      weightHistory: [
        { date: formatDateRelative(21), weight: 80.5 },
        { date: formatDateRelative(14), weight: 79.8 },
        { date: formatDateRelative(7), weight: 79.1 },
        { date: formatDateRelative(0), weight: 78.5 }
      ],
      quizAnswers: {
        goal: "musculation",
        track: "gym",
        level: "intermediaire",
        freq: "4",
        weight: "78.5",
        height: "182",
        age: "26"
      },
      updatedAt: now.toISOString()
    };

    try {
      const docSnap = await getDoc(userDocRef);
      let testProfileData;
      
      if (!docSnap.exists()) {
        // Enregistre d'abord de vraies données crédibles dans Firestore si elles n'existent pas encore
        await setDoc(userDocRef, testProfileTemplate);
        testProfileData = testProfileTemplate;
      } else {
        // Charge les données à jour du compte test depuis Firestore
        testProfileData = docSnap.data();
      }

      // Reconstituer l'objet physique attendu par l'interface client
      const physique = {
        poids: testProfileData.weight !== undefined ? testProfileData.weight : 78.5,
        taille: testProfileData.height !== undefined ? testProfileData.height : 182,
        age: testProfileData.age !== undefined ? testProfileData.age : 26,
        remarques: testProfileData.medicalNotes !== undefined ? testProfileData.medicalNotes : "",
      };

      const testProfile = {
        ...testProfileData,
        uid: testUid,
        physique
      };

      state.adminClientProfileBackup = { ...state.clientProfile };
      state.clientProfile = testProfile;
      state.simulationActive = true;
      state.role = "client";
      state.page = "client-dashboard";
      
      persistState();
      
      // On rafraîchit aussi les données de l'administrateur pour refléter le statut du client simulé
      await refreshAdminData();
      render();
    } catch (err) {
      console.warn("Firestore sync test profile error, using robust fallback:", err);
      const physique = { poids: 78.5, taille: 182, age: 26, remarques: "Légère sensibilité à l'épaule gauche" };
      state.adminClientProfileBackup = { ...state.clientProfile };
      state.clientProfile = { ...testProfileTemplate, uid: testUid, physique };
      state.simulationActive = true;
      state.role = "client";
      state.page = "client-dashboard";
      persistState();
      render();
    } finally {
      startTestSimBtn.disabled = false;
      startTestSimBtn.innerHTML = originalText;
    }
    return;
  }

  const specificSimBtn = e.target.closest(".btn-simulate-client");
  if (specificSimBtn) {
    const clientId = specificSimBtn.dataset.clientId;
    const clients = state.adminData.clients || [];
    const client = clients.find(c => (c.id || c.uid) === clientId);
    if (client) {
      const existing = document.getElementById("client-details-modal");
      if (existing) existing.remove();

      state.adminClientProfileBackup = { ...state.clientProfile };
      
      const clientWithProg = {
        firstName: client.firstName || "Athlète",
        lastName: client.lastName || "",
        email: client.email || "",
        goal: client.goal || "musculation",
        track: client.track || "gym",
        niveau: client.niveau || "debutant",
        frequence: client.frequence || "3 séances / semaine",
        physique: { 
          poids: client.poids || client.physique?.poids || 70, 
          taille: client.taille || client.physique?.taille || 175, 
          age: client.age || client.physique?.age || 25 
        },
        program: client.program || {
          trackLabel: "Programme sur-mesure",
          track: client.track || "bodyweight",
          week: client.week || 1,
          totalWeeks: client.totalWeeks || 8,
          sessions: client.sessions || [
            { id: "s1", name: "Séance 1 — Initiation technique", exos: 4, duree: "30 min", done: false },
            { id: "s2", name: "Séance 2 — Cardio postural", exos: 5, duree: "35 min", done: false },
            { id: "s3", name: "Séance 3 — Gainage & Renforcement", exos: 4, duree: "30 min", done: false }
          ],
          history: client.history || [{ name: "Semaine 1", done: 0, total: 3 }]
        },
        dailyWaterLog: client.dailyWaterLog || { date: new Date().toDateString(), amount: 1500 },
        weightHistory: client.weightHistory || []
      };

      state.clientProfile = clientWithProg;
      state.simulationActive = true;
      state.role = "client";
      state.page = "client-dashboard";
      persistState();
      render();
    }
    return;
  }

  const cancelWorkoutBtn = e.target.closest("#btn-cancel-workout") || e.target.closest("#btn-cancel-workout-btn");
  if (cancelWorkoutBtn) {
    state.activeSession = "";
    state.activeSessionSeconds = 0;
    render();
    return;
  }

  const sessionActionBtn = e.target.closest("[data-session-action]");
  if (sessionActionBtn) {
    const action = sessionActionBtn.dataset.sessionAction;
    const sessionName = sessionActionBtn.dataset.sessionName || "";
    state.activeSession = sessionName;
    state.activeSessionSeconds = 0; // Réinitialiser le chronomètre de séance
    if (action === 'start' || action === 'review') {
      navigate('client-program');
      return;
    }
  }

  // Permettre l'accès direct aux fiches clients même si on ne clique pas sur un bouton à action globale admin
  const viewClientBtn = e.target.closest("[data-view-client]");
  if (viewClientBtn) {
    const identifier = (viewClientBtn.dataset.viewClient || "").trim();
    if (identifier) {
      const clients = state.adminData.allUsers || state.adminData.clients || [];
      const foundClient = clients.find(c => 
        (c.id && c.id === identifier) || 
        (c.uid && c.uid === identifier) || 
        (c.email && c.email.toLowerCase().trim() === identifier.toLowerCase())
      );
      if (foundClient) {
        const { showClientDetailsModal } = await import("./pages/admin.js");
        showClientDetailsModal(foundClient);
      } else {
        alert("Fiche client introuvable.");
      }
    }
    return;
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
    if (action === "add-admin") {
      const SUPER_ADMIN_EMAIL = "djabarbakari.032003@gmail.com";
      const authEmail = (auth.currentUser?.email || "").toLowerCase().trim();
      const backupEmail = (state.adminClientProfileBackup?.email || "").toLowerCase().trim();
      const clientEmail = (state.clientProfile?.email || "").toLowerCase().trim();
      const isSuperAdmin = (authEmail === SUPER_ADMIN_EMAIL.toLowerCase()) || 
                          (backupEmail === SUPER_ADMIN_EMAIL.toLowerCase()) ||
                          (!state.simulationActive && clientEmail === SUPER_ADMIN_EMAIL.toLowerCase());

      if (!isSuperAdmin) {
        state.adminNotice = "Seul l'administrateur principal (djabarbakari.032003@gmail.com) peut ajouter de nouveaux administrateurs.";
        render();
        return;
      }

      const input = document.getElementById("input-new-admin-email");
      const email = input ? input.value.trim().toLowerCase() : "";
      if (!email || !email.includes("@")) {
        state.adminNotice = "Veuillez saisir une adresse e-mail valide.";
        render();
        return;
      }

      try {
        // 1. Sauvegarde explicite dans la collection admin_emails
        await setDoc(doc(db, "admin_emails", email), {
          email: email,
          role: "admin",
          addedBy: currentUserEmail,
          createdAt: new Date().toISOString()
        });

        // 2. Promotion de l'utilisateur s'il existe déjà dans users
        try {
          const usersSnap = await getDocs(collection(db, "users"));
          for (const uDoc of usersSnap.docs) {
            const uData = uDoc.data();
            if (uData.email && uData.email.toLowerCase().trim() === email) {
              await updateDoc(doc(db, "users", uDoc.id), { role: "admin" });
            }
          }
        } catch (uErr) {
          console.warn("Mise à jour collection users:", uErr);
        }

        // 3. Mise à jour immédiate de l'état local
        if (!state.adminData.admins) state.adminData.admins = [];
        if (!state.adminData.admins.some(a => (a.email || "").toLowerCase().trim() === email)) {
          state.adminData.admins.push({ email, role: "admin" });
        }
        state.adminNotice = `Succès : ${email} a été promu administrateur avec succès.`;

        // Réinitialiser le champ de saisie
        if (input) input.value = "";

        await refreshAdminData();
        render();
      } catch (err) {
        console.warn("Mise à jour Firestore partagée/hors-ligne, application locale :", err);
        if (!state.adminData.admins) state.adminData.admins = [];
        if (!state.adminData.admins.some(a => (a.email || "").toLowerCase().trim() === email)) {
          state.adminData.admins.push({ email, role: "admin" });
        }
        state.adminNotice = `Succès : ${email} a été ajouté comme administrateur (mode local).`;
        if (input) input.value = "";
        render();
      }
      return;
    }
    if (action === "revoke-admin") {
      const SUPER_ADMIN_EMAIL = "djabarbakari.032003@gmail.com";
      const authEmail = (auth.currentUser?.email || "").toLowerCase().trim();
      const backupEmail = (state.adminClientProfileBackup?.email || "").toLowerCase().trim();
      const clientEmail = (state.clientProfile?.email || "").toLowerCase().trim();
      const isSuperAdmin = (authEmail === SUPER_ADMIN_EMAIL.toLowerCase()) || 
                          (backupEmail === SUPER_ADMIN_EMAIL.toLowerCase()) ||
                          (!state.simulationActive && clientEmail === SUPER_ADMIN_EMAIL.toLowerCase());

      if (!isSuperAdmin) {
        state.adminNotice = "Seul l'administrateur principal (djabarbakari.032003@gmail.com) peut révoquer des administrateurs.";
        render();
        return;
      }

      const targetEmail = (adminActionBtn.dataset.adminEmail || "").trim().toLowerCase();
      if (!targetEmail || targetEmail === SUPER_ADMIN_EMAIL.toLowerCase()) {
        state.adminNotice = "Impossible de révoquer l'administrateur principal.";
        render();
        return;
      }

      try {
        // 1. Suppression de la collection admin_emails
        try {
          await deleteDoc(doc(db, "admin_emails", targetEmail));
        } catch (e) {
          console.warn("Suppression admin_emails:", e);
        }

        // 2. Rétrogradation dans users
        try {
          const usersSnap = await getDocs(collection(db, "users"));
          for (const uDoc of usersSnap.docs) {
            const uData = uDoc.data();
            if (uData.email && uData.email.toLowerCase().trim() === targetEmail) {
              await updateDoc(doc(db, "users", uDoc.id), { role: "client" });
            }
          }
        } catch (e) {
          console.warn("Rétrogradation users:", e);
        }

        state.adminData.admins = (state.adminData.admins || []).filter(a => (a.email || "").toLowerCase().trim() !== targetEmail);
        state.adminNotice = `Succès : Les droits d'administration de ${targetEmail} ont été révoqués.`;

        await refreshAdminData();
        render();
      } catch (err) {
        console.warn("Révocation hors-ligne :", err);
        state.adminData.admins = (state.adminData.admins || []).filter(a => (a.email || "").toLowerCase().trim() !== targetEmail);
        state.adminNotice = `Révocation appliquée pour ${targetEmail}.`;
        render();
      }
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
    const phone = (card.querySelector('[data-signup-phone]') || {}).value.trim();
    const password = (card.querySelector('[data-signup-password]') || {}).value || "";
    const emailValid = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);

    state.drafts.signup.firstName = firstName;
    state.drafts.signup.lastName = lastName;
    state.drafts.signup.email = email;
    state.drafts.signup.phone = phone;
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

      // 2. Détermination du rôle (admin si super admin ou pré-autorisé)
      let assignedRole = "client";
      const signupEmailLower = email.toLowerCase().trim();
      if (signupEmailLower === "djabarbakari.032003@gmail.com") {
        assignedRole = "admin";
      } else {
        try {
          const adminEmailDocRef = doc(db, "admin_emails", signupEmailLower);
          const adminEmailDocSnap = await getDoc(adminEmailDocRef);
          if (adminEmailDocSnap.exists()) {
            assignedRole = "admin";
          }
        } catch (e) {
          console.warn("Erreur vérification role inscription via admin_emails:", e);
        }
      }

      await setDoc(doc(db, "users", user.uid), {
        firstName,
        lastName,
        email,
        phone,
        role: assignedRole,
        createdAt: new Date().toISOString(),
      });

      // 3. Mise à jour de l'état global et redirection
      state.clientProfile = { firstName, lastName, email, phone, uid: user.uid, role: assignedRole };
      state.role = assignedRole;
      state.drafts.signup.password = "";
      state.ui.signupPending = false;
      state.ui.signupError = "";

      persistState();
      navigate(assignedRole === "admin" ? "admin-dashboard" : "quiz");
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
      // Vérification si l'utilisateur est enregistré dans la base de données Firestore
      const emailLower = email.toLowerCase().trim();
      let isAllowedDirectly = emailLower === "djabarbakari.032003@gmail.com" || emailLower === "test.client@monprogrammefit.com";
      if (!isAllowedDirectly) {
        try {
          const adminEmailDocRef = doc(db, "admin_emails", emailLower);
          const adminEmailDocSnap = await getDoc(adminEmailDocRef);
          if (adminEmailDocSnap.exists()) {
            isAllowedDirectly = true;
          }
        } catch (e) {
          console.warn("Erreur vérification admin_emails:", e);
        }
      }

      if (!isAllowedDirectly) {
        const q1 = query(collection(db, "users"), where("email", "==", email));
        const q2 = query(collection(db, "users"), where("email", "==", emailLower));
        const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);
        if (snap1.empty && snap2.empty) {
          state.ui.loginPending = false;
          state.ui.signupError = "Aucun compte n'est enregistré avec cette adresse e-mail. Veuillez créer un compte.";
          state.drafts.signup.email = email;
          state.ui.loginError = "";
          persistState();
          navigate("signup");
          render();
          return;
        }
      }

      // 1. Connexion via Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Lecture du rôle réel et des données depuis la collection "users" dans Firestore
      let userRole = "client";
      let userProfile = { email: user.email, uid: user.uid };

      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists() && userRole !== "admin" && user.email !== "djabarbakari.032003@gmail.com") {
        await signOut(auth);
        state.ui.loginPending = false;
        state.ui.signupError = "Aucun compte n'est enregistré avec cette adresse e-mail. Veuillez créer un compte.";
        state.drafts.signup.email = email;
        state.ui.loginError = "";
        persistState();
        navigate("signup");
        render();
        return;
      }

      if (userDocSnap.exists()) {
        const data = userDocSnap.data();
        userRole = data.role || "client";
        const physique = {
          poids: data.weight !== undefined ? data.weight : (data.physique?.poids || null),
          taille: data.height !== undefined ? data.height : (data.physique?.taille || null),
          age: data.age !== undefined ? data.age : (data.physique?.age || null),
          remarques: data.medicalNotes !== undefined ? data.medicalNotes : (data.physique?.remarques || ""),
        };
        userProfile = { ...userProfile, ...data, physique };
      }

      const loginEmailLower = (user.email || "").toLowerCase().trim();
      if (loginEmailLower === "djabarbakari.032003@gmail.com") {
        userRole = "admin";
      } else if (userRole !== "admin" && loginEmailLower) {
        try {
          const adminEmailDocRef = doc(db, "admin_emails", loginEmailLower);
          const adminEmailDocSnap = await getDoc(adminEmailDocRef);
          if (adminEmailDocSnap.exists()) {
            userRole = "admin";
            await setDoc(userDocRef, { role: "admin", email: user.email }, { merge: true });
          }
        } catch (e) {
          console.warn("Login check admin error:", e);
        }
      }

      userProfile.role = userRole;

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

  const googleAuthBtn = e.target.closest("[data-google-auth]");
  if (googleAuthBtn) {
    state.ui.googleAuthPending = true;
    state.ui.loginError = "";
    state.ui.signupError = "";
    render();

    try {
      const googleProvider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, googleProvider);
      const user = userCredential.user;

      const nameParts = (user.displayName || "").trim().split(" ");
      const firstName = nameParts[0] || "Utilisateur";
      const lastName = nameParts.slice(1).join(" ") || "";

      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      let userRole = "client";
      let userProfile = { email: user.email, uid: user.uid, firstName, lastName, photoURL: user.photoURL || null };

      if (userDocSnap.exists()) {
        const data = userDocSnap.data();
        userRole = data.role || "client";
        const physique = {
          poids: data.weight !== undefined ? data.weight : (data.physique?.poids || null),
          taille: data.height !== undefined ? data.height : (data.physique?.taille || null),
          age: data.age !== undefined ? data.age : (data.physique?.age || null),
          remarques: data.medicalNotes !== undefined ? data.medicalNotes : (data.physique?.remarques || ""),
        };
        userProfile = { ...userProfile, ...data, physique };
      }

      if (user.photoURL) {
        userProfile.photoURL = user.photoURL;
      }

      const googleEmailLower = (user.email || "").toLowerCase().trim();
      if (googleEmailLower === "djabarbakari.032003@gmail.com") {
        userRole = "admin";
      } else if (userRole !== "admin" && googleEmailLower) {
        try {
          const adminEmailDocRef = doc(db, "admin_emails", googleEmailLower);
          const adminEmailDocSnap = await getDoc(adminEmailDocRef);
          if (adminEmailDocSnap.exists()) {
            userRole = "admin";
          }
        } catch (e) {
          console.warn("Google auth check admin error via admin_emails:", e);
        }
      }

      userProfile.role = userRole;

      await setDoc(userDocRef, {
        firstName,
        lastName,
        email: user.email,
        role: userRole,
        photoURL: user.photoURL || null,
        createdAt: userDocSnap.exists() ? (userDocSnap.data().createdAt || new Date().toISOString()) : new Date().toISOString(),
      }, { merge: true });

      state.role = userRole;
      state.clientProfile = userProfile;
      state.ui.googleAuthPending = false;
      state.ui.loginError = "";
      state.ui.signupError = "";

      persistState();

      if (!userDocSnap.exists() && userRole !== "admin") {
        navigate("quiz");
      } else {
        navigate(userRole === "admin" ? "admin-dashboard" : "client-dashboard");
      }
    } catch (error) {
      state.ui.googleAuthPending = false;
      const readableErr = getReadableAuthError(error);
      state.ui.loginError = readableErr;
      state.ui.signupError = readableErr;
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
  const openEditProfileBtn = e.target.closest("#btn-open-edit-profile") || e.target.closest("#btn-open-edit-sports");
  if (openEditProfileBtn) {
    const { showEditProfileModal } = await import("./pages/privacy.js");
    showEditProfileModal();
    return;
  }

  const resetPwBtn = e.target.closest("#btn-request-password-reset");
  if (resetPwBtn) {
    const { sendPasswordReset } = await import("./modules/privacy.js");
    const result = await sendPasswordReset();
    if (result && result.success) {
      const email = auth.currentUser?.email || state.clientProfile?.email || "votre adresse email";
      showPasswordResetSuccessModal(email);
    }
    return;
  }

  const forgotPwBtn = e.target.closest("#btn-forgot-password-link");
  if (forgotPwBtn) {
    showForgotPasswordModal();
    return;
  }

  const togglePwInfoBtn = e.target.closest("#btn-toggle-password-view-info");
  if (togglePwInfoBtn) {
    const infoDiv = document.getElementById("password-security-info");
    if (infoDiv) {
      infoDiv.style.display = infoDiv.style.display === "none" ? "block" : "none";
    }
    return;
  }

  const openChangePwModalBtn = e.target.closest("#btn-open-change-password-modal");
  if (openChangePwModalBtn) {
    showChangePasswordModal();
    return;
  }

  const cancelDelBtn = e.target.closest("#btn-cancel-account-deletion");
  if (cancelDelBtn) {
    const { cancelAccountDeletion } = await import("./modules/privacy.js");
    await cancelAccountDeletion();
    render();
    return;
  }

  const privacyDeleteBtn = e.target.closest("[data-privacy-delete]");
  if (privacyDeleteBtn) {
    const type = privacyDeleteBtn.dataset.privacyDelete;
    if (type === "account") {
      showAccountDeletionOptionsModal();
    } else {
      showPrivacyConfirmModal(type);
    }
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

  // === EVENTS HYDRATATION CLIENT ===
  const waterAdd250 = e.target.closest("#btn-water-add-250");
  if (waterAdd250) {
    const profile = state.clientProfile || {};
    const todayStr = new Date().toDateString();
    if (!profile.dailyWaterLog || profile.dailyWaterLog.date !== todayStr) {
      profile.dailyWaterLog = { date: todayStr, amount: 0 };
    }
    profile.dailyWaterLog.amount = (profile.dailyWaterLog.amount || 0) + 250;
    
    const { updateUserProfile } = await import("./modules/privacy.js");
    const { render } = await import("./render.js");
    await updateUserProfile({ dailyWaterLog: profile.dailyWaterLog });
    render();
    return;
  }

  const waterAdd500 = e.target.closest("#btn-water-add-500");
  if (waterAdd500) {
    const profile = state.clientProfile || {};
    const todayStr = new Date().toDateString();
    if (!profile.dailyWaterLog || profile.dailyWaterLog.date !== todayStr) {
      profile.dailyWaterLog = { date: todayStr, amount: 0 };
    }
    profile.dailyWaterLog.amount = (profile.dailyWaterLog.amount || 0) + 500;
    
    const { updateUserProfile } = await import("./modules/privacy.js");
    const { render } = await import("./render.js");
    await updateUserProfile({ dailyWaterLog: profile.dailyWaterLog });
    render();
    return;
  }

  const waterReset = e.target.closest("#btn-water-reset");
  if (waterReset) {
    if (confirm("Voulez-vous réinitialiser votre hydratation du jour ?")) {
      const profile = state.clientProfile || {};
      const todayStr = new Date().toDateString();
      profile.dailyWaterLog = { date: todayStr, amount: 0 };
      
      const { updateUserProfile } = await import("./modules/privacy.js");
      const { render } = await import("./render.js");
      await updateUserProfile({ dailyWaterLog: profile.dailyWaterLog });
      render();
    }
    return;
  }

  const quickMetricsBtn = e.target.closest("#btn-quick-update-metrics");
  if (quickMetricsBtn) {
    showQuickMetricsModal();
    return;
  }
});

/**
 * Intercepteur de soumission globale de formulaires pour le log de poids.
 */
document.addEventListener("submit", async (e) => {
  if (e.target && e.target.id === "form-submit-workout-session") {
    e.preventDefault();
    const notesInput = document.getElementById("workout-notes-input");
    const notes = notesInput ? notesInput.value.trim() : "";
    
    const profile = state.clientProfile || {};
    const program = profile.program || {};
    const sessions = program.sessions || [];
    const activeSessionName = state.activeSession;
    
    // Marquer la séance comme faite
    const sessionObj = sessions.find(s => s.name === activeSessionName);
    if (sessionObj) {
      sessionObj.done = true;
    }
    
    // Mettre à jour l'avancement de la semaine courante
    const history = program.history || [];
    const currentWeekNumber = program.week || 1;
    const currentWeekName = `Semaine ${currentWeekNumber}`;
    let weekHistoryObj = history.find(h => h.name === currentWeekName);
    if (weekHistoryObj) {
      weekHistoryObj.done = Math.min(weekHistoryObj.total, weekHistoryObj.done + 1);
    } else {
      weekHistoryObj = { name: currentWeekName, done: 1, total: 3 };
      history.push(weekHistoryObj);
    }
    
    // Si toutes les séances de la semaine sont validées, passer à la semaine suivante
    const allDone = sessions.every(s => s.done);
    if (allDone) {
      program.week = (program.week || 1) + 1;
      // Régénérer de nouvelles séances pour la nouvelle semaine
      program.sessions = [
        { id: "s1", name: `Séance 1 — Progression intensive S${program.week}`, exos: 5, duree: "45 min", done: false, weekNumber: program.week },
        { id: "s2", name: `Séance 2 — Force & Volume S${program.week}`, exos: 6, duree: "50 min", done: false, weekNumber: program.week },
        { id: "s3", name: `Séance 3 — Métabolique S${program.week}`, exos: 5, duree: "40 min", done: false, weekNumber: program.week },
      ];
      // Ajouter la nouvelle semaine dans l'historique de progression
      history.push({ name: `Semaine ${program.week}`, done: 0, total: 3 });
    }
    
    const { updateUserProfile } = await import("./modules/privacy.js");
    const { render } = await import("./render.js");
    
    program.history = history;
    profile.program = program;
    state.clientProfile = profile;
    state.activeSession = "";
    state.activeSessionSeconds = 0;
    
    if (auth.currentUser && !state.simulationActive) {
      await updateUserProfile({
        program: program
      });
    }
    
    persistState();
    render();
    alert("Entraînement enregistré avec succès ! Félicitations pour vos efforts ! 🎉🏆");
    navigate("client-progress");
    return;
  }

  if (e.target && e.target.id === "form-log-weight") {
    e.preventDefault();
    const input = document.getElementById("input-log-weight");
    if (!input) return;
    const val = parseFloat(input.value);
    if (isNaN(val) || val <= 0) return;

    const { updateUserProfile } = await import("./modules/privacy.js");
    const { render } = await import("./render.js");

    const profile = state.clientProfile || {};
    const history = profile.weightHistory || [];
    const dateStr = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
    history.push({ date: dateStr, weight: val });
    profile.weightHistory = history;

    await updateUserProfile({
      poids: val,
      weightHistory: history
    });

    render();
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

/**
 * Affiche le modal de modification directe du mot de passe.
 */
function showChangePasswordModal() {
  const modal = document.createElement("div");
  modal.id = "change-password-modal";
  modal.style.cssText = `
    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.8); display: flex; align-items: center;
    justify-content: center; z-index: 130; padding: 16px;
  `;

  modal.innerHTML = `
    <div style="
      background: var(--chalk); color: var(--ink);
      border-radius: 6px; padding: 28px; max-width: 440px;
      width: 100%; box-shadow: 0 20px 60px rgba(0,0,0,0.4); border: 1px solid var(--line);
    ">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; border-bottom: 1px solid var(--line); padding-bottom: 12px;">
        <h2 style="margin: 0; font-size: 18px; font-weight: 700;">Changer mon mot de passe</h2>
        <button id="close-change-pw-modal" style="background: none; border: none; font-size: 24px; cursor: pointer; color: var(--slate);">&times;</button>
      </div>

      <form id="change-password-form" style="display: grid; gap: 14px;">
        <div>
          <label style="display: block; font-size: 12px; font-weight: 600; margin-bottom: 4px;">Mot de passe actuel</label>
          <input type="password" name="currentPassword" required class="text-input" style="width: 100%; padding: 10px; border: 1px solid var(--line); border-radius: 4px;" placeholder="•••••••••" />
        </div>

        <div>
          <label style="display: block; font-size: 12px; font-weight: 600; margin-bottom: 4px;">Nouveau mot de passe</label>
          <input type="password" name="newPassword" required class="text-input" style="width: 100%; padding: 10px; border: 1px solid var(--line); border-radius: 4px;" placeholder="•••••••••" />
          <p style="font-size: 11px; color: var(--slate); margin-top: 4px;">Minimum 8 caractères (majuscule, minuscule, chiffre et caractère spécial).</p>
        </div>

        <div id="change-pw-error" style="color: var(--ember); font-size: 12px; display: none;"></div>

        <div style="display: flex; gap: 10px; margin-top: 10px;">
          <button type="button" id="cancel-change-pw-modal" class="btn btn-outline-dark" style="flex: 1; justify-content: center;">Annuler</button>
          <button type="submit" class="btn btn-ember" style="flex: 1; justify-content: center;">Mettre à jour</button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(modal);

  const close = () => modal.remove();
  modal.querySelector("#close-change-pw-modal").addEventListener("click", close);
  modal.querySelector("#cancel-change-pw-modal").addEventListener("click", close);

  modal.querySelector("#change-password-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const currentPassword = e.target.currentPassword.value;
    const newPassword = e.target.newPassword.value;
    const errorDiv = modal.querySelector("#change-pw-error");

    const validationError = validatePasswordComplexity(newPassword);
    if (validationError) {
      errorDiv.textContent = validationError;
      errorDiv.style.display = "block";
      return;
    }

    const { updateUserPassword } = await import("./modules/privacy.js");
    const result = await updateUserPassword(currentPassword, newPassword);

    if (result.success) {
      modal.remove();
      render();
    } else {
      errorDiv.textContent = result.error || "Erreur lors de la modification du mot de passe.";
      errorDiv.style.display = "block";
    }
  });
}

/**
 * Affiche le modal d'options pour la suppression du compte (Délai de grâce vs Immédiat).
 */
function showAccountDeletionOptionsModal() {
  if (state.role === "admin") {
    alert("Action impossible : Les comptes administrateurs ne peuvent pas être supprimés pour des raisons de sécurité.");
    return;
  }

  const modal = document.createElement("div");
  modal.id = "account-deletion-options-modal";
  modal.style.cssText = `
    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.8); display: flex; align-items: center;
    justify-content: center; z-index: 130; padding: 16px;
  `;

  modal.innerHTML = `
    <div style="
      background: var(--chalk); color: var(--ink);
      border-radius: 6px; padding: 28px; max-width: 500px;
      width: 100%; box-shadow: 0 20px 60px rgba(0,0,0,0.4); border: 1px solid var(--line);
    ">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; border-bottom: 1px solid var(--line); padding-bottom: 12px;">
        <h2 style="margin: 0; font-size: 18px; font-weight: 700; color: var(--ember); display: flex; align-items: center; gap: 8px;">
          ⚠ Option de suppression du compte
        </h2>
        <button id="close-del-opt-modal" style="background: none; border: none; font-size: 24px; cursor: pointer; color: var(--slate);">&times;</button>
      </div>

      <p style="font-size: 14px; color: var(--slate); margin-bottom: 20px; line-height: 1.5;">
        Choisissez la modalité de suppression de votre compte et de l'ensemble de vos données :
      </p>

      <div style="display: grid; gap: 16px;">
        <!-- OPTION 1: DÉLAI DE GRÂCE 7 JOURS (RECOMMANDÉ) -->
        <div style="border: 1.5px solid var(--moss); background: rgba(60,150,80,0.05); padding: 16px; border-radius: 6px;">
          <div style="font-weight: 700; font-size: 15px; color: var(--ink); margin-bottom: 4px; display: flex; justify-content: space-between; align-items: center;">
            1. Programmer la suppression (Délai de grâce 7 jours)
            <span style="font-size: 11px; background: var(--moss); color: white; padding: 2px 8px; border-radius: 12px; font-weight: 600;">Recommandé</span>
          </div>
          <p style="font-size: 13px; color: var(--slate); margin: 0 0 12px 0; line-height: 1.4;">
            Vos données sont conservées pendant 7 jours. Pendant cette période, vous gardez la possibilité de vous connecter pour <strong>annuler la suppression et restaurer votre compte en 1 clic</strong>.
          </p>
          <button id="btn-schedule-del-7d" class="btn btn-outline-dark" style="width: 100%; justify-content: center; font-weight: 600;">
            Programmer la suppression dans 7 jours (Récupérable)
          </button>
        </div>

        <!-- OPTION 2: SUPPRESSION IMMÉDIATE SANS DÉLAI -->
        <div style="border: 1.5px solid var(--ember-soft); background: rgba(224,70,50,0.05); padding: 16px; border-radius: 6px;">
          <div style="font-weight: 700; font-size: 15px; color: var(--ember); margin-bottom: 4px;">
            2. Supprimer immédiatement et sans délai (Définitif)
          </div>
          <p style="font-size: 13px; color: var(--slate); margin: 0 0 12px 0; line-height: 1.4;">
            Suppression immédiate et irréversible de votre compte, de votre profil et de votre historique de la base de données.
          </p>
          <button id="btn-delete-immediate" class="btn" style="background: var(--ember); color: white; width: 100%; justify-content: center; font-weight: 600;">
            Supprimer immédiatement sans délai
          </button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  modal.querySelector("#close-del-opt-modal").addEventListener("click", () => modal.remove());

  modal.querySelector("#btn-schedule-del-7d").addEventListener("click", async () => {
    modal.remove();
    const { scheduleAccountDeletion } = await import("./modules/privacy.js");
    await scheduleAccountDeletion(7);
    render();
  });

  modal.querySelector("#btn-delete-immediate").addEventListener("click", async () => {
    if (confirm("DERNIÈRE CONFIRMATION : Êtes-vous certain de vouloir supprimer votre compte immédiatement ? Cette action est irréversible et sans délai.")) {
      modal.remove();
      const { deleteAccountImmediately } = await import("./modules/privacy.js");
      await deleteAccountImmediately();
    }
  });
}

/**
 * Affiche le modal d'avertissement Spam après envoi du lien de réinitialisation.
 */
export function showPasswordResetSuccessModal(email) {
  const modal = document.createElement("div");
  modal.id = "password-reset-success-modal";
  modal.style.cssText = `
    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.8); display: flex; align-items: center;
    justify-content: center; z-index: 150; padding: 16px;
  `;

  modal.innerHTML = `
    <div style="
      background: var(--chalk); color: var(--ink);
      border-radius: 8px; padding: 32px; max-width: 480px;
      width: 100%; box-shadow: 0 24px 64px rgba(0,0,0,0.35); border: 1px solid var(--line);
      text-align: center;
    ">
      <div style="width: 56px; height: 56px; background: var(--ember-soft); color: var(--ember); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 18px; font-size: 24px;">
        ⚠️
      </div>
      <h2 style="margin: 0 0 12px; font-family: 'Archivo Black', sans-serif; font-size: 20px; color: var(--ink);">Lien envoyé avec succès !</h2>
      <p style="font-size: 14px; color: var(--slate); line-height: 1.6; margin: 0 0 16px;">
        Un e-mail de réinitialisation/définition de mot de passe a été envoyé à l'adresse :<br>
        <strong style="color: var(--ink); font-weight: 600;">${email}</strong>
      </p>

      <div style="background: #FFF9E6; border: 1px solid #FFE494; border-radius: 6px; padding: 16px; text-align: left; margin-bottom: 24px;">
        <h4 style="margin: 0 0 6px; font-size: 13px; font-weight: 700; color: #856404; display: flex; align-items: center; gap: 6px;">
          <span>📨</span> Attention dossier Spam / Courriers Indésirables !
        </h4>
        <p style="margin: 0; font-size: 12px; color: #856404; line-height: 1.5;">
          Les e-mails automatiques de réinitialisation de mot de passe sont fréquemment filtrés et peuvent arriver directement dans vos <strong>spams</strong> ou votre dossier <strong>promotions</strong> (particulièrement sur Gmail, Yahoo, Hotmail). 
        </p>
        <p style="margin: 6px 0 0; font-size: 12px; color: #856404; line-height: 1.5;">
          <strong>Veuillez vérifier vos indésirables</strong> et marquer l'e-mail comme <em>"Non indésirable"</em> pour recevoir nos futurs suivis de coaching normalement.
        </p>
      </div>

      <button id="close-reset-success-modal" class="btn btn-ember" style="width: 100%; justify-content: center; padding: 12px; font-weight: 600; font-size: 14px; border-radius: 6px;">
        J'ai compris, je vais vérifier
      </button>
    </div>
  `;

  document.body.appendChild(modal);

  const close = () => modal.remove();
  modal.querySelector("#close-reset-success-modal").addEventListener("click", close);
  modal.addEventListener("click", (ev) => {
    if (ev.target === modal) close();
  });
}

/**
 * Affiche le modal d'envoi de lien de réinitialisation de mot de passe oublié.
 */
export function showForgotPasswordModal() {
  const modal = document.createElement("div");
  modal.id = "forgot-password-modal";
  modal.style.cssText = `
    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.8); display: flex; align-items: center;
    justify-content: center; z-index: 140; padding: 16px;
  `;

  modal.innerHTML = `
    <div style="
      background: var(--chalk); color: var(--ink);
      border-radius: 8px; padding: 28px; max-width: 440px;
      width: 100%; box-shadow: 0 24px 64px rgba(0,0,0,0.35); border: 1px solid var(--line);
    ">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; border-bottom: 1px solid var(--line); padding-bottom: 12px;">
        <h2 style="margin: 0; font-size: 18px; font-weight: 700; font-family: 'Archivo Black', sans-serif;">Mot de passe oublié ?</h2>
        <button id="close-forgot-pw-modal" style="background: none; border: none; font-size: 24px; cursor: pointer; color: var(--slate); font-weight: bold;">&times;</button>
      </div>

      <form id="forgot-password-form" style="display: grid; gap: 14px;">
        <p style="font-size: 13px; color: var(--slate); line-height: 1.5; margin: 0;">
          Saisissez votre adresse e-mail pour recevoir un lien vous permettant de définir un nouveau mot de passe sécurisé.
        </p>

        <div>
          <label style="display: block; font-size: 12px; font-weight: 600; margin-bottom: 6px;">Adresse e-mail de votre compte</label>
          <input type="email" id="forgot-pw-email" required class="text-input" style="width: 100%; padding: 10px; border: 1px solid var(--line); border-radius: 4px;" placeholder="exemple@domaine.com" />
        </div>

        <div id="forgot-pw-error" style="color: var(--ember); font-size: 12px; display: none;"></div>

        <div style="display: flex; gap: 10px; margin-top: 10px;">
          <button type="button" id="cancel-forgot-pw-modal" class="btn btn-outline-dark" style="flex: 1; justify-content: center;">Annuler</button>
          <button type="submit" id="btn-submit-forgot-pw" class="btn btn-ember" style="flex: 1; justify-content: center;">Envoyer le lien</button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(modal);

  const close = () => modal.remove();
  modal.querySelector("#close-forgot-pw-modal").addEventListener("click", close);
  modal.querySelector("#cancel-forgot-pw-modal").addEventListener("click", close);

  modal.querySelector("#forgot-password-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("forgot-pw-email").value.trim();
    if (!email) return;

    const submitBtn = document.getElementById("btn-submit-forgot-pw");
    submitBtn.disabled = true;
    submitBtn.textContent = "Envoi...";

    const { sendPasswordResetEmail } = await import("firebase/auth");
    const { auth } = await import("./firebase.js");

    try {
      await sendPasswordResetEmail(auth, email);
      modal.remove();
      showPasswordResetSuccessModal(email);
    } catch (err) {
      console.error(err);
      const errorDiv = document.getElementById("forgot-pw-error");
      errorDiv.style.display = "block";
      errorDiv.textContent = "Erreur: Adresse introuvable ou invalide.";
      submitBtn.disabled = false;
      submitBtn.textContent = "Envoyer le lien";
    }
  });
}

/**
 * Affiche le modal de mise à jour rapide des mensurations sportives.
 */
export function showQuickMetricsModal() {
  const profile = state.clientProfile || {};
  const physique = profile.physique || {};
  const weight = physique.poids || profile.weight || "";
  const height = physique.taille || profile.height || "";
  const age = physique.age || profile.age || "";

  const modal = document.createElement("div");
  modal.id = "quick-metrics-modal";
  modal.style.cssText = `
    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.8); display: flex; align-items: center;
    justify-content: center; z-index: 140; padding: 16px;
  `;

  modal.innerHTML = `
    <div style="
      background: var(--chalk); color: var(--ink);
      border-radius: 8px; padding: 28px; max-width: 400px;
      width: 100%; box-shadow: 0 24px 64px rgba(0,0,0,0.35); border: 1px solid var(--line);
    ">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; border-bottom: 1px solid var(--line); padding-bottom: 12px;">
        <h2 style="margin: 0; font-size: 18px; font-weight: 700; font-family: 'Archivo Black', sans-serif;">Mensurations Fitness</h2>
        <button id="close-metrics-modal" style="background: none; border: none; font-size: 24px; cursor: pointer; color: var(--slate); font-weight: bold;">&times;</button>
      </div>

      <form id="quick-metrics-form" style="display: grid; gap: 14px;">
        <p style="font-size: 13px; color: var(--slate); line-height: 1.5; margin: 0;">
          Ces données permettent de calculer votre métabolisme et d'ajuster l'intensité de vos entraînements.
        </p>

        <div>
          <label style="display: block; font-size: 12px; font-weight: 600; margin-bottom: 4px;">Poids (kg)</label>
          <input type="number" step="0.1" name="weight" required class="text-input" style="width: 100%; padding: 10px; border: 1px solid var(--line); border-radius: 4px;" value="${weight}" placeholder="Ex: 74.5" />
        </div>

        <div>
          <label style="display: block; font-size: 12px; font-weight: 600; margin-bottom: 4px;">Taille (cm)</label>
          <input type="number" step="1" name="height" required class="text-input" style="width: 100%; padding: 10px; border: 1px solid var(--line); border-radius: 4px;" value="${height}" placeholder="Ex: 178" />
        </div>

        <div>
          <label style="display: block; font-size: 12px; font-weight: 600; margin-bottom: 4px;">Âge (ans)</label>
          <input type="number" step="1" name="age" required class="text-input" style="width: 100%; padding: 10px; border: 1px solid var(--line); border-radius: 4px;" value="${age}" placeholder="Ex: 28" />
        </div>

        <div style="display: flex; gap: 10px; margin-top: 10px;">
          <button type="button" id="cancel-metrics-modal" class="btn btn-outline-dark" style="flex: 1; justify-content: center;">Annuler</button>
          <button type="submit" class="btn btn-ember" style="flex: 1; justify-content: center;">Mettre à jour</button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(modal);

  const close = () => modal.remove();
  modal.querySelector("#close-metrics-modal").addEventListener("click", close);
  modal.querySelector("#cancel-metrics-modal").addEventListener("click", close);

  modal.querySelector("#quick-metrics-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const w = parseFloat(e.target.weight.value);
    const h = parseInt(e.target.height.value);
    const a = parseInt(e.target.age.value);

    const { updateUserProfile } = await import("./modules/privacy.js");
    const { render } = await import("./render.js");
    
    // Log weight to weightHistory if changed
    const currentWeight = parseFloat(profile.physique?.poids || profile.weight || 0);
    if (w !== currentWeight) {
      const history = profile.weightHistory || [];
      const dateStr = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
      history.push({ date: dateStr, weight: w });
      profile.weightHistory = history;
    }

    await updateUserProfile({
      poids: w,
      taille: h,
      age: a
    });

    modal.remove();
    render();
  });
}
