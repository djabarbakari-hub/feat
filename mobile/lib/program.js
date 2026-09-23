import { collection, doc, getDocs, setDoc, writeBatch } from "firebase/firestore";
import { COACH_PROGRAMS } from "./data";
import { db } from "./firebase";

export const GOAL_LABELS = {
  "perte-poids": "Perte de poids",
  "prise-muscle": "Prise de muscle",
  musculation: "Musculation / Prise de masse",
  "endurance-sante": "Endurance & Santé",
  endurance: "Endurance",
  sante: "Santé générale",
  remise: "Remise en forme",
};

export function getGoalLabel(goalId) {
  return GOAL_LABELS[goalId] || goalId || "Objectif à définir";
}

export function getCoachProgramDisplayName(program) {
  if (!program) return "";
  const title = (program.title || "").replace("MONPROGRAMMEFIT : ", "");
  return program.subtitle ? `${title} — ${program.subtitle}` : title;
}

export function getMatchingCoachProgram(goal, trackId) {
  const normGoal = (goal || "").toLowerCase().trim();
  const normTrack = (trackId || "").toLowerCase().trim();

  let targetGoalPrefix = "perte-poids";
  if (normGoal.includes("muscle") || normGoal.includes("musculation") || normGoal.includes("masse")) {
    targetGoalPrefix = "prise-de-muscle";
  } else if (normGoal.includes("sante") || normGoal.includes("endurance") || normGoal.includes("remise")) {
    targetGoalPrefix = "sante-endurance";
  } else if (normGoal.includes("poids") || normGoal.includes("perte") || normGoal.includes("seche")) {
    targetGoalPrefix = "perte-poids";
  }

  let targetTrackSuffix = "home";
  if (normTrack.includes("bodyweight") || normTrack.includes("poids-corps") || normTrack === "bodyweight") {
    targetTrackSuffix = "bodyweight";
  } else if (normTrack.includes("gym") || normTrack.includes("salle") || normTrack === "gym") {
    targetTrackSuffix = "gym";
  } else if (normTrack.includes("home") || normTrack.includes("mat") || normTrack === "home-equip") {
    targetTrackSuffix = "home";
  }

  const expectedId = `${targetGoalPrefix}-${targetTrackSuffix}`;
  return COACH_PROGRAMS.find((p) => p.id === expectedId)
    || COACH_PROGRAMS.find((p) => p.trackId === trackId)
    || COACH_PROGRAMS[0];
}

export function buildClientProgramFromCoach(coachProgram, { week = 1, track } = {}) {
  const sessions = (coachProgram.sessions || []).map((s, idx) => ({
    id: s.id,
    name: s.name,
    day: s.day || "",
    exos: s.exercises?.length || s.exosCount || 0,
    duree: s.duration || s.duree || "",
    done: false,
    weekNumber: week,
    order: idx,
    coachProgramId: coachProgram.id,
  }));

  return {
    coachProgramId: coachProgram.id,
    assignedProgramId: coachProgram.id,
    trackLabel: `${getCoachProgramDisplayName(coachProgram)} — Coach Abdou BAKARI`,
    track: track || coachProgram.trackId || "home-equip",
    week,
    totalWeeks: 8,
    nextSession: sessions[0]?.name || "",
    history: [{ name: `Semaine ${week}`, done: 0, total: sessions.length }],
    sessions,
  };
}

export function getExercisesForSession(sessionRef, profile) {
  const assignedId = profile?.program?.coachProgramId
    || (typeof sessionRef === "object" ? sessionRef?.coachProgramId : "")
    || "";
  const sessionId = typeof sessionRef === "object" ? (sessionRef?.id || "") : (sessionRef || "");
  const sessionName = (typeof sessionRef === "object" ? (sessionRef?.name || "") : "")
    || (typeof sessionRef === "string" && !String(sessionRef).startsWith("s_") ? sessionRef : "");
  const normName = sessionName.toLowerCase().trim();

  const mapExercises = (matched) => (matched.exercises || []).map((ex) => ({
    name: ex.name,
    desc: ex.desc || "",
    sets: ex.sets,
    reps: ex.reps,
    rest: ex.rest,
    detail: ex.sets
      ? `${ex.sets} séries × ${ex.reps}${ex.rest ? ` (Repos: ${ex.rest})` : ""}`
      : (ex.reps ? String(ex.reps) : ""),
  }));

  const coachP = COACH_PROGRAMS.find((p) => p.id === assignedId);
  if (coachP) {
    const matched = coachP.sessions.find((s) => s.id === sessionId)
      || (normName ? coachP.sessions.find((s) => s.name.toLowerCase().trim() === normName) : null);
    if (matched) return mapExercises(matched);
  }

  if (sessionId) {
    for (const prog of COACH_PROGRAMS) {
      const matched = prog.sessions.find((s) => s.id === sessionId);
      if (matched) return mapExercises(matched);
    }
  }

  return [];
}

