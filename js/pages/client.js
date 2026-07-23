/* ==========================================================
   pages/client.js — Espace client (tableau de bord, programme, progression).
   Refonte Premium / Professionnel
   ========================================================== */

import { state } from "../state.js";
import { icon, escapeHtml } from "../helpers.js";

/**
 * 1. TABLEAU DE BORD (DASHBOARD)
 */
export function renderClientDashboard() {
  const profile = state.clientProfile || {};
  const program = profile.program || null;
  const firstName = profile.firstName || "Cher client";
  
  const goalLabel = {
    remise: "Remise en forme",
    "perte-poids": "Perte de poids",
    musculation: "Musculation / Prise de masse",
    endurance: "Endurance",
    sante: "Santé générale",
    "endurance-sante": "Endurance & Santé",
  }[profile.goal] || profile.goal || "Objectif à définir";

  // --- SI AUCUN PROGRAMME (En attente d'onboarding) ---
  if (!program || !program.sessions?.length) {
    return `
    <div class="wrap client-page">
      <div class="client-header">
        <p class="client-eyebrow">Bienvenue</p>
        <h1 class="client-title">Bonjour ${escapeHtml(firstName)}, prêt à commencer ?</h1>
        <p class="client-subtitle">Nous avons besoin de quelques informations pour construire un programme 100% adapté à votre profil et vos objectifs.</p>
      </div>

      <div class="client-empty-state">
        <div class="client-empty-icon">
          ${icon("activity", 40)}
        </div>
        <h2 class="client-empty-title">Votre programme personnalisé vous attend</h2>
        <p class="client-empty-text">Répondez à quelques questions rapides sur vos habitudes, votre matériel et vos attentes. Je m'occupe du reste pour vous fournir un plan d'action précis.</p>
        <button class="btn btn-primary" data-nav="quiz" style="font-size: 16px; padding: 16px 32px;">
          Démarrer mon onboarding ${icon("arrow-right", 18)}
        </button>
      </div>
    </div>`;
  }

  // --- SI PROGRAMME ACTIF ---
  const week = program.week || 1;
  const totalWeeks = program.totalWeeks || 8;
  const progressPct = totalWeeks ? Math.round((week / totalWeeks) * 100) : 0;
  const sessions = program.sessions || [];
  const totalDone = sessions.filter(s => s.done).length;
  const nextSessionObj = sessions.find(s => !s.done) || sessions[0] || null;
  const nextSession = nextSessionObj ? nextSessionObj.name : "Séance à venir";

  // 1. DYNAMIC IMC & ENERGY METRICS CALCULATIONS
  const weight = Number(profile.physique?.poids || profile.weight || 0);
  const height = Number(profile.physique?.taille || profile.height || 0);
  const age = Number(profile.physique?.age || profile.age || 0);
  const goal = profile.goal || "";

  let imcHtml = "";
  if (weight > 0 && height > 0) {
    const heightInMeters = height / 100;
    const imc = (weight / (heightInMeters * heightInMeters)).toFixed(1);
    let status = "";
    let statusColor = "";
    if (imc < 18.5) {
      status = "Insuffisance pondérale";
      statusColor = "#3b82f6"; // Blue
    } else if (imc < 25) {
      status = "Poids normal (Excellent)";
      statusColor = "var(--moss)"; // Green
    } else if (imc < 30) {
      status = "Surpoids";
      statusColor = "#f59e0b"; // Orange
    } else {
      status = "Obésité";
      statusColor = "var(--ember)"; // Red
    }

    const bmr = Math.round(10 * weight + 6.25 * height - 5 * (age || 30) + 5);
    const tdee = Math.round(bmr * 1.45);
    
    let targetCalories = tdee;
    let proteinTarget = Math.round(weight * 2.0); // 2g/kg
    let fatTarget = Math.round(weight * 1.0); // 1g/kg
    let carbTarget = 0;
    let goalText = "";
    
    if (goal === "perte-poids") {
      targetCalories = Math.round(tdee * 0.82);
      proteinTarget = Math.round(weight * 2.2);
      goalText = "Sèche / Déficit Calorique Contrôlé";
    } else if (goal === "musculation") {
      targetCalories = Math.round(tdee * 1.10);
      proteinTarget = Math.round(weight * 2.0);
      goalText = "Prise de muscle sec / Légere Prise";
    } else {
      targetCalories = tdee;
      goalText = "Maintien / Recomposition Corporelle";
    }
    
    const proteinKcal = proteinTarget * 4;
    const fatKcal = fatTarget * 9;
    carbTarget = Math.round(Math.max(50, (targetCalories - proteinKcal - fatKcal) / 4));

    imcHtml = `
      <div class="client-card" style="grid-column: 1 / -1; display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; border-color: rgba(60,90,70,0.15); background: linear-gradient(180deg, var(--chalk) 0%, rgba(60,90,70,0.02) 100%);">
        <div>
          <h3 class="client-card-title" style="margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">
            ${icon("activity", 18, "var(--moss)")} Diagnostic IMC
          </h3>
          <p style="font-size: 13px; color: var(--slate); margin-bottom: 16px;">Calculé instantanément selon vos mensurations à jour.</p>
          
          <div style="display: flex; align-items: baseline; gap: 10px; margin-bottom: 8px;">
            <span style="font-size: 38px; font-family: 'Archivo Black', sans-serif; color: var(--ink); line-height: 1;">${imc}</span>
            <span style="font-size: 14px; font-weight: 700; color: ${statusColor};">${status}</span>
          </div>
          <p style="font-size: 13px; line-height: 1.5; color: var(--slate); margin: 0;">
            Votre IMC de <strong style="color:var(--ink);">${imc}</strong> constitue un excellent indicateur pour planifier vos séances de type <strong style="color:var(--ink);">${goal === 'musculation' ? 'Force / Hypertrophie' : goal === 'perte-poids' ? 'Perte de gras' : 'Fitness Athlétique'}</strong>.
          </p>
          <button class="btn btn-outline-dark" id="btn-quick-update-metrics" style="margin-top: 14px; font-size: 11px; padding: 5px 10px; display: inline-flex; align-items: center; gap: 6px;">
            ${icon("edit", 12)} Actualiser mon poids / taille
          </button>
        </div>

        <div style="border-left: 1px solid var(--line); padding-left: 24px;" class="metric-desktop-border">
          <h3 class="client-card-title" style="margin-bottom: 4px; display: flex; align-items: center; gap: 8px;">
            ${icon("target", 18, "var(--ember)")} Cible Nutritionnelle Estimée
          </h3>
          <span style="font-size: 10px; font-family: 'IBM Plex Mono', monospace; color: var(--ember); font-weight: 700; text-transform: uppercase;">${goalText}</span>
          
          <div style="margin-top: 10px; display: flex; align-items: baseline; gap: 6px;">
            <span style="font-size: 30px; font-family: 'Archivo Black', sans-serif; color: var(--ink);">${targetCalories}</span>
            <span style="font-size: 13px; color: var(--slate); font-weight: 600;">kcal / jour</span>
          </div>
          
          <div style="margin-top: 12px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; text-align: center;">
            <div style="background: rgba(0,0,0,0.02); padding: 6px; border-radius: 4px; border: 1px solid var(--line);">
              <div style="font-size: 9px; text-transform: uppercase; color: var(--slate); font-weight: 600;">Protéines</div>
              <div style="font-size: 13px; font-family: 'Archivo Black', sans-serif; color: var(--moss); margin-top: 2px;">${proteinTarget}g</div>
            </div>
            <div style="background: rgba(0,0,0,0.02); padding: 6px; border-radius: 4px; border: 1px solid var(--line);">
              <div style="font-size: 9px; text-transform: uppercase; color: var(--slate); font-weight: 600;">Glucides</div>
              <div style="font-size: 13px; font-family: 'Archivo Black', sans-serif; color: var(--ember); margin-top: 2px;">${carbTarget}g</div>
            </div>
            <div style="background: rgba(0,0,0,0.02); padding: 6px; border-radius: 4px; border: 1px solid var(--line);">
              <div style="font-size: 9px; text-transform: uppercase; color: var(--slate); font-weight: 600;">Lipides</div>
              <div style="font-size: 13px; font-family: 'Archivo Black', sans-serif; color: #2563eb; margin-top: 2px;">${fatTarget}g</div>
            </div>
          </div>
        </div>
      </div>
    `;
  } else {
    imcHtml = `
      <div class="client-card" style="grid-column: 1 / -1; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; border-style: dashed; border-color: var(--line); background: rgba(0,0,0,0.01);">
        <div style="max-width: 500px;">
          <h3 class="client-card-title" style="margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
            📈 Calculez vos cibles caloriques & IMC
          </h3>
          <p style="font-size: 13px; color: var(--slate); margin: 0; line-height: 1.5;">
            Ajoutez votre poids et votre taille pour obtenir vos estimations métaboliques de TDEE, votre rapport IMC et vos repères de protéines, glucides et lipides journaliers !
          </p>
        </div>
        <button class="btn btn-primary" id="btn-quick-update-metrics" style="font-size: 13px; font-weight: 600;">
          Renseigner mes mensurations ${icon("arrow-right", 14)}
        </button>
      </div>
    `;
  }

  // 2. DAILY HYDRATION LOG ENGINE
  const todayStr = new Date().toDateString();
  if (!profile.dailyWaterLog || profile.dailyWaterLog.date !== todayStr) {
    profile.dailyWaterLog = { date: todayStr, amount: 0 };
  }
  const waterAmount = profile.dailyWaterLog.amount || 0;
  const waterTarget = 2500;
  const waterPct = Math.min(100, Math.round((waterAmount / waterTarget) * 100));

  const waterCardHtml = `
    <div class="client-card" style="display: flex; flex-direction: column; justify-content: space-between;">
      <div>
        <h3 class="client-card-title" style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
          💧 Hydratation du Jour
        </h3>
        <p style="font-size: 13px; color: var(--slate); margin-bottom: 18px;">Cible recommandée : 2.5 Litres (2500 ml) pour maintenir l'hydratation cellulaire.</p>
        
        <div style="display: flex; align-items: center; gap: 20px; margin-bottom: 18px;">
          <div style="width: 54px; height: 80px; border: 3px solid var(--ink); border-radius: 4px 4px 14px 14px; position: relative; overflow: hidden; background: rgba(0,0,0,0.02); display: flex; align-items: flex-end;">
            <div style="width: 100%; height: ${waterPct}%; background: linear-gradient(180deg, #60a5fa 0%, #2563eb 100%); transition: height 0.4s ease;"></div>
            <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; display: flex; align-items: center; justify-content: center; font-family: 'Archivo Black', sans-serif; font-size: 11px; color: ${waterPct > 50 ? '#ffffff' : 'var(--ink)'}; text-shadow: ${waterPct > 50 ? '0 1px 2px rgba(0,0,0,0.3)' : 'none'}; z-index: 2;">
              ${waterPct}%
            </div>
          </div>
          <div>
            <div style="font-size: 26px; font-family: 'Archivo Black', sans-serif; color: var(--ink); line-height: 1;">${waterAmount} <span style="font-size: 14px; color: var(--slate); font-weight: normal;">/ 2500 ml</span></div>
            <p style="font-size: 12px; color: var(--slate); margin: 4px 0 0; line-height: 1.4;">Un niveau d'eau suffisant augmente l'endurance et favorise la récupération.</p>
          </div>
        </div>
      </div>

      <div style="display: flex; gap: 8px; margin-top: 12px;">
        <button class="btn btn-outline-dark" id="btn-water-add-250" style="flex: 1; padding: 8px 10px; font-size: 12px; justify-content: center; font-weight: 600;">+ 250 ml 🥛</button>
        <button class="btn btn-outline-dark" id="btn-water-add-500" style="flex: 1; padding: 8px 10px; font-size: 12px; justify-content: center; font-weight: 600;">+ 500 ml 🫙</button>
        <button class="btn" id="btn-water-reset" title="Réinitialiser" style="background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2); padding: 8px 10px; display: flex; align-items: center; justify-content: center; border-radius: 4px; cursor: pointer;">
          ${icon("trash", 13)}
        </button>
      </div>
    </div>
  `;

  // 3. WEIGHT HISTORY LOGGER ENGINE
  const weightHistory = profile.weightHistory || [];
  if (weightHistory.length === 0 && weight > 0) {
    const dateStr = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
    weightHistory.push({ date: dateStr, weight });
    profile.weightHistory = weightHistory;
  }

  let weightListHtml = "";
  if (weightHistory.length > 0) {
    weightListHtml = weightHistory.slice(-4).reverse().map(w => `
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 0; border-bottom: 1px solid var(--chalk-soft);">
        <span style="font-size: 12px; color: var(--slate);">${w.date}</span>
        <span style="font-size: 13px; font-weight: 700; color: var(--ink);">${w.weight} kg</span>
      </div>
    `).join("");
  } else {
    weightListHtml = `<p style="font-size: 12px; color: var(--slate); font-style: italic; text-align: center; margin: 10px 0;">Aucune pesée enregistrée.</p>`;
  }

  const weightCardHtml = `
    <div class="client-card" style="display: flex; flex-direction: column; justify-content: space-between;">
      <div>
        <h3 class="client-card-title" style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
          ⚖️ Évolution du Poids
        </h3>
        <p style="font-size: 13px; color: var(--slate); margin-bottom: 14px;">Suivez vos progrès en enregistrant régulièrement votre poids.</p>
        
        <div style="background: rgba(0,0,0,0.01); border: 1px solid var(--line); border-radius: 6px; padding: 10px 12px; margin-bottom: 14px;">
          <h4 style="font-size: 10px; text-transform: uppercase; color: var(--slate); font-weight: 700; margin: 0 0 6px;">Pesées récentes</h4>
          <div style="max-height: 100px; overflow-y: auto;">
            ${weightListHtml}
          </div>
        </div>
      </div>

      <div>
        <form id="form-log-weight" style="display: flex; gap: 8px; align-items: center; margin-top: 10px;">
          <div style="position: relative; flex: 1;">
            <input type="number" step="0.1" required placeholder="Nouveau" id="input-log-weight" class="text-input" style="width: 100%; padding: 8px 30px 8px 10px; font-size: 13px;" />
            <span style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); font-size: 11px; color: var(--slate); font-weight: 600;">kg</span>
          </div>
          <button type="submit" class="btn btn-primary" style="padding: 8px 12px; font-size: 12px; justify-content: center; font-weight: 600;">
            Enregistrer
          </button>
        </form>
      </div>
    </div>
  `;

  return `
  <div class="wrap client-page">
    <div class="client-header">
      <p class="client-eyebrow">Tableau de bord Athlète</p>
      <h1 class="client-title">Bonjour, ${escapeHtml(firstName)}.</h1>
      <p class="client-subtitle">Chaque entraînement est une brique de votre succès. Suivez vos objectifs et maintenez le cap.</p>
    </div>

    <!-- PROCHAINE SÉANCE (Hero Card) -->
    <div class="client-hero-card">
      <div class="client-hero-content">
        <span class="client-hero-label">PROCHAIN TRAINING</span>
        <h2 class="client-hero-title">${escapeHtml(nextSession)}</h2>
        <div class="client-hero-actions">
          <button class="btn btn-primary" data-nav="client-program">${icon("play-circle", 16)} Lancer la séance</button>
          <button class="btn btn-outline-dark" data-nav="client-program">Consulter l'agenda</button>
        </div>
      </div>
      <div class="client-hero-bg">
        ${icon("zap", 200)}
      </div>
    </div>

    <!-- RÉSUMÉ DE PROGRESSION -->
    <div class="client-progress-row">
      <div class="client-progress-box">
        <div class="client-pb-head">
          <div class="client-pb-lbl">Avancement Programme</div>
          <div class="client-pb-val">${week} <span style="font-size:16px;color:var(--slate);">/ ${totalWeeks}</span></div>
        </div>
        <div class="client-pb-bar"><div class="client-pb-fill" style="width: ${progressPct}%"></div></div>
      </div>
      
      <div class="client-progress-box">
        <div class="client-pb-head">
          <div class="client-pb-lbl">Séances d'Entraînement Validées</div>
          <div class="client-pb-val" style="color: var(--moss);">${totalDone}</div>
        </div>
        <div class="client-pb-bar"><div class="client-pb-fill" style="width: ${totalDone > 0 ? 100 : 0}%"></div></div>
      </div>
    </div>

    <!-- SECTION DIAGNOSTIC FITNESS INTERACTIF -->
    <div style="margin-bottom: 32px; display: grid; gap: 24px; grid-template-columns: 1fr;">
      ${imcHtml}
    </div>

    <!-- GRIDS & CARDS - Bento-Style Fitness Modules -->
    <div class="client-grid-2" style="margin-bottom: 40px; display: grid; grid-template-columns: repeat(auto-fit, minmax(310px, 1fr)); gap: 24px;">
      
      <!-- CARD 1: Cibles Sportives -->
      <div class="client-card" style="display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <h3 class="client-card-title">Cibles Athlétiques</h3>
          <div class="client-list-item">
            <div class="client-list-label">${icon("target", 16)} Objectif</div>
            <div class="client-list-val" style="color: var(--ember); font-weight: 700;">${escapeHtml(goalLabel)}</div>
          </div>
          <div class="client-list-item">
            <div class="client-list-label">${icon("dumbbell", 16)} Format</div>
            <div class="client-list-val">${escapeHtml(program.trackLabel || "Standard")}</div>
          </div>
          <div class="client-list-item" style="border: none; padding-bottom: 0;">
            <div class="client-list-label">${icon("calendar", 16)} Fréquence active</div>
            <div class="client-list-val">3-4 séances / semaine</div>
          </div>
        </div>
        <div style="margin-top: 18px; border-top: 1px solid var(--line); padding-top: 12px; display: flex; align-items: center; justify-content: space-between;">
          <span style="font-size: 11px; color: var(--slate); font-weight: 600;">Vos données d'onboarding</span>
          <button class="btn btn-outline-dark" data-nav="privacy" style="font-size: 11px; padding: 4px 8px;">Ajuster</button>
        </div>
      </div>

      <!-- CARD 2: Hydration -->
      ${waterCardHtml}

      <!-- CARD 3: Weight Tracker -->
      ${weightCardHtml}

      <!-- CARD 4: Support / Coaching Direct -->
      <div class="client-card" style="display:flex; flex-direction:column; justify-content:center; text-align:center;">
        <div style="color:var(--ember); margin-bottom:12px;">${icon("message-circle", 36)}</div>
        <h3 class="client-card-title" style="margin-bottom: 6px;">Assistance Directe</h3>
        <p style="color:var(--slate); font-size:13px; margin:0 0 16px; line-height:1.5;">Je reste à votre disposition sur WhatsApp pour tout ajustement de charge ou question d'exécution.</p>
        <a href="https://wa.me/2290191720596" target="_blank" rel="noopener noreferrer" class="btn btn-outline-dark" style="margin: 0 auto; text-decoration: none; display: inline-flex; align-items: center; gap: 8px;">Joindre Coach Abdou</a>
      </div>

    </div>
  </div>`;
}

