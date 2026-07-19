/* ==========================================================
   pages/guest.js — Pages publiques (non authentifiées).
   ========================================================== */

import { TRACKS } from "../data.js";
import { state } from "../state.js";
import { icon, escapeHtml } from "../helpers.js";

/**
 * Rend la page d'accueil avec un héros animé et une grille de programmes.
 * @returns {string} HTML de la section héro + grille de programmes.
 */
export function renderHome() {
  const [t0, t1, t2] = TRACKS;

  const trailCardAnimation = `
    <style>
      .trail-card { transition: var(--transition); }
      .trail-card:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(15, 26, 20, 0.4); }
    </style>
  `;

  return `
  ${trailCardAnimation}
  <div class="hero">
    <div class="wrap hero-inner">
      <div class="hero-grid">
        <div>
          <p class="eyebrow-ember font-mono">Salle. Maison. Avec ou sans matériel — L'objectif : votre transformation physique.</p>
          <h1 class="h1 font-display">Avec le bon programme et le bon suivi, votre objectif physique est à votre portée.</h1>
          <p class="hero-sub">Des programmes personnalisés adaptés à votre niveau, votre environnement et vos objectifs. Avec ou sans matériel : nous vous accompagnons avec une méthode efficace pour construire votre meilleure version.</p>
          <div class="hero-cta">
            <button class="btn btn-ember" data-nav="signup" aria-label="Trouver mon programme">Trouver mon programme ${icon("arrow-right", 16)}</button>
            <button class="btn btn-line" data-nav="programs" aria-label="Voir les programmes">Voir les programmes</button>
          </div>
        </div>
        <div class="hero-photos">
          <div class="photo-card tall">
            <img src="${t0.img}" alt="${t0.label} — Entraînement en salle de sport" loading="lazy"/>
            <div class="overlay"></div>
            <span class="caption font-mono">${t0.label}</span>
          </div>
          <div class="photo-card">
            <img src="${t1.img}" alt="${t1.label} — Entraînement à domicile avec matériel" loading="lazy"/>
            <div class="overlay"></div>
            <span class="caption font-mono">${t1.label}</span>
          </div>
          <div class="photo-card">
            <img src="${t2.img}" alt="${t2.label} — Entraînement au poids du corps" loading="lazy"/>
            <div class="overlay"></div>
            <span class="caption font-mono">${t2.label}</span>
          </div>
        </div>
      </div>

      <div class="trail-grid">
        ${TRACKS.map((t) => `
          <div class="trail-card">
            <div class="trail-photo">
              <img src="${t.img}" alt="${t.label}" loading="lazy"/>
            </div>
            <div class="trail-body">
              <div class="trail-meta font-mono">${icon("map-pin", 12, "var(--accent-primary)")} DÉPART</div>
              <div class="trail-title-row">
                ${icon(t.icon, 22, "var(--text-primary)")}
                <span class="trail-title font-display">${t.label}</span>
              </div>
              <p class="trail-tagline">${t.tagline}</p>
              <div class="trail-dist font-mono">${t.dist} de progression</div>
            </div>
          </div>`).join("")}
      </div>
    </div>
  </div>

  <div class="section">
    <div class="wrap">
      <p class="eyebrow-moss font-mono">POURQUOI <span class="brand-name">MonProgramme<span>Fit</span></span></p>
      <h2 class="h2 font-display">Fait pour ceux qui commencent, sans excuse liée au matériel.</h2>
      <div class="feature-grid">
        <div class="feature">
          ${icon("flag", 24, "var(--accent-primary)")}
          <h3 class="font-display">Adapté à ta situation</h3>
          <p>Le programme s'ajuste à ton lieu d'entraînement et à ton matériel, pas l'inverse.</p>
        </div>
        <div class="feature">
          ${icon("trending-up", 24, "var(--accent-primary)")}
          <h3 class="font-display">Progression suivie</h3>
          <p>Chaque séance validée fait avancer ta progression, visible sur ton tableau de bord.</p>
        </div>
        <div class="feature">
          ${icon("message-square", 24, "var(--accent-primary)")}
          <h3 class="font-display">Coach accessible</h3>
          <p>Une question, une douleur, un doute ? Le coach répond directement dans ton espace.</p>
        </div>
      </div>
    </div>
  </div>

  <div class="cta-band">
    <div class="wrap">
      <h3 class="font-display">5 secondes de questionnaire pour obtenir un programme sur mesure.</h3>
      <button class="btn btn-ember" data-nav="login" aria-label="Se connecter">Se connecter</button>
    </div>
  </div>`;
}

