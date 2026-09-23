"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { CheckCircle2, Droplets, Dumbbell, Flame, Play, Scale } from "lucide-react";

const SLIDES = [
  {
    image: "/images/onboard/01-programme.png",
    alt: "Athlète en salle choisissant ses haltères",
    eyebrow: "Programme sur mesure",
    title: "Ton programme.\nPas celui de tout le monde.",
    subtitle: "Objectif, lieu, matériel : on construit un plan qui te ressemble.",
    card: "programme",
  },
  {
    image: "/images/onboard/02-seance.png",
    alt: "Séance à la maison sur tapis",
    eyebrow: "Séance du jour",
    title: "Chaque séance,\nclaire et guidée.",
    subtitle: "Exercices, séries, repos : ouvre l’app et entraîne-toi.",
    card: "seance",
  },
  {
    image: "/images/onboard/03-coach.png",
    alt: "Coach accompagnant une athlète au squat",
    eyebrow: "Suivi coach",
    title: "Progresse avec\nun vrai coach.",
    subtitle: "Forme, hydratation, bilans : tu n’avances plus seul(e).",
    card: "coach",
  },
];

function CardProgramme() {
  return (
    <div className="ob-card">
      <div className="ob-card-top">
        <span className="ob-pill">Quiz · 2 min</span>
        <span className="ob-card-step">1 / 3</span>
      </div>
      <p className="ob-card-title">Quel est ton objectif ?</p>
      <div className="ob-row is-on">
        <Flame size={16} />
        Perte de poids
      </div>
      <div className="ob-row">
        <Dumbbell size={16} />
        Musculation
      </div>
      <div className="ob-row">
        <CheckCircle2 size={16} />
        Endurance & santé
      </div>
    </div>
  );
}

function CardSeance() {
  return (
    <div className="ob-card">
      <div className="ob-card-top">
        <span className="ob-pill">Aujourd’hui</span>
        <span className="ob-card-step">45 min</span>
      </div>
      <p className="ob-card-title">Full Body maison</p>
      <p className="ob-card-meta">5 exercices · Coach Abdou</p>
      <div className="ob-progress"><span style={{ width: "42%" }} /></div>
      <div className="ob-row is-on">
        <span className="ob-num">1</span>
        Squats goblet
      </div>
      <div className="ob-row">
        <span className="ob-num">2</span>
        Pompes contrôlées
      </div>
      <div className="ob-cta-mini">
        <Play size={14} fill="currentColor" />
        Lancer la séance
      </div>
    </div>
  );
}

function CardCoach() {
  return (
    <div className="ob-card">
      <div className="ob-card-top">
        <span className="ob-pill">Suivi</span>
        <span className="ob-card-step">Sem. 2</span>
      </div>
      <p className="ob-card-title">Tes indicateurs</p>
      <div className="ob-stats">
        <div className="ob-stat">
          <strong>3/5</strong>
          <span>séances</span>
        </div>
        <div className="ob-stat">
          <strong>1,5 L</strong>
          <span>eau</span>
        </div>
        <div className="ob-stat">
          <strong>74,2</strong>
          <span>kg</span>
        </div>
      </div>
      <div className="ob-row">
        <Droplets size={16} />
        Hydratation du jour
      </div>
      <div className="ob-row is-on">
        <Scale size={16} />
        Message du coach ✓
      </div>
    </div>
  );
}

const CARDS = {
  programme: CardProgramme,
  seance: CardSeance,
  coach: CardCoach,
};

export default function WelcomePage() {
  const scrollerRef = useRef(null);
  const [index, setIndex] = useState(0);
  const slide = SLIDES[index];
  const isLast = index === SLIDES.length - 1;

  function onScroll() {
    const el = scrollerRef.current;
    if (!el) return;
    const next = Math.round(el.scrollLeft / Math.max(1, el.clientWidth));
    setIndex(Math.min(SLIDES.length - 1, Math.max(0, next)));
  }

  function goTo(i) {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
  }

  function nextOrStart() {
    if (!isLast) goTo(index + 1);
  }

  return (
    <main className="onboard">
      <div
        className="onboard-scroller"
        ref={scrollerRef}
        onScroll={onScroll}
        aria-label="Présentation de MonProgrammeFit"
      >
        {SLIDES.map((s) => {
          const Card = CARDS[s.card];
          return (
            <section className="onboard-slide" key={s.image}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="onboard-photo" src={s.image} alt={s.alt} />
              <div className="onboard-veil" />
              <header className="onboard-top">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/icons/LOGO.png" alt="" className="onboard-logo" />
                <Link href="/quiz" className="onboard-skip">Passer</Link>
              </header>
              <div className="onboard-stage">
                <Card />
              </div>
            </section>
          );
        })}
      </div>

      <div className="onboard-dock">
        <p className="onboard-eyebrow">{slide.eyebrow}</p>
        <h1 className="onboard-title">{slide.title}</h1>
        <p className="onboard-sub">{slide.subtitle}</p>

        <div className="onboard-dots" role="tablist" aria-label="Étapes">
          {SLIDES.map((s, i) => (
            <button
              key={s.image}
              type="button"
              className={i === index ? "is-on" : ""}
              aria-label={`Étape ${i + 1}`}
              aria-current={i === index ? "step" : undefined}
              onClick={() => goTo(i)}
            />
          ))}
        </div>

        {isLast ? (
          <Link href="/quiz" className="btn btn-primary btn-block onboard-main-cta">
            Commencer mon programme
          </Link>
        ) : (
          <button type="button" className="btn btn-primary btn-block onboard-main-cta" onClick={nextOrStart}>
            Continuer
          </button>
        )}

        <Link href="/login" className="onboard-login">
          J’ai déjà un compte
        </Link>
      </div>
    </main>
  );
}
