/* ==========================================================
   pages/index.js — Table de routage : clé de page → fonction de rendu.
   ========================================================== */

import {
  renderHome, renderPrograms, renderBlog, renderPricing,
  renderFaq, renderLegal, renderNotFound, renderAbout
} from "./guest.js";
import { renderContact } from "./contact.js";
import { renderQuiz } from "./quiz.js";
import { renderLogin, renderSignup } from "./auth.js";
import { renderClientDashboard, renderClientProgram, renderClientProgress } from "./client.js";
import { renderAdminDashboard, renderAdminClients, renderAdminPrograms, renderAdminMessages } from "./admin.js";

console.log("Fonctions importées depuis guest.js:", { renderAbout }); // Debug: Vérifier l'import
console.log("Fonction renderContact importée depuis contact.js:", { renderContact }); // Debug: Vérifier l'import

export const PAGES = {
  "home": renderHome,
  "programs": renderPrograms,
  "pricing": renderPricing,
  "faq": renderFaq,
  "about": renderAbout,
  "blog": renderBlog,
  "contact": renderContact,
  "legal": renderLegal,
  "quiz": renderQuiz,
  "login": renderLogin,
  "signup": renderSignup,
  "client-dashboard": renderClientDashboard,
  "client-program": renderClientProgram,
  "client-progress": renderClientProgress,
  "admin-dashboard": renderAdminDashboard,
  "admin-clients": renderAdminClients,
  "admin-programs": renderAdminPrograms,
  "admin-messages": renderAdminMessages,
  "404": renderNotFound,
};