export function renderPrograms() {
  return `
  <div class="section wrap">
    <p class="eyebrow-moss font-mono">LES TROIS DÉPARTS</p>
    <h1 class="h2 font-display">Nos programmes MonProgrammeFit</h1>
    <p class="hero-sub" style="max-width:620px; margin-top:12px;">Chaque parcours a été conçu pour répondre à un contexte réel : salle, maison avec matériel, ou entraînement au poids de corps.</p>
    <div class="grid-3" style="margin-top:32px">
      ${TRACKS.map((t) => `
        <div class="card program-card">
          ${icon(t.icon, 26, "var(--ember)")}
          <h3 class="font-display" style="margin-top:16px;font-size:16px;color:var(--ink)">${t.label}</h3>
          <p style="font-size:14px;color:var(--slate);margin-top:4px">${t.tagline}</p>
          <p class="desc">${t.desc}</p>
          <div class="font-mono" style="font-size:12px;color:var(--moss)">${t.dist} · 3 séances / semaine</div>
          <div style="margin-top:12px">${renderTrialProgram(t.id)}</div>
        </div>`).join("")}
    </div>
    <div class="cta-band" style="margin-top:40px;">
      <div class="wrap">
        <h3 class="font-display">Le bon programme, le bon rythme, la bonne méthode.</h3>
        <button class="btn btn-ember" data-nav="signup" aria-label="Démarrer MonProgrammeFit">Démarrer MonProgrammeFit</button>
      </div>
    </div>
  </div>`;
}

