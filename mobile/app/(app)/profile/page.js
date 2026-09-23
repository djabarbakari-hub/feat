"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Activity,
  ChevronRight,
  KeyRound,
  LayoutList,
  LogOut,
  Mail,
  MessageCircle,
  Pencil,
  Phone,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import {
  getCoachProgramDisplayName,
  getGoalLabel,
  getMatchingCoachProgram,
} from "@/lib/program";
import { COACH_PROGRAMS } from "@/lib/data";
import { whatsappUrl } from "@/lib/pricing";
import { InstallBanner } from "@/components/InstallBanner";

const TRACK_LABELS = {
  salle: "Salle de gym",
  gym: "Salle de gym",
  "maison-mat": "Maison avec matériel",
  "home-equip": "Maison avec matériel",
  "poids-corps": "Maison poids du corps",
  bodyweight: "Maison poids du corps",
};

function trackLabel(track) {
  return TRACK_LABELS[track] || track || "Non défini";
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

function DataRow({ label, value, accent }) {
  return (
    <div className="profile-data-row">
      <span>{label}</span>
      <strong style={accent ? { color: "var(--ember)" } : undefined}>{value || "—"}</strong>
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, profile, role, signOut, updateUser, resetPassword } = useAuth();
  const [sheet, setSheet] = useState(null); // "edit" | null
  const [pending, setPending] = useState(false);
  const [info, setInfo] = useState("");
  const [error, setError] = useState("");

  const firstName = profile?.firstName || "";
  const lastName = profile?.lastName || "";
  const fullName = `${firstName || "Athlète"} ${lastName}`.trim();
  const email = profile?.email || user?.email || "";
  const phone = profile?.phone || "";
  const physique = profile?.physique || {};
  const weight = physique.poids || profile?.weight;
  const height = physique.taille || profile?.height;
  const age = physique.age || profile?.age;
  const medical = physique.remarques || profile?.medicalNotes || "";

  const isGoogleAuth = Boolean(
    user?.providerData?.some((p) => p.providerId === "google.com"),
  );

  const coach = useMemo(() => {
    const id = profile?.program?.coachProgramId;
    return COACH_PROGRAMS.find((p) => p.id === id)
      || getMatchingCoachProgram(profile?.goal, profile?.track || profile?.program?.track);
  }, [profile]);

  const programName = coach
    ? getCoachProgramDisplayName(coach)
    : (profile?.program?.trackLabel || "");
  const sessions = profile?.program?.sessions || [];
  const doneCount = sessions.filter((s) => s.done).length;
  const hasQuiz = Boolean(profile?.goal || profile?.track || profile?.quizAnswers);
  const initials = `${(firstName || "A")[0]}${(lastName || "")[0] || ""}`.toUpperCase();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    goal: "perte-poids",
    track: "home-equip",
    poids: "",
    taille: "",
    age: "",
    medicalNotes: "",
  });

  function openEdit() {
    setError("");
    setInfo("");
    setForm({
      firstName: firstName || "",
      lastName: lastName || "",
      phone: phone || "",
      goal: profile?.goal || "perte-poids",
      track: profile?.track || profile?.program?.track || "home-equip",
      poids: weight || "",
      taille: height || "",
      age: age || "",
      medicalNotes: medical || "",
    });
    setSheet("edit");
  }

  function setField(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function saveProfile(e) {
    e.preventDefault();
    setPending(true);
    setError("");
    try {
      const poids = form.poids ? Number(form.poids) : null;
      const taille = form.taille ? Number(form.taille) : null;
      const ageVal = form.age ? Number(form.age) : null;
      await updateUser({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        phone: form.phone.trim(),
        goal: form.goal,
        track: form.track,
        weight: poids,
        height: taille,
        age: ageVal,
        medicalNotes: form.medicalNotes.trim(),
        physique: {
          ...(profile?.physique || {}),
          poids,
          taille,
          age: ageVal,
          remarques: form.medicalNotes.trim(),
        },
      });
      setSheet(null);
      setInfo("Profil mis à jour.");
    } catch (err) {
      setError(err?.message || "Impossible d’enregistrer.");
    } finally {
      setPending(false);
    }
  }

  async function onResetPassword() {
    if (!email) {
      setError("Aucun e-mail associé au compte.");
      return;
    }
    setPending(true);
    setError("");
    try {
      await resetPassword(email);
      setInfo("E-mail de réinitialisation envoyé.");
    } catch (err) {
      setError(err?.message || "Envoi impossible.");
    } finally {
      setPending(false);
    }
  }

  async function onSignOut() {
    await signOut();
    router.replace("/login");
  }

  return (
    <main className="screen profile-page">
      <section className="profile-hero">
        <div className="profile-hero-top">
          <span className="home-phase">Mon compte</span>
          <span className="profile-hero-secure">
            <ShieldCheck size={12} />
            Sécurisé
          </span>
        </div>
        <div className="profile-hero-identity">
          <div className="profile-avatar" aria-hidden="true">
            {profile?.photoURL ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.photoURL} alt="" />
            ) : (
              initials
            )}
          </div>
          <div>
            <h1 className="profile-hero-name">{fullName}</h1>
            <p className="profile-hero-email">{email || "Session active"}</p>
            <p className="profile-hero-auth">
              {isGoogleAuth ? "Connexion Google" : "E-mail & mot de passe"}
              {role === "admin" ? " · Coach" : " · Athlète"}
            </p>
          </div>
        </div>
        <div className="profile-hero-actions">
          <button type="button" className="btn btn-ghost profile-hero-btn" onClick={openEdit}>
            <Pencil size={14} />
            Modifier
          </button>
          <a
            className="btn btn-primary profile-hero-btn"
            href={whatsappUrl(`Bonjour Coach Abdou, je suis ${fullName}. J’ai une question sur mon profil / programme.`)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle size={14} />
            Coach
          </a>
        </div>
      </section>

      {info ? <p className="success">{info}</p> : null}
      {error ? <p className="error">{error}</p> : null}

      <section className="card profile-section">
        <div className="profile-section-head">
          <div className="profile-section-icon" style={{ background: "var(--ember-soft)", color: "var(--ember)" }}>
            <UserRound size={18} />
          </div>
          <div>
            <h2 className="h2" style={{ fontSize: 16 }}>Coordonnées</h2>
            <p className="muted" style={{ fontSize: 12 }}>Identité et contact</p>
          </div>
        </div>
        <div className="profile-data">
          <DataRow label="Prénom" value={firstName || "Non renseigné"} />
          <DataRow label="Nom" value={lastName || "Non renseigné"} />
          <DataRow label="E-mail" value={email || "Non renseigné"} />
          <DataRow label="Téléphone" value={phone || "Non renseigné"} />
        </div>
        <div className="profile-section-actions">
          <button type="button" className="btn btn-ghost" style={{ minHeight: 44, fontSize: 13 }} onClick={openEdit}>
            <Pencil size={14} />
            Éditer
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            style={{ minHeight: 44, fontSize: 13 }}
            disabled={pending}
            onClick={onResetPassword}
          >
            {isGoogleAuth ? <KeyRound size={14} /> : <Mail size={14} />}
            {isGoogleAuth ? "Définir un mot de passe" : "Reset mot de passe"}
          </button>
        </div>
      </section>

      <section className="card profile-section">
        <div className="profile-section-head">
          <div className="profile-section-icon" style={{ background: "var(--moss-soft)", color: "var(--moss)" }}>
            <Activity size={18} />
          </div>
          <div>
            <h2 className="h2" style={{ fontSize: 16 }}>Profil sportif</h2>
            <p className="muted" style={{ fontSize: 12 }}>Objectif et mensurations</p>
          </div>
        </div>
        <div className="profile-data">
          <DataRow label="Objectif" value={getGoalLabel(profile?.goal)} accent />
          <DataRow label="Lieu / équipement" value={trackLabel(profile?.track || profile?.program?.track)} />
          <DataRow
            label="Poids / taille"
            value={
              weight || height
                ? `${weight ? `${weight} kg` : "—"} / ${height ? `${height} cm` : "—"}`
                : "—"
            }
          />
          <DataRow label="Âge" value={age ? `${age} ans` : "—"} />
          <DataRow
            label="Notes médicales"
            value={medical || "Aucune contrainte enregistrée"}
          />
        </div>
        <button type="button" className="btn btn-ghost btn-block" style={{ minHeight: 44, fontSize: 13 }} onClick={openEdit}>
          Ajuster mon profil sportif
        </button>
      </section>

      <section className="card profile-section">
        <div className="profile-section-head">
          <div className="profile-section-icon" style={{ background: "rgba(0,0,0,0.05)", color: "var(--ink)" }}>
            <LayoutList size={18} />
          </div>
          <div>
            <h2 className="h2" style={{ fontSize: 16 }}>Programme & données</h2>
            <p className="muted" style={{ fontSize: 12 }}>Inventaire de ton espace</p>
          </div>
        </div>
        <div className="profile-inventory">
          <div className="profile-inv-row">
            <span>Programme actif</span>
            <strong>{programName || "Aucun"}</strong>
          </div>
          <div className="profile-inv-row">
            <span>Onboarding</span>
            <strong style={{ color: hasQuiz ? "var(--moss)" : "var(--slate)" }}>
              {hasQuiz ? "Validé" : "À compléter"}
            </strong>
          </div>
          <div className="profile-inv-row">
            <span>Séances validées</span>
            <strong>{doneCount} / {sessions.length || 0}</strong>
          </div>
          <div className="profile-inv-row">
            <span>Offre</span>
            <strong>{profile?.selectedPlan || "—"}</strong>
          </div>
        </div>
        <Link href="/quiz" className="profile-link-row">
          Repasser le quiz
          <ChevronRight size={16} />
        </Link>
      </section>

      {role === "admin" ? (
        <div className="card">
          <p style={{ fontWeight: 800 }}>Espace coach</p>
          <p className="muted" style={{ marginTop: 6 }}>
            L’administration reste sur le site web. Cette app est faite pour les athlètes.
          </p>
        </div>
      ) : null}

      <InstallBanner />

      <button type="button" className="btn btn-ghost btn-block profile-logout" onClick={onSignOut}>
        <LogOut size={16} />
        Se déconnecter
      </button>

      {sheet === "edit" ? (
        <Sheet title="Modifier mon profil" onClose={() => setSheet(null)}>
          <form onSubmit={saveProfile} className="progress-sheet-form">
            <p className="profile-sheet-section">1. Coordonnées</p>
            <div className="progress-sheet-grid">
              <div className="field">
                <label htmlFor="pf-first">Prénom</label>
                <input id="pf-first" value={form.firstName} onChange={(e) => setField("firstName", e.target.value)} required />
              </div>
              <div className="field">
                <label htmlFor="pf-last">Nom</label>
                <input id="pf-last" value={form.lastName} onChange={(e) => setField("lastName", e.target.value)} />
              </div>
            </div>
            <div className="field">
              <label htmlFor="pf-phone">Téléphone</label>
              <div className="profile-input-icon">
                <Phone size={16} />
                <input
                  id="pf-phone"
                  type="tel"
                  placeholder="+229…"
                  value={form.phone}
                  onChange={(e) => setField("phone", e.target.value)}
                />
              </div>
            </div>

            <p className="profile-sheet-section">2. Profil sportif</p>
            <div className="progress-sheet-grid">
              <div className="field">
                <label htmlFor="pf-goal">Objectif</label>
                <select id="pf-goal" value={form.goal} onChange={(e) => setField("goal", e.target.value)}>
                  <option value="perte-poids">Perte de poids</option>
                  <option value="musculation">Musculation</option>
                  <option value="endurance-sante">Santé & Endurance</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="pf-track">Lieu</label>
                <select id="pf-track" value={form.track} onChange={(e) => setField("track", e.target.value)}>
                  <option value="gym">Salle de gym</option>
                  <option value="home-equip">Maison avec matériel</option>
                  <option value="bodyweight">Maison poids du corps</option>
                </select>
              </div>
            </div>
            <div className="progress-sheet-grid" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
              <div className="field">
                <label htmlFor="pf-poids">Poids</label>
                <input id="pf-poids" type="number" step="0.1" value={form.poids} onChange={(e) => setField("poids", e.target.value)} />
              </div>
              <div className="field">
                <label htmlFor="pf-taille">Taille</label>
                <input id="pf-taille" type="number" value={form.taille} onChange={(e) => setField("taille", e.target.value)} />
              </div>
              <div className="field">
                <label htmlFor="pf-age">Âge</label>
                <input id="pf-age" type="number" value={form.age} onChange={(e) => setField("age", e.target.value)} />
              </div>
            </div>
            <div className="field">
              <label htmlFor="pf-notes">Notes médicales</label>
              <textarea
                id="pf-notes"
                rows={3}
                placeholder="Douleurs, blessures…"
                value={form.medicalNotes}
                onChange={(e) => setField("medicalNotes", e.target.value)}
              />
            </div>
            {error ? <p className="error">{error}</p> : null}
            <button type="submit" className="btn btn-primary btn-block" disabled={pending}>
              {pending ? "Enregistrement…" : "Enregistrer"}
            </button>
          </form>
        </Sheet>
      ) : null}
    </main>
  );
}
