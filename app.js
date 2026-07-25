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
import { doc, getDoc, collection, getDocs, query, where, onSnapshot, setDoc } from "firebase/firestore";
import { state } from "./js/state.js";
import { TRACKS, COACH_PROGRAMS } from "./js/data.js";

setRenderer(render);

restorePersistedState(Object.keys(PAGES));

// Variable pour stocker le désabonnement des programmes (tracks)
let unsubscribeTracks = null;

/**
 * Charge et écoute en temps réel les parcours / programmes depuis la collection 'tracks' de Firestore.
 * S'il n'y a pas encore de document, utilise les TRACKS statiques d'origine.
 */
export function listenToTracks() {
  if (unsubscribeTracks) {
    unsubscribeTracks();
  }
  unsubscribeTracks = onSnapshot(collection(db, "tracks"), (tracksSnap) => {
    const list = [];
    tracksSnap.forEach(docSnap => {
      list.push({ id: docSnap.id, ...docSnap.data() });
    });
    if (list.length > 0) {
      // Trier par id ou garder l'ordre d'origine
      const order = ["gym", "home-equip", "bodyweight"];
      list.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
      state.tracks = list;
    } else {
      state.tracks = [...TRACKS];
    }
    persistState();
    render();
  }, (err) => {
    console.warn("Firestore tracks loading in real-time failed, using static fallback:", err);
    state.tracks = [...TRACKS];
  });
}

// Variable pour stocker le désabonnement des programmes officiels du coach
let unsubscribeCoachPrograms = null;

/**
 * Charge et écoute en temps réel les programmes officiels du coach depuis la collection 'coach_programs' de Firestore.
 * S'il n'y a pas de documents, utilise les COACH_PROGRAMS statiques et les initialise dans Firestore si admin.
 */
export function listenToCoachPrograms() {
  if (unsubscribeCoachPrograms) {
    unsubscribeCoachPrograms();
  }
  unsubscribeCoachPrograms = onSnapshot(collection(db, "coach_programs"), (progSnap) => {
    const list = [];
    progSnap.forEach(docSnap => {
      list.push({ id: docSnap.id, ...docSnap.data() });
    });
    if (list.length > 0) {
      // Met à jour COACH_PROGRAMS en place pour propager à tous les modules
      COACH_PROGRAMS.length = 0;
      COACH_PROGRAMS.push(...list);
      state.coachPrograms = [...COACH_PROGRAMS];
    } else {
      state.coachPrograms = [...COACH_PROGRAMS];
      // Si on est admin et que la collection est vide, on l'initialise dans Firestore
      if (state.role === "admin" && COACH_PROGRAMS.length > 0) {
        console.log("Initialisation des coach_programs dans Firestore...");
        COACH_PROGRAMS.forEach(async (p) => {
          try {
            await setDoc(doc(db, "coach_programs", p.id), p);
          } catch (e) {
            console.error("Erreur d'initialisation du programme:", p.id, e);
          }
        });
      }
    }
    persistState();
    render();
  }, (err) => {
    console.warn("Firestore coach_programs loading in real-time failed, using static fallback:", err);
    state.coachPrograms = [...COACH_PROGRAMS];
  });
}

// Lancement immédiat du chargement temps réel des programmes
listenToTracks();
listenToCoachPrograms();

window.addEventListener("popstate", handleBackNavigation);
window.addEventListener("pageshow", () => {
  persistState();
});

// Écouteur d'événements de stockage local pour synchroniser instantanément les onglets sur le même appareil
window.addEventListener("storage", (e) => {
  if (e.key === "monprogrammefit-state-v1") {
    restorePersistedState(Object.keys(PAGES));
    render();
  }
});

// Variables pour stocker les snapshots locaux de l'admin afin de les combiner
let adminUsersData = [];
let adminMessagesData = [];
let adminEmailsData = [];

let unsubscribeAdminUsers = null;
let unsubscribeAdminMessages = null;
let unsubscribeAdminEmails = null;

/**
 * Combine les snapshots en temps réel et met à jour l'état de l'administrateur.
 */
function updateAdminStateFromSnapshots() {
  const allUsers = [...adminUsersData];
  const messages = [...adminMessagesData];
  const adminEmails = [...adminEmailsData];

  // Tri chronologique inverse (plus récents en premier)
  messages.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

  state.adminData.allUsers = allUsers;

  // Fusionner les adresses e-mails administratives pré-autorisées
  adminEmails.forEach((aData) => {
    const aEmail = (aData.email || aData.id || "").toLowerCase().trim();
    if (aEmail) {
      const found = allUsers.find(u => (u.email || "").toLowerCase().trim() === aEmail);
      if (found) {
        found.role = "admin";
      } else {
        allUsers.push({
          id: aData.id,
          uid: aData.id,
          email: aEmail,
          role: "admin",
          preAuthorized: true
        });
      }
    }
  });

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

  persistState();
  render();
}

/**
 * Arrête tous les écouteurs d'administration temps réel.
 */
export function cleanupAdminRealTimeSync() {
  if (unsubscribeAdminUsers) {
    unsubscribeAdminUsers();
    unsubscribeAdminUsers = null;
  }
  if (unsubscribeAdminMessages) {
    unsubscribeAdminMessages();
    unsubscribeAdminMessages = null;
  }
  if (unsubscribeAdminEmails) {
    unsubscribeAdminEmails();
    unsubscribeAdminEmails = null;
  }
}

/**
 * Démarre ou rafraîchit la synchronisation temps réel globale de toutes les collections administratives.
 */
