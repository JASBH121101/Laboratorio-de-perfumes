import { analyzePersonalSignature } from "./engine.js";

const esc = (value = "") => String(value).replace(/[&<>"']/g, (char) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
})[char]);

const FAMILY_COLORS = ["#d9b27c", "#8d687d", "#7da9b6", "#8fae92", "#c77978", "#a17a58", "#91a36e", "#9b91b6"];

function formatDate(value, withTime = false) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "Fecha no disponible";
  return new Intl.DateTimeFormat("es-NI", withTime
    ? { dateStyle: "medium", timeStyle: "short" }
    : { dateStyle: "medium" }).format(date);
}

function renderFamilyKey(families) {
  return families.map((family, index) => `
    <span class="signature-family-key"><i style="--signature-color:${FAMILY_COLORS[index % FAMILY_COLORS.length]}"></i>${esc(family)}</span>
  `).join("");
}

function renderEvolution(result) {
  if (result.familyEvolution.length === 0) return "";
  const rows = result.familyEvolution.map((row, index) => {
    const maximum = Math.max(row.firstShare, row.latestShare, 1);
    return `
      <div class="signature-evolution-row">
        <strong>${esc(row.family)}</strong>
        <div class="signature-evolution-bars">
          <span class="signature-evolution-bar signature-evolution-bar--first" style="width:${Math.round(row.firstShare / maximum * 100)}%" title="Primer registro: ${row.firstShare} puntos"></span>
          <span class="signature-evolution-bar signature-evolution-bar--latest" style="width:${Math.round(row.latestShare / maximum * 100)}%" title="Registro más reciente: ${row.latestShare} puntos"></span>
        </div>
        <span class="signature-evolution-values">${row.firstShare} → ${row.latestShare}</span>
        <b class="${row.delta > 0 ? "is-positive" : row.delta < 0 ? "is-negative" : ""}">${row.delta > 0 ? "+" : ""}${row.delta}</b>
      </div>
    `;
  }).join("");
  return `
    <section class="signature-card">
      <div class="signature-section-heading"><div><h3>Movimiento de tu firma</h3><p>Comparación del primer registro frente al más reciente, en puntos creativos.</p></div></div>
      <div class="signature-legend"><span><i class="signature-legend-first"></i> Primer registro</span><span><i class="signature-legend-latest"></i> Más reciente</span></div>
      <div class="signature-evolution-list">${rows}</div>
    </section>
  `;
}

function renderTimeline(result) {
  const familyNames = result.familyProfile.slice(0, 5).map((row) => row.family);
  const records = result.timeline.map((snapshot) => {
    const segments = snapshot.familyProfile.map((row) => {
      const colorIndex = familyNames.indexOf(row.family);
      const color = colorIndex >= 0 ? FAMILY_COLORS[colorIndex] : "var(--line-strong)";
      return `<span class="signature-timeline-segment" style="width:${row.share}%;--signature-color:${color}" title="${esc(row.family)}: ${row.share} puntos"></span>`;
    }).join("");
    const versionLabel = snapshot.versionNumber ? `v${snapshot.versionNumber}` : "Registro";
    return `
      <article class="signature-timeline-item">
        <span class="signature-timeline-marker" aria-hidden="true"></span>
        <div class="signature-timeline-content">
          <div class="signature-timeline-top"><strong>${esc(snapshot.creationName)}</strong><time datetime="${esc(snapshot.createdAt)}">${esc(formatDate(snapshot.createdAt, true))}</time></div>
          <p>${esc(snapshot.variantLabel)} · ${esc(snapshot.variantName)} · ${versionLabel} · ${snapshot.referenceCount} referencias</p>
          <div class="signature-timeline-bar" role="img" aria-label="Distribución conceptual por familia: ${snapshot.familyProfile.map((row) => `${row.family} ${row.share} puntos`).join(", ")}">${segments}</div>
          <small>Familia predominante: <strong>${esc(snapshot.dominantFamily)}</strong>${snapshot.note ? ` · ${esc(snapshot.note)}` : ""}</small>
        </div>
      </article>
    `;
  }).join("");
  return `
    <section class="signature-card">
      <div class="signature-section-heading"><div><h3>Historial de evolución</h3><p>Los últimos ${result.timeline.length} registros guardados, ordenados del más reciente al más antiguo.</p></div></div>
      <div class="signature-timeline">${records}</div>
      <div class="signature-family-keys">${renderFamilyKey(familyNames)}</div>
    </section>
  `;
}

