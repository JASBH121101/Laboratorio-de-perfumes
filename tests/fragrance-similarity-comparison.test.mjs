import test from "node:test";
import assert from "node:assert/strict";
import { toFragranceSimilarityProfile } from "../src/js/features/laboratory/fragrance-similarity/model.js";
import { compareFragranceProfiles } from "../src/js/features/laboratory/fragrance-similarity/comparison.js";

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

test("compares note descriptors after semantic synonym normalization", () => {
  const reference = profile("reference", { notes: ["Bergamot", "Blackcurrant", "Musk"] });
  const candidate = profile("candidate", { notes: ["Bergamota", "Cassis", "Vanilla"] });
  const result = compareFragranceProfiles(reference, candidate);
  assert.equal(result.status, "ready");
  assert.equal(result.components.notes.all.overlapIndex, 50);
  assert.deepEqual(result.components.notes.all.matched.map((item) => item.key), ["bergamot", "blackcurrant"]);
  assert.deepEqual(result.components.notes.all.referenceOnly.map((item) => item.key), ["musk"]);
  assert.deepEqual(result.components.notes.all.candidateOnly.map((item) => item.key), ["vanilla"]);
});

test("compares families, accords, character, and named pyramid stages independently", () => {
  const reference = profile("reference", {
    family: "Wood & Root",
    accords: ["Amber", "Vanilla"],
    top: ["Bergamot"],
    heart: ["Rose"],
    base: ["Musk"],
    notes: ["Bergamot", "Rose", "Musk"],
    character: ["woody", "warm"]
  });
  const candidate = profile("candidate", {
    family: "woody",
    accords: ["Ambar", "Saffron"],
    top: ["Bergamota"],
    heart: ["Jasmine"],
    base: ["Almizcle"],
    notes: ["Bergamota", "Jasmine", "Almizcle"],
    character: ["amaderado", "fresh"]
  });

  const result = compareFragranceProfiles(reference, candidate);
  assert.equal(result.components.families.overlapIndex, 50);
  assert.equal(result.components.accords.overlapIndex, 33);
  assert.equal(result.components.character.overlapIndex, 33);
  assert.equal(result.components.pyramid.stages.top.overlapIndex, 100);
  assert.equal(result.components.pyramid.stages.heart.overlapIndex, 0);
  assert.equal(result.components.pyramid.stages.base.overlapIndex, 100);
  assert.equal(result.components.pyramid.comparableStageCount, 3);
  assert.equal(result.interpretation.globalSimilarityScore, false);
});

test("does not interpret missing pyramid stages as negative matches", () => {
  const reference = profile("reference", {
    top: ["Bergamot"],
    heart: ["Rose"],
    base: ["Musk"],
    notes: ["Bergamot", "Rose", "Musk"]
  });
  const candidate = profile("candidate", {
    top: ["Bergamota"],
    notes: ["Bergamota"]
  });
  const result = compareFragranceProfiles(reference, candidate);
  assert.equal(result.components.pyramid.stages.top.overlapIndex, 100);
  assert.equal(result.components.pyramid.stages.heart.status, "not-comparable");
  assert.equal(result.components.pyramid.stages.base.status, "not-comparable");
  assert.ok(result.coverage.skippedDimensions.includes("pyramid.heart"));
  assert.ok(result.coverage.skippedDimensions.includes("pyramid.base"));
});

test("flags profiles with only one comparable descriptor as insufficient data", () => {
  const reference = profile("reference", { notes: ["Bergamot"] });
  const candidate = profile("candidate", { notes: ["Bergamota"] });
  const result = compareFragranceProfiles(reference, candidate);
  assert.equal(result.status, "insufficient-data");
  assert.equal(result.components.notes.all.overlapIndex, 100);
  assert.equal(result.coverage.comparedDescriptorCount, 1);
});

test("reports a zero overlap when comparable source descriptors disagree", () => {
  const reference = profile("reference", { family: "Wood & Root", notes: ["Cedarwood", "Musk"] });
  const candidate = profile("candidate", { family: "White Bloom", notes: ["Jasmine", "Rose"] });
  const result = compareFragranceProfiles(reference, candidate);
  assert.equal(result.components.notes.all.overlapIndex, 0);
  assert.equal(result.components.families.overlapIndex, 0);
  assert.equal(result.status, "ready");
});

test("does not mutate either input profile", () => {
  const reference = profile("reference", { notes: ["Bergamot", "Musk"] });
  const candidate = profile("candidate", { notes: ["Bergamota", "Vanilla"] });
  const before = JSON.stringify([reference, candidate]);
  compareFragranceProfiles(reference, candidate);
  assert.equal(JSON.stringify([reference, candidate]), before);
});

test("exposes comparable and skipped dimensions without producing a global percentage", () => {
  const reference = profile("reference", {
    family: "White Bloom",
    notes: ["Jasmine", "Rose", "Musk"],
    character: ["floral", "warm"]
  });
  const candidate = profile("candidate", {
    family: "Petal Garden",
    notes: ["Jazmín", "Rose", "Vanilla"],
    character: ["floral", "fresh"]
  });
  const result = compareFragranceProfiles(reference, candidate);
  assert.ok(result.coverage.comparableDimensionCount >= 3);
  assert.ok(result.coverage.skippedDimensions.includes("accords"));
  assert.equal(result.interpretation.globalSimilarityScore, false);
  assert.equal(result.interpretation.confidenceCalculated, false);
  assert.equal("similarity" in result, false);
  assert.equal("confidence" in result, false);
});