/**
 * Exercices prédéfinis pour la simulation et les séances d'entraînement.
 */
export function getExercisesForSession(sessionName) {
  const goal = state.clientProfile?.goal || "musculation";
  const track = state.clientProfile?.track || "gym";

  if (track === "gym") {
    if (goal === "perte-poids" || goal === "endurance" || goal === "sante") {
      return [
        { name: "Tapis de course (Échauffement)", desc: "Fréquence cardiaque à 65-70%. Cadence modérée.", detail: "8 mins · Pente 2%" },
        { name: "Presse à cuisses inclinée", desc: "Contrôlez la descente et poussez dynamiquement sans verrouiller les genoux.", detail: "4 séries de 12-15 reps (Repos: 60s)" },
        { name: "Tirage vertical à la poulie haute", desc: "Tirez la barre vers le haut de la poitrine, coudes vers le bas.", detail: "3 séries de 12-15 reps (Repos: 60s)" },
        { name: "Développé assis à la machine", desc: "Poussez les poignées vers l'avant, contractez les pectoraux.", detail: "3 séries de 12-15 reps (Repos: 60s)" },
        { name: "Gainage planche active", desc: "Alignement fessiers-épaules parfait. Respirez calmement.", detail: "3 séries de 45 secondes" }
      ];
    } else {
      return [
        { name: "Squats à la barre olympique", desc: "Descente contrôlée, fesses sous la ligne des genoux si possible.", detail: "4 séries de 8-10 reps (Repos: 90s)" },
        { name: "Développé couché (Bench Press)", desc: "Barre touche la poitrine puis poussée puissante vers le haut.", detail: "4 séries de 8-10 reps (Repos: 90s)" },
        { name: "Tirage buste penché (Barbell Row)", desc: "Ramenez la barre vers le nombril en serrant les omoplates.", detail: "4 séries de 8-10 reps (Repos: 90s)" },
        { name: "Développé militaire assis aux haltères", desc: "Poussez verticalement, contrôlez le retour aux oreilles.", detail: "3 séries de 10 reps (Repos: 75s)" },
        { name: "Curl biceps à la barre EZ", desc: "Gardez les coudes serrés le long du corps.", detail: "3 séries de 12 reps (Repos: 60s)" }
      ];
    }
  } else {
    if (goal === "perte-poids" || goal === "endurance" || goal === "sante") {
      return [
        { name: "Jumping Jacks (Échauffement)", desc: "Mouvement fluide pour monter la température corporelle.", detail: "2 x 45 secondes" },
        { name: "Goblet Squats (avec sac ou lest)", desc: "Tenez la charge contre la poitrine. Dos bien droit.", detail: "4 séries de 15 reps (Repos: 45s)" },
        { name: "Pompes inclinées (surélevé)", desc: "Mains sur une chaise ou un lit, corps parfaitement gainé.", detail: "3 séries de 12 reps (Repos: 60s)" },
        { name: "Tirage unilatéral haltère / élastique", desc: "Prenez appui, tirez le coude vers la hanche.", detail: "3 séries de 15 reps / bras (Repos: 45s)" },
        { name: "Crunchs abdominaux", desc: "Enroulez le buste en gardant le bas du dos scellé au sol.", detail: "3 séries de 20 reps (Repos: 30s)" }
      ];
    } else {
      return [
        { name: "Fentes alternées (Walking Lunges)", desc: "Faites un grand pas, genou arrière frôle le sol.", detail: "4 séries de 12 reps / jambe (Repos: 60s)" },
        { name: "Pompes classiques au sol", desc: "Mains largeur d'épaules, fessiers serrés.", detail: "4 séries de 10-15 reps (Repos: 75s)" },
        { name: "Dips sur chaise", desc: "Pliez les coudes vers l'arrière pour solliciter les triceps.", detail: "3 séries de 12 reps (Repos: 60s)" },
        { name: "Bulgarian Split Squats (arrière sur chaise)", desc: "Excellente tension unilatérale pour les quadriceps et fessiers.", detail: "3 séries de 10 reps / jambe (Repos: 60s)" },
        { name: "Gainage planche latérale", desc: "Travail intense des obliques abdominaux.", detail: "3 séries de 30s / côté (Repos: 45s)" }
      ];
    }
  }
}

