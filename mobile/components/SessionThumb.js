"use client";

import { useEffect, useMemo, useState } from "react";
import { Dumbbell } from "lucide-react";
import { getExercisesForSession } from "@/lib/program";
import { resolveExerciseVisual } from "@/lib/exercise-visuals";

/**
 * Thumbnail for a session card — first exercise illustration (GIF/photo).
 */
export function SessionThumb({ session, profile, className = "" }) {
  const firstName = useMemo(() => {
    const exos = getExercisesForSession(session, profile);
    return exos[0]?.name || "";
  }, [session, profile]);

  const visual = useMemo(
    () => (firstName ? resolveExerciseVisual(firstName) : null),
    [firstName],
  );

  const [src, setSrc] = useState("");
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const next = visual?.gif || visual?.photo || "";
    setSrc(next);
    setFailed(!next);
  }, [visual]);

  if (failed || !src) {
    return (
      <div className={`session-thumb session-thumb--fallback ${className}`} aria-hidden="true">
        <Dumbbell size={22} strokeWidth={2.2} />
      </div>
    );
  }

  return (
    <div className={`session-thumb ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        loading="lazy"
        onError={() => {
          if (visual?.photo && src !== visual.photo) setSrc(visual.photo);
          else setFailed(true);
        }}
      />
    </div>
  );
}