export function setupAdminRealTimeSync() {
  if (state.role !== "admin") return;

  // Si déjà abonnés, ne pas se réabonner inutilement
  if (unsubscribeAdminUsers && unsubscribeAdminMessages && unsubscribeAdminEmails) {
    return;
  }

  cleanupAdminRealTimeSync();
  state.adminData.loading = true;

  // 1. Écoute temps réel de tous les utilisateurs
  unsubscribeAdminUsers = onSnapshot(collection(db, "users"), (usersSnap) => {
    const list = [];
    usersSnap.forEach((docSnap) => {
      list.push({ id: docSnap.id, uid: docSnap.id, ...docSnap.data() });
    });
    adminUsersData = list;
    updateAdminStateFromSnapshots();
  }, (err) => {
    console.warn("Erreur écoute temps réel collection users:", err);
  });

  // 2. Écoute temps réel de tous les messages
  unsubscribeAdminMessages = onSnapshot(collection(db, "messages"), (messagesSnap) => {
    const list = [];
    messagesSnap.forEach((docSnap) => {
      list.push({ id: docSnap.id, ...docSnap.data() });
    });
    adminMessagesData = list;
    updateAdminStateFromSnapshots();
  }, (err) => {
    console.warn("Erreur écoute temps réel collection messages:", err);
  });

  // 3. Écoute temps réel des admin_emails
  unsubscribeAdminEmails = onSnapshot(collection(db, "admin_emails"), (adminEmailsSnap) => {
    const list = [];
    adminEmailsSnap.forEach((docSnap) => {
      list.push({ id: docSnap.id, ...docSnap.data() });
    });
    adminEmailsData = list;
    updateAdminStateFromSnapshots();
  }, (err) => {
    console.warn("Erreur écoute temps réel collection admin_emails:", err);
  });
}

/**
 * Déclencheur manuel ou de compatibilité pour actualiser les données de l'administrateur.
 * Désormais géré à 100% en temps réel pour une synchronisation instantanée multi-appareils.
 */
export async function refreshAdminData() {
  if (state.role !== "admin") return;
  setupAdminRealTimeSync();
}

// Écouteur d'état d'authentification Firebase (restauration automatique de la session)
// Variables pour stocker les désabonnements des écouteurs temps réel Firestore
let unsubscribeUserDoc = null;
let unsubscribeUserSessions = null;

// Écouteur d'état d'authentification Firebase (restauration automatique de la session)
onAuthStateChanged(auth, async (user) => {
  // Désabonner les écouteurs précédents s'ils existent pour éviter les fuites de mémoire et les erreurs de permission
  if (unsubscribeUserDoc) {
    unsubscribeUserDoc();
    unsubscribeUserDoc = null;
  }
  if (unsubscribeUserSessions) {
    unsubscribeUserSessions();
    unsubscribeUserSessions = null;
  }

  if (user) {
    try {
      const userDocRef = doc(db, "users", user.uid);

      // Écoute temps réel du document principal de l'utilisateur
      unsubscribeUserDoc = onSnapshot(userDocRef, async (userDocSnap) => {
        if (!userDocSnap.exists()) {
          // Si le document n'existe pas encore (onboarding/signup en cours), initialiser le profil de base
          state.role = "client";
          state.clientProfile = {
            ...state.clientProfile,
            email: user.email,
            uid: user.uid,
            physique: state.clientProfile.physique || { poids: null, taille: null, age: null, remarques: "" }
          };
          render();
          return;
        }

        const userData = userDocSnap.data();
        let userRole = userData.role || "client";
        const userEmailLower = (user.email || "").toLowerCase().trim();

        // Gestion de l'autorisation administrateur
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

        // Reconstitution robuste de l'objet physique
        const physique = {
          poids: userData.weight !== undefined ? userData.weight : (userData.physique?.poids || null),
          taille: userData.height !== undefined ? userData.height : (userData.physique?.taille || null),
          age: userData.age !== undefined ? userData.age : (userData.physique?.age || null),
          remarques: userData.medicalNotes !== undefined ? userData.medicalNotes : (userData.physique?.remarques || ""),
        };

        const program = userData.program || {};
        // Conserver les séances déjà chargées en temps réel si présentes
        if (state.clientProfile?.program?.sessions) {
          program.sessions = state.clientProfile.program.sessions;
        }

        state.clientProfile = {
          ...state.clientProfile,
          ...userData,
          physique,
          email: user.email,
          uid: user.uid,
          program: {
            ...(state.clientProfile?.program || {}),
            ...program
          }
        };

        if (state.role === "admin") {
          await refreshAdminData();
        }

        persistState();
        render();
      }, (error) => {
        console.warn("Erreur écoute temps réel profil utilisateur:", error);
      });

      // Écoute temps réel des séances d'entraînement associées
      const sessionsColRef = collection(db, "users", user.uid, "sessions");
      unsubscribeUserSessions = onSnapshot(sessionsColRef, (sessionsSnap) => {
        const sessions = [];
        sessionsSnap.forEach((sDoc) => {
          sessions.push({ id: sDoc.id, ...sDoc.data() });
        });

        if (sessions.length > 0) {
          if (!state.clientProfile.program) {
            state.clientProfile.program = {};
          }
          state.clientProfile.program.sessions = sessions;
          
          persistState();
          render();
        }
      }, (error) => {
        console.warn("Erreur écoute temps réel séances d'entraînement:", error);
      });

    } catch (error) {
      console.warn("Impossible d'établir la synchronisation Firestore:", error);
      state.role = "client";
    }
  } else {
    cleanupAdminRealTimeSync();
    state.role = "guest";
    state.clientProfile = {};
    state.adminData = { clients: [], messages: [], loaded: false, loading: false };
    if (state.page.startsWith("client") || state.page.startsWith("admin")) {
      state.page = "signup";
    } else if (state.page === "quiz") {
      state.page = "signup";
    }
    persistState();
    render();
  }
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
