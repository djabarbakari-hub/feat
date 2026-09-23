"use client";

import Link from "next/link";
import { Award, CheckCircle2, ChevronRight, Play } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { getExercisesForSession, getGoalLabel } from "@/lib/program";
import { phaseLabel } from "@/lib/progress";
import { InstallBanner } from "@/components/InstallBanner";
import { SessionThumb } from "@/components/SessionThumb";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Bonjour";
  if (h < 18) return "Bon après-midi";
  return "Bonsoir";
}

export default function TodayPage() {
  const { profile, hasProgram } = useAuth();
  const firstName = profile?.firstName || "Athlète";
  const program = profile?.program;
  const sessions = program?.sessions || [];
  const next = sessions.find((s) => !s.done) || sessions[0];
  const done = sessions.filter((s) => s.done).length;
  const pct = sessions.length ? Math.round((done / sessions.length) * 100) : 0;
  const week = program?.week || 1;
  const totalWeeks = program?.totalWeeks || 8;
  const nextExos = next ? getExercisesForSession(next, profile) : [];

  if (!hasProgram) {
    return (
      <main className="screen home-page">
        <p className="eyebrow">{greeting()}</p>
        <h1 className="h1">{firstName}, on construit ton plan.</h1>
        <p className="muted">Quelques questions, et Coach Abdou t&apos;assigne un programme.</p>
        <Link href="/quiz" className="btn btn-primary btn-block">Démarrer l&apos;onboarding</Link>
      </main>
    );
  }

  return (
    <main className="screen home-page">
      <header className="home-header">
        <div>
          <p className="eyebrow">{greeting()}</p>
          <h1 className="h1">{firstName}</h1>
          <p className="muted">
            {getGoalLabel(profile.goal)} · semaine {week}/{totalWeeks}
          </p>
        </div>
      </header>

      <InstallBanner />

      <section className="home-hero-card">
        <div className="home-hero-bg" aria-hidden="true">
          <Award size={140} />
        </div>

        <div className="home-hero-top">
          <span className="home-phase">{phaseLabel(profile?.goal)}</span>
          <span className="home-hero-pct">{pct}%</span>
        </div>

        <p className="home-hero-label">Séance du jour</p>
        {next ? (
          <>
            <h2 className="home-hero-title">{next.name}</h2>
            <p className="home-hero-meta">
              {next.day || "Séance"} · {nextExos.length || next.exos || "—"} exercices · {next.duree || "45 min"}
            </p>

            <div className="home-hero-progress">
              <div className="home-hero-progress-bar">
                <span style={{ width: `${pct}%` }} />
              </div>
              <span>{done}/{sessions.length} séances</span>
            </div>

            <Link href={`/workout/${next.id}`} className="btn btn-primary btn-block home-hero-cta">
              <Play size={16} fill="currentColor" />
              {next.done ? "Revoir la séance" : "Commencer la séance"}
            </Link>
          </>
        ) : (
          <div className="home-hero-done">
            <CheckCircle2 size={22} />
            <p>Toutes les séances de la semaine sont faites. Récupère bien.</p>
          </div>
        )}
      </section>

      <section className="home-week">
        <div className="home-week-head">
          <h2 className="h2">Cette semaine</h2>
          <Link href="/program" className="home-week-link">
            Voir tout <ChevronRight size={14} />
          </Link>
        </div>

        <div className="home-week-list">
          {sessions.map((s) => (
            <Link key={s.id} href={`/workout/${s.id}`} className="card session-card home-session">
              <SessionThumb session={s} profile={profile} />
              <div className="home-session-copy">
                <p className="home-session-title">{s.name}</p>
                <p className="muted">{s.day} · {s.duree || "—"}</p>
              </div>
              <span className={`badge ${s.done ? "" : "badge--todo"}`}>
                {s.done ? "Faite" : "À faire"}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
