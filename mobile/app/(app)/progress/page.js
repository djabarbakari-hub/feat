"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  Award,
  CalendarDays,
  CheckCircle2,
  Droplets,
  Dumbbell,
  MessageCircle,
  PlusCircle,
  Scale,
  TrendingUp,
  X,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { whatsappUrl } from "@/lib/pricing";
import {
  WATER_TARGET,
  buildWeightChart,
  computeImc,
  computeWeightStats,
  formatCm,
  getBodyMeasurements,
  parseCoachBilan,
  phaseLabel,
} from "@/lib/progress";

const MEASURE_FIELDS = [
  { key: "waist", label: "Tour de taille", hint: "Nombril" },
  { key: "chest", label: "Tour de poitrine", hint: "Pectoraux" },
  { key: "arms", label: "Tour de bras", hint: "Biceps contracté" },
  { key: "thighs", label: "Tour de cuisses", hint: "Quadriceps" },
  { key: "hips", label: "Tour de hanches", hint: "Fessiers" },
];

function WeightChart({ chart, startWeight }) {
  if (!chart) return null;
  const {
    chartW,
    chartH,
    paddingLeft,
    paddingRight,
    paddingTop,
    paddingBottom,
    plotH,
    points,
    pathD,
    areaD,
    targetY,
    targetWeight,
  } = chart;

  return (
    <section className="card progress-section">
      <div className="progress-section-head">
        <div>
          <h2 className="h2" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <TrendingUp size={18} color="var(--moss)" />
            Courbe de poids
          </h2>
          <p className="muted" style={{ marginTop: 4 }}>
            Départ : {startWeight || "--"} kg
          </p>
        </div>
        {targetY !== null ? (
          <span className="badge" style={{ background: "var(--ember-soft)", color: "var(--ember)" }}>
            Objectif {targetWeight} kg
          </span>
        ) : null}
      </div>
      <div className="progress-chart-scroll">
        <svg width="100%" height={chartH} viewBox={`0 0 ${chartW} ${chartH}`} className="progress-chart-svg">
          <defs>
            <linearGradient id="weightAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3C5A46" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#3C5A46" stopOpacity="0" />
            </linearGradient>
          </defs>
          <line x1={paddingLeft} y1={paddingTop} x2={chartW - paddingRight} y2={paddingTop} stroke="rgba(0,0,0,0.06)" strokeDasharray="4" />
          <line x1={paddingLeft} y1={paddingTop + plotH / 2} x2={chartW - paddingRight} y2={paddingTop + plotH / 2} stroke="rgba(0,0,0,0.06)" strokeDasharray="4" />
          <line x1={paddingLeft} y1={chartH - paddingBottom} x2={chartW - paddingRight} y2={chartH - paddingBottom} stroke="rgba(0,0,0,0.12)" />
          {targetY !== null ? (
            <>
              <line x1={paddingLeft} y1={targetY} x2={chartW - paddingRight} y2={targetY} stroke="#E2622D" strokeDasharray="6 4" strokeWidth="1.5" />
              <text x={chartW - paddingRight + 4} y={targetY + 4} fontSize="9" fontWeight="800" fill="#E2622D">{targetWeight}kg</text>
            </>
          ) : null}
          {areaD ? <path d={areaD} fill="url(#weightAreaGrad)" /> : null}
          {pathD ? <path d={pathD} fill="none" stroke="#3C5A46" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" /> : null}
          {points.map((p) => (
            <g key={`${p.date}-${p.weight}`}>
              <circle cx={p.x} cy={p.y} r="6" fill="#3C5A46" stroke="#fff" strokeWidth="2.5" />
              <text x={p.x} y={p.y - 12} fontSize="11" fontWeight="800" fill="#16232C" textAnchor="middle">{p.weight} kg</text>
              <text x={p.x} y={chartH - 14} fontSize="10" fontWeight="600" fill="#64748b" textAnchor="middle">{p.date}</text>
            </g>
          ))}
        </svg>
      </div>
    </section>
  );
}

function Sheet({ title, onClose, children }) {
  return (
    <div className="progress-sheet" role="dialog" aria-modal="true" aria-label={title}>
      <button type="button" className="progress-sheet-backdrop" aria-label="Fermer" onClick={onClose} />
      <div className="progress-sheet-panel">
        <div className="progress-sheet-head">
          <h2 className="h2">{title}</h2>
          <button type="button" className="quiz-back" onClick={onClose} aria-label="Fermer">
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function ProgressPage() {
  const { profile, updateUser } = useAuth();
  const [sheet, setSheet] = useState(null); // "weight" | "measures" | null
  const [weightInput, setWeightInput] = useState("");
  const [pending, setPending] = useState(false);
  const body = getBodyMeasurements(profile);
  const [measures, setMeasures] = useState({
    waist: body.waist || "",
    chest: body.chest || "",
    arms: body.arms || "",
    hips: body.hips || "",
    thighs: body.thighs || "",
  });

  const todayStr = new Date().toDateString();
  const waterLog = profile?.dailyWaterLog?.date === todayStr
    ? profile.dailyWaterLog
    : { date: todayStr, amount: 0 };
  const waterAmount = waterLog.amount || 0;
  const waterPct = Math.min(100, Math.round((waterAmount / WATER_TARGET) * 100));

  const program = profile?.program || null;
  const sessions = program?.sessions || [];
  const weekHistory = program?.history || [];
  const totalDone = sessions.filter((s) => s.done).length;
  const week = program?.week || 1;
  const totalWeeks = program?.totalWeeks || 8;
  const globalPct = Math.round((totalDone / Math.max(1, sessions.length)) * 100);
  const firstName = profile?.firstName || "Athlète";

  const { weightHistory, currentWeight, startWeight, targetWeight, weightDiff } = useMemo(
    () => computeWeightStats(profile),
    [profile],
  );
  const height = Number(profile?.physique?.taille || profile?.height || 0);
  const imc = computeImc(currentWeight, height);
  const chart = useMemo(
    () => buildWeightChart(weightHistory, targetWeight),
    [weightHistory, targetWeight],
  );
  const coachBilan = parseCoachBilan(profile);

  function openMeasures() {
    const latest = getBodyMeasurements(profile);
    setMeasures({
      waist: latest.waist || "",
      chest: latest.chest || "",
      arms: latest.arms || "",
      hips: latest.hips || "",
      thighs: latest.thighs || "",
    });
    setSheet("measures");
  }

  async function addWater(ml) {
    await updateUser({ dailyWaterLog: { date: todayStr, amount: waterAmount + ml } });
  }

  async function saveWeight(e) {
    e.preventDefault();
    const value = Number(weightInput);
    if (!value) return;
    setPending(true);
    try {
      const dateStr = new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" });
      await updateUser({
        weight: value,
        physique: { ...(profile?.physique || {}), poids: value },
        weightHistory: [...weightHistory, { date: dateStr, weight: value }].slice(-40),
      });
      setWeightInput("");
      setSheet(null);
    } finally {
      setPending(false);
    }
  }

  async function saveMeasures(e) {
    e.preventDefault();
    setPending(true);
    try {
      const next = {
        waist: measures.waist ? Number(measures.waist) : null,
        chest: measures.chest ? Number(measures.chest) : null,
        arms: measures.arms ? Number(measures.arms) : null,
        hips: measures.hips ? Number(measures.hips) : null,
        thighs: measures.thighs ? Number(measures.thighs) : null,
        updatedAt: new Date().toLocaleDateString("fr-FR"),
      };
      await updateUser({ bodyMeasurements: next });
      setSheet(null);
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="screen progress-page">
      <header className="progress-header">
        <div>
          <p className="eyebrow">Espace performance</p>
          <h1 className="h1">Ma progression</h1>
          <p className="muted">
            Poids, mensurations et avancement sous le suivi de Coach Abdou.
          </p>
        </div>
        <div className="progress-actions">
          <button type="button" className="btn btn-primary progress-action-btn" onClick={() => setSheet("weight")}>
            <PlusCircle size={16} />
            Pesée
          </button>
          <button type="button" className="btn btn-ghost progress-action-btn" onClick={openMeasures}>
            <Activity size={16} />
            Mensurations
          </button>
        </div>
      </header>

      <section className="progress-banner">
        <div className="progress-banner-bg" aria-hidden="true">
          <Award size={140} />
        </div>
        <div className="progress-banner-top">
          <span className="progress-phase">{phaseLabel(profile?.goal)}</span>
          <span className="progress-athlete">Athlète · <strong>{firstName}</strong></span>
        </div>
        <h2>Semaine {week} sur {totalWeeks}</h2>
        <p>
          {totalDone > 0
            ? `Tu as complété ${totalDone} séance${totalDone > 1 ? "s" : ""}. La régularité fait la différence.`
            : "Lance ta première séance pour démarrer tes indicateurs."}
        </p>
        <div className="progress-banner-stats">
          <div>
            <span>Progression</span>
            <strong>{globalPct}%</strong>
          </div>
          <div className="progress-banner-divider" />
          <div>
            <span>Bilan coach</span>
            <strong className="progress-ok">
              <CheckCircle2 size={14} /> À jour
            </strong>
          </div>
        </div>
      </section>

      <div className="progress-metrics">
        <article className="card progress-metric">
          <div className="progress-metric-top">
            <span>Poids & tendance</span>
            <span className="progress-metric-icon" style={{ background: "var(--ember-soft)", color: "var(--ember)" }}>
              <Scale size={18} />
            </span>
          </div>
          <div className="progress-metric-value">
            {currentWeight ? <>{currentWeight} <em>kg</em></> : "--"}
            {weightDiff !== 0 ? (
              <span className={`progress-delta ${weightDiff < 0 ? "is-down" : "is-up"}`}>
                {weightDiff > 0 ? "+" : ""}{weightDiff} kg
              </span>
            ) : null}
          </div>
          <p className="muted">Départ : <strong>{startWeight ? `${startWeight} kg` : "--"}</strong></p>
        </article>

        <article className="card progress-metric">
          <div className="progress-metric-top">
            <span>Discipline</span>
            <span className="progress-metric-icon" style={{ background: "var(--moss-soft)", color: "var(--moss)" }}>
              <Dumbbell size={18} />
            </span>
          </div>
          <div className="progress-metric-value">
            {totalDone} <em>/ {sessions.length}</em>
          </div>
          <div className="progress-bar" style={{ marginTop: 10 }}>
            <span style={{ width: `${globalPct}%` }} />
          </div>
        </article>

        <article className="card progress-metric">
          <div className="progress-metric-top">
            <span>Eau du jour</span>
            <span className="progress-metric-icon" style={{ background: "rgba(37,99,235,0.1)", color: "#2563eb" }}>
              <Droplets size={18} />
            </span>
          </div>
          <div className="progress-metric-value">
            {waterAmount} <em>/ {WATER_TARGET} ml</em>
          </div>
          <p className="muted">{waterPct}% de la cible</p>
          <div className="progress-water-btns">
            <button type="button" className="btn btn-ghost" onClick={() => addWater(250)}>+250</button>
            <button type="button" className="btn btn-ghost" onClick={() => addWater(500)}>+500</button>
          </div>
        </article>

        <article className="card progress-metric">
          <div className="progress-metric-top">
            <span>IMC</span>
            <span className="progress-metric-icon" style={{ background: "rgba(16,185,129,0.1)", color: "#10b981" }}>
              <Activity size={18} />
            </span>
          </div>
          <div className="progress-metric-value" style={{ color: imc?.color || "var(--ink)" }}>
            {imc ? imc.value : "--"}
          </div>
          <p className="muted" style={{ color: imc?.color || undefined, fontWeight: 700 }}>
            {imc ? imc.status : "Renseigne ta taille"}
          </p>
        </article>
      </div>

      {chart ? (
        <WeightChart chart={chart} startWeight={startWeight} />
      ) : (
        <section className="card progress-empty-chart">
          <TrendingUp size={28} color="var(--slate)" />
          <h2 className="h2">Active ton suivi de poids</h2>
          <p className="muted">Enregistre ta première pesée pour générer ta courbe d’évolution.</p>
          <button type="button" className="btn btn-primary" onClick={() => setSheet("weight")}>
            <PlusCircle size={16} />
            Enregistrer ma pesée
          </button>
        </section>
      )}

      <section className="card progress-section">
        <div className="progress-section-head">
          <div>
            <h2 className="h2" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Activity size={18} color="var(--ember)" />
              Mensurations
            </h2>
            <p className="muted" style={{ marginTop: 4 }}>
              Au-delà de la balance — silhouette en cm.
            </p>
          </div>
          <button type="button" className="btn btn-ghost" style={{ minHeight: 40, padding: "0 12px", fontSize: 13 }} onClick={openMeasures}>
            Mettre à jour
          </button>
        </div>
        <div className="progress-measures">
          {MEASURE_FIELDS.map((field) => (
            <div key={field.key} className="progress-measure-row">
              <div>
                <strong>{field.label}</strong>
                <span className="muted">{field.hint}</span>
              </div>
              <span className="progress-measure-value">{formatCm(body[field.key])}</span>
            </div>
          ))}
        </div>
      </section>

      {coachBilan ? (
        <section className="card progress-coach">
          <div className="progress-coach-head">
            <div className="progress-coach-avatar">AB</div>
            <div>
              <h2 className="h2" style={{ fontSize: 15 }}>Bilan Coach Abdou</h2>
              <span className="muted" style={{ color: "var(--moss)", fontWeight: 700, fontSize: 12 }}>
                Conseil personnalisé
              </span>
            </div>
            {coachBilan.dateStr ? <span className="badge">{coachBilan.dateStr}</span> : null}
          </div>
          <blockquote>“ {coachBilan.text} ”</blockquote>
          <a
            className="btn btn-block progress-wa"
            href={whatsappUrl(`Bonjour Coach Abdou, au sujet de mon bilan : ${coachBilan.text.slice(0, 60)}...`)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle size={16} />
            Échanger sur WhatsApp
          </a>
        </section>
      ) : null}

      <section className="card progress-section">
        <h2 className="h2" style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <CalendarDays size={18} color="var(--moss)" />
          Avancement par semaine
        </h2>
        <p className="muted" style={{ marginBottom: 16 }}>
          Chaque semaine validée consolide ta forme.
        </p>
        <div className="progress-weeks">
          {weekHistory.length > 0 ? weekHistory.map((h, index) => {
            const isCurrent = index + 1 === week;
            const pct = Math.round((h.done / Math.max(1, h.total)) * 100);
            return (
              <div key={`${h.name}-${index}`} className={`progress-week ${isCurrent ? "is-current" : ""}`}>
                {isCurrent ? <span className="progress-week-badge">Semaine active</span> : null}
                <div className="progress-week-top">
                  <strong>{h.name}</strong>
                  <span>{h.done} / {h.total}</span>
                </div>
                <div className="progress-bar">
                  <span style={{ width: `${pct}%`, background: pct === 100 ? "var(--moss)" : "var(--ember)" }} />
                </div>
                <div className="progress-week-foot">
                  <span>{pct}% des objectifs</span>
                  {pct === 100 ? <span className="progress-week-done">Semaine complétée</span> : null}
                </div>
              </div>
            );
          }) : (
            <p className="muted" style={{ textAlign: "center", padding: "16px 8px" }}>
              Aucune semaine encore. Lance ta première séance depuis Accueil ou Programme.
            </p>
          )}
        </div>
      </section>

      {sheet === "weight" ? (
        <Sheet title="Loguer ma pesée" onClose={() => setSheet(null)}>
          <form onSubmit={saveWeight} className="progress-sheet-form">
            <p className="muted">Indique ton poids du jour (à jeun de préférence).</p>
            <div className="field">
              <label htmlFor="weight-input">Poids (kg)</label>
              <input
                id="weight-input"
                type="number"
                step="0.1"
                min="30"
                max="250"
                placeholder="Ex: 75.5"
                value={weightInput}
                onChange={(e) => setWeightInput(e.target.value)}
                required
                autoFocus
              />
            </div>
            <button type="submit" className="btn btn-primary btn-block" disabled={pending}>
              {pending ? "Enregistrement…" : "Enregistrer"}
            </button>
          </form>
        </Sheet>
      ) : null}

      {sheet === "measures" ? (
        <Sheet title="Mensurations" onClose={() => setSheet(null)}>
          <form onSubmit={saveMeasures} className="progress-sheet-form">
            <p className="muted">Mesures au mètre ruban, en cm.</p>
            <div className="progress-sheet-grid">
              {MEASURE_FIELDS.map((field) => (
                <div className="field" key={field.key}>
                  <label htmlFor={`m-${field.key}`}>{field.label}</label>
                  <input
                    id={`m-${field.key}`}
                    type="number"
                    step="0.5"
                    min="0"
                    placeholder={field.hint}
                    value={measures[field.key]}
                    onChange={(e) => setMeasures((m) => ({ ...m, [field.key]: e.target.value }))}
                  />
                </div>
              ))}
            </div>
            <button type="submit" className="btn btn-primary btn-block" disabled={pending}>
              {pending ? "Enregistrement…" : "Enregistrer"}
            </button>
          </form>
        </Sheet>
      ) : null}

    </main>
  );
}
