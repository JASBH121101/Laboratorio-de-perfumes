import { toProfessionalReportCsv } from "./engine.js";

const esc = (value = "") => String(value).replace(/[&<>"']/g, (char) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
})[char]);

function formatDate(value, withTime = false) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "No disponible";
  return new Intl.DateTimeFormat("es-NI", withTime
    ? { dateStyle: "medium", timeStyle: "short" }
    : { dateStyle: "medium" }).format(date);
}

function reportOptions(creations, selection = "") {
  return creations.flatMap((creation) => (creation.variants ?? []).map((variant) => {
    const key = JSON.stringify({ creationId: creation.id, variantId: variant.id });
    return `<option value="${esc(key)}" ${key === selection ? "selected" : ""}>${esc(creation.name)} · ${esc(variant.label)} — ${esc(variant.name)}</option>`;
  })).join("");
}

function renderBreakdown(rows, title, hint) {
  if (!rows.length) return "";
  const max = Math.max(...rows.map((item) => item.points), 1);
  return `
    <section class="professional-report-section">
      <h3>${title}</h3><p class="professional-report-hint">${hint}</p>
      <div class="professional-report-bars">
        ${rows.map((item) => `
          <div class="professional-report-bar-row"><span>${esc(item.label)}</span><strong>${item.points}</strong><div><i style="width:${Math.round(item.points/max*100)}%"></i></div></div>
        `).join("")}
      </div>
    </section>
  `;
}

function renderExperiments(experiments) {
  if (!experiments.length) return '<div class="professional-report-empty">No hay observaciones sensoriales asociadas a esta variante.</div>';
  return `
    <div class="professional-report-experiments">
      ${experiments.map((item) => `
        <article class="professional-report-observation">
          <div><strong>${esc(item.title)}</strong><time>${esc(formatDate(item.observedAt,true))}</time></div>
          <small>Versión ${item.versionNumber} · ${esc(item.contextLabel)}${item.observer ? " · " + esc(item.observer) : ""}${item.elapsedMinutes !== null ? " · " + item.elapsedMinutes + " min" : ""}</small>
          <p>${esc(item.impression)}</p>
          ${item.tags.length ? `<div class="professional-report-tags">${item.tags.map((tag) => `<span>${esc(tag)}</span>`).join("")}</div>` : ""}
        </article>
      `).join("")}
    </div>
  `;
}

