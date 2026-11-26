import { getCalibratedPerformanceEstimate } from "./calibration.js";

const esc = (value = "") => String(value ?? "").replace(/[&<>"']/g, (char) => ({
  "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"
})[char]);
const fmt = (range) => range.map((value) => String(value).replace(/\.0$/, "")).join("–");

export function renderPerformanceEstimate(items = [], options = {}, experiments = []) {
  const { base, calibration, adjusted } = getCalibratedPerformanceEstimate(items, options, experiments);
  const concentration = options.concentration || "edp";
  const environment = options.environment || "neutral";
  const controls = `
    <div class="performance-estimate-controls">
      <label>Concentración asumida<select id="performance-concentration">
        <option value="edt" ${concentration === "edt" ? "selected" : ""}>EDT</option>
        <option value="edp" ${concentration === "edp" ? "selected" : ""}>EDP</option>
        <option value="parfum" ${concentration === "parfum" ? "selected" : ""}>Parfum</option>
      </select></label>
      <label>Condición estimada<select id="performance-environment">
        <option value="neutral" ${environment === "neutral" ? "selected" : ""}>Ambiente neutro</option>
        <option value="warm" ${environment === "warm" ? "selected" : ""}>Clima cálido</option>
        <option value="cool" ${environment === "cool" ? "selected" : ""}>Clima fresco</option>
        <option value="outdoor" ${environment === "outdoor" ? "selected" : ""}>Exterior / ventilado</option>
        <option value="indoor" ${environment === "indoor" ? "selected" : ""}>Interior</option>
      </select></label>
    </div>`;
  if (base.status === "empty") {
    return `<section class="performance-estimate" id="performance-estimate">
      <div class="performance-estimate-heading"><p class="eyebrow">PERFORMANCE ESTIMATE · CONCEPTUAL</p><h2>Rendimiento <em>orientativo</em></h2></div>
      ${controls}<p class="performance-estimate-empty">Añadí materias al formulador para estimar persistencia y proyección.</p>
    </section>`;
  }
  if (base.status !== "ready") {
    return `<section class="performance-estimate" id="performance-estimate"><h2>Rendimiento orientativo</h2>${controls}<p>${esc(base.notice)}</p></section>`;
  }
  const hours = fmt(adjusted.persistence.hours);
  const initial = fmt(adjusted.projection.initialMeters);
  const later = fmt(adjusted.projection.laterMeters);
  const factorNote = (key) => {
    const metric = calibration.metrics[key];
    return metric?.factor !== null && metric?.factor !== undefined
      ? ` · ajuste local ×${metric.factor.toFixed(1)} con ${metric.sampleCount} observaciones`
      : "";
  };
  return `<section class="performance-estimate" id="performance-estimate">
    <div class="performance-estimate-heading"><div><p class="eyebrow">PERFORMANCE ESTIMATE · CONCEPTUAL</p><h2>Rendimiento <em>orientativo</em></h2><p>Estimación calculada para la composición actual y los supuestos seleccionados.</p></div><span class="performance-estimate-confidence">Confianza ${esc(base.confidence)}</span></div>
    ${controls}
    <div class="performance-estimate-grid">
      <article class="performance-estimate-card"><small>POSIBLE PERSISTENCIA EN PIEL</small><strong>${hours} h</strong><span>${esc(base.persistence.label)} · ${base.persistence.score}/100${esc(factorNote("persistenceHours"))}</span><p>Rango orientativo de duración detectable; no equivale a una prueba real.</p></article>
      <article class="performance-estimate-card"><small>PROYECCIÓN INICIAL · PRIMERA HORA</small><strong>${initial} m</strong><span>${esc(base.projection.label)} · ${base.projection.score}/100${esc(factorNote("projectionInitialMeters"))}</span><p>Distancia estimada de percepción en la apertura.</p></article>
      <article class="performance-estimate-card performance-estimate-card--wide"><small>PROYECCIÓN DESPUÉS DE 1–2 HORAS</small><strong>${later} m</strong><span>Proyección más cercana a la piel${esc(factorNote("projectionLaterMeters"))}</span><p>La proyección suele reducirse con la evolución; no se puede medir la distancia real a partir de puntos creativos.</p></article>
    </div>
    <p class="performance-estimate-assumptions">Supuestos: ${esc(base.options.concentration.label)} · ${esc(base.options.environment.label)}. Cambialos para explorar escenarios.</p>
    <p class="performance-estimate-calibration">${calibration.calibratedMetrics ? `Ajustes locales activos para ${calibration.calibratedMetrics} de 3 indicadores.` : `Calibración pendiente: ${calibration.minimumSamples} observaciones por indicador y escenario.`}</p>
    <p class="performance-estimate-disclaimer">${esc(base.notice)} La calibración no convierte la estimación en una medición real.</p>
  </section>`;
}
