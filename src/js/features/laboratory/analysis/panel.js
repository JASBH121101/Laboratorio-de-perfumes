import {
  analyzeComposition,
  getAnalysisDirections,
  suggestAdjustments
} from "./engine.js";

const escapeHtml = (value = "") => String(value).replace(/[&<>"']/g, (char) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
})[char]);

const FAMILY_PALETTE = Object.freeze({
  "Cítrica": "#d7b75d", "Frutal": "#c77978", "Floral": "#bd8ca6",
  "Aromática": "#8fae92", "Verde": "#91a36e", "Amaderada": "#a17a58",
  "Ámbar y resinosa": "#c18b5c", "Especiada": "#d08b55", "Gourmand": "#c5a06d",
  "Almizclada": "#a6abb7", "Acuática": "#7da9b6", "Cuero": "#8c6b64"
});
const FALLBACK_COLORS = ["#d7b75d", "#c77978", "#bd8ca6", "#8fae92", "#91a36e", "#a17a58", "#c18b5c", "#d08b55", "#c5a06d", "#a6abb7", "#7da9b6", "#8c6b64"];

function renderFamilyDonut(analysis) {
  const total = analysis.totalPoints || 0;
  const radius = 72;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;
  const segments = analysis.families.map((family, index) => {
    const length = total ? (family.points / total) * circumference : 0;
    const color = FAMILY_PALETTE[family.label] || FALLBACK_COLORS[index % FALLBACK_COLORS.length];
    const segment = `<circle class="analysis-donut-segment" cx="110" cy="110" r="${radius}" stroke="${color}" stroke-dasharray="${length.toFixed(2)} ${(circumference - length).toFixed(2)}" stroke-dashoffset="${(-offset).toFixed(2)}"/>`;
    offset += length;
    return segment;
  }).join("");
  const legend = analysis.families.map((family, index) => {
    const color = FAMILY_PALETTE[family.label] || FALLBACK_COLORS[index % FALLBACK_COLORS.length];
    return `<div class="analysis-family-legend-row">
      <span class="analysis-family-swatch" style="background:${color}"></span>
      <span>${escapeHtml(family.label)}</span><strong>${family.share}%</strong><small>${family.points} pts</small>
      <div class="analysis-family-legend-track" role="progressbar" aria-label="Participación de ${escapeHtml(family.label)}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${family.share}"><span style="width:${family.share}%;background:${color}"></span></div>
    </div>`;
  }).join("");
  return `<div class="analysis-family-visual"><svg class="analysis-family-donut" viewBox="0 0 220 220" role="img" aria-label="Distribución de puntos por familia"><title>Distribución de familias olfativas</title><circle class="analysis-donut-track" cx="110" cy="110" r="${radius}"/><g transform="rotate(-90 110 110)">${segments}</g><text class="analysis-donut-total" x="110" y="108">${total}</text><text class="analysis-donut-caption" x="110" y="128">PUNTOS</text></svg><div class="analysis-family-legend">${legend}</div></div>`;
}

function renderProfileRadar(signals = []) {
  const center = 140;
  const radius = 91;
  const items = signals.slice(0, 6);
  const pointAt = (index, value) => {
    const angle = -Math.PI / 2 + (index / items.length) * Math.PI * 2;
    const r = radius * Math.max(0, Math.min(100, value)) / 100;
    return [center + Math.cos(angle) * r, center + Math.sin(angle) * r];
  };
  const grid = [25, 50, 75, 100].map(level => {
    const points = items.map((_, index) => pointAt(index, level).map(v => v.toFixed(1)).join(",")).join(" ");
    return `<polygon class="analysis-radar-grid" points="${points}"/>`;
  }).join("");
  const axes = items.map((_, index) => {
    const [x, y] = pointAt(index, 100);
    return `<line class="analysis-radar-axis" x1="${center}" y1="${center}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}"/>`;
  }).join("");
  const points = items.map((item, index) => pointAt(index, item.share).map(v => v.toFixed(1)).join(",")).join(" ");
  const dots = items.map((item, index) => {
    const [x, y] = pointAt(index, item.share);
    return `<circle class="analysis-radar-dot" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3.5"/>`;
  }).join("");
  return `<svg class="analysis-profile-radar" viewBox="0 0 280 280" role="img" aria-label="Radar de facetas sensoriales"><title>Perfil sensorial conceptual</title>${grid}${axes}<polygon class="analysis-radar-area" points="${points}"/>${dots}</svg>`;
}