/**
 * 2. MON PROGRAMME (TIMELINE ET PLAYER DE SÉANCE)
 */
export function renderClientProgram() {
  const profile = state.clientProfile || {};
  const program = profile.program || null;
  
  if (!program || !program.sessions?.length) {
    return `
    <div class="wrap client-page">
      <div class="client-header">
        <p class="client-eyebrow">Mon Programme</p>
        <h1 class="client-title">Programme non défini</h1>
      </div>
      <div class="client-empty-state">
        <div class="client-empty-icon">${icon("calendar", 40)}</div>
        <h2 class="client-empty-title">Rien à afficher pour le moment</h2>
        <p class="client-empty-text">Terminez d'abord votre onboarding pour que je puisse construire vos séances.</p>
        <button class="btn btn-primary" data-nav="quiz">Continuer l'onboarding</button>
      </div>
    </div>`;
  }

  // --- RENDU : SÉANCE ACTIVE EN COURS DE LECTURE ---
  if (state.activeSession) {
    const sessionName = state.activeSession;
    const listExos = getExercisesForSession(sessionName);
    
    const initSecs = state.activeSessionSeconds || 0;
    const mins = Math.floor(initSecs / 60).toString().padStart(2, '0');
    const secs = (initSecs % 60).toString().padStart(2, '0');
    const formattedTime = `${mins}:${secs}`;

    return `
    <div class="wrap client-page">
      <div class="client-header" style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 16px; margin-bottom: 24px;">
        <div>
          <button id="btn-cancel-workout" class="btn btn-outline-dark" style="margin-bottom: 12px; font-size: 12px; padding: 6px 12px; display: inline-flex; align-items: center; gap: 6px;">
            ${icon("arrow-left", 14)} Annuler et retour
          </button>
          <p class="client-eyebrow" style="color: var(--ember); font-weight: 700; margin: 0;">💪 ENTRAÎNEMENT EN COURS</p>
          <h1 class="client-title" style="margin: 4px 0 0;">${escapeHtml(sessionName)}</h1>
        </div>
        
        <div style="background: rgba(224, 70, 50, 0.05); border: 1px solid rgba(224, 70, 50, 0.2); padding: 12px 20px; border-radius: 8px; text-align: center; min-width: 140px;">
          <span style="font-size: 10px; font-family: 'IBM Plex Mono', monospace; text-transform: uppercase; color: var(--slate); display: block;">Chronomètre actif</span>
          <span id="workout-timer" style="font-size: 26px; font-family: 'IBM Plex Mono', monospace; font-weight: bold; color: var(--ember);">${formattedTime}</span>
        </div>
      </div>

      <div style="display: grid; gap: 24px; grid-template-columns: 1fr; margin-bottom: 32px;">
        <div class="client-card" style="border-color: rgba(224, 70, 50, 0.15);">
          <h3 class="client-card-title" style="margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">
            ${icon("list", 18, "var(--ember)")} Feuille de Route de vos Exercices
          </h3>
          <p style="font-size: 13px; color: var(--slate); margin-bottom: 20px; line-height: 1.5;">
            Réalisez chaque exercice dans l'ordre indiqué. Cochez les séries terminées pour valider votre séance de façon rythmée.
          </p>

          <div style="display: grid; gap: 20px;">
            ${listExos.map((exo, idx) => `
              <div style="padding: 16px; border: 1px solid var(--line); border-radius: 8px; background: rgba(0,0,0,0.01); display: flex; flex-direction: column; gap: 10px;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; flex-wrap: wrap;">
                  <div>
                    <span style="font-size: 11px; font-weight: 700; color: var(--ember); font-family: 'IBM Plex Mono', monospace; text-transform: uppercase;">Exercice ${idx + 1}</span>
                    <h4 style="font-size: 16px; font-weight: 700; margin: 2px 0 4px; color: var(--ink);">${escapeHtml(exo.name)}</h4>
                    <p style="font-size: 13px; color: var(--slate); margin: 0; line-height: 1.4;">${escapeHtml(exo.desc)}</p>
                  </div>
                  <span class="adm-badge active" style="background: var(--chalk-soft); color: var(--ink); border: 1px solid var(--line); font-size: 12px; white-space: nowrap; height: fit-content;">
                    ${escapeHtml(exo.detail)}
                  </span>
                </div>
                
                <!-- Séries interactives locales -->
                <div style="display: flex; gap: 10px; flex-wrap: wrap; margin-top: 6px; padding-top: 10px; border-top: 1px dashed var(--line);">
                  <label style="display: inline-flex; align-items: center; gap: 6px; font-size: 12px; cursor: pointer; background: white; border: 1px solid var(--line); padding: 5px 10px; border-radius: 4px; user-select: none;">
                    <input type="checkbox" style="width: 14px; height: 14px; accent-color: var(--moss);" />
                    <span>Série 1</span>
                  </label>
                  <label style="display: inline-flex; align-items: center; gap: 6px; font-size: 12px; cursor: pointer; background: white; border: 1px solid var(--line); padding: 5px 10px; border-radius: 4px; user-select: none;">
                    <input type="checkbox" style="width: 14px; height: 14px; accent-color: var(--moss);" />
                    <span>Série 2</span>
                  </label>
                  <label style="display: inline-flex; align-items: center; gap: 6px; font-size: 12px; cursor: pointer; background: white; border: 1px solid var(--line); padding: 5px 10px; border-radius: 4px; user-select: none;">
                    <input type="checkbox" style="width: 14px; height: 14px; accent-color: var(--moss);" />
                    <span>Série 3</span>
                  </label>
                  <label style="display: inline-flex; align-items: center; gap: 6px; font-size: 12px; cursor: pointer; background: white; border: 1px solid var(--line); padding: 5px 10px; border-radius: 4px; user-select: none;">
                    <input type="checkbox" style="width: 14px; height: 14px; accent-color: var(--moss);" />
                    <span>Série 4</span>
                  </label>
                </div>
              </div>
            `).join("")}
          </div>
        </div>

        <!-- VALIDATION DE SÉANCE -->
        <div class="client-card">
          <h3 class="client-card-title" style="margin-bottom: 8px;">
            📝 Journal d'Effort & Notes
          </h3>
          <p style="font-size: 13px; color: var(--slate); margin-bottom: 16px;">Ajoutez vos ressentis ou les charges soulevées pour optimiser vos futures séances avec Coach Abdou.</p>
          
          <form id="form-submit-workout-session">
            <textarea id="workout-notes-input" placeholder="Ex: Excellentes sensations sur le squat. J'ai pu monter à 80kg aujourd'hui..." class="text-input" style="width: 100%; min-height: 100px; padding: 12px; margin-bottom: 16px; font-size: 13px; font-family: inherit; resize: vertical;"></textarea>
            
            <div style="display: flex; gap: 12px; flex-wrap: wrap;">
              <button type="submit" class="btn btn-primary" style="flex: 1; padding: 14px; justify-content: center; font-size: 14px; font-weight: 700; background: var(--moss, #3c5a46); border-color: var(--moss);">
                🏆 Enregistrer et valider l'entraînement
              </button>
              <button type="button" id="btn-cancel-workout-btn" class="btn btn-outline-dark" style="padding: 14px 20px;">
                Annuler
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>`;
  }

  // --- RENDU NORMAL : LISTE DES SÉANCES DU PROGRAMME ---
  return `
  <div class="wrap client-page">
    <div class="client-header">
      <p class="client-eyebrow">Mon Programme</p>
      <h1 class="client-title">${escapeHtml(program.trackLabel || "Parcours sur-mesure")}</h1>
      <p class="client-subtitle">Semaine ${program.week} — Retrouvez ci-dessous le détail de vos séances. Cochez-les au fur et à mesure pour suivre votre avancée.</p>
    </div>

    <div class="client-timeline">
      ${program.sessions.map((s) => `
        <div class="client-tl-item ${s.done ? 'done' : ''}">
          <div class="client-tl-icon">
            ${icon(s.done ? "check" : "play", 20)}
          </div>
          <div class="client-tl-content">
            <h3 class="client-tl-title">${escapeHtml(s.name)}</h3>
            <div class="client-tl-meta">${s.exos} exercices · ${s.duree} estimée</div>
          </div>
          <div>
            <button type="button" class="${s.done ? 'btn btn-outline-dark' : 'btn btn-primary'}" data-session-action="${s.done ? 'review' : 'start'}" data-session-name="${escapeHtml(s.name)}">
              ${s.done ? "Revoir la séance" : "Commencer"}
            </button>
          </div>
        </div>
      `).join("")}
    </div>
  </div>`;
}

