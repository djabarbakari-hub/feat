/** Helpers for the client progress / suivi screen. */

export const WATER_TARGET = 2500;

export function phaseLabel(goal) {
  if (goal === "perte-poids") return "Déficit & Sèche";
  if (goal === "musculation" || goal === "prise-muscle") return "Hypertrophie & Volume";
  return "Recomposition & Forme";
}

export function computeWeightStats(profile) {
  const weightHistory = profile?.weightHistory || [];
  const currentWeight = Number(
    profile?.physique?.poids
    || profile?.weight
    || (weightHistory.length > 0 ? weightHistory[weightHistory.length - 1].weight : 0),
  ) || 0;
  const startWeight = Number(
    weightHistory.length > 0 ? weightHistory[0].weight : currentWeight,
  ) || 0;

  let targetWeight = Number(profile?.targetWeight || 0);
  if (!targetWeight && startWeight > 0) {
    if (profile?.goal === "perte-poids") targetWeight = Math.round(startWeight * 0.9 * 10) / 10;
    else if (profile?.goal === "musculation" || profile?.goal === "prise-muscle") {
      targetWeight = Math.round(startWeight * 1.06 * 10) / 10;
    } else {
      targetWeight = startWeight;
    }
  }

  const weightDiff = currentWeight && startWeight
    ? Math.round((currentWeight - startWeight) * 10) / 10
    : 0;

  return { weightHistory, currentWeight, startWeight, targetWeight, weightDiff };
}

export function computeImc(weightKg, heightCm) {
  const w = Number(weightKg);
  const h = Number(heightCm);
  if (!(w > 0 && h > 0)) return null;
  const value = w / ((h / 100) ** 2);
  let status = "En attente";
  let color = "var(--slate)";
  if (value < 18.5) {
    status = "Insuffisance";
    color = "#3b82f6";
  } else if (value < 25) {
    status = "Poids idéal";
    color = "var(--moss)";
  } else if (value < 30) {
    status = "Surpoids";
    color = "#f59e0b";
  } else {
    status = "Obésité";
    color = "var(--ember)";
  }
  return { value: Number(value.toFixed(1)), status, color };
}

export function buildWeightChart(weightHistory, targetWeight = 0) {
  const entries = (weightHistory || [])
    .map((entry) => ({ date: entry.date, weight: parseFloat(entry.weight) }))
    .filter((e) => !Number.isNaN(e.weight));

  if (!entries.length) return null;

  const weights = entries.map((e) => e.weight);
  if (targetWeight > 0) weights.push(targetWeight);

  const minW = Math.max(0, Math.min(...weights) - 1.5);
  const maxW = Math.max(...weights) + 1.5;
  const diffW = maxW - minW === 0 ? 1 : maxW - minW;

  const chartW = 600;
  const chartH = 200;
  const paddingLeft = 36;
  const paddingRight = 40;
  const paddingTop = 28;
  const paddingBottom = 36;
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
    pathD = `M ${points[0].x} ${points[0].y} ${points.slice(1).map((p) => `L ${p.x} ${p.y}`).join(" ")}`;
    areaD = `${pathD} L ${points[points.length - 1].x} ${chartH - paddingBottom} L ${points[0].x} ${chartH - paddingBottom} Z`;
  }

  let targetY = null;
  if (targetWeight > 0 && targetWeight >= minW && targetWeight <= maxW) {
    targetY = chartH - paddingBottom - ((targetWeight - minW) / diffW) * plotH;
  }

  return {
    chartW,
    chartH,
    paddingLeft,
    paddingRight,
    paddingTop,
    paddingBottom,
    plotH,
    points,
    pathD,
    areaD,
    targetY,
    targetWeight,
  };
}

export function parseCoachBilan(profile) {
  const coachBilan = profile?.coachBilan || profile?.coachNotes || null;
  if (!coachBilan) return null;
  if (typeof coachBilan === "string") {
    const text = coachBilan.trim();
    return text ? { text, dateStr: "" } : null;
  }
  const text = (coachBilan.text || "").trim();
  if (!text) return null;
  const dateStr = coachBilan.dateStr
    || (coachBilan.updatedAt ? new Date(coachBilan.updatedAt).toLocaleDateString("fr-FR") : "");
  return { text, dateStr };
}

export function getBodyMeasurements(profile) {
  const m = profile?.bodyMeasurements || {};
  const p = profile?.physique || {};
  return {
    waist: m.waist ?? p.waist ?? null,
    chest: m.chest ?? p.chest ?? null,
    arms: m.arms ?? p.arms ?? null,
    hips: m.hips ?? p.hips ?? null,
    thighs: m.thighs ?? p.thighs ?? null,
    updatedAt: m.updatedAt || null,
  };
}

export function formatCm(value) {
  if (value === null || value === undefined || value === "" || value === "--") return "--";
  return `${value} cm`;
}
