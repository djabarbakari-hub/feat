/* ==========================================================
   pages/client.js — Espace client (tableau de bord, programme, progression).
   Refonte Premium / Professionnel
   ========================================================== */

import { state } from "../state.js";
import { icon, escapeHtml, getUserAvatarHtml } from "../helpers.js";
import { COACH_PROGRAMS } from "../data.js";

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
      <div class="client-header" style="display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; flex-wrap: wrap;">
        <div>
          <p class="client-eyebrow">Bienvenue</p>
          <h1 class="client-title">Bonjour ${escapeHtml(firstName)}, prêt à commencer ?</h1>
          <p class="client-subtitle">Nous avons besoin de quelques informations pour construire un programme 100% adapté à votre profil et vos objectifs.</p>
        </div>
        ${getUserAvatarHtml({
          photoURL: profile.photoURL || profile.photoUrl,
          email: profile.email,
          firstName: profile.firstName,
          lastName: profile.lastName,
          size: 52,
          border: "2px solid var(--ember)"
        })}
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
      status = "Poids normal (Optimal)";
      statusColor = "var(--moss)"; // Green
    } else if (imc < 30) {
      status = "Surpoids léger";
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
      goalText = "Prise de muscle sec / Léger Surplus";
    } else {
      targetCalories = tdee;
      goalText = "Maintien / Recomposition Corporelle";
    }
    
    const proteinKcal = proteinTarget * 4;
    const fatKcal = fatTarget * 9;
    carbTarget = Math.round(Math.max(50, (targetCalories - proteinKcal - fatKcal) / 4));

    imcHtml = `
      <div class="client-card" style="grid-column: 1 / -1; display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; border: 1px solid var(--line); background: white; border-radius: 12px; padding: 24px; box-shadow: 0 4px 16px rgba(0,0,0,0.03);">
        <div>
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
            <h3 class="client-card-title" style="margin: 0; display: flex; align-items: center; gap: 8px;">
              ${icon("activity", 18, "var(--moss)")} Diagnostic IMC & Métabolisme
            </h3>
            <span style="font-size: 10px; font-family: 'IBM Plex Mono', monospace; font-weight: 800; background: var(--moss-soft); color: var(--moss); padding: 3px 8px; border-radius: 12px; text-transform: uppercase;">MÀJ Automatique</span>
          </div>
          <p style="font-size: 13px; color: var(--slate); margin-bottom: 16px; line-height: 1.4;">Calculé en temps réel selon vos mensurations à jour.</p>
          
          <div style="display: flex; align-items: baseline; gap: 10px; margin-bottom: 8px;">
            <span style="font-size: 42px; font-family: 'Archivo Black', sans-serif; color: var(--ink); line-height: 1;">${imc}</span>
            <span style="font-size: 13px; font-weight: 800; color: ${statusColor}; background: rgba(0,0,0,0.03); padding: 4px 10px; border-radius: 20px;">${status}</span>
          </div>
          <p style="font-size: 13px; line-height: 1.5; color: var(--slate); margin: 0 0 14px;">
            Votre IMC de <strong style="color:var(--ink);">${imc}</strong> oriente vos paramètres d'entraînement pour la phase <strong style="color:var(--ember);">${goal === 'musculation' ? 'Hypertrophie' : goal === 'perte-poids' ? 'Déstockage de Gras' : 'Conditionnement Athlétique'}</strong>.
          </p>
          <button class="btn btn-outline-dark" id="btn-quick-update-metrics" style="font-size: 11px; padding: 6px 12px; display: inline-flex; align-items: center; gap: 6px; font-weight: 700;">
            ${icon("edit", 12)} Actualiser taille & poids
          </button>
        </div>

        <div style="border-left: 1px solid var(--line); padding-left: 24px;" class="metric-desktop-border">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px;">
            <h3 class="client-card-title" style="margin: 0; display: flex; align-items: center; gap: 8px;">
              ${icon("target", 18, "var(--ember)")} Cibles Nutritionnelles Journalières
            </h3>
          </div>
          <span style="font-size: 10px; font-family: 'IBM Plex Mono', monospace; color: var(--ember); font-weight: 800; text-transform: uppercase;">${goalText}</span>
          
          <div style="margin-top: 10px; display: flex; align-items: baseline; gap: 6px;">
            <span style="font-size: 32px; font-family: 'Archivo Black', sans-serif; color: var(--ink);">${targetCalories}</span>
            <span style="font-size: 13px; color: var(--slate); font-weight: 600;">kcal / jour recommandées</span>
          </div>
          
          <div style="margin-top: 14px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; text-align: center;">
            <div style="background: rgba(60,90,70,0.04); padding: 8px 6px; border-radius: 8px; border: 1px solid rgba(60,90,70,0.15);">
              <div style="font-size: 9px; text-transform: uppercase; color: var(--slate); font-weight: 700;">Protéines</div>
              <div style="font-size: 14px; font-family: 'Archivo Black', sans-serif; color: var(--moss); margin-top: 2px;">${proteinTarget}g</div>
            </div>
            <div style="background: rgba(226,98,45,0.04); padding: 8px 6px; border-radius: 8px; border: 1px solid rgba(226,98,45,0.15);">
              <div style="font-size: 9px; text-transform: uppercase; color: var(--slate); font-weight: 700;">Glucides</div>
              <div style="font-size: 14px; font-family: 'Archivo Black', sans-serif; color: var(--ember); margin-top: 2px;">${carbTarget}g</div>
            </div>
            <div style="background: rgba(37,99,235,0.04); padding: 8px 6px; border-radius: 8px; border: 1px solid rgba(37,99,235,0.15);">
              <div style="font-size: 9px; text-transform: uppercase; color: var(--slate); font-weight: 700;">Lipides</div>
              <div style="font-size: 14px; font-family: 'Archivo Black', sans-serif; color: #2563eb; margin-top: 2px;">${fatTarget}g</div>
            </div>
          </div>
        </div>
      </div>
    `;
  } else {
    imcHtml = `
      <div class="client-card" style="grid-column: 1 / -1; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; border: 2px dashed var(--line); background: white; padding: 24px; border-radius: 12px;">
        <div style="max-width: 520px;">
          <h3 class="client-card-title" style="margin-bottom: 6px; display: flex; align-items: center; gap: 8px;">
            📈 Calculez vos cibles caloriques & IMC
          </h3>
          <p style="font-size: 13px; color: var(--slate); margin: 0; line-height: 1.5;">
            Indiquez votre poids et votre taille pour générer instantanément vos besoins métaboliques TDEE, votre diagnostic IMC et vos repères de macronutriments recommandés par Coach Abdou.
          </p>
        </div>
        <button class="btn btn-primary" id="btn-quick-update-metrics" style="font-size: 13px; font-weight: 700; padding: 10px 18px; background: var(--ember); border-color: var(--ember);">
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
    <div class="client-card" style="display: flex; flex-direction: column; justify-content: space-between; background: white; border: 1px solid var(--line); border-radius: 12px; padding: 24px;">
      <div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
          <h3 class="client-card-title" style="display: flex; align-items: center; gap: 8px; margin: 0;">
            💧 Suivi d'Hydratation
          </h3>
          <span style="font-size: 11px; font-family: 'IBM Plex Mono', monospace; font-weight: 700; color: #2563eb; background: rgba(37,99,235,0.08); padding: 2px 8px; border-radius: 12px;">Objectif 2.5L</span>
        </div>
        <p style="font-size: 12px; color: var(--slate); margin-bottom: 18px; line-height: 1.4;">Maintenir l'hydratation cellulaire maximise vos performances en séance.</p>
        
        <div style="display: flex; align-items: center; gap: 20px; margin-bottom: 18px;">
          <div style="width: 58px; height: 86px; border: 3px solid var(--ink); border-radius: 6px 6px 16px 16px; position: relative; overflow: hidden; background: #f1f5f9; display: flex; align-items: flex-end; box-shadow: inset 0 2px 4px rgba(0,0,0,0.05);">
            <div style="width: 100%; height: ${waterPct}%; background: linear-gradient(180deg, #60a5fa 0%, #2563eb 100%); transition: height 0.4s ease;"></div>
            <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; display: flex; align-items: center; justify-content: center; font-family: 'Archivo Black', sans-serif; font-size: 11px; color: ${waterPct > 50 ? '#ffffff' : 'var(--ink)'}; text-shadow: ${waterPct > 50 ? '0 1px 2px rgba(0,0,0,0.3)' : 'none'}; z-index: 2;">
              ${waterPct}%
            </div>
          </div>
          <div>
            <div style="font-size: 28px; font-family: 'Archivo Black', sans-serif; color: var(--ink); line-height: 1;">${waterAmount} <span style="font-size: 14px; color: var(--slate); font-weight: normal;">/ 2500 ml</span></div>
            <p style="font-size: 12px; color: var(--slate); margin: 6px 0 0; line-height: 1.4;">${waterAmount >= 2500 ? '✅ Cible d\'eau atteinte pour aujourd\'hui !' : 'Ajoutez vos consommations d\'eau au fil de la journée.'}</p>
          </div>
        </div>
      </div>

      <div style="display: flex; gap: 8px; margin-top: 12px;">
        <button class="btn btn-outline-dark" id="btn-water-add-250" style="flex: 1; padding: 8px 10px; font-size: 12px; justify-content: center; font-weight: 700;">+ 250 ml 🥛</button>
        <button class="btn btn-outline-dark" id="btn-water-add-500" style="flex: 1; padding: 8px 10px; font-size: 12px; justify-content: center; font-weight: 700;">+ 500 ml 🫙</button>
        <button class="btn" id="btn-water-reset" title="Réinitialiser" style="background: rgba(239, 68, 68, 0.08); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2); padding: 8px 10px; display: flex; align-items: center; justify-content: center; border-radius: 6px; cursor: pointer;">
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
    <div class="client-card" style="display: flex; flex-direction: column; justify-content: space-between; background: white; border: 1px solid var(--line); border-radius: 12px; padding: 24px;">
      <div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
          <h3 class="client-card-title" style="display: flex; align-items: center; gap: 8px; margin: 0;">
            ⚖️ Évolution du Poids
          </h3>
          <span style="font-size: 11px; font-family: 'IBM Plex Mono', monospace; font-weight: 700; color: var(--ember); background: var(--ember-soft); padding: 2px 8px; border-radius: 12px;">${weight > 0 ? weight + ' kg' : 'À renseigner'}</span>
        </div>
        <p style="font-size: 12px; color: var(--slate); margin-bottom: 14px;">Enregistrez votre pesée à jeun 1 à 2 fois par semaine.</p>
        
        <div style="background: rgba(0,0,0,0.015); border: 1px solid var(--line); border-radius: 8px; padding: 10px 12px; margin-bottom: 14px;">
          <h4 style="font-size: 10px; text-transform: uppercase; color: var(--slate); font-weight: 800; margin: 0 0 6px; letter-spacing: 0.05em;">Dernières pesées</h4>
          <div style="max-height: 95px; overflow-y: auto;">
            ${weightListHtml}
          </div>
        </div>
      </div>

      <div>
        <form id="form-log-weight" style="display: flex; gap: 8px; align-items: center; margin-top: 10px;">
          <div style="position: relative; flex: 1;">
            <input type="number" step="0.1" required placeholder="Ex: 75.5" id="input-log-weight" class="text-input" style="width: 100%; padding: 8px 30px 8px 10px; font-size: 13px;" />
            <span style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); font-size: 11px; color: var(--slate); font-weight: 700;">kg</span>
          </div>
          <button type="submit" class="btn btn-primary" style="padding: 8px 14px; font-size: 12px; justify-content: center; font-weight: 700; background: var(--ember); border-color: var(--ember);">
            Loguer
          </button>
        </form>
      </div>
    </div>
  `;

  // 4. COACH ABDOU BILAN CARD (Directly on Dashboard)
  const coachBilan = profile.coachBilan || profile.coachNotes || null;
  let coachBilanText = "";
  let coachBilanDate = "";

  if (coachBilan) {
    if (typeof coachBilan === "object") {
      coachBilanText = coachBilan.text || "";
      coachBilanDate = coachBilan.dateStr || (coachBilan.updatedAt ? new Date(coachBilan.updatedAt).toLocaleDateString('fr-FR') : "");
    } else if (typeof coachBilan === "string") {
      coachBilanText = coachBilan;
    }
  }

  let dashboardBilanHtml = "";
  if (coachBilanText && coachBilanText.trim().length > 0) {
    dashboardBilanHtml = `
      <div style="grid-column: 1 / -1; background: linear-gradient(135deg, #16232c 0%, #223744 100%); color: white; border-radius: 12px; padding: 24px; border: 1.5px solid var(--moss); box-shadow: 0 12px 32px rgba(22,35,44,0.18); margin-bottom: 8px; position: relative; overflow: hidden;">
        <div style="position: absolute; right: -15px; bottom: -20px; opacity: 0.06; font-size: 140px; color: white; pointer-events: none;">
          ${icon("award", 140)}
        </div>
        <div style="position: relative; z-index: 2;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 14px; flex-wrap: wrap;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <div style="width: 42px; height: 42px; border-radius: 50%; background: var(--ember); color: white; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 15px; border: 2px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.3);">
                AB
              </div>
              <div>
                <h3 style="font-size: 16px; font-weight: 800; color: white; margin: 0; font-family: 'Archivo Black', sans-serif; display: flex; align-items: center; gap: 6px;">
                  Analyse & Bilan de Coach Abdou BAKARI <span style="color: #4ade80; font-size: 12px;">✓</span>
                </h3>
                <span style="font-size: 11px; color: rgba(255,255,255,0.7); font-weight: 600;">Recommandation VIP Personnalisée</span>
              </div>
            </div>
            ${coachBilanDate ? `<span style="font-size: 11px; color: white; font-weight: 700; background: rgba(255,255,255,0.12); padding: 4px 10px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.2);">🗓️ Publié le ${escapeHtml(coachBilanDate)}</span>` : ''}
          </div>

          <div style="background: rgba(255,255,255,0.06); padding: 16px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.12); font-size: 14px; line-height: 1.6; color: #f8fafc; font-style: italic; margin-bottom: 16px;">
            "${escapeHtml(coachBilanText)}"
          </div>

          <div style="display: flex; justify-content: flex-end;">
            <a href="https://wa.me/2290191720596?text=${encodeURIComponent('Bonjour Coach Abdou, au sujet de mon dernier bilan : ' + coachBilanText.substring(0, 60) + '...')}" target="_blank" rel="noopener noreferrer" class="btn btn-primary" style="font-weight: 700; font-size: 13px; padding: 10px 18px; text-decoration: none; display: inline-flex; align-items: center; gap: 8px; background: #25D366; border-color: #25D366; color: white;">
              💬 Échanger avec Coach Abdou sur WhatsApp
            </a>
          </div>
        </div>
      </div>
    `;
  } else {
    dashboardBilanHtml = `
      <div style="grid-column: 1 / -1; background: white; border: 1px solid var(--line); border-radius: 12px; padding: 20px 24px; display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap;">
        <div style="display: flex; align-items: center; gap: 14px;">
          <div style="width: 40px; height: 40px; border-radius: 50%; background: var(--moss-soft); color: var(--moss); display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 14px;">
            AB
          </div>
          <div>
            <h4 style="font-size: 14px; font-weight: 800; color: var(--ink); margin: 0 0 2px;">Supervision par Coach Abdou BAKARI</h4>
            <p style="font-size: 12px; color: var(--slate); margin: 0;">Validez vos séances de la semaine pour débloquer votre prochain bilan d'évolution.</p>
          </div>
        </div>
        <a href="https://wa.me/2290191720596" target="_blank" rel="noopener noreferrer" class="btn btn-outline-dark" style="font-size: 12px; font-weight: 700; padding: 8px 14px;">
          💬 Contacter le Coach
        </a>
      </div>
    `;
  }

  return `
  <div class="wrap client-page">
    
    <!-- 1. BRAND CERTIFICATION & ATHLETE HEADER -->
    <div style="background: linear-gradient(135deg, var(--ink) 0%, #1c2b36 100%); color: white; border-radius: 14px; padding: 20px 24px; margin-top: 10px; margin-bottom: 28px; box-shadow: 0 12px 30px rgba(22,35,44,0.12); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; border: 1px solid rgba(255,255,255,0.08);">
      <div style="display: flex; align-items: center; gap: 14px;">
        <div style="position: relative;">
          ${getUserAvatarHtml({
            photoURL: profile.photoURL || profile.photoUrl,
            email: profile.email,
            firstName: profile.firstName,
            lastName: profile.lastName,
            size: 52,
            border: "2px solid var(--ember)"
          })}
          <span style="position: absolute; bottom: 0; right: 0; width: 12px; height: 12px; background: #22c55e; border: 2px solid var(--ink); border-radius: 50%;" title="Session Athlète Active"></span>
        </div>
        <div>
          <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
            <span style="font-size: 10px; font-family: 'IBM Plex Mono', monospace; font-weight: 800; text-transform: uppercase; background: var(--ember); color: white; padding: 2px 8px; border-radius: 4px;">ATHLÈTE VIP</span>
            <span style="font-size: 11px; color: rgba(255,255,255,0.7); font-weight: 600;">Coach Attitré : <strong>Coach Abdou BAKARI</strong></span>
          </div>
          <h1 style="font-size: 22px; font-family: 'Archivo Black', sans-serif; color: white; margin: 4px 0 2px;">Bonjour, ${escapeHtml(firstName)} !</h1>
          <p style="font-size: 12px; color: rgba(255,255,255,0.75); margin: 0;">Objectif : <strong>${escapeHtml(goalLabel)}</strong> · Semaine <strong>${week} sur ${totalWeeks}</strong></p>
        </div>
      </div>

      <!-- ONBOARDING QUICK TABS -->
      <div style="display: flex; gap: 10px; flex-wrap: wrap;">
        <button class="btn btn-outline-dark" data-nav="client-program" style="color: white; border-color: rgba(255,255,255,0.3); font-size: 12px; font-weight: 700; padding: 8px 14px; background: rgba(255,255,255,0.05);">
          ${icon("dumbbell", 14)} Mon Programme
        </button>
        <button class="btn btn-outline-dark" data-nav="client-progress" style="color: white; border-color: rgba(255,255,255,0.3); font-size: 12px; font-weight: 700; padding: 8px 14px; background: rgba(255,255,255,0.05);">
          ${icon("trending-up", 14)} Ma Progression
        </button>
      </div>
    </div>

    <!-- 2. HERO NEXT TRAINING CARD -->
    <div class="client-hero-card" style="background: linear-gradient(135deg, #f8fafc 0%, var(--chalk-soft) 100%); border: 1px solid var(--line); box-shadow: 0 4px 16px rgba(0,0,0,0.02);">
      <div class="client-hero-content">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
          <span class="client-hero-label" style="margin-bottom: 0;">PROCHAIN TRAINING</span>
          <span style="font-size: 11px; color: var(--slate); font-weight: 700;">⏱️ 45-60 min · Semaine ${week}</span>
        </div>
        <h2 class="client-hero-title" style="font-size: 26px; margin-bottom: 12px;">${escapeHtml(nextSession)}</h2>
        <p style="font-size: 13px; color: var(--slate); margin-bottom: 18px; line-height: 1.5; max-width: 540px;">
          💡 <strong>Astuce Coach Abdou :</strong> "La régularité surpasse l'intensité ponctuelle. Respectez les temps de repos préconisés pour maximiser vos gains."
        </p>
        <div class="client-hero-actions">
          <button class="btn btn-primary" data-nav="client-program" style="font-weight: 800; font-size: 14px; padding: 12px 22px; background: var(--ember); border-color: var(--ember);">
            ${icon("play-circle", 18)} Lancer la séance en direct
          </button>
          <button class="btn btn-outline-dark" data-nav="client-program" style="font-weight: 700; font-size: 13px; padding: 12px 18px;">
            Consulter le planning
          </button>
        </div>
      </div>
      <div class="client-hero-bg">
        ${icon("zap", 200)}
      </div>
    </div>

    <!-- 3. RÉSUMÉ DE PROGRESSION DE CYCLE -->
    <div class="client-progress-row" style="margin-bottom: 28px;">
      <div class="client-progress-box" style="background: white;">
        <div class="client-pb-head">
          <div class="client-pb-lbl" style="font-weight: 700; color: var(--ink);">Avancement du Programme</div>
          <div class="client-pb-val">${week} <span style="font-size:16px;color:var(--slate);">/ ${totalWeeks} sem.</span></div>
        </div>
        <div class="client-pb-bar"><div class="client-pb-fill" style="width: ${progressPct}%;"></div></div>
      </div>
      
      <div class="client-progress-box" style="background: white;">
        <div class="client-pb-head">
          <div class="client-pb-lbl" style="font-weight: 700; color: var(--ink);">Séances Validées Ce Cycle</div>
          <div class="client-pb-val" style="color: var(--moss);">${totalDone} <span style="font-size:16px;color:var(--slate);">/ ${sessions.length}</span></div>
        </div>
        <div class="client-pb-bar"><div class="client-pb-fill" style="width: ${sessions.length ? Math.round((totalDone/sessions.length)*100) : 0}%; background: var(--moss);"></div></div>
      </div>
    </div>

    <!-- 4. COACH BILAN CARD (Directly integrated on dashboard) -->
    <div style="margin-bottom: 28px;">
      ${dashboardBilanHtml}
    </div>

    <!-- 5. DIAGNOSTIC IMC & NUTRITION -->
    <div style="margin-bottom: 28px; display: grid; gap: 24px; grid-template-columns: 1fr;">
      ${imcHtml}
    </div>

    <!-- 6. BENTO GRID DE MODULES INTERACTIFS -->
    <div class="client-grid-2" style="margin-bottom: 40px; display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px;">
      
      <!-- CARD 1: Cibles Athlétiques -->
      <div class="client-card" style="display: flex; flex-direction: column; justify-content: space-between; background: white; border: 1px solid var(--line); border-radius: 12px; padding: 24px;">
        <div>
          <h3 class="client-card-title" style="margin-bottom: 14px;">🎯 Cibles Athlétiques</h3>
          <div class="client-list-item">
            <div class="client-list-label">${icon("target", 16)} Objectif principal</div>
            <div class="client-list-val" style="color: var(--ember); font-weight: 800;">${escapeHtml(goalLabel)}</div>
          </div>
          <div class="client-list-item">
            <div class="client-list-label">${icon("dumbbell", 16)} Configuration</div>
            <div class="client-list-val" style="font-weight: 700;">${escapeHtml(program.trackLabel || "Salle de sport (Gym)")}</div>
          </div>
          <div class="client-list-item" style="border: none; padding-bottom: 0;">
            <div class="client-list-label">${icon("calendar", 16)} Rythme préconisé</div>
            <div class="client-list-val" style="font-weight: 700;">3 à 4 séances / sem.</div>
          </div>
        </div>
        <div style="margin-top: 18px; border-top: 1px solid var(--line); padding-top: 12px; display: flex; align-items: center; justify-content: space-between;">
          <span style="font-size: 11px; color: var(--slate); font-weight: 600;">Données d'onboarding</span>
          <button class="btn btn-outline-dark" data-nav="privacy" style="font-size: 11px; padding: 4px 8px; font-weight: 700;">Ajuster</button>
        </div>
      </div>

      <!-- CARD 2: Hydratation -->
      ${waterCardHtml}

      <!-- CARD 3: Weight Tracker -->
      ${weightCardHtml}

      <!-- CARD 4: Support WhatsApp Direct -->
      <div class="client-card" style="display:flex; flex-direction:column; justify-content:space-between; text-align:center; background: white; border: 1px solid var(--line); border-radius: 12px; padding: 24px;">
        <div>
          <div style="color:var(--ember); margin-bottom:12px; display: flex; justify-content: center;">${icon("message-circle", 36)}</div>
          <h3 class="client-card-title" style="margin-bottom: 6px;">Support Coach Direct</h3>
          <p style="color:var(--slate); font-size:13px; margin:0 0 16px; line-height:1.5;">Vous hésitez sur une charge ou la posture d'un exercice ? Contactez directement Coach Abdou sur WhatsApp.</p>
        </div>
        <a href="https://wa.me/2290191720596" target="_blank" rel="noopener noreferrer" class="btn btn-outline-dark" style="margin: 0 auto; text-decoration: none; display: inline-flex; align-items: center; gap: 8px; font-weight: 700; width: 100%; justify-content: center; padding: 10px;">
          💬 Échanger avec Coach Abdou
        </a>
      </div>

    </div>
  </div>`;
}

