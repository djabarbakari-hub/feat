/* ==========================================================
   modules/exercise-visuals.js — Illustrations d'exercices in-app.
   Photos : free-exercise-db (GitHub). GIFs animés : ExerciseDB (AscendAPI).
   Objectif : montrer le geste sans envoyer l'utilisateur sur YouTube.
   ========================================================== */

import catalog from "./data/free-exercise-catalog.json";
import gifCatalog from "./data/exercisedb-gifs.json";

const PHOTO_BASE = "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/";
const GIF_BASE = "https://static.exercisedb.dev/media/";

/** Alias FR / variantes → nom exact dans free-exercise-db (photos) */
const FR_TO_EN = [
  [/goblet\s*squat/i, "Goblet Squat"],
  [/mountain\s*climber/i, "Mountain Climbers"],
  [/bulgarian|split\s*squat/i, "Split Squats"],
  [/hip\s*thrust/i, "Barbell Hip Thrust"],
  [/pont\s*fessier|glute\s*bridge/i, "Butt Lift (Bridge)"],
  [/soulev[eé]\s*de\s*terre\s*roumain|romanian/i, "Romanian Deadlift"],
  [/soulev[eé]\s*de\s*terre/i, "Stiff-Legged Dumbbell Deadlift"],
  [/d[eé]velopp[eé]\s*couch[eé].*sol|floor\s*press/i, "Dumbbell Floor Press"],
  [/d[eé]velopp[eé]\s*couch[eé].*barre|bench\s*press.*barre/i, "Barbell Bench Press - Medium Grip"],
  [/d[eé]velopp[eé]\s*couch[eé]|dumbbell\s*bench/i, "Dumbbell Bench Press"],
  [/d[eé]velopp[eé]\s*inclin[eé].*halt/i, "Incline Dumbbell Press"],
  [/d[eé]velopp[eé]\s*inclin[eé].*barre/i, "Barbell Incline Bench Press - Medium Grip"],
  [/d[eé]velopp[eé]\s*inclin[eé]/i, "Incline Dumbbell Press"],
  [/d[eé]velopp[eé]\s*(militair|epaule|épaule)|shoulder\s*press|overhead\s*press/i, "Dumbbell Shoulder Press"],
  [/d[eé]velopp[eé].*machine|machine.*poitrine|chest\s*press/i, "Machine Bench Press"],
  [/[eé]cart[eé]|dumbbell\s*fly|pec\s*deck|butterfly/i, "Dumbbell Flyes"],
  [/pull[\s-]?over/i, "Bent-Arm Dumbbell Pullover"],
  [/face\s*pull/i, "Face Pull"],
  [/rowing.*un\s*bras|rowing\s*unilat|one[\s-]?arm.*row/i, "One-Arm Dumbbell Row"],
  [/rowing\s*assis|cable\s*row|tirage\s*horizontal/i, "Seated Cable Rows"],
  [/rowing|bent\s*over\s*row/i, "Bent Over Two-Dumbbell Row"],
  [/tirage\s*vertical|lat\s*pulldown|traction/i, "Wide-Grip Lat Pulldown"],
  [/[eé]l[eé]vation(s)?\s*lat[eé]rale|lateral\s*raise/i, "Side Lateral Raise"],
  [/oiseau|rear\s*delt/i, "Bent Over Dumbbell Rear Delt Raise With Head On Bench"],
  [/shrug|haussement/i, "Dumbbell Shrug"],
  [/curl\s*marteau|hammer\s*curl/i, "Hammer Curls"],
  [/curl\s*pupitre|preacher/i, "Preacher Curl"],
  [/curl\s*(barre\s*)?ez|ez[\s-]?bar\s*curl/i, "EZ-Bar Curl"],
  [/curl/i, "Dumbbell Bicep Curl"],
  [/skull|barre\s*au\s*front/i, "Lying Triceps Press"],
  [/kickback/i, "Tricep Dumbbell Kickback"],
  [/extension\s*triceps|pushdown|pushdown/i, "Triceps Pushdown - Rope Attachment"],
  [/pompes?\s*diamant|diamond/i, "Diamond Pushups"],
  [/pike\s*push/i, "Pike Pushups"],
  [/pompes?\s*prise\s*serr|close[\s-]?grip\s*push/i, "Close-Grip Push-Up"],
  [/pompes?|push[\s-]?up/i, "Pushups"],
  [/dips?/i, "Bench Dips"],
  [/presse\s*[aà]\s*cuisses|leg\s*press/i, "Leg Press"],
  [/leg\s*extension/i, "Leg Extensions"],
  [/leg\s*curl/i, "Lying Leg Curls"],
  [/fentes?\s*(march|walk)/i, "Bodyweight Walking Lunge"],
  [/fentes?\s*arri[eè]re|reverse\s*lunge/i, "Dumbbell Rear Lunge"],
  [/fentes?/i, "Dumbbell Lunges"],
  [/squats?\s*saut|jump\s*squat/i, "Jump Squat"],
  [/goblet|squat/i, "Bodyweight Squat"],
  [/mollet|calf/i, "Standing Calf Raises"],
  [/kettlebell\s*swing|swing\s*halt/i, "One-Arm Kettlebell Swings"],
  [/box\s*jump/i, "Box Jump (Multiple Response)"],
  [/jumping\s*jack/i, "Jumping Jacks"],
  [/high\s*knee|mont[eé]es?\s*de\s*genoux/i, "Mountain Climbers"],
  [/burpee/i, "Burpee"],
  [/gainage\s*lat|side\s*plank|planche\s*lat/i, "Side Bridge"],
  [/gainage|planche|plank|hollow/i, "Plank"],
  [/superman/i, "Superman"],
  [/crunch/i, "Crunches"],
  [/russian\s*twist/i, "Russian Twist"],
  [/relev[eé].*jambe|leg\s*raise|genoux\s*suspend/i, "Hanging Leg Raise"],
  [/farmer/i, "Farmer's Walk"],
  [/thruster/i, "Kettlebell Thruster"],
  [/inverted\s*row|traction\s*austral/i, "Inverted Row"],
  [/nordic|glute\s*ham/i, "Natural Glute Ham Raise"],
  [/hyperextension/i, "Hyperextension"],
  [/band\s*pull|elastique.*apart/i, "Band Pull Apart"],
  [/tirage\s*[eé]lastique/i, "Seated Cable Rows"],
];