/**
 * 3. MA PROGRESSION (AVEC GRAPHIQUE ET METRICS)
 */
export function renderClientProgress() {
  const profile = state.clientProfile || {};
  const program = profile.program || null;
  const history = program?.history || [];
  const weightHistory = profile.weightHistory || [];
  const totalWeeks = program?.totalWeeks || 8;
  const week = program?.week || 1;
  const sessions = program?.sessions || [];
  const totalDone = sessions.filter(s => s.done).length;

  let svgChartHtml = "";
  if (weightHistory && weightHistory.length > 0) {
    const entries = weightHistory.map(entry => ({
      date: entry.date,
      weight: parseFloat(entry.weight)
    })).filter(e => !isNaN(e.weight));

    if (entries.length > 0) {
      const weights = entries.map(e => e.weight);
      const minW = Math.min(...weights) - 1.5;
      const maxW = Math.max(...weights) + 1.5;
      const diffW = maxW - minW === 0 ? 1 : maxW - minW;

      const chartW = 500;
      const chartH = 180;
      const paddingLeft = 40;
      const paddingRight = 40;
      const paddingTop = 25;
      const paddingBottom = 40;
      
      const plotW = chartW - paddingLeft - paddingRight;
      const plotH = chartH - paddingTop - paddingBottom;

      const points = entries.map((e, idx) => {
        const x = paddingLeft + (entries.length > 1 ? (idx / (entries.length - 1)) * plotW : plotW / 2);
        const y = chartH - paddingBottom - ((e.weight - minW) / diffW) * plotH;
        return { x, y, weight: e.weight, date: e.date };
      });

      let pathD = "";
      if (points.length > 1) {
        pathD = `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(" ");
      }

      svgChartHtml = `
        <div class="client-card" style="background: white; margin-bottom: 24px;">
          <h3 class="client-card-title" style="margin-bottom: 4px; display: flex; align-items: center; gap: 8px;">
            ${icon("trending-up", 18, "var(--moss)")} Graphique d'Évolution de Silhouette
          </h3>
          <p style="font-size: 13px; color: var(--slate); margin-bottom: 18px;">Suivez vos variations de poids au cours de votre parcours sportif.</p>
          
          <div style="position: relative; width: 100%; overflow-x: auto;">
            <svg width="100%" height="${chartH}" viewBox="0 0 ${chartW} ${chartH}" style="min-width: 450px; display: block; overflow: visible;">
              <line x1="${paddingLeft}" y1="${paddingTop}" x2="${chartW - paddingRight}" y2="${paddingTop}" stroke="rgba(0,0,0,0.04)" stroke-width="1" />
              <line x1="${paddingLeft}" y1="${paddingTop + plotH/2}" x2="${chartW - paddingRight}" y2="${paddingTop + plotH/2}" stroke="rgba(0,0,0,0.04)" stroke-width="1" />
              <line x1="${paddingLeft}" y1="${chartH - paddingBottom}" x2="${chartW - paddingRight}" y2="${chartH - paddingBottom}" stroke="rgba(0,0,0,0.1)" stroke-width="1" />
              
              ${pathD ? `<path d="${pathD}" fill="none" stroke="var(--moss)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />` : ""}
              
              ${points.map(p => `
                <circle cx="${p.x}" cy="${p.y}" r="5" fill="var(--moss)" stroke="white" stroke-width="2" />
                <text x="${p.x}" y="${p.y - 12}" font-family="inherit" font-size="10" font-weight="700" fill="var(--ink)" text-anchor="middle">${p.weight} kg</text>
                <text x="${p.x}" y="${chartH - 12}" font-family="inherit" font-size="9" font-weight="600" fill="var(--slate)" text-anchor="middle">${p.date}</text>
              `).join("")}
            </svg>
          </div>
        </div>
      `;
    }
  } else {
    svgChartHtml = `
      <div class="client-card" style="background: white; border: 1px dashed var(--line); text-align: center; padding: 32px 20px; margin-bottom: 24px;">
        <span style="font-size: 32px; display: block; margin-bottom: 12px;">📊</span>
        <h3 style="font-size: 14px; font-weight: 700; color: var(--ink); margin: 0 0 6px;">Suivi de poids interactif</h3>
        <p style="font-size: 13px; color: var(--slate); margin: 0 0 16px; max-width: 420px; margin-left: auto; margin-right: auto; line-height: 1.5;">
          Enregistrez votre poids régulièrement depuis votre tableau de bord afin d'activer votre courbe d'évolution et d'ajuster votre profil.
        </p>
        <button class="btn btn-outline-dark" data-nav="client-dashboard" style="font-size: 12px; padding: 6px 12px;">Aller au Tableau de bord</button>
      </div>
    `;
  }

  if (!history.length) {
    return `
    <div class="wrap client-page">
      <div class="client-header">
        <p class="client-eyebrow">Ma Progression</p>
        <h1 class="client-title">Historique de vos efforts</h1>
      </div>
      <div class="client-empty-state">
        <div class="client-empty-icon">${icon("trending-up", 40)}</div>
        <h2 class="client-empty-title">C'est le moment de vous lancer</h2>
        <p class="client-empty-text">Dès que vous aurez terminé votre première séance, vos statistiques de progression apparaîtront ici.</p>
        <button class="btn btn-primary" data-nav="client-program">Voir mon programme</button>
      </div>
    </div>`;
  }

  return `
  <div class="wrap client-page">
    <div class="client-header">
      <p class="client-eyebrow">Ma Progression</p>
      <h1 class="client-title">Historique de vos efforts</h1>
      <p class="client-subtitle">Visualisez l'état de votre transformation et vos séances terminées.</p>
    </div>

    <!-- METRICS GRID -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-bottom: 24px;">
      <div class="client-card" style="padding: 16px; display: flex; align-items: center; gap: 12px; background: white;">
        <div style="background: rgba(60,90,70,0.08); color: var(--moss); width: 40px; height: 40px; border-radius: 6px; display: flex; align-items: center; justify-content: center;">
          ${icon("award", 20)}
        </div>
        <div>
          <span style="font-size: 11px; color: var(--slate); text-transform: uppercase; font-weight: 600; display: block;">Séances Validées</span>
          <strong style="font-size: 18px; color: var(--ink); font-family: 'Archivo Black', sans-serif;">${totalDone} / ${sessions.length}</strong>
        </div>
      </div>

      <div class="client-card" style="padding: 16px; display: flex; align-items: center; gap: 12px; background: white;">
        <div style="background: rgba(224,70,50,0.08); color: var(--ember); width: 40px; height: 40px; border-radius: 6px; display: flex; align-items: center; justify-content: center;">
          ${icon("droplet", 20)}
        </div>
        <div>
          <span style="font-size: 11px; color: var(--slate); text-transform: uppercase; font-weight: 600; display: block;">Eau du jour</span>
          <strong style="font-size: 18px; color: var(--ink); font-family: 'Archivo Black', sans-serif;">${profile.dailyWaterLog?.amount || 0} ml</strong>
        </div>
      </div>

      <div class="client-card" style="padding: 16px; display: flex; align-items: center; gap: 12px; background: white;">
        <div style="background: rgba(37,99,235,0.08); color: #2563eb; width: 40px; height: 40px; border-radius: 6px; display: flex; align-items: center; justify-content: center;">
          ${icon("calendar", 20)}
        </div>
        <div>
          <span style="font-size: 11px; color: var(--slate); text-transform: uppercase; font-weight: 600; display: block;">Semaine Active</span>
          <strong style="font-size: 18px; color: var(--ink); font-family: 'Archivo Black', sans-serif;">S${week} / ${totalWeeks}</strong>
        </div>
      </div>
    </div>

    <!-- MAIN BODY -->
    <div style="display: grid; grid-template-columns: 1fr; gap: 24px; margin-bottom: 40px;">
      
      <!-- Graphique d'évolution de poids -->
      ${svgChartHtml}
      
      <!-- Liste des semaines de l'historique -->
      <div class="client-card" style="background: white;">
        <h3 class="client-card-title" style="margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">
          ${icon("calendar-days", 18, "var(--moss)")} Avancement par Semaine
        </h3>
        <p style="font-size: 13px; color: var(--slate); margin-bottom: 20px;">
          Chaque semaine comprend 3 séances d'entraînement personnalisées.
        </p>

        <div style="display: grid; gap: 14px;">
          ${history.map((h, index) => {
            const isCurrent = (index + 1) === week;
            const pct = Math.round((h.done / h.total) * 100);
            return `
            <div style="padding: 14px 16px; border: 1px solid ${isCurrent ? 'var(--moss)' : 'var(--line)'}; border-radius: 6px; background: ${isCurrent ? 'rgba(60,90,70,0.02)' : 'rgba(0,0,0,0.01)'}; position: relative;">
              ${isCurrent ? `<span style="position: absolute; right: 12px; top: 12px; font-size: 9px; font-weight: 800; background: var(--moss); color: white; padding: 2px 6px; border-radius: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Semaine active</span>` : ""}
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <strong style="font-size: 14px; color: var(--ink);">${escapeHtml(h.name)}</strong>
                <span style="font-size: 13px; font-weight: 600; color: var(--slate);">${h.done} / ${h.total} Séances</span>
              </div>
              <div class="client-pb-bar" style="height: 6px; background: rgba(0,0,0,0.05); border-radius: 3px; overflow: hidden;">
                <div class="client-pb-fill" style="width: ${pct}%; background: ${pct === 100 ? 'var(--moss)' : 'var(--ember)'}; height: 100%; transition: width 0.3s;"></div>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 6px; font-size: 11px;">
                <span style="color: var(--slate);">${pct}% accompli</span>
                ${pct === 100 ? `<span style="color: var(--moss); font-weight: 700;">🏆 Semaine complétée !</span>` : ""}
              </div>
            </div>`;
          }).join("")}
        </div>
      </div>

    </div>
  </div>`;
}
