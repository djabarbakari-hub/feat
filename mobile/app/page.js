"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

const SPLASH_MS = 2200;

export default function SplashPage() {
  const router = useRouter();
  const { user, loading, hasProgram } = useAuth();
  const [ready, setReady] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setReady(true), SPLASH_MS);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!ready || loading) return;

    setLeaving(true);
    const next = user ? (hasProgram ? "/today" : "/quiz") : "/welcome";
    const go = setTimeout(() => router.replace(next), 280);
    return () => clearTimeout(go);
  }, [ready, loading, user, hasProgram, router]);

  return (
    <main className={`splash ${leaving ? "is-leaving" : ""}`} aria-label="Chargement Mon Programme Fitness">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/icons/LOGO.png"
        alt="Mon Programme Fitness"
        className="splash-logo"
      />
    </main>
  );
}
