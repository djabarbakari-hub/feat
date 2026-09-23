"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Check,
  ChevronDown,
  Clock,
  Dumbbell,
  Flame,
  LayoutList,
  Play,
  Sparkles,
  Timer,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { COACH_PROGRAMS } from "@/lib/data";
import {
  getCoachProgramDisplayName,
  getMatchingCoachProgram,
} from "@/lib/program";
import { phaseLabel } from "@/lib/progress";
import { SessionThumb } from "@/components/SessionThumb";

export default function ProgramPage() {
  const { profile, hasProgram } = useAuth();
  const [tipsOpen, setTipsOpen] = useState(false);
  const program = profile?.program;
  const coach = COACH_PROGRAMS.find((p) => p.id === program?.coachProgramId)
    || getMatchingCoachProgram(profile?.goal, program?.track);

  const sessions = program?.sessions || [];
  const done = sessions.filter((s) => s.done).length;
  const pct = sessions.length ? Math.round((done / sessions.length) * 100) : 0;
  const nextId = sessions.find((s) => !s.done)?.id;
  const week = program?.week || 1;
  const totalWeeks = program?.totalWeeks || 8;
  const title = coach
    ? getCoachProgramDisplayName(coach).split(" — ")[0]
    : "Mon programme";

  if (!hasProgram) {
    return (
      <main className="screen program-page">
        <p className="eyebrow">Programme</p>
        <h1 className="h1">Ton plan t’attend.</h1>
        <p className="muted">Fais le quiz pour recevoir ton programme Coach Abdou.</p>
        <Link href="/quiz" className="btn btn-primary btn-block">Faire le quiz</Link>
      </main>
    );
  }

  return (
    <main className="screen program-page">
      <header className="program-header">
        <p className="eyebrow">Programme officiel</p>
        <h1 className="h1" style={{ fontSize: 26 }}>{title}</h1>
        <p className="muted">{coach?.subtitle}</p>
      </header>

      <section className="program-hero">
        <div className="program-hero-bg" aria-hidden="true">
          <LayoutList size={130} />
        </div>
        <div className="program-hero-top">
          <span className="home-phase">{phaseLabel(profile?.goal)}</span>
          <span className="program-hero-coach">
            <Sparkles size={12} />
            Coach Abdou
          </span>
        </div>
        <p className="program-hero-label">Semaine {week} / {totalWeeks}</p>
        <h2 className="program-hero-title">{done} séance{done > 1 ? "s" : ""} validée{done > 1 ? "s" : ""}</h2>
        <p className="program-hero-meta">
          {coach?.duration} · {coach?.frequency} · {coach?.level}
        </p>
        <div className="program-hero-progress">
          <div className="program-hero-progress-bar">
            <span style={{ width: `${pct}%` }} />
          </div>
          <span>{pct}% du cycle · {done}/{sessions.length}</span>
        </div>
      </section>

      {coach?.objective ? (
        <p className="program-objective">
          <Flame size={16} />
          <span>{coach.objective}</span>
        </p>
      ) : null}

      <div className="program-chips">
        <div className="program-chip">
          <Clock size={16} />
          <div>
            <strong>{coach?.duration || "—"}</strong>
            <span>Durée</span>
          </div>
        </div>
        <div className="program-chip">
          <Dumbbell size={16} />
          <div>
            <strong>{coach?.frequency?.replace(" / semaine", "") || "—"}</strong>
            <span>Par semaine</span>
          </div>
        </div>
        <div className="program-chip">
          <Timer size={16} />
          <div>
            <strong>{coach?.warmup?.duration || "10 min"}</strong>
            <span>Échauffement</span>
          </div>
        </div>
      </div>

      {(coach?.generalRules || coach?.equipment?.length) ? (
        <section className="card program-tips">
          <button
            type="button"
            className="program-tips-toggle"
            onClick={() => setTipsOpen((v) => !v)}
            aria-expanded={tipsOpen}
          >
            <span>
              <Sparkles size={16} color="var(--ember)" />
              Consignes du coach
            </span>
            <ChevronDown size={18} className={tipsOpen ? "is-open" : ""} />
          </button>

          {tipsOpen ? (
            <div className="program-tips-body">
              {coach.generalRules?.rest ? (
                <div className="program-tip-block">
                  <h3>Repos & tempo</h3>
                  <p>{coach.generalRules.rest}</p>
                  {coach.generalRules.tempo ? <p className="muted">{coach.generalRules.tempo}</p> : null}
                </div>
              ) : null}
              {coach.equipment?.length ? (
                <div className="program-tip-block">
                  <h3>Matériel</h3>
                  <ul>
                    {coach.equipment.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {coach.warmup?.steps?.length ? (
                <div className="program-tip-block">
                  <h3>Échauffement · {coach.warmup.duration}</h3>
                  <ul>
                    {coach.warmup.steps.map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          ) : null}
        </section>
      ) : null}

      <section>
        <div className="program-list-head">
          <h2 className="h2">Tes séances</h2>
          <span className="muted" style={{ fontSize: 12, fontWeight: 700 }}>
            {sessions.length} au programme
          </span>
        </div>

        <div className="program-sessions">
          {sessions.map((s, i) => {
            const isNext = s.id === nextId;
            const isDone = Boolean(s.done);
            return (
              <Link
                key={s.id || i}
                href={`/workout/${s.id}`}
                className={`card session-card program-session ${isNext ? "is-next" : ""} ${isDone ? "is-done" : ""}`}
              >
                <span className={`program-session-num ${isDone ? "is-done" : ""} ${isNext ? "is-next" : ""}`}>
                  {isDone ? <Check size={14} strokeWidth={3} /> : i + 1}
                </span>
                <SessionThumb session={s} profile={profile} />
                <div className="home-session-copy">
                  <p className="home-session-day">{s.day || `Séance ${i + 1}`}</p>
                  <p className="home-session-title">{s.name}</p>
                  <p className="muted">{s.exos} exos · {s.duree || "—"}</p>
                </div>
                {isNext ? (
                  <span className="program-play">
                    <Play size={14} fill="currentColor" />
                  </span>
                ) : (
                  <span className={`badge ${isDone ? "" : "badge--todo"}`}>
                    {isDone ? "Faite" : "À faire"}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
