"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, readableAuthError } from "@/lib/auth-context";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
    </svg>
  );
}

export default function SignupPage() {
  const { signUp, signInGoogle, configured } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setPending(true);
    try {
      const email = await signUp(form);
      router.replace(`/login?created=${encodeURIComponent(email)}`);
    } catch (err) {
      setError(readableAuthError(err));
    } finally {
      setPending(false);
    }
  }

  async function onGoogle() {
    setError("");
    setPending(true);
    try {
      await signInGoogle();
    } catch (err) {
      setError(readableAuthError(err));
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="screen screen--auth">
      <p className="eyebrow">Inscription</p>
      <h1 className="h1">Crée ton compte athlète.</h1>
      <p className="muted">Ton programme et ton 1er mois gratuit t’attendent.</p>

      {!configured && (
        <p className="error">Firebase n&apos;est pas configuré. Copie les clés dans mobile/.env.local</p>
      )}

      <div className="auth-stack">
        <button
          className="btn btn-google btn-block"
          type="button"
          disabled={pending || !configured}
          onClick={onGoogle}
        >
          <GoogleIcon />
          {pending ? "Création Google…" : "S’inscrire avec Google"}
        </button>

        <div className="auth-divider">
          <span>ou avec e-mail</span>
        </div>

        <form onSubmit={onSubmit} className="auth-form">
          <div className="field">
            <label htmlFor="firstName">Prénom</label>
            <input id="firstName" value={form.firstName} onChange={(e) => set("firstName", e.target.value)} required />
          </div>
          <div className="field">
            <label htmlFor="lastName">Nom</label>
            <input id="lastName" value={form.lastName} onChange={(e) => set("lastName", e.target.value)} required />
          </div>
          <div className="field">
            <label htmlFor="email">E-mail</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="password">Mot de passe</label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              minLength={6}
              value={form.password}
              onChange={(e) => set("password", e.target.value)}
              required
            />
          </div>
          {error ? <p className="error">{error}</p> : null}
          <button className="btn btn-ink btn-block" disabled={pending || !configured}>
            {pending ? "Création…" : "Créer mon compte"}
          </button>
        </form>
      </div>

      <p className="muted" style={{ marginTop: "auto" }}>
        Déjà inscrit ?{" "}
        <Link href="/login" style={{ color: "var(--ember)", fontWeight: 800 }}>
          Se connecter
        </Link>
      </p>
    </main>
  );
}