export function renderTrialProgram(id) {
  if (id === "gym") {
    return `
      <div class="trial-program">
        <div class="font-mono" style="font-size:12px;color:var(--ink-muted3);margin-bottom:6px">Programme d'essai gratuit</div>
        <div style="font-weight:600;color:var(--ink);margin-bottom:8px">4 séances / semaine — Poussée / Tirage / Jambes + Cardio</div>
        <ul style="font-size:14px;color:var(--slate);margin:0 0 8px 16px">
          <li><strong>Séance 1 — Push</strong> : développé couché, développé militaire, dips — 40–50 min</li>
          <li><strong>Séance 2 — Pull</strong> : traction/row, tirage horizontal, curl — 40–50 min</li>
          <li><strong>Séance 3 — Jambes</strong> : squat, fente, soulevé roumain — 45–55 min</li>
          <li><strong>Séance 4 — Cardio</strong> : 30–40 min (fractionné ou endurance)</li>
        </ul>
          <div style="margin-top:8px"><button class="btn btn-ember" data-nav="signup">Recevez votre programme personnalisé</button></div>
      </div>`;
  }
  if (id === "home-equip") {
    return `
      <div class="trial-program">
        <div class="font-mono" style="font-size:12px;color:var(--ink-muted3);margin-bottom:6px">Programme d'essai gratuit</div>
        <div style="font-weight:600;color:var(--ink);margin-bottom:8px">5 séances / semaine — Haltères (maison)</div>
        <ul style="font-size:14px;color:var(--slate);margin:0 0 8px 16px">
          <li><strong>Séance 1 — Haut</strong> : développé incliné haltères, rowing unilatéral — 40 min</li>
          <li><strong>Séance 2 — Bas</strong> : squat goblet, fente bulgare, soulevé jambe tendue — 45 min</li>
          <li><strong>Séance 3 — Full</strong> : circuit haltères + core — 35–40 min</li>
          <li><strong>Séance 4 — Push</strong> : épaules, triceps, pompes lestées — 40 min</li>
          <li><strong>Séance 5 — Pull / Cardio</strong> : tirage, curls + 20 min cardio léger — 40–45 min</li>
        </ul>
        <div style="margin-top:8px"><button class="btn btn-ember" data-nav="signup">Recevez votre programme personnalisé</button></div>
      </div>`;
  }
  // bodyweight
  return `
    <div class="trial-program">
      <div class="font-mono" style="font-size:12px;color:var(--ink-muted3);margin-bottom:6px">Programme d'essai gratuit</div>
      <div style="font-weight:600;color:var(--ink);margin-bottom:8px">5 séances / semaine — Poids du corps</div>
      <ul style="font-size:14px;color:var(--slate);margin:0 0 8px 16px">
        <li><strong>Séance 1 — Haut</strong> : pompes progressives, dips entre chaises — 30–40 min</li>
        <li><strong>Séance 2 — Bas</strong> : squat, pistol-assisted, fentes sautées — 35–45 min</li>
        <li><strong>Séance 3 — Full</strong> : circuit (burpees, mountain climbers, planche) — 30–35 min</li>
        <li><strong>Séance 4 — Core + mobilité</strong> : planche, hollow, stretching — 25–30 min</li>
        <li><strong>Séance 5 — Endurance</strong> : running ou cardio à la maison 30–40 min</li>
      </ul>
      <div style="margin-top:8px"><button class="btn btn-ember" data-nav="signup">Recevez votre programme personnalisé</button></div>
    </div>`;
}

export function renderBlog() {
  return `
  <div class="section wrap">
    <h1 class="h2 font-display">À propos de <span class="brand-name">MonProgramme<span>Fit</span></span></h1>
    <div class="card" style="margin-bottom:32px">
      <p style="font-size:16px;color:var(--ink);line-height:1.8;margin:0">
        <span class="brand-name">MonProgramme<span>Fit</span></span> a été créé pour accompagner toutes les personnes, qu'elles soient débutantes ou qu'elles souhaitent franchir un nouveau cap dans leur transformation physique. Notre objectif est de vous permettre de vous entraîner efficacement, en tenant compte de votre disponibilité, de votre niveau et de vos moyens.
      </p>
      <p style="font-size:16px;color:var(--ink);line-height:1.8;margin:24px 0 0">
        Grâce à des programmes personnalisés et adaptés à vos objectifs, <span class="brand-name">MonProgramme<span>Fit</span></span> vous aide à progresser à votre rythme, que vous vous entraîniez en salle, à domicile, avec ou sans matériel.
      </p>
    </div>
    <div class="advice-box card">
      <p class="eyebrow-moss font-mono" style="margin-bottom:12px">Conseils</p>
      <ul style="margin:0;padding-left:18px;color:var(--ink);font-size:15px;line-height:1.8">
        <li>Privilégiez une bonne exécution des mouvements avant d'augmenter les charges.</li>
        <li>Soyez régulier : la constance est la clé pour obtenir des résultats durables.</li>
        <li>Mangez suffisamment et hydratez-vous pour favoriser la récupération et la progression.</li>
        <li>Dormez au moins 7 à 9 heures par nuit, car la récupération est essentielle au développement musculaire.</li>
      </ul>
    </div>
  </div>`;
}

