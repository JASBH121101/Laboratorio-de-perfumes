import { compareSavedCompositions, makeComparisonSelectionKey } from "./engine.js";

const esc = (value = "") => String(value).replace(/[&<>"']/g, (char) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
})[char]);

function listSavedVariants(creations = []) {
  return creations.flatMap((creation) => (creation.variants ?? []).map((variant) => ({
    key: makeComparisonSelectionKey(creation.id, variant.id),
    label: `${creation.name} · ${variant.label} — ${variant.name}`
  })));
}

function renderBreakdown(rows, key, title, hint) {
  if (!rows.length) return "";
  return `
    <section class="comparison-breakdown">
      <div class="comparison-section-head"><h4>${title}</h4><small>${hint}</small></div>
      <div class="comparison-breakdown-list">
        ${rows.map((row) => {
          const label = row[key];
          const maximum = Math.max(row.leftPoints, row.rightPoints, 1);
          return `
            <div class="comparison-breakdown-row">
              <strong>${esc(label)}</strong>
              <div class="comparison-bars">
                <span class="comparison-bar comparison-bar--left" style="width:${Math.round(row.leftPoints / maximum * 100)}%" title="Base: ${row.leftPoints} puntos"></span>
                <span class="comparison-bar comparison-bar--right" style="width:${Math.round(row.rightPoints / maximum * 100)}%" title="Comparada: ${row.rightPoints} puntos"></span>
              </div>
              <span class="comparison-values">${row.leftPoints} / ${row.rightPoints}</span>
              <b class="${row.delta > 0 ? "is-positive" : row.delta < 0 ? "is-negative" : ""}">${row.delta > 0 ? "+" : ""}${row.delta}</b>
            </div>
          `;
        }).join("")}
      </div>
    </section>
  `;
}

function renderResult(result) {
  const rows = result.references.map((row) => `
    <div class="comparison-reference-row">
      <span><strong>${esc(row.name)}</strong><small>${esc(row.family)}</small></span>
      <span>${row.leftPoints}</span><span>${row.rightPoints}</span>
      <b class="${row.delta > 0 ? "is-positive" : row.delta < 0 ? "is-negative" : ""}">${row.delta > 0 ? "+" : ""}${row.delta}</b>
    </div>
  `).join("");
  return `
    <div class="comparison-results">
      <div class="comparison-kpis">
        <div><strong>${result.similarity}%</strong><small>COINCIDENCIA ESTRUCTURAL</small></div>
        <div><strong>${result.difference}%</strong><small>DIFERENCIA ESTRUCTURAL</small></div>
        <div><strong>${result.sharedCount}</strong><small>REFERENCIAS COMPARTIDAS</small></div>
        <div><strong>${result.changedCount}</strong><small>REFERENCIAS CON CAMBIO</small></div>
      </div>
      <div class="comparison-summary">
        <p><strong>Base:</strong> ${esc(result.left.name)}</p>
        <p><strong>Comparada:</strong> ${esc(result.right.name)}</p>
        <p><strong>Cambios:</strong> ${result.added.length} añadidas · ${result.removed.length} retiradas.</p>
      </div>
      <div class="comparison-legend"><span><i class="comparison-legend-left"></i> Base</span><span><i class="comparison-legend-right"></i> Comparada</span><small>Las barras usan el mayor valor de cada fila como referencia visual.</small></div>
      <div class="comparison-analysis-grid">
        ${renderBreakdown(result.familyRows, "family", "Familias olfativas", "Puntos creativos agrupados por familia")}
        ${renderBreakdown(result.facetRows, "facet", "Facetas sensoriales", "Una referencia puede aportar varias facetas; estos valores se solapan")}
        ${renderBreakdown(result.roleRows, "role", "Estructura orientativa", "Salida, corazón y fondo según la biblioteca editorial")}
      </div>
      <section class="comparison-reference-table">
        <div class="comparison-section-head"><h4>Detalle por referencia</h4><small>Δ = comparada − base</small></div>
        <div class="comparison-reference-header"><span>Referencia</span><span>Base</span><span>Comparada</span><span>Δ</span></div>
        ${rows}
      </section>
      <p class="comparison-disclaimer">La coincidencia y las diferencias se calculan únicamente con las referencias y sus puntos creativos guardados. Las familias, facetas y roles son clasificaciones editoriales orientativas. Esto no mide olor real, compatibilidad química, rendimiento ni similitud comercial.</p>
    </div>
  `;
}

export function renderAnalyticalComparison(state = {}) {
  const options = listSavedVariants(state.creations);
  if (options.length < 2) {
    return `
      <section class="analytical-comparison" id="archive-comparison-root">
        <div class="comparison-heading"><div><p class="eyebrow">BLOCK 07 · ANALYTICAL COMPARISON</p><h2>Comparación <em>analítica</em></h2><p>Compará dos variantes guardadas, incluso si pertenecen a creaciones diferentes.</p></div></div>
        <div class="comparison-empty"><strong>Necesitás al menos dos composiciones guardadas.</strong><p>Guardá otra creación o agregá una variante desde el archivo para habilitar la comparación.</p></div>
      </section>
    `;
  }

  const requested = state.comparisonPair ?? {};
  const leftKey = options.some((option) => option.key === requested.leftKey) ? requested.leftKey : options[0].key;
  const rightKey = options.some((option) => option.key === requested.rightKey) ? requested.rightKey : options[1].key;
  let result = null;
  if (requested.leftKey && requested.rightKey && leftKey === requested.leftKey && rightKey === requested.rightKey) {
    try { result = compareSavedCompositions(state.creations, leftKey, rightKey); } catch { result = null; }
  }

  return `
    <section class="analytical-comparison" id="archive-comparison-root">
      <div class="comparison-heading"><div><p class="eyebrow">BLOCK 07 · ANALYTICAL COMPARISON</p><h2>Comparación <em>analítica</em></h2><p>Elegí dos composiciones guardadas para estudiar qué comparten, qué cambió y cómo se redistribuyen sus familias y facetas.</p></div><span class="comparison-state">ARCHIVO LOCAL</span></div>
      <div class="comparison-controls">
        <label for="comparison-left">Composición base</label>
        <select id="comparison-left">${options.map((option) => `<option value="${esc(option.key)}" ${option.key === leftKey ? "selected" : ""}>${esc(option.label)}</option>`).join("")}</select>
        <label for="comparison-right">Comparar con</label>
        <select id="comparison-right">${options.map((option) => `<option value="${esc(option.key)}" ${option.key === rightKey ? "selected" : ""}>${esc(option.label)}</option>`).join("")}</select>
        <button type="button" data-action="compare-saved-compositions">Analizar diferencias</button>
      </div>
      ${result ? renderResult(result) : '<p class="comparison-prompt">Seleccioná dos composiciones distintas y pulsá “Analizar diferencias”.</p>'}
    </section>
  `;
}
