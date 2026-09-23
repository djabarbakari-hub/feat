"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Gift, MessageCircle, Sparkles } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import {
  getCoachProgramDisplayName,
  getMatchingCoachProgram,
  loadQuizDraft,
} from "@/lib/program";
import { PLANS, whatsappUrl } from "@/lib/pricing";

const PLAN_KEY = "mpf-mobile-selected-plan";

export function saveSelectedPlan(planId) {
  try {
    localStorage.setItem(PLAN_KEY, planId);
  } catch {
    /* ignore */
  }
}

export function loadSelectedPlan() {
  try {
    return localStorage.getItem(PLAN_KEY) || "premium";
  } catch {
    return "premium";
  }
}

export default function PricingPage() {
  const router = useRouter();
  const { user, saveProgramFromQuiz } = useAuth();
  const answers = useMemo(() => loadQuizDraft(), []);
  const program = useMemo(
    () => (answers.objectif && answers.lieu ? getMatchingCoachProgram(answers.objectif, answers.lieu) : null),
    [answers],
  );
  const [selected, setSelected] = useState(() => loadSelectedPlan());
  const [pending, setPending] = useState(false);
  const activePlan = PLANS.find((p) => p.id === selected) || PLANS[1];

  async function startTrial() {
    saveSelectedPlan(selected);
    if (user) {
      setPending(true);
      if (answers.objectif && answers.lieu) {
        await saveProgramFromQuiz(answers);
      }
      try {
        localStorage.setItem("mpf-mobile-trial-started", new Date().toISOString());
      } catch {
        /* ignore */
      }
      setPending(false);
      router.replace("/today");
      return;
    }
    router.push("/signup");
  }

  return (
    <main className="pricing">
      <header className="pricing-top">
        <button type="button" className="quiz-back" onClick={() => router.push("/quiz")} aria-label="Retour">
          <ArrowLeft size={18} />
        </button>
        <div>
          <p className="quiz-eyebrow" style={{ marginBottom: 2 }}>Tarifs</p>
          <strong style={{ fontSize: 15 }}>Choisis ton accompagnement</strong>
        </div>
      </header>

      <section className="pricing-hero">
        <div className="pricing-gift">
          <Gift size={16} />
          1er mois offert
        </div>
        <h1>Commence gratuitement.<br />Passe en payant quand tu es prêt.</h1>
        <p>
          {program
            ? `Ton programme « ${getCoachProgramDisplayName(program)} » t’attend. Le premier mois est gratuit pour tester.`
            : "Le premier mois est gratuit pour découvrir MonProgrammeFit."}
        </p>
      </section>

      <div className="pricing-list">
        {PLANS.map((plan) => {
          const on = selected === plan.id;
          return (
            <button
              key={plan.id}
              type="button"
              className={`pricing-card ${plan.highlight ? "is-featured" : ""} ${on ? "is-on" : ""}`}
              onClick={() => setSelected(plan.id)}
            >
              <div className="pricing-card-top">
                <div>
                  {plan.badge ? <span className="pricing-badge">{plan.badge}</span> : null}
                  <h2>{plan.name}</h2>
                </div>
                <span className={`pricing-radio ${on ? "is-on" : ""}`} aria-hidden="true" />
              </div>
              <p className="pricing-desc">{plan.desc}</p>
              <div className="pricing-price">
                <strong>{plan.price}</strong>
                <span>{plan.unit}</span>
              </div>
              <ul className="pricing-perks">
                {plan.perks.map((perk) => (
                  <li key={perk}>
                    <Check size={14} strokeWidth={2.5} />
                    {perk}
                  </li>
                ))}
              </ul>
            </button>
          );
        })}
      </div>

      <div className="pricing-footer">
        <button type="button" className="btn btn-primary btn-block" disabled={pending} onClick={startTrial}>
          <Sparkles size={16} />
          {pending ? "Activation…" : "Commencer mon 1er mois gratuit"}
        </button>
        <a
          className="btn btn-ghost btn-block"
          href={whatsappUrl(activePlan.whatsapp)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => saveSelectedPlan(selected)}
        >
          <MessageCircle size={16} />
          Souscrire via WhatsApp
        </a>
        <Link href="/login" className="quiz-text-btn" style={{ textAlign: "center" }}>
          J’ai déjà un compte
        </Link>
        <p className="pricing-note">
          Paiement en FCFA. Sans engagement sur Flex. Tu pourras passer Premium quand tu veux.
        </p>
      </div>
    </main>
  );
}
