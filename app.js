/* ==========================================================
   MonProgrammeFit — site vanilla JS (sans framework)
   ========================================================== */

/* ---------- DATA ---------- */
const TRACKS = [
  {
    id: "gym",
    label: "Salle de gym",
    icon: "dumbbell",
    dist: "12 semaines",
    tagline: "Accès machines & poids libres",
    desc: "Programmes structurés autour des équipements de salle : progression en charge, split par groupes musculaires, suivi des séries.",
    img: "https://images.unsplash.com/photo-1758223521209-f70658aa6bb6?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "home-equip",
    label: "Maison — avec matériel",
    icon: "home",
    dist: "10 semaines",
    tagline: "Haltères, élastiques, banc",
    desc: "Séances pensées pour un espace réduit et un matériel léger : haltères ajustables, élastiques de résistance, banc pliable.",
    img: "https://images.unsplash.com/photo-1683758575782-a632dbbe9eed?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "bodyweight",
    label: "Maison — au poids du corps",
    icon: "footprints",
    dist: "8 semaines",
    tagline: "Zéro matériel, marche & running inclus",
    desc: "Aucun équipement requis : renforcement au poids du corps, routines de marche active et progression running débutant.",
    img: "https://images.unsplash.com/photo-1699959381686-2bb76f9a64c7?auto=format&fit=crop&w=800&q=80",
  },
];

const QUIZ_STEPS = [
  { q: "Où comptes-tu t'entraîner le plus souvent ?", key: "lieu", options: [
    { v: "gym", l: "En salle de sport" },
    { v: "home-equip", l: "Chez moi, avec un peu de matériel" },
    { v: "bodyweight", l: "Chez moi, sans matériel" },
  ]},
  { q: "Ton niveau actuel en activité physique ?", key: "niveau", options: [
    { v: "debutant", l: "Débutant complet" },
    { v: "occasionnel", l: "Je bouge de temps en temps" },
    { v: "reguliers", l: "Je suis déjà assez actif·ve" },
  ]},
  { q: "Combien de séances par semaine vises-tu ?", key: "frequence", options: [
    { v: "2", l: "2 séances" },
    { v: "3-4", l: "3 à 4 séances" },
    { v: "5+", l: "5 séances ou plus" },
  ]},
];

const CLIENT_PROGRAM = {
  track: "home-equip",
  week: 4,
  totalWeeks: 10,
  nextSession: "Haut du corps — Séance B",
  history: [
    { name: "Semaine 1", done: 3, total: 3 },
    { name: "Semaine 2", done: 3, total: 3 },
    { name: "Semaine 3", done: 2, total: 3 },
    { name: "Semaine 4", done: 1, total: 3 },
  ],
  sessions: [
    { name: "Séance A — Bas du corps", exos: 6, duree: "40 min", done: true },
    { name: "Séance B — Haut du corps", exos: 7, duree: "45 min", done: false },
    { name: "Séance C — Full body", exos: 8, duree: "35 min", done: false },
  ],
};

const ADMIN_STATS = {
  clients: 128,
  activeToday: 34,
  newThisWeek: 9,
  popular: [
    { name: "Maison — au poids du corps", pct: 44 },
    { name: "Salle de gym", pct: 33 },
    { name: "Maison — avec matériel", pct: 23 },
  ],
  messages: [
    { from: "Sarah M.", preview: "J'ai une douleur au genou pendant les squats, je fais quoi ?", time: "10:24" },
    { from: "Karim B.", preview: "Question sur la fréquence des séances de running", time: "09:02" },
    { from: "Julie T.", preview: "Merci coach, super première semaine !", time: "hier" },
  ],
};

