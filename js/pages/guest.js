/* ==========================================================
   pages/guest.js — Pages publiques (non authentifiées).
   ==========================================================
   ⚠️ Ce fichier utilise des TEMPLATES LITTÉRAUX JAVASCRIPT (backticks `)
   et non du JSX. Ne pas le traiter comme du JSX/TSX.
   ========================================================== */

import { TRACKS, COACH_PROGRAMS } from "../data.js";
import { state } from "../state.js";
import { icon, escapeHtml } from "../helpers.js";
import { COACH_AVATAR } from "../assets.js";

/**
 * Rend la page d'accueil avec un héros animé et une grille de programmes.
 * @returns {string} HTML de la section héro + grille de programmes.
 */
export function renderHome() {
  const list = state.tracks && state.tracks.length > 0 ? state.tracks : TRACKS;
  const [t0, t1, t2] = list;

  const realPrograms = COACH_PROGRAMS || [];
  const prog1 = realPrograms.find(p => p.id === "perte-poids-home") || realPrograms[0];
  const sess1 = prog1?.sessions?.find(s => s.id === "s_pp_home_lundi") || prog1?.sessions?.[0];

  const prog2 = realPrograms.find(p => p.id === "prise-de-muscle-gym") || realPrograms[1] || realPrograms[0];
  const sess2 = prog2?.sessions?.find(s => s.id === "s_pm_gym_lundi") || prog2?.sessions?.[0];

  const prog3 = realPrograms.find(p => p.id === "perte-poids-bodyweight") || realPrograms[2] || realPrograms[0];
  const sess3 = prog3?.sessions?.find(s => s.id === "s_pp_bw_jeudi") || prog3?.sessions?.[0];

  const trailCardAnimation = `
    <style>
      /* --- Section 1: Hero Animations & Cards --- */
      .hero {
        background: radial-gradient(circle at 80% 20%, rgba(226, 98, 45, 0.08) 0%, transparent 60%), var(--ink) !important;
        position: relative;
        overflow: hidden;
      }
      
      .hero .h1 {
        color: var(--chalk) !important;
      }
      
      .hero .hero-sub {
        color: var(--ink-muted2) !important;
      }
      
      .cinematic-bg-title {
        position: absolute;
        top: 15%;
        left: 50%;
        transform: translateX(-50%);
        font-size: clamp(3rem, 10vw, 7.5rem);
        color: rgba(226, 98, 45, 0.03);
        white-space: nowrap;
        font-weight: 900;
        z-index: 0;
        pointer-events: none;
        text-transform: uppercase;
        letter-spacing: -0.02em;
        user-select: none;
        font-family: 'Archivo Black', 'Archivo', sans-serif;
      }

      .hero-card-cluster-container {
        perspective: 1200px;
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 400px;
        position: relative;
        width: 100%;
        z-index: 2;
      }

      .cinematic-photo-card {
        width: 200px;
        height: 270px;
        border-radius: 12px;
        overflow: hidden;
        position: absolute;
        box-shadow: 0 16px 40px rgba(0,0,0,0.4);
        border: 1px solid rgba(255, 255, 255, 0.1);
        transition: transform 0.5s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.3s;
        background: var(--ink);
      }
      
      .cinematic-photo-card img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.5s ease;
      }
      
      .cinematic-photo-card:hover img {
        transform: scale(1.05);
      }
      
      .cinematic-photo-card.active-card {
        border: 2px solid var(--ember);
      }
      
      .card-caption {
        position: absolute;
        bottom: 0; left: 0; right: 0;
        padding: 16px;
        background: linear-gradient(180deg, transparent 0%, rgba(22, 35, 44, 0.95) 100%);
        color: var(--chalk);
        text-align: left;
      }
      
      .card-caption .badge {
        font-size: 8px;
        background: rgba(255,255,255,0.15);
        padding: 3px 6px;
        border-radius: 3px;
        letter-spacing: 0.1em;
        font-weight: 700;
        display: inline-block;
        margin-bottom: 6px;
      }
      
      .card-caption h4 {
        margin: 0;
        font-size: 13px;
        font-weight: 800;
        color: var(--chalk);
      }
      
      .orbital-badge {
        position: absolute;
        top: -12px;
        right: -12px;
        background: var(--ember);
        color: white;
        font-size: 8px;
        font-weight: 900;
        padding: 4px 8px;
        border-radius: 4px;
        box-shadow: 0 4px 12px rgba(226, 98, 45, 0.3);
        animation: pulseHalo 2s infinite alternate ease-in-out;
      }

      /* --- Section 3: Floating Archipelago 3D --- */
      .trail-grid {
        background: transparent !important;
        gap: 24px !important;
        margin-top: 48px !important;
      }
      
      .trail-card {
        border-radius: 12px !important;
        border: 1px solid rgba(255, 255, 255, 0.08) !important;
        overflow: hidden !important;
        background: rgba(22, 35, 44, 0.5) !important;
        backdrop-filter: blur(10px);
        box-shadow: 0 8px 32px rgba(15, 26, 20, 0.2) !important;
        transition: transform 0.3s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.3s !important;
        position: relative;
      }
      
      .trail-card:hover {
        transform: translateY(-8px) scale(1.02) !important;
        box-shadow: 0 16px 48px rgba(226, 98, 45, 0.15) !important;
        border-color: rgba(226, 98, 45, 0.3) !important;
      }

      /* --- Section 4: La Méthode (Morphing & Orbital) --- */
      @keyframes morphingBorder {
        0% { border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%; }
        50% { border-radius: 70% 30% 30% 70% / 70% 70% 30% 30%; }
        100% { border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%; }
      }
      
      @keyframes floatOrbital {
        0%, 100% { transform: translateY(0) rotate(5deg); }
        50% { transform: translateY(-10px) rotate(8deg); }
      }
      
      .feature-pillar {
        background: white;
        border: 1px solid var(--line);
        padding: 24px;
        border-radius: 8px;
        display: flex;
        gap: 20px;
        align-items: flex-start;
        transition: all 0.3s;
      }

      .feature-pillar:hover {
        transform: translateX(8px) scale(1.01) !important;
        border-color: var(--ember) !important;
        box-shadow: 0 8px 24px rgba(226, 98, 45, 0.08) !important;
      }

      /* --- Section 5: Film Strip --- */
      .film-card {
        transition: transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
      }
      .film-card:hover {
        transform: scale(1.02) translateY(-4px);
        border-color: rgba(226, 98, 45, 0.4);
        box-shadow: 0 12px 30px rgba(226, 98, 45, 0.12);
      }
      
      /* Hide scrollbar on Film Strip */
      .film-strip-slider::-webkit-scrollbar {
        height: 6px;
      }
      .film-strip-slider::-webkit-scrollbar-track {
        background: rgba(255,255,255,0.05);
        border-radius: 3px;
      }
      .film-strip-slider::-webkit-scrollbar-thumb {
        background: var(--ember);
        border-radius: 3px;
      }

      /* --- Section 7: Voice Cloud --- */
      .testimonial-bubble {
        transition: all 0.3s ease !important;
      }
      .testimonial-bubble:hover {
        transform: translateY(-5px) scale(1.02) !important;
        border-color: var(--ember) !important;
        box-shadow: 0 12px 32px rgba(226, 98, 45, 0.1) !important;
      }

      /* --- Responsive --- */
      @media (min-width: 768px) {
        .mosaic-grid {
          grid-template-columns: 1fr 1fr !important;
        }
        .testimonials-grid {
          grid-template-columns: repeat(3, 1fr) !important;
        }
      }
      
      @media (min-width: 992px) {
        .hero-grid {
          grid-template-columns: 1.2fr 1fr !important;
          gap: 48px !important;
        }
        .split-layout-grid {
          grid-template-columns: 1fr 1.2fr !important;
          gap: 64px !important;
        }
      }
      
      /* --- Glassmorphism Navbar --- */
      .navbar {
        background: rgba(22, 35, 44, 0.75) !important;
        backdrop-filter: blur(12px) !important;
        -webkit-backdrop-filter: blur(12px) !important;
        position: sticky !important;
        top: 0 !important;
        z-index: 1000 !important;
      }
      
      /* --- Helper FX --- */
      @keyframes pulseHalo {
        0%, 100% { box-shadow: 0 0 15px rgba(226, 98, 45, 0.15), 0 0 30px rgba(226, 98, 45, 0.05); }
        50% { box-shadow: 0 0 35px rgba(226, 98, 45, 0.4), 0 0 70px rgba(226, 98, 45, 0.15); }
      }
      .glowing-halo {
        animation: pulseHalo 4s infinite alternate ease-in-out;
      }

      /* --- Section 9: Rideau Reveal Footer --- */
      #main-content {
        position: relative;
        z-index: 2;
        background: var(--chalk);
        box-shadow: 0 20px 40px rgba(0,0,0,0.15);
        margin-bottom: 220px;
      }
      #appFooter {
        position: fixed;
        bottom: 0;
        left: 0;
        width: 100%;
        z-index: 1;
        pointer-events: auto;
      }
      @media (max-width: 768px) {
        #main-content {
          margin-bottom: 260px;
        }
      }
    </style>
  `;

  return `
  ${trailCardAnimation}
  <div class="hero">
    <!-- Section 1 : Titre découpé décoratif -->
    <div class="cinematic-bg-title font-display">
      Défi Physique
    </div>
    
    <div class="wrap hero-inner">
      <div class="hero-grid">
        <div style="position: relative; z-index: 2;">
          <p class="eyebrow-ember font-mono">Votre coaching, votre rythme, vos résultats.</p>
          <h1 class="h1 font-display">Avec le bon programme et le bon suivi, votre objectif physique est à votre portée.</h1>
          <p class="hero-sub">Des programmes personnalisés adaptés à votre niveau, votre environnement et vos objectifs. Avec ou sans matériel : nous vous accompagnons avec une méthode efficace pour construire votre meilleure version.</p>
          <div class="hero-cta">
            <button class="btn btn-ember glowing-halo" data-nav="signup" aria-label="Trouver mon programme" style="font-weight: 700;">Trouver mon programme ${icon("arrow-right", 16)}</button>
            <button class="btn btn-line" data-nav="programs" aria-label="Voir les programmes" style="color: var(--chalk); border-color: rgba(255,255,255,0.25);">Voir les programmes</button>
          </div>
        </div>

        <!-- Section 1 : Cluster de cartes photos 3D réactives -->
        <div class="hero-card-cluster-container">
          <!-- Card 1: Salle de Gym -->
          <div class="cinematic-photo-card tilt-card" style="transform: rotateY(-15deg) rotateX(10deg) translate(-40px, -20px) translateZ(-50px); z-index: 1;" data-tilt-factor="0.06">
            <img src="${t0.img}" alt="${t0.label}" />
            <div class="card-caption">
              <span class="badge font-mono">SALLE DE SPORT</span>
              <h4>${t0.label}</h4>
            </div>
          </div>
          <!-- Card 2: Coach Abdou BAKARI -->
          <div class="cinematic-photo-card tilt-card active-card glowing-halo" style="transform: translateZ(50px) scale(1.08); z-index: 3;" data-tilt-factor="0.08">
            <img src="${COACH_AVATAR}" alt="Coach Abdou BAKARI" />
            <div class="card-caption" style="background: linear-gradient(180deg, rgba(22, 35, 44, 0) 0%, rgba(22, 35, 44, 0.95) 100%);">
              <span class="badge font-mono" style="background: var(--ember); color: white;">★ COACH PRINCIPAL</span>
              <h4 style="color: var(--chalk); font-size: 1.1rem;">Abdou BAKARI</h4>
            </div>
            <!-- Orbite de certification -->
            <div class="orbital-badge font-mono">★ COACHING CERTIFIÉ ★</div>
          </div>
          <!-- Card 3: Maison poids du corps -->
          <div class="cinematic-photo-card tilt-card" style="transform: rotateY(15deg) rotateX(10deg) translate(40px, 20px) translateZ(-30px); z-index: 2;" data-tilt-factor="0.06">
            <img src="${t2.img}" alt="${t2.label}" />
            <div class="card-caption">
              <span class="badge font-mono">POIDS DU CORPS</span>
              <h4>${t2.label}</h4>
            </div>
          </div>
        </div>
      </div>

      <!-- Section 3 : Archipel des Catégories (Floating Archipelago 3D) -->
      <div class="trail-grid">
        ${list.map((t, idx) => `
          <div class="trail-card tilt-card" data-tilt-factor="0.04" style="position: relative;">
            <!-- Badge de fréquence d'entraînement -->
            <div style="position: absolute; top: 12px; right: 12px; background: rgba(22, 35, 44, 0.85); backdrop-filter: blur(4px); border: 1px solid rgba(255, 255, 255, 0.15); color: var(--chalk); font-size: 10px; font-weight: 700; padding: 4px 8px; border-radius: 20px; z-index: 10;" class="font-mono">
              ${t.id === 'gym' ? '5 SÉANCES / SEM.' : t.id === 'bodyweight' ? '3 SÉANCES / SEM.' : '4 SÉANCES / SEM.'}
            </div>
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
              
              <!-- Jauge d'intensité d'entraînement -->
              <div class="intensity-gauge" style="margin-top: 16px; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
                <span class="font-mono" style="font-size: 10px; color: var(--ink-muted3);">INTENSITÉ</span>
                <div style="display: flex; gap: 3px; flex-grow: 1;">
                  ${Array.from({length: 5}).map((_, i) => `
                    <div style="height: 4px; flex-grow: 1; border-radius: 2px; background: ${i < (t.id === 'gym' ? 5 : t.id === 'bodyweight' ? 4 : 3) ? 'var(--ember)' : 'rgba(255, 255, 255, 0.15)'};"></div>
                  `).join("")}
                </div>
                <span class="font-mono" style="font-size: 10px; color: var(--ember); font-weight: 700;">${t.id === 'gym' ? '9/10' : t.id === 'bodyweight' ? '8/10' : '7/10'}</span>
              </div>

              <div class="trail-dist font-mono">${t.dist} de progression</div>
            </div>
          </div>`).join("")}
      </div>
    </div>
  </div>

  <!-- Section 4 : La Méthode MonProgrammeFit (Split-Screen & Morphing) -->
  <div class="section" style="background: var(--chalk-soft); position: relative; overflow: hidden; padding: 80px 0;">
    <div class="wrap">
      <p class="eyebrow-moss font-mono">POURQUOI CE COACHING</p>
      <h2 class="h2 font-display" style="margin-bottom: 48px;">Fait pour ceux qui commencent, sans excuse liée au matériel.</h2>
      
      <div class="split-layout-grid" style="display: grid; grid-template-columns: 1fr; gap: 48px; align-items: center;">
        <!-- Left: Portrait and rotating orbital badge with morphing glow -->
        <div class="coach-morph-container" style="display: flex; justify-content: center; position: relative;">
          <div class="coach-photo-frame glowing-halo" style="width: min(100%, 340px); height: 400px; border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%; overflow: hidden; position: relative; box-shadow: var(--shadow); border: 3px solid var(--ember); animation: morphingBorder 8s infinite alternate ease-in-out;">
            <img src="${COACH_AVATAR}" alt="Coach Abdou BAKARI" style="width: 100%; height: 100%; object-fit: cover;" />
            <div style="position: absolute; inset: 0; background: linear-gradient(180deg, transparent 60%, rgba(22, 35, 44, 0.8) 100%);"></div>
          </div>
          <!-- Orbital badge floating -->
          <div class="rotating-orbital-badge font-mono" style="position: absolute; top: -10px; right: 12%; background: var(--ink); color: var(--chalk); border: 2px solid var(--ember); padding: 8px 12px; border-radius: 4px; font-size: 11px; font-weight: 700; transform: rotate(5deg); box-shadow: var(--shadow); animation: floatOrbital 3s infinite ease-in-out; z-index: 10;">
            ★ COACHING CERTIFIÉ
          </div>
        </div>

        <!-- Right: Presents the 3 pillars (keeping exact texts) -->
        <div style="display: flex; flex-direction: column; gap: 20px;">
          <div class="feature-pillar tilt-card" data-tilt-factor="0.04">
            <div style="background: var(--ember-soft); color: var(--ember); padding: 12px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
              ${icon("flag", 24)}
            </div>
            <div>
              <h3 class="font-display" style="font-size: 16px; margin: 0 0 6px; color: var(--ink);">Adapté à ta situation</h3>
              <p style="margin: 0; font-size: 13.5px; color: var(--slate); line-height: 1.5;">Le programme s'ajuste à ton lieu d'entraînement et à ton matériel, pas l'inverse.</p>
            </div>
          </div>
          
          <div class="feature-pillar tilt-card" data-tilt-factor="0.04">
            <div style="background: var(--moss-soft); color: var(--moss); padding: 12px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
              ${icon("trending-up", 24)}
            </div>
            <div>
              <h3 class="font-display" style="font-size: 16px; margin: 0 0 6px; color: var(--ink);">Progression suivie</h3>
              <p style="margin: 0; font-size: 13.5px; color: var(--slate); line-height: 1.5;">Chaque séance validée fait avancer ta progression, visible sur ton tableau de bord.</p>
            </div>
          </div>
          
          <div class="feature-pillar tilt-card" data-tilt-factor="0.04">
            <div style="background: var(--ember-soft); color: var(--ember); padding: 12px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
              ${icon("message-square", 24)}
            </div>
            <div>
              <h3 class="font-display" style="font-size: 16px; margin: 0 0 6px; color: var(--ink);">Coach accessible</h3>
              <p style="margin: 0; font-size: 13.5px; color: var(--slate); line-height: 1.5;">Une question, une douleur, un doute ? Le coach répond directement dans ton espace.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Section 5 : "Film Strip" des Programmes d'Entraînement (Bande Horizontale Interactive) -->
  <div class="section" style="background: var(--ink); color: var(--chalk); padding: 80px 0; overflow: hidden; position: relative;">
    <div style="position: absolute; inset: 0; background: radial-gradient(circle at 20% 80%, rgba(226, 98, 45, 0.08), transparent 50%); pointer-events: none;"></div>
    <div class="wrap">
      <p class="eyebrow-ember font-mono">APERÇU DE VOS SÉANCES</p>
      <h2 class="h2 font-display" style="color: var(--chalk); margin-bottom: 12px;">Film Strip interactif : un aperçu de tes futures séances.</h2>
      <p style="color: var(--ink-muted2); font-size: 14px; max-width: 650px; margin-bottom: 40px; line-height: 1.6;">
        Défile horizontalement pour explorer la structure progressive de nos séances. Chaque semaine monte en intensité pour garantir des résultats visibles.
      </p>

      <!-- Carousel slider horizontal -->
      <div class="film-strip-slider" style="display: flex; gap: 24px; overflow-x: auto; padding-bottom: 24px; scroll-snap-type: x mandatory; -webkit-overflow-scrolling: touch;">
        <!-- Card 1 -->
        <div class="film-card" style="flex: 0 0 300px; background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 24px; scroll-snap-align: start; display: flex; flex-direction: column; justify-content: space-between; min-height: 380px;">
          <div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
              <span style="font-family: 'IBM Plex Mono', monospace; font-size: 11px; color: var(--ember); font-weight: bold; background: rgba(226, 98, 45, 0.1); padding: 4px 8px; border-radius: 4px; text-transform: uppercase;">${escapeHtml(prog1?.subtitle || "Maison")}</span>
              <span style="font-family: 'IBM Plex Mono', monospace; font-size: 11px; color: var(--ink-muted2);">${escapeHtml(sess1?.duration || "45 Min")}</span>
            </div>
            <h3 class="font-display" style="font-size: 16px; color: var(--chalk); margin: 0 0 8px; font-weight: 700;">${escapeHtml(sess1?.name || "Réveil Musculaire")}</h3>
            <p style="color: var(--ink-muted); font-size: 12.5px; line-height: 1.5; margin-bottom: 16px;">
              ${escapeHtml(sess1?.restNote || "Circuit progressif de l'application.")}
            </p>
            <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 12px;">
              ${(sess1?.exercises || []).slice(0, 3).map(ex => `
                <div style="display: flex; justify-content: space-between; font-size: 12px; border-bottom: 1px dashed rgba(255,255,255,0.08); padding-bottom: 4px;">
                  <span style="color: var(--ink-muted2); text-overflow: ellipsis; overflow: hidden; white-space: nowrap; max-width: 180px;" title="${escapeHtml(ex.name)}">${escapeHtml(ex.name)}</span>
                  <span style="color: var(--ember); font-weight: bold; white-space: nowrap;">${escapeHtml(ex.sets ? `${ex.sets} × ${ex.reps}` : ex.reps)}</span>
                </div>
              `).join("")}
            </div>
          </div>
          <div style="margin-top: 16px;">
            <div style="display: flex; justify-content: space-between; font-size: 10px; color: var(--ink-muted3); margin-bottom: 4px;" class="font-mono">
              <span>EFFORT PHYSIQUE</span>
              <span style="color: var(--ember); font-weight: bold;">55%</span>
            </div>
            <div style="height: 5px; background: rgba(255,255,255,0.08); border-radius: 3px; overflow: hidden;">
              <div style="width: 55%; height: 100%; background: var(--ember);"></div>
            </div>
          </div>
        </div>

        <!-- Card 2 -->
        <div class="film-card" style="flex: 0 0 300px; background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 24px; scroll-snap-align: start; display: flex; flex-direction: column; justify-content: space-between; min-height: 380px;">
          <div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
              <span style="font-family: 'IBM Plex Mono', monospace; font-size: 11px; color: var(--ember); font-weight: bold; background: rgba(226, 98, 45, 0.1); padding: 4px 8px; border-radius: 4px; text-transform: uppercase;">${escapeHtml(prog2?.subtitle || "Salle de Gym")}</span>
              <span style="font-family: 'IBM Plex Mono', monospace; font-size: 11px; color: var(--ink-muted2);">${escapeHtml(sess2?.duration || "50 Min")}</span>
            </div>
            <h3 class="font-display" style="font-size: 16px; color: var(--chalk); margin: 0 0 8px; font-weight: 700;">${escapeHtml(sess2?.name || "Force & Volume")}</h3>
            <p style="color: var(--ink-muted); font-size: 12.5px; line-height: 1.5; margin-bottom: 16px;">
              ${escapeHtml(sess2?.restNote || "Entraînement de force issu de nos parcours réels.")}
            </p>
            <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 12px;">
              ${(sess2?.exercises || []).slice(0, 3).map(ex => `
                <div style="display: flex; justify-content: space-between; font-size: 12px; border-bottom: 1px dashed rgba(255,255,255,0.08); padding-bottom: 4px;">
                  <span style="color: var(--ink-muted2); text-overflow: ellipsis; overflow: hidden; white-space: nowrap; max-width: 180px;" title="${escapeHtml(ex.name)}">${escapeHtml(ex.name)}</span>
                  <span style="color: var(--ember); font-weight: bold; white-space: nowrap;">${escapeHtml(ex.sets ? `${ex.sets} × ${ex.reps}` : ex.reps)}</span>
                </div>
              `).join("")}
            </div>
          </div>
          <div style="margin-top: 16px;">
            <div style="display: flex; justify-content: space-between; font-size: 10px; color: var(--ink-muted3); margin-bottom: 4px;" class="font-mono">
              <span>EFFORT PHYSIQUE</span>
              <span style="color: var(--ember); font-weight: bold;">80%</span>
            </div>
            <div style="height: 5px; background: rgba(255,255,255,0.08); border-radius: 3px; overflow: hidden;">
              <div style="width: 80%; height: 100%; background: var(--ember);"></div>
            </div>
          </div>
        </div>

        <!-- Card 3 -->
        <div class="film-card" style="flex: 0 0 300px; background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 24px; scroll-snap-align: start; display: flex; flex-direction: column; justify-content: space-between; min-height: 380px;">
          <div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
              <span style="font-family: 'IBM Plex Mono', monospace; font-size: 11px; color: var(--ember); font-weight: bold; background: rgba(226, 98, 45, 0.1); padding: 4px 8px; border-radius: 4px; text-transform: uppercase;">${escapeHtml(prog3?.subtitle || "Poids du corps")}</span>
              <span style="font-family: 'IBM Plex Mono', monospace; font-size: 11px; color: var(--ink-muted2);">${escapeHtml(sess3?.duration || "55 Min")}</span>
            </div>
            <h3 class="font-display" style="font-size: 16px; color: var(--chalk); margin: 0 0 8px; font-weight: 700;">${escapeHtml(sess3?.name || "HIIT Cardio")}</h3>
            <p style="color: var(--ink-muted); font-size: 12.5px; line-height: 1.5; margin-bottom: 16px;">
              ${escapeHtml(sess3?.restNote || "Brûle un maximum de calories avec ce protocole intense.")}
            </p>
            <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 12px;">
              ${(sess3?.exercises || []).slice(0, 3).map(ex => `
                <div style="display: flex; justify-content: space-between; font-size: 12px; border-bottom: 1px dashed rgba(255,255,255,0.08); padding-bottom: 4px;">
                  <span style="color: var(--ink-muted2); text-overflow: ellipsis; overflow: hidden; white-space: nowrap; max-width: 180px;" title="${escapeHtml(ex.name)}">${escapeHtml(ex.name)}</span>
                  <span style="color: var(--ember); font-weight: bold; white-space: nowrap;">${escapeHtml(ex.sets ? `${ex.sets} × ${ex.reps}` : ex.reps)}</span>
                </div>
              `).join("")}
            </div>
          </div>
          <div style="margin-top: 16px;">
            <div style="display: flex; justify-content: space-between; font-size: 10px; color: var(--ink-muted3); margin-bottom: 4px;" class="font-mono">
              <span>EFFORT PHYSIQUE</span>
              <span style="color: var(--ember); font-weight: bold;">95%</span>
            </div>
            <div style="height: 5px; background: rgba(255,255,255,0.08); border-radius: 3px; overflow: hidden;">
              <div style="width: 95%; height: 100%; background: var(--ember);"></div>
            </div>
          </div>
        </div>
      </div>

      <div style="display: flex; justify-content: center; margin-top: 40px;">
        <button class="btn btn-ember glowing-halo" data-nav="quiz" style="font-weight: 700; gap: 8px;">
          Découvrir mon programme personnalisé ${icon("arrow-right", 18)}
        </button>
      </div>
    </div>
  </div>

  <!-- Section 6 : Transformations & Cadres d'Entraînement (Mosaïque Parallaxe) -->
  <div class="section" style="background: var(--chalk); padding: 80px 0; overflow: hidden; position: relative;">
    <div class="wrap">
      <p class="eyebrow-moss font-mono">CADRES D'ENTRAÎNEMENT</p>
      <h2 class="h2 font-display" style="margin-bottom: 40px;">Bâtis ton temple : musculation ou poids du corps.</h2>
      
      <div class="mosaic-grid" style="display: grid; grid-template-columns: 1fr; gap: 32px;">
        <!-- Left Column: Gym/Musculation card with shift effect -->
        <div class="mosaic-card tilt-card" style="border-radius: 16px; overflow: hidden; position: relative; height: 320px; background: var(--ink); box-shadow: var(--shadow);" data-tilt-factor="0.03">
          <img src="${t0.img}" alt="Musculation Fonte Salle" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.5; transform: scale(1.15); transition: transform 0.5s ease-out;" class="parallax-img" />
          <div style="position: absolute; inset: 0; background: linear-gradient(180deg, transparent 40%, rgba(22, 35, 44, 0.95) 100%);"></div>
          <div style="position: absolute; bottom: 24px; left: 24px; right: 24px; text-align: left;">
            <span class="font-mono" style="font-size: 10px; background: var(--ember); color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;">FONTE & INTENSITÉ</span>
            <h3 class="font-display" style="color: var(--chalk); font-size: 20px; margin: 10px 0 6px; font-weight: bold;">La rigueur de la fonte</h3>
            <p style="color: var(--ink-muted2); font-size: 13px; margin: 0; line-height: 1.5;">Idéal pour sculpter ton corps, vaincre les plateaux de force et progresser en charges lourdes.</p>
          </div>
        </div>

        <!-- Right Column: Bodyweight/Calisthenics card with shift effect -->
        <div class="mosaic-card tilt-card" style="border-radius: 16px; overflow: hidden; position: relative; height: 320px; background: var(--ink); box-shadow: var(--shadow);" data-tilt-factor="0.03">
          <img src="${t2.img}" alt="Poids de corps liberté" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.5; transform: scale(1.15); transition: transform 0.5s ease-out;" class="parallax-img" />
          <div style="position: absolute; inset: 0; background: linear-gradient(180deg, transparent 40%, rgba(22, 35, 44, 0.95) 100%);"></div>
          <div style="position: absolute; bottom: 24px; left: 24px; right: 24px; text-align: left;">
            <span class="font-mono" style="font-size: 10px; background: var(--moss); color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;">AGILITÉ & LIBERTÉ</span>
            <h3 class="font-display" style="color: var(--chalk); font-size: 20px; margin: 10px 0 6px; font-weight: bold;">La liberté du poids du corps</h3>
            <p style="color: var(--ink-muted2); font-size: 13px; margin: 0; line-height: 1.5;">Bâtis une force athlétique, une sangle abdominale d'acier et une endurance infatigable partout.</p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Section 8 : Le Vortex Transformation (CTA Final) -->
  <div class="cta-band vortex-cta-section" style="background: radial-gradient(circle at 50% 50%, rgba(226, 98, 45, 0.25) 0%, var(--ink) 100%) !important; padding: 100px 0 !important; border-top: 2px solid var(--ember); position: relative; overflow: hidden; display: flex; align-items: center; justify-content: center; text-align: center;">
    <div class="vortex-glow" style="position: absolute; width: 300px; height: 300px; border-radius: 50%; background: var(--ember); filter: blur(120px); opacity: 0.15; animation: pulseHalo 4s infinite alternate ease-in-out;"></div>
    <div class="wrap" style="position: relative; z-index: 2; display: flex; flex-direction: column; align-items: center;">
      <p class="eyebrow-ember font-mono" style="letter-spacing: 0.2em; justify-content: center;">PRENDS LE CONTRÔLE DE TON FUTUR</p>
      <h3 class="font-display" style="color: var(--chalk); font-size: clamp(1.6rem, 4vw, 2.6rem); max-width: 750px; line-height: 1.2; margin-top: 12px; margin-bottom: 24px; font-weight: 900;">
        5 secondes de questionnaire pour obtenir un programme sur mesure.
      </h3>
      <div style="display: flex; gap: 16px; flex-wrap: wrap; justify-content: center; margin-top: 16px;">
        <button class="btn btn-ember glowing-halo" data-nav="quiz" style="font-weight: 700; padding: 16px 32px; font-size: 16px; background: var(--ember); color: var(--chalk); border-radius: 4px;">
          Démarrer le Onboarding ${icon("zap", 18)}
        </button>
        <button class="btn btn-line" data-nav="login" aria-label="Se connecter" style="font-weight: 700; padding: 16px 32px; font-size: 16px; color: var(--chalk); border-color: rgba(255, 255, 255, 0.3);">
          Se connecter ${icon("user", 18)}
        </button>
      </div>
    </div>
  </div>

  <!-- Section 4 (Inclus Tarifs) -->
  <div class="section">
    <div class="wrap">
      <!-- Section Tarification -->
      <div class="card" style="padding:32px" id="tarifs-section">
        <p class="eyebrow-moss font-mono" id="tarifs-eyebrow">TARIFS TRANSPARENTS</p>
        <h2 class="h2 font-display" style="font-size:24px; margin-bottom:20px" id="tarifs-title">Choisissez l'offre qui vous correspond</h2>
        <p style="font-size:14px; color:var(--slate); margin-bottom:24px; max-width:650px;">Un accompagnement sur-mesure pour votre transformation physique. Paiement direct et sécurisé en FCFA.</p>
        
        <div class="grid-3" id="tarifs-grid">
          <div class="card" style="padding:24px; background: white; border: 1px solid var(--line); display: flex; flex-direction: column;" id="tarif-flex">
            <h3 class="font-display" style="font-size:18px; color:var(--ink); margin-bottom:8px">Abonnement Flex</h3>
            <p style="font-size:13px; color:var(--slate); margin-bottom:16px; flex-grow: 1;">Accès illimité à tous les programmes du Coach Abdou BAKARI (Maison, Salle, Sans matériel).</p>
            <div class="stat-val font-display" style="font-size: 20px; color: var(--ember);">8 000 FCFA <span style="font-size: 13px; font-family: var(--font-sans); font-weight: normal; color: var(--slate);">/ mois</span></div>
            <div class="font-mono" style="font-size:11px; color:var(--moss); margin-top:12px; margin-bottom: 16px; font-weight:600;">Sans engagement</div>
            <a href="https://wa.me/2290191720596?text=${encodeURIComponent('Bonjour Coach Abdou, je souhaite souscrire à l\'Abonnement Flex à 8000 FCFA/mois.')}" target="_blank" rel="noopener noreferrer" class="btn btn-primary" style="width: 100%; justify-content: center; text-decoration: none;">Souscrire via WhatsApp</a>
          </div>
          
          <div class="card" style="padding:24px; background: white; border: 2px solid var(--ember); position: relative; display: flex; flex-direction: column;" id="tarif-premium">
            <div style="position: absolute; top: -12px; right: 16px; background: var(--ember); color: white; font-size: 9px; font-weight: 800; padding: 2px 8px; border-radius: 4px; text-transform: uppercase; font-family: 'IBM Plex Mono', monospace;">Recommandé</div>
            <h3 class="font-display" style="font-size:18px; color:var(--ink); margin-bottom:8px">Abonnement Premium</h3>
            <p style="font-size:13px; color:var(--slate); margin-bottom:16px; flex-grow: 1;">Tous les programmes + 1 consultation de suivi visio par mois et ajustements en direct par le coach.</p>
            <div class="stat-val font-display" style="font-size: 20px; color: var(--ember);">15 000 FCFA <span style="font-size: 13px; font-family: var(--font-sans); font-weight: normal; color: var(--slate);">/ mois</span></div>
            <div class="font-mono" style="font-size:11px; color:var(--moss); margin-top:12px; margin-bottom: 16px; font-weight:600;">Suivi prioritaire inclus</div>
            <a href="https://wa.me/2290191720596?text=${encodeURIComponent('Bonjour Coach Abdou, je souhaite souscrire à l\'Abonnement Premium à 15000 FCFA/mois avec suivi.')}" target="_blank" rel="noopener noreferrer" class="btn btn-ember" style="width: 100%; justify-content: center; text-decoration: none;">Souscrire via WhatsApp</a>
          </div>
          
          <div class="card" style="padding:24px; background: white; border: 1px solid var(--line); display: flex; flex-direction: column;" id="tarif-defi">
            <h3 class="font-display" style="font-size:18px; color:var(--ink); margin-bottom:8px">Programme 30 Jours Défi</h3>
            <p style="font-size:13px; color:var(--slate); margin-bottom:16px; flex-grow: 1;">Formule de choc intensive sur 30 jours pour relancer la forme avec objectif ciblé et messagerie directe.</p>
            <div class="stat-val font-display" style="font-size: 20px; color: var(--ember);">15 000 FCFA</div>
            <div class="font-mono" style="font-size:11px; color:var(--moss); margin-top:12px; margin-bottom: 16px; font-weight:600;">Paiement unique</div>
            <a href="https://wa.me/2290191720596?text=${encodeURIComponent('Bonjour Coach Abdou, je souhaite participer au Programme 30 Jours Défi (15000 FCFA).')}" target="_blank" rel="noopener noreferrer" class="btn btn-primary" style="width: 100%; justify-content: center; text-decoration: none;">Souscrire via WhatsApp</a>
          </div>
        </div>
        
        <div class="card" style="margin-top:24px; padding:20px; background:var(--chalk-soft); border: 1px solid var(--line); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px;" id="tarif-decouverte">
          <div>
            <h3 class="font-display" style="font-size:16px; color:var(--ink); margin-bottom:4px">Séance Découverte Gratuite</h3>
            <p style="font-size:13px; color:var(--slate); margin:0">Bénéficiez de 1 semaine d'accès complet à nos séances d'essai pour évaluer votre motivation.</p>
          </div>
          <div style="display: flex; align-items: center; gap: 12px;">
            <div class="font-mono" style="font-size:12px; color:var(--moss); font-weight: 700; background: rgba(60, 90, 70, 0.08); padding: 4px 10px; border-radius: 4px;">100% GRATUIT</div>
            <a href="https://wa.me/2290191720596?text=${encodeURIComponent('Bonjour Coach Abdou, je suis intéressé(e) par la séance découverte gratuite.')}" target="_blank" rel="noopener noreferrer" class="btn btn-outline-dark" style="text-decoration: none; font-size: 12px; padding: 8px 12px;">Demander l'accès</a>
          </div>
        </div>
      </div>
    </div>
  </div>`;
}