export function renderCreativeAnalysis(state, direction = "balanced") {
  const analysis = analyzeComposition(state);
  const directions = getAnalysisDirections();
  const suggestions = suggestAdjustments(state, direction, 3);

  if (analysis.isEmpty) {
    return `
      <section class="creative-analysis" id="creative-analysis">
        <div class="analysis-heading"><div><p class="eyebrow">BLOCK 06 · CREATIVE ANALYSIS</p><h2>Lectura <em>olfativa</em></h2><p>El motor revisa la estructura y propone ajustes según la dirección que busques.</p></div><span class="analysis-state">EN ESPERA</span></div>
        <div class="analysis-empty">
          <span aria-hidden="true">⌁</span><strong>Primero construí una composición.</strong>
          <p>Cuando agregués notas o acordes, aparecerán indicadores de familia, facetas, pirámide y sugerencias.</p>
          <a class="analysis-empty-link" href="#mix-studio">Volver a composición ↗</a>
        </div>
      </section>
    `;
  }

  const familyChart = renderFamilyDonut(analysis);
  const profileRadar = renderProfileRadar(analysis.profileSignals);
  const profileBars = analysis.profileSignals.map((signal) => `
    <div class="analysis-profile-row"><div><span>${escapeHtml(signal.label)}</span><strong>${signal.share}%</strong></div><div class="analysis-track"><span style="width:${Math.min(100, signal.share)}%"></span></div></div>
  `).join("");



  const roles = analysis.roleCoverage.map((role) => `
    <div class="analysis-role ${role.points ? "is-covered" : "is-missing"}"><span>${escapeHtml(role.role)}</span><strong>${role.points ? `${role.share}%` : "Sin referencias"}</strong><div class="analysis-role-track"><span style="width:${Math.min(100, role.share)}%"></span></div></div>
  `).join("");

  const notes = analysis.observations.map((observation) => `<li>${escapeHtml(observation)}</li>`).join("");

  const suggestionCards = suggestions.map((suggestion) => `
    <article class="analysis-suggestion">
      <div class="analysis-suggestion-top"><span class="status-pill">${escapeHtml(suggestion.family)}</span><span class="analysis-suggestion-kind">${suggestion.kind === "Acorde" ? "ACORDE" : "NOTA"}</span></div>
      <h4>${escapeHtml(suggestion.name)}</h4>
      <p>${escapeHtml(suggestion.profile)}</p>
      <div class="analysis-reason"><strong>Por qué aparece</strong><span>${escapeHtml(suggestion.reason)}</span></div>
      <div class="analysis-tradeoff"><strong>Qué podría cambiar</strong><span>${escapeHtml(suggestion.benefit)} ${escapeHtml(suggestion.tradeoff)}</span></div>
      <button class="analysis-add" type="button" data-add-to-mix="${escapeHtml(suggestion.id)}">＋ Añadir a composición</button>
    </article>
  `).join("");

  return `
    <section class="creative-analysis" id="creative-analysis">
      <div class="analysis-heading">
        <div><p class="eyebrow">BLOCK 06 · CREATIVE ANALYSIS</p><h2>Lectura <em>olfativa</em></h2><p>Una lectura heurística de tus referencias y sus pesos creativos; no es una medición del olor real.</p></div>
        <span class="analysis-state">ANÁLISIS ACTUAL</span>
      </div>
      <div class="analysis-overview">
        <div><strong>${analysis.referenceCount}</strong><small>REFERENCIAS</small></div>
        <div><strong>${analysis.familyCount}</strong><small>FAMILIAS</small></div>
        <div><strong>${analysis.totalPoints}</strong><small>PUNTOS CREATIVOS</small></div>
      </div>
      <div class="analysis-grid">
        <section class="analysis-card"><h3>Familias presentes</h3><p class="analysis-help">Participación de cada familia en los puntos creativos.</p>${familyChart}</section>
        <section class="analysis-card"><h3>Señales sensoriales</h3><p class="analysis-help">Radar conceptual; las facetas pueden solaparse y no suman 100%.</p><div class="analysis-radar-layout">${profileRadar}<div class="analysis-profile-list">${profileBars}</div></div></section>
        <section class="analysis-card"><h3>Cobertura de pirámide</h3><p class="analysis-help">Peso de referencias asociadas a cada zona; una nota puede aparecer en varias.</p><div class="analysis-roles">${roles}</div></section>
        <section class="analysis-card"><h3>Observaciones</h3><p class="analysis-help">Aspectos que conviene revisar, no veredictos automáticos.</p><ul class="analysis-observations">${notes}</ul></section>
      </div>
      <div class="analysis-advisor">
        <div class="analysis-advisor-heading"><div><p class="eyebrow">CREATIVE ADVISOR</p><h3>¿Hacia dónde querés llevarla?</h3><p>Elegí una intención. El motor busca referencias existentes que podrían mover el perfil en esa dirección.</p></div></div>
        <label class="analysis-direction-label" for="analysis-direction">Dirección creativa</label>
        <select id="analysis-direction" data-analysis-direction>
          ${directions.map((item) => `<option value="${escapeHtml(item.id)}" ${item.id === direction ? "selected" : ""}>${escapeHtml(item.label)}</option>`).join("")}
        </select>
        <div class="analysis-suggestions"><div class="analysis-suggestions-title"><strong>Referencias para explorar</strong><span>${suggestions.length} sugerencias</span></div>${suggestionCards || '<p class="analysis-no-suggestions">No hay sugerencias nuevas para esta dirección. Probá otra intención o revisá la composición actual.</p>'}</div>
      </div>
      <p class="analysis-disclaimer">Los indicadores se calculan desde las descripciones editoriales y los puntos creativos de esta biblioteca. No detectan una fórmula química, no miden compatibilidad molecular, intensidad, duración, proyección ni estela, y no sustituyen una evaluación olfativa humana.</p>
    </section>
  `;
}
