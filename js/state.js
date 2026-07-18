/* ==========================================================
   state.js — État global de l'application + persistance locale.
   ========================================================== */

export const STORAGE_KEY = "monprogrammefit-state-v1";

export const state = {
  page: "home",
  role: "guest", // guest | client | admin
  quizStep: 0,
  quizAnswers: {},
  loginTab: "client",
  clientProfile: {},
  history: [],
  activeSession: "",
  adminNotice: "",
  drafts: {
    contact: { name: "", email: "", message: "" },
    signup: { firstName: "", lastName: "", email: "", age: "", goal: "", weight: "", height: "" },
    login: { email: "", password: "" },
  },
  backExitAttempted: false,
  backNoticeTimer: null,
};

/**
 * Sauvegarde un instantané de l'état dans localStorage.
 */
export function persistState() {
  try {
    const snapshot = {
      page: state.page,
      role: state.role,
      quizStep: state.quizStep,
      quizAnswers: state.quizAnswers,
      loginTab: state.loginTab,
      clientProfile: state.clientProfile,
      history: state.history,
      activeSession: state.activeSession,
      adminNotice: state.adminNotice,
      drafts: state.drafts,
      lastVisitedAt: Date.now(),
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  } catch (error) {
    console.warn("Persistence impossible", error);
  }
}

/**
 * Restaure l'état depuis localStorage, puis applique la page indiquée
 * dans le hash de l'URL si elle est valide.
 * @param {string[]} validPageKeys - Clés de pages valides (ex: Object.keys(PAGES)).
 *   Passé en paramètre plutôt qu'importé directement pour éviter une
 *   dépendance circulaire entre state.js et le routeur de pages.
 */
export function restorePersistedState(validPageKeys = []) {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.page) state.page = parsed.page;
      if (parsed.role) state.role = parsed.role;
      if (typeof parsed.quizStep === "number") state.quizStep = parsed.quizStep;
      if (parsed.quizAnswers) state.quizAnswers = parsed.quizAnswers;
      if (parsed.loginTab) state.loginTab = parsed.loginTab;
      if (parsed.clientProfile) state.clientProfile = parsed.clientProfile;
      if (Array.isArray(parsed.history)) state.history = parsed.history;
      if (parsed.activeSession) state.activeSession = parsed.activeSession;
      if (parsed.adminNotice) state.adminNotice = parsed.adminNotice;
      if (parsed.drafts) state.drafts = { ...state.drafts, ...parsed.drafts };
    }
  } catch (error) {
    console.warn("Restauration impossible", error);
  }

  const hashPage = window.location.hash?.replace(/^#/, "");
  if (hashPage && validPageKeys.includes(hashPage)) {
    state.page = hashPage;
  }
}
