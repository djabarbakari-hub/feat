/* ==========================================================
   modules/privacy.js — Gestion des données, consentements, suppressions.
   Respecte le RGPD et offre un contrôle total à l'utilisateur.
   ========================================================== */

import { state, persistState, STORAGE_KEY } from "../state.js";
import { showToast } from "../helpers.js";
import { auth, db, handleFirestoreError } from "../firebase.js";
import { doc, setDoc, deleteDoc } from "firebase/firestore";
import { sendPasswordResetEmail, updatePassword, reauthenticateWithCredential, EmailAuthProvider, deleteUser, GoogleAuthProvider, reauthenticateWithPopup } from "firebase/auth";

// Clés de stockage supplémentaires
export const ANALYTICS_CONSENT_KEY = "monprogrammefit-analytics-consent";
export const DELETION_LOG_KEY = "monprogrammefit-deletion-log";
export const TEMP_FILES_KEY = "monprogrammefit-temp-files";

/**
 * Journal d'audit : enregistre toute action de suppression ou modification.
 */
function logDeletion(action, dataRemoved) {
  try {
    const log = {
      timestamp: new Date().toISOString(),
      action: action, // "delete-drafts", "delete-history", "delete-account", "update-profile"
      dataRemoved: dataRemoved,
      userRole: state.role,
    };

    const logs = JSON.parse(window.localStorage.getItem(DELETION_LOG_KEY) || "[]");
    logs.push(log);
    if (logs.length > 100) logs.shift();
    window.localStorage.setItem(DELETION_LOG_KEY, JSON.stringify(logs));
  } catch (e) {
    console.warn("Logging impossible", e);
  }
}

/**
 * Retourne l'historique de suppression (admin uniquement).
 */
export function getDeletionLogs() {
  if (state.role !== "admin") return [];
  try {
    return JSON.parse(window.localStorage.getItem(DELETION_LOG_KEY) || "[]");
  } catch {
    return [];
  }
}

/**
 * Supprime tous les brouillons (formulaires non envoyés).
 */
export function clearDrafts() {
  const previousDrafts = { ...state.drafts };
  state.drafts = {
    contact: { name: "", email: "", message: "", subject: "", captcha: "" },
    signup: { firstName: "", lastName: "", email: "", password: "" },
    login: { email: "", password: "" },
  };
  persistState();
  logDeletion("delete-drafts", previousDrafts);
  showToast("Brouillons supprimés");
}

/**
 * Supprime l'historique de navigation et du quiz.
 */
export function clearHistory() {
  const previousData = {
    history: state.history,
    quizStep: state.quizStep,
    quizAnswers: state.quizAnswers,
  };
  state.history = [];
  state.quizStep = 0;
  state.quizAnswers = {};
  persistState();
  logDeletion("delete-history", previousData);
  showToast("Historique et réponses réinitialisés");
}

/**
 * Met à jour le profil client (Droit de rectification RGPD) et synchronise avec Firestore si connecté.
 */
