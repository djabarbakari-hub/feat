"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const SILENT_AUDIO_URI = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=";

function formatTime(totalSecs) {
  const mins = Math.floor(totalSecs / 60).toString().padStart(2, "0");
  const secs = (totalSecs % 60).toString().padStart(2, "0");
  return `${mins}:${secs}`;
}

function speakWorkoutTime(totalSeconds) {
  if (!("speechSynthesis" in window)) return;
  if (totalSeconds > 0 && totalSeconds % 10 !== 0) return;
  window.speechSynthesis.cancel();
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  const text = totalSeconds === 0
    ? "Chronomètre démarré"
    : `${mins} minute${mins > 1 ? "s" : ""} ${secs} secondes`;
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "fr-FR";
  utter.rate = 1;
  window.speechSynthesis.speak(utter);
}

export function useWorkoutTimer(sessionTitle = "Séance") {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const [voiceOn, setVoiceOn] = useState(true);
  const startRef = useRef(null);
  const workerRef = useRef(null);
  const audioRef = useRef(null);
  const wakeLockRef = useRef(null);

  const enableAudio = useCallback(async () => {
    try {
      if (!audioRef.current) {
        audioRef.current = new Audio(SILENT_AUDIO_URI);
        audioRef.current.loop = true;
        audioRef.current.volume = 0.01;
      }
      await audioRef.current.play().catch(() => {});
    } catch {
      /* ignore */
    }
    if ("mediaSession" in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: sessionTitle,
        artist: "MonProgrammeFit",
      });
      navigator.mediaSession.playbackState = "playing";
    }
  }, [sessionTitle]);

  const requestWakeLock = useCallback(async () => {
    try {
      if ("wakeLock" in navigator) {
        wakeLockRef.current = await navigator.wakeLock.request("screen");
      }
    } catch {
      /* ignore */
    }
  }, []);

  const stopExtras = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    if (wakeLockRef.current) {
      wakeLockRef.current.release?.();
      wakeLockRef.current = null;
    }
    if ("mediaSession" in navigator) {
      navigator.mediaSession.playbackState = "paused";
    }
  }, []);

  const tick = useCallback(() => {
    if (!startRef.current) return;
    const elapsed = Math.max(0, Math.floor((Date.now() - startRef.current) / 1000));
    setSeconds(elapsed);
    if (voiceOn) speakWorkoutTime(elapsed);
    if (window.speechSynthesis?.paused) window.speechSynthesis.resume();
  }, [voiceOn]);

  const start = useCallback(async () => {
    startRef.current = Date.now() - seconds * 1000;
    setRunning(true);
    await enableAudio();
    await requestWakeLock();
    if (!workerRef.current) {
      const blob = new Blob([`
        let id = null;
        self.onmessage = (e) => {
          if (e.data === "start") {
            if (id) clearInterval(id);
            id = setInterval(() => self.postMessage("tick"), 1000);
          } else if (e.data === "stop") {
            if (id) clearInterval(id);
            id = null;
          }
        };
      `], { type: "application/javascript" });
      workerRef.current = new Worker(URL.createObjectURL(blob));
    }
    workerRef.current.onmessage = () => tick();
    workerRef.current.postMessage("start");
  }, [enableAudio, requestWakeLock, seconds, tick]);

  const pause = useCallback(() => {
    setRunning(false);
    workerRef.current?.postMessage("stop");
    stopExtras();
  }, [stopExtras]);

  const reset = useCallback(() => {
    pause();
    startRef.current = null;
    setSeconds(0);
  }, [pause]);

  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === "visible" && running) {
        requestWakeLock();
        enableAudio();
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      workerRef.current?.postMessage("stop");
      workerRef.current?.terminate();
      stopExtras();
    };
  }, [enableAudio, requestWakeLock, running, stopExtras]);

  return {
    seconds,
    running,
    voiceOn,
    label: formatTime(seconds),
    start,
    pause,
    reset,
    toggle: () => (running ? pause() : start()),
    toggleVoice: () => setVoiceOn((v) => !v),
  };
}
