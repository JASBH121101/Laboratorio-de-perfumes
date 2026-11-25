import {
  analyzeComposition,
  getAnalysisDirections,
  suggestAdjustments
} from "./engine.js";

const escapeHtml = (value = "") => String(value).replace(/[&<>"']/g, (char) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
})[char]);

export function renderCreativeAnalysis(state, direction = "balanced") {
  const analysis = analyzeComposition(state);
  const directions = getAnalysisDirections();
  const suggestions = suggestAdjustments(state, direction, 3);

  if (analysis.isEmpty) {
    return `
      <section class="creative-analysis" id="creative-analysis">
        <div class="analysis-heading"><div><p class="eyebrow">BLOCK 06 · CREATIVE ANALYSIS</p><h2>Lectura <em>olfativa</em></h2><p>El motor revisa la estructura y propone ajustes según la dirección que busques.</p></div><span class="analysis-state">EN ESPERA</span></div>
        <div class="analysis-empty"><span>⌁</span><strong>Primero construí una composición.</strong><p>Cuando agregués notas o acordes, aparecerán indicadores de familia, facetas, pirámide y sugerencias.</p></div>
      </section>
    `;
  }

  const familyBars = analysis.families.slice(0, 4).map((family) => `
    <div class="analysis-bar-row"><div><strong>${escapeHtml(family.label)}</strong><span>${family.points} pts creativos · ${family.share}%</span></div><div class="analysis-track"><span style="width:${family.share}%"></span></div></div>
  `).join("");

  const profileBars = analysis.profileSignals.map((signal) => `
    <div class="analysis-profile-row"><div><span>${escapeHtml(signal.label)}</span><strong>${signal.share}%</strong></div><div class="analysis-track"><span style="width:${signal.share}%"></span></div></div>
  `).join("");

  const roles = analysis.roleCoverage.map((role) => `
    <div class="analysis-role ${role.points ? "is-covered" : "is-missing"}"><span>${escapeHtml(role.role)}</span><strong>${role.points ? `${role.share}%` : "Sin referencias"}</strong></div>
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
        <section class="analysis-card"><h3>Familias presentes</h3><p class="analysis-help">Distribución de puntos por familia comercial/olfativa.</p>${familyBars || '<p>Sin datos.</p>'}</section>
        <section class="analysis-card"><h3>Señales sensoriales</h3><p class="analysis-help">Puntos asociados a facetas descritas en la biblioteca. Las categorías pueden solaparse.</p>${profileBars}</section>
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
