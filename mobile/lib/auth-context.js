"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, onSnapshot, setDoc } from "firebase/firestore";
import { auth, db, googleProvider, isFirebaseConfigured } from "./firebase";
import { applyProgramToUser, getMatchingCoachProgram, clearQuizDraft, loadQuizDraft } from "./program";

const AuthContext = createContext(null);

function readableAuthError(error) {
  const code = error?.code || "";
  if (code.includes("invalid-credential") || code.includes("wrong-password") || code.includes("user-not-found")) {
    return "E-mail ou mot de passe incorrect.";
  }
  if (code.includes("email-already-in-use")) return "Un compte existe déjà avec cet e-mail.";
  if (code.includes("weak-password")) return "Le mot de passe doit contenir au moins 6 caractères.";
  if (code.includes("too-many-requests")) return "Trop de tentatives. Réessaie dans un moment.";
  if (code.includes("popup-closed")) return "Connexion Google annulée.";
  return error?.message || "Une erreur est survenue.";
}

function normalizeProfile(uid, email, data = {}, photoURL = "") {
  const physique = {
    poids: data.weight ?? data.physique?.poids ?? null,
    taille: data.height ?? data.physique?.taille ?? null,
    age: data.age ?? data.physique?.age ?? null,
  };
  return {
    uid,
    email,
    photoURL: data.photoURL || photoURL || "",
    ...data,
    physique,
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      setLoading(false);
      return undefined;
    }

    let unsubProfile = () => {};
    const unsubAuth = onAuthStateChanged(auth, (nextUser) => {
      unsubProfile();
      setUser(nextUser);
      if (!nextUser) {
        setProfile(null);
        setLoading(false);
        return;
      }
      const ref = doc(db, "users", nextUser.uid);
      unsubProfile = onSnapshot(ref, (snap) => {
        const data = snap.exists() ? snap.data() : {};
        setProfile(normalizeProfile(nextUser.uid, nextUser.email, data, nextUser.photoURL));
        setLoading(false);
      }, () => setLoading(false));
    });

    return () => {
      unsubAuth();
      unsubProfile();
    };
  }, []);

  const value = useMemo(() => ({
    user,
    profile,
    loading,
    configured: isFirebaseConfigured(),
    role: profile?.role || (user ? "client" : "guest"),
    hasProgram: Boolean(profile?.program?.sessions?.length),

    async signIn(email, password) {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const isSuperAdmin = (cred.user.email || "").toLowerCase() === "djabarbakari.032003@gmail.com";
      if (!cred.user.emailVerified && !isSuperAdmin) {
        try { await sendEmailVerification(cred.user); } catch { /* ignore */ }
        await firebaseSignOut(auth);
        throw new Error("Ton e-mail n'est pas encore validé. Un nouveau lien vient d'être envoyé.");
      }
      const snap = await getDoc(doc(db, "users", cred.user.uid));
      if (!snap.exists() && !isSuperAdmin) {
        await firebaseSignOut(auth);
        throw new Error("Aucun compte n'est enregistré avec cet e-mail. Crée un compte.");
      }
    },

    async signUp({ firstName, lastName, email, password }) {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: `${firstName} ${lastName}`.trim() });
      const answers = loadQuizDraft();
      let selectedPlan = "premium";
      try {
        selectedPlan = localStorage.getItem("mpf-mobile-selected-plan") || "premium";
      } catch {
        /* ignore */
      }
      const trialStartedAt = new Date().toISOString();
      await setDoc(doc(db, "users", cred.user.uid), {
        firstName,
        lastName,
        email,
        role: "client",
        createdAt: trialStartedAt,
        selectedPlan,
        trial: {
          active: true,
          startedAt: trialStartedAt,
          monthsFree: 1,
        },
        ...(answers.objectif ? {
          quizAnswers: answers,
          goal: answers.objectif,
          track: answers.lieu || "",
        } : {}),
      });
      if (answers.objectif && answers.lieu) {
        const program = getMatchingCoachProgram(answers.objectif, answers.lieu);
        await applyProgramToUser(cred.user.uid, program, { answers });
        clearQuizDraft();
      }
      try { await sendEmailVerification(cred.user); } catch { /* ignore */ }
      await firebaseSignOut(auth);
      return email;
    },

    async signInGoogle() {
      const cred = await signInWithPopup(auth, googleProvider);
      const ref = doc(db, "users", cred.user.uid);
      const snap = await getDoc(ref);
      const names = (cred.user.displayName || "").split(" ");
      const isNew = !snap.exists();
      let selectedPlan = "premium";
      try {
        selectedPlan = localStorage.getItem("mpf-mobile-selected-plan") || "premium";
      } catch {
        /* ignore */
      }
      const trialStartedAt = new Date().toISOString();
      const answers = loadQuizDraft();
      await setDoc(ref, {
        firstName: snap.data()?.firstName || names[0] || "Athlète",
        lastName: snap.data()?.lastName || names.slice(1).join(" ") || "",
        email: cred.user.email,
        role: snap.data()?.role || "client",
        photoURL: cred.user.photoURL || null,
        createdAt: snap.data()?.createdAt || trialStartedAt,
        ...(isNew ? {
          selectedPlan,
          trial: { active: true, startedAt: trialStartedAt, monthsFree: 1 },
          ...(answers.objectif ? {
            quizAnswers: answers,
            goal: answers.objectif,
            track: answers.lieu || "",
          } : {}),
        } : {}),
      }, { merge: true });
      if (isNew && answers.objectif && answers.lieu) {
        const program = getMatchingCoachProgram(answers.objectif, answers.lieu);
        await applyProgramToUser(cred.user.uid, program, { answers });
        clearQuizDraft();
      }
    },

    async signOut() {
      await firebaseSignOut(auth);
    },

    async resetPassword(email) {
      await sendPasswordResetEmail(auth, email);
    },

    async saveProgramFromQuiz(answers) {
      if (!user) {
        return false;
      }
      const program = getMatchingCoachProgram(answers.objectif, answers.lieu);
      await applyProgramToUser(user.uid, program, { answers });
      clearQuizDraft();
      return true;
    },

    async updateUser(partial) {
      if (!user) return;
      await setDoc(doc(db, "users", user.uid), { ...partial, updatedAt: new Date().toISOString() }, { merge: true });
    },
  }), [user, profile, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export { readableAuthError };
