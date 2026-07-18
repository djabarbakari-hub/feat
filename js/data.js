/* ==========================================================
   data.js — Données statiques de l'application (mock).
   Aucune logique ici : uniquement des constantes.
   ========================================================== */

// Les 3 parcours d'entraînement proposés
export const TRACKS = [
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

// Étapes du quiz d'onboarding
export const QUIZ_STEPS = [
  {
    q: "Bienvenue chez MonProgrammeFit",
    key: "welcome",
    type: "text",
    placeholder: "Ton prénom (optionnel)",
    button: "Commencer mon onboarding"
  },
  {
    q: "Quel est ton objectif principal ?",
    key: "objectif",
    options: [
      { v: "perte-poids", l: "Perte de poids", icon: "weight" },
      { v: "prise-muscle", l: "Prise de muscle", icon: "dumbbell" },
      { v: "endurance", l: "Endurance", icon: "activity" },
      { v: "sante", l: "Santé générale", icon: "heart" },
    ]
  },
  { q: "Où comptes-tu t'entraîner le plus souvent ?", key: "lieu", options: [
    { v: "gym", l: "En salle de sport", icon: "dumbbell" },
    { v: "home-equip", l: "Chez moi, avec un peu de matériel", icon: "home" },
    { v: "bodyweight", l: "Chez moi, sans matériel", icon: "footprints" },
  ]},
  { q: "Ton niveau actuel en activité physique ?", key: "niveau", options: [
    { v: "debutant", l: "Débutant complet", icon: "user" },
    { v: "occasionnel", l: "Je bouge de temps en temps", icon: "calendar" },
    { v: "reguliers", l: "Je suis déjà assez actif·ve", icon: "zap" },
  ]},
  { q: "Combien de séances par semaine vises-tu ?", key: "frequence", options: [
    { v: "2", l: "2 séances", icon: "2-circle" },
    { v: "3-4", l: "3 à 4 séances", icon: "3-circle" },
    { v: "5+", l: "5 séances ou plus", icon: "plus-circle" },
  ]},
  {
    q: "Pour aller plus loin (optionnel)",
    key: "physique",
    type: "optional",
    fields: [
      { key: "poids", label: "Poids (kg)", type: "number", step: "0.1", placeholder: "Ex: 72.5" },
      { key: "taille", label: "Taille (cm)", type: "number", placeholder: "Ex: 175" },
      { key: "age", label: "Âge", type: "number", placeholder: "Ex: 30" },
    ],
    button: "Passer",
    buttonNext: "Suivant"
  },
  {
    q: "Voici ton programme personnalisé",
    key: "resume",
    type: "resume",
    button: "Confirmer et commencer"
  }
];

// Programme client de démonstration (pas encore branché sur un backend)
export const CLIENT_PROGRAM = {
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

// Statistiques admin de démonstration (pas encore branchées sur un backend)
export const ADMIN_STATS = {
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
