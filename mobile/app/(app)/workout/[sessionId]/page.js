"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Pause, Play, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { doc, setDoc } from "firebase/firestore";
import { useAuth } from "@/lib/auth-context";
import { findClientSession, getExercisesForSession } from "@/lib/program";
import { db } from "@/lib/firebase";
import { useWorkoutTimer } from "@/lib/use-workout-timer";
import { ExerciseVisual } from "@/components/ExerciseVisual";

export default function WorkoutPage() {
  const params = useParams();
  const sessionId = Array.isArray(params.sessionId) ? params.sessionId[0] : params.sessionId;
  const router = useRouter();
  const { profile, updateUser } = useAuth();
  const session = findClientSession(sessionId, profile);
  const exercises = useMemo(
    () => getExercisesForSession(session || sessionId, profile),
    [profile, session, sessionId],
  );
  const timer = useWorkoutTimer(session?.name || "Séance");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [checked, setChecked] = useState({});

  async function complete() {
    setSaving(true);
    const sessions = (profile?.program?.sessions || []).map((s) => (
      s.id === session?.id ? { ...s, done: true, notes, completedAt: new Date().toISOString(), durationSec: timer.seconds } : s
    ));
    const updated = sessions.find((s) => s.id === session?.id);
    await updateUser({
      program: {
        ...profile.program,
        sessions,
        nextSession: sessions.find((s) => !s.done)?.name || "",
      },
    });
    if (profile?.uid && updated?.id && db) {
      await setDoc(doc(db, "users", profile.uid, "sessions", updated.id), updated, { merge: true });
    }
    setSaving(false);
    router.replace("/today");
  }

  return (
    <main className="screen" style={{ background: "var(--ink)", color: "var(--chalk)", minHeight: "100dvh" }}>
      <button onClick={() => router.back()} className="muted" style={{ color: "rgba(247,245,240,0.7)", display: "inline-flex", alignItems: "center", gap: 6 }}>
        <ArrowLeft size={16} /> Quitter
      </button>

      <div>
        <p className="eyebrow">Séance en direct</p>
        <h1 className="h1" style={{ fontSize: 24, color: "white" }}>{session?.name || "Séance"}</h1>
      </div>

      <section className="card" style={{ background: "rgba(255,255,255,0.08)", borderColor: "rgba(255,255,255,0.12)", color: "white", textAlign: "center" }}>
        <p className="muted" style={{ color: "rgba(247,245,240,0.7)" }}>{timer.running ? "En cours" : "En pause"}</p>
        <p style={{ fontSize: 48, fontWeight: 800, fontVariantNumeric: "tabular-nums", letterSpacing: 1 }}>{timer.label}</p>
        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 8 }}>
          <button className="btn btn-primary" style={{ minHeight: 44 }} onClick={timer.toggle}>
            {timer.running ? <Pause size={16} /> : <Play size={16} />}
            {timer.running ? "Pause" : "Démarrer"}
          </button>
          <button className="btn btn-ghost" style={{ minHeight: 44, color: "white", borderColor: "rgba(255,255,255,0.25)" }} onClick={timer.reset}>
            <RotateCcw size={16} />
          </button>
          <button className="btn btn-ghost" style={{ minHeight: 44, color: "white", borderColor: "rgba(255,255,255,0.25)" }} onClick={timer.toggleVoice}>
            {timer.voiceOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
        </div>
      </section>

      <section style={{ display: "grid", gap: 14 }}>
        {exercises.length === 0 ? (
          <p className="muted">Aucun exercice trouvé pour cette séance.</p>
        ) : exercises.map((exo, idx) => {
          const setsMatch = String(exo.detail || "").match(/(\d+)\s*séries?/i);
          const setsCount = setsMatch ? Number(setsMatch[1]) : (Number(exo.sets) || 3);
          return (
            <article key={`${exo.name}-${idx}`} className="card" style={{ display: "grid", gap: 10 }}>
              <ExerciseVisual name={exo.name} />
              <p className="eyebrow">Exercice {idx + 1}</p>
              <h2 className="h2">{exo.name}</h2>
              {exo.desc ? <p className="muted">{exo.desc}</p> : null}
              <p style={{ fontWeight: 800, fontSize: 14 }}>{exo.detail || exo.reps}</p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {Array.from({ length: setsCount }, (_, i) => {
                  const key = `${idx}-${i}`;
                  const on = checked[key];
                  return (
                    <button
                      key={key}
                      className="btn btn-ghost"
                      style={{ minHeight: 40, padding: "0 12px", fontSize: 13, background: on ? "var(--moss-soft)" : "white", borderColor: on ? "var(--moss)" : "var(--line)" }}
                      onClick={() => setChecked((c) => ({ ...c, [key]: !c[key] }))}
                    >
                      Série {i + 1}
                    </button>
                  );
                })}
              </div>
            </article>
          );
        })}
      </section>

      <section className="card" style={{ display: "grid", gap: 10 }}>
        <h2 className="h2">Carnet de séance</h2>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Charges, ressenti, questions pour le coach…"
          style={{ width: "100%", border: "1px solid var(--line)", borderRadius: 12, padding: 12, font: "inherit", resize: "vertical" }}
        />
        <button className="btn btn-primary btn-block" disabled={saving} onClick={complete}>
          {saving ? "Enregistrement…" : "Valider la séance"}
        </button>
      </section>
    </main>
  );
}