export function findClientSession(sessionRef, profile) {
  const sessions = profile?.program?.sessions || [];
  const id = typeof sessionRef === "object" ? sessionRef?.id : sessionRef;
  const name = typeof sessionRef === "object" ? sessionRef?.name : "";
  return sessions.find((s) => s.id && s.id === id)
    || sessions.find((s) => name && s.name === name)
    || sessions.find((s) => s.name === sessionRef)
    || null;
}

export async function replaceUserSessionDocs(uid, sessions) {
  if (!uid) return;
  const colRef = collection(db, "users", uid, "sessions");
  const existing = await getDocs(colRef);
  const batch = writeBatch(db);
  existing.forEach((snap) => batch.delete(snap.ref));
  (sessions || []).forEach((s) => {
    if (!s?.id) return;
    batch.set(doc(db, "users", uid, "sessions", s.id), s);
  });
  await batch.commit();
}

function deduceGoalFromProgramId(programId = "") {
  if (programId.startsWith("perte-poids")) return "perte-poids";
  if (programId.startsWith("sante-endurance")) return "endurance-sante";
  if (programId.startsWith("prise-de-muscle")) return "musculation";
  return "musculation";
}

export async function applyProgramToUser(uid, coachProgram, options = {}) {
  if (!coachProgram || !uid) return false;

  const answers = options.answers || {};
  const goal = answers.objectif || options.goal || deduceGoalFromProgramId(coachProgram.id);
  const track = answers.lieu || coachProgram.trackId || options.track || "home-equip";
  const niveau = answers.niveau || coachProgram.level || "Débutant - Intermédiaire";
  const frequence = answers.frequence || coachProgram.frequency || "5 séances / semaine";
  const physique = answers.physique || options.physique || {};
  const week = options.week || 1;
  const program = buildClientProgramFromCoach(coachProgram, { week, track });

  const quizAnswers = {
    ...(options.quizAnswers || {}),
    ...answers,
    objectif: goal,
    lieu: track,
    niveau,
    frequence,
  };

  const payload = {
    goal,
    track,
    niveau,
    frequence,
    assignedProgramId: coachProgram.id,
    quizAnswers,
    program,
    updatedAt: new Date().toISOString(),
  };

  if (physique.poids) payload.weight = parseFloat(physique.poids);
  if (physique.taille) payload.height = parseFloat(physique.taille);
  if (physique.age) payload.age = parseInt(physique.age, 10);

  const weight = Number(physique.poids);
  const height = Number(physique.taille);
  if (weight > 0 && height > 0) {
    const bmi = weight / ((height / 100) ** 2);
    if (!Number.isNaN(bmi)) {
      const bmiValue = Math.round(bmi * 10) / 10;
      payload.bmi = bmiValue;
      payload.physique = { ...physique, bmi: bmiValue };
    }
  }

  await setDoc(doc(db, "users", uid), payload, { merge: true });
  await replaceUserSessionDocs(uid, program.sessions);
  return true;
}

export function getBmiAssessment(physique) {
  const weight = Number(physique?.poids);
  const height = Number(physique?.taille);
  const bmi = weight > 0 && height > 0 ? weight / ((height / 100) ** 2) : null;
  if (bmi === null || Number.isNaN(bmi)) return null;
  if (bmi < 18.5) {
    return {
      value: bmi,
      status: "Insuffisance pondérale",
      advice: "Une orientation vers un programme de prise de muscle, avec progression progressive et récupération suffisante, peut être pertinente.",
      color: "#2563eb",
    };
  }
  if (bmi < 25) {
    return {
      value: bmi,
      status: "Corpulence dans la norme",
      advice: "Tu as une bonne base : le programme sera ajusté à ton objectif, ton niveau et ton environnement.",
      color: "#3C5A46",
    };
  }
  if (bmi < 30) {
    return {
      value: bmi,
      status: "Surpoids",
      advice: "Une orientation vers un programme de perte de poids progressif, combinant renforcement et endurance, peut être adaptée.",
      color: "#d97706",
    };
  }
  return {
    value: bmi,
    status: "Obésité",
    advice: "Une reprise progressive, orientée vers la perte de poids et adaptée à tes capacités, est recommandée. Un avis médical peut compléter cet accompagnement.",
    color: "#E2622D",
  };
}

export const QUIZ_STORAGE_KEY = "mpf-mobile-quiz";

export function saveQuizDraft(answers) {
  try {
    localStorage.setItem(QUIZ_STORAGE_KEY, JSON.stringify({ answers, savedAt: Date.now() }));
  } catch {
    /* ignore */
  }
}

export function loadQuizDraft() {
  try {
    const raw = localStorage.getItem(QUIZ_STORAGE_KEY);
    return raw ? JSON.parse(raw).answers || {} : {};
  } catch {
    return {};
  }
}

export function clearQuizDraft() {
  try {
    localStorage.removeItem(QUIZ_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
