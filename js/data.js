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
  },
  {
    id: "sante-endurance-bodyweight",
    title: "MONPROGRAMMEFIT : PROGRAMME SANTÉ GÉNÉRALE & ENDURANCE",
    subtitle: "Maison – Poids du corps (sans matériel)",
    author: "Coach Abdou BAKARI",
    duration: "8 semaines",
    level: "Débutant - Intermédiaire",
    frequency: "5 séances / semaine",
    trackId: "bodyweight",
    objective: "Ce programme est conçu pour améliorer l'endurance cardiovasculaire, développer un corps plus fort et mobile, améliorer l'équilibre et réduire la fatigue quotidienne de manière accessible, sans aucun matériel.",
    equipment: [
      "Aucun matériel requis (poids du corps)",
      "Tapis de sol"
    ],
    warmup: {
      duration: "8 à 10 minutes",
      steps: [
        "Jumping jacks : 2 min",
        "Montées de genoux : 1 min",
        "Talons-fesses : 1 min",
        "Squats au poids du corps : 15 répétitions",
        "Fentes : 10 par jambe",
        "Cercles articulaires : 2 min"
      ]
    },
    generalRules: {
      rest: "Exercices classiques : 30 à 60 secondes | Circuits : 20 à 30 secondes entre exercices, 1 min 30 entre les tours",
      intensity: "Objectif : être actif régulièrement, améliorer progressivement ses capacités. Pas besoin d'aller à l'échec."
    },
    weeklySchedule: [
      { day: "Lundi", focus: "Full Body fonctionnel" },
      { day: "Mardi", focus: "Cardio endurance + mobilité" },
      { day: "Mercredi", focus: "Renforcement général" },
      { day: "Jeudi", focus: "Circuit cardio + coordination" },
      { day: "Vendredi", focus: "Endurance longue + récupération active" }
    ],
    sessions: [
      {
        id: "sbw_lundi",
        day: "Lundi",
        name: "Lundi — Full Body fonctionnel",
        duration: "35-45 min",
        exosCount: 6,
        restNote: "30-60s sur exercices classiques | Circuit : 20-30s entre exercices, 90s de repos entre les 4 tours",
        exercises: [
          { name: "Squats poids du corps", reps: "20", type: "principal", desc: "Gardez le dos bien droit et contrôlez la descente." },
          { name: "Pompes (sur les genoux pour les débutants)", reps: "12–20", type: "principal", desc: "Gainage ferme, alignement tête-bassin-genoux." },
          { name: "Fentes arrière", reps: "15 / jambe", type: "principal", desc: "Descente verticale contrôlée, genou arrière proche du sol." },
          { name: "Superman", reps: "20", type: "isolation", desc: "Allongé sur le ventre, soulevez simultanément bras et jambes pour renforcer le dos." },
          { name: "Mountain climbers", reps: "40s", type: "isolation", desc: "Mouvement de course dynamique face au sol, gardez le bassin bas." },
          { name: "Planche statique", reps: "45s", type: "isolation", desc: "Gainage abdominal et fessier maximal." }
        ]
      },
      {
        id: "sbw_mardi",
        day: "Mardi",
        name: "Mardi — Cardio endurance + mobilité",
        duration: "45-60 min",
        exosCount: 6,
        restNote: "Allure contrôlée pour le cardio, amplitude maximale pour la mobilité",
        exercises: [
          { name: "Cardio principal (Option Marche rapide ou Course)", reps: "30–60 min", type: "principal", desc: "Marche rapide : 45-60 min OU Course légère : 30 min (S1-2: 2m course / 1m marche, S3-4: 5m course / 1m marche, S5-8: course continue)." },
          { name: "Rotation thoracique", reps: "10 / côté", type: "isolation", desc: "Mobilité de la colonne, déverrouille le haut du corps." },
          { name: "Ouverture des hanches", reps: "10 / côté", type: "isolation", desc: "Cercles amples des genoux vers l'extérieur." },
          { name: "Étirement des ischio-jambiers", reps: "30s", type: "isolation", desc: "Étirement doux sans à-coups." },
          { name: "Mobilité épaules", reps: "15", type: "isolation", desc: "Cercles de bras amples avant/arrière." },
          { name: "Position squat profond", reps: "45s", type: "isolation", desc: "Tenez le bas du squat, buste fier, ouvrez les hanches avec les coudes." }
        ]
      },
      {
        id: "sbw_mercredi",
        day: "Mercredi",
        name: "Mercredi — Renforcement général",
        duration: "35-45 min",
        exosCount: 6,
        restNote: "30-60s sur exercices classiques | Circuit : 20-30s entre exercices, 2 min de repos entre les 4 tours",
        exercises: [
          { name: "Squats poids du corps", reps: "20", type: "principal", desc: "Flexion contrôlée des hanches et genoux." },
          { name: "Pompes classiques ou sur genoux", reps: "15", type: "principal", desc: "Buste frôle le sol." },
          { name: "Pont fessier (Glute bridge)", reps: "20", type: "principal", desc: "Allongé sur le dos, poussez les hanches vers le haut en serrant fort les fessiers." },
          { name: "Fentes alternées (avant)", reps: "20", type: "principal", desc: "Pas avant contrôlé en alternant." },
          { name: "Pike push-ups (objectif épaules)", reps: "10–15", type: "principal", desc: "Fesses levées en V inversé, fléchissez les coudes pour rapprocher la tête du sol." },
          { name: "Gainage planche", reps: "60s", type: "isolation", desc: "Maintien statique horizontal." }
        ]
      },
      {
        id: "sbw_jeudi",
        day: "Jeudi",
        name: "Jeudi — Circuit cardio + coordination",
        duration: "35-45 min",
        exosCount: 6,
        restNote: "Circuit : 20-30s de transition, 2 min de repos complet entre les 5 tours",
        exercises: [
          { name: "Burpees", reps: "8–12", type: "principal", desc: "Mouvement complet et fluide : squat, planche, pompe facultative, saut." },
          { name: "Jumping jacks", reps: "50", type: "principal", desc: "Mouvement de saut dynamique et synchronisé." },
          { name: "Squats sautés", reps: "15", type: "principal", desc: "Squat explosif avec saut vertical, réception amortie." },
          { name: "Mountain climbers", reps: "45s", type: "principal", desc: "Rythme cardiovasculaire soutenu." },
          { name: "Skaters", reps: "30", type: "principal", desc: "Sauts latéraux d'un pied sur l'autre en restant bas." },
          { name: "Gainage dynamique", reps: "45s", type: "isolation", desc: "Transition avant-bras / mains ou tap-épaules en planche." }
        ]
      },
      {
        id: "sbw_vendredi",
        day: "Vendredi",
        name: "Vendredi — Endurance longue + récupération active",
        duration: "50-70 min",
        exosCount: 6,
        restNote: "Faire les 3 tours de renforcement léger à rythme modéré",
        exercises: [
          { name: "Cardio principal (Marche, course ou randonnée)", reps: "40–90 min", type: "principal", desc: "Option 1 : Marche rapide — 60 min. Option 2 : Course légère — 40 min. Option 3 : Randonnée — 60 à 90 min." },
          { name: "Squats", reps: "20", type: "principal", desc: "Mouvement fluide pour activer la circulation." },
          { name: "Pompes", reps: "10–15", type: "principal", desc: "Amplitude et contrôle." },
          { name: "Bird dog", reps: "20", type: "isolation", desc: "À quatre pattes, étendez le bras opposé à la jambe tendue. Gardez le dos plat." },
          { name: "Superman", reps: "20", type: "isolation", desc: "Extension douce de la chaîne postérieure." },
          { name: "Planche statique", reps: "60s", type: "isolation", desc: "Maintien final." }
        ]
      }
    ],
    stretching: {
      duration: "5 à 10 minutes",
      exercises: [
        "Rotations et étirements des hanches",
        "Étirement du dos et de la cage thoracique",
        "Étirement passif des cuisses et mollets"
      ]
    },
    progressionPlan: [
      { period: "Semaines 1–2", desc: "Adaptation : apprendre les mouvements, créer l'habitude de s'entraîner régulièrement. N'hésitez pas à faire 3 tours au lieu de 4." },
      { period: "Semaines 3–4", desc: "Amélioration : essayez de rajouter +5 répétitions par exercice de renforcement ou diminuez les temps de repos de 5 secondes." },
      { period: "Semaines 5–6", desc: "Développement : intégrez des variantes plus difficiles (ex: pompes ralenties à la descente, squats sautés plus explosifs) ou tentez d'ajouter un tour de circuit." },
      { period: "Semaines 7–8", desc: "Consolidation : maximisez votre endurance en rajoutant 10 minutes d'activité cardiovasculaire légère sur deux des séances de la semaine." }
    ],
    keyTips: [
      "Bougez au quotidien : marchez au moins 8 000 à 12 000 pas par jour.",
      "Accordez quelques minutes chaque jour à la mobilité articulaire pour limiter les tensions.",
      "Optimisez votre récupération avec un sommeil réparateur de 7 à 9 heures.",
      "Consommez suffisamment de protéines de qualité pour nourrir votre corps.",
      "Évitez les postures statiques prolongées (levez-vous régulièrement si vous travaillez assis)."
    ]
  },
  {
    id: "sante-endurance-home",
    title: "MONPROGRAMMEFIT : PROGRAMME SANTÉ GÉNÉRALE & ENDURANCE",
    subtitle: "Maison avec matériel (haltères + élastiques + barre)",
    author: "Coach Abdou BAKARI",
    duration: "8 semaines",
    level: "Débutant - Intermédiaire",
    frequency: "5 séances / semaine",
    trackId: "home-equip",
    objective: "Ce programme vise à améliorer la condition physique globale, développer une meilleure endurance musculaire et cardiovasculaire, renforcer les articulations et la posture, et développer un corps fonctionnel à domicile.",
    equipment: [
      "Haltères (ou paire d'haltères réglables)",
      "Élastiques de résistance",
      "Barre (optionnelle)",
      "Chaise ou banc solide",
      "Tapis de sol"
    ],
    warmup: {
      duration: "10 minutes",
      steps: [
        "Activation cardio (3 min) : Jumping jacks, Corde à sauter ou montées de genoux",
        "Squats au poids du corps : 15 répétitions",
        "Pompes : 10 répétitions",
        "Fentes : 10 par jambe",
        "Rotations articulaires"
      ]
    },
    generalRules: {
      rest: "Exercices de force : 60 à 90 secondes | Circuits : 20 à 40 secondes entre exercices, 90 secondes entre les tours",
      intensity: "Travailler à environ 6 à 8/10 d'effort. Le but est de terminer la séance avec une bonne sensation d'énergie, pas d'être totalement épuisé."
    },
    weeklySchedule: [
      { day: "Lundi", focus: "Full Body fonctionnel" },
      { day: "Mardi", focus: "Cardio endurance + Core" },
      { day: "Mercredi", focus: "Force générale + mobilité" },
      { day: "Jeudi", focus: "Circuit cardio-musculaire" },
      { day: "Vendredi", focus: "Endurance longue + récupération active" }
    ],
    sessions: [
      {
        id: "shm_lundi",
        day: "Lundi",
        name: "Lundi — Full Body fonctionnel",
        duration: "45-55 min",
        exosCount: 7,
        restNote: "Suivez scrupuleusement les temps de repos indiqués",
        exercises: [
          { name: "Goblet squat avec haltère", sets: "4", reps: "12", rest: "75s", type: "principal", desc: "Dos droit, descente contrôlée, poussez fort dans les talons." },
          { name: "Développé couché avec haltères au sol", sets: "4", reps: "12", rest: "75s", type: "principal", desc: "Allongé sur le dos au sol, poussez les haltères verticalement." },
          { name: "Rowing haltère à un bras", sets: "4", reps: "12 / bras", rest: "60s", type: "principal", desc: "Dos plat, tirez le coude vers la hanche en contrôlant le retour." },
          { name: "Soulevé de terre roumain avec haltères", sets: "3", reps: "12", rest: "90s", type: "principal", desc: "Flexion de hanches en arrière, dos neutre, ressentez l'étirement des ischios." },
          { name: "Développé épaules avec haltères", sets: "3", reps: "12", rest: "60s", type: "principal", desc: "Poussée verticale au-dessus de la tête." },
          { name: "Farmer walk avec haltères", sets: "4", reps: "40s", rest: "60s", type: "isolation", desc: "Marchez droit et fièrement en portant un haltère lourd de chaque côté." },
          { name: "Gainage planche", sets: "3", reps: "45s", rest: "45s", type: "isolation", desc: "Gainage abdominal ferme, corps aligné." }
        ]
      },
      {
        id: "shm_mardi",
        day: "Mardi",
        name: "Mardi — Cardio endurance + Core",
        duration: "45-60 min",
        exosCount: 5,
        restNote: "Repos de 60s entre les exercices de gainage",
        exercises: [
          { name: "Cardio principal (Option Marche rapide ou Running)", reps: "30-60 min", type: "principal", desc: "Marche rapide : 45-60 min OU Running léger : 30 min (S1-2: 2m course / 1m marche, S3-4: 5m course / 1m marche, S5-8: course continue)." },
          { name: "Relevé de jambes", sets: "3", reps: "15", rest: "60s", type: "isolation", desc: "Allongé au sol, levez les jambes verticalement, contrôlez la descente." },
          { name: "Russian twist", sets: "3", reps: "20", rest: "60s", type: "isolation", desc: "Rotation de buste contrôlée en maintenant l'équilibre fessier." },
          { name: "Planche statique", sets: "3", reps: "60s", rest: "60s", type: "isolation", desc: "Planche sur les avant-bras." },
          { name: "Gainage latéral", sets: "3", reps: "30s / côté", rest: "60s", type: "isolation", desc: "Alignement latéral parfait." }
        ]
      },
      {
        id: "shm_mercredi",
        day: "Mercredi",
        name: "Mercredi — Force générale + mobilité",
        duration: "45-55 min",
        exosCount: 7,
        restNote: "Circuit : 4 tours avec 2 minutes de repos entre chaque tour",
        exercises: [
          { name: "Fentes avec haltères", reps: "12 / jambe", type: "principal", desc: "Fentes avant lestées." },
          { name: "Pompes avec élastique", reps: "15", type: "principal", desc: "Mettez un élastique dans votre dos pour compliquer le mouvement." },
          { name: "Rowing barre ou haltères", reps: "12", type: "principal", desc: "Tirage buste penché bilatéral." },
          { name: "Hip thrust avec haltère", reps: "15", type: "principal", desc: "Poussée de bassin, fessiers contractés en haut." },
          { name: "Élévations latérales", reps: "15", type: "isolation", desc: "Coudes légèrement déverrouillés, levez les bras sur les côtés." },
          { name: "Curl marteau", reps: "12", type: "isolation", desc: "Coudes collés, prise neutre pour biceps." },
          { name: "Séance Mobilité", reps: "15 min", type: "isolation", desc: "Étirements hanches, chevilles, rotation thoracique, ouverture épaules, étirement ischio-jambiers." }
        ]
      },
      {
        id: "shm_jeudi",
        day: "Jeudi",
        name: "Jeudi — Circuit cardio-musculaire",
        duration: "40-45 min",
        exosCount: 6,
        restNote: "Circuit : 5 tours avec 2 minutes de repos complet entre les tours",
        exercises: [
          { name: "Thruster avec haltères", reps: "15", type: "principal", desc: "Enchaînement fluide d'un squat et d'un développé militaire." },
          { name: "Swing avec haltère", reps: "20", type: "principal", desc: "Poussée des hanches pour balancer l'haltère à hauteur d'épaules." },
          { name: "Pompes classiques", reps: "15", type: "principal", desc: "Buste touche le sol." },
          { name: "Tirage avec élastique (Rowing debout)", reps: "20", type: "principal", desc: "Élastique ancré devant vous, tirez les coudes en arrière." },
          { name: "Mountain climbers", reps: "45s", type: "principal", desc: "Rythme de course rapide face au sol." },
          { name: "Jumping jacks", reps: "50", type: "principal", desc: "Coordination et cardio soutenu." }
        ]
      },
      {
        id: "shm_vendredi",
        day: "Vendredi",
        name: "Vendredi — Endurance longue + récupération active",
        duration: "50-70 min",
        exosCount: 5,
        restNote: "Faire les 3 tours de renforcement léger avec application",
        exercises: [
          { name: "Cardio principal (Marche, course ou corde)", reps: "20-60 min", type: "principal", desc: "Option 1 : Marche rapide — 60 min. Option 2 : Running — 40 min. Option 3 : Corde à sauter — 20 min." },
          { name: "Squats poids du corps", reps: "20", type: "principal", desc: "Activation circulatoire." },
          { name: "Pompes contrôlées", reps: "15", type: "principal", desc: "Descente lente." },
          { name: "Bird dog", reps: "20", type: "isolation", desc: "Quatre pattes, extension bras droit / jambe gauche." },
          { name: "Gainage planche", reps: "60s", type: "isolation", desc: "Tenir la position immobile." }
        ]
      }
    ],
    stretching: {
      duration: "5 à 10 minutes",
      exercises: [
        "Étirement complet des quadriceps",
        "Étirement des grands dorsaux et épaules",
        "Assouplissement actif des hanches"
      ]
    },
    progressionPlan: [
      { period: "Semaines 1–2", desc: "Construction : Maîtriser parfaitement la technique des mouvements et poser une routine solide." },
      { period: "Semaines 3–4", desc: "Progression : Tenter de rajouter +2 répétitions par exercice ou d'augmenter très légèrement les charges de vos haltères." },
      { period: "Semaines 5–6", desc: "Intensification : Tenter de rajouter un tour supplémentaire sur les circuits, ou réduire le temps de repos de 5-10 secondes." },
      { period: "Semaines 7–8", desc: "Performance : Ajouter 10 minutes de cardio supplémentaire modéré à la fin de deux de vos séances." }
    ],
    keyTips: [
      "Marchez tous les jours, visez un objectif de 8 000 à 12 000 pas.",
      "Consacrez 5 à 10 minutes chaque jour à la mobilité pour préserver vos articulations.",
      "Visez un sommeil de qualité de 7 à 9 heures pour maximiser la récupération.",
      "Mangez suffisamment de protéines au quotidien pour soutenir la réparation musculaire.",
      "Gardez une activité physique constante sur toute l'année : la régularité l'emporte sur l'intensité."
    ]
  },
  {
    id: "sante-endurance-gym",
    title: "MONPROGRAMMEFIT : PROGRAMME SANTÉ GÉNÉRALE & ENDURANCE",
    subtitle: "Salle de sport",
    author: "Coach Abdou BAKARI",
    duration: "8 semaines",
    level: "Débutant - Intermédiaire",
    frequency: "5 séances / semaine",
    trackId: "gym",
    objective: "Ce programme s'adresse aux personnes souhaitant améliorer leur condition physique globale, leur endurance cardiovasculaire, leur force fonctionnelle et leur mobilité en profitant du matériel d'une salle de sport.",
    equipment: [
      "Presse à cuisses",
      "Haltères libres",
      "Poulie haute & basse",
      "Kettlebell",
      "Rameur / Tapis de course",
      "Box jump / Corde ondulatoire (Battle rope)"
    ],
    warmup: {
      duration: "10 minutes",
      steps: [
        "Cardio léger (5 min) : Vélo, Rameur ou Tapis de course",
        "Rotations articulaires : 2 min",
        "Squats au poids du corps : 15 répétitions",
        "Fentes arrière : 10 par jambe",
        "Pompes : 10 répétitions",
        "Gainage planche : 30 secondes"
      ]
    },
    generalRules: {
      rest: "Exercices de force : 60 à 90 secondes | Circuits : 20 à 40 secondes entre exercices, 2 minutes entre les tours",
      intensity: "Travailler à environ 60–75% de l'effort maximal. Finir les séances agréablement fatigué mais apte à récupérer vite."
    },
    weeklySchedule: [
      { day: "Lundi", focus: "Full Body Force & Mobilité" },
      { day: "Mardi", focus: "Cardio Endurance + Core" },
      { day: "Mercredi", focus: "Renforcement fonctionnel + mobilité" },
      { day: "Jeudi", focus: "Circuit cardio-musculaire" },
      { day: "Vendredi", focus: "Endurance longue + récupération active" }
    ],
    sessions: [
      {
        id: "sgym_lundi",
        day: "Lundi",
        name: "Lundi — Full Body Force & Mobilité",
        duration: "55-65 min",
        exosCount: 7,
        restNote: "90s sur les exercices de force | Mobilité de fin intégrée",
        exercises: [
          { name: "Presse à cuisses inclinée", sets: "4", reps: "10", rest: "90s", type: "principal", desc: "Contrôlez bien la descente, ne verrouillez jamais les genoux en haut." },
          { name: "Développé couché avec haltères", sets: "4", reps: "10", rest: "90s", type: "principal", desc: "Sur banc plat, développez de manière symétrique et contrôlée." },
          { name: "Tirage horizontal à la poulie basse", sets: "4", reps: "12", rest: "75s", type: "principal", desc: "Tirez la poignée vers le bas du ventre en serrant les omoplates." },
          { name: "Soulevé de terre roumain à la barre ou haltères", sets: "3", reps: "10", rest: "90s", type: "principal", desc: "Bascule des hanches, ressentez l'étirement des ischios, dos droit." },
          { name: "Développé épaules à la machine", sets: "3", reps: "12", rest: "60s", type: "principal", desc: "Presse à épaules guidée, hauteur de poignées aux oreilles." },
          { name: "Gainage planche active", sets: "3", reps: "45s", rest: "45s", type: "isolation", desc: "Planche active en poussant sur les avant-bras." },
          { name: "Mobilité fin de séance", sets: "1", reps: "10 min", rest: "0s", type: "isolation", desc: "Ouverture des hanches, étirement pectoraux, mobilité des épaules et étirement doux des ischio-jambiers." }
        ]
      },
      {
        id: "sgym_mardi",
        day: "Mardi",
        name: "Mardi — Cardio Endurance + Core",
        duration: "55 min",
        exosCount: 5,
        restNote: "Maintenir une intensité modérée et fluide",
        exercises: [
          { name: "Cardio principal (Tapis de course)", reps: "45 min", type: "principal", desc: "5 min échauffement, 35 min allure modérée (conversation possible mais pas chanter), 5 min retour au calme." },
          { name: "Crunch à la machine", sets: "3", reps: "15", rest: "60s", type: "isolation", desc: "Enroulement de colonne contrôlé, expirez en contractant." },
          { name: "Relevé de genoux suspendu", sets: "3", reps: "12", rest: "60s", type: "isolation", desc: "Relevez les genoux vers la poitrine, évitez de balancer le corps." },
          { name: "Planche statique", sets: "3", reps: "60s", rest: "60s", type: "isolation", desc: "Maintien de planche parfait." },
          { name: "Gainage latéral", sets: "3", reps: "30s / côté", rest: "60s", type: "isolation", desc: "Sur le coude, hanches hautes." }
        ]
      },
      {
        id: "sgym_mercredi",
        day: "Mercredi",
        name: "Mercredi — Renforcement fonctionnel + mobilité",
        duration: "50-60 min",
        exosCount: 7,
        restNote: "Circuit : 4 tours complets avec 2 minutes de repos entre les tours",
        exercises: [
          { name: "Kettlebell swing", reps: "15", type: "principal", desc: "Extension explosive de hanches pour propulser le kettlebell." },
          { name: "Goblet squat", reps: "15", type: "principal", desc: "Poids tenu au sternum, squat complet contrôlé." },
          { name: "Pompes classiques", reps: "15", type: "principal", desc: "Alignement parfait, poitrine frôle le sol." },
          { name: "Rowing haltère un bras", reps: "12 / bras", type: "principal", desc: "Dos plat, tirage du coude vers l'arrière." },
          { name: "Farmer walk (marche fermière)", reps: "40m", type: "principal", desc: "Portez des haltères lourds et marchez d'un pas lent et rigide." },
          { name: "Mountain climbers", reps: "40s", type: "principal", desc: "Genoux vers la poitrine, rythme dynamique." },
          { name: "Mobilité articulaire globale", reps: "15 min", type: "isolation", desc: "Exercices pour hanches, chevilles, épaules et colonne vertébrale." }
        ]
      },
      {
        id: "sgym_jeudi",
        day: "Jeudi",
        name: "Jeudi — Circuit cardio-musculaire",
        duration: "45-50 min",
        exosCount: 6,
        restNote: "Circuit : 5 tours avec 2 minutes de repos complet entre les tours",
        exercises: [
          { name: "Rameur", reps: "500m", type: "principal", desc: "Poussez fort sur les jambes d'abord, puis tirez la poignée." },
          { name: "Box jump", reps: "12", type: "principal", desc: "Saut sur une boîte stable, redressez-vous en haut, descendez un pied après l'autre." },
          { name: "Développé haltères", reps: "12", type: "principal", desc: "Développé pour les épaules ou les pectoraux." },
          { name: "Tirage vertical à la poulie haute", reps: "12", type: "principal", desc: "Tirage de la barre à la poitrine." },
          { name: "Fentes marchées", reps: "20 pas", type: "principal", desc: "Pas réguliers alternés en avançant." },
          { name: "Battle rope (corde ondulatoire)", reps: "30s", type: "principal", desc: "Ondulations de cordes intenses et rapides." }
        ]
      },
      {
        id: "sgym_vendredi",
        day: "Vendredi",
        name: "Vendredi — Endurance longue + récupération active",
        duration: "60-75 min",
        exosCount: 5,
        restNote: "Faire les 3 tours de renforcement léger à rythme de récupération",
        exercises: [
          { name: "Cardio principal au choix (Tapis, vélo ou rameur)", reps: "45-60 min", type: "principal", desc: "Option 1 : Tapis — 60 min (marche rapide inclinée ou course légère). Option 2 : Vélo — 60 min. Option 3 : Rameur — 45 min." },
          { name: "Pompes", reps: "15", type: "principal", desc: "Mouvement fluide." },
          { name: "Squats poids du corps", reps: "20", type: "principal", desc: "Contrôle articulaire." },
          { name: "Gainage planche statique", reps: "60s", type: "isolation", desc: "Tenir la position immobile." },
          { name: "Superman", reps: "20", type: "isolation", desc: "Extension douce arrière." }
        ]
      }
    ],
    stretching: {
      duration: "10 minutes",
      exercises: [
        "Étirement profond des pectoraux et du dos",
        "Assouplissement actif des hanches",
        "Étirement passif des quadriceps et ischios"
      ]
    },
    progressionPlan: [
      { period: "Semaines 1–2", desc: "Adaptation : apprendre les mouvements, améliorer la régularité. Cardio : ~150 min/semaine." },
      { period: "Semaines 3–4", desc: "Développement : augmentez légèrement les charges et augmentez la durée de votre cardio de 10%." },
      { period: "Semaines 5–6", desc: "Amélioration physique : rajoutez un tour de circuit le jeudi et intégrez des variantes d'exercices plus difficiles." },
      { period: "Semaines 7–8", desc: "Performance : maximisez votre endurance générale. Essayez d'atteindre 200 à 300 minutes de cardio hebdomadaire." }
    ],
    keyTips: [
      "Marchez quotidiennement : l'objectif idéal est de 8 000 à 12 000 pas.",
      "Faites des pauses régulières de mouvement si vous travaillez de longues heures assis.",
      "Accordez une importance majeure à un sommeil régulier de 7 à 9 heures.",
      "Hydratez-vous tout au long de la journée.",
      "Maintenez une alimentation équilibrée et saine à environ 80% du temps."
    ]
  },
  {
    id: "prise-de-muscle-bodyweight",
    title: "MONPROGRAMMEFIT : PROGRAMME PRISE DE MUSCLE",
    subtitle: "Maison – Poids du corps",
    author: "Coach Abdou BAKARI",
    duration: "8 semaines",
    level: "Débutant - Intermédiaire",
    frequency: "5 séances / semaine",
    trackId: "bodyweight",
    objective: "Développer la masse musculaire sans matériel en utilisant uniquement le poids du corps et des méthodes d'intensification.",
    equipment: [
      "Aucun matériel obligatoire (poids du corps)",
      "Une chaise solide (recommandée)",
      "Un tapis de sol (conseillé)",
      "Une barre de traction (facultative)",
      "Une serviette (conseillée)"
    ],
    warmup: {
      duration: "10 minutes",
      steps: [
        "2 minutes de jumping jacks",
        "2 minutes de montées de genoux",
        "Cercles des épaules, hanches, poignets et chevilles (15 répétitions)",
        "10 squats au poids du corps",
        "10 pompes sur les genoux ou classiques selon ton niveau"
      ]
    },
    generalRules: {
      rest: "Exercices : 45 à 90 secondes (voir détails de chaque exercice)",
      tempo: "Descente lente : 3 secondes | Contraction volontaire : 1 seconde",
      progression: "Garde 1 à 2 répétitions en réserve sur la plupart des séries. Quand tu atteins facilement le haut de la plage de répétitions, passe à une variante plus difficile."
    },
    weeklySchedule: [
      { day: "Lundi", focus: "Push (Pectoraux, épaules, triceps)" },
      { day: "Mardi", focus: "Pull (Dos, biceps)" },
      { day: "Mercredi", focus: "Jambes" },
      { day: "Jeudi", focus: "Haut du corps" },
      { day: "Vendredi", focus: "Bras + Core" }
    ],
    sessions: [
      {
        id: "s_pm_bw_lundi",
        day: "Lundi",
        name: "Lundi — Push (Pectoraux, épaules, triceps)",
        duration: "45 min",
        exosCount: 6,
        restNote: "75s sur pompes, 60s sur diamant/pike. Finisher à l'échec.",
        exercises: [
          { name: "Pompes classiques", sets: "4", reps: "10–20", rest: "75s", type: "principal", desc: "Gainage abdominal ferme, poitrine frôle le sol." },
          { name: "Pompes pieds surélevés", sets: "3", reps: "8–15", rest: "75s", type: "principal", desc: "Accent sur le haut de la poitrine." },
          { name: "Pompes diamant", sets: "3", reps: "8–15", rest: "60s", type: "isolation", desc: "Mains serrées en diamant pour isoler les triceps." },
          { name: "Pike Push-ups", sets: "3", reps: "10–15", rest: "60s", type: "principal", desc: "Bassin surélevé, corps en V, cible les épaules." },
          { name: "Dips entre deux chaises", sets: "3", reps: "10–15", rest: "75s", type: "isolation", desc: "Coudes orientés vers l'arrière, extension complète." },
          { name: "Finisher — Pompes lentes", sets: "2", reps: "Échec", rest: "60s", type: "isolation", desc: "Tempo : 4 s descente / 2 s montée. Contrôle parfait." }
        ]
      },
      {
        id: "s_pm_bw_mardi",
        day: "Mardi",
        name: "Mardi — Pull (Dos, biceps)",
        duration: "45 min",
        exosCount: 5,
        restNote: "Option avec ou sans barre de traction intégrée",
        exercises: [
          { name: "Tractions pronation (OU Superman sans barre)", sets: "4", reps: "6–12 (ou 20)", rest: "90s (ou 45s)", type: "principal", desc: "Prise large pronation. Sans barre : allongé sur le ventre, extension de buste." },
          { name: "Tractions supination (OU Reverse Snow Angels sans barre)", sets: "3", reps: "6–10 (ou 15)", rest: "90s (ou 45s)", type: "principal", desc: "Prise supination (paumes vers soi). Sans barre : allonger et ramener les bras." },
          { name: "Tractions australiennes (OU Tirage serviette sous pieds)", sets: "3", reps: "10–15 (ou 12–15)", rest: "75s (ou 60s)", type: "principal", desc: "Tirage sous table solide. Sans barre : résistance active avec vos jambes." },
          { name: "Superman (OU Curl isométrique avec serviette)", sets: "3", reps: "20 (ou 30s)", rest: "45s", type: "isolation", desc: "Extension dorsale. Sans matériel : traction continue de la serviette contre les pieds." },
          { name: "Gainage Superman (OU Curl isométrique)", sets: "3", reps: "30s", rest: "45s", type: "isolation", desc: "Maintien statique de la posture pour le dos ou les bras." }
        ]
      },
      {
        id: "s_pm_bw_mercredi",
        day: "Mercredi",
        name: "Mercredi — Jambes",
        duration: "45-50 min",
        exosCount: 7,
        restNote: "60s repos, 75s sur Split Squats",
        exercises: [
          { name: "Squats", sets: "4", reps: "20", rest: "60s", type: "principal", desc: "Flexion complète contrôlée, buste fier." },
          { name: "Squats sautés", sets: "3", reps: "15", rest: "60s", type: "principal", desc: "Extension explosive, réception amortie." },
          { name: "Bulgarian Split Squats", sets: "3", reps: "12 / jambe", rest: "75s", type: "principal", desc: "Un pied arrière sur une chaise solide." },
          { name: "Fentes arrière", sets: "3", reps: "15 / jambe", rest: "60s", type: "isolation", desc: "Pas en arrière, genou arrière effleure le sol." },
          { name: "Hip Thrust une jambe", sets: "3", reps: "15 / jambe", rest: "60s", type: "isolation", desc: "Extension complète du bassin avec contraction fessière." },
          { name: "Nordic Curl assisté (ou glute bridge)", sets: "3", reps: "8–10", rest: "60s", type: "principal", desc: "Freinez la descente au maximum, aidez-vous des bras pour remonter." },
          { name: "Mollets sur une marche", sets: "4", reps: "20", rest: "45s", type: "isolation", desc: "Amplitude maximale en haut et en bas." }
        ]
      },
      {
        id: "s_pm_bw_jeudi",
        day: "Jeudi",
        name: "Jeudi — Haut du corps",
        duration: "45 min",
        exosCount: 6,
        restNote: "Pensez à contrôler les phases excentriques",
        exercises: [
          { name: "Pompes Archer (ou pompes larges)", sets: "3", reps: "8–12", rest: "75s", type: "principal", desc: "Déportez le poids alternativement sur un bras." },
          { name: "Tractions (ou variante au choix)", sets: "4", reps: "8–12", rest: "90s", type: "principal", desc: "Sollicite le grand dorsal et les biceps." },
          { name: "Pike Push-ups", sets: "3", reps: "10–15", rest: "60s", type: "principal", desc: "Épaules et triceps." },
          { name: "Dips entre deux chaises", sets: "3", reps: "10–15", rest: "75s", type: "isolation", desc: "Coudes vers l'arrière, extension des bras." },
          { name: "Superman", sets: "3", reps: "20", rest: "45s", type: "isolation", desc: "Chaîne postérieure et lombaires." },
          { name: "Gainage planche", sets: "3", reps: "45–60 s", rest: "45s", type: "isolation", desc: "Maintien de l'alignement corporel." }
        ]
      },
      {
        id: "s_pm_bw_vendredi",
        day: "Vendredi",
        name: "Vendredi — Bras + Core",
        duration: "45-50 min",
        exosCount: 8,
        restNote: "45-75s de repos",
        exercises: [
          { name: "Pompes diamant (Bras)", sets: "3", reps: "12–15", rest: "60s", type: "isolation", desc: "Cibles : triceps." },
          { name: "Dips entre deux chaises (Bras)", sets: "3", reps: "10–15", rest: "75s", type: "isolation", desc: "Triceps et bas de poitrine." },
          { name: "Curl isométrique avec serviette (Bras)", sets: "4", reps: "30s", rest: "45s", type: "isolation", desc: "Contraction biceps maximale statique." },
          { name: "Tractions supination (ou tirage serviette) (Bras)", sets: "3", reps: "8–12", rest: "75s", type: "principal", desc: "Biceps et dos." },
          { name: "Planche (Core)", sets: "3", reps: "60 s", rest: "45s", type: "isolation", desc: "Gainage ventral." },
          { name: "Planche latérale (Core)", sets: "3", reps: "30s / côté", rest: "45s", type: "isolation", desc: "Sollicite les obliques." },
          { name: "Relevés de jambes (Core)", sets: "3", reps: "15", rest: "45s", type: "isolation", desc: "Bas des abdominaux." },
          { name: "Hollow Hold (Core)", sets: "3", reps: "30s", rest: "45s", type: "isolation", desc: "Maintien de la forme en banane, bas du dos plaqué." }
        ]
      }
    ],
    stretching: {
      duration: "5 à 10 minutes",
      exercises: [
        "Pectoraux : 30 s × 2",
        "Épaules : 30 s × 2",
        "Dos : 30 s × 2",
        "Quadriceps : 30 s × 2",
        "Ischio-jambiers : 30 s × 2",
        "Mollets : 30 s × 2"
      ]
    },
    progressionPlan: [
      { period: "Semaines 1–2", desc: "Apprends les mouvements. Laisse 2 répétitions en réserve." },
      { period: "Semaines 3–4", desc: "Augmente les répétitions. Passe progressivement à des variantes plus exigeantes." },
      { period: "Semaines 5–6", desc: "Ralentis la phase descendante (4 secondes). Ajoute une pause de 1 à 2 secondes en position basse sur certains exercices." },
      { period: "Semaines 7–8", desc: "Introduis des supersets (par exemple : pompes classiques → pompes diamant sans repos). Termine certains exercices d'isolation ou de gainage à l'échec technique." }
    ],
    keyTips: [
      "Consomme 1,6 à 2,2 g de protéines par kg de poids corporel chaque jour.",
      "Maintiens un léger surplus calorique si ton objectif est de prendre de la masse.",
      "Dors 7 à 9 heures par nuit.",
      "Recherche une progression chaque semaine : plus de répétitions, un meilleur contrôle ou une variante mais plus difficile.",
      "Ne néglige jamais la qualité d'exécution au profit du nombre de répétitions."
    ]
  },
  {
    id: "prise-de-muscle-gym",
    title: "MONPROGRAMMEFIT : PROGRAMME PRISE DE MUSCLE",
    subtitle: "Salle de Sport",
    author: "Coach Abdou BAKARI",
    duration: "8 semaines",
    level: "Débutant - Intermédiaire",
    frequency: "5 séances / semaine",
    trackId: "gym",
    objective: "Développer la masse musculaire de manière harmonieuse grâce à une surcharge progressive, une bonne technique d'exécution et un volume d'entraînement adapté.",
    equipment: [
      "Équipements complets de salle de sport",
      "Barre droite et barre EZ",
      "Haltères de différentes charges",
      "Poulies réglables",
      "Machines guidées (Presse à cuisses, Leg Curl, Leg Extension, Pec Deck)"
    ],
    warmup: {
      duration: "10 minutes",
      steps: [
        "5 minutes de marche rapide ou vélo",
        "Rotations des épaules × 15, hanches × 15, poignets × 15, chevilles × 15",
        "2 séries légères du premier exercice de la séance avant de commencer les charges de travail."
      ]
    },
    generalRules: {
      rest: "Exercices polyarticulaires : 90 à 120 secondes | Exercices d'isolation : 45 à 75 secondes",
      tempo: "Tempo contrôlé : 2–0–2 (2 secondes pour descendre la charge, sans pause, 2 secondes pour remonter)",
      progression: "Lorsque tu atteins facilement le haut de la plage de répétitions sur toutes les séries avec une bonne technique, augmente la charge de 2,5 à 5 % la séance suivante."
    },
    weeklySchedule: [
      { day: "Lundi", focus: "Pectoraux + Biceps" },
      { day: "Mardi", focus: "Dos + Triceps" },
      { day: "Mercredi", focus: "Jambes" },
      { day: "Jeudi", focus: "Pectoraux + Dos" },
      { day: "Vendredi", focus: "Épaules + Bras" }
    ],
    sessions: [
      {
        id: "s_pm_gym_lundi",
        day: "Lundi",
        name: "Lundi — Pectoraux & Biceps",
        duration: "45-55 min",
        exosCount: 6,
        restNote: "90-120s sur exercices principaux, 60-75s sur isolation",
        exercises: [
          { name: "Développé couché barre", sets: "4", reps: "6–8", rest: "2 min", type: "principal", desc: "Pieds bien ancrés au sol, omoplates serrées, contrôle la descente sans faire rebondir la barre." },
          { name: "Développé incliné haltères", sets: "3", reps: "8–10", rest: "90 s", type: "principal", desc: "Banc à 30–45°, poignets alignés avec les avant-bras." },
          { name: "Écartés à la poulie (ou pec deck)", sets: "3", reps: "12–15", rest: "60 s", type: "isolation", desc: "Légère flexion des coudes, concentre-toi sur la contraction des pectoraux." },
          { name: "Dips assistés (ou machine)", sets: "3", reps: "8–12", rest: "90 s", type: "principal", desc: "Penche légèrement le buste vers l'avant, descends jusqu'à un bon étirement sans douleur." },
          { name: "Curl barre EZ", sets: "4", reps: "8–10", rest: "75 s", type: "isolation", desc: "Coudes fixes, évite d'utiliser l'élan du dos." },
          { name: "Curl incliné haltères", sets: "3", reps: "10–12", rest: "60 s", type: "isolation", desc: "Laisse les bras s'étirer complètement en bas, remonte sans balancer le corps." }
        ]
      },
      {
        id: "s_pm_gym_mardi",
        day: "Mardi",
        name: "Mardi — Dos & Triceps",
        duration: "45-50 min",
        exosCount: 6,
        restNote: "60-90s entre les séries",
        exercises: [
          { name: "Tirage vertical (prise large)", sets: "4", reps: "8–10", rest: "90 s", type: "principal", desc: "Garde les épaules basses sur les tirages. Tire les coudes vers les hanches." },
          { name: "Rowing assis à la poulie", sets: "3", reps: "10–12", rest: "75 s", type: "principal", desc: "Resserrez bien les omoplates en fin de mouvement." },
          { name: "Rowing unilatéral haltère", sets: "3", reps: "10 / côté", rest: "75 s", type: "principal", desc: "Tirage du coude vers la hanche sans rotation du buste." },
          { name: "Face Pull", sets: "3", reps: "12–15", rest: "60 s", type: "isolation", desc: "Travail du deltoïde postérieur et des rotateurs d'épaule." },
          { name: "Extension triceps à la poulie", sets: "4", reps: "10–12", rest: "60 s", type: "isolation", desc: "Coudes fixes le long du corps, extension complète des avant-bras." },
          { name: "Extension triceps au-dessus de la tête (corde ou haltère)", sets: "3", reps: "12", rest: "60 s", type: "isolation", desc: "Cible l'étirement maximal du long chef du triceps." }
        ]
      },
      {
        id: "s_pm_gym_mercredi",
        day: "Mercredi",
        name: "Mercredi — Jambes",
        duration: "50-60 min",
        exosCount: 6,
        restNote: "60-120s entre les séries",
        exercises: [
          { name: "Squat (barre ou machine)", sets: "4", reps: "6–8", rest: "2 min", type: "principal", desc: "Garde le dos neutre, flexion contrôlée profonde." },
          { name: "Presse à cuisses", sets: "4", reps: "10–12", rest: "90 s", type: "principal", desc: "Poussez fermement, ne tendez pas complètement les genoux en haut." },
          { name: "Soulevé de terre roumain (haltères ou barre)", sets: "3", reps: "10", rest: "90 s", type: "principal", desc: "Basculez le bassin en arrière, dos parfaitement plat." },
          { name: "Leg Extension", sets: "3", reps: "12–15", rest: "60 s", type: "isolation", desc: "Contraction forte des quadriceps d'une seconde en haut." },
          { name: "Leg Curl allongé", sets: "3", reps: "12–15", rest: "60 s", type: "isolation", desc: "Cible les ischio-jambiers de manière isolée." },
          { name: "Mollets debout", sets: "4", reps: "15–20", rest: "45 s", type: "isolation", desc: "Poussée maximale sur la pointe des pieds." }
        ]
      },
      {
        id: "s_pm_gym_jeudi",
        day: "Jeudi",
        name: "Jeudi — Pectoraux & Dos",
        duration: "50-55 min",
        exosCount: 6,
        restNote: "60-90s de repos",
        exercises: [
          { name: "Développé incliné barre", sets: "4", reps: "8–10", rest: "90 s", type: "principal", desc: "Travail ciblé de la portion claviculaire des pectoraux." },
          { name: "Tractions assistées ou tirage vertical", sets: "4", reps: "8–10", rest: "90 s", type: "principal", desc: "Largeur du dos." },
          { name: "Développé machine convergente", sets: "3", reps: "10–12", rest: "75 s", type: "principal", desc: "Sensation de contraction optimale en fin de mouvement." },
          { name: "Rowing barre", sets: "3", reps: "8–10", rest: "75 s", type: "principal", desc: "Buste incliné, dos plat, tirage de la barre au nombril." },
          { name: "Pec Deck", sets: "3", reps: "12–15", rest: "60 s", type: "isolation", desc: "Mouvement d'écarté contrôlé sans aide des épaules." },
          { name: "Tirage horizontal prise neutre", sets: "3", reps: "12", rest: "60 s", type: "isolation", desc: "Accentuation du travail de l'épaisseur du dos." }
        ]
      },
      {
        id: "s_pm_gym_vendredi",
        day: "Vendredi",
        name: "Vendredi — Épaules & Bras",
        duration: "50-60 min",
        exosCount: 8,
        restNote: "60-90s de repos",
        exercises: [
          { name: "Développé militaire assis", sets: "4", reps: "8–10", rest: "90 s", type: "principal", desc: "Force des deltoïdes antérieurs et de la coiffe." },
          { name: "Élévations latérales", sets: "4", reps: "12–15", rest: "60 s", type: "isolation", desc: "Focalisation sur la portion latérale de l'épaule." },
          { name: "Oiseau à la machine ou aux haltères", sets: "3", reps: "12–15", rest: "60 s", type: "isolation", desc: "Sollicitation du deltoïde postérieur." },
          { name: "Shrugs (haussements d'épaules)", sets: "3", reps: "12–15", rest: "60 s", type: "isolation", desc: "Sollicitation des trapèzes supérieurs." },
          { name: "Curl marteau", sets: "3", reps: "10–12", rest: "60 s", type: "isolation", desc: "Développement de l'épaisseur des biceps et avant-bras." },
          { name: "Curl pupitre", sets: "3", reps: "10–12", rest: "60 s", type: "isolation", desc: "Étirement et isolation pure des biceps." },
          { name: "Barre au front (Skull Crushers)", sets: "3", reps: "10–12", rest: "60 s", type: "isolation", desc: "Travail de l'épaisseur des triceps." },
          { name: "Pushdown à la corde", sets: "3", reps: "12–15", rest: "60 s", type: "isolation", desc: "Finition intensive pour les triceps." }
        ]
      }
    ],
    stretching: {
      duration: "5 à 10 minutes",
      exercises: [
        "Pectoraux : 30 s × 2",
        "Biceps : 30 s × 2",
        "Dos : 30 s × 2",
        "Quadriceps : 30 s × 2",
        "Ischio-jambiers : 30 s × 2",
        "Mollets : 30 s × 2"
      ]
    },
    progressionPlan: [
      { period: "Semaines 1–2", desc: "Choisis des charges qui te permettent d'apprendre les mouvements avec une technique irréprochable." },
      { period: "Semaines 3–4", desc: "Augmente progressivement les charges de 2,5 à 5 % lorsque tu atteins facilement le haut de la plage de répétitions." },
      { period: "Semaines 5–6", desc: "Cherche à gagner une répétition de plus sur plusieurs exercices avant d'augmenter à nouveau les charges." },
      { period: "Semaines 7–8", desc: "Conserve une exécution propre tout en visant les charges les plus lourdes que tu peux contrôler. Tu peux aller jusqu'à l'échec uniquement sur la dernière série des exercices d'isolation." }
    ],
    keyTips: [
      "Dors 7 à 9 heures par nuit.",
      "Consomme 1,6 à 2,2 g de protéines par kg de poids corporel chaque jour.",
      "Bois 2 à 3 litres d'eau quotidiennement.",
      "Ne sacrifie jamais la technique pour soulever plus lourd.",
      "Note tes performances à chaque séance pour suivre ta progression."
    ]
  },
  {
    id: "perte-poids-home",
    title: "MONPROGRAMMEFIT : PROGRAMME PERTE DE POIDS",
    subtitle: "Maison avec matériel",
    author: "Coach Abdou BAKARI",
    duration: "8 semaines",
    level: "Débutant - Intermédiaire",
    frequency: "5 séances / semaine",
    trackId: "home-equip",
    objective: "Perdre du gras tout en conservant la masse musculaire, augmenter la dépense calorique et améliorer la condition physique avec un matériel limité.",
    equipment: [
      "Haltères",
      "Élastiques",
      "Barre (si disponible)",
      "Banc ou chaise solide"
    ],
    warmup: {
      duration: "10 minutes",
      steps: [
        "Jumping jacks : 2 minutes",
        "Montées de genoux : 1 minute",
        "Squats poids du corps : 15 répétitions",
        "Fentes arrière : 10 par jambe",
        "Rotations épaules/hanches : 20 répétitions"
      ]
    },
    generalRules: {
      rest: "Exercices classiques : 45 à 75 secondes | Circuits : 20 à 30 secondes entre exercices, 90 secondes entre les tours",
      tempo: "Tempo conseillé — 3-1-2 (3s descente, 1s pause, 2s montée)",
      intensity: "Choisir une charge permettant 12 à 15 répétitions propres. Les dernières répétitions doivent être difficiles mais contrôlées."
    },
    weeklySchedule: [
      { day: "Lundi", focus: "Full Body brûle-graisse + cardio" },
      { day: "Mardi", focus: "Haut du corps + Running" },
      { day: "Mercredi", focus: "Jambes + Marche rapide" },
      { day: "Jeudi", focus: "Circuit métabolique + abdos" },
      { day: "Vendredi", focus: "Full Body endurance + cardio long" }
    ],
    sessions: [
      {
        id: "s_pp_home_lundi",
        day: "Lundi",
        name: "Lundi — Full Body brûle-graisse",
        duration: "45-60 min",
        exosCount: 5,
        restNote: "Circuit à répéter 4 fois. 30s de repos entre exos. 2 min de repos entre les tours. Cardio final.",
        exercises: [
          { name: "Goblet squat haltère", sets: "4", reps: "15", rest: "30s", type: "principal", desc: "Dos droit, descendre sous la parallèle si possible, garder le poids proche du corps." },
          { name: "Développé couché haltères au sol", sets: "4", reps: "12–15", rest: "30s", type: "principal", desc: "Contrôle la descente, contracte les pectoraux en haut." },
          { name: "Rowing haltère un bras", sets: "4", reps: "12 / côté", rest: "30s", type: "principal", desc: "Tire le coude vers la hanche, garde le dos stable." },
          { name: "Soulevé de terre roumain haltères", sets: "4", reps: "15", rest: "30s", type: "principal", desc: "Pousse les hanches vers l'arrière, sens l'étirement des ischio-jambiers." },
          { name: "Mountain climbers", sets: "4", reps: "40s", rest: "30s", type: "isolation", desc: "Amener les genoux alternativement vers la poitrine de manière dynamique." }
        ]
      },
      {
        id: "s_pp_home_mardi",
        day: "Mardi",
        name: "Mardi — Haut du corps + Running",
        duration: "50-60 min",
        exosCount: 7,
        restNote: "Musculation classique puis running progressif.",
        exercises: [
          { name: "Pompes avec élastique", sets: "4", reps: "12–15", rest: "60s", type: "principal", desc: "Poitrine frôle le sol, élastique tendu dans le dos." },
          { name: "Développé épaules haltères", sets: "4", reps: "10–12", rest: "60s", type: "principal", desc: "Poussée verticale sans cambrer excessivement le dos." },
          { name: "Rowing barre ou haltères", sets: "4", reps: "12", rest: "60s", type: "principal", desc: "Incliné à 45°, tirage coudes serrés vers l'arrière." },
          { name: "Tirage élastique vertical", sets: "4", reps: "15", rest: "60s", type: "isolation", desc: "S'asseoir et tirer l'élastique fixé en hauteur vers la poitrine." },
          { name: "Élévations latérales haltères", sets: "3", reps: "15", rest: "45s", type: "isolation", desc: "Monter les bras sur le côté jusqu'à l'horizontale." },
          { name: "Curl haltères", sets: "3", reps: "12–15", rest: "45s", type: "isolation", desc: "Coudes verrouillés au corps, flexion des avant-bras." },
          { name: "Extension triceps élastique", sets: "3", reps: "15", rest: "45s", type: "isolation", desc: "Extension complète du bras vers le bas avec l'élastique." }
        ]
      },
      {
        id: "s_pp_home_mercredi",
        day: "Mercredi",
        name: "Mercredi — Jambes + Marche rapide",
        duration: "50-70 min",
        exosCount: 6,
        restNote: "Suivi d'abdos et d'une marche rapide active.",
        exercises: [
          { name: "Goblet squat", sets: "4", reps: "15", rest: "75s", type: "principal", desc: "Garder le poids serré contre la poitrine." },
          { name: "Bulgarian split squat", sets: "3", reps: "12 / jambe", rest: "60s", type: "principal", desc: "Un pied arrière sur une chaise solide. Mouvement lent." },
          { name: "Fentes marchées haltères", sets: "3", reps: "15 / jambe", rest: "60s", type: "principal", desc: "Pas réguliers vers l'avant, buste vertical." },
          { name: "Soulevé de terre roumain", sets: "4", reps: "12", rest: "60s", type: "principal", desc: "Focalisation sur l'arrière des cuisses et fessiers." },
          { name: "Hip thrust avec haltère", sets: "4", reps: "15", rest: "60s", type: "isolation", desc: "Placer l'haltère sur le bassin, pousser fort avec les fessiers." },
          { name: "Élévation mollets debout", sets: "4", reps: "20", rest: "45s", type: "isolation", desc: "Amplitude maximale pour les mollets." }
        ]
      },
      {
        id: "s_pp_home_jeudi",
        day: "Jeudi",
        name: "Jeudi — Circuit métabolique maison",
        duration: "40-50 min",
        exosCount: 6,
        restNote: "Circuit de 5 tours. 2 min de repos entre les tours. Suivi des abdominaux.",
        exercises: [
          { name: "Burpees", sets: "5", reps: "10", rest: "0s", type: "principal", desc: "Mouvement complet avec pompe et saut explosif." },
          { name: "Squat avec haltère", sets: "5", reps: "15", rest: "0s", type: "principal", desc: "Faites des squats réguliers avec charge légère." },
          { name: "Pompes", sets: "5", reps: "15", rest: "0s", type: "principal", desc: "Gardez le gainage bien aligné." },
          { name: "Swing haltère", sets: "5", reps: "20", rest: "0s", type: "principal", desc: "Extension de hanches dynamique pour propulser l'haltère." },
          { name: "Tirage élastique", sets: "5", reps: "15", rest: "0s", type: "principal", desc: "Tirage horizontal buste penché." },
          { name: "Mountain climbers", sets: "5", reps: "40s", rest: "0s", type: "isolation", desc: "Rythme soutenu." }
        ]
      },
      {
        id: "s_pp_home_vendredi",
        day: "Vendredi",
        name: "Vendredi — Full Body endurance + cardio long",
        duration: "50-75 min",
        exosCount: 6,
        restNote: "Circuit de 4 tours. 90s de repos entre tours. Suivi d'une option de cardio long.",
        exercises: [
          { name: "Thruster haltères", sets: "4", reps: "15", rest: "0s", type: "principal", desc: "Enchaîner un squat complet et un développé épaules." },
          { name: "Rowing haltères", sets: "4", reps: "15", rest: "0s", type: "principal", desc: "Tirage des deux haltères simultanément." },
          { name: "Pompes", sets: "4", reps: "15", rest: "0s", type: "principal", desc: "Forme stricte, coudes à 45°." },
          { name: "Fentes alternées", sets: "4", reps: "20", rest: "0s", type: "principal", desc: "10 par jambe de manière alternée." },
          { name: "Élévations latérales", sets: "4", reps: "15", rest: "0s", type: "isolation", desc: "Travail des épaules." },
          { name: "Gainage dynamique", sets: "4", reps: "45s", rest: "0s", type: "isolation", desc: "Planche sur les coudes avec légers mouvements." }
        ]
      }
    ],
    stretching: {
      duration: "5 à 10 minutes",
      exercises: [
        "Pectoraux : 30 s × 2",
        "Épaules : 30 s × 2",
        "Dos : 30 s × 2",
        "Quadriceps : 30 s × 2",
        "Ischio-jambiers : 30 s × 2",
        "Mollets : 30 s × 2"
      ]
    },
    progressionPlan: [
      { period: "Semaines 1–2", desc: "Apprentissage technique, Intensité modérée, Cardio progressif." },
      { period: "Semaines 3–4", desc: "Ajouter +2 répétitions par exercice ou augmenter légèrement les charges." },
      { period: "Semaines 5–6", desc: "Ajouter 1 tour supplémentaire aux circuits. Réduire légèrement les temps de repos." },
      { period: "Semaines 7–8", desc: "Objectif : meilleure endurance, meilleure force. Ajouter 10 minutes de cardio supplémentaire après 2 séances/semaine." }
    ],
    keyTips: [
      "Protéines : consomme 1,6 à 2,2 g/kg/jour pour protéger la masse musculaire.",
      "Déficit calorique progressif : évite de réduire trop drastiquement tes calories d'un coup.",
      "Viser 8 000 à 12 000 pas actifs par jour pour augmenter ton NEAT.",
      "Sommeil suffisant de 7 à 9 heures pour optimiser la régulation hormonale et la récupération.",
      "Hydrate-toi régulièrement (2 à 3 L/jour)."
    ]
  },
  {
    id: "perte-poids-gym",
    title: "MONPROGRAMMEFIT : PROGRAMME PERTE DE POIDS",
    subtitle: "Salle de sport",
    author: "Coach Abdou BAKARI",
    duration: "8 semaines",
    level: "Débutant - Intermédiaire",
    frequency: "5 séances / semaine",
    trackId: "gym",
    objective: "Perdre du gras tout en conservant le muscle, améliorer le cardio et l'endurance, et maximiser la dépense énergétique globale en salle.",
    equipment: [
      "Équipements complets de salle de sport",
      "Tapis de course, vélo stationnaire, rameur",
      "Haltères, barres et bancs",
      "Poulies et machines guidées (Presse à cuisses, Smith machine, Leg extension, Leg curl)"
    ],
    warmup: {
      duration: "10 minutes",
      steps: [
        "Tapis incliné : 5 min — vitesse 5–6 km/h, inclinaison 5 %",
        "Squats poids du corps × 15, fentes alternées × 10 par jambe",
        "Cercles épaules × 20, mobilité hanches/chevilles"
      ]
    },
    generalRules: {
      rest: "Exercices classiques : 45 à 75 secondes | Circuits : 20 à 30 secondes entre exercices, 2 minutes entre les tours",
      tempo: "Surcharge progressive et contrôle des exécutions.",
      intensity: "Travaille avec une charge permettant 12 à 15 répétitions propres. Les 2 dernières répétitions doivent être difficiles."
    },
    weeklySchedule: [
      { day: "Lundi", focus: "Full Body brûle-graisse + cardio" },
      { day: "Mardi", focus: "Haut du corps + running" },
      { day: "Mercredi", focus: "Bas du corps + marche rapide" },
      { day: "Jeudi", focus: "Circuit métabolique + abdos" },
      { day: "Vendredi", focus: "Full Body endurance + cardio long" }
    ],
    sessions: [
      {
        id: "s_pp_gym_lundi",
        day: "Lundi",
        name: "Lundi — Full Body brûle-graisse + cardio",
        duration: "60-70 min",
        exosCount: 6,
        restNote: "Musculation classique puis tapis incliné 30 minutes.",
        exercises: [
          { name: "Presse à cuisses", sets: "4", reps: "12–15", rest: "60s", type: "principal", desc: "Pieds largeur épaules, descendre en contrôlant, ne pas verrouiller complètement les genoux." },
          { name: "Développé couché haltères", sets: "4", reps: "12", rest: "60s", type: "principal", desc: "Mouvement contrôlé, expire en poussant." },
          { name: "Tirage vertical poitrine", sets: "4", reps: "12–15", rest: "60s", type: "principal", desc: "Tire les coudes vers le bas, ne balance pas le corps." },
          { name: "Soulevé de terre roumain haltères", sets: "3", reps: "12", rest: "60s", type: "principal", desc: "Pousse les fesses vers l'arrière, sens l'étirement des ischio-jambiers." },
          { name: "Élévations latérales", sets: "3", reps: "15", rest: "45s", type: "isolation", desc: "Focus deltoïdes latéraux." },
          { name: "Gainage", sets: "3", reps: "45s", rest: "45s", type: "isolation", desc: "Planche ventrale bien solide." }
        ]
      },
      {
        id: "s_pp_gym_mardi",
        day: "Mardi",
        name: "Mardi — Haut du corps + Running",
        duration: "55-65 min",
        exosCount: 6,
        restNote: "Musculation haut du corps puis running.",
        exercises: [
          { name: "Développé incliné machine", sets: "3", reps: "12", rest: "60s", type: "principal", desc: "Contrôle la descente, repousse de manière dynamique." },
          { name: "Rowing assis poulie", sets: "4", reps: "12", rest: "60s", type: "principal", desc: "Squeeze les omoplates en fin de tirage." },
          { name: "Développé épaules machine", sets: "3", reps: "12", rest: "60s", type: "principal", desc: "Poussée verticale guidée." },
          { name: "Tirage vertical prise neutre", sets: "3", reps: "12", rest: "60s", type: "principal", desc: "Poignées neutres face à face, recrute le grand dorsal." },
          { name: "Curl biceps", sets: "3", reps: "15", rest: "45s", type: "isolation", desc: "Flexion des bras, contrôle la phase excentrique." },
          { name: "Extension triceps poulie", sets: "3", reps: "15", rest: "45s", type: "isolation", desc: "Extension complète avec corde ou barre." }
        ]
      },
      {
        id: "s_pp_gym_mercredi",
        day: "Mercredi",
        name: "Mercredi — Jambes + Marche rapide",
        duration: "60-70 min",
        exosCount: 6,
        restNote: "Suivi d'abdos et d'une marche rapide active de 45 minutes.",
        exercises: [
          { name: "Squat guidé (Smith machine)", sets: "4", reps: "12", rest: "90s", type: "principal", desc: "Descente contrôlée, fesses en arrière." },
          { name: "Leg extension", sets: "3", reps: "15", rest: "60s", type: "isolation", desc: "Forte contraction des quadriceps en haut." },
          { name: "Leg curl", sets: "3", reps: "15", rest: "60s", type: "isolation", desc: "Forte contraction des ischio-jambiers." },
          { name: "Fentes marchées", sets: "3", reps: "12 / jambe", rest: "60s", type: "principal", desc: "Progression par grands pas réguliers." },
          { name: "Mollets debout", sets: "4", reps: "20", rest: "45s", type: "isolation", desc: "Mollets avec amplitude complète." },
          { name: "Crunch machine", sets: "3", reps: "15", rest: "45s", type: "isolation", desc: "Enroulement de la colonne contre la résistance." }
        ]
      },
      {
        id: "s_pp_gym_jeudi",
        day: "Jeudi",
        name: "Jeudi — Circuit métabolique + Abdos",
        duration: "50-60 min",
        exosCount: 6,
        restNote: "Circuit de 4 tours. 2 min de repos entre les tours. Suivi des abdos et vélo de récup.",
        exercises: [
          { name: "Kettlebell swing", sets: "4", reps: "15", rest: "0s", type: "principal", desc: "Basculez les hanches de manière explosive." },
          { name: "Pompes", sets: "4", reps: "15", rest: "0s", type: "principal", desc: "Poitrine au sol." },
          { name: "Box jump", sets: "4", reps: "12", rest: "0s", type: "principal", desc: "Saut amorti sur box puis descente contrôlée." },
          { name: "Rowing haltères", sets: "4", reps: "12", rest: "0s", type: "principal", desc: "Rowing penché buste stable." },
          { name: "Mountain climbers", sets: "4", reps: "30s", rest: "0s", type: "isolation", desc: "Gainage actif dynamique." },
          { name: "Burpees", sets: "4", reps: "10", rest: "0s", type: "principal", desc: "Impact métabolique élevé." }
        ]
      },
      {
        id: "s_pp_gym_vendredi",
        day: "Vendredi",
        name: "Vendredi — Full Body endurance + cardio long",
        duration: "60-75 min",
        exosCount: 6,
        restNote: "Circuit musculation de 4 tours. 90s de repos entre tours. Suivi d'une option cardio de 30-45 minutes.",
        exercises: [
          { name: "Presse à cuisses", sets: "4", reps: "15", rest: "0s", type: "principal", desc: "Séries longues contrôlées." },
          { name: "Développé poitrine machine", sets: "4", reps: "12", rest: "0s", type: "principal", desc: "Poussée horizontale." },
          { name: "Tirage horizontal", sets: "4", reps: "12", rest: "0s", type: "principal", desc: "Prise neutre vers le nombril." },
          { name: "Soulevé de terre haltères", sets: "4", reps: "12", rest: "0s", type: "principal", desc: "Dos plat serré." },
          { name: "Élévations latérales", sets: "4", reps: "15", rest: "0s", type: "isolation", desc: "Épaules." },
          { name: "Gainage", sets: "4", reps: "45s", rest: "0s", type: "isolation", desc: "Gainage statique classique." }
        ]
      }
    ],
    stretching: {
      duration: "5 à 10 minutes",
      exercises: [
        "Pectoraux : 30 s × 2",
        "Dos : 30 s × 2",
        "Quadriceps : 30 s × 2",
        "Ischio-jambiers : 30 s × 2",
        "Mollets : 30 s × 2"
      ]
    },
    progressionPlan: [
      { period: "Semaines 1–2", desc: "Objectif : apprendre les mouvements, construire l'habitude. Cardio : 150 min/semaine environ." },
      { period: "Semaines 3–4", desc: "Augmenter légèrement les charges de travail et la durée du cardio d'environ 10 %." },
      { period: "Semaines 5–6", desc: "Ajouter un tour supplémentaire aux circuits et prolonger les sessions de running." },
      { period: "Semaines 7–8", desc: "Objectif : meilleure intensité, maintenir la force, maximiser la dépense calorique. Cardio : 200 à 300 min/semaine." }
    ],
    keyTips: [
      "Assure un apport élevé en protéines (1,6 à 2,2 g/kg/jour) pour préserver ta silhouette athlétique.",
      "Maintiens un déficit calorique modéré (environ 300-500 kcal sous tes besoins).",
      "Bois 2 à 3 litres d'eau quotidiennement.",
      "Dors 7 à 9 heures par nuit.",
      "Vise de 8 000 à 12 000 pas actifs par jour."
    ]
  },
  {
    id: "perte-poids-bodyweight",
    title: "MONPROGRAMMEFIT : PROGRAMME PERTE DE POIDS",
    subtitle: "Maison – Poids du corps (sans matériel)",
    author: "Coach Abdou BAKARI",
    duration: "8 semaines",
    level: "Débutant - Intermédiaire",
    frequency: "5 séances / semaine",
    trackId: "bodyweight",
    objective: "Perdre du gras sans aller en salle et sans matériel, améliorer l'endurance, renforcer tout le corps et augmenter la dépense calorique avec seulement le poids du corps.",
    equipment: [
      "Aucun matériel obligatoire (poids du corps)",
      "Une chaise solide (pour les dips/split squats)",
      "Un tapis de sol (conseillé)"
    ],
    warmup: {
      duration: "8–10 minutes",
      steps: [
        "Jumping jacks : 2 min, montées de genoux : 1 min, talons-fesses : 1 min",
        "Squats : 15 répétitions, fentes arrière : 10 par jambe",
        "Rotations articulaires : 2 min"
      ]
    },
    generalRules: {
      rest: "Circuits : 20 à 30 secondes entre exercices, 1 min 30 à 2 min entre les tours | Exercices classiques : 45 à 60 secondes",
      tempo: "Mouvement contrôlé, amplitude complète, respiration régulière.",
      intensity: "L'objectif n'est pas d'aller vite en sacrifiant la technique. Cherche un contrôle permanent."
    },
    weeklySchedule: [
      { day: "Lundi", focus: "Full Body brûle-graisse" },
      { day: "Mardi", focus: "Cardio + Haut du corps" },
      { day: "Mercredi", focus: "Jambes + Marche rapide" },
      { day: "Jeudi", focus: "HIIT + Abdominaux" },
      { day: "Vendredi", focus: "Full Body endurance" }
    ],
    sessions: [
      {
        id: "s_pp_bw_lundi",
        day: "Lundi",
        name: "Lundi — Full Body brûle-graisse",
        duration: "40-50 min",
        exosCount: 6,
        restNote: "Circuit à répéter 4 fois. 2 min de repos entre les tours. Cardio final en marche ou corde.",
        exercises: [
          { name: "Squats poids du corps", sets: "4", reps: "20", rest: "0s", type: "principal", desc: "Poitrine sortie, genoux alignés aux pieds, descente contrôlée." },
          { name: "Pompes (genoux si débutant)", sets: "4", reps: "12–15", rest: "0s", type: "principal", desc: "Poitrine frôle le sol, coudes rentrés vers l'arrière." },
          { name: "Fentes alternées", sets: "4", reps: "15 / jambe", rest: "0s", type: "principal", desc: "Genou arrière frôle le sol, buste bien vertical." },
          { name: "Superman", sets: "4", reps: "20", rest: "0s", type: "isolation", desc: "Renforce les muscles lombaires et le dos." },
          { name: "Mountain climbers", sets: "4", reps: "40s", rest: "0s", type: "isolation", desc: "Rythme régulier et gainage actif." },
          { name: "Gainage", sets: "4", reps: "45s", rest: "2 min", type: "isolation", desc: "Alignement parfait du corps, fessiers serrés." }
        ]
      },
      {
        id: "s_pp_bw_mardi",
        day: "Mardi",
        name: "Mardi — Haut du corps + Running",
        duration: "40-60 min",
        exosCount: 5,
        restNote: "Renforcement haut du corps puis running progressif.",
        exercises: [
          { name: "Pompes classiques", sets: "4", reps: "12–20", rest: "45-60s", type: "principal", desc: "Gardez une trajectoire de bras optimale." },
          { name: "Pompes diamant", sets: "3", reps: "10–15", rest: "45-60s", type: "isolation", desc: "Mains rapprochées pour cibler les triceps." },
          { name: "Pike push-ups", sets: "3", reps: "10–15", rest: "45-60s", type: "principal", desc: "Objectif épaules, tête descend en diagonale." },
          { name: "Dips sur chaise", sets: "3", reps: "12–15", rest: "45-60s", type: "isolation", desc: "Mains sur le bord d'une chaise, coudes serrés vers l'arrière." },
          { name: "Planche avec toucher épaules", sets: "3", reps: "20", rest: "45-60s", type: "isolation", desc: "Restez le plus stable possible au niveau du bassin." }
        ]
      },
      {
        id: "s_pp_bw_mercredi",
        day: "Mercredi",
        name: "Mercredi — Jambes + Marche rapide",
        duration: "45-60 min",
        exosCount: 6,
        restNote: "Suivi d'abdos et d'une marche rapide de 45-60 minutes.",
        exercises: [
          { name: "Squats", sets: "4", reps: "20", rest: "45-60s", type: "principal", desc: "Excellent pour les quadriceps et fessiers." },
          { name: "Squats sautés", sets: "3", reps: "15", rest: "45-60s", type: "principal", desc: "Extension verticale explosive, réception souple." },
          { name: "Bulgarian split squat", sets: "3", reps: "12 / jambe", rest: "45-60s", type: "principal", desc: "Utilisez le bord de la chaise comme support arrière." },
          { name: "Fentes arrière", sets: "3", reps: "15 / jambe", rest: "45-60s", type: "principal", desc: "Pas arrière contrôlé." },
          { name: "Pont fessier", sets: "4", reps: "20", rest: "45-60s", type: "isolation", desc: "Allongé sur le dos, contraction volontaire en haut." },
          { name: "Mollets debout", sets: "4", reps: "25", rest: "45-60s", type: "isolation", desc: "Montez haut sur la pointe des pieds." }
        ]
      },
      {
        id: "s_pp_bw_jeudi",
        day: "Jeudi",
        name: "Jeudi — HIIT brûle-graisse + Core",
        duration: "40-50 min",
        exosCount: 6,
        restNote: "Circuit de 5 tours. 2 min de repos entre les tours. Suivi des abdos.",
        exercises: [
          { name: "Burpees", sets: "5", reps: "10", rest: "0s", type: "principal", desc: "Sans tricher sur le saut final." },
          { name: "Mountain climbers", sets: "5", reps: "45s", rest: "0s", type: "isolation", desc: "Rythme de course horizontal." },
          { name: "Squats", sets: "5", reps: "20", rest: "0s", type: "principal", desc: "Squats rapides mais contrôlés." },
          { name: "Pompes", sets: "5", reps: "12", rest: "0s", type: "principal", desc: "Gardez le corps aligné." },
          { name: "Jumping jacks", sets: "5", reps: "50", rest: "0s", type: "isolation", desc: "Cardio continu." },
          { name: "High knees", sets: "5", reps: "40s", rest: "0s", type: "isolation", desc: "Montées de genoux rapides." }
        ]
      },
      {
        id: "s_pp_bw_vendredi",
        day: "Vendredi",
        name: "Vendredi — Full Body endurance",
        duration: "45-55 min",
        exosCount: 6,
        restNote: "Circuit de 5 tours. 90s de repos entre tours. Suivi de l'option de cardio final.",
        exercises: [
          { name: "Squats", sets: "5", reps: "20", rest: "0s", type: "principal", desc: "Contrôle de la descente." },
          { name: "Pompes", sets: "5", reps: "15", rest: "0s", type: "principal", desc: "Amplitude maximale." },
          { name: "Fentes alternées", sets: "5", reps: "20", rest: "0s", type: "principal", desc: "Fentes dynamiques de face." },
          { name: "Mountain climbers", sets: "5", reps: "40s", rest: "0s", type: "isolation", desc: "Excellent brûleur." },
          { name: "Superman", sets: "5", reps: "20", rest: "0s", type: "isolation", desc: "Renforcement des lombaires." },
          { name: "Gainage dynamique", sets: "5", reps: "45s", rest: "0s", type: "isolation", desc: "Planche active." }
        ]
      }
    ],
    stretching: {
      duration: "5 à 10 minutes",
      exercises: [
        "Pectoraux : 30 s × 2",
        "Épaules : 30 s × 2",
        "Dos : 30 s × 2",
        "Quadriceps : 30 s × 2",
        "Ischio-jambiers : 30 s × 2",
        "Mollets : 30 s × 2"
      ]
    },
    progressionPlan: [
      { period: "Semaines 1–2", desc: "Objectif : apprendre les mouvements, créer une routine de base (3-4 tours selon votre forme)." },
      { period: "Semaines 3–4", desc: "Ajouter +5 répétitions par exercice et réduire légèrement les repos." },
      { period: "Semaines 5–6", desc: "Ajouter un tour de circuit de plus et passer à des variantes d'exercices plus difficiles." },
      { period: "Semaines 7–8", desc: "Objectif final d'endurance et de dépense calorique. Possibilité d'ajouter 10 min de cardio après 2 séances." }
    ],
    keyTips: [
      "Maintiens un apport en protéines régulier (1,6 à 2,2 g/kg/jour) pour épargner tes muscles.",
      "Garantis un déficit calorique sain et progressif.",
      "Vise de 8 000 à 12 000 pas actifs par jour.",
      "Reste hydraté (2 à 3 L/jour).",
      "Dors suffisamment de 7 à 9 heures par nuit."
    ]
  }
];


