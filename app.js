/* ==========================================================
   app.js — Point d'entrée. Charge tous les modules et démarre l'app.
   Nécessite <script type="module" src="app.js"> dans index.html.
   ========================================================== */

import { restorePersistedState, persistState } from "./js/state.js";
import { setRenderer, handleBackNavigation } from "./js/router.js";
import { render } from "./js/render.js";
import { PAGES } from "./js/pages/index.js";
import "./js/events.js"; // enregistre les écouteurs globaux (input/click)
import {
  cleanupExpiredData,
  hasAnalyticsServices,
  getAnalyticsConsent,
} from "./js/modules/privacy.js";
import { renderConsentModal } from "./js/modules/consent-modal.js";

import { auth, db } from "./js/firebase.js";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, collection, getDocs, query, where } from "firebase/firestore";
import { state } from "./js/state.js";

setRenderer(render);

restorePersistedState(Object.keys(PAGES));
window.addEventListener("popstate", handleBackNavigation);
window.addEventListener("pageshow", () => {
  persistState();
});

/**
 * Charge les données Firestore réelles pour le panneau administrateur.
 * Explication : Récupère la liste des clients et des messages pour alimenter les KPIs.
 */
export async function refreshAdminData() {
  if (state.role !== "admin") return;
  state.adminData.loading = true;
  try {
    // 1. Tous les utilisateurs (clients et administrateurs)
    const usersSnap = await getDocs(collection(db, "users"));
    const allUsers = [];
    usersSnap.forEach((docSnap) => {
      allUsers.push({ id: docSnap.id, uid: docSnap.id, ...docSnap.data() });
    });

    // 2. Tous les messages de contact envoyés par les clients/visiteurs
    const messagesSnap = await getDocs(collection(db, "messages"));
    const messages = [];
    messagesSnap.forEach((docSnap) => {
      messages.push({ id: docSnap.id, ...docSnap.data() });
    });

    // Tri chronologique inverse (plus récents en premier)
    messages.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    state.adminData.allUsers = allUsers;

    // 2. Récupération des e-mails d'administrateurs pré-autorisés dans admin_emails
    try {
      const adminEmailsSnap = await getDocs(collection(db, "admin_emails"));
      adminEmailsSnap.forEach((aSnap) => {
        const aData = aSnap.data();
        const aEmail = (aData.email || aSnap.id || "").toLowerCase().trim();
        if (aEmail) {
          const found = allUsers.find(u => (u.email || "").toLowerCase().trim() === aEmail);
          if (found) {
            found.role = "admin";
          } else {
            allUsers.push({
              id: aSnap.id,
              uid: aSnap.id,
              email: aEmail,
              role: "admin",
              preAuthorized: true
            });
          }
        }
      });
    } catch (e) {
      console.warn("Mise en garde chargement collection admin_emails:", e);
    }

    // Conservation des administrateurs ajoutés localement
    (state.adminData.admins || []).forEach(localAdmin => {
      const lEmail = (localAdmin.email || "").toLowerCase().trim();
      if (lEmail && !allUsers.some(u => (u.email || "").toLowerCase().trim() === lEmail)) {
        allUsers.push({
          id: lEmail,
          email: lEmail,
          role: "admin",
          firstName: localAdmin.firstName || "",
          lastName: localAdmin.lastName || ""
        });
      }
    });

    state.adminData.clients = allUsers.filter(u => u.role !== "admin" && (u.email || "").toLowerCase().trim() !== "djabarbakari.032003@gmail.com");
    
    // Construction de la liste des admins dédoublonnée par e-mail
    const adminMap = new Map();
    allUsers.forEach(u => {
      const uEmail = (u.email || "").toLowerCase().trim();
      if (uEmail && (u.role === "admin" || uEmail === "djabarbakari.032003@gmail.com")) {
        if (!adminMap.has(uEmail)) {
          adminMap.set(uEmail, u);
        }
      }
    });

    if (!adminMap.has("djabarbakari.032003@gmail.com")) {
      adminMap.set("djabarbakari.032003@gmail.com", {
        email: "djabarbakari.032003@gmail.com",
        firstName: "Abdou",
        lastName: "BAKARI",
        role: "admin",
        isSuperAdmin: true
      });
    }

    state.adminData.admins = Array.from(adminMap.values());

    state.adminData.messages = messages;
    state.adminData.loaded = true;
    state.adminData.loading = false;
  } catch (err) {
    console.error("Erreur de chargement des données admin Firestore:", err);
    state.adminData.loading = false;
  }
}