/**
 * Alias FR/variantes → nom exact ExerciseDB (GIF distinct par variante).
 * Ordre : du plus spécifique au plus générique.
 */
const GIF_NAME_ALIASES = [
  // Pompes — chaque variante a son propre GIF
  [/pompes?\s*diamant|diamond\s*push/i, "diamond push-up"],
  [/pike\s*push/i, "pike-to-cobra push-up"],
  [/pompes?\s*archer|archer\s*push/i, "archer push up"],
  [/pompes?\s*prise\s*serr|close[\s-]?grip\s*push/i, "close-grip push-up"],
  [/pompes?.*genoux|kneeling\s*push|sur\s*les\s*genoux/i, "kneeling push-up (male)"],
  [/pompes?.*sur[eé]lev|pieds?\s*sur[eé]lev|decline\s*push/i, "decline push-up"],
  [/pompes?\s*lest/i, "clap push up"],
  [/pompes?.*[eé]lastique|band.*push-?up/i, "band close-grip push-up"],
  [/pompes?\s*(classiques?|contr[oô]l|lentes)|finisher\s*[—\-].*pompes|^pompes?$/i, "push-up"],
  [/pompes?|push[\s-]?up/i, "push-up"],

  // Jambes
  [/goblet/i, "dumbbell goblet squat"],
  [/bulgarian|split\s*squat/i, "split squats"],
  [/squats?\s*saut|jump\s*squat/i, "jump squat"],
  [/smith|squat\s*guid/i, "barbell full squat"],
  [/squats?/i, "dumbbell squat"],
  [/fentes?\s*(march|walk)|walking\s*lunge/i, "walking lunge"],
  [/fentes?\s*arri[eè]re|rear\s*lunge|reverse\s*lunge/i, "dumbbell rear lunge"],
  [/fentes?/i, "dumbbell lunge"],
  [/hip\s*thrust/i, "resistance band hip thrusts on knees (female)"],
  [/nordic|glute\s*ham/i, "lever lying leg curl"],
  [/pont\s*fessier|glute\s*bridge/i, "barbell glute bridge"],
  [/presse\s*[aà]\s*cuisses|leg\s*press/i, "sled 45 degrees one leg press"],
  [/leg\s*extension/i, "lever leg extension"],
  [/leg\s*curl/i, "lever lying leg curl"],
  [/mollet|calf/i, "barbell standing calf raise"],

  // Haut du corps
  [/mountain\s*climber/i, "mountain climber"],
  [/burpee/i, "burpee"],
  [/romanian|soulev[eé]\s*de\s*terre\s*roumain/i, "dumbbell romanian deadlift"],
  [/soulev[eé]\s*de\s*terre/i, "barbell deadlift"],
  [/d[eé]velopp[eé]\s*couch[eé].*barre|bench\s*press.*barre/i, "barbell bench press"],
  [/d[eé]velopp[eé]\s*couch[eé]|dumbbell\s*bench|d[eé]velopp[eé]\s*halt[eè]res?/i, "dumbbell bench press"],
  [/d[eé]velopp[eé]\s*inclin[eé].*barre/i, "barbell incline bench press"],
  [/d[eé]velopp[eé]\s*inclin[eé]/i, "dumbbell incline bench press"],
  [/d[eé]velopp[eé]\s*(militair|epaule|épaule)|shoulder\s*press/i, "dumbbell seated shoulder press"],
  [/d[eé]velopp[eé].*machine|chest\s*press|convergente|poitrine\s*machine/i, "dumbbell bench press"],
  [/[eé]l[eé]vation(s)?\s*lat|lateral\s*raise/i, "dumbbell lateral raise"],
  [/oiseau|rear\s*delt/i, "dumbbell incline rear lateral raise"],
  [/[eé]cart[eé]|dumbbell\s*fly|pec\s*deck/i, "dumbbell fly"],
  [/pull[\s-]?over/i, "dumbbell pullover"],
  [/face\s*pull/i, "cable kneeling rear delt row (with rope) (male)"],
  [/rowing.*un\s*bras|rowing\s*unilat|one[\s-]?arm.*row/i, "bodyweight standing one arm row"],
  [/rowing\s*assis|tirage\s*horizontal|cable\s*row/i, "cable seated row"],
  [/rowing|bent\s*over\s*row/i, "dumbbell incline row"],
  [/tirage\s*vertical|lat\s*pulldown/i, "cable bar lateral pulldown"],
  [/tractions?\s*austral|inverted\s*row/i, "inverted row"],
  [/tractions?/i, "assisted standing pull-up"],
  [/tirage/i, "cable seated row"],
  [/shrug|haussement/i, "dumbbell shrug"],

  // Bras — variantes de curl distinctes (après leg curl / nordic ci-dessus)
  [/curl\s*marteau|hammer\s*curl/i, "dumbbell hammer curl"],
  [/curl\s*pupitre|preacher/i, "dumbbell preacher curl"],
  [/curl\s*(barre\s*)?ez|ez[\s-]?bar/i, "ez barbell curl"],
  [/curl\s*inclin/i, "dumbbell incline curl"],
  [/^curl\s*isom[eé]trique/i, "isometric wipers"],
  [/curl\s*barre/i, "barbell curl"],
  [/curl\s*halt[eè]res?\s*debout/i, "dumbbell standing biceps curl"],
  [/curl\s*(biceps|halt)/i, "dumbbell alternate biceps curl"],
  [/^curl\b/i, "dumbbell alternate biceps curl"],
  [/pushdown|extension\s*triceps.*poulie/i, "cable pushdown"],
  [/extension\s*triceps|triceps.*t[eê]te|overhead.*triceps|au-dessus/i, "cable overhead triceps extension (rope attachment)"],
  [/kickback/i, "dumbbell kickback"],
  [/skull|barre\s*au\s*front/i, "barbell seated overhead triceps extension"],
  [/dips?/i, "triceps dip"],

  // Core / cardio tools
  [/superman/i, "superman push-up"],
  [/gainage\s*lat|side\s*plank|planche\s*lat/i, "side plank hip adduction"],
  [/plank|gainage|planche|hollow/i, "front plank with twist"],
  [/russian\s*twist/i, "russian twist"],
  [/crunch/i, "cable seated crunch"],
  [/relev[eé].*(jambe|genoux)|hanging\s*leg/i, "hanging leg raise"],
  [/kettlebell\s*swing|swing\s*(avec\s*)?halt/i, "kettlebell swing"],
  [/box\s*jump/i, "box jump down with one leg stabilization"],
  [/jumping\s*jack/i, "star jump (male)"],
  [/high\s*knee|mont[eé]es?\s*de\s*genoux/i, "high knee against wall"],
  [/farmer/i, "farmers walk"],
  [/thruster/i, "dumbbell squat"],
  [/battle\s*rope|battling\s*rope/i, "battling ropes"],
  [/rameur|rower|v[eé]lo|tapis/i, "stationary bike walk"],
];

