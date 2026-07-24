/* ==========================================================
   workoutTimer.js — Gestionnaire de chronomètre d'entraînement
   avec support de fond (écran éteint) et diction vocale.
   ========================================================== */

import { state, persistState } from "../state.js";

let timerWorker = null;
let wakeLock = null;
let audioCtx = null;
let silentAudioEl = null;
let silentOscillator = null;
let timerStartTime = null;

// Silent WAV 1-second audio loop Data URI pour maintenir la session audio mobile active en arrière-plan
const SILENT_AUDIO_URI = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=";

// Création d'un Web Worker inline pour exécuter le timer sur un thread OS indépendant
function initWorker() {
  if (timerWorker) return timerWorker;

  const workerCode = `
    let intervalId = null;
    self.onmessage = function(e) {
      if (e.data === 'start') {
        if (intervalId) clearInterval(intervalId);
        intervalId = setInterval(function() {
          self.postMessage('tick');
        }, 1000);
      } else if (e.data === 'stop') {
        if (intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
      }
    };
  `;

  try {
    const blob = new Blob([workerCode], { type: 'application/javascript' });
    const url = URL.createObjectURL(blob);
    timerWorker = new Worker(url);
    timerWorker.onmessage = function(e) {
      if (e.data === 'tick') {
        onTimerTick();
      }
    };
  } catch (err) {
    console.warn("Worker non disponible, fallback setInterval standard:", err);
  }

  return timerWorker;
}

/**
 * Active la session audio en arrière-plan et configure Media Session API.
 * Indispensable pour maintenir SpeechSynthesis & la diction lorsque le téléphone est verrouillé.
 */
function enableBackgroundAudioSession() {
  // 1. Élément HTML5 Audio en boucle silencieuse pour verrouiller la session audio OS
  try {
    if (!silentAudioEl) {
      silentAudioEl = new Audio();
      silentAudioEl.src = SILENT_AUDIO_URI;
      silentAudioEl.loop = true;
      silentAudioEl.volume = 0.01; // Volume minimal non gênant
    }
    silentAudioEl.play().catch(e => console.warn("Silent audio play warning:", e));
  } catch (e) {
    console.warn("Silent audio init warning:", e);
  }

  // 2. Web Audio Context (double sécurité iOS/Android)
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      if (!audioCtx) {
        audioCtx = new AudioContextClass();
      }
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }

      if (!silentOscillator) {
        const gainNode = audioCtx.createGain();
        gainNode.gain.value = 0.00001;
        const osc = audioCtx.createOscillator();
        osc.frequency.value = 440;
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        osc.start();
        silentOscillator = osc;
      }
    }
  } catch (e) {
    console.warn("Background audio context warning:", e);
  }

  // 3. MediaSession API (Affiche les contrôles sur l'écran de verrouillage et réveille le thread audio)
  if ('mediaSession' in navigator) {
    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: state.activeSession || "Séance d'entraînement",
        artist: "MonProgrammeFit — Diction Vocale",
        album: "Coaching Sportif",
      });

      navigator.mediaSession.playbackState = 'playing';

      navigator.mediaSession.setActionHandler('play', () => {
        startWorkoutTimer();
      });
      navigator.mediaSession.setActionHandler('pause', () => {
        pauseWorkoutTimer();
      });
    } catch (e) {
      console.warn("MediaSession setup warning:", e);
    }
  }
}

/**
 * Arrête la session audio de fond.
 */
function disableBackgroundAudioSession() {
  if (silentAudioEl) {
    try {
      silentAudioEl.pause();
    } catch (e) {}
  }
  if ('mediaSession' in navigator) {
    try {
      navigator.mediaSession.playbackState = 'paused';
    } catch (e) {}
  }
}

/**
 * Demande le verrouillage du maintien de l'écran (Screen Wake Lock API).
 */
async function requestScreenWakeLock() {
  if ('wakeLock' in navigator) {
    try {
      if (!wakeLock) {
        wakeLock = await navigator.wakeLock.request('screen');
        wakeLock.addEventListener('release', () => {
          wakeLock = null;
        });
      }
    } catch (e) {
      console.warn("Screen Wake Lock impossible ou refusé:", e);
    }
  }
}

/**
 * Libère le maintien de l'écran.
 */
function releaseScreenWakeLock() {
  if (wakeLock) {
    try {
      wakeLock.release();
    } catch (e) {
      console.warn("Erreur release wakeLock:", e);
    }
    wakeLock = null;
  }
}

/**
 * Énonciation vocale du temps d'entraînement (Diction).
 */
export function speakWorkoutTime(totalSeconds) {
  if (state.voiceEnabled === false) return;
  const interval = state.voiceIntervalSeconds || 10;

  if (totalSeconds <= 0 || totalSeconds % interval !== 0) return;

  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;

  let phrase = "";
  if (mins > 0) {
    phrase += mins === 1 ? "1 minute" : `${mins} minutes`;
    if (secs > 0) {
      phrase += ` ${secs}`;
    }
  } else {
    phrase += `${secs} secondes`;
  }

  if ('speechSynthesis' in window) {
    try {
      // Déblocage du moteur de synthèse vocale si en pause par le système mobile
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(phrase);
      utterance.lang = "fr-FR";
      utterance.rate = 1.05; // Cadence dynamique et fluide
      utterance.volume = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("Erreur SpeechSynthesis:", e);
    }
  }
}

/**
 * Test vocal manuel pour vérifier que la diction fonctionne sur l'appareil.
 */
