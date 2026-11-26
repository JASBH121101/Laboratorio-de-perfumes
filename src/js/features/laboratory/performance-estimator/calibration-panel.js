import { analyzePerformanceCalibration } from "./calibration.js";
import { CALIBRATION_CONCENTRATIONS, CALIBRATION_ENVIRONMENTS } from "./calibration.js";

const esc = (value = "") => String(value).replace(/[&<>"']/g, (char) => ({
  "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"
})[char]);

const METRICS = [
  ["persistenceHours", "Persistencia", "h"],
  ["projectionInitialMeters", "Proyección inicial", "m"],
  ["projectionLaterMeters", "Proyección tras 1–2 h", "m"]
];

function metricCard(metric) {
  const ready = metric.factor !== null;
  const missing = Math.max(0, metric.requiredSamples - metric.sampleCount);
  return `
    <article class="performance-calibration-metric ${ready ? "is-calibrated" : ""}">
      <div><strong>${esc(metric.label)}</strong><span>${metric.sampleCount}/${metric.requiredSamples} observaciones</span></div>
      <p>${metric.medianObserved === null ? "Aún sin observaciones" : `Mediana observada: ${metric.medianObserved} ${metric.key === "persistenceHours" ? "h" : "m"}`}</p>
      ${ready
        ? `<strong class="performance-calibration-factor">Ajuste local ×${metric.factor.toFixed(1)}</strong><small>Error mediano frente al cálculo base: ${metric.medianErrorPercent}%</small>`
        : `<small>Faltan ${missing} observaciones para habilitar este ajuste.</small>`}
    </article>
  `;
}

function scenarioLabel(key, map) {
  return map[key] || key;
}

export function renderPerformanceCalibration(experiments = []) {
  const observed = (experiments || []).filter((item) => item.observedPerformance);
  if (!observed.length) {
    return `
      <section class="performance-calibration" id="performance-calibration">
        <div class="performance-calibration-heading"><div><p class="eyebrow">BLOCK 23 · LOCAL SENSORY CALIBRATION</p><h2>Calibración <em>sensorial</em></h2><p>Las observaciones registradas pueden contrastarse con el estimador para ajustar sus rangos por escenario.</p></div><span>0 OBSERVACIONES DE RENDIMIENTO</span></div>
        <div class="performance-calibration-empty"><strong>Todavía no hay datos para calibrar.</strong><p>Al guardar una evaluación sensorial, completá al menos uno de los campos opcionales de persistencia o proyección. Registrá el escenario asumido para poder comparar observaciones equivalentes.</p><a href="#projects" data-nav="projects">Registrar una observación ↗</a></div>
        <p class="performance-calibration-disclaimer">La calibración usa observaciones personales y medianas locales. No equivale a una medición instrumental ni valida científicamente el modelo.</p>
      </section>
    `;
  }
  const scenarios = [...new Map(observed.map((item) => {
    const key = item.observedPerformance.concentration + "|" + item.observedPerformance.environment;
    return [key, item.observedPerformance];
  })).entries()].slice(0, 15);
  const cards = scenarios.map(([key, scenario]) => {
    const result = analyzePerformanceCalibration(observed, scenario);
    return `
      <article class="performance-calibration-scenario">
        <header><strong>${esc(scenarioLabel(scenario.concentration, CALIBRATION_CONCENTRATIONS))} · ${esc(scenarioLabel(scenario.environment, CALIBRATION_ENVIRONMENTS))}</strong><span>${result.sampleRecords} registros</span></header>
        <div class="performance-calibration-grid">${METRICS.map(([metricKey]) => metricCard(result.metrics[metricKey])).join("")}</div>
      </article>
    `;
  }).join("");
  return `
    <section class="performance-calibration" id="performance-calibration">
      <div class="performance-calibration-heading"><div><p class="eyebrow">BLOCK 23 · LOCAL SENSORY CALIBRATION</p><h2>Calibración <em>sensorial</em></h2><p>Comparación de observaciones propias contra los rangos base para el mismo escenario.</p></div><span>${observed.length} OBSERVACIONES</span></div>
      <div class="performance-calibration-scenarios">${cards}</div>
      <p class="performance-calibration-disclaimer">Cada indicador necesita al menos tres observaciones válidas del mismo escenario. El ajuste usa la mediana de las razones observado/estimado y se limita para evitar que un dato aislado distorsione demasiado el resultado. Los datos permanecen en este dispositivo; no son mediciones instrumentales ni validación científica.</p>
    </section>
  `;
}
