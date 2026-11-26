import test from "node:test";
import assert from "node:assert/strict";
import { toFragranceSimilarityProfile } from "../src/js/features/laboratory/fragrance-similarity/model.js";
import { FRAGRANCE_SIMILARITY_BANDS, rankFragranceSimilarityCandidates } from "../src/js/features/laboratory/fragrance-similarity/ranking.js";

const source = {
  name: "Test dataset", attribution: "Test attribution", license: "CC BY 4.0",
  snapshot: "2026-10-29", url: "https://example.com/dataset"
};
function profile(id, fields = {}) {
  return toFragranceSimilarityProfile({
    id, name: fields.name ?? id, house: fields.house ?? "Test House",
    category: fields.category ?? "designer", family: fields.family ?? null,
    subfamilies: fields.subfamilies, accords: fields.accords,
    notes: fields.notes ?? [], top: fields.top ?? [], heart: fields.heart ?? [],
    base: fields.base ?? [], character: fields.character ?? []
  }, source);
}
const reference = () => profile("reference", {
  name: "Reference", family: "Wood & Root",
  notes: ["Bergamot", "Rose", "Musk", "Vanilla", "Cedarwood"],
  top: ["Bergamot"], heart: ["Rose"], base: ["Musk", "Vanilla", "Cedarwood"],
  character: ["woody", "warm"]
});
const strongCandidate = () => profile("strong", {
  name: "Strong Match", family: "Wood & Root",
  notes: ["Bergamota", "Rosa", "Almizcle", "Vainilla", "Cedro"],
  top: ["Bergamota"], heart: ["Rosa"], base: ["Almizcle", "Vainilla", "Cedro"],
  character: ["amaderado", "cálido"]
});
const weakerCandidate = () => profile("weaker", {
  name: "Weaker Match", family: "White Bloom",
  notes: ["Jasmine", "Lemon", "Citrus", "Amber", "Tea"],
  top: ["Lemon"], heart: ["Jasmine"], base: ["Amber"],
  character: ["floral", "fresh"]
});

test("ranks by global similarity and attaches a similarity band and explanation", () => {
  const result = rankFragranceSimilarityCandidates(reference(), [weakerCandidate(), strongCandidate()]);
  assert.equal(result.status, "ready");
  assert.equal(result.results[0].id, "strong");
  assert.equal(result.results[0].rank, 1);
  assert.equal(result.results[0].score, 100);
  assert.equal(result.results[0].similarityBand.key, "very-high");
  assert.ok(result.results[0].explanation.similarities.length > 0);
});

test("keeps insufficient-data candidates separate from the scored ranking", () => {
  const sparse = profile("sparse", { name: "Sparse Candidate", notes: ["Bergamot"] });
  const result = rankFragranceSimilarityCandidates(reference(), [sparse]);
  assert.equal(result.status, "insufficient-data");
  assert.equal(result.results.length, 0);
  assert.equal(result.insufficientData.length, 1);
  assert.equal(result.insufficientData[0].score, null);
});

test("does not rank the reference against itself or duplicate candidate ids", () => {
  const ref = reference();
  const same = strongCandidate();
  const result = rankFragranceSimilarityCandidates(ref, [ref, same, same]);
  assert.equal(result.totalCandidates, 1);
  assert.equal(result.results.length, 1);
});

test("confidence breaks score ties but never alters the similarity score", () => {
  const result = rankFragranceSimilarityCandidates(reference(), [strongCandidate(), strongCandidate()]);
  assert.equal(result.results.length, 1);
  assert.equal(result.results[0].score, 100);
  assert.equal(result.rankingPolicy.scoreIsNotAdjustedByConfidence, true);
  assert.equal(result.rankingPolicy.tieBreakers[0], "evidence confidence index, descending");
});

test("supports minimum score, custom weights and result limits", () => {
  const result = rankFragranceSimilarityCandidates(reference(), [weakerCandidate(), strongCandidate()], {
    limit: 1, minimumScore: 90,
    weights: { notes: 0.6, families: 0.2, character: 0.2, pyramid: 0, subfamilies: 0, accords: 0 }
  });
  assert.equal(result.results.length, 1);
  assert.equal(result.results[0].id, "strong");
});

test("similarity bands cover the 0-100 scale without gaps", () => {
  assert.deepEqual(FRAGRANCE_SIMILARITY_BANDS.map((band) => [band.minimum, band.maximum]), [
    [90, 100], [75, 89], [60, 74], [40, 59], [0, 39]
  ]);
});

test("rejects malformed profiles and ranking options", () => {
  assert.throws(() => rankFragranceSimilarityCandidates(null, []), /profile is invalid/i);
  assert.throws(() => rankFragranceSimilarityCandidates(reference(), "not-an-array"), /must be an array/i);
  assert.throws(() => rankFragranceSimilarityCandidates(reference(), [], { limit: 51 }), /limit/i);
  assert.throws(() => rankFragranceSimilarityCandidates(reference(), [], { minimumScore: 101 }), /minimum similarity score/i);
});
