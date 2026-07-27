import html2pdf from "html2pdf.js";
import { escapeHtml } from "../helpers.js";

/**
 * Génère la structure HTML stylisée d'un programme selon l'identité MonProgrammeFit
 * @param {Object} p - Le programme de COACH_PROGRAMS
 * @returns {string} HTML complet de la fiche
 */
export function generateProgramHTML(p) {
  const isPriseDeMuscle = p.id.includes("prise-de-muscle");
  const isPertePoids = p.id.includes("perte-poids");
  const goalLabel = isPriseDeMuscle ? "Hypertrophie" : (isPertePoids ? "Perte de Poids" : "Santé & Endurance");
  const cleanTitle = p.title.replace("MONPROGRAMMEFIT : ", "");

  return `
    <div id="pdf-export-container" style="
      font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
      color: #16232C;
      background: #ffffff;
      padding: 32px;
      max-width: 800px;
      margin: 0 auto;
      line-height: 1.5;
      box-sizing: border-box;
    ">
      <!-- EN-TÊTE ET LOGO -->
      <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #E2622D; padding-bottom: 16px; margin-bottom: 24px;">
        <div>
          <div style="font-family: 'IBM Plex Mono', monospace; font-size: 11px; font-weight: 800; color: #E2622D; text-transform: uppercase; letter-spacing: 0.12em; margin-bottom: 4px;">
            MONPROGRAMMEFIT — PROGRAMME OFFICIEL
          </div>
          <h1 style="font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 800; color: #16232C; margin: 0 0 6px 0;">
            ${escapeHtml(cleanTitle)}
          </h1>
          <p style="font-size: 13px; font-weight: 600; color: #4B5563; margin: 0;">
            ${escapeHtml(p.subtitle)} • Rédigé par ${escapeHtml(p.author || "Coach Abdou BAKARI")}
          </p>
        </div>
        <div style="text-align: right;">
          <span style="display: inline-block; background: #3C9650; color: #ffffff; font-family: 'IBM Plex Mono', monospace; font-size: 10px; font-weight: 800; padding: 4px 10px; border-radius: 4px; text-transform: uppercase;">
            ${escapeHtml(goalLabel)}
          </span>
          <div style="font-size: 10px; color: #6B7280; font-family: monospace; margin-top: 6px;">
            ID: ${escapeHtml(p.id)}
          </div>
        </div>
      </div>

      <!-- METRICS GRID -->
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; background: #F7F7F6; border: 1px solid #E5E7EB; border-radius: 8px; padding: 14px; margin-bottom: 20px;">
        <div style="text-align: center;">
          <div style="font-family: monospace; font-size: 9px; text-transform: uppercase; color: #6B7280; font-weight: 700;">DURÉE</div>
          <div style="font-size: 13px; font-weight: 800; color: #16232C; margin-top: 2px;">${escapeHtml(p.duration)}</div>
        </div>
        <div style="text-align: center; border-left: 1px solid #E5E7EB; border-right: 1px solid #E5E7EB;">
          <div style="font-family: monospace; font-size: 9px; text-transform: uppercase; color: #6B7280; font-weight: 700;">FRÉQUENCE</div>
          <div style="font-size: 13px; font-weight: 800; color: #16232C; margin-top: 2px;">${escapeHtml(p.frequency)}</div>
        </div>
        <div style="text-align: center;">
          <div style="font-family: monospace; font-size: 9px; text-transform: uppercase; color: #6B7280; font-weight: 700;">NIVEAU</div>
          <div style="font-size: 12px; font-weight: 800; color: #16232C; margin-top: 2px;">${escapeHtml(p.level)}</div>
        </div>
      </div>

      <!-- OBJECTIF & ÉQUIPEMENT -->
      <div style="background: #ffffff; border: 1px solid #E5E7EB; border-left: 4px solid #E2622D; border-radius: 6px; padding: 16px; margin-bottom: 20px;">
        <div style="font-family: monospace; font-size: 10px; font-weight: 800; color: #E2622D; text-transform: uppercase; margin-bottom: 4px;">🎯 OBJECTIF PRINCIPAL</div>
        <p style="font-size: 13px; color: #16232C; margin: 0 0 12px 0; line-height: 1.5;">${escapeHtml(p.objective)}</p>
        
        <div style="font-family: monospace; font-size: 10px; font-weight: 800; color: #16232C; text-transform: uppercase; margin-bottom: 6px;">🛠 MATÉRIEL REQUIS</div>
        <div style="display: flex; flex-wrap: wrap; gap: 6px;">
          ${p.equipment.map(eq => `<span style="font-size: 11px; background: #F3F4F6; border: 1px solid #E5E7EB; color: #374151; padding: 2px 8px; border-radius: 4px; font-weight: 500;">• ${escapeHtml(eq)}</span>`).join("")}
        </div>
      </div>

      <!-- ÉCHAUFFEMENT & REPOS -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px;">
        <div style="background: #F7F7F6; border: 1px solid #E5E7EB; border-radius: 6px; padding: 14px;">
          <div style="font-family: monospace; font-size: 10px; font-weight: 800; color: #E2622D; text-transform: uppercase; margin-bottom: 6px;">🔥 ÉCHAUFFEMENT (${escapeHtml(p.warmup.duration)})</div>
          <ul style="margin: 0; padding-left: 16px; font-size: 11px; color: #374151; line-height: 1.5;">
            ${p.warmup.steps.map(s => `<li>${escapeHtml(s)}</li>`).join("")}
          </ul>
        </div>
        
        <div style="background: #F7F7F6; border: 1px solid #E5E7EB; border-radius: 6px; padding: 14px;">
          <div style="font-family: monospace; font-size: 10px; font-weight: 800; color: #3C9650; text-transform: uppercase; margin-bottom: 6px;">⏱ REPOS & CONSIGNES</div>
          <p style="font-size: 11px; color: #16232C; margin: 0 0 4px 0;"><strong>Récupération :</strong> ${escapeHtml(p.generalRules.rest)}</p>
          ${p.generalRules.tempo ? `<p style="font-size: 11px; color: #4B5563; margin: 0 0 4px 0;"><strong>Tempo :</strong> ${escapeHtml(p.generalRules.tempo)}</p>` : ""}
          ${p.generalRules.intensity ? `<p style="font-size: 11px; color: #4B5563; margin: 0;"><strong>Intensité :</strong> ${escapeHtml(p.generalRules.intensity)}</p>` : ""}
        </div>
      </div>

      <!-- CALENDRIER DE LA SEMAINE -->
      <div style="margin-bottom: 24px;">
        <div style="font-family: monospace; font-size: 11px; font-weight: 800; color: #16232C; text-transform: uppercase; margin-bottom: 8px; border-bottom: 1px solid #E5E7EB; padding-bottom: 4px;">
          📅 PLANNING HEBDOMADAIRE
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
          <thead>
            <tr style="background: #16232C; color: #ffffff;">
              <th style="padding: 6px 8px; text-align: left; font-family: monospace; font-size: 9px; width: 90px;">JOUR</th>
              <th style="padding: 6px 8px; text-align: left; font-family: monospace; font-size: 9px;">FOCUS / OBJECTIF SÉANCE</th>
            </tr>
          </thead>
          <tbody>
            ${p.weeklySchedule.map((s, idx) => `
              <tr style="border-bottom: 1px solid #E5E7EB; background: ${idx % 2 === 0 ? '#ffffff' : '#F9FAFB'};">
                <td style="padding: 6px 8px; font-weight: 700; color: #16232C;">${escapeHtml(s.day)}</td>
                <td style="padding: 6px 8px; color: #374151;">${escapeHtml(s.focus)}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>

      <!-- DÉTAILS DES SÉANCES & EXERCICES -->
      <div style="margin-bottom: 24px;">
        <div style="font-family: monospace; font-size: 11px; font-weight: 800; color: #16232C; text-transform: uppercase; margin-bottom: 12px; border-bottom: 1px solid #E5E7EB; padding-bottom: 4px;">
          💪 SÉANCES ET DÉTAIL DES EXERCICES
        </div>

        ${p.sessions.map((sess) => `
          <div style="background: #ffffff; border: 1px solid #E5E7EB; border-radius: 6px; padding: 14px; margin-bottom: 14px; page-break-inside: avoid;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; border-bottom: 2px solid #F3F4F6; padding-bottom: 4px;">
              <div>
                <span style="font-family: monospace; font-size: 10px; font-weight: 800; color: #E2622D; text-transform: uppercase; background: rgba(226,98,45,0.1); padding: 2px 6px; border-radius: 3px;">
                  ${escapeHtml(sess.day)}
                </span>
                <span style="font-size: 13px; font-weight: 800; color: #16232C; margin-left: 8px;">
                  ${escapeHtml(sess.name)}
                </span>
              </div>
              <span style="font-size: 10px; font-weight: 600; color: #6B7280; font-family: monospace;">
                ${escapeHtml(sess.duration)} • ${sess.exercises.length} exercices
              </span>
            </div>

            <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
              <thead>
                <tr style="background: #F3F4F6; color: #374151;">
                  <th style="padding: 5px 6px; text-align: left; font-family: monospace; font-size: 9px; width: 20px;">#</th>
                  <th style="padding: 5px 6px; text-align: left; font-family: monospace; font-size: 9px;">EXERCICE</th>
                  <th style="padding: 5px 6px; text-align: center; font-family: monospace; font-size: 9px; width: 90px;">SÉRIES × REPS</th>
                  <th style="padding: 5px 6px; text-align: center; font-family: monospace; font-size: 9px; width: 65px;">REPOS</th>
                  <th style="padding: 5px 6px; text-align: left; font-family: monospace; font-size: 9px;">CONSIGNES</th>
                </tr>
              </thead>
              <tbody>
                ${sess.exercises.map((ex, i) => `
                  <tr style="border-bottom: 1px solid #E5E7EB; background: ${i % 2 === 0 ? '#ffffff' : '#F9FAFB'};">
                    <td style="padding: 5px 6px; font-weight: 700; color: #6B7280;">${i + 1}</td>
                    <td style="padding: 5px 6px; font-weight: 700; color: #16232C;">${escapeHtml(ex.name)}</td>
                    <td style="padding: 5px 6px; text-align: center; font-weight: 800; color: #E2622D; font-family: monospace;">${escapeHtml(ex.sets)} × ${escapeHtml(ex.reps)}</td>
                    <td style="padding: 5px 6px; text-align: center; color: #374151; font-family: monospace;">${escapeHtml(ex.rest)}</td>
                    <td style="padding: 5px 6px; color: #4B5563;">${escapeHtml(ex.desc || "Exécution contrôlée.")}</td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
        `).join("")}
      </div>

      <!-- FOOTER SIGNATURE -->
      <div style="border-top: 2px solid #E5E7EB; padding-top: 12px; margin-top: 24px; text-align: center; font-size: 10px; color: #9CA3AF; font-family: monospace;">
        <div>MonProgrammeFit • Programme Officiel de Coaching Sportif</div>
        <div>Rédigé par Coach Abdou BAKARI — Document généré pour usage personnel</div>
      </div>
    </div>
  `;
}

/**
 * Génère et déclenche le téléchargement PDF d'un programme
 * @param {Object} program - Le programme de COACH_PROGRAMS
 */
export async function downloadProgramPDF(program) {
  if (!program) return;

  const htmlContent = generateProgramHTML(program);

  // Créer un conteneur temporaire
  const element = document.createElement("div");
  element.style.position = "absolute";
  element.style.left = "-9999px";
  element.style.top = "-9999px";
  element.style.width = "800px";
  element.innerHTML = htmlContent;
  document.body.appendChild(element);

  const cleanFilename = program.title
    .toLowerCase()
    .replace("monprogrammefit : ", "")
    .replace(/[^a-z0-9]/g, "_")
    .replace(/_+/g, "_");

  const opt = {
    margin: [8, 8, 8, 8],
    filename: `MonProgrammeFit_${cleanFilename}.pdf`,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, logging: false },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
  };

  try {
    const pdfContainer = element.querySelector("#pdf-export-container");
    if (pdfContainer) {
      await html2pdf().set(opt).from(pdfContainer).save();
    }
  } catch (err) {
    console.error("Échec du téléchargement PDF via html2pdf :", err);
    // Modal de secours
    openPrintModal(program);
  } finally {
    if (document.body.contains(element)) {
      document.body.removeChild(element);
    }
  }
}

/**
 * Affiche une modale d'impression/aperçu du programme si souhaité
 * @param {Object} program 
 */
export function openPrintModal(program) {
  if (!program) return;
  const htmlContent = generateProgramHTML(program);
  
  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>MonProgrammeFit — ${escapeHtml(program.title)}</title>
          <style>
            body { margin: 0; padding: 20px; background: #f3f4f6; }
            @media print {
              body { background: white; padding: 0; }
              .no-print { display: none !important; }
            }
          </style>
        </head>
        <body>
          <div class="no-print" style="text-align: center; margin-bottom: 20px;">
            <button onclick="window.print()" style="background: #E2622D; color: white; border: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 14px;">
              🖨️ Imprimer / Enregistrer en PDF
            </button>
          </div>
          ${htmlContent}
        </body>
      </html>
    `);
    printWindow.document.close();
  }
}
