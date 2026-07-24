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

// Programmes officiels rédigés par le Coach Abdou BAKARI
export const COACH_PROGRAMS = [
  {
    id: "prise-de-muscle-home",
    title: "MONPROGRAMMEFIT : PROGRAMME PRISE DE MUSCLE",
    subtitle: "Maison avec matériel",
    author: "Coach Abdou BAKARI",
    duration: "8 semaines",
    level: "Débutant - Intermédiaire",
    frequency: "5 séances / semaine",
    trackId: "home-equip",
    objective: "Développer la masse musculaire à domicile grâce à une progression des charges, des répétitions et du contrôle des mouvements.",
    equipment: [
      "2 haltères réglables (ou une paire d'haltères)",
      "Barre droite ou barre EZ (si disponible)",
      "Bandes élastiques de différentes résistances",
      "Banc réglable (idéalement)",
      "Barre de traction (facultative mais recommandée)"
    ],
    warmup: {
      duration: "10 minutes",
      steps: [
        "2 à 3 min de corde à sauter ou jumping jacks",
        "Rotations des épaules, poignets, hanches et chevilles (15 répétitions chacune)",
        "2 séries légères du premier exercice"
      ]
    },
    generalRules: {
      rest: "Exercices principaux : 90 secondes | Exercices d'isolation : 45 à 60 secondes",
      tempo: "Descente : 2 secondes | Pause : 0 à 1 seconde | Montée : 2 secondes",
      progression: "Lorsque tu atteins le maximum de répétitions avec une bonne technique sur toutes les séries, augmente légèrement la charge ou ajoute 1 à 2 répétitions par série si tes haltères sont déjà au maximum."
    },
    weeklySchedule: [
      { day: "Lundi", focus: "Pectoraux + Biceps" },
      { day: "Mardi", focus: "Dos + Triceps" },
      { day: "Mercredi", focus: "Jambes" },
      { day: "Jeudi", focus: "Haut du corps (Push/Pull)" },
      { day: "Vendredi", focus: "Épaules + Bras" }
    ],
    sessions: [
      {
        id: "s_lundi",
        day: "Lundi",
        name: "Lundi — Pectoraux & Biceps",
        duration: "45 min",
        exosCount: 7,
        restNote: "90s sur exercices principaux, 45-60s sur exercices d'isolation",
        exercises: [
          { name: "Développé couché avec haltères", sets: "4", reps: "8–12", rest: "90s", type: "principal", desc: "Position allongée sur banc, poussée verticale synchronisée, contrôle strict à la descente." },
          { name: "Développé incliné avec haltères", sets: "3", reps: "10–12", rest: "90s", type: "principal", desc: "Banc incliné à 30-45°, accent sur le haut du buste." },
          { name: "Écartés avec haltères", sets: "3", reps: "12–15", rest: "60s", type: "isolation", desc: "Légère flexion des coudes, étirement contrôlé de la cage thoracique." },
          { name: "Pompes lestées ou avec élastique", sets: "3", reps: "10–15", rest: "60s", type: "isolation", desc: "Gainage abdominal ferme, poitrine frôle le sol." },
          { name: "Curl haltères debout", sets: "4", reps: "10–12", rest: "60s", type: "isolation", desc: "Coudes fixes le long du corps, supination en fin de mouvement." },
          { name: "Curl incliné", sets: "3", reps: "12–15", rest: "45s", type: "isolation", desc: "Assis sur banc incliné, étirement maximal du biceps." },
          { name: "Curl marteau", sets: "3", reps: "12", rest: "45s", type: "isolation", desc: "Prise neutre, sollicitation du brachial et du long supinateur." }
        ]
      },
      {
        id: "s_mardi",
        day: "Mardi",
        name: "Mardi — Dos & Triceps",
        duration: "45 min",
        exosCount: 7,
        restNote: "90s sur exercices principaux, 45-60s sur exercices d'isolation",
        exercises: [
          { name: "Rowing haltère à un bras", sets: "4", reps: "10–12 / bras", rest: "90s", type: "principal", desc: "Genou sur banc, tirage du coude vers la hanche sans rotation du buste." },
          { name: "Tirage horizontal avec élastique", sets: "4", reps: "12–15", rest: "60s", type: "isolation", desc: "Ancrage solide, serrez les omoplates 1 seconde en fin de contraction." },
          { name: "Pull-over avec haltère", sets: "3", reps: "12", rest: "60s", type: "isolation", desc: "Allongé en travers du banc, ouverture de la cage thoracique." },
          { name: "Face Pull avec élastique", sets: "3", reps: "15", rest: "45s", type: "isolation", desc: "Tirage à hauteur du visage pour le deltoïde postérieur et la posture." },
          { name: "Extensions triceps au-dessus de la tête", sets: "4", reps: "10–12", rest: "60s", type: "isolation", desc: "Haltère tenu à deux mains, coudes serrés vers le haut." },
          { name: "Kickback triceps", sets: "3", reps: "12–15", rest: "45s", type: "isolation", desc: "Buste penché, extension complète du bras parallèle au sol." },
          { name: "Pompes prise serrée", sets: "3", reps: "10–15", rest: "60s", type: "isolation", desc: "Mains rapprochées sous la poitrine pour isoler les triceps." }
        ]
      },
      {
        id: "s_mercredi",
        day: "Mercredi",
        name: "Mercredi — Jambes",
        duration: "45 min",
        exosCount: 6,
        restNote: "90s sur exercices principaux, 45-60s sur exercices d'isolation",
        exercises: [
          { name: "Goblet Squat", sets: "4", reps: "10–12", rest: "90s", type: "principal", desc: "Haltère tenu contre le haut de la poitrine, flexion profonde contrôlée." },
          { name: "Bulgarian Split Squat", sets: "3", reps: "10 / jambe", rest: "90s", type: "principal", desc: "Pied arrière posé sur le banc, descente verticale du genou arrière." },
          { name: "Soulevé de terre roumain avec haltères", sets: "4", reps: "10–12", rest: "90s", type: "principal", desc: "Flexion des hanches, dos plat, étirement ciblé des ischio-jambiers." },
          { name: "Hip Thrust avec haltère", sets: "3", reps: "12–15", rest: "60s", type: "isolation", desc: "Haut du dos sur le banc, poussée fessière avec extension complète du bassin." },
          { name: "Fentes marchées avec haltères", sets: "3", reps: "12 / jambe", rest: "60s", type: "isolation", desc: "Pas réguliers et contrôlés, buste droit." },
          { name: "Élévations mollets", sets: "4", reps: "20", rest: "45s", type: "isolation", desc: "Debout sur une marche, amplitude maximale en bas et contraction en haut." }
        ]
      },
      {
        id: "s_jeudi",
        day: "Jeudi",
        name: "Jeudi — Haut du corps (Push/Pull)",
        duration: "40 min",
        exosCount: 6,
        restNote: "90s sur exercices principaux, 45-60s sur exercices d'isolation",
        exercises: [
          { name: "Développé militaire avec haltères", sets: "4", reps: "8–12", rest: "90s", type: "principal", desc: "Poussée verticale au-dessus de la tête en position assise ou debout." },
          { name: "Tractions (ou tirage élastique)", sets: "4", reps: "8–12", rest: "90s", type: "principal", desc: "Prise pronation ou supination, menton au-dessus de la barre." },
          { name: "Développé incliné", sets: "3", reps: "10", rest: "90s", type: "principal", desc: "Travail du haut des pectoraux et deltoïdes antérieurs." },
          { name: "Rowing buste penché", sets: "3", reps: "10–12", rest: "90s", type: "principal", desc: "Buste incliné à 45°, tirage des haltères vers le bas du ventre." },
          { name: "Élévations latérales", sets: "3", reps: "15", rest: "45s", type: "isolation", desc: "Mouvement fluide vers les côtés sans élan du buste." },
          { name: "Pull-over", sets: "3", reps: "12", rest: "60s", type: "isolation", desc: "Finition du travail des grands dorsaux et dentelés." }
        ]
      },
      {
        id: "s_vendredi",
        day: "Vendredi",
        name: "Vendredi — Épaules & Bras",
        duration: "50 min",
        exosCount: 8,
        restNote: "90s sur exercices principaux, 45-60s sur exercices d'isolation",
        exercises: [
          { name: "Développé épaules", sets: "4", reps: "8–12", rest: "90s", type: "principal", desc: "Stabilité du buste, poussée contrôlée pour le volume des épaules." },
          { name: "Élévations latérales", sets: "4", reps: "12–15", rest: "45s", type: "isolation", desc: "Isolement de la portion moyenne du deltoïde." },
          { name: "Oiseau avec haltères", sets: "3", reps: "15", rest: "45s", type: "isolation", desc: "Buste penché vers l'avant, ouverture pour le deltoïde postérieur." },
          { name: "Shrugs avec haltères", sets: "3", reps: "15", rest: "45s", type: "isolation", desc: "Élévation des épaules vers les oreilles pour les trapèzes." },
          { name: "Curl barre ou haltères", sets: "3", reps: "10–12", rest: "60s", type: "isolation", desc: "Contraction bilatérale intense des biceps." },
          { name: "Curl marteau", sets: "3", reps: "12", rest: "45s", type: "isolation", desc: "Travail de l'épaisseur de l'avant-bras et biceps." },
          { name: "Extension triceps avec élastique", sets: "3", reps: "12–15", rest: "45s", type: "isolation", desc: "Tension continue garantie par l'élastique." },
          { name: "Dips entre deux chaises (si sécuritaire)", sets: "3", reps: "10–15", rest: "60s", type: "isolation", desc: "Coudes orientés vers l'arrière, flexion à 90°." }
        ]
      }
    ],
    stretching: {
      duration: "5 à 10 minutes",
      exercises: [
        "Pectoraux : 30 s × 2",
        "Dos : 30 s × 2",
        "Épaules : 30 s × 2",
        "Quadriceps : 30 s × 2",
        "Ischio-jambiers : 30 s × 2",
        "Mollets : 30 s × 2"
      ]
    },
    progressionPlan: [
      { period: "Semaines 1–2", desc: "Apprends les mouvements et trouve des charges adaptées." },
      { period: "Semaines 3–4", desc: "Augmente progressivement les répétitions ou les charges." },
      { period: "Semaines 5–6", desc: "Ajoute une série supplémentaire sur les exercices principaux si tu récupères bien." },
      { period: "Semaines 7–8", desc: "Intensifie avec des techniques comme les supersets (ex: développé couché + pompes) sur le dernier bloc." }
    ],
    keyTips: [
      "Vise un apport quotidien de 1,6 à 2,2 g de protéines par kg de poids corporel.",
      "Cherche à progresser chaque semaine, même légèrement.",
      "Si les haltères deviennent trop légers, ralentis davantage la phase de descente, ajoute une pause en contraction ou augmente les répétitions.",
      "Garde une technique stricte : la qualité des mouvements reste plus importante que la charge utilisée."
    ]
  }
];