export function renderPrograms() {
  return `
  <div style="background: var(--chalk); padding-bottom: 60px;">
    
    <!-- HERO CINÉMATIQUE HAUT DE PAGE -->
    <section class="hero" style="background: radial-gradient(circle at 85% 15%, rgba(226, 98, 45, 0.12) 0%, transparent 65%), var(--ink) !important; padding: 60px 0 50px; border-bottom: 1px solid rgba(255,255,255,0.1);">
      <div class="wrap" style="max-width: 1120px; margin: 0 auto; position: relative; z-index: 2;">
        
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
          <span class="font-mono" style="font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; padding: 4px 10px; background: rgba(226, 98, 45, 0.15); color: var(--ember); border-radius: 4px; font-weight: 700;">
            [ CATALOGUE OFFICIEL & SUR-MESURE ]
          </span>
          <span style="font-size: 12px; color: var(--ink-muted2); font-family: var(--font-mono, monospace);">MonProgrammeFit — Edition 2026</span>
        </div>

        <h1 class="font-display h1" id="prog-title" style="max-width: 860px; margin: 0 0 16px 0; font-size: clamp(28px, 4.5vw, 44px); line-height: 1.15; color: var(--chalk) !important;">
          Des programmes d'entraînement complets, structurés et évolutifs.
        </h1>

        <p class="hero-sub" id="prog-subtitle" style="max-width: 700px; font-size: 16px; line-height: 1.6; color: var(--ink-muted2) !important; margin: 0 0 28px 0;">
          Découvrez nos programmes officiels conçus par le <strong>Coach Abdou BAKARI</strong>. Chaque parcours intègre des consignes de charge, des tempos précis et un calendrier hebdomadaire adaptable.
        </p>

        <!-- BADGES HIGHLIGHTS -->
        <div style="display: flex; flex-wrap: wrap; gap: 10px; align-items: center;">
          <span style="font-size: 12px; font-weight: 600; color: var(--chalk); background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); padding: 6px 12px; border-radius: 6px; display: inline-flex; align-items: center; gap: 6px;">
            ${icon("check-circle-2", 14, "var(--ember)")} 9 Programmes certifiés
          </span>
          <span style="font-size: 12px; font-weight: 600; color: var(--chalk); background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); padding: 6px 12px; border-radius: 6px; display: inline-flex; align-items: center; gap: 6px;">
            ${icon("sliders", 14, "var(--moss)")} Salle, Maison & Poids du corps
          </span>
          <span style="font-size: 12px; font-weight: 600; color: var(--chalk); background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); padding: 6px 12px; border-radius: 6px; display: inline-flex; align-items: center; gap: 6px;">
            ${icon("user-check", 14, "var(--ember)")} Suivi & Mises à jour
          </span>
        </div>

      </div>
    </section>

    <!-- CONTENU PRINCIPAL DES PROGRAMMES -->
    <div class="wrap" style="max-width: 1120px; margin: 40px auto 0;">
      
      <!-- GRID DES PROGRAMMES -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(330px, 1fr)); gap: 24px;" id="programs-grid">
        ${COACH_PROGRAMS.map((p) => {
          const isPriseDeMuscle = p.id.includes("prise-de-muscle");
          const isPertePoids = p.id.includes("perte-poids");
          const goalLabel = isPriseDeMuscle ? "Hypertrophie" : (isPertePoids ? "Perte de Poids" : "Santé & Endurance");
          const cleanTitle = p.title.replace("MONPROGRAMMEFIT : ", "");

          return `
          <div class="card" id="program-card-${p.id}" style="padding: 28px; display: flex; flex-direction: column; justify-content: space-between; border: 1px solid var(--line); border-top: 4px solid var(--ember); background: #ffffff; box-shadow: 0 4px 20px rgba(0,0,0,0.03); border-radius: 12px; transition: transform 0.2s ease, box-shadow 0.2s ease;">
            <div>
              
              <!-- EN-TÊTE BADGES -->
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; gap: 8px; flex-wrap: wrap;">
                <span class="font-mono" style="background: rgba(226, 98, 45, 0.12); color: var(--ember); font-size: 10px; font-weight: 800; padding: 4px 8px; border-radius: 4px; text-transform: uppercase; letter-spacing: 0.05em;">
                  PROGRAMME OFFICIEL
                </span>
                <span class="font-mono" style="font-size: 11px; font-weight: 700; color: var(--moss); background: rgba(60, 150, 80, 0.1); padding: 4px 8px; border-radius: 4px;">
                  🎯 ${goalLabel}
                </span>
              </div>
              
              <h3 class="font-display" style="font-size: 20px; color: var(--ink); margin: 0 0 6px 0; font-weight: 800; line-height: 1.3;">
                ${escapeHtml(cleanTitle)}
              </h3>

              <p style="font-size: 13px; font-weight: 600; color: var(--slate); margin: 0 0 16px 0; line-height: 1.4;">
                ${escapeHtml(p.subtitle)}
              </p>

              <!-- GRID DES STATISTIQUES -->
              <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; background: rgba(0,0,0,0.02); padding: 12px; border-radius: 8px; margin-bottom: 16px; border: 1px solid var(--line);">
                <div style="text-align: center;">
                  <span class="font-mono" style="display: block; font-size: 9px; color: var(--slate); text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px; margin-bottom: 2px;">Durée</span>
                  <strong style="font-size: 13px; color: var(--ink); font-weight: 700;">${escapeHtml(p.duration)}</strong>
                </div>
                <div style="text-align: center; border-left: 1px solid var(--line); border-right: 1px solid var(--line);">
                  <span class="font-mono" style="display: block; font-size: 9px; color: var(--slate); text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px; margin-bottom: 2px;">Fréquence</span>
                  <strong style="font-size: 13px; color: var(--ink); font-weight: 700;">${escapeHtml(p.frequency)}</strong>
                </div>
                <div style="text-align: center;">
                  <span class="font-mono" style="display: block; font-size: 9px; color: var(--slate); text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px; margin-bottom: 2px;">Niveau</span>
                  <strong style="font-size: 12px; color: var(--ink); font-weight: 700;">${escapeHtml(p.level)}</strong>
                </div>
              </div>

              <!-- OBJECTIF -->
              <p style="font-size: 13px; color: var(--slate); margin-bottom: 16px; line-height: 1.5; min-height: 52px;">
                ${escapeHtml(p.objective)}
              </p>

              <!-- ÉQUIPEMENT REQUIS -->
              <div style="margin-bottom: 20px;">
                <h4 class="font-mono" style="font-size: 11px; text-transform: uppercase; color: var(--ink); font-weight: 700; margin: 0 0 8px 0; letter-spacing: 0.05em;">🛠 Équipement requis</h4>
                <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                  ${p.equipment.map(eq => `<span style="font-size: 11px; background: #ffffff; border: 1px solid var(--line); color: var(--ink); padding: 4px 8px; border-radius: 4px; font-weight: 500;">• ${escapeHtml(eq)}</span>`).join("")}
                </div>
              </div>

              <!-- DÉTAILS DU PROGRAMME OU VERROU POUR VISITURES -->
              ${(state.role === 'client' || state.role === 'admin') ? `
              <!-- ACCORDÉON DÉTAILS SÉANCES (MEMBRES CONNECTÉS) -->
              <details style="border-top: 1px dashed var(--line); margin-top: 16px; padding-top: 14px;">
                <summary style="font-size: 13px; font-weight: 700; color: var(--ember); user-select: none; display: flex; align-items: center; gap: 6px; outline: none; cursor: pointer;">
                  <span>📖 Consulter le programme détaillé & séances</span>
                </summary>
                
                <div style="margin-top: 16px; display: flex; flex-direction: column; gap: 16px; text-align: left; cursor: default;" onclick="event.stopPropagation();">
                  
                  <!-- Échauffement -->
                  <div style="background: rgba(0,0,0,0.02); padding: 14px; border-radius: 8px; border: 1px solid var(--line);">
                    <h4 class="font-mono" style="font-size: 11px; text-transform: uppercase; color: var(--ember); font-weight: 800; margin: 0 0 8px 0;">🔥 Échauffement (${escapeHtml(p.warmup.duration)})</h4>
                    <ul style="margin: 0; padding-left: 18px; font-size: 12px; color: var(--slate); line-height: 1.6;">
                      ${p.warmup.steps.map(step => `<li>${escapeHtml(step)}</li>`).join("")}
                    </ul>
                  </div>

                  <!-- Consignes & Repos -->
                  <div style="background: rgba(0,0,0,0.02); padding: 14px; border-radius: 8px; border: 1px solid var(--line);">
                    <h4 class="font-mono" style="font-size: 11px; text-transform: uppercase; color: var(--moss); font-weight: 800; margin: 0 0 8px 0;">⏱ Consignes de Repos & Tempo</h4>
                    <p style="font-size: 12px; color: var(--ink); margin: 0 0 4px 0; line-height: 1.5;"><strong>Récupération :</strong> ${escapeHtml(p.generalRules.rest)}</p>
                    ${p.generalRules.tempo ? `<p style="font-size: 12px; color: var(--slate); margin: 0 0 4px 0; line-height: 1.5;"><strong>Tempo :</strong> ${escapeHtml(p.generalRules.tempo)}</p>` : ""}
                    ${p.generalRules.intensity ? `<p style="font-size: 12px; color: var(--slate); margin: 0 0 4px 0; line-height: 1.5;"><strong>Intensité :</strong> ${escapeHtml(p.generalRules.intensity)}</p>` : ""}
                    ${p.generalRules.progression ? `<p style="font-size: 12px; color: var(--slate); margin: 0; line-height: 1.5;"><strong>Progression :</strong> ${escapeHtml(p.generalRules.progression)}</p>` : ""}
                  </div>

                  <!-- Calendrier de la Semaine -->
                  <div style="background: rgba(0,0,0,0.02); padding: 14px; border-radius: 8px; border: 1px solid var(--line);">
                    <h4 class="font-mono" style="font-size: 11px; text-transform: uppercase; color: var(--ink); font-weight: 800; margin: 0 0 8px 0;">📅 Calendrier de la semaine</h4>
                    <div style="display: flex; flex-direction: column; gap: 6px;">
                      ${p.weeklySchedule.map(s => `
                        <div style="display: flex; font-size: 12px; border-bottom: 1px solid var(--line); padding-bottom: 4px; justify-content: space-between;">
                          <span style="width: 85px; font-weight: 700; color: var(--ink);">${escapeHtml(s.day)}</span>
                          <span style="color: var(--slate); flex: 1; text-align: left; padding-left: 8px;">${escapeHtml(s.focus)}</span>
                        </div>
                      `).join("")}
                    </div>
                  </div>

                  <!-- Exercices détaillés par séance -->
                  <div style="background: rgba(0,0,0,0.02); padding: 14px; border-radius: 8px; border: 1px solid var(--line);">
                    <h4 class="font-mono" style="font-size: 11px; text-transform: uppercase; color: var(--ink); font-weight: 800; margin: 0 0 10px 0;">💪 Détail des Exercices par Séance</h4>
                    ${p.sessions.map(sess => `
                      <details style="margin-bottom: 8px; background: #ffffff; padding: 10px 12px; border-radius: 6px; border: 1px solid var(--line);">
                        <summary style="font-size: 12px; font-weight: 700; color: var(--ink); display: flex; justify-content: space-between; align-items: center; user-select: none; outline: none; cursor: pointer;">
                          <span>${escapeHtml(sess.name.replace(" — Focus technique", "").replace(" — Intensité maîtrisée", "").replace(" — Endurance active", ""))}</span>
                          <span style="font-size: 11px; font-weight: normal; color: var(--slate);">${escapeHtml(sess.duration)} · ${sess.exercises.length} exos</span>
                        </summary>
                        <div style="margin-top: 10px; font-size: 12px; display: flex; flex-direction: column; gap: 8px;">
                          ${sess.exercises.map((ex, idx) => `
                            <div style="border-bottom: 1px dashed var(--line); padding-bottom: 6px;">
                              <div style="display: flex; justify-content: space-between; font-weight: 600; color: var(--ink);">
                                <span>${idx + 1}. ${escapeHtml(ex.name)}</span>
                                <span style="color: var(--ember); white-space: nowrap; margin-left: 8px;">${escapeHtml(ex.sets)} × ${escapeHtml(ex.reps)}</span>
                              </div>
                              <div style="color: var(--slate); font-size: 11px; margin-top: 2px;">
                                Récupération : <strong>${escapeHtml(ex.rest)}</strong> ${ex.type ? `· <span style="text-transform: uppercase; font-size: 9px; padding: 1px 4px; background: rgba(0,0,0,0.03); border: 1px solid var(--line); border-radius: 2px;">${escapeHtml(ex.type)}</span>` : ""}
                              </div>
                              ${ex.desc ? `<p style="color: var(--slate); font-size: 11px; margin: 4px 0 0 0; line-height: 1.4;">${escapeHtml(ex.desc)}</p>` : ""}
                            </div>
                          `).join("")}
                        </div>
                      </details>
                    `).join("")}
                  </div>

                </div>
              </details>
              ` : `
              <!-- MESSAGE VERROUIN SANS COMPTE -->
              <div style="border-top: 1px dashed var(--line); margin-top: 16px; padding-top: 14px;">
                <div style="background: rgba(226, 98, 45, 0.04); border: 1px solid rgba(226, 98, 45, 0.18); border-radius: 8px; padding: 14px; text-align: center;">
                  <div style="font-size: 12px; font-weight: 800; color: var(--ink); display: flex; align-items: center; justify-content: center; gap: 6px; margin-bottom: 4px;">
                    🔒 <span>Détails du programme réservés aux membres</span>
                  </div>
                  <p style="font-size: 11px; color: var(--slate); margin: 0 0 10px 0; line-height: 1.4;">
                    Créez un compte ou connectez-vous pour accéder à la structure détaillée du programme, aux séances et aux consignes du coach.
                  </p>
                  <button class="btn btn-ember btn-sm" data-nav="signup" style="font-size: 11px; font-weight: 700; padding: 6px 12px; width: 100%; justify-content: center;">
                    S'inscrire / Se connecter pour débloquer
                  </button>
                </div>
              </div>
              `}
            </div>
            
            <!-- BOUTONS D'ACTION (ACTIVATION DU PROGRAMME) -->
            <div style="margin-top: 24px; display: flex; flex-direction: column; gap: 10px;">
              ${state.role === 'client' ? `
                <button class="btn btn-moss btn-select-program w-full" data-program-id="${p.id}" style="font-weight: 700; justify-content: center; width: 100%; padding: 12px;">
                  Activer ce programme
                </button>
              ` : `
                <button class="btn btn-ember btn-select-program w-full" data-program-id="${p.id}" style="font-weight: 700; justify-content: center; width: 100%; padding: 12px;">
                  S'inscrire et démarrer ce programme
                </button>
              `}
            </div>
          </div>`;
        }).join("")}
      </div>

      <!-- BANDEAU CTA BAS DE PAGE -->
      <section style="background: var(--ink); border-radius: 12px; padding: 40px; color: var(--chalk); text-align: center; margin-top: 48px; position: relative; overflow: hidden; border: 1px solid rgba(255,255,255,0.1);" id="programs-cta">
        <div style="position: relative; z-index: 2; max-width: 680px; margin: 0 auto;">
          <span class="font-mono" style="font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; padding: 3px 10px; background: rgba(226, 98, 45, 0.2); color: var(--ember); border-radius: 4px; font-weight: 700;">
            [ TRANSFORMATION SUR-MESURE ]
          </span>
          <h2 class="font-display" style="font-size: 26px; margin: 12px 0 12px 0; color: var(--chalk);">
            Besoin d'un programme ajusté à 100% à ton rythme ?
          </h2>
          <p style="font-size: 15px; color: var(--ink-muted2); margin: 0 0 24px 0; line-height: 1.6;">
            Complète notre questionnaire interactif pour obtenir tes recommandations personnalisées de séances et le suivi du coach.
          </p>
          <div style="display: flex; justify-content: center; gap: 12px; flex-wrap: wrap;">
            ${state.role === 'client' ? `
              <button class="btn btn-ember" data-nav="client-program" style="font-weight: 700; padding: 12px 24px; font-size: 14px;">Consulter mon entraînement</button>
            ` : `
              <button class="btn btn-ember" data-nav="quiz" style="font-weight: 700; padding: 12px 24px; font-size: 14px;">Commencer mon Questionnaire Onboarding</button>
            `}
          </div>
        </div>
      </section>

    </div>
  </div>`;
}

