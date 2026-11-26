import test from "node:test";
import assert from "node:assert/strict";
import { buildFragranceSimilarityExperience } from "../src/js/features/laboratory/fragrance-similarity/experience.js";

test("builds a reverse-search session from a selected local reference", () => {
  const session = buildFragranceSimilarityExperience({ query: "Oud Wod", selectedReferenceId: "tom-ford-oud-wood" });
  assert.ok(["suggestions", "exact-match"].includes(session.search.status));
  assert.equal(session.reference.identity.name, "Oud Wood");
  assert.equal(session.scopeSelection.scope, "global-catalog");
  assert.equal(session.ranking.status, "ready");
  assert.ok(session.filtered.results.length > 0);
  assert.ok(session.filtered.results.every((item) => item.id !== session.reference.id));
  assert.ok(session.filtered.results.every((item) => item.source.scope === "global-catalog"));
});

test("keeps editorial score and evidence confidence separate", () => {
  const candidate = buildFragranceSimilarityExperience({ selectedReferenceId: "tom-ford-oud-wood" }).filtered.results[0];
  assert.equal(typeof candidate.score, "number");
  assert.equal(typeof candidate.confidence.level, "string");
});

test("own-inventory mode never falls back to global references", () => {
  const session = buildFragranceSimilarityExperience({ selectedReferenceId: "tom-ford-oud-wood", scope: "own-inventory" });
  assert.equal(session.scopeSelection.status, "inventory-empty");
  assert.equal(session.ranking.status, "inventory-empty");
  assert.equal(session.filtered.status, "inventory-empty");
  assert.equal(session.filtered.results.length, 0);
});

test("filters preserve the original ranking scores", () => {
  const baseline = buildFragranceSimilarityExperience({ selectedReferenceId: "tom-ford-oud-wood" });
  const filtered = buildFragranceSimilarityExperience({ selectedReferenceId: "tom-ford-oud-wood", filters: { minimumScore: 90 } });
  const scores = new Map(baseline.filtered.results.map((item) => [item.id, item.score]));
  assert.ok(filtered.filtered.results.every((item) => item.score >= 90));
  for (const item of filtered.filtered.results) assert.equal(item.score, scores.get(item.id));
});

test("rejects malformed UI state", () => {
  assert.throws(() => buildFragranceSimilarityExperience({ query: null }), /query must be a string/i);
  assert.throws(() => buildFragranceSimilarityExperience({ filters: [] }), /filters must be an object/i);
  assert.throws(() => buildFragranceSimilarityExperience({ inventoryEntries: {} }), /inventory entries must be an array/i);
});