/**
 * Exercices prédéfinis pour la simulation et les séances d'entraînement.
 */
export function getExercisesForSession(sessionName) {
  const normName = (sessionName || "").toLowerCase().trim();

  // 1. Recherche prioritaire dans les programmes officiels rédigés par Coach Abdou BAKARI
  for (const prog of COACH_PROGRAMS) {
    const matchedSession = prog.sessions.find(s => 
      s.name.toLowerCase().trim() === normName ||
      normName.includes(s.day.toLowerCase()) ||
      normName.includes(s.name.toLowerCase())
    );
    if (matchedSession) {
      return matchedSession.exercises.map(ex => ({
        name: ex.name,
        desc: ex.desc,
        detail: `${ex.sets} séries × ${ex.reps} (Repos: ${ex.rest})`
      }));
    }
  }

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
      <div class="client-header" style="background: linear-gradient(135deg, var(--ink) 0%, #1c2b36 100%); color: white; border-radius: 14px; padding: 24px; margin-top: 10px; margin-bottom: 24px; border: 1px solid rgba(255,255,255,0.08);">
        <span style="font-size: 10px; font-family: 'IBM Plex Mono', monospace; font-weight: 800; text-transform: uppercase; background: var(--ember); color: white; padding: 2px 8px; border-radius: 4px;">STATUT PROGRAMME</span>
        <h1 style="font-size: 22px; font-family: 'Archivo Black', sans-serif; color: white; margin: 6px 0 4px;">Aucun programme actif</h1>
        <p style="font-size: 12px; color: rgba(255,255,255,0.7); margin: 0;">Sélectionnez un programme ou réalisez le quiz pour débloquer votre planification personnalisée.</p>
      </div>
      
      <div class="client-empty-state" style="background: white; border: 1px solid var(--line); border-radius: 12px; padding: 40px 20px; text-align: center;">
        <div class="client-empty-icon" style="color: var(--ember); margin-bottom: 12px;">${icon("calendar", 44)}</div>
        <h2 class="client-empty-title" style="font-size: 18px; font-weight: 800; color: var(--ink); margin-bottom: 8px;">Prêt à démarrer votre transformation ?</h2>
        <p class="client-empty-text" style="font-size: 13px; color: var(--slate); max-width: 480px; margin: 0 auto 20px; line-height: 1.5;">Complétez le questionnaire d'orientation de Coach Abdou pour générer un programme parfaitement adapté à vos objectifs et votre équipement.</p>
        <button class="btn btn-primary" data-nav="quiz" style="font-weight: 800; padding: 12px 24px; background: var(--ember); border-color: var(--ember);">
          Lancer l'Orientation Officielles ${icon("arrow-right", 16)}
        </button>
      </div>
    </div>`;
  }

  // --- RENDU : SÉANCE ACTIVE EN COURS DE LECTURE (WORKOUT PLAYER) ---
  if (state.activeSession) {
    const sessionName = state.activeSession;
    const listExos = getExercisesForSession(sessionName);
    
    const initSecs = state.activeSessionSeconds || 0;
    const mins = Math.floor(initSecs / 60).toString().padStart(2, '0');
    const secs = (initSecs % 60).toString().padStart(2, '0');
    const formattedTime = `${mins}:${secs}`;

    const isRunning = !!state.isTimerRunning;

    return `
    <div class="wrap client-page">
      
      <!-- HEADER WORKOUT PLAYER ACTIVE -->
      <div style="background: linear-gradient(135deg, var(--ink) 0%, #1c2b36 100%); color: white; border-radius: 14px; padding: 20px 24px; margin-top: 10px; margin-bottom: 24px; border: 1px solid rgba(255,255,255,0.08); box-shadow: 0 12px 30px rgba(22,35,44,0.12); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
        <div>
          <button id="btn-cancel-workout" class="btn btn-outline-dark" style="color: white; border-color: rgba(255,255,255,0.3); font-size: 11px; padding: 5px 10px; display: inline-flex; align-items: center; gap: 6px; background: rgba(255,255,255,0.06); margin-bottom: 10px; font-weight: 700;">
            ${icon("arrow-left", 14)} Quitter la séance
          </button>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 10px; font-family: 'IBM Plex Mono', monospace; font-weight: 800; text-transform: uppercase; background: #22c55e; color: white; padding: 2px 8px; border-radius: 4px;">MODE SÉANCE EN DIRECT</span>
            <span style="font-size: 11px; color: rgba(255,255,255,0.7); font-weight: 600;">Supervisé par Coach Abdou</span>
          </div>
          <h1 style="font-size: 22px; font-family: 'Archivo Black', sans-serif; color: white; margin: 4px 0 2px;">${escapeHtml(sessionName)}</h1>
        </div>

        <!-- PANNEAU DE CHRONOMÈTRE -->
        <div style="background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); padding: 14px 20px; border-radius: 12px; text-align: center; min-width: 280px; width: 100%; max-width: 380px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <span style="font-size: 10px; font-family: 'IBM Plex Mono', monospace; text-transform: uppercase; color: rgba(255,255,255,0.7); font-weight: 700;">Temps Écoulé</span>
            <span id="timer-status-badge" class="adm-badge ${isRunning ? 'active' : ''}" style="font-size: 10px; background: ${isRunning ? '#22c55e' : 'rgba(255,255,255,0.2)'}; color: white; border: none; font-weight: 800;">
              ${isRunning ? '▶ EN COURS' : '⏸ EN PAUSE'}
            </span>
          </div>

          <div style="margin: 4px 0 10px;">
            <span id="workout-timer" style="font-size: 36px; font-family: 'IBM Plex Mono', monospace; font-weight: 800; color: white; letter-spacing: 1px; text-shadow: 0 2px 10px rgba(0,0,0,0.3);">${formattedTime}</span>
          </div>

          <div style="display: flex; gap: 8px; justify-content: center; flex-wrap: wrap;">
            <button id="btn-toggle-timer" class="btn ${isRunning ? '' : 'btn-ember'}" style="${isRunning ? 'background: rgba(255,255,255,0.2); color: white;' : 'background: var(--ember); border-color: var(--ember);'} display: inline-flex; align-items: center; gap: 6px; font-weight: 800; font-size: 12px; padding: 6px 14px;">
              ${isRunning ? `${icon("pause", 14)} Pause` : `${icon("play", 14)} Démarrer Timer`}
            </button>
            <button id="btn-reset-timer" class="btn btn-outline-dark" style="color: white; border-color: rgba(255,255,255,0.3); display: inline-flex; align-items: center; gap: 6px; font-size: 11px; padding: 6px 10px; background: rgba(0,0,0,0.2);">
              ${icon("rotate-ccw", 12)} Reset
            </button>
          </div>
        </div>
      </div>

      <!-- EXERCISES ROADMAP -->
      <div style="display: grid; gap: 24px; grid-template-columns: 1fr; margin-bottom: 32px;">
        <div class="client-card" style="background: white; border: 1px solid var(--line); border-radius: 12px; padding: 24px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
            <h3 class="client-card-title" style="margin: 0; display: flex; align-items: center; gap: 8px;">
              ${icon("list", 20, "var(--ember)")} Feuille de Route & Exécution Des Exercices
            </h3>
            <span style="font-size: 11px; font-family: 'IBM Plex Mono', monospace; color: var(--slate); font-weight: 700;">${listExos.length} Mouvements</span>
          </div>
          <p style="font-size: 12px; color: var(--slate); margin-bottom: 20px; line-height: 1.5;">
            Cochez les séries accomplies au fur et à mesure. Respectez les temps de repos indiqués entre chaque série.
          </p>

          <div style="display: grid; gap: 18px;">
            ${listExos.map((exo, idx) => {
              const match = String(exo.detail || "").match(/(\d+)\s*séries?/i);
              const setsCount = match ? parseInt(match[1], 10) : 4;
              const setsArray = Array.from({ length: setsCount }, (_, i) => i + 1);
              return `
              <div style="padding: 18px; border: 1px solid var(--line); border-radius: 10px; background: #f8fafc; display: flex; flex-direction: column; gap: 10px;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; flex-wrap: wrap;">
                  <div>
                    <span style="font-size: 10px; font-weight: 800; color: var(--ember); font-family: 'IBM Plex Mono', monospace; text-transform: uppercase;">EXERCICE #${idx + 1}</span>
                    <h4 style="font-size: 16px; font-weight: 800; margin: 2px 0 4px; color: var(--ink);">${escapeHtml(exo.name)}</h4>
                    <p style="font-size: 12px; color: var(--slate); margin: 0 0 10px; line-height: 1.4;">${escapeHtml(exo.desc)}</p>
                    <a href="https://www.youtube.com/results?search_query=${encodeURIComponent(exo.name + ' exercice de musculation')}" target="_blank" rel="noopener noreferrer" style="font-size: 11px; font-weight: 700; color: white; background-color: #ff0000; padding: 4px 10px; border-radius: 6px; text-decoration: none; display: inline-flex; align-items: center; gap: 6px; box-shadow: 0 2px 6px rgba(255,0,0,0.2);">
                      ${icon("play-circle", 12)} Tuto Vidéo (YouTube)
                    </a>
                  </div>
                  <span class="adm-badge active" style="background: white; color: var(--ink); border: 1px solid var(--line); font-size: 12px; font-weight: 700; padding: 4px 10px; white-space: nowrap; height: fit-content;">
                    🎯 ${escapeHtml(exo.detail)}
                  </span>
                </div>
                
                <!-- SÉRIES INTERACTIVES -->
                <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 6px; padding-top: 10px; border-top: 1px dashed var(--line);">
                  ${setsArray.map(setNum => `
                    <label style="display: inline-flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 600; cursor: pointer; background: white; border: 1px solid var(--line); padding: 6px 12px; border-radius: 6px; user-select: none;">
                      <input type="checkbox" style="width: 15px; height: 15px; accent-color: var(--moss);" />
                      <span>Série ${setNum}</span>
                    </label>
                  `).join("")}
                </div>
              </div>
              `;
            }).join("")}
          </div>
        </div>

        <!-- JOURNAL DE BORD & VALIDATION -->
        <div class="client-card" style="background: white; border: 1px solid var(--line); border-radius: 12px; padding: 24px;">
          <h3 class="client-card-title" style="margin-bottom: 6px; display: flex; align-items: center; gap: 8px;">
            📝 Carnet de Progression & Remarques
          </h3>
          <p style="font-size: 12px; color: var(--slate); margin-bottom: 16px;">Consignez vos charges (ex: 80kg au squat), votre ressenti d'effort ou vos interrogations pour Coach Abdou.</p>
          
          <form id="form-submit-workout-session">
            <textarea id="workout-notes-input" placeholder="Ex: Très bonnes sensations. J'ai respecté les temps de repos de 90s..." class="text-input" style="width: 100%; min-height: 100px; padding: 12px; margin-bottom: 16px; font-size: 13px; font-family: inherit; resize: vertical; border-radius: 8px;"></textarea>
            
            <div style="display: flex; gap: 12px; flex-wrap: wrap;">
              <button type="submit" class="btn btn-primary" style="flex: 1; padding: 14px; justify-content: center; font-size: 14px; font-weight: 800; background: var(--moss); border-color: var(--moss);">
                🏆 Valider et enregistrer la séance
              </button>
              <button type="button" id="btn-cancel-workout-btn" class="btn btn-outline-dark" style="padding: 14px 20px; font-weight: 700;">
                Annuler
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>`;
  }

  // --- RENDU NORMAL : OVERVIEW DU PROGRAMME ET AGENDA DE SÉANCES ---
  const coachProg = COACH_PROGRAMS.find(p => p.id === program.coachProgramId) || 
                    COACH_PROGRAMS.find(p => p.trackId === program.track) || 
                    COACH_PROGRAMS[0];
  
  const isCoachProgram = program.track === "home-equip" || program.track === "prise-de-muscle-home" || program.track === "bodyweight" || program.track === "gym" || (program.trackLabel && program.trackLabel.includes("Abdou"));

  const completedSessions = program.sessions.filter(s => s.done).length;
  const totalSessions = program.sessions.length;

  const coachInstructionsHtml = isCoachProgram ? `
    <div class="client-card" style="margin-bottom: 28px; background: white; border: 1px solid var(--line); border-radius: 12px; padding: 24px; box-shadow: 0 4px 16px rgba(0,0,0,0.02);">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; flex-wrap: wrap; margin-bottom: 18px; padding-bottom: 16px; border-bottom: 1px solid var(--line);">
        <div>
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
            <span style="background: var(--ember); color: white; font-size: 10px; font-weight: 800; padding: 2px 8px; border-radius: 4px; text-transform: uppercase; font-family: 'IBM Plex Mono', monospace;">PROGRAMME OFFICIEL</span>
            <span style="font-size: 11px; color: var(--moss); font-weight: 700; background: var(--moss-soft); padding: 2px 8px; border-radius: 4px;">Supervision Coach Abdou</span>
          </div>
          <h2 style="font-size: 20px; font-family: 'Archivo Black', sans-serif; color: var(--ink); margin: 0 0 4px;">${escapeHtml(coachProg.title)}</h2>
          <p style="font-size: 12px; color: var(--slate); margin: 0; line-height: 1.4;">${escapeHtml(coachProg.subtitle)} · Durée : <strong>${escapeHtml(coachProg.duration)}</strong> · Rythme : <strong>${escapeHtml(coachProg.frequency)}</strong></p>
        </div>
      </div>

      <!-- BENTO CONSIGNES TECHNIQUE -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 18px;">
        <div style="background: rgba(226,98,45,0.03); padding: 14px; border-radius: 8px; border: 1px solid rgba(226,98,45,0.12);">
          <h4 style="font-size: 11px; text-transform: uppercase; color: var(--ember); font-weight: 800; margin: 0 0 6px; letter-spacing: 0.05em; display: flex; align-items: center; gap: 6px;">
            ⏱️ Repos & Tempo
          </h4>
          <p style="font-size: 12px; color: var(--ink); margin: 0 0 4px; line-height: 1.4; font-weight: 600;">${escapeHtml(coachProg.generalRules.rest)}</p>
          ${coachProg.generalRules.tempo ? `<p style="font-size: 11px; color: var(--slate); margin: 0; line-height: 1.4;"><strong>Tempo :</strong> ${escapeHtml(coachProg.generalRules.tempo)}</p>` : ""}
        </div>

        <div style="background: rgba(60,90,70,0.03); padding: 14px; border-radius: 8px; border: 1px solid rgba(60,90,70,0.12);">
          <h4 style="font-size: 11px; text-transform: uppercase; color: var(--moss); font-weight: 800; margin: 0 0 6px; letter-spacing: 0.05em; display: flex; align-items: center; gap: 6px;">
            🏋️ Matériel Requis
          </h4>
          <p style="font-size: 11px; color: var(--slate); margin: 0; line-height: 1.5;">
            ${coachProg.equipment.map(item => `• ${escapeHtml(item)}`).join("<br/>")}
          </p>
        </div>

        <div style="background: rgba(0,0,0,0.015); padding: 14px; border-radius: 8px; border: 1px solid var(--line);">
          <h4 style="font-size: 11px; text-transform: uppercase; color: var(--ink); font-weight: 800; margin: 0 0 6px; letter-spacing: 0.05em; display: flex; align-items: center; gap: 6px;">
            🔥 Échauffement (${escapeHtml(coachProg.warmup.duration)})
          </h4>
          <p style="font-size: 11px; color: var(--slate); margin: 0; line-height: 1.5;">
            ${coachProg.warmup.steps.map(step => `• ${escapeHtml(step)}`).join("<br/>")}
          </p>
        </div>
      </div>

      <!-- DROPDOWN DETAIL CYCLE -->
      <details style="margin-top: 16px; padding-top: 12px; border-top: 1px dashed var(--line);">
        <summary style="font-size: 12px; font-weight: 700; color: var(--ink); cursor: pointer; user-select: none; display: flex; align-items: center; gap: 6px;">
          <span>📖 Plan de progression sur ${escapeHtml(coachProg.duration)} & conseils spécifiques du Coach</span>
        </summary>
        <div style="margin-top: 12px; font-size: 12px; color: var(--slate); line-height: 1.6; display: grid; gap: 12px;">
          <div style="background: #f8fafc; padding: 12px; border-radius: 8px; border: 1px solid var(--line);">
            <strong style="color: var(--ink); display: block; margin-bottom: 4px;">Cycle de Progression :</strong>
            ${coachProg.progressionPlan.map(p => `• <strong>${escapeHtml(p.period)} :</strong> ${escapeHtml(p.desc)}`).join("<br/>")}
          </div>
          <div style="background: #f8fafc; padding: 12px; border-radius: 8px; border: 1px solid var(--line);">
            <strong style="color: var(--ink); display: block; margin-bottom: 4px;">Étirements recommandés (${escapeHtml(coachProg.stretching.duration)}) :</strong>
            ${coachProg.stretching.exercises.map(ex => `• ${escapeHtml(ex)}`).join("<br/>")}
          </div>
          ${coachProg.keyTips ? `
          <div style="background: #f8fafc; padding: 12px; border-radius: 8px; border: 1px solid var(--line);">
            <strong style="color: var(--ink); display: block; margin-bottom: 4px;">💡 Conseils Clés :</strong>
            ${coachProg.keyTips.map(tip => `• ${escapeHtml(tip)}`).join("<br/>")}
          </div>
          ` : ""}
        </div>
      </details>
    </div>
  ` : "";

  return `
  <div class="wrap client-page" style="padding-bottom: 60px;">
    
    <!-- 1. ATHLETE BANNER HEADER -->
    <div style="background: linear-gradient(135deg, var(--ink) 0%, #1c2b36 100%); color: white; border-radius: 14px; padding: 22px 26px; margin-top: 10px; margin-bottom: 28px; border: 1px solid rgba(255,255,255,0.08); box-shadow: 0 12px 30px rgba(22,35,44,0.12); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
      <div>
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
          <span style="font-size: 10px; font-family: 'IBM Plex Mono', monospace; font-weight: 800; text-transform: uppercase; background: var(--ember); color: white; padding: 2px 8px; border-radius: 4px;">MON PROGRAMME</span>
          <span style="font-size: 11px; color: rgba(255,255,255,0.7); font-weight: 600;">Semaine <strong>${program.week}</strong> sur ${program.totalWeeks || 8}</span>
        </div>
        <h1 style="font-size: 22px; font-family: 'Archivo Black', sans-serif; color: white; margin: 0 0 4px;">${escapeHtml(program.trackLabel || "Parcours Sur-Mesure")}</h1>
        <p style="font-size: 12px; color: rgba(255,255,255,0.75); margin: 0;">Validez vos séances de la semaine pour faire progresser votre cycle d'entraînement.</p>
      </div>

      <div style="display: flex; gap: 10px; flex-wrap: wrap;">
        <button class="btn btn-outline-dark" data-nav="quiz" style="color: white; border-color: rgba(255,255,255,0.3); font-size: 12px; font-weight: 700; padding: 8px 14px; background: rgba(255,255,255,0.05);">
          🔄 Ajuster mon niveau / quiz
        </button>
      </div>
    </div>

    <!-- 2. INSTRUCTIONS COACH SI DISPONIBLE -->
    ${coachInstructionsHtml}

    <!-- 3. AGENDA & SÉANCES DU CYCLE -->
    <div style="margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
      <h2 style="font-size: 18px; font-family: 'Archivo Black', sans-serif; color: var(--ink); margin: 0; display: flex; align-items: center; gap: 8px;">
        ${icon("calendar", 20, "var(--ember)")} Agenda des Séances De La Semaine
      </h2>
      <span style="font-size: 12px; font-weight: 700; color: var(--slate); background: white; padding: 4px 12px; border-radius: 20px; border: 1px solid var(--line);">
        Progression : <strong style="color: var(--moss);">${completedSessions} / ${totalSessions}</strong> complétées
      </span>
    </div>

    <div class="client-timeline" style="display: grid; gap: 18px;">
      ${program.sessions.map((s, idx) => {
        const sessionExercises = getExercisesForSession(s.name);
        const isNextRecommend = !s.done && program.sessions.findIndex(x => !x.done) === idx;

        return `
        <div class="client-tl-item ${s.done ? 'done' : ''}" style="background: white; border: ${isNextRecommend ? '2px solid var(--ember)' : '1px solid var(--line)'}; border-radius: 12px; padding: 20px 22px; box-shadow: ${isNextRecommend ? '0 8px 24px rgba(226,98,45,0.12)' : '0 4px 16px rgba(0,0,0,0.02)'}; display: flex; flex-direction: column; gap: 16px;">
          
          <div style="display: flex; align-items: center; justify-content: space-between; width: 100%; gap: 16px; flex-wrap: wrap;">
            <div style="display: flex; align-items: center; gap: 14px;">
              <div class="client-tl-icon" style="width: 44px; height: 44px; border-radius: 50%; background: ${s.done ? 'var(--moss-soft)' : (isNextRecommend ? 'var(--ember-soft)' : 'rgba(0,0,0,0.04)')}; color: ${s.done ? 'var(--moss)' : (isNextRecommend ? 'var(--ember)' : 'var(--slate)')}; display: flex; align-items: center; justify-content: center; font-weight: 800; flex-shrink: 0;">
                ${icon(s.done ? "check" : "play", 20)}
              </div>
              <div>
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 2px;">
                  <span style="font-size: 10px; font-family: 'IBM Plex Mono', monospace; font-weight: 800; text-transform: uppercase; color: ${s.done ? 'var(--moss)' : (isNextRecommend ? 'var(--ember)' : 'var(--slate)')};">
                    ${s.done ? '✓ VALIDÉE' : (isNextRecommend ? '⚡ PROCHAINE SÉANCE' : `SÉANCE #${idx + 1}`)}
                  </span>
                  <span style="font-size: 11px; color: var(--slate); font-weight: 600;">${s.exos} exercices · ${s.duree}</span>
                </div>
                <h3 style="font-size: 16px; font-weight: 800; color: var(--ink); margin: 0;">${escapeHtml(s.name)}</h3>
              </div>
            </div>

            <div>
              <button type="button" class="${s.done ? 'btn btn-outline-dark' : 'btn btn-primary'}" data-session-action="${s.done ? 'review' : 'start'}" data-session-name="${escapeHtml(s.name)}" style="font-weight: 800; font-size: 13px; padding: 10px 18px; ${!s.done ? 'background: var(--ember); border-color: var(--ember);' : ''}">
                ${s.done ? "Revoir la séance" : `Lancer la séance en direct ${icon("play-circle", 16)}`}
              </button>
            </div>
          </div>
          
          <details style="border-top: 1px dashed var(--line); padding-top: 12px;">
            <summary style="font-size: 12px; font-weight: 700; color: var(--slate); cursor: pointer; user-select: none; display: flex; align-items: center; gap: 6px;">
              ${icon("list", 14)} Consulter les ${sessionExercises.length} exercices prévus
            </summary>
            <div style="margin-top: 14px; display: grid; gap: 10px;">
              ${sessionExercises.map((exo, exoIdx) => `
                <div style="background: #f8fafc; border: 1px solid var(--line); border-radius: 8px; padding: 12px 14px; display: flex; flex-direction: column; gap: 6px;">
                  <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 10px; flex-wrap: wrap;">
                    <strong style="font-size: 13px; color: var(--ink); font-weight: 800;">${exoIdx + 1}. ${escapeHtml(exo.name)}</strong>
                    <span style="font-size: 11px; background: white; padding: 2px 8px; border-radius: 4px; border: 1px solid var(--line); color: var(--ink); font-weight: 700; font-family: monospace;">${escapeHtml(exo.detail)}</span>
                  </div>
                  <p style="font-size: 12px; color: var(--slate); margin: 0; line-height: 1.4;">${escapeHtml(exo.desc)}</p>
                  <a href="https://www.youtube.com/results?search_query=${encodeURIComponent(exo.name + ' exercice de musculation')}" target="_blank" rel="noopener noreferrer" style="font-size: 11px; font-weight: 700; color: white; background-color: #ff0000; padding: 3px 8px; border-radius: 4px; text-decoration: none; display: inline-flex; align-items: center; gap: 4px; width: fit-content; margin-top: 4px;">
                    ${icon("play-circle", 12)} Tuto Vidéo
                  </a>
                </div>
              `).join("")}
            </div>
          </details>

        </div>
      `}).join("")}
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
  const bodyMeasurements = profile.bodyMeasurements || {};
  const totalWeeks = program?.totalWeeks || 8;
  const week = program?.week || 1;
  const sessions = program?.sessions || [];
  const totalDone = sessions.filter(s => s.done).length;
  const firstName = profile.firstName || "Athlète";

  // --- CALCULS DE VARIATION DE POIDS ---
  const currentWeight = Number(profile.physique?.poids || profile.weight || (weightHistory.length > 0 ? weightHistory[weightHistory.length - 1].weight : 0));
  const startWeight = Number(weightHistory.length > 0 ? weightHistory[0].weight : currentWeight);
  
  let targetWeight = Number(profile.targetWeight || 0);
  if (!targetWeight && startWeight > 0) {
    if (profile.goal === "perte-poids") targetWeight = Math.round(startWeight * 0.90 * 10) / 10;
    else if (profile.goal === "musculation") targetWeight = Math.round(startWeight * 1.06 * 10) / 10;
    else targetWeight = startWeight;
  }

  const weightDiff = (currentWeight && startWeight) ? Math.round((currentWeight - startWeight) * 10) / 10 : 0;
  const weightTrendIcon = weightDiff < 0 ? "📉" : (weightDiff > 0 ? "📈" : "⚖️");

  // --- CALCULS IMC & SANTÉ ---
  const height = Number(profile.physique?.taille || profile.height || 0);
  let imc = null;
  let imcStatus = "En attente";
  let imcColor = "var(--slate)";
  if (currentWeight > 0 && height > 0) {
    const heightMeters = height / 100;
    imc = (currentWeight / (heightMeters * heightMeters)).toFixed(1);
    if (imc < 18.5) { imcStatus = "Insuffisance"; imcColor = "#3b82f6"; }
    else if (imc < 25) { imcStatus = "Poids Athlétique Idéal"; imcColor = "var(--moss)"; }
    else if (imc < 30) { imcStatus = "Surpoids Modéré"; imcColor = "#f59e0b"; }
    else { imcStatus = "Obésité"; imcColor = "var(--ember)"; }
  }

  // --- RENDU DU GRAPHIQUE SVG HAUTE DÉFINITION ---
  let svgChartHtml = "";
  if (weightHistory && weightHistory.length > 0) {
    const entries = weightHistory.map(entry => ({
      date: entry.date,
      weight: parseFloat(entry.weight)
    })).filter(e => !isNaN(e.weight));

    if (entries.length > 0) {
      const weights = entries.map(e => e.weight);
      if (targetWeight > 0) weights.push(targetWeight);

      const minW = Math.max(0, Math.min(...weights) - 1.5);
      const maxW = Math.max(...weights) + 1.5;
      const diffW = maxW - minW === 0 ? 1 : maxW - minW;

      const chartW = 600;
      const chartH = 200;
      const paddingLeft = 45;
      const paddingRight = 35;
      const paddingTop = 30;
      const paddingBottom = 40;
      
      const plotW = chartW - paddingLeft - paddingRight;
      const plotH = chartH - paddingTop - paddingBottom;

      const points = entries.map((e, idx) => {
        const x = paddingLeft + (entries.length > 1 ? (idx / (entries.length - 1)) * plotW : plotW / 2);
        const y = chartH - paddingBottom - ((e.weight - minW) / diffW) * plotH;
        return { x, y, weight: e.weight, date: e.date };
      });

      let pathD = "";
      let areaD = "";
      if (points.length > 1) {
        pathD = `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(" ");
        areaD = `${pathD} L ${points[points.length - 1].x} ${chartH - paddingBottom} L ${points[0].x} ${chartH - paddingBottom} Z`;
      } else if (points.length === 1) {
        areaD = `M ${points[0].x - 20} ${points[0].y} L ${points[0].x + 20} ${points[0].y} L ${points[0].x + 20} ${chartH - paddingBottom} L ${points[0].x - 20} ${chartH - paddingBottom} Z`;
      }

      // Ligne horizontale pour le poids cible
      let targetY = null;
      if (targetWeight > 0 && targetWeight >= minW && targetWeight <= maxW) {
        targetY = chartH - paddingBottom - ((targetWeight - minW) / diffW) * plotH;
      }

      svgChartHtml = `
        <div class="client-card" style="background: white; margin-bottom: 28px; border: 1px solid var(--line); border-radius: 12px; padding: 24px;">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; margin-bottom: 16px;">
            <div>
              <h3 class="client-card-title" style="margin: 0 0 4px; display: flex; align-items: center; gap: 8px;">
                ${icon("trending-up", 20, "var(--moss)")} Curve d'Évolution Métabolique
              </h3>
              <p style="font-size: 13px; color: var(--slate); margin: 0;">Suivi temporel de votre masse corporelle (Poids initial: ${startWeight || '--'} kg)</p>
            </div>
            
            <div style="display: flex; align-items: center; gap: 14px; background: rgba(0,0,0,0.02); padding: 8px 14px; border-radius: 8px; border: 1px solid var(--line);">
              <div style="display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 700; color: var(--moss);">
                <span style="width: 10px; height: 10px; border-radius: 50%; background: var(--moss); display: inline-block;"></span> Mesures
              </div>
              ${targetY !== null ? `
              <div style="display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 700; color: var(--ember);">
                <span style="width: 10px; height: 2px; background: var(--ember); display: inline-block;"></span> Objectif (${targetWeight} kg)
              </div>
              ` : ''}
            </div>
          </div>
          
          <div style="position: relative; width: 100%; overflow-x: auto;">
            <svg width="100%" height="${chartH}" viewBox="0 0 ${chartW} ${chartH}" style="min-width: 500px; display: block; overflow: visible;">
              <defs>
                <linearGradient id="weightAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="var(--moss)" stop-opacity="0.25"/>
                  <stop offset="100%" stop-color="var(--moss)" stop-opacity="0.0"/>
                </linearGradient>
              </defs>

              <!-- Lignes de grille d'arrière-plan -->
              <line x1="${paddingLeft}" y1="${paddingTop}" x2="${chartW - paddingRight}" y2="${paddingTop}" stroke="rgba(0,0,0,0.05)" stroke-dasharray="4" stroke-width="1" />
              <line x1="${paddingLeft}" y1="${paddingTop + plotH/2}" x2="${chartW - paddingRight}" y2="${paddingTop + plotH/2}" stroke="rgba(0,0,0,0.05)" stroke-dasharray="4" stroke-width="1" />
              <line x1="${paddingLeft}" y1="${chartH - paddingBottom}" x2="${chartW - paddingRight}" y2="${chartH - paddingBottom}" stroke="rgba(0,0,0,0.12)" stroke-width="1" />
              
              <!-- Ligne Cible (Dashed) -->
              ${targetY !== null ? `
                <line x1="${paddingLeft}" y1="${targetY}" x2="${chartW - paddingRight}" y2="${targetY}" stroke="var(--ember)" stroke-dasharray="6,4" stroke-width="1.5" />
                <text x="${chartW - paddingRight + 4}" y="${targetY + 4}" font-family="inherit" font-size="9" font-weight="800" fill="var(--ember)">${targetWeight}kg</text>
              ` : ''}

              <!-- Remplissage Gradient de la courbe -->
              ${areaD ? `<path d="${areaD}" fill="url(#weightAreaGrad)" />` : ""}
              
              <!-- Trait principal de la courbe -->
              ${pathD ? `<path d="${pathD}" fill="none" stroke="var(--moss)" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" />` : ""}
              
              <!-- Points de pesée et étiquettes -->
              ${points.map(p => `
                <circle cx="${p.x}" cy="${p.y}" r="6" fill="var(--moss)" stroke="white" stroke-width="2.5" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.15));" />
                <text x="${p.x}" y="${p.y - 12}" font-family="inherit" font-size="11" font-weight="800" fill="var(--ink)" text-anchor="middle">${p.weight} kg</text>
                <text x="${p.x}" y="${chartH - 14}" font-family="inherit" font-size="10" font-weight="600" fill="var(--slate)" text-anchor="middle">${p.date}</text>
              `).join("")}
            </svg>
          </div>
        </div>
      `;
    }
  } else {
    svgChartHtml = `
      <div class="client-card" style="background: white; border: 1px dashed var(--line); text-align: center; padding: 36px 20px; margin-bottom: 28px; border-radius: 12px;">
        <span style="font-size: 36px; display: block; margin-bottom: 12px;">📊</span>
        <h3 style="font-size: 16px; font-weight: 800; color: var(--ink); margin: 0 0 6px;">Activez votre suivi de poids dynamique</h3>
        <p style="font-size: 13px; color: var(--slate); margin: 0 0 18px; max-width: 440px; margin-left: auto; margin-right: auto; line-height: 1.5;">
          Enregistrez votre première pesée pour générer instantanément votre courbe de transformation métabolique et suivre votre évolution semaine après semaine.
        </p>
        <button class="btn btn-primary" id="btn-quick-log-weight" style="font-size: 13px; padding: 10px 20px; background: var(--ember); border-color: var(--ember); font-weight: 700;">
          ${icon("plus-circle", 16)} Enregistrer ma première pesée
        </button>
      </div>
    `;
  }

  // --- TABLEAU DES MENSURATIONS CORPORELLES ---
  const waist = bodyMeasurements.waist || profile.physique?.waist || "--";
  const chest = bodyMeasurements.chest || profile.physique?.chest || "--";
  const arms = bodyMeasurements.arms || profile.physique?.arms || "--";
  const hips = bodyMeasurements.hips || profile.physique?.hips || "--";
  const thighs = bodyMeasurements.thighs || profile.physique?.thighs || "--";

  const measurementsTableHtml = `
    <div class="client-card" style="background: white; border: 1px solid var(--line); border-radius: 12px; padding: 24px; margin-bottom: 28px;">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; margin-bottom: 20px;">
        <div>
          <h3 class="client-card-title" style="margin: 0 0 4px; display: flex; align-items: center; gap: 8px;">
            ${icon("activity", 20, "var(--ember)")} Relevé des Mensurations Corporelles
          </h3>
          <p style="font-size: 13px; color: var(--slate); margin: 0;">Suivez la recomposition centimétrique de votre silhouette au-delà de la balance.</p>
        </div>
        <button class="btn btn-outline-dark" id="btn-open-measurements-modal" style="font-size: 12px; font-weight: 700; padding: 8px 14px; display: inline-flex; align-items: center; gap: 6px;">
          ${icon("edit-3", 14)} Mettre à jour mes mensurations
        </button>
      </div>

      <div style="overflow-x: auto;">
        <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 13px;">
          <thead>
            <tr style="border-bottom: 2px solid var(--line); color: var(--slate); font-family: 'IBM Plex Mono', monospace; font-size: 11px; text-transform: uppercase;">
              <th style="padding: 10px 12px; font-weight: 700;">Zone Corporelle</th>
              <th style="padding: 10px 12px; font-weight: 700;">Dernier Relevé</th>
              <th style="padding: 10px 12px; font-weight: 700;">Statut & Objectif</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom: 1px solid var(--chalk-soft);">
              <td style="padding: 12px; font-weight: 700; color: var(--ink); display: flex; align-items: center; gap: 8px;">
                📏 Tour de Taille (Nombril)
              </td>
              <td style="padding: 12px; font-weight: 800; font-family: 'Archivo Black', sans-serif; color: var(--ink);">${waist !== "--" ? waist + " cm" : "--"}</td>
              <td style="padding: 12px; color: var(--slate); font-size: 12px;">Cible clé pour l'indice de masse grasse abdominale</td>
            </tr>
            <tr style="border-bottom: 1px solid var(--chalk-soft);">
              <td style="padding: 12px; font-weight: 700; color: var(--ink); display: flex; align-items: center; gap: 8px;">
                📐 Tour de Poitrine (Pectoraux)
              </td>
              <td style="padding: 12px; font-weight: 800; font-family: 'Archivo Black', sans-serif; color: var(--ink);">${chest !== "--" ? chest + " cm" : "--"}</td>
              <td style="padding: 12px; color: var(--slate); font-size: 12px;">Indicateur de développement du haut du corps</td>
            </tr>
            <tr style="border-bottom: 1px solid var(--chalk-soft);">
              <td style="padding: 12px; font-weight: 700; color: var(--ink); display: flex; align-items: center; gap: 8px;">
                💪 Tour de Bras (Biceps contracté)
              </td>
              <td style="padding: 12px; font-weight: 800; font-family: 'Archivo Black', sans-serif; color: var(--ink);">${arms !== "--" ? arms + " cm" : "--"}</td>
              <td style="padding: 12px; color: var(--slate); font-size: 12px;">Densité musculaire des membres supérieurs</td>
            </tr>
            <tr style="border-bottom: 1px solid var(--chalk-soft);">
              <td style="padding: 12px; font-weight: 700; color: var(--ink); display: flex; align-items: center; gap: 8px;">
                🦵 Tour de Cuisses
              </td>
              <td style="padding: 12px; font-weight: 800; font-family: 'Archivo Black', sans-serif; color: var(--ink);">${thighs !== "--" ? thighs + " cm" : "--"}</td>
              <td style="padding: 12px; color: var(--slate); font-size: 12px;">Puissance et volume des quadriceps et ischios</td>
            </tr>
            <tr>
              <td style="padding: 12px; font-weight: 700; color: var(--ink); display: flex; align-items: center; gap: 8px;">
                🍑 Tour de Hanches / Fessiers
              </td>
              <td style="padding: 12px; font-weight: 800; font-family: 'Archivo Black', sans-serif; color: var(--ink);">${hips !== "--" ? hips + " cm" : "--"}</td>
              <td style="padding: 12px; color: var(--slate); font-size: 12px;">Soutien de la chaîne postérieure</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `;

  // --- BILAN DYNAMIQUE DU COACH ABDOU (NON CODÉ EN DUR) ---
  const coachBilan = profile.coachBilan || profile.coachNotes || null;
  let coachBilanText = "";
  let coachBilanDate = "";

  if (coachBilan) {
    if (typeof coachBilan === "object") {
      coachBilanText = coachBilan.text || "";
      coachBilanDate = coachBilan.dateStr || (coachBilan.updatedAt ? new Date(coachBilan.updatedAt).toLocaleDateString('fr-FR') : "");
    } else if (typeof coachBilan === "string") {
      coachBilanText = coachBilan;
    }
  }

  let coachBilanCardHtml = "";
  if (coachBilanText && coachBilanText.trim().length > 0) {
    coachBilanCardHtml = `
      <div class="client-card" style="background: linear-gradient(135deg, #ffffff 0%, rgba(60,90,70,0.03) 100%); border: 1.5px solid var(--moss); border-radius: 12px; padding: 24px; display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 12px; flex-wrap: wrap;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <div style="width: 38px; height: 38px; border-radius: 50%; background: var(--ink); color: white; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 14px; border: 2px solid var(--ember);">
                AB
              </div>
              <div>
                <h3 style="font-size: 15px; font-weight: 800; color: var(--ink); margin: 0;">Analyse & Bilan de Coach Abdou BAKARI</h3>
                <span style="font-size: 11px; color: var(--moss); font-weight: 700;">Conseil Personnalisé</span>
              </div>
            </div>
            ${coachBilanDate ? `<span style="font-size: 11px; color: var(--slate); font-weight: 600; background: rgba(0,0,0,0.03); padding: 3px 8px; border-radius: 12px;">🗓️ ${escapeHtml(coachBilanDate)}</span>` : ''}
          </div>

          <p style="font-size: 13px; color: var(--ink); line-height: 1.6; margin: 0 0 14px; font-style: italic; background: white; padding: 14px; border-radius: 8px; border: 1px solid var(--line);">
            "${escapeHtml(coachBilanText)}"
          </p>
        </div>

        <div style="margin-top: 12px;">
          <a href="https://wa.me/2290191720596?text=${encodeURIComponent('Bonjour Coach Abdou, au sujet de mon bilan : ' + coachBilanText.substring(0, 60) + '...')}" target="_blank" rel="noopener noreferrer" class="btn btn-primary" style="width: 100%; justify-content: center; font-weight: 700; font-size: 13px; padding: 12px; text-decoration: none; display: inline-flex; align-items: center; gap: 8px; background: #25D366; border-color: #25D366; color: white;">
            💬 Échanger de ce bilan avec Coach Abdou sur WhatsApp
          </a>
        </div>
      </div>
    `;
  }

  return `
  <div class="wrap client-page" style="padding-bottom: 60px;">
    <!-- HEADER ET PERFORMANCE BANNER -->
    <div class="client-header" style="display: flex; justify-content: space-between; align-items: flex-start; gap: 20px; flex-wrap: wrap;">
      <div>
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
          <span class="client-eyebrow" style="margin: 0; color: var(--ember); font-weight: 800; letter-spacing: 0.1em;">
            ESPACE PERFORMANCE & TRANSFORMATION
          </span>
          <span style="font-size: 10px; background: rgba(226, 98, 45, 0.12); color: var(--ember); border: 1px solid rgba(226, 98, 45, 0.25); padding: 2px 8px; border-radius: 20px; font-weight: 700;">
            MONPROGRAMMEFIT
          </span>
        </div>
        <h1 class="client-title" style="margin-bottom: 8px;">Ma Progression & Bilan d'Évolution</h1>
        <p class="client-subtitle" style="max-width: 680px;">
          Visualisez l'évolution de votre corps, vos variations de poids et l'impact de chaque séance sous le contrôle de Coach Abdou BAKARI.
        </p>
      </div>

      <!-- BOUTONS D'ACTIONS RAPIDES -->
      <div style="display: flex; gap: 10px; flex-wrap: wrap; align-items: center;">
        <button class="btn btn-primary" id="btn-quick-log-weight" style="font-size: 13px; font-weight: 700; padding: 10px 16px; display: inline-flex; align-items: center; gap: 8px; background: var(--ember); border-color: var(--ember);">
          ${icon("plus-circle", 16)} Loguer ma pesée
        </button>
        <button class="btn btn-outline-dark" id="btn-open-measurements-modal" style="font-size: 13px; font-weight: 600; padding: 10px 16px; display: inline-flex; align-items: center; gap: 8px;">
          ${icon("activity", 16)} Relever mensurations
        </button>
      </div>
    </div>

    <!-- BANNIÈRE DE STATUT DU COACH -->
    <div style="background: linear-gradient(135deg, var(--ink) 0%, #20333d 100%); color: white; border-radius: 12px; padding: 24px 28px; margin-bottom: 32px; box-shadow: 0 12px 30px rgba(22,35,44,0.12); position: relative; overflow: hidden; border: 1px solid rgba(255,255,255,0.1);">
      <div style="position: absolute; right: -20px; top: -30px; opacity: 0.05; font-size: 160px; pointer-events: none; color: white;">
        ${icon("award", 160)}
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 20px; position: relative; z-index: 2;">
        <div>
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 6px;">
            <span style="font-size: 10px; font-family: 'IBM Plex Mono', monospace; text-transform: uppercase; background: var(--moss); color: white; padding: 3px 10px; border-radius: 4px; font-weight: 800;">
              Phase Active : ${profile.goal === 'perte-poids' ? 'Déficit Calorigène & Sèche' : profile.goal === 'musculation' ? 'Hypertrophie & Volume' : 'Recomposition & Forme'}
            </span>
            <span style="font-size: 12px; color: rgba(255,255,255,0.7); font-weight: 600;">
              Athlète : <strong style="color: white;">${escapeHtml(firstName)}</strong>
            </span>
          </div>
          <h2 style="font-size: 22px; font-family: 'Archivo Black', sans-serif; margin: 0 0 6px; color: white;">
            Série en cours : Semaine ${week} sur ${totalWeeks}
          </h2>
          <p style="font-size: 13px; color: rgba(255,255,255,0.8); margin: 0; max-width: 580px; line-height: 1.5;">
            ${totalDone > 0 ? `Vous avez complété <strong>${totalDone} séance(s)</strong>. Le maintien de votre régularité garantit les meilleurs résultats physiques.` : `Démarrage de votre cycle. Effectuez votre première séance pour enclencher les premiers indicateurs de performance.`}
          </p>
        </div>

        <div style="display: flex; gap: 16px; align-items: center; background: rgba(255,255,255,0.06); padding: 12px 20px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.12);">
          <div style="text-align: center;">
            <div style="font-size: 10px; text-transform: uppercase; color: rgba(255,255,255,0.6); font-weight: 700;">Progression globale</div>
            <div style="font-size: 22px; font-family: 'Archivo Black', sans-serif; color: #4ade80; margin-top: 2px;">
              ${Math.round((totalDone / Math.max(1, sessions.length)) * 100)}%
            </div>
          </div>
          <div style="width: 1px; height: 32px; background: rgba(255,255,255,0.15);"></div>
          <div style="text-align: center;">
            <div style="font-size: 10px; text-transform: uppercase; color: rgba(255,255,255,0.6); font-weight: 700;">Bilan Coach</div>
            <div style="font-size: 13px; font-weight: 700; color: white; margin-top: 4px; display: flex; align-items: center; gap: 4px;">
              ${icon("check-circle", 14, "#4ade80")} À jour
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- METRICS GRID - 4 BENTO CARDS -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 18px; margin-bottom: 32px;">
      <!-- CARD 1: Poids Actuel -->
      <div class="client-card" style="padding: 20px; background: white; border: 1px solid var(--line); border-radius: 10px; display: flex; flex-direction: column; justify-content: space-between;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
          <span style="font-size: 11px; font-family: 'IBM Plex Mono', monospace; text-transform: uppercase; color: var(--slate); font-weight: 700;">Poids & Tendance</span>
          <div style="background: rgba(226, 98, 45, 0.1); color: var(--ember); width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
            ${icon("scale", 18)}
          </div>
        </div>
        <div>
          <div style="display: flex; align-items: baseline; gap: 8px;">
            <span style="font-size: 32px; font-family: 'Archivo Black', sans-serif; color: var(--ink); line-height: 1;">${currentWeight ? currentWeight + ' <span style="font-size:16px;color:var(--slate);">kg</span>' : '--'}</span>
            ${weightDiff !== 0 ? `<span style="font-size: 12px; font-weight: 800; color: ${weightDiff < 0 ? 'var(--moss)' : 'var(--ember)'}; background: ${weightDiff < 0 ? 'rgba(60,90,70,0.1)' : 'rgba(226,98,45,0.1)'}; padding: 2px 8px; border-radius: 12px;">${weightDiff > 0 ? '+' : ''}${weightDiff} kg ${weightTrendIcon}</span>` : ''}
          </div>
          <p style="font-size: 12px; color: var(--slate); margin: 6px 0 0; line-height: 1.4;">
            Poids de départ : <strong>${startWeight ? startWeight + ' kg' : '--'}</strong>
          </p>
        </div>
      </div>

      <!-- CARD 2: Assiduité Séances -->
      <div class="client-card" style="padding: 20px; background: white; border: 1px solid var(--line); border-radius: 10px; display: flex; flex-direction: column; justify-content: space-between;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
          <span style="font-size: 11px; font-family: 'IBM Plex Mono', monospace; text-transform: uppercase; color: var(--slate); font-weight: 700;">Discipline Séances</span>
          <div style="background: rgba(60, 90, 70, 0.1); color: var(--moss); width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
            ${icon("dumbbell", 18)}
          </div>
        </div>
        <div>
          <div style="font-size: 32px; font-family: 'Archivo Black', sans-serif; color: var(--ink); line-height: 1;">
            ${totalDone} <span style="font-size:16px;color:var(--slate);">/ ${sessions.length}</span>
          </div>
          <div class="client-pb-bar" style="margin-top: 10px; height: 6px; background: var(--chalk-soft);">
            <div class="client-pb-fill" style="width: ${Math.round((totalDone / Math.max(1, sessions.length)) * 100)}%;"></div>
          </div>
        </div>
      </div>

      <!-- CARD 3: Hydratation -->
      <div class="client-card" style="padding: 20px; background: white; border: 1px solid var(--line); border-radius: 10px; display: flex; flex-direction: column; justify-content: space-between;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
          <span style="font-size: 11px; font-family: 'IBM Plex Mono', monospace; text-transform: uppercase; color: var(--slate); font-weight: 700;">Eau du jour</span>
          <div style="background: rgba(37, 99, 235, 0.1); color: #2563eb; width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
            ${icon("droplet", 18)}
          </div>
        </div>
        <div>
          <div style="font-size: 32px; font-family: 'Archivo Black', sans-serif; color: var(--ink); line-height: 1;">
            ${profile.dailyWaterLog?.amount || 0} <span style="font-size:14px;color:var(--slate);">/ 2500 ml</span>
          </div>
          <p style="font-size: 12px; color: var(--slate); margin: 6px 0 0; line-height: 1.4;">
            ${Math.round(((profile.dailyWaterLog?.amount || 0) / 2500) * 100)}% de la cible journalière
          </p>
        </div>
      </div>

      <!-- CARD 4: IMC & Métabolisme -->
      <div class="client-card" style="padding: 20px; background: white; border: 1px solid var(--line); border-radius: 10px; display: flex; flex-direction: column; justify-content: space-between;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
          <span style="font-size: 11px; font-family: 'IBM Plex Mono', monospace; text-transform: uppercase; color: var(--slate); font-weight: 700;">Diagnostic IMC</span>
          <div style="background: rgba(16, 185, 129, 0.1); color: #10b981; width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
            ${icon("activity", 18)}
          </div>
        </div>
        <div>
          <div style="font-size: 32px; font-family: 'Archivo Black', sans-serif; color: var(--ink); line-height: 1;">
            ${imc || '--'}
          </div>
          <p style="font-size: 12px; color: ${imcColor}; font-weight: 700; margin: 6px 0 0; line-height: 1.4;">
            ${imc ? imcStatus : 'Renseignez votre taille'}
          </p>
        </div>
      </div>
    </div>

    <!-- GRAPHIQUE SVG DU POIDS -->
    ${svgChartHtml}

    <!-- TABLEAU DES MENSURATIONS CORPORELLES -->
    ${measurementsTableHtml}

    <!-- COACHING NOTE & BILAN HUB -->
    ${coachBilanCardHtml ? `<div style="margin-bottom: 32px;">${coachBilanCardHtml}</div>` : ''}

    <!-- TIMELINE ET HISTORIQUE DES SEMAINES DE SÉANCES -->
    <div class="client-card" style="background: white; border: 1px solid var(--line); border-radius: 12px; padding: 24px;">
      <h3 class="client-card-title" style="margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">
        ${icon("calendar-days", 20, "var(--moss)")} Avancement du Programme par Semaine
      </h3>
      <p style="font-size: 13px; color: var(--slate); margin-bottom: 20px;">
        Chaque semaine validée consolide votre niveau de forme et votre posture.
      </p>

      <div style="display: grid; gap: 14px;">
        ${history.length > 0 ? history.map((h, index) => {
          const isCurrent = (index + 1) === week;
          const pct = Math.round((h.done / h.total) * 100);
          return `
          <div style="padding: 16px; border: 1px solid ${isCurrent ? 'var(--moss)' : 'var(--line)'}; border-radius: 8px; background: ${isCurrent ? 'rgba(60,90,70,0.02)' : 'rgba(0,0,0,0.01)'}; position: relative;">
            ${isCurrent ? `<span style="position: absolute; right: 14px; top: 14px; font-size: 9px; font-weight: 800; background: var(--moss); color: white; padding: 3px 8px; border-radius: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Semaine active</span>` : ""}
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <strong style="font-size: 15px; color: var(--ink); font-family: 'Archivo Black', sans-serif;">${escapeHtml(h.name)}</strong>
              <span style="font-size: 13px; font-weight: 700; color: var(--slate);">${h.done} / ${h.total} Séances</span>
            </div>
            <div class="client-pb-bar" style="height: 8px; background: rgba(0,0,0,0.06); border-radius: 4px; overflow: hidden;">
              <div class="client-pb-fill" style="width: ${pct}%; background: ${pct === 100 ? 'var(--moss)' : 'var(--ember)'}; height: 100%; transition: width 0.3s;"></div>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px; font-size: 12px;">
              <span style="color: var(--slate); font-weight: 600;">${pct}% des objectifs hebdomadaires validés</span>
              ${pct === 100 ? `<span style="color: var(--moss); font-weight: 800; display: flex; align-items: center; gap: 4px;">🏆 Semaine complétée avec succès !</span>` : ""}
            </div>
          </div>`;
        }).join("") : `
          <div style="text-align: center; padding: 24px; color: var(--slate); font-size: 13px;">
            Aucune semaine archivée. Lancez votre première séance depuis votre programme pour débuter votre journal !
          </div>
        `}
      </div>
    </div>

  </div>`;
}
