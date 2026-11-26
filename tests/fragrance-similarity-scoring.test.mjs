import test from "node:test";
import assert from "node:assert/strict";
import { toFragranceSimilarityProfile } from "../src/js/features/laboratory/fragrance-similarity/model.js";
import { compareFragranceProfiles } from "../src/js/features/laboratory/fragrance-similarity/comparison.js";
import {
  FRAGRANCE_SIMILARITY_DEFAULT_WEIGHTS,
  scoreFragranceSimilarity
} from "../src/js/features/laboratory/fragrance-similarity/scoring.js";

const source = {
  name: "Test dataset",
  attribution: "Test attribution",
  license: "CC BY 4.0",
  snapshot: "2026-10-29",
  url: "https://example.com/dataset"
};

function profile(id, fields = {}) {
  return toFragranceSimilarityProfile({
    id,
    name: fields.name ?? id,
    family: fields.family ?? null,
    subfamilies: fields.subfamilies,
    accords: fields.accords,
    notes: fields.notes ?? [],
    top: fields.top ?? [],
    heart: fields.heart ?? [],
    base: fields.base ?? [],
    character: fields.character ?? []
  }, source);
}

function compare(reference, candidate) {
  const result = compareFragranceProfiles(reference, candidate);
  return { result, score: scoreFragranceSimilarity(result, reference, candidate) };
}

const richReference = () => profile("reference", {
  family: "Wood & Root",
  subfamilies: ["Dry Woods"],
  accords: ["Amber"],
  notes: ["Bergamot", "Rose", "Musk", "Vanilla", "Cedarwood", "Iris", "Cardamom", "Oakmoss"],
  top: ["Bergamot", "Cardamom"],
  heart: ["Rose", "Iris"],
  base: ["Musk", "Vanilla", "Cedarwood", "Oakmoss"],
  character: ["woody", "warm", "earthy", "fresh"]
});

const richCandidate = () => profile("candidate", {
  family: "Wood & Root",
  subfamilies: ["Dry Woods"],
  accords: ["Amber"],
  notes: ["Bergamota", "Rosa", "Almizcle", "Vainilla", "Cedro", "Iris", "Cardamomo", "Musgo de roble"],
  top: ["Bergamota", "Cardamomo"],
  heart: ["Rosa", "Iris"],
  base: ["Almizcle", "Vainilla", "Cedro", "Musgo de roble"],
  character: ["amaderado", "cálido", "terroso", "fresco"]
});

test("default scoring weights are explicit and sum to one", () => {
  assert.equal(Object.values(FRAGRANCE_SIMILARITY_DEFAULT_WEIGHTS).reduce((sum, weight) => sum + weight, 0), 1);
  assert.deepEqual(Object.keys(FRAGRANCE_SIMILARITY_DEFAULT_WEIGHTS), [
    "notes", "pyramid", "families", "subfamilies", "accords", "character"
  ]);
});

test("returns a transparent 100 score for fully matching bilingual profiles", () => {
  const reference = richReference();
  const candidate = richCandidate();
  const { score } = compare(reference, candidate);
  assert.equal(score.status, "ready");
  assert.equal(score.score, 100);
  assert.equal(score.coverage.availableWeight, 100);
  assert.equal(score.confidence.level, "high");
  assert.equal(score.components.pyramid.score, 100);
  assert.equal(score.components.notes.score, 100);
  assert.equal(score.model.status, "provisional");
});

test("keeps similarity score separate from evidence confidence", () => {
  const reference = profile("reference", {
    family: "woody",
    notes: ["Bergamot", "Musk"]
  });
  const candidate = profile("candidate", {
    family: "woody",
    notes: ["Bergamota", "Almizcle"]
  });
  const { score } = compare(reference, candidate);
  assert.equal(score.status, "ready");
  assert.equal(score.score, 100);
  assert.equal(score.confidence.level, "very-low");
  assert.ok(score.confidence.index < 45);
  assert.match(score.confidence.meaning, /not a probability/i);
});

test("excludes unavailable dimensions rather than scoring them as zero", () => {
  const reference = profile("reference", {
    family: "woody",
    notes: ["Bergamot", "Rose", "Musk"],
    top: ["Bergamot"],
    heart: ["Rose"],
    base: ["Musk"],
    character: ["warm"]
  });
  const candidate = profile("candidate", {
    family: "woody",
    notes: ["Bergamota", "Rosa", "Almizcle"],
    top: ["Bergamota"],
    heart: ["Rosa"],
    base: ["Almizcle"],
    character: ["cálido"]
  });
  const { score } = compare(reference, candidate);
  assert.equal(score.status, "ready");
  assert.equal(score.score, 100);
  assert.ok(score.coverage.availableWeight < 100);
  assert.ok(score.coverage.excludedDimensions.includes("subfamilies"));
  assert.ok(score.coverage.excludedDimensions.includes("accords"));
  assert.equal(score.components.subfamilies.score, null);
  assert.equal(score.components.accords.score, null);
});

test("uses custom weights and normalizes their scale", () => {
  const reference = profile("reference", { notes: ["Bergamot", "Rose"], family: "woody" });
  const candidate = profile("candidate", { notes: ["Bergamota", "Musk"], family: "floral" });
  const comparison = compareFragranceProfiles(reference, candidate);
  const score = scoreFragranceSimilarity(comparison, reference, candidate, {
    weights: { notes: 10, families: 0, pyramid: 0, subfamilies: 0, accords: 0, character: 0 }
  });
  assert.equal(score.status, "ready");
  assert.equal(score.score, 33);
  assert.equal(score.coverage.availableWeight, 100);
});

test("rejects invalid weights and mismatched comparison identities", () => {
  const reference = richReference();
  const candidate = richCandidate();
  const comparison = compareFragranceProfiles(reference, candidate);
  assert.throws(() => scoreFragranceSimilarity(comparison, reference, candidate, {
    weights: { notes: -1 }
  }), /non-negative/i);
  assert.throws(() => scoreFragranceSimilarity(comparison, reference, candidate, {
    weights: { unknown: 1 }
  }), /unknown similarity weight/i);
  assert.throws(() => scoreFragranceSimilarity(comparison, reference, candidate, {
    weights: { notes: 0, pyramid: 0, families: 0, subfamilies: 0, accords: 0, character: 0 }
  }), /greater than zero/i);
  assert.throws(() => scoreFragranceSimilarity(comparison, candidate, candidate), /identities do not match/i);
});

test("requires at least two comparable dimensions before returning a global score", () => {
  const reference = profile("reference", { notes: ["Bergamot", "Rose"] });
  const candidate = profile("candidate", { notes: ["Bergamota", "Rosa"] });
  const comparison = compareFragranceProfiles(reference, candidate);
  const score = scoreFragranceSimilarity(comparison, reference, candidate);
  assert.equal(score.status, "insufficient-data");
  assert.equal(score.score, null);
  assert.equal(score.confidence.level, "very-low");
  assert.equal(score.coverage.comparableDimensionCount, 1);
});