export function renderBlog() {
  return `
  <div class="section wrap">
    <h1 class="h2 font-display">Blog</h1>
    <p class="hero-sub" style="max-width:620px; margin-top:12px;">Découvrez nos articles pour vous aider à progresser dans votre transformation physique.</p>
    <!-- Contenu du blog sera ajouté ici -->
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

// La fonction `renderContact()` a été déplacée dans `js/pages/contact.js` pour éviter la dette technique.

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

/**
 * Rend la page À propos de MonProgrammeFit (Rebranded).
 * Structure : Hero Cinématique + KPIs + Histoire + Mission + Piliers + Coach + Engagements + CTA.
 * @returns {string} HTML de la page À propos.
 */
export function renderAbout() {
  return `
  <div style="background: var(--chalk); padding-bottom: 60px;">
    
    <!-- HERO CINÉMATIQUE HAUT DE PAGE -->
    <section class="hero" style="background: radial-gradient(circle at 85% 15%, rgba(226, 98, 45, 0.12) 0%, transparent 65%), var(--ink) !important; padding: 60px 0 50px; border-bottom: 1px solid rgba(255,255,255,0.1);">
      <div class="wrap" style="max-width: 1120px; margin: 0 auto; position: relative; z-index: 2;">
        
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
          <span class="font-mono" style="font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; padding: 4px 10px; background: rgba(226, 98, 45, 0.15); color: var(--ember); border-radius: 4px; font-weight: 700;">
            [ NOTRE HISTOIRE & ENGAGEMENT ]
          </span>
          <span style="font-size: 12px; color: var(--ink-muted2); font-family: var(--font-mono, monospace);">MonProgrammeFit — Edition 2026</span>
        </div>

        <h1 class="font-display h1" style="max-width: 860px; margin: 0 0 16px 0; font-size: clamp(28px, 4.5vw, 44px); line-height: 1.15; color: var(--chalk) !important;">
          Rendre le coaching sportif sur-mesure accessible à tous, sans concession.
        </h1>

        <p class="hero-sub" style="max-width: 680px; font-size: 16px; line-height: 1.6; color: var(--ink-muted2) !important; margin: 0 0 32px 0;">
          Chez <strong style="color: var(--chalk);">MonProgrammeFit</strong>, nous rejetons les programmes génériques en papier coller. Chaque parcours est conçu sur-mesure selon ton niveau, ton équipement et tes contraintes réelles.
        </p>

        <!-- KPI STATS HIGHLIGHTS GRID -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-top: 24px;">
          <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 16px 20px;">
            <div class="font-mono" style="font-size: 28px; font-weight: 800; color: var(--ember);">100%</div>
            <div style="font-size: 13px; font-weight: 600; color: var(--chalk); margin-top: 2px;">Sur-mesure & Adaptatif</div>
            <div style="font-size: 11px; color: var(--ink-muted2); margin-top: 2px;">Programme ajusté à ton profil</div>
          </div>

          <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 16px 20px;">
            <div class="font-mono" style="font-size: 28px; font-weight: 800; color: var(--chalk);">3 ans</div>
            <div style="font-size: 13px; font-weight: 600; color: var(--chalk); margin-top: 2px;">Expertise Terrain</div>
            <div style="font-size: 11px; color: var(--ink-muted2); margin-top: 2px;">Coaching certifié & éprouvé</div>
          </div>

          <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 16px 20px;">
            <div class="font-mono" style="font-size: 28px; font-weight: 800; color: var(--chalk);">0 FCFA</div>
            <div style="font-size: 13px; font-weight: 600; color: var(--chalk); margin-top: 2px;">Engagement Masqué</div>
            <div style="font-size: 11px; color: var(--ink-muted2); margin-top: 2px;">Transparence & liberté totale</div>
          </div>
        </div>

      </div>
    </section>

    <!-- MAIN CONTENT SECTION -->
    <div class="wrap" style="max-width: 1120px; margin: 40px auto 0;">

      <!-- SECTION 1: NOTRE HISTOIRE (GENESIS) -->
      <section style="margin-bottom: 48px;">
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 20px; border-bottom: 1px solid var(--line); padding-bottom: 12px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 32px; height: 32px; border-radius: 4px; background: rgba(226, 98, 45, 0.1); display: flex; align-items: center; justify-content: center; color: var(--ember);">
              ${icon("history", 18)}
            </div>
            <h2 class="h3 font-display" style="margin: 0; font-size: 22px; color: var(--ink);">Notre Genèse</h2>
          </div>
          <span class="font-mono" style="font-size: 11px; color: var(--slate); text-transform: uppercase;">Du constat au programme</span>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px;">
          
          <div class="card" style="padding: 24px; border: 1px solid var(--line); border-radius: 8px; background: #ffffff; position: relative;">
            <div class="font-mono" style="font-size: 12px; font-weight: 800; color: var(--ember); background: rgba(226,98,45,0.1); padding: 2px 8px; border-radius: 4px; width: fit-content; margin-bottom: 12px;">
              ÉTAPE 01 — 2023
            </div>
            <h3 class="font-display" style="font-size: 18px; margin: 0 0 10px 0; color: var(--ink);">Le Constat du Terrain</h3>
            <p style="font-size: 14px; color: var(--slate); line-height: 1.6; margin: 0;">
              En démarrant le coaching en 2023, <strong>Abdou BAKARI</strong> constate que beaucoup de débutants abandonnent dans les 6 premières semaines par manque de structure claire ou de programmes adaptés à leur quotidien.
            </p>
          </div>

          <div class="card" style="padding: 24px; border: 1px solid var(--line); border-radius: 8px; background: #ffffff; position: relative;">
            <div class="font-mono" style="font-size: 12px; font-weight: 800; color: var(--moss); background: rgba(60,150,80,0.1); padding: 2px 8px; border-radius: 4px; width: fit-content; margin-bottom: 12px;">
              ÉTAPE 02 — LE DÉCLIC
            </div>
            <h3 class="font-display" style="font-size: 18px; margin: 0 0 10px 0; color: var(--ink);">L'Entraînement Sans Barrières</h3>
            <p style="font-size: 14px; color: var(--slate); line-height: 1.6; margin: 0;">
              Face aux demandes répétées d'entraînements à la maison sans matériel coûteux, l'idée de créer une solution digitale dynamique et personnalisée naît pour éliminer tout obstacle.
            </p>
          </div>

          <div class="card" style="padding: 24px; border: 1px solid var(--line); border-radius: 8px; background: #ffffff; position: relative;">
            <div class="font-mono" style="font-size: 12px; font-weight: 800; color: var(--ink); background: rgba(0,0,0,0.05); padding: 2px 8px; border-radius: 4px; width: fit-content; margin-bottom: 12px;">
              ÉTAPE 03 — AUJOURD'HUI
            </div>
            <h3 class="font-display" style="font-size: 18px; margin: 0 0 10px 0; color: var(--ink);">MonProgrammeFit</h3>
            <p style="font-size: 14px; color: var(--slate); line-height: 1.6; margin: 0;">
              Aujourd'hui, MonProgrammeFit combine questionnaire intelligent, suivi direct du coach et liberté de choix entre salle de sport, maison équipée ou poids du corps.
            </p>
          </div>

        </div>
      </section>

      <!-- SECTION 2: NOTRE MISSION (MISSION BANNER) -->
      <section style="margin-bottom: 48px;">
        <div style="background: #ffffff; border: 1px solid var(--line); border-left: 4px solid var(--ember); border-radius: 8px; padding: 28px 32px; box-shadow: 0 4px 20px rgba(0,0,0,0.03);">
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
            ${icon("target", 22, "var(--ember)")}
            <h2 class="h3 font-display" style="margin: 0; font-size: 20px; color: var(--ink);">Notre mission</h2>
          </div>
          <p style="font-size: 15px; line-height: 1.7; color: var(--text-primary); margin: 0;">
            Notre mission est simple : <strong>rendre le sport accessible à tous</strong> en proposant des programmes <strong>adaptés à chacun</strong>, quel que soit son niveau, son matériel ou son emploi du temps.
          </p>
        </div>
      </section>

      <!-- SECTION 3: NOS PILIERS ET VALEURS -->
      <section style="margin-bottom: 48px;">
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 20px; border-bottom: 1px solid var(--line); padding-bottom: 12px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 32px; height: 32px; border-radius: 4px; background: rgba(60, 150, 80, 0.1); display: flex; align-items: center; justify-content: center; color: var(--moss);">
              ${icon("shield", 18)}
            </div>
            <h2 class="h3 font-display" style="margin: 0; font-size: 22px; color: var(--ink);">Nos 4 Piliers d'Excellence</h2>
          </div>
          <span class="font-mono" style="font-size: 11px; color: var(--slate); text-transform: uppercase;">Principes directeurs</span>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px;">
          
          <div class="card" style="padding: 20px; border: 1px solid var(--line); border-radius: 8px; background: #ffffff;">
            <div style="width: 36px; height: 36px; border-radius: 6px; background: rgba(226, 98, 45, 0.1); display: flex; align-items: center; justify-content: center; color: var(--ember); margin-bottom: 12px;">
              ${icon("check-circle-2", 20)}
            </div>
            <h3 class="font-display" style="font-size: 16px; margin: 0 0 8px 0; color: var(--ink);">Accessibilité Totale</h3>
            <p style="font-size: 13px; color: var(--slate); line-height: 1.5; margin: 0;">
              Programmes configurables pour la salle de gym complète, la maison avec matériel léger ou 100% au poids du corps.
            </p>
          </div>

          <div class="card" style="padding: 20px; border: 1px solid var(--line); border-radius: 8px; background: #ffffff;">
            <div style="width: 36px; height: 36px; border-radius: 6px; background: rgba(60, 150, 80, 0.1); display: flex; align-items: center; justify-content: center; color: var(--moss); margin-bottom: 12px;">
              ${icon("sliders", 20)}
            </div>
            <h3 class="font-display" style="font-size: 16px; margin: 0 0 8px 0; color: var(--ink);">Hyper-Personnalisation</h3>
            <p style="font-size: 13px; color: var(--slate); line-height: 1.5; margin: 0;">
              Un questionnaire de départ rapide (objectif, fréquence, contraintes) qui adapte automatiquement les séances.
            </p>
          </div>

          <div class="card" style="padding: 20px; border: 1px solid var(--line); border-radius: 8px; background: #ffffff;">
            <div style="width: 36px; height: 36px; border-radius: 6px; background: rgba(0, 0, 0, 0.05); display: flex; align-items: center; justify-content: center; color: var(--ink); margin-bottom: 12px;">
              ${icon("award", 20)}
            </div>
            <h3 class="font-display" style="font-size: 16px; margin: 0 0 8px 0; color: var(--ink);">Rigueur & Pédagogie</h3>
            <p style="font-size: 13px; color: var(--slate); line-height: 1.5; margin: 0;">
              Consignes d'exécution claires, temps de repos préconisés et conseils nutritionnels validés sur le terrain.
            </p>
          </div>

          <div class="card" style="padding: 20px; border: 1px solid var(--line); border-radius: 8px; background: #ffffff;">
            <div style="width: 36px; height: 36px; border-radius: 6px; background: rgba(226, 98, 45, 0.1); display: flex; align-items: center; justify-content: center; color: var(--ember); margin-bottom: 12px;">
              ${icon("users", 20)}
            </div>
            <h3 class="font-display" style="font-size: 16px; margin: 0 0 8px 0; color: var(--ink);">Accompagnement Direct</h3>
            <p style="font-size: 13px; color: var(--slate); line-height: 1.5; margin: 0;">
              Contact permanent avec le coach via l'espace client sécurisé et messagerie intégrée.
            </p>
          </div>

        </div>
      </section>

      <!-- SECTION 4: LE COACH & FONDATEUR -->
      <section style="margin-bottom: 48px;">
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 20px; border-bottom: 1px solid var(--line); padding-bottom: 12px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 32px; height: 32px; border-radius: 4px; background: rgba(226, 98, 45, 0.1); display: flex; align-items: center; justify-content: center; color: var(--ember);">
              ${icon("user-check", 18)}
            </div>
            <h2 class="h3 font-display" style="margin: 0; font-size: 22px; color: var(--ink);">Le Fondateur & Head Coach</h2>
          </div>
          <span class="font-mono" style="font-size: 11px; color: var(--slate); text-transform: uppercase;">Profil certifié</span>
        </div>

        <div class="card" style="padding: 32px; border: 1px solid var(--line); border-radius: 12px; background: #ffffff; display: flex; gap: 32px; align-items: center; flex-wrap: wrap; box-shadow: 0 4px 20px rgba(0,0,0,0.03);">
          
          <div style="flex: 0 0 280px; width: 280px; height: 320px; border-radius: 10px; overflow: hidden; background: var(--ink); border: 2px solid var(--line); box-shadow: 0 8px 24px rgba(0,0,0,0.1); position: relative;">
            <img src="${COACH_AVATAR}" alt="Photo de Abdou BAKARI" loading="lazy" style="width:100%; height:100%; object-fit:cover;" onerror="this.onerror=null;this.src='/images/team/abdou_bakari.jpg';" />
            <div style="position: absolute; bottom: 12px; left: 12px; right: 12px; background: rgba(22, 35, 44, 0.85); backdrop-filter: blur(8px); padding: 8px 12px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1);">
              <span class="font-mono" style="font-size: 10px; color: var(--ember); text-transform: uppercase; letter-spacing: 0.1em; font-weight: 700;">[ CERTIFIÉ & DIPLÔMÉ ]</span>
              <div style="font-size: 12px; color: var(--chalk); font-weight: 600; margin-top: 2px;">Abdou BAKARI</div>
            </div>
          </div>

          <div style="flex: 1; min-width: 280px;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
              <span class="font-mono" style="font-size: 11px; background: rgba(60,150,80,0.12); color: var(--moss); padding: 3px 10px; border-radius: 4px; font-weight: 700;">
                FONDATEUR & HEAD COACH
              </span>
              <span style="font-size: 12px; color: var(--slate); font-weight: 600;">• MonProgrammeFit</span>
            </div>

            <h3 class="font-display" style="font-size: 26px; margin: 0 0 10px 0; color: var(--ink);">Abdou BAKARI</h3>

            <p style="font-size: 15px; color: var(--slate); line-height: 1.6; margin: 0 0 16px 0;">
              Passionné de musculation et de préparation physique depuis près de 4 ans, Abdou a accompagné plus d'une dizaines de profils différents dans leur transformation. Sa philosophie repose sur la régularité, l'adaptation et la simplicité d'exécution.
            </p>

            <div style="background: rgba(226, 98, 45, 0.05); border-left: 3px solid var(--ember); padding: 12px 16px; border-radius: 4px; margin-bottom: 0;">
              <p style="font-size: 14px; color: var(--ink); font-style: italic; margin: 0; font-weight: 500;">
                « Mon objectif : t'aider à atteindre le tien. »
              </p>
            </div>
          </div>

        </div>
      </section>

      <!-- SECTION 6: CTA FINAL -->
      <section style="background: var(--ink); border-radius: 12px; padding: 40px; color: var(--chalk); text-align: center; position: relative; overflow: hidden; border: 1px solid rgba(255,255,255,0.1);">
        <div style="position: relative; z-index: 2; max-width: 680px; margin: 0 auto;">
          <span class="font-mono" style="font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; padding: 3px 10px; background: rgba(226, 98, 45, 0.2); color: var(--ember); border-radius: 4px; font-weight: 700;">
            [ REJOINS L'AVENTURE ]
          </span>
          <h2 class="font-display" style="font-size: 28px; margin: 12px 0 12px 0; color: var(--chalk);">
            Prêt à obtenir ton programme personnalisé ?
          </h2>
          <p style="font-size: 15px; color: var(--ink-muted2); margin: 0 0 24px 0; line-height: 1.6;">
            Réponds à notre questionnaire rapide de 2 minutes pour découvrir les séances parfaitement ajustées à tes objectifs.
          </p>
          <div style="display: flex; justify-content: center; gap: 12px; flex-wrap: wrap;">
            <button class="btn btn-ember" data-nav="quiz" style="font-weight: 700; padding: 12px 24px; font-size: 14px;">
              Passer le questionnaire gratuit
            </button>
            <button class="btn btn-outline-light" data-nav="programs" style="padding: 12px 20px; font-size: 14px; color: var(--chalk); border-color: rgba(255,255,255,0.2);">
              Voir tous les programmes
            </button>
          </div>
        </div>
      </section>

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
