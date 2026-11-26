import test from "node:test";
import assert from "node:assert/strict";
import { buildFragranceSimilarityExperience } from "../src/js/features/laboratory/fragrance-similarity/experience.js";

const REFERENCE = "tom-ford-oud-wood";

test("lifecycle: query can change after selection without retaining the previous reference", () => {
  const selected = buildFragranceSimilarityExperience({ query: "Oud Wood", selectedReferenceId: REFERENCE });
  assert.equal(selected.reference.id, REFERENCE);
  const changedQuery = buildFragranceSimilarityExperience({ query: "Sauvage", selectedReferenceId: "" });
  assert.equal(changedQuery.status, "reference-required");
  assert.equal(changedQuery.reference, null);
  assert.ok(changedQuery.search.results.some((item) => item.name.toLowerCase().includes("sauvage")));
});

test("lifecycle: filter changes and reset restore the same stable ranking", () => {
  const baseline = buildFragranceSimilarityExperience({ selectedReferenceId: REFERENCE });
  const narrowed = buildFragranceSimilarityExperience({ selectedReferenceId: REFERENCE, filters: { minimumScore: 90 } });
  const reset = buildFragranceSimilarityExperience({ selectedReferenceId: REFERENCE, filters: {} });
  assert.ok(narrowed.filtered.results.length <= baseline.filtered.results.length);
  assert.deepEqual(reset.filtered.results.map((item) => item.id), baseline.filtered.results.map((item) => item.id));
  assert.deepEqual(reset.filtered.results.map((item) => item.score), baseline.filtered.results.map((item) => item.score));
});

test("lifecycle: scope switching never leaks global candidates into empty inventory", () => {
  const global = buildFragranceSimilarityExperience({ selectedReferenceId: REFERENCE, scope: "global-catalog" });
  const own = buildFragranceSimilarityExperience({ selectedReferenceId: REFERENCE, scope: "own-inventory" });
  const globalAgain = buildFragranceSimilarityExperience({ selectedReferenceId: REFERENCE, scope: "global-catalog" });
  assert.ok(global.filtered.results.length > 0);
  assert.equal(own.scopeSelection.status, "inventory-empty");
  assert.equal(own.filtered.results.length, 0);
  assert.equal(own.filtered.status, "inventory-empty");
  assert.deepEqual(globalAgain.filtered.results.map((item) => item.id), global.filtered.results.map((item) => item.id));
});

test("ranking cache: repeated sessions preserve order, scores and cap output at the supported limit", () => {
  const first = buildFragranceSimilarityExperience({ selectedReferenceId: REFERENCE });
  const repeated = buildFragranceSimilarityExperience({ selectedReferenceId: REFERENCE });
  assert.deepEqual(repeated.ranking.results.map((item) => item.id), first.ranking.results.map((item) => item.id));
  assert.deepEqual(repeated.ranking.results.map((item) => item.score), first.ranking.results.map((item) => item.score));
  assert.ok(first.ranking.results.length <= 50);
  assert.ok(first.filtered.results.every((item) => item.id !== REFERENCE));
});