/* ---------- STATE ---------- */
const STORAGE_KEY = "monprogrammefit-state-v1";
const state = {
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

/* ---------- HELPERS ---------- */
/**
 * Génère une icône Lucide dynamique.
 * @param {string} name - Nom de l'icône (ex: "dumbbell").
 * @param {number} [size=16] - Taille de l'icône en pixels.
 * @param {string} [color] - Couleur de l'icône (ex: "var(--ember)").
 * @returns {string} HTML de l'icône.
 */
const icon = (name, size = 16, color) =>
  `<i data-lucide="${name}" style="width:${size}px;height:${size}px${color ? `;color:${color}` : ""}"></i>`;

/**
 * Récupère un programme par son ID.
 * @param {string} id - ID du programme (ex: "gym").
 * @returns {Object} Objet programme correspondant ou le programme par défaut.
 */
const trackById = (id) => TRACKS.find((t) => t.id === id) || TRACKS[2];

/**
 * Vérifie si le quiz est complet.
 * @returns {boolean} True si toutes les réponses du quiz sont remplies.
 */
function isQuizComplete() {
  return QUIZ_STEPS.every((step) => !!state.quizAnswers[step.key]);
}

function persistState() {
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

function restorePersistedState() {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return;
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
  } catch (error) {
    console.warn("Restauration impossible", error);
  }

  const hashPage = window.location.hash?.replace(/^#/, "");
  if (hashPage && PAGES[hashPage]) {
    state.page = hashPage;
  }
}

function updateBrowserHistory(page, { replace = false } = {}) {
  const base = window.location.pathname + window.location.search;
  const hash = page === "home" ? "" : `#${page}`;
  const url = `${base}${hash}`;
  if (replace) {
    window.history.replaceState({ page }, "", url);
  } else {
    window.history.pushState({ page }, "", url);
  }
}

function showToast(message) {
  const existing = document.getElementById("app-toast");
  if (existing) existing.remove();
  const toast = document.createElement("div");
  toast.id = "app-toast";
  toast.setAttribute("role", "status");
  toast.setAttribute("aria-live", "polite");
  toast.textContent = message;
  toast.style.position = "fixed";
  toast.style.left = "50%";
  toast.style.bottom = "max(18px, env(safe-area-inset-bottom))";
  toast.style.transform = "translateX(-50%)";
  toast.style.background = "rgba(15, 26, 20, 0.96)";
  toast.style.color = "#F8F5EB";
  toast.style.padding = "12px 16px";
  toast.style.borderRadius = "999px";
  toast.style.zIndex = "120";
  toast.style.boxShadow = "0 10px 28px rgba(0, 0, 0, 0.28)";
  document.body.appendChild(toast);
  window.setTimeout(() => toast.remove(), 1900);
}

function closeMobileMenu() {
  const navMobile = document.getElementById("navMobile");
  const toggleBtn = document.getElementById("navToggle");
  if (navMobile) {
    navMobile.classList.remove("open-mobile");
  }
  if (toggleBtn) {
    toggleBtn.setAttribute("aria-expanded", "false");
  }
}

/**
 * Navigue vers une page et déclenche un rendu.
 * @param {string} page - Nom de la page (ex: "home", "programs").
 */
function navigate(page, { replace = false } = {}) {
  if (!replace && state.page && state.page !== page) {
    state.history.push(state.page);
  }
  state.page = page;
  state.backExitAttempted = false;
  persistState();
  updateBrowserHistory(page, { replace });
  render();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function goBack() {
  if (state.history.length > 0) {
    const previous = state.history.pop();
    state.page = previous || "home";
    state.backExitAttempted = false;
    persistState();
    updateBrowserHistory(state.page, { replace: true });
    render();
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }
  state.backExitAttempted = false;
  navigate("home", { replace: true });
}

function handleBackNavigation() {
  const navMobile = document.getElementById("navMobile");
  if (navMobile && navMobile.classList.contains("open-mobile")) {
    closeMobileMenu();
    return;
  }

  if (state.history.length > 0) {
    goBack();
    return;
  }

  if (!state.backExitAttempted) {
    state.backExitAttempted = true;
    showToast("Appuyez à nouveau pour revenir à l'accueil");
    if (state.backNoticeTimer) window.clearTimeout(state.backNoticeTimer);
    state.backNoticeTimer = window.setTimeout(() => {
      state.backExitAttempted = false;
    }, 1800);
    updateBrowserHistory(state.page, { replace: true });
    return;
  }

  state.backExitAttempted = false;
  navigate("home", { replace: true });
}

/**
 * Définit le rôle de l'utilisateur (guest, client, admin).
 * @param {string} role - Rôle à attribuer.
 */
function setRole(role) {
  state.role = role;
}

/* ---------- NAVBAR ---------- */
/**
 * Génère les liens de navigation en fonction du rôle de l'utilisateur.
 * @param {string} role - Rôle de l'utilisateur (guest, client, admin).
 * @returns {Array} Liste de liens sous forme de tableaux [id, label].
 */
function navLinksFor(role) {
  if (role === "client") return [["client-dashboard", "Tableau de bord"], ["client-program", "Mon programme"], ["client-progress", "Ma progression"]];
  if (role === "admin") return [["admin-dashboard", "Vue d'ensemble"], ["admin-clients", "Clients"], ["admin-programs", "Programmes"], ["admin-messages", "Messages"]];
  return [["home", "Accueil"], ["programs", "Programmes"], ["pricing", "Tarifs"], ["faq", "FAQ"], ["blog", "À propos"], ["contact", "Contact"]];
}

/**
 * Rend la barre de navigation en fonction du rôle et de la page actuelle.
 * @returns {string} HTML de la navbar.
 */
/**
 * Rend la barre de navigation en fonction du rôle et de la page actuelle.
 * @returns {string} HTML de la navbar.
 * @description Gère les rôles (guest, client, admin) et les états actifs.
 * Respecte les standards d'accessibilité (focus visible, clavier navigable).
 */
function renderNavbar() {
  const links = navLinksFor(state.role);
  const homeTarget = state.role === "guest" ? "home" : state.role === "client" ? "client-dashboard" : "admin-dashboard";
  
  /**
   * Génère le HTML d'un lien de navigation.
   * @param {string} id - ID de la page.
   * @param {string} label - Libellé du lien.
   * @returns {string} HTML du bouton de navigation.
   */
  const linkHtml = (id, label) =>
    `<button class="nav-link ${state.page === id ? "active" : ""}" data-nav="${id}" aria-current="${state.page === id ? "page" : "false"}">${label}</button>`;

  const rightGuest = `<button class="btn-primary" data-nav="login" aria-label="Se connecter">Se connecter</button>`;
  const rightUser = `<button class="btn-outline-dark" data-nav="home" data-logout="1" aria-label="Quitter">${icon("log-out", 14)} Quitter</button>`;

  return `
  <div class="navbar">
    <div class="wrap">
      <button class="logo" data-nav="${homeTarget}" aria-label="Accueil">
        <span class="logo-badge font-display">M</span>
        <span class="logo-text brand-name font-display">MonProgramme<span>Fit</span></span>
      </button>
      <div class="nav-links" role="navigation" aria-label="Navigation principale">
        ${links.map(([id, l]) => linkHtml(id, l)).join("")}
      </div>
      ${state.role === "guest" ? rightGuest : rightUser}
      <button class="nav-toggle" id="navToggle" aria-label="Menu mobile" aria-controls="navMobile" aria-expanded="false">
        ${icon("menu", 22)}
      </button>
    </div>
    <div class="nav-mobile" id="navMobile" role="navigation" aria-label="Navigation mobile">
      ${links.map(([id, l]) => linkHtml(id, l)).join("")}
      ${state.role === "guest" ? rightGuest : rightUser}
    </div>
  </div>`;
}


/* ---------- GUEST PAGES ---------- */
/**
 * Rend la page d'accueil avec un héros et une grille de programmes.
 * @returns {string} HTML de la section héro + grille de programmes.
 */
/**
 * Rend la page d'accueil avec un héros animé et une grille de programmes.
 * @returns {string} HTML de la section héro + grille de programmes.
 * @description Utilise des animations CSS pour les transitions et les effets de survol.
 * Respecte les standards d'accessibilité (alt text, contrastes).
 */
function renderHome() {
  const [t0, t1, t2] = TRACKS;
  
  // Animation des cartes de programme au survol
  const trailCardAnimation = `
    <style>
      .trail-card {
        transition: var(--transition);
      }
      .trail-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 24px rgba(15, 26, 20, 0.4);
      }
    </style>
  `;
  
  return `
  ${trailCardAnimation}
  <div class="hero">
    <div class="wrap hero-inner">
      <div class="hero-grid">
        <div>
          <p class="eyebrow-ember font-mono">Salle. Maison. Avec ou sans matériel — L'objectif : votre transformation physique.</p>
          <h1 class="h1 font-display">Avec le bon programme et le bon suivi, votre objectif physique est à votre portée.</h1>
          <p class="hero-sub">Des programmes personnalisés adaptés à votre niveau, votre environnement et vos objectifs. Avec ou sans matériel : nous vous accompagnons avec une méthode efficace pour construire votre meilleure version.</p>
          <div class="hero-cta">
            <button class="btn btn-ember" data-nav="signup" aria-label="Trouver mon programme">Trouver mon programme ${icon("arrow-right", 16)}</button>
            <button class="btn btn-line" data-nav="programs" aria-label="Voir les programmes">Voir les programmes</button>
          </div>
        </div>
        <div class="hero-photos">
          <div class="photo-card tall">
            <img src="${t0.img}" alt="${t0.label} — Entraînement en salle de sport" loading="lazy"/>
            <div class="overlay"></div>
            <span class="caption font-mono">${t0.label}</span>
          </div>
          <div class="photo-card">
            <img src="${t1.img}" alt="${t1.label} — Entraînement à domicile avec matériel" loading="lazy"/>
            <div class="overlay"></div>
            <span class="caption font-mono">${t1.label}</span>
          </div>
          <div class="photo-card">
            <img src="${t2.img}" alt="${t2.label} — Entraînement au poids du corps" loading="lazy"/>
            <div class="overlay"></div>
            <span class="caption font-mono">${t2.label}</span>
          </div>
        </div>
      </div>

      <div class="trail-grid">
        ${TRACKS.map((t) => `
          <div class="trail-card">
            <div class="trail-photo">
              <img src="${t.img}" alt="${t.label}" loading="lazy"/>
            </div>
            <div class="trail-body">
              <div class="trail-meta font-mono">${icon("map-pin", 12, "var(--accent-primary)")} DÉPART</div>
              <div class="trail-title-row">
                ${icon(t.icon, 22, "var(--text-primary)")}
                <span class="trail-title font-display">${t.label}</span>
              </div>
              <p class="trail-tagline">${t.tagline}</p>
              <div class="trail-dist font-mono">${t.dist} de progression</div>
            </div>
          </div>`).join("")}
      </div>
    </div>
  </div>

  <div class="section">
    <div class="wrap">
      <p class="eyebrow-moss font-mono">POURQUOI <span class="brand-name">MonProgramme<span>Fit</span></span></p>
      <h2 class="h2 font-display">Fait pour ceux qui commencent, sans excuse liée au matériel.</h2>
      <div class="feature-grid">
        <div class="feature">
          ${icon("flag", 24, "var(--accent-primary)")}
          <h3 class="font-display">Adapté à ta situation</h3>
          <p>Le programme s'ajuste à ton lieu d'entraînement et à ton matériel, pas l'inverse.</p>
        </div>
        <div class="feature">
          ${icon("trending-up", 24, "var(--accent-primary)")}
          <h3 class="font-display">Progression suivie</h3>
          <p>Chaque séance validée fait avancer ta progression, visible sur ton tableau de bord.</p>
        </div>
        <div class="feature">
          ${icon("message-square", 24, "var(--accent-primary)")}
          <h3 class="font-display">Coach accessible</h3>
          <p>Une question, une douleur, un doute ? Le coach répond directement dans ton espace.</p>
        </div>
      </div>
    </div>
  </div>

  <div class="cta-band">
    <div class="wrap">
      <h3 class="font-display">5 secondes de questionnaire pour obtenir un programme sur mesure.</h3>
      <button class="btn btn-ember" data-nav="login" aria-label="Se connecter">Se connecter</button>
    </div>
  </div>`;

}

function renderPrograms() {
  return `
  <div class="section wrap">
    <p class="eyebrow-moss font-mono">LES TROIS DÉPARTS</p>
    <h1 class="h2 font-display">Nos programmes MonProgrammeFit</h1>
    <p class="hero-sub" style="max-width:620px; margin-top:12px;">Chaque parcours a été conçu pour répondre à un contexte réel : salle, maison avec matériel, ou entraînement au poids de corps.</p>
    <div class="grid-3" style="margin-top:32px">
      ${TRACKS.map((t) => `
        <div class="card program-card">
          ${icon(t.icon, 26, "var(--ember)")}
          <h3 class="font-display" style="margin-top:16px;font-size:16px;color:var(--ink)">${t.label}</h3>
          <p style="font-size:14px;color:var(--slate);margin-top:4px">${t.tagline}</p>
          <p class="desc">${t.desc}</p>
          <div class="font-mono" style="font-size:12px;color:var(--moss)">${t.dist} · 3 séances / semaine</div>
          <div style="margin-top:12px">${renderTrialProgram(t.id)}</div>
        </div>`).join("")}
    </div>
    <div class="cta-band" style="margin-top:40px;">
      <div class="wrap">
        <h3 class="font-display">Le bon programme, le bon rythme, la bonne méthode.</h3>
        <button class="btn btn-ember" data-nav="signup" aria-label="Démarrer MonProgrammeFit">Démarrer MonProgrammeFit</button>
      </div>
    </div>
  </div>`;
}

function renderTrialProgram(id) {
  if (id === "gym") {
    return `
      <div class="trial-program">
        <div class="font-mono" style="font-size:12px;color:var(--ink-muted3);margin-bottom:6px">Programme d'essai gratuit</div>
        <div style="font-weight:600;color:var(--ink);margin-bottom:8px">4 séances / semaine — Poussée / Tirage / Jambes + Cardio</div>
        <ul style="font-size:14px;color:var(--slate);margin:0 0 8px 16px">
          <li><strong>Séance 1 — Push</strong> : développé couché, développé militaire, dips — 40–50 min</li>
          <li><strong>Séance 2 — Pull</strong> : traction/row, tirage horizontal, curl — 40–50 min</li>
          <li><strong>Séance 3 — Jambes</strong> : squat, fente, soulevé roumain — 45–55 min</li>
          <li><strong>Séance 4 — Cardio</strong> : 30–40 min (fractionné ou endurance)</li>
        </ul>
          <div style="margin-top:8px"><button class="btn btn-ember" data-nav="signup">Recevez votre programme personnalisé</button></div>
      </div>`;
  }
  if (id === "home-equip") {
    return `
      <div class="trial-program">
        <div class="font-mono" style="font-size:12px;color:var(--ink-muted3);margin-bottom:6px">Programme d'essai gratuit</div>
        <div style="font-weight:600;color:var(--ink);margin-bottom:8px">5 séances / semaine — Haltères (maison)</div>
        <ul style="font-size:14px;color:var(--slate);margin:0 0 8px 16px">
          <li><strong>Séance 1 — Haut</strong> : développé incliné haltères, rowing unilatéral — 40 min</li>
          <li><strong>Séance 2 — Bas</strong> : squat goblet, fente bulgare, soulevé jambe tendue — 45 min</li>
          <li><strong>Séance 3 — Full</strong> : circuit haltères + core — 35–40 min</li>
          <li><strong>Séance 4 — Push</strong> : épaules, triceps, pompes lestées — 40 min</li>
          <li><strong>Séance 5 — Pull / Cardio</strong> : tirage, curls + 20 min cardio léger — 40–45 min</li>
        </ul>
        <div style="margin-top:8px"><button class="btn btn-ember" data-nav="signup">Recevez votre programme personnalisé</button></div>
      </div>`;
  }
  // bodyweight
  return `
    <div class="trial-program">
      <div class="font-mono" style="font-size:12px;color:var(--ink-muted3);margin-bottom:6px">Programme d'essai gratuit</div>
      <div style="font-weight:600;color:var(--ink);margin-bottom:8px">5 séances / semaine — Poids du corps</div>
      <ul style="font-size:14px;color:var(--slate);margin:0 0 8px 16px">
        <li><strong>Séance 1 — Haut</strong> : pompes progressives, dips entre chaises — 30–40 min</li>
        <li><strong>Séance 2 — Bas</strong> : squat, pistol-assisted, fentes sautées — 35–45 min</li>
        <li><strong>Séance 3 — Full</strong> : circuit (burpees, mountain climbers, planche) — 30–35 min</li>
        <li><strong>Séance 4 — Core + mobilité</strong> : planche, hollow, stretching — 25–30 min</li>
        <li><strong>Séance 5 — Endurance</strong> : running ou cardio à la maison 30–40 min</li>
      </ul>
      <div style="margin-top:8px"><button class="btn btn-ember" data-nav="signup">Recevez votre programme personnalisé</button></div>
    </div>`;
}

function renderBlog() {
  return `
  <div class="section wrap">
    <h1 class="h2 font-display">À propos de <span class="brand-name">MonProgramme<span>Fit</span></span></h1>
    <div class="card" style="margin-bottom:32px">
      <p style="font-size:16px;color:var(--ink);line-height:1.8;margin:0">
        <span class="brand-name">MonProgramme<span>Fit</span></span> a été créé pour accompagner toutes les personnes, qu’elles soient débutantes ou qu’elles souhaitent franchir un nouveau cap dans leur transformation physique. Notre objectif est de vous permettre de vous entraîner efficacement, en tenant compte de votre disponibilité, de votre niveau et de vos moyens.
      </p>
      <p style="font-size:16px;color:var(--ink);line-height:1.8;margin:24px 0 0">
        Grâce à des programmes personnalisés et adaptés à vos objectifs, <span class="brand-name">MonProgramme<span>Fit</span></span> vous aide à progresser à votre rythme, que vous vous entraîniez en salle, à domicile, avec ou sans matériel.
      </p>
    </div>
    <div class="advice-box card">
      <p class="eyebrow-moss font-mono" style="margin-bottom:12px">Conseils</p>
      <ul style="margin:0;padding-left:18px;color:var(--ink);font-size:15px;line-height:1.8">
        <li>Privilégiez une bonne exécution des mouvements avant d’augmenter les charges.</li>
        <li>Soyez régulier : la constance est la clé pour obtenir des résultats durables.</li>
        <li>Mangez suffisamment et hydratez-vous pour favoriser la récupération et la progression.</li>
        <li>Dormez au moins 7 à 9 heures par nuit, car la récupération est essentielle au développement musculaire.</li>
      </ul>
    </div>
  </div>`;
}

function renderPricing() {
  return `
  <div class="section wrap">
    <p class="eyebrow-moss font-mono">TARIFS</p>
    <h1 class="h2 font-display">Des formules adaptées à tous les objectifs</h1>
    <p class="hero-sub" style="max-width:620px; margin-top:12px;">Choisis un accompagnement MonProgrammeFit conçu pour ton niveau, ton rythme et ton matériel. Paiement sécurisé en FCFA via FedaPay.</p>
    <div class="grid-3" style="margin-top:32px;">
      <div class="card">
        <h3 class="font-display" style="font-size:18px;color:var(--ink);margin-bottom:12px">Essentiel</h3>
        <p style="font-size:14px;color:var(--slate);margin-bottom:16px">Programme découverte, idéal pour commencer sans stress.</p>
        <div class="stat-val font-display">19€ / semaine</div>
        <ul style="margin:16px 0 0 18px;padding:0;color:var(--ink);font-size:14px;line-height:1.8;">
          <li>Plan hebdomadaire personnalisé</li>
          <li>Accès aux programmes de base</li>
          <li>Support par email</li>
        </ul>
        <button class="btn btn-ember" style="margin-top:20px" data-nav="signup">Choisir</button>
      </div>
      <div class="card">
        <h3 class="font-display" style="font-size:18px;color:var(--ink);margin-bottom:12px">Premium</h3>
        <p style="font-size:14px;color:var(--slate);margin-bottom:16px">Pour un suivi régulier et des ajustements en temps réel.</p>
        <div class="stat-val font-display">39€ / semaine</div>
        <ul style="margin:16px 0 0 18px;padding:0;color:var(--ink);font-size:14px;line-height:1.8;">
          <li>Coaching hebdomadaire</li>
          <li>Programme évolutif</li>
          <li>Conseils nutritionnels</li>
        </ul>
        <button class="btn btn-ember" style="margin-top:20px" data-nav="signup">Choisir</button>
      </div>
      <div class="card">
        <h3 class="font-display" style="font-size:18px;color:var(--ink);margin-bottom:12px">Coach+ </h3>
        <p style="font-size:14px;color:var(--slate);margin-bottom:16px">Accompagnement premium avec accès direct au coach.</p>
        <div class="stat-val font-display">59€ / semaine</div>
        <ul style="margin:16px 0 0 18px;padding:0;color:var(--ink);font-size:14px;line-height:1.8;">
          <li>Support direct instantané</li>
          <li>Programme sur mesure</li>
          <li>Évaluations mensuelles</li>
        </ul>
        <button class="btn btn-ember" style="margin-top:20px" data-nav="signup">Choisir</button>
      </div>
    </div>
  </div>`;
}

function renderFaq() {
  return `
  <div class="section wrap">
    <p class="eyebrow-moss font-mono">FAQ</p>
    <h1 class="h2 font-display">Questions fréquentes</h1>
    <div class="card" style="margin-top:24px;">
      <div class="faq-item">
        <strong>Comment fonctionne MonProgrammeFit ?</strong>
        <p>Tu réponds à un court quiz et tu reçois un programme adapté à ton équipement, ton niveau et tes objectifs.</p>
      </div>
      <div class="faq-item">
        <strong>Puis-je changer de programme plus tard ?</strong>
        <p>Oui, ton coach peut ajuster ton programme en fonction de ta progression et de tes retours.</p>
      </div>
      <div class="faq-item">
        <strong>Est-ce adapté aux débutants ?</strong>
        <p>Absolument. Chaque chemin est construit pour ton niveau actuel et progresse pas à pas.</p>
      </div>
      <div class="faq-item">
        <strong>Quels équipements sont nécessaires ?</strong>
        <p>Les programmes sont disponibles pour la salle, la maison avec matériel et le poids du corps.</p>
      </div>
      <div class="faq-item">
        <strong>Comment contacter mon coach ?</strong>
        <p>Tu peux envoyer un message via l’espace client ou utiliser le lien de contact dédié.</p>
      </div>
    </div>
  </div>`;
}

function renderContact() {
  return `
  <div class="section wrap">
    <p class="eyebrow-moss font-mono">CONTACT</p>
    <h1 class="h2 font-display">Besoin d'aide ? On est là pour toi.</h1>
    <div class="grid-2" style="gap:24px; margin-top:32px;">
      <div class="card">
        <p style="font-size:16px;color:var(--ink);line-height:1.8;">Tu veux poser une question sur un programme, ton inscription ou ton suivi ? Écris-nous et nous reviendrons rapidement.</p>
        <div style="margin-top:24px; display:grid; gap:14px;">
          <div><strong>Email</strong><p style="margin:6px 0 0;color:var(--slate);">contact@monprogrammefit.com</p></div>
          <div><strong>Téléphone</strong><p style="margin:6px 0 0;color:var(--slate);">+229 90 00 00 00</p></div>
          <div><strong>Heures</strong><p style="margin:6px 0 0;color:var(--slate);">Lun–Ven · 8h–18h</p></div>
        </div>
      </div>
      <div class="card">
        <label class="font-mono" style="font-size:12px">Ton nom</label>
        <input class="text-input" type="text" data-contact-name value="${state.drafts.contact.name}" placeholder="Ex: Aïcha" />
        <label class="font-mono" style="font-size:12px">Ton email</label>
        <input class="text-input" type="email" data-contact-email value="${state.drafts.contact.email}" placeholder="ton@email.com" />
        <label class="font-mono" style="font-size:12px">Message</label>
        <textarea class="text-input" rows="5" data-contact-message placeholder="Décris ta demande...">${state.drafts.contact.message}</textarea>
        <button class="btn btn-ember" style="margin-top:8px" data-contact-send="1">Envoyer le message</button>
      </div>
    </div>
  </div>`;
}

function renderLegal() {
  return `
  <div class="section wrap">
    <p class="eyebrow-moss font-mono">MENTIONS</p>
    <h1 class="h2 font-display">Mentions légales et confidentialité</h1>
    <div class="card" style="margin-top:24px;">
      <p style="font-size:15px;color:var(--ink);line-height:1.8;">Le site MonProgrammeFit est la propriété personnelle d'Abdoul Djabar Bakari. Il est édité et exploité par lui, avec des contenus sportifs et pédagogiques destinés à l'accompagnement de personnes souhaitant progresser à leur rythme.</p>
      <h3 class="font-display" style="font-size:16px;margin-top:20px;color:var(--ink);">Protection des données</h3>
      <p style="font-size:15px;color:var(--ink);line-height:1.8;">Les informations collectées sont utilisées uniquement pour te fournir un suivi personnalisé et ne sont pas revendues à des tiers. Tu peux demander la suppression de tes données à tout moment.</p>
      <h3 class="font-display" style="font-size:16px;margin-top:20px;color:var(--ink);">Propriété intellectuelle</h3>
      <p style="font-size:15px;color:var(--ink);line-height:1.8;">Le contenu du site, les programmes et les visuels sont la propriété d'Abdoul Djabar Bakari et sont protégés par le droit d'auteur. Toute reproduction est interdite sauf autorisation.</p>
    </div>
  </div>`;
}

function renderNotFound() {
  return `
  <div class="section wrap">
    <p class="eyebrow-moss font-mono">404</p>
    <h1 class="h2 font-display">Page introuvable</h1>
    <p style="font-size:15px;color:var(--slate);margin-top:16px;max-width:620px;">La page que tu cherches n'existe pas encore ou a peut-être été déplacée. Retourne à l'accueil pour reprendre le fil.</p>
    <button class="btn btn-ember" style="margin-top:24px" data-nav="home">Retour à l'accueil</button>
  </div>`;
}

/**
 * Rend le quiz de personnalisation avec animations et gestion des étapes.
 * @returns {string} HTML du quiz ou du résultat.
 * @description Gère la progression du quiz et l'affichage du résultat final.
 * Utilise des animations CSS pour les transitions entre étapes.
 * Respecte les standards d'accessibilité (focus visible, clavier navigable).
 */
function renderQuiz() {
  // Animation pour la progression du quiz
  const progressAnimation = `
    <style>
      .progress-fill {
        transition: width 0.4s ease-out;
      }
      .quiz-option {
        transition: var(--transition);
      }
      .quiz-option:hover {
        transform: translateX(4px);
        border-color: var(--accent-primary);
      }
      .quiz-option:focus-visible {
        outline: 2px solid var(--accent-primary);
        outline-offset: 2px;
      }
      .quiz-options {
        display: grid;
        gap: 14px;
        max-width: 520px;
      }
      .quiz-option {
        background: var(--surface);
        border: 1px solid var(--line);
        border-radius: 2px;
        padding: 18px 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        color: var(--text-primary);
      }
    </style>
  `;
  
  if (state.quizStep >= QUIZ_STEPS.length) {
    const result = trackById(state.quizAnswers.lieu);
    const actionButton = state.role === 'client'
      ? `<button class="btn btn-ember" style="margin-top:24px" data-nav="client-dashboard" aria-label="Voir mon tableau de bord">Voir mon tableau de bord ${icon("arrow-right", 16)}</button>`
      : `<button class="btn btn-ember" style="margin-top:24px" data-nav="signup" aria-label="Créer mon compte et démarrer">Créer mon compte et démarrer ${icon("arrow-right", 16)}</button>`;
    
    return `
    ${progressAnimation}
    <div class="section wrap">
      <p class="eyebrow-moss font-mono">RÉSULTAT</p>
      <h1 class="h2 font-display">Ton point de départ : ${result.label}</h1>
      <div class="card" style="max-width:560px;padding:32px; animation: fadeIn 0.6s ease-out;">
        ${icon(result.icon, 28, "var(--accent-primary)")}
        <p style="font-size:1rem;color:var(--text-secondary);margin-top:16px; line-height: 1.7;">${result.desc}</p>
        <div class="font-mono" style="font-size:0.875rem;color:var(--accent-secondary);margin-top:16px">${result.dist}</div>
        ${actionButton}
      </div>
    </div>`;
  }
  
  const s = QUIZ_STEPS[state.quizStep];
  const pct = Math.round((state.quizStep / QUIZ_STEPS.length) * 100);
  const optionsHtml = s.options.map((opt) => `
      <button type="button" class="quiz-option" data-quiz-answer="${s.key}:${opt.v}" aria-label="${opt.l}">
        <span>${opt.l}</span>
        ${icon("arrow-right", 16, "var(--ink)")}
      </button>
    `).join("");
  
  return `
  ${progressAnimation}
  <div class="section wrap">
    <div class="font-mono" style="font-size:0.875rem;color:var(--ink-muted3);margin-bottom:12px">ÉTAPE ${state.quizStep + 1} / ${QUIZ_STEPS.length}</div>
    <div class="progress-track">
      <div class="progress-fill" style="width:${pct}%" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"></div>
    </div>
    <h1 class="h2 font-display" style="max-width:560px">${s.q}</h1>
    <p class="hero-sub" style="max-width:620px; margin-top:12px;">Réponds simplement et découvre le programme MonProgrammeFit le plus adapté à ton cadre d'entraînement.</p>
    <div class="quiz-options" style="margin-top:28px;">
      ${optionsHtml}
    </div>
  </div>`;
}

function renderLogin() {
  return `
  <div class="section wrap">
    <div class="login-wrap">
      <h1 class="font-display" style="font-size:24px;text-align:center;color:var(--ink);margin-bottom:4px">Connexion MonProgrammeFit</h1>
      <p style="font-size:14px;text-align:center;color:var(--slate);margin-bottom:32px">Accède à ton espace MonProgrammeFit et continue ton suivi.</p>
      <div class="tabs">
        <button class="tab ${state.loginTab === "client" ? "active" : ""}" data-login-tab="client">Espace client</button>
        <button class="tab ${state.loginTab === "admin" ? "active" : ""}" data-login-tab="admin">Espace admin</button>
      </div>
      <div class="form-grid">
        <input class="text-input" placeholder="Adresse e-mail" />
        <input class="text-input" placeholder="Mot de passe" type="password" />
        <button class="btn btn-ember" style="justify-content:center;margin-top:8px" data-login-submit="1">Se connecter (démo)</button>
      </div>
      <p class="hint">Pas encore de compte ? <button class="btn btn-ember" style="font-size:14px;padding:10px 14px;color:var(--ink);" data-nav="signup">S'inscrire</button></p>
    </div>
  </div>`;
}

function renderSignup() {
  return `
  <div class="section wrap">
    <div class="card" style="max-width:560px;margin:0 auto;padding:24px">
      <h1 class="font-display" style="font-size:22px;margin-bottom:8px">Créer mon compte MonProgrammeFit</h1>
      <p style="font-size:14px;color:var(--slate);margin-bottom:16px">Indique ton objectif et tes mesures actuelles pour démarrer ta transformation.</p>
      <div class="form-grid">
        <label class="font-mono" style="font-size:12px">Prénom</label>
        <input class="text-input" type="text" data-signup-firstname value="${state.drafts.signup.firstName}" placeholder="Ex: Julie" />

        <label class="font-mono" style="font-size:12px">Nom</label>
        <input class="text-input" type="text" data-signup-lastname value="${state.drafts.signup.lastName}" placeholder="Ex: Dubois" />

        <label class="font-mono" style="font-size:12px">Adresse e-mail</label>
        <input class="text-input" type="email" data-signup-email value="${state.drafts.signup.email}" placeholder="ton@exemple.com" />

        <label class="font-mono" style="font-size:12px">Âge</label>
        <input class="text-input" type="number" min="13" data-signup-age value="${state.drafts.signup.age}" placeholder="Ex: 28" />

        <label class="font-mono" style="font-size:12px">Objectif</label>
        <select class="text-input" data-signup-goal>
          <option value="remise" ${state.drafts.signup.goal === "remise" ? "selected" : ""}>Remise en forme</option>
          <option value="perte" ${state.drafts.signup.goal === "perte" ? "selected" : ""}>Perte de poids</option>
          <option value="musculation" ${state.drafts.signup.goal === "musculation" ? "selected" : ""}>Musculation</option>
        </select>

        <label class="font-mono" style="font-size:12px">Poids (kg)</label>
        <input class="text-input" type="number" step="0.1" data-signup-weight value="${state.drafts.signup.weight}" placeholder="Ex: 72.5" />

        <label class="font-mono" style="font-size:12px">Taille (cm)</label>
        <input class="text-input" type="number" step="0.1" data-signup-height value="${state.drafts.signup.height}" placeholder="Ex: 175" />

        <button class="btn btn-ember" style="justify-content:center;margin-top:8px" data-signup-submit="1">Créer mon compte et démarrer</button>
      </div>
    </div>
  </div>`;
}

/* ---------- CLIENT PAGES ---------- */
function renderClientDashboard() {
  const p = CLIENT_PROGRAM;
  const clientName = `${state.clientProfile.firstName || "Client"}${state.clientProfile.lastName ? ` ${state.clientProfile.lastName}` : ""}`.trim();
  const track = trackById(p.track);
  const pct = Math.round((p.week / p.totalWeeks) * 100);
  const maxDone = Math.max(...p.history.map((h) => h.total));
  return `
  <div class="section wrap">
    <p class="eyebrow-moss font-mono">BON RETOUR</p>
    <h1 class="h2 font-display">Tableau de bord MonProgrammeFit</h1>
    <div class="grid-2" style="grid-template-columns:2fr 1fr">
      <div class="card">
        <div class="font-mono" style="font-size:12px;color:var(--ink-muted3);display:flex;align-items:center;gap:8px">${icon(track.icon, 14, "var(--ember)")} ${track.label}</div>
        <h2 class="font-display" style="font-size:18px;color:var(--ink);margin-top:8px">Semaine ${p.week} / ${p.totalWeeks}</h2>
        <div class="progress-bar-bg"><div class="progress-bar-fill" style="width:${pct}%"></div></div>
        <p style="font-size:14px;color:var(--slate);margin-top:16px">Prochaine séance</p>
        <div style="display:flex;align-items:center;justify-content:space-between;margin-top:8px;padding:16px;border-radius:2px;background:var(--chalk-soft)">
          <div style="display:flex;align-items:center;gap:12px">${icon("play", 18, "var(--ember)")}<span style="font-size:14px;font-weight:600;color:var(--ink)">${p.nextSession}</span></div>
          <button class="btn-primary" data-nav="client-program">Démarrer</button>
        </div>
      </div>
      <div class="card">
        <div class="font-mono" style="font-size:12px;color:var(--ink-muted3);display:flex;align-items:center;gap:8px">${icon("bar-chart-3", 14)} RÉGULARITÉ</div>
        <div style="margin-top:16px;display:flex;align-items:flex-end;gap:8px;height:96px">
          ${p.history.map((h, i) => `
            <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px">
              <div style="width:100%;display:flex;flex-direction:column;justify-content:flex-end;height:64px">
                <div style="width:100%;border-radius:2px 2px 0 0;height:${(h.done / h.total) * 100}%;background:${h.done === h.total ? "var(--moss)" : "var(--ember)"}"></div>
              </div>
              <span class="font-mono" style="font-size:10px;color:var(--ink-muted3)">S${i + 1}</span>
            </div>`).join("")}
        </div>
      </div>
    </div>
    <div class="grid-3" style="margin-top:24px">
      <div class="stat-card">${icon("calendar", 20, "var(--moss)")}<div><div class="stat-val font-display">2 / 3</div><div class="stat-label">Séances cette semaine</div></div></div>
      <div class="stat-card">${icon("trending-up", 20, "var(--moss)")}<div><div class="stat-val font-display">9</div><div class="stat-label">Séances totales validées</div></div></div>
      <div class="stat-card" style="flex-direction:column;align-items:flex-start;gap:12px">
        ${icon("mail", 20, "var(--moss)")}
        <div>
          <div class="stat-val font-display">Contact coach</div>
          <div class="stat-label">Envoyer une demande via Gmail</div>
        </div>
        <a class="btn btn-ember" href="https://mail.google.com/mail/?view=cm&fs=1&to=djabaraboul.032003@gmail.com" target="_blank" rel="noreferrer noopener">Contacter coach</a>
      </div>
    </div>
  </div>`;
}

function renderClientProgram() {
  const p = CLIENT_PROGRAM;
  return `
  <div class="section wrap">
    <p class="eyebrow-moss font-mono">MON PROGRAMME</p>
    <h1 class="h2 font-display">Maison — avec matériel · Semaine ${p.week}</h1>
    ${p.sessions.map((s) => `
      <div class="session-row">
        <div class="session-left">
          <div class="session-icon" style="background:${s.done ? "var(--moss)" : "var(--chalk-soft)"}">${icon(s.done ? "check" : "video", 16, s.done ? "#F7F5F0" : "#6B7280")}</div>
          <div>
            <div class="font-display" style="font-size:14px;color:var(--ink)">${s.name}</div>
            <div style="font-size:12px;color:var(--slate);margin-top:2px">${s.exos} exercices · ${s.duree}</div>
          </div>
        </div>
        <button type="button" data-session-action="${s.done ? "review" : "start"}" data-session-name="${encodeURIComponent(s.name)}" style="font-size:14px;font-weight:600;padding:8px 16px;border-radius:2px;${s.done ? "background:transparent;color:var(--moss);border:1px solid var(--line)" : "background:var(--ember);color:var(--ink)"}">${s.done ? "Revoir" : "Commencer"}</button>
      </div>`).join("")}
  </div>`;
}

function renderClientProgress() {
  const p = CLIENT_PROGRAM;
  const activeLabel = state.activeSession ? `<p class="font-mono" style="font-size:0.9rem;color:var(--ink-muted3);margin-bottom:18px">Tu as ouvert : ${state.activeSession}</p>` : "";
  return `
  <div class="section wrap">
    <p class="eyebrow-moss font-mono">MA PROGRESSION</p>
    <h1 class="h2 font-display">Historique des séances</h1>
    ${activeLabel}
    <div style="display:grid;gap:16px">
      ${p.history.map((h) => `
        <div style="display:flex;align-items:center;gap:16px">
          <span class="font-mono" style="font-size:12px;color:var(--ink-muted3);width:80px">${h.name}</span>
          <div class="progress-bar-bg" style="flex:1;margin-top:0"><div class="progress-bar-fill" style="width:${(h.done / h.total) * 100}%"></div></div>
          <span class="font-mono" style="font-size:12px;color:var(--ink);width:48px;text-align:right">${h.done}/${h.total}</span>
        </div>`).join("")}
    </div>
  </div>`;
}

/* ---------- ADMIN PAGES ---------- */
function renderAdminDashboard() {
  const a = ADMIN_STATS;
  const notice = state.adminNotice ? `<div class="card" style="margin:16px 0 0;background:rgba(78,154,122,0.08);border-color:rgba(78,154,122,0.2);">${state.adminNotice}</div>` : "";
  return `
  <div class="admin-panel">
    <section class="admin-cover">
      <div class="admin-cover-toolbar">
        <button class="icon-btn" data-back="1" aria-label="Retour"></button>
        <div class="admin-cover-actions">
          <button class="icon-btn" data-admin-action="notifications" aria-label="Notifications">${icon("bell", 16)}</button>
          <button class="icon-btn" data-admin-action="settings" aria-label="Paramètres">${icon("settings", 16)}</button>
        </div>
      </div>
      <div class="admin-cover-content">
        <div class="admin-avatar-group">
          <div class="admin-avatar-ring">
            <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80" alt="Portrait du coach" />
          </div>
          <div>
            <div class="font-mono" style="color:var(--chalk);font-size:0.75rem;letter-spacing:0.15em;">COACH</div>
            <h1 class="font-display" style="font-size:2.1rem;line-height:1.05;margin:8px 0 4px;color:var(--chalk);">Admin <span class="brand-name">MonProgramme<span>Fit</span></span></h1>
            <div class="admin-avatar-badge">En ligne</div>
          </div>
        </div>
        <div class="admin-points">
          <div class="admin-point">${icon("users", 16, "var(--ember)")} ${a.clients} clients</div>
          <div class="admin-point">${icon("activity", 16, "var(--ember)")} ${a.activeToday} actifs</div>
          <div class="admin-point">${icon("plus", 16, "var(--ember)")} ${a.newThisWeek} nouveaux</div>
        </div>
      </div>
    </section>
    <div class="wrap" style="margin-top:-52px;">
      <div class="admin-cta-row">
        <button class="btn btn-ember" data-nav="admin-clients">${icon("user-plus", 14)} Ajouter un client</button>
        <button class="btn btn-line" data-nav="admin-programs">${icon("bar-chart", 14)} Voir rapports</button>
      </div>
      <div class="admin-tabs">
        <button class="tab active" data-admin-action="go-dashboard">Vue d'ensemble <span class="tab-badge">${a.clients}</span></button>
        <button class="tab" data-admin-action="go-clients">Clients <span class="tab-badge">4</span></button>
        <button class="tab" data-admin-action="go-messages">Messages <span class="tab-badge">${a.messages.length}</span></button>
      </div>
      <div class="admin-sections">
        <section class="admin-section-card">
          <div class="admin-section-title">
            <div>
              <div class="font-mono" style="letter-spacing:0.12em;font-size:0.75rem;color:var(--moss);">PERFORMANCE</div>
              <h2 class="font-display" style="font-size:22px;margin:8px 0 0;color:var(--ink);">Trafic et engagement</h2>
            </div>
            <button class="btn btn-line" data-admin-action="export">${icon("download", 14)} Export</button>
          </div>
          <div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;">
            <div class="admin-stat-card"><div class="stat-val">${a.clients}</div><div class="stat-label">Clients inscrits</div></div>
            <div class="admin-stat-card"><div class="stat-val">${a.activeToday}</div><div class="stat-label">Actifs aujourd'hui</div></div>
            <div class="admin-stat-card"><div class="stat-val">${a.newThisWeek}</div><div class="stat-label">Nouveaux cette semaine</div></div>
          </div>
        </section>
        <section class="admin-section-card">
          <div class="admin-section-title">
            <div>
              <h3 class="font-display" style="font-size:18px;color:var(--ink);margin:0">Programmes favoris</h3>
            </div>
          </div>
          ${notice}
          ${a.popular.map((p) => `
            <div class="admin-section-item">
              <div class="item-icon">${icon("target", 14)}</div>
              <div class="item-label">${p.name}</div>
              <div class="font-mono" style="font-size:12px;color:var(--slate);">${p.pct}%</div>
            </div>`).join("")}
        </section>
        <section class="admin-section-card">
          <div class="admin-section-title">
            <div>
              <h3 class="font-display" style="font-size:18px;color:var(--ink);margin:0">Messages récents</h3>
            </div>
          </div>
          ${a.messages.map((m) => `
            <div class="admin-section-item">
              <div class="item-icon">${icon("message-square", 14)}</div>
              <div>
                <div style="font-weight:700;color:var(--ink);font-size:14px">${m.from}</div>
                <div style="font-size:12px;color:var(--slate);margin-top:4px">${m.preview}</div>
              </div>
              <span class="font-mono" style="font-size:10px;color:var(--ink-muted3);">${m.time}</span>
            </div>`).join("")}
        </section>
      </div>
    </div>
  </div>`;
}

function renderAdminClients() {
  const clients = [
    { name: "Julie T.", track: "Maison — matériel", week: "4/10", status: "Actif" },
    { name: "Karim B.", track: "Salle de gym", week: "7/12", status: "Actif" },
    { name: "Sarah M.", track: "Bodyweight", week: "2/8", status: "En pause" },
    { name: "Marc D.", track: "Salle de gym", week: "12/12", status: "Terminé" },
  ];
  const badgeStyle = (s) => s === "Actif" ? "background:var(--moss-soft);color:var(--moss)" : s === "Terminé" ? "background:var(--chalk-soft);color:var(--slate)" : "background:var(--ember-soft);color:var(--ember)";
  return `
  <div class="section wrap">
    <p class="eyebrow-moss font-mono">GESTION</p>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:32px">
      <h1 class="font-display" style="font-size:28px;color:var(--ink);margin:0">Clients</h1>
      <div class="search-box">${icon("search", 14, "var(--ink-muted3)")}<input placeholder="Rechercher..." /></div>
    </div>
    <div class="card" style="padding:0">
      ${clients.map((c) => `
        <div class="table-row">
          <div style="font-weight:600;font-size:14px;color:var(--ink)">${c.name}</div>
          <div class="font-mono" style="font-size:12px;color:var(--slate)">${c.track}</div>
          <div class="font-mono" style="font-size:12px;color:var(--slate)">${c.week}</div>
          <span class="badge" style="${badgeStyle(c.status)}">${c.status}</span>
        </div>`).join("")}
    </div>
  </div>`;
}

function renderAdminPrograms() {
  const notice = state.adminNotice ? `<div class="card" style="margin-bottom:16px;background:rgba(78,154,122,0.08);border-color:rgba(78,154,122,0.2);">${state.adminNotice}</div>` : "";
  return `
  <div class="section wrap">
    ${notice}
    <p class="eyebrow-moss font-mono">GESTION</p>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:32px">
      <h1 class="font-display" style="font-size:28px;color:var(--ink);margin:0">Programmes</h1>
      <button class="btn btn-ember" data-admin-action="new-program">${icon("plus", 14)} Nouveau programme</button>
    </div>
    <div class="grid-3">
      ${TRACKS.map((t) => `
        <div class="card">
          <div style="display:flex;justify-content:space-between">
            ${icon(t.icon, 22, "var(--ember)")}
            <button style="font-size:12px;color:var(--slate);display:flex;align-items:center;gap:4px" data-admin-action="edit-program">${icon("edit-3", 12)} Modifier</button>
          </div>
          <h3 class="font-display" style="font-size:14px;color:var(--ink);margin-top:16px">${t.label}</h3>
          <p style="font-size:12px;color:var(--slate);margin-top:8px">${t.dist} · 3 séances / semaine</p>
        </div>`).join("")}
    </div>
  </div>`;
}

function renderAdminMessages() {
  const a = ADMIN_STATS;
  return `
  <div class="section wrap">
    <p class="eyebrow-moss font-mono">ÉCHANGES</p>
    <h1 class="h2 font-display">Messages clients</h1>
    <div class="card" style="padding:0">
      ${a.messages.map((m) => `
        <div class="table-row" style="justify-content:flex-start;gap:16px;align-items:flex-start">
          <div style="width:36px;height:36px;border-radius:100px;background:var(--chalk-soft);display:flex;align-items:center;justify-content:center;flex-shrink:0">${icon("user", 16, "var(--slate)")}</div>
          <div style="flex:1">
            <div style="display:flex;justify-content:space-between"><span style="font-weight:600;font-size:14px;color:var(--ink)">${m.from}</span><span class="font-mono" style="font-size:10px;color:var(--ink-muted3)">${m.time}</span></div>
            <p style="font-size:14px;color:var(--slate);margin:4px 0 0">${m.preview}</p>
          </div>
        </div>`).join("")}
    </div>
  </div>`;
}

/* ---------- FOOTER ---------- */
function renderFooter() {
  return `
  <div class="wrap">
    <div class="footer-brand">
      <div class="logo"><span class="logo-badge font-display">M</span><span class="logo-text font-display">MonProgramme<span>Fit</span></span></div>
      <p class="font-mono">© 2026 <span class="brand-name">MonProgramme<span>Fit</span></span> — coaching sportif personnalisé</p>
    </div>
    <div class="footer-links">
      <button class="nav-link" data-nav="contact">Contact</button>
      <button class="nav-link" data-nav="legal">Mentions</button>
    </div>
  </div>`;
}

/* ---------- PAGE DISPATCH ---------- */
const PAGES = {
  "home": renderHome,
  "programs": renderPrograms,
  "pricing": renderPricing,
  "faq": renderFaq,
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

/* ---------- MAIN RENDER ---------- */
function render() {
  const navContainer = document.getElementById("app");
  const main = document.getElementById("main-content");
  const footerContainer = document.getElementById("appFooter");
  const pageFn = PAGES[state.page] || renderNotFound;
  if (navContainer) navContainer.innerHTML = renderNavbar();
  if (main) main.innerHTML = pageFn();
  if (footerContainer) footerContainer.innerHTML = renderFooter();
  if (window.lucide) window.lucide.createIcons();
}

/* ---------- EVENT DELEGATION ---------- */
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
});

document.addEventListener("click", (e) => {
  const backBtn = e.target.closest("[data-back]");
  const contactSendBtn = e.target.closest("[data-contact-send]");
  const sessionActionBtn = e.target.closest("[data-session-action]");
  const adminActionBtn = e.target.closest("[data-admin-action]");
  const navBtn = e.target.closest("[data-nav]");
  const roleNavBtn = e.target.closest("[data-role-nav]");
  const quizBtn = e.target.closest("[data-quiz-answer]");
  const loginTabBtn = e.target.closest("[data-login-tab]");
  const signupSubmitBtn = e.target.closest("[data-signup-submit]");
  const loginSubmitBtn = e.target.closest("[data-login-submit]");
  const toggleBtn = e.target.closest("#navToggle");

  if (backBtn) {
    goBack();
    return;
  }

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

  if (sessionActionBtn) {
    const action = sessionActionBtn.dataset.sessionAction;
    const sessionName = sessionActionBtn.dataset.sessionName || "";
    state.activeSession = sessionName;
    if (action === 'start') {
      navigate('client-progress');
      return;
    }
    if (action === 'review') {
      navigate('client-progress');
      return;
    }
  }

  if (adminActionBtn) {
    const action = adminActionBtn.dataset.adminAction;
    if (action === "notifications") {
      state.adminNotice = "Centre de notifications — 3 messages non lus à traiter.";
      navigate("admin-messages");
      return;
    }
    if (action === "settings") {
      state.adminNotice = "Paramètres du coach — l’éditeur de configuration arrive dans la prochaine itération.";
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
      state.adminNotice = "Création de programme — l’éditeur de contenu sera branché dans la prochaine version.";
      render();
      return;
    }
    if (action === "edit-program") {
      state.adminNotice = "Édition du programme — le formulaire d’édition est prévu dans la prochaine itération.";
      render();
      return;
    }
  }

  if (toggleBtn) {
    const navMobile = document.getElementById("navMobile");
    if (navMobile) {
      navMobile.classList.toggle("open-mobile");
      toggleBtn.setAttribute("aria-expanded", navMobile.classList.contains("open-mobile") ? "true" : "false");
    }
    return;
  }

  if (navBtn) {
    if (navBtn.dataset.logout) { state.role = "guest"; }
    navigate(navBtn.dataset.nav);
    return;
  }

  if (roleNavBtn) {
    const [role, page] = roleNavBtn.dataset.roleNav.split(":");
    state.role = role;
    navigate(page);
    return;
  }

  if (quizBtn) {
    const [key, val] = quizBtn.dataset.quizAnswer.split(":");
    state.quizAnswers[key] = val;
    state.quizStep += 1;
    render();
    return;
  }

  if (loginTabBtn) {
    state.loginTab = loginTabBtn.dataset.loginTab;
    render();
    return;
  }

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

  if (loginSubmitBtn) {
    state.role = state.loginTab;
    navigate(state.loginTab === "client" ? "client-dashboard" : "admin-dashboard");
    return;
  }
});

/* ---------- INIT ---------- */
restorePersistedState();
window.addEventListener("popstate", handleBackNavigation);
window.addEventListener("pageshow", () => {
  persistState();
});
render();
