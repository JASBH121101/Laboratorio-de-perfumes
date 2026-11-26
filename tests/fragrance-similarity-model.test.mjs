import test from "node:test";
import assert from "node:assert/strict";
import {
  buildFragranceSimilarityCatalog,
  toFragranceSimilarityProfile
} from "../src/js/features/laboratory/fragrance-similarity/model.js";
import { REFERENCE_PERFUMES, REFERENCE_CATALOG_SOURCE } from "../src/js/features/laboratory/reference-benchmark/data.js";
import { isFragranceSimilarityProfile } from "../src/js/features/laboratory/fragrance-similarity/contracts.js";

const source = {
  name: "Test dataset",
  attribution: "Test attribution",
  license: "CC BY 4.0",
  snapshot: "2026-10-29",
  url: "https://example.com/dataset"
};

test("maps the full licensed catalog into schema-valid profiles", () => {
  const result = buildFragranceSimilarityCatalog(REFERENCE_PERFUMES, REFERENCE_CATALOG_SOURCE);
  assert.equal(result.status, "ready");
  assert.equal(result.totalRecords, 1479);
  assert.equal(result.acceptedRecords, 1479);
  assert.equal(result.rejectedRecords, 0);
  assert.ok(result.profiles.every(isFragranceSimilarityProfile));
  assert.equal(result.source.license, "CC BY 4.0");
});

test("preserves identity, declared note pyramid, descriptors, and provenance", () => {
  const profile = toFragranceSimilarityProfile({
    id: "example",
    name: "Example Eau de Parfum",
    house: "Example House",
    category: "designer",
    family: "Woody",
    character: [" warm ", "fresh", "WARM"],
    top: ["Bergamot"],
    heart: ["Iris"],
    base: ["Cedar"],
    notes: ["Bergamot", "Iris", "Cedar", "Musk"],
    url: "https://example.com/perfume"
  }, source);

  assert.deepEqual(profile.identity, {
    name: "Example Eau de Parfum",
    house: "Example House",
    category: "designer"
  });
  assert.deepEqual(profile.olfactory.notes, {
    all: ["Bergamot", "Iris", "Cedar", "Musk"],
    top: ["Bergamot"],
    heart: ["Iris"],
    base: ["Cedar"]
  });
  assert.deepEqual(profile.olfactory.character, ["warm", "fresh"]);
  assert.equal(profile.olfactory.family, "Woody");
  assert.equal(profile.olfactory.accords, null);
  assert.equal(profile.olfactory.subfamilies, null);
  assert.equal(profile.quality.pyramidCoverage, "complete");
  assert.equal(profile.provenance.recordUrl, "https://example.com/perfume");
  assert.equal(profile.provenance.license, "CC BY 4.0");
});

test("keeps aggregate notes while marking an unavailable pyramid as unavailable", () => {
  const profile = toFragranceSimilarityProfile({
    id: "no-pyramid",
    name: "No Pyramid",
    notes: ["Musk", "Amber"],
    character: ["soft"]
  }, source);

  assert.deepEqual(profile.olfactory.notes, {
    all: ["Musk", "Amber"],
    top: [],
    heart: [],
    base: []
  });
  assert.equal(profile.olfactory.family, null);
  assert.equal(profile.olfactory.subfamilies, null);
  assert.equal(profile.olfactory.accords, null);
  assert.equal(profile.quality.pyramidCoverage, "unavailable");
});

test("marks partially declared pyramids without filling missing stages", () => {
  const profile = toFragranceSimilarityProfile({
    id: "partial",
    name: "Partial Pyramid",
    top: ["Bergamot"],
    heart: [],
    base: ["Musk"],
    notes: ["Bergamot", "Musk"]
  }, source);
  assert.equal(profile.quality.pyramidCoverage, "partial");
  assert.deepEqual(profile.olfactory.notes.heart, []);
});

test("deduplicates only accent/case/spacing variants and does not guess synonyms", () => {
  const profile = toFragranceSimilarityProfile({
    id: "dedupe",
    name: "Deduplication",
    notes: ["  Bergamot ", "bergamot", "Bergamota", "Café", "Cafe"]
  }, source);
  assert.deepEqual(profile.olfactory.notes.all, ["Bergamot", "Bergamota", "Café"]);
});

test("catalog builder reports invalid records instead of silently dropping them", () => {
  const result = buildFragranceSimilarityCatalog([
    { id: "good", name: "Good Perfume" },
    { id: "missing-name" }
  ], source);
  assert.equal(result.status, "partial");
  assert.equal(result.acceptedRecords, 1);
  assert.equal(result.rejectedRecords, 1);
  assert.equal(result.rejected[0].id, "missing-name");
  assert.match(result.rejected[0].reason, /id and name/i);
});

test("rejects invalid records, metadata, and non-array catalogs", () => {
  assert.throws(() => toFragranceSimilarityProfile(null, source), /must be an object/i);
  assert.throws(() => toFragranceSimilarityProfile({ id: "x" }, source), /id and name/i);
  assert.throws(() => toFragranceSimilarityProfile({ id: "x", name: "X" }, {}), /source metadata is incomplete/i);
  assert.throws(() => buildFragranceSimilarityCatalog("not-a-catalog", source), /must be an array/i);
});

test("returns immutable profiles and catalog results", () => {
  const result = buildFragranceSimilarityCatalog([{ id: "x", name: "X", notes: ["Musk"] }], source);
  assert.equal(Object.isFrozen(result), true);
  assert.equal(Object.isFrozen(result.profiles[0]), true);
  assert.equal(Object.isFrozen(result.profiles[0].olfactory.notes.all), true);
});
