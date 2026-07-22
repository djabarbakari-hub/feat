/* ==========================================================
   modules/privacy.js — Gestion des données, consentements, suppressions.
   Respecte le RGPD et offre un contrôle total à l'utilisateur.
   ========================================================== */

import { state, persistState, STORAGE_KEY } from "../state.js";
import { showToast } from "../helpers.js";

// Clés de stockage supplémentaires
export const ANALYTICS_CONSENT_KEY = "monprogrammefit-analytics-consent";
export const DELETION_LOG_KEY = "monprogrammefit-deletion-log";
export const TEMP_FILES_KEY = "monprogrammefit-temp-files";

/**
 * Journal d'audit : enregistre toute action de suppression.
 * Structure : { timestamp, action, dataRemoved, userRole, ipHash? }
 */
function logDeletion(action, dataRemoved) {
  try {
    const log = {
      timestamp: new Date().toISOString(),
      action: action, // "delete-drafts", "delete-history", "delete-account"
      dataRemoved: dataRemoved,
      userRole: state.role,
      // En production, ajouter un hash d'IP sécurisé pour l'audit
    };

    const logs = JSON.parse(window.localStorage.getItem(DELETION_LOG_KEY) || "[]");
    logs.push(log);
    // Garder les 100 derniers logs maximum
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
  showToast("Historique supprimé");
}

/**
 * Supprime le profil client et toutes les données personnelles.
 * ⚠️ ATTENTION: Cette action est irréversible après confirmation.
 */
export function deleteClientProfile() {
  const previousProfile = { ...state.clientProfile };
  state.clientProfile = {};
  persistState();
  logDeletion("delete-profile", previousProfile);
  showToast("Profil supprimé");
}

/**
 * Suppression complète du compte (DESTRUCTIVE).
 * Réinitialise l'état aux valeurs par défaut.
 * ⚠️ Cette action est irréversible!
 */
export function deleteEntireAccount() {
  // Logging avant destruction
  logDeletion("delete-entire-account", {
    role: state.role,
    hadProfile: !!state.clientProfile?.firstName,
    hadQuizAnswers: Object.keys(state.quizAnswers).length > 0,
    timestamp: Date.now(),
  });

  // Réinitialiser complètement
  window.localStorage.removeItem(STORAGE_KEY);
  window.localStorage.removeItem(ANALYTICS_CONSENT_KEY);
  // Les logs de suppression restent pour l'audit

  // Recharger la page
  window.location.href = window.location.pathname;
}

/**
 * Exporte les données personnelles de l'utilisateur (droit RGPD).
 * Retourne un objet avec toutes les données conservées.
 */
export function exportUserData() {
  return {
    exportedAt: new Date().toISOString(),
    userProfile: {
      role: state.role,
      lastVisitedAt: state.lastVisitedAt || "N/A",
    },
    personalData: {
      clientProfile: state.clientProfile,
      quizAnswers: state.quizAnswers,
      draftEmails: [
        state.drafts.signup.email,
        state.drafts.login.email,
        state.drafts.contact.email,
      ].filter(e => e),
    },
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
  showToast("Données téléchargées");
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
 * Vérifie si Google Analytics est installé.
 */
export function hasGoogleAnalytics() {
  return typeof gtag !== "undefined" || document.querySelector('script[src*="google"]');
}

/**
 * Vérifie si Microsoft Clarity est installé.
 */
export function hasMicrosoftClarity() {
  return typeof clarity !== "undefined" || document.querySelector('script[src*="clarity"]');
}

/**
 * Retourne vrai s'il y a au moins un service analytics détecté.
 */
export function hasAnalyticsServices() {
  return hasGoogleAnalytics() || hasMicrosoftClarity();
}
