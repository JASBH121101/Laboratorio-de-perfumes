import test from "node:test";
import assert from "node:assert/strict";
import { estimatePerformance } from "../src/js/features/laboratory/performance-estimator/engine.js";
import {
  analyzePerformanceCalibration, applyPerformanceCalibration, getCalibratedPerformanceEstimate,
  PERFORMANCE_CALIBRATION_MIN_SAMPLES
} from "../src/js/features/laboratory/performance-estimator/calibration.js";

const composition = [
  { id: "bergamot", points: 35 },
  { id: "rose", points: 25 },
  { id: "cedarwood", points: 40 }
];
const scenario = { concentration: "edp", environment: "neutral" };

function observation(id, multipliers = {}, options = scenario) {
  const baseline = estimatePerformance(composition, options);
  return {
    id,
    composition,
    observedPerformance: {
      ...options,
      persistenceHours: baseline.persistence.hours.reduce((a,b)=>a+b,0) / 2 * (multipliers.persistence ?? 1),
      projectionInitialMeters: baseline.projection.initialMeters.reduce((a,b)=>a+b,0) / 2 * (multipliers.initial ?? 1),
      projectionLaterMeters: baseline.projection.laterMeters.reduce((a,b)=>a+b,0) / 2 * (multipliers.later ?? 1)
    }
  };
}

test("calibration waits for three same-scenario observations per metric", () => {
  const result = analyzePerformanceCalibration([
    observation("one", { persistence: 1.2 }),
    observation("two", { persistence: 1.1 })
  ], scenario);
  assert.equal(PERFORMANCE_CALIBRATION_MIN_SAMPLES, 3);
  assert.equal(result.status, "collecting");
  assert.equal(result.metrics.persistenceHours.sampleCount, 2);
  assert.equal(result.metrics.persistenceHours.factor, null);
});

test("calibration uses median observed-to-baseline ratios independently per metric", () => {
  const result = analyzePerformanceCalibration([
    observation("one", { persistence: 1.1, initial: 0.9, later: 1.2 }),
    observation("two", { persistence: 1.2, initial: 0.8, later: 1.1 }),
    observation("three", { persistence: 1.3, initial: 0.7, later: 1.3 })
  ], scenario);
  assert.equal(result.status, "ready");
  assert.equal(result.metrics.persistenceHours.factor, 1.2);
  assert.equal(result.metrics.projectionInitialMeters.factor, 0.8);
  assert.equal(result.metrics.projectionLaterMeters.factor, 1.2);
});

test("calibration is isolated by concentration and environment scenario", () => {
  const warm = { concentration: "edp", environment: "warm" };
  const result = analyzePerformanceCalibration([
    observation("a", { persistence: 1.4 }, warm),
    observation("b", { persistence: 1.4 }, warm),
    observation("c", { persistence: 1.4 }, warm)
  ], scenario);
  assert.equal(result.status, "empty");
  assert.equal(result.metrics.persistenceHours.sampleCount, 0);
});

test("calibration clamps extreme correction factors to safe local bounds", () => {
  const result = analyzePerformanceCalibration([
    observation("a", { persistence: 2.5 }),
    observation("b", { persistence: 2.7 }),
    observation("c", { persistence: 2.6 })
  ], scenario);
  assert.equal(result.metrics.persistenceHours.factor, 1.5);
  assert.equal(result.metrics.persistenceHours.clamped, true);
});

test("uncalibrated metrics preserve the original heuristic ranges", () => {
  const base = estimatePerformance(composition, scenario);
  const calibrated = applyPerformanceCalibration(base, analyzePerformanceCalibration([], scenario));
  assert.deepEqual(calibrated.persistence.hours, base.persistence.hours);
  assert.deepEqual(calibrated.projection.initialMeters, base.projection.initialMeters);
  assert.deepEqual(calibrated.projection.laterMeters, base.projection.laterMeters);
});

test("calibrated estimate adjusts only metrics with enough local observations", () => {
  const experiments = [
    observation("a", { persistence: 1.1 }),
    observation("b", { persistence: 1.2 }),
    observation("c", { persistence: 1.3 })
  ];
  const result = getCalibratedPerformanceEstimate(composition, scenario, experiments);
  assert.equal(result.calibration.metrics.persistenceHours.factor, 1.2);
  assert.equal(result.calibration.metrics.projectionInitialMeters.factor, null);
  assert.notDeepEqual(result.adjusted.persistence.hours, result.base.persistence.hours);
  assert.deepEqual(result.adjusted.projection.initialMeters, result.base.projection.initialMeters);
});