function renderPreview(report) {
  const rows = report.composition.map((item) => `
    <tr><td><strong>${esc(item.name)}</strong><small>${esc(item.profile)}</small></td><td>${esc(item.family)}</td><td>${esc(item.roles.join(" · "))}</td><td class="number">${item.points}</td></tr>
  `).join("");
  const rated = report.subjectiveRatingSummary.filter((item) => item.average !== null);
  return `
    <article class="professional-report-preview" id="professional-report-preview">
      <header class="professional-report-cover">
        <div class="professional-report-brand"><span>JB</span><div><strong>JB PERFUME LAB</strong><small>FORMULATION & ANALYTICS</small></div></div>
        <p class="eyebrow">PROFESSIONAL REPORT · LOCAL ARCHIVE</p>
        <h2>Dossier de <em>formulación</em></h2>
        <h3>${esc(report.creation.name)}</h3>
        <p>${esc(report.creation.description || "Sin descripción editorial.")}</p>
        <div class="professional-report-meta"><span>Variante ${esc(report.variant.label)} · ${esc(report.variant.name)}</span><span>Versión ${report.variant.versionNumber}</span><span>Generado: ${esc(formatDate(report.generatedAt,true))}</span></div>
      </header>
      <section class="professional-report-section">
        <h3>Resumen ejecutivo</h3>
        <div class="professional-report-kpis">
          <div><strong>${report.summary.referenceCount}</strong><small>REFERENCIAS</small></div>
          <div><strong>${report.summary.totalCreativePoints}/100</strong><small>PUNTOS CREATIVOS</small></div>
          <div><strong>${report.summary.familyCount}</strong><small>FAMILIAS</small></div>
          <div><strong>${report.summary.experimentCount}</strong><small>OBSERVACIONES</small></div>
        </div>
        <p class="professional-report-lead">Familia predominante en esta composición: <strong>${esc(report.summary.dominantFamily)}</strong>.</p>
      </section>
      <section class="professional-report-section">
        <h3>Composición archivada</h3>
        <table class="professional-report-table"><thead><tr><th>Referencia y perfil editorial</th><th>Familia</th><th>Rol</th><th>Puntos</th></tr></thead><tbody>${rows}</tbody></table>
        <p class="professional-report-hint">Los puntos son ponderaciones conceptuales normalizadas y no porcentajes de ingredientes ni dosis.</p>
      </section>
      <div class="professional-report-breakdown-grid">
        ${renderBreakdown(report.familyBreakdown,"Distribución por familia","Suma de puntos según la familia editorial.")}
        ${renderBreakdown(report.facetBreakdown,"Facetas sensoriales","Las facetas pueden solaparse y sus puntos no suman 100.")}
        ${renderBreakdown(report.roleBreakdown,"Estructura orientativa","Los roles editoriales pueden solaparse entre salida, corazón y fondo.")}
      </div>
      <section class="professional-report-section">
        <h3>Registro sensorial asociado</h3>
        <p class="professional-report-hint">Observaciones subjetivas enlazadas a la misma creación y variante. No equivalen a pruebas instrumentales.</p>
        ${renderExperiments(report.sensoryExperiments)}
        ${rated.length ? `<div class="professional-report-rating-summary"><strong>Promedios subjetivos disponibles</strong><div>${rated.map((item) => `<span>${esc(item.label)}: ${item.average}/5 (${item.count})</span>`).join("")}</div></div>` : ""}
      </section>
      <footer class="professional-report-footer">
        <strong>JB PERFUME LAB</strong>
        <p>${esc(report.scopeNote)}</p>
        <small>Documento generado a partir del archivo local del dispositivo. Revisá siempre la versión indicada antes de compartirlo.</small>
      </footer>
    </article>
  `;
}

export function renderProfessionalReports(state = {}) {
  const creations = state.creations ?? [];
  const variants = creations.flatMap((creation) => creation.variants ?? []);
  const options = reportOptions(creations, state.reportSelection ?? "");
  const selectedReport = state.professionalReport ?? null;
  if (!variants.length) {
    return `
      <section class="professional-reports" id="professional-reports-root">
        <div class="professional-report-heading"><div><p class="eyebrow">BLOCK 10 · PROFESSIONAL REPORTS</p><h2>Informes <em>profesionales</em></h2><p>Generá un dossier imprimible desde una creación archivada.</p></div></div>
        <div class="professional-report-empty">Guardá una creación y una variante antes de generar su informe.</div>
      </section>
    `;
  }
  const selectedKey = state.reportSelection || JSON.stringify({ creationId: creations[0].id, variantId: creations[0].variants[0].id });
  return `
    <section class="professional-reports" id="professional-reports-root">
      <div class="professional-report-heading"><div><p class="eyebrow">BLOCK 10 · PROFESSIONAL REPORTS</p><h2>Informes <em>profesionales</em></h2><p>Prepará un dossier de una variante concreta con composición, análisis editorial e historial sensorial asociado.</p></div><span class="professional-report-state">ARCHIVO LOCAL</span></div>
      <div class="professional-report-controls">
        <label for="professional-report-variant">Creación / variante</label>
        <select id="professional-report-variant">${reportOptions(creations,selectedKey)}</select>
        <button type="button" data-action="generate-professional-report">Generar informe</button>
      </div>
      ${selectedReport ? `
        <div class="professional-report-actions">
          <button type="button" data-action="print-professional-report">Imprimir / Guardar como PDF</button>
          <button type="button" data-action="export-professional-report-csv">Exportar CSV</button>
          <button type="button" data-action="export-professional-report-json">Exportar JSON</button>
        </div>
        ${renderPreview(selectedReport)}
      ` : '<div class="professional-report-empty">Elegí una variante y generá el dossier para previsualizarlo aquí.</div>'}
    </section>
  `;
}

export { toProfessionalReportCsv };
