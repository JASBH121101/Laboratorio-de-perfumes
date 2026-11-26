import test from "node:test";
import assert from "node:assert/strict";
import { getFragranceSimilarityReferenceById, searchFragranceReferences } from "../src/js/features/laboratory/fragrance-similarity/search.js";

test("finds a unique exact perfume name and preserves its catalog identity", () => {
  const result = searchFragranceReferences("Oud Wood");
  assert.equal(result.status, "exact-match");
  assert.equal(result.results[0].id, "tom-ford-oud-wood");
  assert.equal(result.results[0].name, "Oud Wood");
  assert.equal(result.results[0].house, "Tom Ford");
  assert.equal(result.results[0].searchScore, 100);
});

test("searches by house and flags multiple close matches for selection", () => {
  const result = searchFragranceReferences("Tom Ford");
  assert.equal(result.status, "needs-selection");
  assert.ok(result.totalMatches > 1);
  assert.ok(result.results.every((item) => item.house === "Tom Ford"));
  assert.ok(result.results.every((item) => item.matchedFields.includes("house")));
});

test("tolerates accents, punctuation and minor spelling errors", () => {
  const accent = searchFragranceReferences("J'adore");
  const typo = searchFragranceReferences("Oud Wod");
  assert.ok(accent.results.some((item) => item.id === "dior-jadore"));
  assert.ok(typo.results.some((item) => item.id === "tom-ford-oud-wood"));
  assert.ok(typo.results[0].searchScore >= 75);
});

test("mixed perfume and house queries resolve across both identity fields", () => {
  const result = searchFragranceReferences("Tom Ford Oud Wood");
  const match = result.results.find((item) => item.id === "tom-ford-oud-wood");
  assert.ok(match);
  assert.ok(match.matchedFields.includes("name"));
  assert.ok(match.matchedFields.includes("house"));
});

test("supports category filtering, result limits and disabling house search", () => {
  const niche = searchFragranceReferences("Tom Ford", { category: "niche", limit: 3 });
  const nameOnly = searchFragranceReferences("Tom Ford", { includeHouse: false });
  assert.ok(niche.results.length <= 3);
  assert.ok(niche.results.every((item) => item.category === "niche"));
  assert.notEqual(nameOnly.status, "needs-selection");
});

test("returns explicit empty, short and no-result states", () => {
  assert.equal(searchFragranceReferences("   ").status, "empty-query");
  assert.equal(searchFragranceReferences("x").status, "query-too-short");
  assert.equal(searchFragranceReferences("zzzxqv-unlisted").status, "no-results");
});

test("reference lookup requires the exact stable profile id", () => {
  assert.equal(getFragranceSimilarityReferenceById("tom-ford-oud-wood")?.identity.name, "Oud Wood");
  assert.equal(getFragranceSimilarityReferenceById("Tom Ford Oud Wood"), null);
  assert.equal(getFragranceSimilarityReferenceById("missing-id"), null);
  assert.equal(getFragranceSimilarityReferenceById(""), null);
});

test("rejects malformed query options instead of silently broadening the search", () => {
  assert.throws(() => searchFragranceReferences(null), /query must be a string/i);
  assert.throws(() => searchFragranceReferences("oud", { limit: 0 }), /limit/i);
  assert.throws(() => searchFragranceReferences("oud", { category: "unknown" }), /unsupported fragrance category/i);
  assert.throws(() => searchFragranceReferences("oud", { minimumSearchScore: 101 }), /minimum search score/i);
});
