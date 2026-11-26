import test from "node:test";
import assert from "node:assert/strict";
import {
  buildSensoryBackup, createSensoryExperiment, mergeSensoryExperiments, parseSensoryBackup,
  validateSensoryExperiment
} from "../src/js/features/laboratory/sensory-experiments/model.js";
import { renderSensoryExperiments } from "../src/js/features/laboratory/sensory-experiments/panel.js";
import { createArchiveCreation } from "../src/js/features/archive/model.js";

function fixture() {
  const creation = createArchiveCreation({
    name: "Jardín de Granada",
    id: "creation-sensory",
    items: [{ id: "bergamot", points: 50 }, { id: "rose", points: 50 }],
    now: "2026-11-26T00:00:00.000Z"
  });
  return { creation, variant: creation.variants[0] };
}

function record(overrides = {}) {
  const { creation, variant } = fixture();
  return createSensoryExperiment({
    creation, variant, title: "Prueba en papel",
    observedAt: "2026-11-26T01:30:00.000Z",
    impression: "Apertura fresca, luego más floral.",
    tags: ["cítrico", "floral"],
    ratings: { intensity: 3, freshness: 4 },
    id: "experiment-1",
    now: "2026-11-26T01:35:00.000Z",
    ...overrides
  });
}

test("sensory experiment binds the exact saved version and copies its composition snapshot", () => {
  const result = record();
  assert.equal(result.creationId, "creation-sensory");
  assert.equal(result.variantId, "creation-sensory:A");
  assert.equal(result.versionNumber, 1);
  assert.deepEqual(result.composition, fixture().variant.items);
  assert.equal(result.ratings.intensity, 3);
  assert.equal(result.ratings.persistence, null);
});

test("sensory experiment validates required text, date, context, tags and rating range", () => {
  const { creation, variant } = fixture();
  assert.throws(() => createSensoryExperiment({ creation, variant, title: "", impression: "x" }), /Título/);
  assert.throws(() => createSensoryExperiment({ creation, variant, title: "Test", observedAt: "bad", impression: "x" }), /fecha/);
  assert.throws(() => createSensoryExperiment({ creation, variant, title: "Test", impression: "x", context: "unknown" }), /contexto/);
  assert.throws(() => createSensoryExperiment({ creation, variant, title: "Test", impression: "x", tags: ["inventada"] }), /faceta/);
  assert.throws(() => createSensoryExperiment({ creation, variant, title: "Test", impression: "x", ratings: { intensity: 6 } }), /entre 1 y 5/);
});

test("sensory experiment snapshot stays attached to the stored version after current formula evolves", () => {
  const original = record();
  const changed = { ...fixture().variant, items: [{ id: "vanilla", points: 100 }] };
  assert.deepEqual(original.composition, [{ id: "bergamot", points: 50 }, { id: "rose", points: 50 }]);
  assert.notDeepEqual(original.composition, changed.items);
});

test("sensory backup round-trips records and rejects incompatible schema", () => {
  const backup = buildSensoryBackup([record()], "2026-11-26T02:00:00.000Z");
  const imported = parseSensoryBackup(JSON.stringify(backup));
  assert.equal(imported.length, 1);
  assert.deepEqual(imported[0], validateSensoryExperiment(record()));
  assert.throws(() => parseSensoryBackup({ ...backup, schemaVersion: 99 }), /compatible/);
});

test("import merge remaps duplicate record ids without overwriting existing observations", () => {
  const original = record();
  const merged = mergeSensoryExperiments([original], [original]);
  assert.equal(merged.length, 1);
  assert.notEqual(merged[0].id, original.id);
});

test("sensory panel renders form, subjective rating labels, history and backup controls", () => {
  const { creation } = fixture();
  const html = renderSensoryExperiments({ creations: [creation], experiments: [record()] });
  assert.match(html, /Nuevo experimento sensorial/);
  assert.match(html, /Observación \/ evolución percibida/);
  assert.match(html, /no son mediciones instrumentales/);
  assert.match(html, /Historial sensorial/);
  assert.match(html, /export-sensory-backup/);
});

test("sensory panel reports the empty archive state without showing an unusable form", () => {
  const html = renderSensoryExperiments({ creations: [], experiments: [] });
  assert.match(html, /Primero guardá una creación/);
  assert.doesNotMatch(html, /id="sensory-experiment-form"/);
});


test("sensory record optionally stores actual persistence and projection with its scenario", () => {
  const { creation, variant } = fixture();
  const result = createSensoryExperiment({
    creation, variant, title: "Prueba de rendimiento", impression: "Evaluación en piel",
    observedPerformance: {
      concentration: "edp", environment: "warm",
      persistenceHours: "5.5", projectionInitialMeters: "0.8", projectionLaterMeters: "0.3"
    },
    id: "performance-record"
  });
  assert.deepEqual(result.observedPerformance, {
    concentration: "edp", environment: "warm",
    persistenceHours: 5.5, projectionInitialMeters: 0.8, projectionLaterMeters: 0.3
  });
});

test("sensory observed performance accepts partial metrics and omits an empty observation", () => {
  const { creation, variant } = fixture();
  const partial = createSensoryExperiment({
    creation, variant, title: "Persistencia solamente", impression: "Observación",
    observedPerformance: { concentration: "parfum", environment: "cool", persistenceHours: 7 }
  });
  assert.equal(partial.observedPerformance.persistenceHours, 7);
  assert.equal(partial.observedPerformance.projectionInitialMeters, null);
  const empty = createSensoryExperiment({
    creation, variant, title: "Sin métrica", impression: "Observación",
    observedPerformance: { concentration: "edp", environment: "neutral" }
  });
  assert.equal(empty.observedPerformance, null);
});

test("sensory observed performance validates ranges and scenario keys", () => {
  const { creation, variant } = fixture();
  const base = { creation, variant, title: "Prueba", impression: "Observación" };
  assert.throws(() => createSensoryExperiment({ ...base, observedPerformance: { persistenceHours: 49 } }), /entre 0 y 48/);
  assert.throws(() => createSensoryExperiment({ ...base, observedPerformance: { projectionInitialMeters: 11 } }), /entre 0 y 10/);
  assert.throws(() => createSensoryExperiment({ ...base, observedPerformance: { concentration: "unknown", persistenceHours: 5 } }), /concentración/);
  assert.throws(() => createSensoryExperiment({ ...base, observedPerformance: { environment: "unknown", persistenceHours: 5 } }), /ambiente/);
});

test("legacy sensory records remain valid and backup preserves optional performance observations", () => {
  const legacy = record();
  delete legacy.observedPerformance;
  assert.equal(validateSensoryExperiment(legacy).observedPerformance, null);
  const current = record({
    observedPerformance: { concentration: "edt", environment: "indoor", persistenceHours: 4.5 }
  });
  const imported = parseSensoryBackup(buildSensoryBackup([current]));
  assert.deepEqual(imported[0].observedPerformance, current.observedPerformance);
});

test("sensory panel exposes optional performance observation inputs and renders saved values", () => {
  const { creation } = fixture();
  const withObservation = record({
    observedPerformance: { concentration: "edp", environment: "neutral", persistenceHours: 6, projectionInitialMeters: 1 }
  });
  const html = renderSensoryExperiments({ creations: [creation], experiments: [withObservation] });
  assert.match(html, /Observación real de rendimiento/);
  assert.match(html, /observed_persistence_hours/);
  assert.match(html, /observed_projection_initial_meters/);
  assert.match(html, /observed_projection_later_meters/);
  assert.match(html, /Persistencia: <b>6 h/);
  assert.match(html, /Proyección inicial: <b>1 m/);
});
