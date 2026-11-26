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
  assert.match(html, /Observación / evolución percibida/);
  assert.match(html, /no son mediciones instrumentales/);
  assert.match(html, /Historial sensorial/);
  assert.match(html, /export-sensory-backup/);
});

test("sensory panel reports the empty archive state without showing an unusable form", () => {
  const html = renderSensoryExperiments({ creations: [], experiments: [] });
  assert.match(html, /Primero guardá una creación/);
  assert.doesNotMatch(html, /id="sensory-experiment-form"/);
});
