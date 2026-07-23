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
    type: "info",
    button: "Commencer mon onboarding"
  },
  {
    q: "Quel est ton objectif principal ?",
    key: "objectif",
    options: [
      { v: "perte-poids", l: "Perte de poids", icon: "weight" },
      { v: "musculation", l: "Musculation / Prise de masse", icon: "dumbbell" },
      { v: "endurance-sante", l: "Endurance & Santé", icon: "heart" },
    ]
  },
  { q: "Où comptes-tu t'entraîner le plus souvent ?", key: "lieu", options: [
    { v: "gym", l: "En salle de sport", icon: "dumbbell" },
    { v: "home-equip", l: "Chez moi, avec un peu de matériel", icon: "home" },
    { v: "bodyweight", l: "Chez moi, sans matériel", icon: "footprints" },
  ]},
  { q: "Ton niveau actuel en activité physique ?", key: "niveau", options: [
    { v: "debutant", l: "Débutant (moins de 6 mois)", icon: "user" },
    { v: "intermediaire", l: "Intermédiaire (6 mois à 2 ans)", icon: "calendar" },
    { v: "avance", l: "Avancé (plus de 2 ans)", icon: "zap" },
  ]},
  { q: "Combien de séances par semaine vises-tu ?", key: "frequence", options: [
    { v: "2", l: "2 séances par semaine", icon: "calendar" },
    { v: "3", l: "3 séances par semaine", icon: "calendar" },
    { v: "4", l: "4 séances par semaine", icon: "calendar" },
    { v: "5", l: "5 séances ou plus", icon: "plus-circle" },
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

