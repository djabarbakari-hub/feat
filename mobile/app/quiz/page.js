"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Dumbbell,
  Footprints,
  Heart,
  Home,
  Sparkles,
  Weight,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import {
  getBmiAssessment,
  getCoachProgramDisplayName,
  getMatchingCoachProgram,
  loadQuizDraft,
  saveQuizDraft,
} from "@/lib/program";

const GOALS = [
  {
    v: "perte-poids",
    l: "Perte de poids",
    d: "Brûler du gras, garder du muscle",
    icon: Weight,
  },
  {
    v: "musculation",
    l: "Musculation",
    d: "Prise de masse et force",
    icon: Dumbbell,
  },
  {
    v: "endurance-sante",
    l: "Endurance & santé",
    d: "Forme, énergie, régularité",
    icon: Heart,
  },
];

const PLACES = [
  {
    v: "gym",
    l: "En salle",
    d: "Machines et poids libres",
    icon: Dumbbell,
  },
  {
    v: "home-equip",
    l: "Maison + matériel",
    d: "Haltères, élastiques, banc…",
    icon: Home,
  },
  {
    v: "bodyweight",
    l: "Maison sans matériel",
    d: "Poids du corps uniquement",
    icon: Footprints,
  },
];

const TOTAL_STEPS = 4;

