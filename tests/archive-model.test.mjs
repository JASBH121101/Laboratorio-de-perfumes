import test from "node:test";
import assert from "node:assert/strict";
import { addMixNote, createMixState } from "../src/js/features/laboratory/mixing/state.js";
import {
  ARCHIVE_SCHEMA_VERSION, buildArchiveBackup, compareArchiveVariants,
  createArchiveCreation, createArchiveVariant, getActiveVariant,
  mergeImportedCreations, parseArchiveBackup, renameArchiveCreation,
  renameArchiveVariant, restoreArchiveVersion, saveArchiveVersion,
  validateArchiveCreation
} from "../src/js/features/archive/model.js";

function mix(ids) {
  let state = createMixState();
  for (const id of ids) state = addMixNote(state, id);
  return state.items;
}

function creation(name = "Lluvia de Granada") {
  return createArchiveCreation({
    name,
    description: "Concepto fresco, floral y amaderado.",
    items: mix(["bergamot", "rose", "sandalwood"]),
    now: "2026-11-25T12:00:00.000Z",
    id: "creation-1"
  });
}

test("a new creation stores an immutable initial variant A and version 1", () => {
  const record = creation();
  assert.equal(record.schemaVersion, ARCHIVE_SCHEMA_VERSION);
  assert.equal(record.variants.length, 1);
  assert.equal(record.variants[0].label, "A");
  assert.equal(record.variants[0].versions[0].number, 1);
  assert.equal(getActiveVariant(record).id, record.variants[0].id);
  assert.equal(record.variants[0].items.reduce((sum, item) => sum + item.points, 0), 100);
});

test("creation and variant names can be renamed without changing composition", () => {
  const original = creation();
  const renamed = renameArchiveCreation(original, "Jardín nocturno", "2026-11-25T13:00:00.000Z");
  const variant = renameArchiveVariant(renamed, renamed.activeVariantId, "Original revisada");
  assert.equal(variant.name, "Jardín nocturno");
  assert.equal(variant.variants[0].name, "Original revisada");
  assert.deepEqual(variant.variants[0].items, original.variants[0].items);
});

test("creating variants assigns A, B and C without overwriting the original", () => {
  const original = creation();
  const withB = createArchiveVariant(original, { items: mix(["bergamot", "vanilla"]), now: "2026-11-25T13:00:00.000Z", id: "creation-1:B" });
  const withC = createArchiveVariant(withB, { items: mix(["rose", "vanilla", "vetiver"]), now: "2026-11-25T14:00:00.000Z", id: "creation-1:C" });
  assert.deepEqual(withC.variants.map((variant) => variant.label), ["A", "B", "C"]);
  assert.deepEqual(withC.variants[0].items, original.variants[0].items);
  assert.equal(withC.activeVariantId, "creation-1:C");
  assert.throws(() => createArchiveVariant(withC), /hasta tres variantes/);
});

test("saving a change appends a new version and preserves the previous snapshot", () => {
  const original = creation();
  const oldItems = original.variants[0].items;
  const updated = saveArchiveVersion(original, original.activeVariantId, mix(["bergamot", "vanilla"]), "Más dulce");
  assert.equal(updated.variants[0].versions.length, 2);
  assert.deepEqual(updated.variants[0].versions[0].items, oldItems);
  assert.deepEqual(updated.variants[0].items, mix(["bergamot", "vanilla"]));
  assert.equal(updated.variants[0].versions[1].note, "Más dulce");
});

test("saving an identical composition does not create a duplicate version", () => {
  const original = creation();
  const unchanged = saveArchiveVersion(original, original.activeVariantId, original.variants[0].items);
  assert.equal(unchanged, original);
});

test("restoring an older version creates a new version without deleting history", () => {
  const original = creation();
  const second = saveArchiveVersion(original, original.activeVariantId, mix(["bergamot", "vanilla"]), "Versión dulce");
  const restored = restoreArchiveVersion(second, second.activeVariantId, 1, "2026-11-25T16:00:00.000Z");
  const variant = restored.variants[0];
  assert.equal(variant.versions.length, 3);
  assert.deepEqual(variant.items, original.variants[0].items);
  assert.equal(variant.versions[2].note, "Restaurada desde v1");
  assert.deepEqual(variant.versions[1].items, second.variants[0].versions[1].items);
});

test("comparison reports per-note changes and newly introduced references", () => {
  const original = creation();
  const withB = createArchiveVariant(original, { items: mix(["bergamot", "vanilla"]), id: "creation-1:B" });
  const comparison = compareArchiveVariants(withB, "creation-1:A", "creation-1:B");
  assert.equal(comparison.left.label, "A");
  assert.equal(comparison.right.label, "B");
  assert.ok(comparison.added.includes("vanilla"));
  assert.ok(comparison.removed.includes("rose"));
  assert.ok(comparison.rows.some((row) => row.id === "vanilla" && row.delta > 0));
});

test("backup export and import round-trip variants and version history", () => {
  const original = creation();
  const withB = createArchiveVariant(original, { items: mix(["bergamot", "vanilla"]), id: "creation-1:B" });
  const versioned = saveArchiveVersion(withB, "creation-1:B", mix(["vanilla", "vetiver"]), "Prueba B");
  const backup = buildArchiveBackup([versioned], "2026-11-25T17:00:00.000Z");
  const restored = parseArchiveBackup(JSON.stringify(backup));
  assert.equal(restored.length, 1);
  assert.equal(restored[0].variants.length, 2);
  assert.equal(restored[0].variants[1].versions.length, 2);
  assert.deepEqual(restored[0], validateArchiveCreation(versioned));
});

test("backup rejects incompatible schema, unknown notes and invalid creative totals", () => {
  const backup = buildArchiveBackup([creation()]);
  assert.throws(() => parseArchiveBackup(JSON.stringify({ ...backup, schemaVersion: 999 })), /compatible/);
  const invalid = structuredClone(backup);
  invalid.creations[0].variants[0].items[0].id = "unknown-note";
  invalid.creations[0].variants[0].versions[0].items[0].id = "unknown-note";
  assert.throws(() => parseArchiveBackup(invalid), /no existe en la biblioteca/);
  const badTotal = structuredClone(backup);
  badTotal.creations[0].variants[0].items[0].points = 1;
  badTotal.creations[0].variants[0].versions[0].items[0].points = 1;
  assert.throws(() => parseArchiveBackup(badTotal), /100 puntos creativos/);
});

test("import merge remaps colliding creation and variant ids instead of overwriting", () => {
  const original = creation();
  const imported = parseArchiveBackup(buildArchiveBackup([original]));
  const merged = mergeImportedCreations([original], imported, "2026-11-25T18:00:00.000Z");
  assert.equal(merged.length, 1);
  assert.notEqual(merged[0].id, original.id);
  assert.equal(merged[0].variants[0].id, `${merged[0].id}:A`);
  assert.equal(merged[0].activeVariantId, merged[0].variants[0].id);
});

test("archive input limits are enforced", () => {
  assert.throws(() => createArchiveCreation({ name: " " }), /obligatorio/);
  assert.throws(() => renameArchiveVariant(creation(), "creation-1:A", "x".repeat(61)), /60 caracteres/);
  assert.throws(() => createArchiveCreation({ name: "Bad", items: [{ id: "bergamot", points: 50 }] }), /100 puntos creativos/);
});
