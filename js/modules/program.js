/* ==========================================================
   modules/program.js — Application d'un programme coach à un compte.
   Lookup des séances par id (jamais par le mot « lundi » dans tout le catalogue).
   ========================================================== */

import { COACH_PROGRAMS } from "../data.js";
import { state, persistState } from "../state.js";
import { auth, db } from "../firebase.js";
import { doc, setDoc, collection, getDocs, writeBatch } from "firebase/firestore";

export const GOAL_LABELS = {
  "perte-poids": "Perte de poids",
  "prise-muscle": "Prise de muscle",
  "musculation": "Musculation / Prise de masse",
  "endurance-sante": "Endurance & Santé",
  "endurance": "Endurance",
  "sante": "Santé générale",
  "remise": "Remise en forme",
};

export const ADJUSTMENT_REASONS = [
  { v: "douleur", l: "Douleur ou gêne" },
  { v: "trop-dur", l: "Séances trop difficiles" },
  { v: "trop-facile", l: "Séances trop faciles" },
  { v: "materiel", l: "Changement de matériel ou de lieu" },
  { v: "emploi-du-temps", l: "Emploi du temps" },
  { v: "objectif", l: "Changement d'objectif" },
  { v: "autre", l: "Autre" },
];

export function getGoalLabel(goalId) {
  return GOAL_LABELS[goalId] || goalId || "Non défini";
}

export function getCoachProgramDisplayName(program) {
  if (!program) return "";
  const title = (program.title || "").replace("MONPROGRAMMEFIT : ", "");
  return program.subtitle ? `${title} — ${program.subtitle}` : title;
}

export function getAdjustmentReasonLabel(reasonId) {
  return ADJUSTMENT_REASONS.find((r) => r.v === reasonId)?.l || reasonId || "Ajustement";
}

/**
 * Construit l'objet program stocké sur le profil client, avec les ids officiels des séances.
 */
export function buildClientProgramFromCoach(coachProgram, { week = 1, track, history } = {}) {
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
    history: history || [{ name: `Semaine ${week}`, done: 0, total: sessions.length }],
    sessions,
  };
}

/**
 * Exercices de la séance du programme assigné au client.
 * Jamais de correspondance floue sur « lundi » dans tout le catalogue.
 */
export function getExercisesForSession(sessionRef) {
  const assignedId = state.clientProfile?.program?.coachProgramId
    || (typeof sessionRef === "object" ? sessionRef?.coachProgramId : "")
    || "";
  const sessionId = typeof sessionRef === "object" ? (sessionRef?.id || "") : (sessionRef || "");
  const sessionName = (typeof sessionRef === "object" ? (sessionRef?.name || "") : "")
    || (typeof sessionRef === "string" && !sessionRef.startsWith("s_") ? sessionRef : "");
  const normName = sessionName.toLowerCase().trim();

  const mapExercises = (matched) => (matched.exercises || []).map((ex) => ({
    name: ex.name,
    desc: ex.desc || "",
    detail: `${ex.sets} séries × ${ex.reps} (Repos: ${ex.rest})`,
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

export function findClientSession(sessionRef) {
  const sessions = state.clientProfile?.program?.sessions || [];
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

/**
 * Écrit le programme coach sur users/{uid} et remplace la sous-collection sessions.
 */
export async function applyProgramToUser(uid, coachProgram, options = {}) {
  if (!coachProgram) return false;

  const answers = options.answers || {};
  const goal = answers.objectif || options.goal || deduceGoalFromProgramId(coachProgram.id);
  const track = answers.lieu || coachProgram.trackId || options.track || "home-equip";
  const niveau = answers.niveau || options.niveau || coachProgram.level || "Débutant - Intermédiaire";
  const frequence = answers.frequence || options.frequence || coachProgram.frequency || "5 séances / semaine";
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
  let bmiValue = null;
  if (weight > 0 && height > 0) {
    const bmi = weight / ((height / 100) ** 2);
    if (!Number.isNaN(bmi)) {
      bmiValue = Math.round(bmi * 10) / 10;
      payload.bmi = bmiValue;
      payload.physique = { ...physique, bmi: bmiValue };
    }
  }

  const isSelf = auth.currentUser?.uid === uid && !options.skipLocalState && !state.simulationActive;
  if (isSelf) {
    state.clientProfile = {
      ...state.clientProfile,
      goal,
      track,
      niveau,
      frequence,
      physique: {
        ...(state.clientProfile?.physique || {}),
        ...physique,
        ...(bmiValue != null ? { bmi: bmiValue } : {}),
      },
      quizAnswers: { ...(state.clientProfile?.quizAnswers || {}), ...quizAnswers },
      assignedProgramId: coachProgram.id,
      program,
      ...(bmiValue != null ? { bmi: bmiValue } : {}),
    };
    persistState();
  }

  if (uid && !state.simulationActive) {
    await setDoc(doc(db, "users", uid), payload, { merge: true });
    await replaceUserSessionDocs(uid, program.sessions);
  }

  return true;
}

function deduceGoalFromProgramId(programId = "") {
  if (programId.startsWith("perte-poids")) return "perte-poids";
  if (programId.startsWith("sante-endurance")) return "endurance-sante";
  if (programId.startsWith("prise-de-muscle")) return "musculation";
  return "musculation";
}