export function renderPricing() {
  // ⚠️ INCOHÉRENCE NON CORRIGÉE VOLONTAIREMENT : le texte ci-dessous annonce un
  // paiement "en FCFA via FedaPay" mais les prix affichés sont en euros.
  // Je ne choisis pas de montants FCFA à ta place — c'est une décision business,
  // pas un bug technique. Vois le message de diagnostic pour la marche à suivre.
  return `
  <div class="section wrap">
    <p class="eyebrow-moss font-mono">TARIFS</p>
    <h1 class="h2 font-display">Des formules adaptées à tous les objectifs</h1>
    <p class="hero-sub" style="max-width:620px; margin-top:12px;">Choisis un accompagnement MonProgrammeFit conçu pour ton niveau, ton rythme et ton matériel. Paiement sécurisé en FCFA via FedaPay.</p>
    <div class="grid-3" style="margin-top:32px;">
      <div class="card">
        <h3 class="font-display" style="font-size:18px;color:var(--ink);margin-bottom:12px">Essentiel</h3>
        <p style="font-size:14px;color:var(--slate);margin-bottom:16px">Programme découverte, idéal pour commencer sans stress.</p>
        <div class="stat-val font-display">19€ / semaine</div>
        <ul style="margin:16px 0 0 18px;padding:0;color:var(--ink);font-size:14px;line-height:1.8;">
          <li>Plan hebdomadaire personnalisé</li>
          <li>Accès aux programmes de base</li>
          <li>Support par email</li>
        </ul>
        <button class="btn btn-ember" style="margin-top:20px" data-nav="signup">Choisir</button>
      </div>
      <div class="card">
        <h3 class="font-display" style="font-size:18px;color:var(--ink);margin-bottom:12px">Premium</h3>
        <p style="font-size:14px;color:var(--slate);margin-bottom:16px">Pour un suivi régulier et des ajustements en temps réel.</p>
        <div class="stat-val font-display">39€ / semaine</div>
        <ul style="margin:16px 0 0 18px;padding:0;color:var(--ink);font-size:14px;line-height:1.8;">
          <li>Coaching hebdomadaire</li>
          <li>Programme évolutif</li>
          <li>Conseils nutritionnels</li>
        </ul>
        <button class="btn btn-ember" style="margin-top:20px" data-nav="signup">Choisir</button>
      </div>
      <div class="card">
        <h3 class="font-display" style="font-size:18px;color:var(--ink);margin-bottom:12px">Coach+ </h3>
        <p style="font-size:14px;color:var(--slate);margin-bottom:16px">Accompagnement premium avec accès direct au coach.</p>
        <div class="stat-val font-display">59€ / semaine</div>
        <ul style="margin:16px 0 0 18px;padding:0;color:var(--ink);font-size:14px;line-height:1.8;">
          <li>Support direct instantané</li>
          <li>Programme sur mesure</li>
          <li>Évaluations mensuelles</li>
        </ul>
        <button class="btn btn-ember" style="margin-top:20px" data-nav="signup">Choisir</button>
      </div>
    </div>
  </div>`;
}

export function renderFaq() {
  return `
  <div class="section wrap">
    <p class="eyebrow-moss font-mono">FAQ</p>
    <h1 class="h2 font-display">Questions fréquentes</h1>
    <div class="card" style="margin-top:24px;">
      <div class="faq-item">
        <strong>Comment fonctionne MonProgrammeFit ?</strong>
        <p>Tu réponds à un court quiz et tu reçois un programme adapté à ton équipement, ton niveau et tes objectifs.</p>
      </div>
      <div class="faq-item">
        <strong>Puis-je changer de programme plus tard ?</strong>
        <p>Oui, ton coach peut ajuster ton programme en fonction de ta progression et de tes retours.</p>
      </div>
      <div class="faq-item">
        <strong>Est-ce adapté aux débutants ?</strong>
        <p>Absolument. Chaque chemin est construit pour ton niveau actuel et progresse pas à pas.</p>
      </div>
      <div class="faq-item">
        <strong>Quels équipements sont nécessaires ?</strong>
        <p>Les programmes sont disponibles pour la salle, la maison avec matériel et le poids du corps.</p>
      </div>
      <div class="faq-item">
        <strong>Comment contacter mon coach ?</strong>
        <p>Tu peux envoyer un message via l'espace client ou utiliser le lien de contact dédié.</p>
      </div>
    </div>
  </div>`;
}

