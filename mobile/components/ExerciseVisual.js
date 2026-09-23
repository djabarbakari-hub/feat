"use client";

import { useState } from "react";
import { resolveExerciseVisual } from "@/lib/exercise-visuals";

export function ExerciseVisual({ name }) {
  const visual = resolveExerciseVisual(name);
  const [src, setSrc] = useState(visual.gif || visual.photo || "");
  const [failed, setFailed] = useState(!visual.gif && !visual.photo);

  if (failed || !src) {
    return (
      <div className="exo-visual" aria-hidden="true" style={{ minHeight: 120, display: "grid", placeItems: "center", fontWeight: 800, color: "var(--ember)" }}>
        {(name || "?").slice(0, 2).toUpperCase()}
      </div>
    );
  }

  return (
    <figure className="exo-visual">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={`Démonstration : ${visual.label}`}
        onError={() => {
          if (visual.photo && src !== visual.photo) setSrc(visual.photo);
          else setFailed(true);
        }}
      />
      {visual.credit ? <figcaption>{visual.credit}</figcaption> : null}
    </figure>
  );
}
