import { analyzeOriginality, suggestPersonalChallenge } from "./engine.js";
import { renderCatalogBenchmark } from "../reference-benchmark/panel.js";

const esc = (value = "") => String(value).replace(/[&<>"']/g, (char) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
})[char]);

function renderMetric(label, value, detail) {
  return `<div class="originality-metric"><span>${esc(label)}</span><strong>${value}%</strong><small>${esc(detail)}</small><div class="originality-track"><i style="width:${value}%"></i></div></div>`;
}

export function renderOriginalityAnalysis(state, creations = []) {
  const result = analyzeOriginality(state, creations);
  const challenge = suggestPersonalChallenge(state, creations);
  if (result.status === "empty") {
    return `
      <section class="originality-panel" id="originality-analysis">
        <div class="originality-heading"><div><p class="eyebrow">PERSONAL ORIGINALITY ENGINE</p><h2>Originalidad e identidad <em>personal</em></h2><p>El análisis se activa cuando exista una composición que evaluar.</p></div><span class="originality-state">EN ESPERA</span></div>
        <p class="originality-empty">Añadí materias de referencia para iniciar el análisis.</p>
      </section>
    `;
  }

  if (result.status === "needs-history") {
    return `
      <section class="originality-panel" id="originality-analysis">
        <div class="originality-heading"><div><p class="eyebrow">PERSONAL ORIGINALITY ENGINE</p><h2>Originalidad e identidad <em>personal</em></h2><p>La primera medición necesita una línea base de tus propias creaciones.</p></div><span class="originality-state">BASE EN CONSTRUCCIÓN</span></div>
        <div class="originality-no-baseline"><strong>Sin comparación suficiente</strong><p>${result.observations.map(esc).join(" ")}</p><small>Guardá una fórmula y registrá otra variante o creación. El sistema solo comparará datos de tu propio archivo.</small></div>
        ${renderCatalogBenchmark(state.items)}
      </section>
    `;
  }

  return `
    <section class="originality-panel" id="originality-analysis">
      <div class="originality-heading"><div><p class="eyebrow">PERSONAL ORIGINALITY ENGINE</p><h2>Originalidad e identidad <em>personal</em></h2><p>Comparación interna frente a tus fórmulas y variantes guardadas.</p></div><span class="originality-state">ANÁLISIS INTERNO</span></div>
      <div class="originality-score-layout">
        <div class="originality-score"><strong>${result.score}</strong><span>/ 100</span><small>ÍNDICE DE DIFERENCIACIÓN INTERNA</small></div>
        <div class="originality-summary"><h3>${esc(result.scoreLabel)}</h3><p>Familia predominante: <strong>${esc(result.dominantFamily)}</strong>. Se compararon ${result.historicalFormulaCount} composiciones históricas diferentes.</p><ul>${result.observations.map((item) => `<li>${esc(item)}</li>`).join("")}</ul></div>
      </div>
      <div class="originality-metrics">
        ${renderMetric("Novedad de referencias", result.noteRarity, "Frecuencia de uso en tu archivo")}
        ${renderMetric("Novedad de combinaciones", result.pairNovelty, "Parejas no registradas juntas")}
        ${renderMetric("Distancia estructural", 100 - result.nearestSimilarity, "Diferencia frente a la fórmula más cercana")}
        ${renderMetric("Afinidad con patrones previos", result.signatureFit, "Similitud de familias frente a tu historial")}
      </div>
      ${challenge ? `
        <div class="originality-challenge"><div><p class="eyebrow">DESAFÍO CREATIVO</p><strong>Explorá ${esc(challenge.name)}</strong><small>${esc(challenge.family)} · ${esc(challenge.reason)}</small></div><button type="button" data-add-to-mix="${esc(challenge.id)}">＋ Explorar referencia</button></div>
      ` : ""}
      ${renderCatalogBenchmark(state.items)}
      <p class="originality-disclaimer">El índice personal mide diferenciación frente a tu archivo local. El benchmark comercial compara notas y perfiles públicos de referencia; no verifica fórmulas químicas, exclusividad, originalidad legal ni similitud olfativa real.</p>
    </section>
  `;
}