export function speakTestVoice() {
  enableBackgroundAudioSession();
  if ('speechSynthesis' in window) {
    try {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance("Diction vocale activée, séance en cours !");
      utterance.lang = "fr-FR";
      utterance.rate = 1.05;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("Erreur test vocal:", e);
    }
  }
}

/**
 * Exécuté à chaque seconde par le Web Worker ou le timer fallback.
 */
function onTimerTick() {
  if (!state.isTimerRunning) return;

  // Calcul basé sur l'horloge réelle pour éviter toute dérive si le téléphone s'est mis en veille
  if (timerStartTime) {
    const elapsed = Math.floor((Date.now() - timerStartTime) / 1000);
    state.activeSessionSeconds = Math.max(0, elapsed);
  } else {
    state.activeSessionSeconds = (state.activeSessionSeconds || 0) + 1;
    timerStartTime = Date.now() - (state.activeSessionSeconds * 1000);
  }

  updateTimerUI();

  // Déclencher la diction vocale aux intervalles définis
  speakWorkoutTime(state.activeSessionSeconds);

  // Maintien actif de la synthèse vocale si l'écran est éteint
  if ('speechSynthesis' in window && window.speechSynthesis.paused) {
    window.speechSynthesis.resume();
  }
}

/**
 * Met à jour le texte du chronomètre dans le DOM sans tout ré-afficher.
 */
export function updateTimerUI() {
  const timerEl = document.getElementById("workout-timer");
  if (timerEl) {
    const totalSecs = state.activeSessionSeconds || 0;
    const mins = Math.floor(totalSecs / 60).toString().padStart(2, '0');
    const secs = (totalSecs % 60).toString().padStart(2, '0');
    timerEl.textContent = `${mins}:${secs}`;
  }

  const badgeEl = document.getElementById("timer-status-badge");
  if (badgeEl) {
    badgeEl.textContent = state.isTimerRunning ? "▶ En cours" : "⏸ En pause";
    badgeEl.className = state.isTimerRunning ? "adm-badge active" : "adm-badge";
    badgeEl.style.background = state.isTimerRunning ? "rgba(30,130,76,0.1)" : "rgba(0,0,0,0.05)";
    badgeEl.style.color = state.isTimerRunning ? "var(--moss)" : "var(--slate)";
    badgeEl.style.borderColor = state.isTimerRunning ? "var(--moss)" : "var(--line)";
  }

  const toggleBtn = document.getElementById("btn-toggle-timer");
  if (toggleBtn) {
    if (state.isTimerRunning) {
      toggleBtn.innerHTML = `<svg style="width:16px;height:16px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg> Pause`;
      toggleBtn.className = "btn";
      toggleBtn.style.background = "var(--ember)";
      toggleBtn.style.color = "white";
    } else {
      toggleBtn.innerHTML = `<svg style="width:16px;height:16px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg> Démarrer le chronomètre`;
      toggleBtn.className = "btn btn-ember";
      toggleBtn.style.background = "";
      toggleBtn.style.color = "";
    }
  }
}

/**
 * Démarre le chronomètre d'entraînement.
 */
export function startWorkoutTimer() {
  state.isTimerRunning = true;
  timerStartTime = Date.now() - ((state.activeSessionSeconds || 0) * 1000);

  enableBackgroundAudioSession();
  requestScreenWakeLock();

  const worker = initWorker();
  if (worker) {
    worker.postMessage('start');
  }

  updateTimerUI();
  persistState();
}

/**
 * Met en pause le chronomètre d'entraînement.
 */
export function pauseWorkoutTimer() {
  state.isTimerRunning = false;
  releaseScreenWakeLock();
  disableBackgroundAudioSession();

  if (timerWorker) {
    timerWorker.postMessage('stop');
  }

  updateTimerUI();
  persistState();
}

/**
 * Alterne entre Démarrer et Pause.
 */
export function toggleWorkoutTimer() {
  if (state.isTimerRunning) {
    pauseWorkoutTimer();
  } else {
    startWorkoutTimer();
  }
}

/**
 * Réinitialise le chronomètre à 00:00.
 */
export function resetWorkoutTimer() {
  pauseWorkoutTimer();
  state.activeSessionSeconds = 0;
  timerStartTime = null;
  updateTimerUI();
  persistState();
}

/**
 * Alterne l'activation de la diction vocale.
 */
export function toggleVoiceDiction() {
  state.voiceEnabled = !(state.voiceEnabled !== false);
  const voiceBtn = document.getElementById("btn-toggle-voice");
  if (voiceBtn) {
    voiceBtn.style.borderColor = state.voiceEnabled ? "var(--moss)" : "var(--line)";
    voiceBtn.style.color = state.voiceEnabled ? "var(--moss)" : "var(--slate)";
    voiceBtn.style.background = state.voiceEnabled ? "rgba(30,130,76,0.06)" : "transparent";
    voiceBtn.querySelector(".voice-label").textContent = state.voiceEnabled ? "Diction vocale : Activée (toutes les 10s)" : "Diction vocale : Désactivée";
  }
  if (state.voiceEnabled) {
    speakTestVoice();
  }
  persistState();
}

/**
 * Synchronisation quand la page ou l'onglet redevient visible.
 */
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible" && state.isTimerRunning) {
    requestScreenWakeLock();
    enableBackgroundAudioSession();
    if (window.speechSynthesis && window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
  }
});