function renderFrequentReferences(references, snapshotCount) {
  if (!references.length) return '<p class="signature-empty-inline">Todavía no hay referencias recurrentes.</p>';
  return `
    <div class="signature-reference-list">
      ${references.map((item) => `
        <div class="signature-reference-row">
          <span><strong>${esc(item.name)}</strong><small>${esc(item.family)} · promedio ${item.averagePoints} puntos cuando aparece</small></span>
          <span class="signature-reference-frequency"><strong>${item.appearances}/${snapshotCount}</strong><small>registros</small></span>
          <div class="signature-reference-track"><i style="width:${item.appearanceShare}%"></i></div>
        </div>
      `).join("")}
    </div>
  `;
}

export function renderPersonalSignatureHistory(state = {}) {
  const result = analyzePersonalSignature(state.creations ?? []);
  if (result.status === "empty") {
    return `
      <section class="personal-signature-history" id="signature-history-root">
        <div class="signature-heading"><div><p class="eyebrow">BLOCK 08 · PERSONAL SIGNATURE HISTORY</p><h2>Tu firma <em>personal</em></h2><p>La evolución se construye a partir de versiones guardadas en tu archivo local.</p></div><span class="signature-state">SIN HISTORIAL</span></div>
        <div class="signature-empty"><strong>Aún no hay registros para estudiar tu firma.</strong><p>Guardá una creación y registrá nuevas versiones o variantes. Cada versión conservada alimentará esta línea de tiempo.</p>${result.skippedCount ? `<small>${result.skippedCount} registros no válidos fueron omitidos.</small>` : ""}</div>
      </section>
    `;
  }

  const topFamilies = result.familyProfile.slice(0, 5);
  const familyBars = topFamilies.map((row, index) => `
    <div class="signature-average-row">
      <span>${esc(row.family)}</span><strong>${row.averageShare}%</strong>
      <div><i style="width:${row.averageShare}%;--signature-color:${FAMILY_COLORS[index % FAMILY_COLORS.length]}"></i></div>
    </div>
  `).join("");
  const skippedNote = result.skippedCount
    ? `<p class="signature-data-note">${result.skippedCount} registro(s) omitidos por datos incompletos o pesos inválidos.</p>`
    : "";

  return `
    <section class="personal-signature-history" id="signature-history-root">
      <div class="signature-heading"><div><p class="eyebrow">BLOCK 08 · PERSONAL SIGNATURE HISTORY</p><h2>Tu firma <em>personal</em></h2><p>Patrones de familias y referencias que aparecen en tus versiones guardadas. El historial describe tus decisiones creativas; no mide el olor real.</p></div><span class="signature-state">ARCHIVO LOCAL · ${result.snapshotCount} REGISTROS</span></div>
      <div class="signature-kpis">
        <article><span>REGISTROS ANALIZADOS</span><strong>${result.snapshotCount}</strong><small>${result.distinctFormulaCount} estructuras distintas</small></article>
        <article><span>REFERENCIAS EXPLORADAS</span><strong>${result.distinctReferenceCount}</strong><small>De la biblioteca editorial</small></article>
        <article><span>FAMILIAS EXPLORADAS</span><strong>${result.familyCount}</strong><small>Según clasificación editorial</small></article>
        <article><span>FAMILIA PREDOMINANTE ACTUAL</span><strong>${esc(result.dominantFamily)}</strong><small>Predomina en el último registro</small></article>
      </div>
      <div class="signature-insight">
        <span>Patrón dominante recurrente</span>
        <strong>${esc(result.recurringDominantFamily)}</strong>
        <small>Fue la familia predominante en ${result.recurringDominantShare}% de los registros guardados.</small>
      </div>
      <div class="signature-analysis-grid">
        <section class="signature-card">
          <div class="signature-section-heading"><div><h3>Familias más presentes</h3><p>Participación media por registro; los puntos se normalizan dentro de cada versión.</p></div></div>
          <div class="signature-average-list">${familyBars}</div>
        </section>
        <section class="signature-card">
          <div class="signature-section-heading"><div><h3>Referencias recurrentes</h3><p>Frecuencia con la que una materia aparece en los registros analizados.</p></div></div>
          ${renderFrequentReferences(result.topReferences, result.snapshotCount)}
        </section>
        ${renderEvolution(result)}
      </div>
      ${renderTimeline(result)}
      ${skippedNote}
      <p class="signature-disclaimer">Este análisis utiliza exclusivamente las versiones guardadas en este dispositivo y los metadatos editoriales de la biblioteca. No determina personalidad, calidad, compatibilidad molecular, desempeño ni identidad olfativa objetiva. Una faceta puede repetirse y una composición puede cambiar sin que eso implique una evaluación sensorial.</p>
    </section>
  `;
}