export function renderContact() {
  const { name, email, message } = state.drafts.contact;
  return `
  <div class="section wrap">
    <p class="eyebrow-moss font-mono">CONTACT</p>
    <h1 class="h2 font-display">Besoin d'aide ? On est là pour toi.</h1>
    <div class="grid-2" style="gap:24px; margin-top:32px;">
      <div class="card">
        <p style="font-size:16px;color:var(--ink);line-height:1.8;">Tu veux poser une question sur un programme, ton inscription ou ton suivi ? Écris-nous et nous reviendrons rapidement.</p>
        <div style="margin-top:24px; display:grid; gap:14px;">
          <div><strong>Email</strong><p style="margin:6px 0 0;color:var(--slate);">contact@monprogrammefit.com</p></div>
          <div><strong>Téléphone</strong><p style="margin:6px 0 0;color:var(--slate);">+229 90 00 00 00</p></div>
          <div><strong>Heures</strong><p style="margin:6px 0 0;color:var(--slate);">Lun–Ven · 8h–18h</p></div>
        </div>
      </div>
      <div class="card">
        <label class="font-mono" style="font-size:12px">Ton nom</label>
        <input class="text-input" type="text" data-contact-name value="${escapeHtml(name)}" placeholder="Ex: Aïcha" />
        <label class="font-mono" style="font-size:12px">Ton email</label>
        <input class="text-input" type="email" data-contact-email value="${escapeHtml(email)}" placeholder="ton@email.com" />
        <label class="font-mono" style="font-size:12px">Message</label>
        <textarea class="text-input" rows="5" data-contact-message placeholder="Décris ta demande...">${escapeHtml(message)}</textarea>
        <button class="btn btn-ember" style="margin-top:8px" data-contact-send="1">Envoyer le message</button>
      </div>
    </div>
  </div>`;
}

export function renderLegal() {
  return `
  <div class="section wrap">
    <p class="eyebrow-moss font-mono">MENTIONS</p>
    <h1 class="h2 font-display">Mentions légales et confidentialité</h1>
    <div class="card" style="margin-top:24px;">
      <p style="font-size:15px;color:var(--ink);line-height:1.8;">Le site MonProgrammeFit est la propriété personnelle d'Abdou Djabar Bakari. Il est édité et exploité par lui, avec des contenus sportifs et pédagogiques destinés à l'accompagnement de personnes souhaitant progresser à leur rythme.</p>
      <h3 class="font-display" style="font-size:16px;margin-top:20px;color:var(--ink);">Protection des données</h3>
      <p style="font-size:15px;color:var(--ink);line-height:1.8;">Les informations collectées sont utilisées uniquement pour te fournir un suivi personnalisé et ne sont pas revendues à des tiers. Tu peux demander la suppression de tes données à tout moment.</p>
      <h3 class="font-display" style="font-size:16px;margin-top:20px;color:var(--ink);">Propriété intellectuelle</h3>
      <p style="font-size:15px;color:var(--ink);line-height:1.8;">Le contenu du site, les programmes et les visuels sont la propriété d'Abdou Djabar Bakari et sont protégés par le droit d'auteur. Toute reproduction est interdite sauf autorisation.</p>
    </div>
  </div>`;
}

export function renderNotFound() {
  return `
  <div class="section wrap">
    <p class="eyebrow-moss font-mono">404</p>
    <h1 class="h2 font-display">Page introuvable</h1>
    <p style="font-size:15px;color:var(--slate);margin-top:16px;max-width:620px;">La page que tu cherches n'existe pas encore ou a peut-être été déplacée. Retourne à l'accueil pour reprendre le fil.</p>
    <button class="btn btn-ember" style="margin-top:24px" data-nav="home">Retour à l'accueil</button>
  </div>`;
}