export default function QuizPage() {
  const { user, saveProgramFromQuiz } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState(() => ({
    objectif: "",
    lieu: "",
    physique: { age: 28, poids: 70, taille: 170 },
    ...loadQuizDraft(),
  }));
  const [pending, setPending] = useState(false);

  const program = useMemo(
    () => (answers.objectif && answers.lieu ? getMatchingCoachProgram(answers.objectif, answers.lieu) : null),
    [answers.objectif, answers.lieu],
  );
  const bmi = getBmiAssessment(answers.physique);
  const pct = Math.round(((step + 1) / TOTAL_STEPS) * 100);

  function patch(partial) {
    setAnswers((prev) => {
      const next = { ...prev, ...partial };
      saveQuizDraft(next);
      return next;
    });
  }

  function patchPhysique(key, value) {
    patch({ physique: { ...(answers.physique || {}), [key]: value } });
  }

  async function finish() {
    saveQuizDraft(answers);
    if (user) {
      setPending(true);
      await saveProgramFromQuiz(answers);
      setPending(false);
    }
    router.push("/pricing");
  }

  function goBack() {
    if (step === 0) {
      router.push("/welcome");
      return;
    }
    setStep((s) => s - 1);
  }

  return (
    <main className="quiz">
      <header className="quiz-top">
        <button type="button" className="quiz-back" onClick={goBack} aria-label="Retour">
          <ArrowLeft size={18} />
        </button>
        <div className="quiz-progress-wrap">
          <div className="quiz-progress-meta">
            <span>Orientation</span>
            <span>{step + 1} / {TOTAL_STEPS}</span>
          </div>
          <div className="quiz-progress" aria-hidden="true">
            <span style={{ width: `${pct}%` }} />
          </div>
        </div>
      </header>

      <div className="quiz-body">
        {step === 0 && (
          <section className="quiz-panel">
            <p className="quiz-eyebrow">Étape 1</p>
            <h1 className="quiz-title">Quel est ton objectif ?</h1>
            <p className="quiz-lead">On commence par ce que tu veux vraiment changer.</p>
            <div className="quiz-options">
              {GOALS.map((g) => {
                const Icon = g.icon;
                const on = answers.objectif === g.v;
                return (
                  <button
                    key={g.v}
                    type="button"
                    className={`quiz-option ${on ? "is-on" : ""}`}
                    onClick={() => {
                      patch({ objectif: g.v });
                      setStep(1);
                    }}
                  >
                    <span className="quiz-option-icon"><Icon size={22} /></span>
                    <span className="quiz-option-copy">
                      <strong>{g.l}</strong>
                      <small>{g.d}</small>
                    </span>
                    <span className="quiz-option-check">{on ? <Check size={16} /> : null}</span>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {step === 1 && (
          <section className="quiz-panel">
            <p className="quiz-eyebrow">Étape 2</p>
            <h1 className="quiz-title">Où vas-tu t’entraîner ?</h1>
            <p className="quiz-lead">Le programme s’adapte à ton environnement, pas l’inverse.</p>
            <div className="quiz-options">
              {PLACES.map((g) => {
                const Icon = g.icon;
                const on = answers.lieu === g.v;
                return (
                  <button
                    key={g.v}
                    type="button"
                    className={`quiz-option ${on ? "is-on" : ""}`}
                    onClick={() => {
                      patch({ lieu: g.v });
                      setStep(2);
                    }}
                  >
                    <span className="quiz-option-icon"><Icon size={22} /></span>
                    <span className="quiz-option-copy">
                      <strong>{g.l}</strong>
                      <small>{g.d}</small>
                    </span>
                    <span className="quiz-option-check">{on ? <Check size={16} /> : null}</span>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {step === 2 && (
          <section className="quiz-panel">
            <p className="quiz-eyebrow">Étape 3 · optionnel</p>
            <h1 className="quiz-title">Tes mensurations</h1>
            <p className="quiz-lead">Pour affiner ton programme et ton IMC. Tu peux passer.</p>

            <div className="quiz-metrics">
              <div className="quiz-metric">
                <div className="quiz-metric-head">
                  <span>Âge</span>
                  <strong>{answers.physique?.age || 28} <em>ans</em></strong>
                </div>
                <input
                  className="quiz-range"
                  type="range"
                  min="16"
                  max="78"
                  value={answers.physique?.age || 28}
                  onChange={(e) => patchPhysique("age", Number(e.target.value))}
                />
              </div>

              <div className="quiz-metric">
                <div className="quiz-metric-head">
                  <span>Poids</span>
                  <strong>{answers.physique?.poids || 70} <em>kg</em></strong>
                </div>
                <input
                  className="quiz-range"
                  type="range"
                  min="40"
                  max="160"
                  step="0.5"
                  value={answers.physique?.poids || 70}
                  onChange={(e) => patchPhysique("poids", Number(e.target.value))}
                />
              </div>

              <div className="quiz-metric">
                <div className="quiz-metric-head">
                  <span>Taille</span>
                  <strong>{answers.physique?.taille || 170} <em>cm</em></strong>
                </div>
                <input
                  className="quiz-range"
                  type="range"
                  min="140"
                  max="210"
                  value={answers.physique?.taille || 170}
                  onChange={(e) => patchPhysique("taille", Number(e.target.value))}
                />
              </div>
            </div>

            <div className="quiz-footer">
              <button type="button" className="btn btn-primary btn-block" onClick={() => setStep(3)}>
                Continuer <ArrowRight size={16} />
              </button>
              <button
                type="button"
                className="quiz-text-btn"
                onClick={() => {
                  patch({ physique: {} });
                  setStep(3);
                }}
              >
                Passer cette étape
              </button>
            </div>
          </section>
        )}

        {step === 3 && (
          <section className="quiz-panel">
            <p className="quiz-eyebrow">Résultat</p>
            <h1 className="quiz-title">Ton programme est prêt.</h1>
            <p className="quiz-lead">Voici ce que Coach Abdou te propose à partir de tes réponses.</p>

            {program ? (
              <div className="quiz-result-stack">
                <div className="quiz-program-card">
                  <div className="quiz-result-badge">
                    <Sparkles size={12} fill="currentColor" />
                    Coach Abdou · Officiel
                  </div>
                  <h2>{getCoachProgramDisplayName(program)}</h2>
                  <p>{program.objective}</p>
                  <div className="quiz-result-meta">
                    <span>{program.duration}</span>
                    <span>{program.frequency}</span>
                    <span>{program.level}</span>
                  </div>
                </div>

                {bmi ? (
                  <div className="bmi-glass-card">
                    <div className="bmi-header">
                      <div className="bmi-title-group">
                        <p>Analyse Corporelle</p>
                        <h3>Ton résultat IMC</h3>
                      </div>
                      <div className="bmi-score-badge">
                        <strong className="value" style={{ color: bmi.color }}>
                          {bmi.value.toFixed(1)}
                        </strong>
                        <span className="status" style={{ color: bmi.color }}>{bmi.status}</span>
                      </div>
                    </div>

                    <div className="bmi-visual-gauge">
                      <div className="bmi-gauge-bar" aria-hidden="true">
                        <span className="bmi-gauge-seg low" />
                        <span className="bmi-gauge-seg mid" />
                        <span className="bmi-gauge-seg high" />
                        <span className="bmi-gauge-seg vh" />
                      </div>
                      <div
                        className="bmi-gauge-pointer"
                        style={{ left: `${Math.min(98, Math.max(2, (bmi.value / 40) * 100))}%` }}
                      />
                    </div>

                    <div className="bmi-coach-note">
                      <p>“ {bmi.advice} ”</p>
                    </div>

                    <p className="bmi-card-note">L’IMC est un indicateur général, pas un diagnostic médical.</p>
                  </div>
                ) : (
                  <div className="card" style={{ textAlign: "center", borderStyle: "dashed" }}>
                    <p className="muted">
                      IMC non calculé. Ton programme reste personnalisé à partir de ton objectif et de ton lieu d’entraînement.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <p className="quiz-lead">Il manque encore quelques réponses pour générer ton programme.</p>
            )}

            <div className="quiz-footer">
              <button
                type="button"
                className="btn btn-primary btn-block"
                disabled={pending || !program}
                onClick={finish}
              >
                {pending ? "Enregistrement…" : "Continuer vers mon offre"}
                {!pending ? <ArrowRight size={16} /> : null}
              </button>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
