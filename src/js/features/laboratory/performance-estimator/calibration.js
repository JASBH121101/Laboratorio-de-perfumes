import { estimatePerformance } from "./engine.js";

export const PERFORMANCE_CALIBRATION_MIN_SAMPLES = 3;
export const CALIBRATION_CONCENTRATIONS = Object.freeze(["edt", "edp", "parfum"]);
export const CALIBRATION_ENVIRONMENTS = Object.freeze(["neutral", "warm", "cool", "outdoor", "indoor"]);

const METRICS = Object.freeze([
  { key: "persistenceHours", label: "Persistencia", estimate: (result) => result.persistence?.hours },
  { key: "projectionInitialMeters", label: "Proyección inicial", estimate: (result) => result.projection?.initialMeters },
  { key: "projectionLaterMeters", label: "Proyección tras 1–2 h", estimate: (result) => result.projection?.laterMeters }
]);
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const round = (value) => Math.round(value * 10) / 10;
const midpoint = (range) => Array.isArray(range) && range.length === 2
  ? (Number(range[0]) + Number(range[1])) / 2 : null;
const median = (values) => {
  const sorted = [...values].sort((a,b) => a-b);
  if (!sorted.length) return null;
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle-1] + sorted[middle]) / 2;
};
const scenarioFor = (options = {}) => ({
  concentration: CALIBRATION_CONCENTRATIONS.includes(options.concentration) ? options.concentration : "edp",
  environment: CALIBRATION_ENVIRONMENTS.includes(options.environment) ? options.environment : "neutral"
});

function sameScenario(observed, scenario) {
  return observed?.concentration === scenario.concentration
    && observed?.environment === scenario.environment;
}

export function analyzePerformanceCalibration(experiments = [], options = {}) {
  const scenario = scenarioFor(options);
  const records = (Array.isArray(experiments) ? experiments : [])
    .filter((record) => record?.observedPerformance && sameScenario(record.observedPerformance, scenario));
  const metrics = Object.fromEntries(METRICS.map((metric) => {
    const samples = [];
    for (const record of records) {
      const observed = Number(record.observedPerformance?.[metric.key]);
      if (!Number.isFinite(observed) || observed < 0 || !Array.isArray(record.composition)) continue;
      const prediction = estimatePerformance(record.composition, scenario);
      if (prediction.status !== "ready") continue;
      const predicted = midpoint(metric.estimate(prediction));
      if (!Number.isFinite(predicted) || predicted < 0.1) continue;
      samples.push({ observed, predicted, ratio: observed / predicted });
    }
    const ratios = samples.map((item) => item.ratio);
    const rawFactor = median(ratios);
    const factor = samples.length >= PERFORMANCE_CALIBRATION_MIN_SAMPLES
      ? round(clamp(rawFactor, 0.5, 1.5)) : null;
    const medianObserved = median(samples.map((item) => item.observed));
    const medianEstimated = median(samples.map((item) => item.predicted));
    const medianErrorPercent = samples.length
      ? round(median(samples.map((item) => (item.observed - item.predicted) / Math.max(0.1, item.predicted) * 100)))
      : null;
    return [metric.key, {
      label: metric.label,
      sampleCount: samples.length,
      requiredSamples: PERFORMANCE_CALIBRATION_MIN_SAMPLES,
      medianObserved: medianObserved === null ? null : round(medianObserved),
      medianEstimated: medianEstimated === null ? null : round(medianEstimated),
      medianErrorPercent,
      rawFactor: rawFactor === null ? null : round(rawFactor),
      factor,
      clamped: rawFactor !== null && factor !== null && Math.abs(rawFactor - factor) > 0.0001
    }];
  }));
  const available = Object.values(metrics).filter((metric) => metric.sampleCount > 0).length;
  const calibrated = Object.values(metrics).filter((metric) => metric.factor !== null).length;
  return {
    status: calibrated ? "ready" : available ? "collecting" : "empty",
    scenario,
    sampleRecords: records.length,
    minimumSamples: PERFORMANCE_CALIBRATION_MIN_SAMPLES,
    calibratedMetrics: calibrated,
    metrics,
    notice: calibrated
      ? "Los factores son ajustes heurísticos derivados de observaciones guardadas en este dispositivo. No son una validación instrumental."
      : "Se necesitan al menos tres observaciones válidas por indicador y escenario para aplicar un ajuste. Mientras tanto se conserva la estimación base."
  };
}

export function applyPerformanceCalibration(result, calibration) {
  if (!result || result.status !== "ready") return result;
  const output = {
    ...result,
    persistence: { ...result.persistence, hours: [...result.persistence.hours] },
    projection: {
      ...result.projection,
      initialMeters: [...result.projection.initialMeters],
      laterMeters: [...result.projection.laterMeters]
    }
  };
  const factors = calibration?.metrics || {};
  const persistenceFactor = factors.persistenceHours?.factor;
  const initialFactor = factors.projectionInitialMeters?.factor;
  const laterFactor = factors.projectionLaterMeters?.factor;
  if (persistenceFactor !== null && persistenceFactor !== undefined) {
    output.persistence.hours = output.persistence.hours.map((value) => round(clamp(value * persistenceFactor, 0, 48)));
  }
  if (initialFactor !== null && initialFactor !== undefined) {
    output.projection.initialMeters = output.projection.initialMeters.map((value) => round(clamp(value * initialFactor, 0, 10)));
  }
  if (laterFactor !== null && laterFactor !== undefined) {
    output.projection.laterMeters = output.projection.laterMeters.map((value) => round(clamp(value * laterFactor, 0, 10)));
  }
  return output;
}

export function getCalibratedPerformanceEstimate(items = [], options = {}, experiments = []) {
  const base = estimatePerformance(items, options);
  const calibration = analyzePerformanceCalibration(experiments, options);
  return {
    base,
    calibration,
    adjusted: applyPerformanceCalibration(base, calibration)
  };
}
