/* ==========================================================
   modules/exercise-visuals.js — Illustrations d'exercices in-app.
   Photos : free-exercise-db (GitHub). GIFs animés : ExerciseDB (AscendAPI).
   Objectif : montrer le geste sans envoyer l'utilisateur sur YouTube.
   ========================================================== */

import catalog from "../data/free-exercise-catalog.json";
import { escapeHtml } from "../helpers.js";

const PHOTO_BASE = "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/";
const GIF_BASE = "https://static.exercisedb.dev/media/";

/** Alias FR / variantes → nom exact dans free-exercise-db */
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

/** Mots-clés → id GIF ExerciseDB (animation courte, reste dans l'app) */
const GIF_BY_KEYWORD = [
  [/goblet/i, "yn8yg1r"],
  [/mountain\s*climber/i, "RJgzwny"],
  [/burpee/i, "dK9394r"],
  [/romanian|soulev[eé]\s*de\s*terre\s*roumain/i, "rR0LJzx"],
  [/dumbbell\s*bench|d[eé]velopp[eé]\s*couch[eé].*halt/i, "SpYC0Kp"],
  [/barbell\s*bench|d[eé]velopp[eé]\s*couch[eé].*barre/i, "EIeI8Vf"],
  [/lateral\s*raise|[eé]l[eé]vation(s)?\s*lat/i, "DsgkuIt"],
  [/hammer\s*curl|curl\s*marteau/i, "slDvUAU"],
  [/pushdown|extension\s*triceps.*poulie/i, "3ZflifB"],
  [/walking\s*lunge|fentes?\s*march/i, "IZVHb27"],
  [/kettlebell\s*swing|swing\s*halt/i, "UHJlbu3"],
  [/jump\s*squat|squats?\s*saut/i, "LIlE5Tn"],
  [/diamond|prise\s*serr/i, "soIB2rj"],
  [/russian\s*twist/i, "XVDdcoj"],
  [/pullover|pull[\s-]?over/i, "9XjtHvS"],
  [/shrug/i, "dG7tG5y"],
  [/close[\s-]?grip\s*push|pompes?\s*prise\s*serr/i, "x6KpKpq"],
  [/inverted\s*row/i, "bZGHsAZ"],
  [/hanging\s*leg|relev[eé].*jambe/i, "I3tsCnC"],
  [/decline\s*crunch/i, "9Ap7miY"],
  [/assisted\s*pull/i, "kiJ4Z2K"],
  [/plank|gainage|planche/i, "CosupLu"],
];

const catalogByNorm = new Map(
  catalog.map((ex) => [normalize(ex.name), ex])
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

function findGifId(frName) {
  const raw = String(frName || "");
  for (const [re, id] of GIF_BY_KEYWORD) {
    if (re.test(raw)) return id;
  }
  return null;
}

/**
 * Résout le visuel d'un exercice (photo et/ou GIF).
 * @param {string} exerciseName
 * @returns {{ label: string, photo: string|null, gif: string|null, credit: string }}
 */
export function resolveExerciseVisual(exerciseName) {
  const en = translateToEnglishName(exerciseName);
  const item = findCatalogItem(en);
  const gifId = findGifId(exerciseName);
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

/**
 * HTML d'une vignette illustration pour une carte exercice.
 */
export function renderExerciseVisualHtml(exerciseName, { compact = false } = {}) {
  const visual = resolveExerciseVisual(exerciseName);
  const src = visual.gif || visual.photo;
  const height = compact ? "88px" : "140px";
  const width = compact ? "120px" : "100%";

  if (!src) {
    return `
      <div class="exo-visual exo-visual--empty" aria-hidden="true" style="width:${width}; min-height:${height};">
        <span class="exo-visual__placeholder">${escapeHtml((exerciseName || "?").slice(0, 2).toUpperCase())}</span>
      </div>
    `;
  }

  return `
    <figure class="exo-visual" style="width:${width};">
      <img
        class="exo-visual__img"
        src="${escapeHtml(src)}"
        alt="Démonstration : ${escapeHtml(visual.label)}"
        loading="lazy"
        decoding="async"
        style="height:${height};"
        data-fallback-photo="${visual.photo && visual.gif ? escapeHtml(visual.photo) : ""}"
        onerror="if(this.dataset.fallbackPhoto){this.src=this.dataset.fallbackPhoto;this.dataset.fallbackPhoto='';}else{this.closest('.exo-visual')?.classList.add('exo-visual--empty');this.remove();}"
      />
      ${visual.credit ? `<figcaption class="exo-visual__credit">${escapeHtml(visual.credit)}</figcaption>` : ""}
    </figure>
  `;
}

/**
 * Lien YouTube secondaire — désactivé pour garder l'utilisateur dans l'app.
 */
export function renderYoutubeSecondaryLink(_exerciseName) {
  // return `
  //   <a href="https://www.youtube.com/results?search_query=${encodeURIComponent(`${_exerciseName} exercice musculation`)}" target="_blank" rel="noopener noreferrer" class="exo-yt-secondary">
  //     Voir aussi sur YouTube
  //   </a>
  // `;
  return "";
}
