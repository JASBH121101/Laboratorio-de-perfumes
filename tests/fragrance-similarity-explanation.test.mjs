import test from "node:test";
import assert from "node:assert/strict";
import { toFragranceSimilarityProfile } from "../src/js/features/laboratory/fragrance-similarity/model.js";
import { compareFragranceProfiles } from "../src/js/features/laboratory/fragrance-similarity/comparison.js";
import { scoreFragranceSimilarity } from "../src/js/features/laboratory/fragrance-similarity/scoring.js";
import { explainFragranceSimilarity } from "../src/js/features/laboratory/fragrance-similarity/explanation.js";

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

test("explains shared notes, pyramid stages, and one-sided differences", () => {
  const reference = profile("reference", {
    name: "Reference Perfume",
    family: "Wood & Root",
    notes: ["Bergamot", "Rose", "Musk", "Cedarwood"],
    top: ["Bergamot"],
    heart: ["Rose"],
    base: ["Musk", "Cedarwood"],
    character: ["woody", "warm"]
  });
  const candidate = profile("candidate", {
    name: "Alternative Perfume",
    family: "Wood & Root",
    notes: ["Bergamota", "Jasmine", "Musk", "Vanilla"],
    top: ["Bergamota"],
    heart: ["Jasmine"],
    base: ["Musk", "Vanilla"],
    character: ["woody", "fresh"]
  });
  const comparison = compareFragranceProfiles(reference, candidate);
  const score = scoreFragranceSimilarity(comparison, reference, candidate);
  const explanation = explainFragranceSimilarity(comparison, score);

  assert.equal(explanation.status, "ready");
  assert.equal(explanation.reference.name, "Reference Perfume");
  assert.ok(explanation.similarities.some((row) => row.dimension === "notes" &&
    row.matched.some((item) => item.key === "bergamot")));
  assert.ok(explanation.differences.some((row) => row.dimension === "pyramid.heart" &&
    row.referenceOnly.includes("Rose") && row.candidateOnly.includes("Jasmine")));
  assert.ok(explanation.differences.some((row) => row.dimension === "notes" &&
    row.referenceOnly.includes("Cedarwood") && row.candidateOnly.includes("Vanilla")));
  assert.match(explanation.summary, /similitud editorial estimada/i);
});

test("calls out missing dimensions and the limits of source-only differences", () => {
  const reference = profile("reference", {
    name: "Reference",
    notes: ["Bergamot", "Rose", "Musk"],
    top: ["Bergamot"]
  });
  const candidate = profile("candidate", {
    name: "Candidate",
    notes: ["Bergamota", "Jasmine", "Musk"]
  });
  const comparison = compareFragranceProfiles(reference, candidate);
  const score = scoreFragranceSimilarity(comparison, reference, candidate);
  const explanation = explainFragranceSimilarity(comparison, score);

  assert.ok(explanation.skippedDimensions.some((item) => item.key === "pyramid.heart"));
  assert.ok(explanation.limitations.some((item) => /no confirma que esté ausente/i.test(item)));
  assert.ok(explanation.limitations.some((item) => /faltan datos/i.test(item)));
});

test("produces a clear insufficient-evidence explanation without a made-up percentage", () => {
  const reference = profile("reference", { name: "Reference", notes: ["Bergamot", "Rose"] });
  const candidate = profile("candidate", { name: "Candidate", notes: ["Bergamota", "Jasmine"] });
  const comparison = compareFragranceProfiles(reference, candidate);
  const score = scoreFragranceSimilarity(comparison, reference, candidate);
  const explanation = explainFragranceSimilarity(comparison, score);

  assert.equal(explanation.status, "insufficient-data");
  assert.equal(explanation.score, null);
  assert.match(explanation.summary, /No hay suficientes datos/i);
});

test("rejects invalid explanation inputs", () => {
  assert.throws(() => explainFragranceSimilarity(null, {}), /comparison result/i);
  assert.throws(() => explainFragranceSimilarity({}, null), /score result/i);
});