// Écouteur d'état d'authentification Firebase (restauration automatique de la session)
onAuthStateChanged(auth, async (user) => {
  if (user) {
    try {
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      let userData = {};
      if (userDocSnap.exists()) {
        userData = userDocSnap.data();
      }

      let userRole = userData.role || "client";
      const userEmailLower = (user.email || "").toLowerCase().trim();

      if (userEmailLower === "djabarbakari.032003@gmail.com") {
        userRole = "admin";
      } else if (userRole !== "admin" && userEmailLower) {
        // Vérification si cet e-mail a été pré-autorisé comme administrateur
        try {
          const adminDocSnap = await getDoc(doc(db, "admin_emails", userEmailLower));
          if (adminDocSnap.exists()) {
            userRole = "admin";
            await setDoc(userDocRef, { role: "admin", email: user.email }, { merge: true });
          } else {
            const adminsQuery = query(collection(db, "users"), where("role", "==", "admin"));
            const adminSnaps = await getDocs(adminsQuery);
            let preAuthFound = false;
            adminSnaps.forEach((aDoc) => {
              const aData = aDoc.data();
              if (aData.email && aData.email.toLowerCase().trim() === userEmailLower) {
                preAuthFound = true;
              }
            });

            if (preAuthFound) {
              userRole = "admin";
              await setDoc(userDocRef, { role: "admin", email: user.email }, { merge: true });
            }
          }
        } catch (e) {
          console.warn("Erreur de vérification admin pré-autorisé:", e);
        }
      }
      state.role = userRole;

      // Récupération des séances réelles depuis la sous-collection users/{uid}/sessions
      const sessionsSnap = await getDocs(collection(db, "users", user.uid, "sessions"));
      const sessions = [];
      sessionsSnap.forEach((sDoc) => {
        sessions.push({ id: sDoc.id, ...sDoc.data() });
      });

      const program = userData.program || {};
      if (sessions.length > 0) {
        program.sessions = sessions;
      }

      // Reconstitution robuste de l'objet physique pour assurer la cohérence et la persistance
      const physique = {
        poids: userData.weight !== undefined ? userData.weight : (userData.physique?.poids || null),
        taille: userData.height !== undefined ? userData.height : (userData.physique?.taille || null),
        age: userData.age !== undefined ? userData.age : (userData.physique?.age || null),
        remarques: userData.medicalNotes !== undefined ? userData.medicalNotes : (userData.physique?.remarques || ""),
      };

      state.clientProfile = {
        ...state.clientProfile,
        ...userData,
        physique,
        email: user.email,
        uid: user.uid,
        program
      };

      if (state.role === "admin") {
        await refreshAdminData();
      }
    } catch (error) {
      console.warn("Impossible d'obtenir les données Firestore:", error);
      state.role = "client";
    }
  } else {
    state.role = "guest";
    state.clientProfile = {};
    state.adminData = { clients: [], messages: [], loaded: false, loading: false };
    if (state.page.startsWith("client") || state.page.startsWith("admin")) {
      state.page = "home";
    }
  }
  render();
});

// 1. Nettoyage automatique des données expirées (14 jours)
cleanupExpiredData();

// 2. Rendu initial
render();

// 3. Bannière de consentement analytics (si services présents et pas encore choisi)
(function initConsentBanner() {
  const consent = getAnalyticsConsent();
  if (hasAnalyticsServices() && !consent.userChoice) {
    const container = document.createElement("div");
    container.innerHTML = renderConsentModal();
    const modal = container.firstElementChild;
    if (modal) {
      document.body.appendChild(modal);
    }
  }
})();
