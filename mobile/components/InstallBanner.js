"use client";

import { useEffect, useState } from "react";

export function InstallBanner() {
  const [deferred, setDeferred] = useState(null);
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)").matches
      || window.navigator.standalone;
    if (standalone) return;

    const onPrompt = (e) => {
      e.preventDefault();
      setDeferred(e);
      setHidden(false);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  if (hidden || !deferred) return null;

  return (
    <div className="card" style={{ display: "flex", gap: 12, alignItems: "center" }}>
      <div style={{ flex: 1 }}>
        <strong style={{ display: "block", fontSize: 14 }}>Installer l&apos;app</strong>
        <p className="muted" style={{ fontSize: 12, marginTop: 2 }}>Sur l&apos;écran d&apos;accueil, comme une vraie appli.</p>
      </div>
      <button
        className="btn btn-primary"
        style={{ minHeight: 40, padding: "0 14px", fontSize: 13 }}
        onClick={async () => {
          deferred.prompt();
          await deferred.userChoice;
          setHidden(true);
        }}
      >
        Ajouter
      </button>
    </div>
  );
}