/** Noms pour lesquels un GIF n'a pas de sens (cardio libre, mobilité…) */
const SKIP_GIF = /cardio\s*principal|mobilit[eé]|[eé]tirement|ouverture\s*des\s*hanches|rotation\s*thoracique|s[eé]ance\s*mobilit/i;

const catalogByNorm = new Map(
  catalog.map((ex) => [normalize(ex.name), ex])
);

const gifByNorm = new Map(
  gifCatalog.map((ex) => [normalize(ex.name), ex])
);

function normalize(str = "") {
  return String(str)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function translateToEnglishName(frName) {
  const raw = String(frName || "");
  for (const [re, en] of FR_TO_EN) {
    if (re.test(raw)) return en;
  }
  return raw;
}

function findCatalogItem(englishName) {
  const key = normalize(englishName);
  if (catalogByNorm.has(key)) return catalogByNorm.get(key);

  let best = null;
  let bestScore = 0;
  const tokens = new Set(key.split(" ").filter(Boolean));
  for (const ex of catalog) {
    const n = normalize(ex.name);
    if (n === key) return ex;
    if (n.includes(key) || key.includes(n)) {
      const score = Math.min(n.length, key.length);
      if (score > bestScore) {
        bestScore = score;
        best = ex;
      }
      continue;
    }
    const overlap = [...tokens].filter((t) => n.includes(t)).length;
    if (overlap >= 2 && overlap > bestScore) {
      bestScore = overlap;
      best = ex;
    }
  }
  return best;
}

function findGifByAlias(frName) {
  const raw = String(frName || "");
  for (const [re, enName] of GIF_NAME_ALIASES) {
    if (!re.test(raw)) continue;
    const hit = gifByNorm.get(normalize(enName));
    if (hit) return hit.id;
  }
  return null;
}

/**
 * Matching flou sur le catalogue ExerciseDB (fallback si pas d'alias).
 * Seuil élevé pour éviter qu'un mauvais match réutilise le même GIF.
 */
function findGifFromCatalog(exerciseName) {
  const en = translateToEnglishName(exerciseName);
  const key = normalize(en);
  if (!key || key.length < 3) return null;
  if (gifByNorm.has(key)) return gifByNorm.get(key);

  let best = null;
  let bestScore = 0;
  const tokens = key.split(" ").filter((t) => t.length > 2);

  for (const ex of gifCatalog) {
    const n = normalize(ex.name);
    let score = 0;
    if (n === key) return ex;
    if (n.startsWith(`${key} `)) score = 900 + key.length;
    else if (n.includes(key) && key.length >= 6) score = 600 + key.length - (n.length - key.length) * 0.5;
    else if (key.includes(n) && n.length >= 8) score = 450 + n.length;
    else {
      const nTokens = new Set(n.split(" "));
      const overlap = tokens.filter((t) => nTokens.has(t)).length;
      if (overlap < 2) continue;
      score = overlap * 70 - Math.abs(nTokens.size - tokens.length) * 12 - n.length * 0.2;
    }
    if (score > bestScore) {
      bestScore = score;
      best = ex;
    }
  }
  return bestScore >= 200 ? best : null;
}

function resolveGifId(exerciseName) {
  if (SKIP_GIF.test(String(exerciseName || ""))) return null;
  return findGifByAlias(exerciseName) || findGifFromCatalog(exerciseName)?.id || null;
}

/**
 * Résout le visuel d'un exercice (photo et/ou GIF).
 * @param {string} exerciseName
 * @returns {{ label: string, photo: string|null, gif: string|null, credit: string }}
 */
export function resolveExerciseVisual(exerciseName) {
  const en = translateToEnglishName(exerciseName);
  const item = findCatalogItem(en);
  const gifId = resolveGifId(exerciseName);
  const photo = item?.img ? `${PHOTO_BASE}${item.img}` : null;
  const gif = gifId ? `${GIF_BASE}${gifId}.gif` : null;

  return {
    label: item?.name || en || exerciseName,
    photo,
    gif,
    credit: gif
      ? "Illustration animée : ExerciseDB · photo : free-exercise-db"
      : item
        ? "Illustration : free-exercise-db"
        : "",
  };
}
