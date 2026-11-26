import test from "node:test";
import assert from "node:assert/strict";
import { filterFragranceSimilarityResults } from "../src/js/features/laboratory/fragrance-similarity/filters.js";

function candidate(id, fields = {}) {
  return {
    id, name: fields.name ?? id, house: fields.house ?? "Test House",
    category: fields.category ?? "designer", score: fields.score ?? 80,
    similarityBand: { key: fields.band ?? "high" },
    confidence: { level: fields.confidence ?? "medium" },
    availability: { status: fields.availability ?? "not-tracked" }
  };
}
function ranking(results) {
  return { status: "ready", reference: { id: "ref", name: "Reference" }, totalRankedCandidates: results.length, results };
}

test("filters categories, score bands, confidence and house without changing ranking scores", () => {
  const source = ranking([
    candidate("a", { name: "Rose", house: "Maison A", category: "niche", score: 92, band: "very-high", confidence: "high" }),
    candidate("b", { name: "Amber", house: "Maison B", category: "designer", score: 78, band: "high", confidence: "medium" }),
    candidate("c", { name: "Wood", house: "Maison A", category: "arabian", score: 54, band: "limited", confidence: "low" })
  ]);
  const result = filterFragranceSimilarityResults(source, {
    categories: ["niche", "arabian"],
    minimumScore: 50,
    maximumScore: 95,
    houseQuery: "maison a"
  });
  assert.deepEqual(result.results.map((item) => item.id), ["a", "c"]);
  assert.deepEqual(result.results.map((item) => item.score), [92, 54]);
  assert.equal(result.removedByFilters, 1);
  assert.equal(result.facets.categories.designer, 1);
});

test("supports availability filtering and treats missing stock data as not tracked", () => {
  const source = ranking([
    candidate("stock", { availability: "in-stock" }),
    candidate("sold", { availability: "out-of-stock" }),
    candidate("catalog-only")
  ]);
  const result = filterFragranceSimilarityResults(source, { availabilityStatuses: ["in-stock"] });
  assert.deepEqual(result.results.map((item) => item.id), ["stock"]);
  assert.equal(result.facets.availability["not-tracked"], 1);
});

test("returns an explicit no-filtered-results state and preserves source metadata", () => {
  const source = { ...ranking([candidate("a")]), scope: { key: "own-inventory", label: "Inventario propio" } };
  const result = filterFragranceSimilarityResults(source, { bands: ["low"] });
  assert.equal(result.status, "no-filtered-results");
  assert.equal(result.results.length, 0);
  assert.equal(result.scope.key, "own-inventory");
  assert.equal(result.totalVisibleResults, 0);
});

test("empty filter values do not silently hide results", () => {
  const source = ranking([candidate("a"), candidate("b")]);
  const result = filterFragranceSimilarityResults(source, {
    categories: [], bands: [], confidenceLevels: [], availabilityStatuses: []
  });
  assert.equal(result.results.length, 2);
});

test("validates ranges, categories, confidence and availability filters", () => {
  const source = ranking([candidate("a")]);
  assert.throws(() => filterFragranceSimilarityResults(source, { minimumScore: 80, maximumScore: 20 }), /cannot exceed/i);
  assert.throws(() => filterFragranceSimilarityResults(source, { category: "unknown" }), /unsupported categories/i);
  assert.throws(() => filterFragranceSimilarityResults(source, { confidence: "certain" }), /unsupported confidence/i);
  assert.throws(() => filterFragranceSimilarityResults(source, { availability: "available-ish" }), /unsupported availability/i);
  assert.throws(() => filterFragranceSimilarityResults(null), /ranking result is required/i);
});