export async function updateUserProfile(newData) {
  const previousProfile = { ...state.clientProfile };
  
  state.clientProfile = {
    ...state.clientProfile,
    firstName: newData.firstName !== undefined ? newData.firstName : state.clientProfile.firstName || "",
    lastName: newData.lastName !== undefined ? newData.lastName : state.clientProfile.lastName || "",
    email: newData.email !== undefined ? newData.email : state.clientProfile.email || "",
    phone: newData.phone !== undefined ? newData.phone : state.clientProfile.phone || "",
    goal: newData.goal !== undefined ? newData.goal : state.clientProfile.goal || "",
    track: newData.track !== undefined ? newData.track : state.clientProfile.track || "",
    niveau: newData.niveau !== undefined ? newData.niveau : state.clientProfile.niveau || "",
    frequence: newData.frequence !== undefined ? newData.frequence : state.clientProfile.frequence || "",
    medicalNotes: newData.medicalNotes !== undefined ? newData.medicalNotes : state.clientProfile.medicalNotes || "",
    dailyWaterLog: newData.dailyWaterLog !== undefined ? newData.dailyWaterLog : state.clientProfile.dailyWaterLog || null,
    weightHistory: newData.weightHistory !== undefined ? newData.weightHistory : state.clientProfile.weightHistory || null,
    program: newData.program !== undefined ? newData.program : state.clientProfile.program || null,
    quizAnswers: newData.quizAnswers !== undefined ? newData.quizAnswers : state.clientProfile.quizAnswers || null,
    physique: {
      ...(state.clientProfile.physique || {}),
      poids: newData.poids !== undefined ? newData.poids : state.clientProfile.physique?.poids || null,
      taille: newData.taille !== undefined ? newData.taille : state.clientProfile.physique?.taille || null,
      age: newData.age !== undefined ? newData.age : state.clientProfile.physique?.age || null,
      remarques: newData.medicalNotes !== undefined ? newData.medicalNotes : state.clientProfile.physique?.remarques || "",
    },
    updatedAt: new Date().toISOString(),
  };

  persistState();

  const currentUser = auth.currentUser;
  if (currentUser) {
    const userPath = `users/${currentUser.uid}`;
    try {
      const userRef = doc(db, "users", currentUser.uid);
      await setDoc(userRef, {
        firstName: state.clientProfile.firstName,
        lastName: state.clientProfile.lastName,
        email: state.clientProfile.email,
        phone: state.clientProfile.phone,
        goal: state.clientProfile.goal,
        track: state.clientProfile.track,
        niveau: state.clientProfile.niveau,
        frequence: state.clientProfile.frequence,
        weight: state.clientProfile.physique.poids,
        height: state.clientProfile.physique.taille,
        age: state.clientProfile.physique.age,
        medicalNotes: state.clientProfile.medicalNotes,
        dailyWaterLog: state.clientProfile.dailyWaterLog || null,
        weightHistory: state.clientProfile.weightHistory || null,
        program: state.clientProfile.program || null,
        quizAnswers: state.clientProfile.quizAnswers || null,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    } catch (err) {
      console.warn("Erreur mise à jour Firestore profile:", err);
      handleFirestoreError(err, "write", userPath);
    }
  }

  logDeletion("update-profile", { previous: previousProfile, updated: state.clientProfile });
  showToast("Vos informations ont été mises à jour");
}

/**
 * Supprime le profil client et toutes les données personnelles.
 */
export async function deleteClientProfile() {
  const previousProfile = { ...state.clientProfile };
  state.clientProfile = {};
  persistState();

  const currentUser = auth.currentUser;
  if (currentUser) {
    const userPath = `users/${currentUser.uid}`;
    try {
      const userRef = doc(db, "users", currentUser.uid);
      await setDoc(userRef, {
        firstName: "",
        lastName: "",
        phone: "",
        goal: "",
        track: "",
        niveau: "",
        frequence: "",
        weight: null,
        height: null,
        age: null,
        medicalNotes: "",
        program: null,
        quizAnswers: null,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    } catch (e) {
      console.warn("Firestore deleteClientProfile error:", e);
      handleFirestoreError(e, "write", userPath);
    }
  }

  logDeletion("delete-profile", previousProfile);
  showToast("Profil personnel supprimé");
}

/**
 * Suppression complète du compte (DESTRUCTIVE).
 */
export async function deleteEntireAccount() {
  logDeletion("delete-entire-account", {
    role: state.role,
    hadProfile: !!state.clientProfile?.firstName,
    hadQuizAnswers: Object.keys(state.quizAnswers || {}).length > 0,
    timestamp: Date.now(),
  });

  const currentUser = auth.currentUser;
  if (currentUser) {
    try {
      await deleteDoc(doc(db, "users", currentUser.uid));
    } catch (e) {
      console.warn("Firestore delete user error:", e);
    }
    try {
      await auth.signOut();
    } catch (e) {
      console.warn("Auth signout error:", e);
    }
  }

  window.localStorage.removeItem(STORAGE_KEY);
  window.localStorage.removeItem(ANALYTICS_CONSENT_KEY);

  window.location.href = window.location.pathname;
}

/**
 * Exporte les données personnelles de l'utilisateur (droit RGPD).
 * Retourne un objet avec toutes les données conservées.
 */
export function exportUserData() {
  const profile = state.clientProfile || {};
  const quizAnswers = state.quizAnswers || profile.quizAnswers || {};
  const currentUser = auth.currentUser;

  return {
    exportedAt: new Date().toISOString(),
    userProfile: {
      role: state.role || "client",
      lastVisitedAt: state.lastVisitedAt || "N/A",
      uid: profile.uid || (currentUser ? currentUser.uid : null),
    },
    personalInformation: {
      firstName: profile.firstName || "",
      lastName: profile.lastName || "",
      email: profile.email || state.drafts?.signup?.email || (currentUser ? currentUser.email : ""),
      phone: profile.phone || "",
    },
    fitnessProfile: {
      goal: profile.goal || "",
      track: profile.track || "",
      niveau: profile.niveau || "",
      frequence: profile.frequence || "",
      weight: profile.physique?.poids || profile.weight || null,
      height: profile.physique?.taille || profile.height || null,
      age: profile.physique?.age || profile.age || null,
      medicalNotes: profile.physique?.remarques || profile.medicalNotes || "",
    },
    assignedProgram: profile.program || state.clientProgram || null,
    progressLogs: state.progressLogs || [],
    quizAnswers: quizAnswers,
    navigationHistory: state.history || [],
    formDrafts: state.drafts || {},
    analyticsConsent: getAnalyticsConsent(),
  };
}

/**
 * Télécharge un fichier JSON avec les données personnelles.
 */
export function downloadUserDataAsJson() {
  const data = exportUserData();
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `monprogrammefit-donnees-${new Date().toISOString().split("T")[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast("Données téléchargées au format JSON");
}

/**
 * Gère le consentement Google Analytics / Microsoft Clarity.
 * @param {boolean} accepted - true pour accepter, false pour refuser
 * @param {string} type - "analytics", "clarity", "all"
 */
export function setAnalyticsConsent(accepted, type = "analytics") {
  const consent = getAnalyticsConsent();
  
  if (type === "analytics" || type === "all") {
    consent.googleAnalytics = accepted;
  }
  if (type === "clarity" || type === "all") {
    consent.microsoftClarity = accepted;
  }

  consent.lastUpdated = new Date().toISOString();
  consent.userChoice = true;

  window.localStorage.setItem(ANALYTICS_CONSENT_KEY, JSON.stringify(consent));

  if (!accepted) {
    logDeletion("revoke-analytics-consent", { type });
    // Arrêter les scripts analytics si nécessaire
    disableAnalyticsScripts();
  } else {
    enableAnalyticsScripts();
  }

  showToast(accepted ? "Consentement accordé" : "Consentement refusé");
}

/**
 * Récupère le statut de consentement actuel.
 */
export function getAnalyticsConsent() {
  try {
    const stored = window.localStorage.getItem(ANALYTICS_CONSENT_KEY);
    if (stored) return JSON.parse(stored);
  } catch (e) {
    console.warn("Erreur lecture consentement", e);
  }

  return {
    googleAnalytics: false,
    microsoftClarity: false,
    lastUpdated: null,
    userChoice: false,
  };
}

/**
 * Désactive les scripts analytics.
 */
function disableAnalyticsScripts() {
  // Google Analytics: définir le drapeau opt-out
  if (window.gtag) {
    window.gtag("consent", "update", {
      analytics_storage: "denied",
    });
  }

  // Microsoft Clarity: arrêter le tracking
  if (window.clarity) {
    window.clarity("consent:hide");
  }

  // Bloquer les cookies tiers
  document.cookie = "_ga=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
  document.cookie = "_gat=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
}

/**
 * Active les scripts analytics.
 */
function enableAnalyticsScripts() {
  if (window.gtag) {
    window.gtag("consent", "update", {
      analytics_storage: "granted",
    });
  }

  if (window.clarity) {
    window.clarity("consent:grant");
  }
}

/**
 * Nettoyage automatique : supprime les données expirées.
 * À appeler périodiquement (par exemple, au chargement de l'app).
 */
export function cleanupExpiredData() {
  const now = Date.now();
  const EXPIRY_14_DAYS = 14 * 24 * 60 * 60 * 1000; // 14 jours en ms

  // Nettoyer les fichiers temporaires après 14 jours
  try {
    const tempFiles = JSON.parse(window.localStorage.getItem(TEMP_FILES_KEY) || "[]");
    const filtered = tempFiles.filter((file) => {
      const age = now - file.createdAt;
      return age < EXPIRY_14_DAYS;
    });

    if (filtered.length < tempFiles.length) {
      const removed = tempFiles.length - filtered.length;
      window.localStorage.setItem(TEMP_FILES_KEY, JSON.stringify(filtered));
      logDeletion("auto-cleanup-temp-files", { removedCount: removed });
      console.info(`[Privacy] ${removed} fichier(s) temporaire(s) supprimé(s) (>14j)`);
    }
  } catch (e) {
    console.warn("Erreur nettoyage fichiers temp", e);
  }

  // Supprimer les brouillons abandonnés après 14 jours d'inactivité
  try {
    const lastVisited = state.lastVisitedAt || now;
    const idle = now - lastVisited;

    if (idle > EXPIRY_14_DAYS) {
      const hasDrafts =
        state.drafts.contact.name ||
        state.drafts.contact.message ||
        state.drafts.signup.firstName;

      if (hasDrafts) {
        clearDrafts();
        logDeletion("auto-cleanup-abandoned-drafts", { idleDays: Math.round(idle / 86400000) });
        console.info("[Privacy] Brouillons abandonnés supprimés (inactivité >14j)");
      }
    }
  } catch (e) {
    console.warn("Erreur nettoyage brouillons", e);
  }

  // Supprimer les sessions expirées (activeSession vide si inactivité >14j)
  try {
    const lastVisited = state.lastVisitedAt || now;
    const idle = now - lastVisited;

    if (idle > EXPIRY_14_DAYS && state.activeSession) {
      state.activeSession = "";
      persistState();
      logDeletion("auto-cleanup-expired-session", { idleDays: Math.round(idle / 86400000) });
      console.info("[Privacy] Session expirée nettoyée (inactivité >14j)");
    }
  } catch (e) {
    console.warn("Erreur nettoyage session expirée", e);
  }
}

/**
 * Vérifie si Google Analytics est installé/détecté sur la page.
 */
export function hasGoogleAnalytics() {
  return typeof window.gtag !== "undefined" || 
         typeof window.ga !== "undefined" ||
         !!document.querySelector('script[src*="googletagmanager"]') ||
         !!document.querySelector('script[src*="google-analytics"]');
}

/**
 * Vérifie si Microsoft Clarity est installé/détecté sur la page.
 */
export function hasMicrosoftClarity() {
  return typeof window.clarity !== "undefined" ||
         !!document.querySelector('script[src*="clarity.ms"]');
}

/**
 * Retourne vrai s'il y a au moins un service analytics détecté.
 */
export function hasAnalyticsServices() {
  return hasGoogleAnalytics() || hasMicrosoftClarity();
}

/**
 * Envoie un e-mail de réinitialisation / définition de mot de passe.
 */
export async function sendPasswordReset() {
  const user = auth.currentUser;
  const email = user?.email || state.clientProfile?.email;

  if (!email) {
    showToast("Adresse e-mail introuvable.");
    return { success: false, error: "Adresse email manquante" };
  }

  try {
    await sendPasswordResetEmail(auth, email);
    showToast(`E-mail de réinitialisation envoyé à ${email}`);
    logDeletion("request-password-reset-email", { email });
    return { success: true };
  } catch (err) {
    console.error("Erreur réinitialisation mot de passe:", err);
    showToast("Erreur lors de l'envoi de l'e-mail de réinitialisation.");
    return { success: false, error: err.message };
  }
}

/**
 * Modifie directement le mot de passe de l'utilisateur avec réauthentification.
 */
export async function updateUserPassword(currentPassword, newPassword) {
  const user = auth.currentUser;
  if (!user) {
    showToast("Vous devez être connecté.");
    return { success: false, error: "Non connecté" };
  }

  try {
    if (user.email && currentPassword) {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
    }
    await updatePassword(user, newPassword);
    showToast("Mot de passe mis à jour avec succès !");
    logDeletion("update-password-direct", { timestamp: new Date().toISOString() });
    return { success: true };
  } catch (err) {
    console.error("Erreur modification mot de passe:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Programme la suppression de compte avec un délai de grâce (7 jours).
 */
export async function scheduleAccountDeletion(days = 7) {
  if (state.role === "admin") {
    showToast("Action impossible : Les comptes administrateurs ne peuvent pas être supprimés.");
    return { success: false, error: "Compte administrateur non supprimable." };
  }

  const user = auth.currentUser;
  const requestedAt = new Date();
  const executeAt = new Date(requestedAt.getTime() + days * 24 * 60 * 60 * 1000);

  const pendingDeletion = {
    requestedAt: requestedAt.toISOString(),
    executeAt: executeAt.toISOString(),
    daysGrace: days,
  };

  state.clientProfile = {
    ...state.clientProfile,
    pendingDeletion,
  };
  persistState();

  if (user) {
    try {
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, { pendingDeletion }, { merge: true });
    } catch (e) {
      console.warn("Erreur sauvegarde délai de grâce Firestore:", e);
    }
  }

  logDeletion("schedule-account-deletion", pendingDeletion);
  showToast(`Suppression programmée dans ${days} jours. Récupération possible à tout moment.`);
  return { success: true };
}

/**
 * Annule la suppression de compte programmée et restaure l'accès normal.
 */
export async function cancelAccountDeletion() {
  const user = auth.currentUser;

  if (state.clientProfile) {
    delete state.clientProfile.pendingDeletion;
  }
  persistState();

  if (user) {
    try {
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, { pendingDeletion: null }, { merge: true });
    } catch (e) {
      console.warn("Erreur annulation suppression Firestore:", e);
    }
  }

  logDeletion("cancel-account-deletion", { timestamp: new Date().toISOString() });
  showToast("Suppression de compte annulée ! Votre compte est pleinement restauré.");
  return { success: true };
}

/**
 * Supprime le compte immédiatement et sans délai.
 */
/**
 * Supprime le compte immédiatement et sans délai.
 */
export async function deleteAccountImmediately() {
  if (state.role === "admin") {
    showToast("Action impossible : Les comptes administrateurs ne peuvent pas être supprimés.");
    return { success: false, error: "Compte administrateur non supprimable." };
  }

  logDeletion("delete-account-immediate", {
    role: state.role,
    email: state.clientProfile?.email,
    timestamp: Date.now(),
  });

  const currentUser = auth.currentUser;
  if (currentUser) {
    try {
      await deleteDoc(doc(db, "users", currentUser.uid));
    } catch (e) {
      console.warn("Erreur suppression doc Firestore:", e);
    }

    try {
      await deleteUser(currentUser);
    } catch (e) {
      console.warn("Erreur suppression compte Auth:", e);
      if (e.code === "auth/requires-recent-login") {
        return new Promise((resolve) => {
          showReauthModal(currentUser, async (success) => {
            if (success) {
              try {
                // Tente de supprimer à nouveau après réauthentification réussie
                await deleteDoc(doc(db, "users", currentUser.uid));
                await deleteUser(currentUser);
                finishDeletion();
                resolve({ success: true });
              } catch (err) {
                showToast("Erreur lors de la suppression finale du compte.");
                resolve({ success: false, error: err.message });
              }
            } else {
              showToast("Suppression annulée ou échec de réauthentification.");
              resolve({ success: false, error: "Réauthentification échouée" });
            }
          });
        });
      } else {
        await auth.signOut();
      }
    }
  }

  finishDeletion();
  return { success: true };
}

function finishDeletion() {
  window.localStorage.removeItem(STORAGE_KEY);
  window.localStorage.removeItem(ANALYTICS_CONSENT_KEY);
  window.location.href = window.location.pathname;
}

/**
 * Affiche un modal de réauthentification pour confirmer la suppression de compte.
 */
function showReauthModal(currentUser, callback) {
  const modal = document.createElement("div");
  modal.id = "reauth-modal";
  modal.style.cssText = `
    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.8); display: flex; align-items: center;
    justify-content: center; z-index: 999; padding: 16px;
  `;

  const isGoogleUser = currentUser.providerData.some(p => p.providerId === "google.com");

  modal.innerHTML = `
    <div style="
      background: var(--chalk); color: var(--ink);
      border-radius: 8px; padding: 32px; max-width: 440px;
      width: 100%; box-shadow: 0 24px 64px rgba(0,0,0,0.35); border: 1px solid var(--line);
    ">
      <h3 style="margin: 0 0 12px; font-family: 'Archivo Black', sans-serif; font-size: 18px; color: var(--ink);">Réauthentification requise</h3>
      <p style="font-size: 13px; color: var(--slate); line-height: 1.5; margin: 0 0 20px;">
        Pour des raisons de sécurité, vous devez vous reconnecter pour pouvoir supprimer définitivement votre compte.
      </p>

      ${isGoogleUser ? `
        <button id="btn-reauth-google" class="btn" style="width: 100%; justify-content: center; gap: 8px; background: #ffffff; color: #1f2937; border: 1px solid var(--line); font-weight: 600; margin-bottom: 16px; display: flex; align-items: center;">
          <svg style="width:16px; height:16px;" viewBox="0 0 24 24">
            <path fill="#EA4335" d="M12.24 10.285V14.4h6.887C18.2 16.96 15.645 18.9 12.24 18.9c-3.81 0-6.9-3.09-6.9-6.9s3.09-6.9 6.9-6.9c1.71 0 3.255.615 4.47 1.74l3.18-3.18C17.91 1.725 15.27.9 12.24.9 5.865.9.7 6.065.7 12.45s5.165 11.55 11.54 11.55c6.51 0 11.835-4.71 11.835-11.55 0-.78-.075-1.53-.21-2.165H12.24z"/>
          </svg>
          Se réauthentifier avec Google
        </button>
      ` : `
        <div style="margin-bottom: 16px;">
          <label style="display: block; font-size: 12px; font-weight: 600; margin-bottom: 6px; color: var(--ink);">Votre mot de passe actuel</label>
          <input id="reauth-password" type="password" class="form-input" placeholder="Saisissez votre mot de passe" style="width:100%; padding:10px; border:1px solid var(--line); border-radius:4px; background:var(--surface);" />
          <div id="reauth-error" style="color:var(--ember); font-size:12px; margin-top:6px; display:none;"></div>
        </div>
        <button id="btn-reauth-confirm" class="btn btn-ember" style="width: 100%; justify-content: center; font-weight: 600; margin-bottom: 12px; display: flex; align-items: center;">
          Confirmer la suppression
        </button>
      `}

      <button id="btn-reauth-cancel" class="btn btn-outline-dark" style="width: 100%; justify-content: center; font-weight: 600; background:transparent; border-color:var(--line); color:var(--ink);">
        Annuler
      </button>
    </div>
  `;

  document.body.appendChild(modal);

  const cleanup = () => modal.remove();

  modal.querySelector("#btn-reauth-cancel").addEventListener("click", () => {
    cleanup();
    callback(false);
  });

  if (isGoogleUser) {
    modal.querySelector("#btn-reauth-google").addEventListener("click", async () => {
      try {
        const provider = new GoogleAuthProvider();
        await reauthenticateWithPopup(currentUser, provider);
        cleanup();
        callback(true);
      } catch (err) {
        console.error("Reauth Google Error:", err);
        showToast("Échec de réauthentification Google.");
        cleanup();
        callback(false);
      }
    });
  } else {
    modal.querySelector("#btn-reauth-confirm").addEventListener("click", async () => {
      const pwdInput = modal.querySelector("#reauth-password");
      const errDiv = modal.querySelector("#reauth-error");
      const password = pwdInput.value;

      if (!password) {
        errDiv.textContent = "Veuillez saisir votre mot de passe.";
        errDiv.style.display = "block";
        return;
      }

      errDiv.style.display = "none";

      try {
        const credential = EmailAuthProvider.credential(currentUser.email, password);
        await reauthenticateWithCredential(currentUser, credential);
        cleanup();
        callback(true);
      } catch (err) {
        console.error("Reauth Credential Error:", err);
        errDiv.textContent = "Mot de passe incorrect.";
        errDiv.style.display = "block";
      }
    });
  }
}
