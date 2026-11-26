import test from "node:test";
import assert from "node:assert/strict";
import {
  FRAGRANCE_SIMILARITY_CONFIDENCE_LEVELS,
  FRAGRANCE_SIMILARITY_MODULE_CONTRACT,
  FRAGRANCE_SIMILARITY_SCORE,
  FRAGRANCE_SIMILARITY_SCHEMA_VERSION,
  isFragranceSimilarityProfile,
  validateFragranceSimilarityProfile
} from "../src/js/features/laboratory/fragrance-similarity/contracts.js";

const validProfile = () => ({
  schemaVersion: FRAGRANCE_SIMILARITY_SCHEMA_VERSION,
  id: "sample",
  identity: { name: "Sample", house: "Example House", category: "designer" },
  olfactory: {
    family: "Woody",
    subfamilies: null,
    accords: null,
    notes: { all: ["Bergamot", "Cedar"], top: ["Bergamot"], heart: [], base: ["Cedar"] },
    character: ["fresh", "woody"]
  },
  provenance: {
    dataset: "Example dataset",
    attribution: "Example attribution",
    license: "CC BY 4.0",
    snapshot: "2026-10-29",
    datasetUrl: "https://example.com/dataset",
    recordUrl: null
  },
  quality: {
    noteCount: 2,
    characterCount: 2,
    pyramidCoverage: "partial",
    hasNotes: true,
    hasCharacter: true
  }
});

test("contract defines an editorial score and a separate confidence scale", () => {
  assert.equal(FRAGRANCE_SIMILARITY_SCORE.minimum, 0);
  assert.equal(FRAGRANCE_SIMILARITY_SCORE.maximum, 100);
  assert.match(FRAGRANCE_SIMILARITY_SCORE.disclaimer, /chemical or sensory equivalence/i);
  assert.deepEqual(FRAGRANCE_SIMILARITY_CONFIDENCE_LEVELS, ["very-low", "low", "medium", "high"]);
  assert.ok(FRAGRANCE_SIMILARITY_MODULE_CONTRACT.boundaries.some((item) => /proprietary formula/i.test(item)));
});

test("accepts a complete normalized profile contract", () => {
  const profile = validProfile();
  assert.equal(validateFragranceSimilarityProfile(profile).valid, true);
  assert.equal(isFragranceSimilarityProfile(profile), true);
});

test("rejects missing profile fields and inconsistent quality counters", () => {
  const profile = validProfile();
  profile.olfactory.notes.top = "Bergamot";
  profile.quality.noteCount = 9;
  const result = validateFragranceSimilarityProfile(profile);
  assert.equal(result.valid, false);
  assert.ok(result.issues.includes("profile.olfactory.notes.top"));
  assert.ok(result.issues.includes("profile.quality.note_count_mismatch"));
});

test("allows unknown pyramid details without inventing accords or subfamilies", () => {
  const profile = validProfile();
  profile.olfactory.subfamilies = null;
  profile.olfactory.accords = null;
  profile.olfactory.notes = { all: ["Musk"], top: [], heart: [], base: [] };
  profile.quality = {
    noteCount: 1,
    characterCount: 2,
    pyramidCoverage: "unavailable",
    hasNotes: true,
    hasCharacter: true
  };
  assert.equal(isFragranceSimilarityProfile(profile), true);
});

test("rejects unsupported schema versions and malformed roots", () => {
  assert.equal(validateFragranceSimilarityProfile(null).valid, false);
  const profile = validProfile();
  profile.schemaVersion = 99;
  assert.ok(validateFragranceSimilarityProfile(profile).issues.includes("profile.schema_version"));
});
