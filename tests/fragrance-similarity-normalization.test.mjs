import test from "node:test";
import assert from "node:assert/strict";
import {
  normalizeFragranceSimilarityProfile,
  normalizeOlfactoryTerm,
  normalizeOlfactoryTerms
} from "../src/js/features/laboratory/fragrance-similarity/normalization.js";
import { toFragranceSimilarityProfile } from "../src/js/features/laboratory/fragrance-similarity/model.js";

const source = {
  name: "Test dataset",
  attribution: "Test attribution",
  license: "CC BY 4.0",
  snapshot: "2026-10-29",
  url: "https://example.com/dataset"
};

test("normalizes common English and Spanish note synonyms to the same key", () => {
  const cases = [
    ["Bergamot", "Bergamota"],
    ["Lemon", "Limón"],
    ["Blackcurrant", "Cassis"],
    ["Pink Pepper", "Pimienta rosa"],
    ["Jasmine", "Jazmín"],
    ["Sandalwood", "Sándalo"],
    ["Oakmoss", "Musgo de roble"],
    ["Tonka Bean", "Haba tonka"],
    ["Olibanum", "Incienso"],
    ["Agarwood", "Oud"]
  ];
  for (const [left, right] of cases) {
    assert.equal(normalizeOlfactoryTerm(left), normalizeOlfactoryTerm(right), `${left} should match ${right}`);
  }
});

test("normalizes editorial dataset family names to broader olfactory family tags", () => {
  const cases = [
    ["Wood & Root", "woody"],
    ["White Bloom", "floral"],
    ["Petal Garden", "floral"],
    ["Spice Route", "spicy"],
    ["Sunlit Citrus", "citrus"],
    ["Orchard Fruit", "fruity"],
    ["Amber & Resin", "amber"]
  ];
  for (const [sourceFamily, expectedTag] of cases) {
    assert.equal(normalizeOlfactoryTerm(sourceFamily, "family"), expectedTag);
  }
});

test("normalizes character descriptors while preserving unknown descriptor identity", () => {
  assert.equal(normalizeOlfactoryTerm("citrusy", "character"), "citrus");
  assert.equal(normalizeOlfactoryTerm("cítrico", "character"), "citrus");
  assert.equal(normalizeOlfactoryTerm("smoky", "character"), "smoky");
  assert.equal(normalizeOlfactoryTerm("unlisted-texture", "character"), "unlisted-texture");
});

test("removes semantic duplicates but preserves the first source label", () => {
  const result = normalizeOlfactoryTerms(["Bergamot", "Bergamota", "bergamot", "Lemon"]);
  assert.deepEqual(result.map((entry) => entry.key), ["bergamot", "lemon"]);
  assert.deepEqual(result.map((entry) => entry.label), ["Bergamot", "Lemon"]);
});

test("keeps related but non-equivalent notes separate", () => {
  assert.notEqual(normalizeOlfactoryTerm("Cedarwood"), normalizeOlfactoryTerm("Sandalwood"));
  assert.notEqual(normalizeOlfactoryTerm("Neroli"), normalizeOlfactoryTerm("Orange Blossom"));
  assert.notEqual(normalizeOlfactoryTerm("Cacao"), normalizeOlfactoryTerm("Chocolate"));
});

test("normalizes profile dimensions without mutating source values", () => {
  const profile = toFragranceSimilarityProfile({
    id: "normalization-sample",
    name: "Normalization Sample",
    family: "Wood & Root",
    notes: ["Bergamot", "Bergamota", "Oud", "Agarwood"],
    top: ["Bergamot"],
    character: ["citrusy", "woody"]
  }, source);
  const normalized = normalizeFragranceSimilarityProfile(profile);
  assert.deepEqual(normalized.families.map((item) => item.key), ["woody", "earthy"]);
  assert.deepEqual(normalized.notes.all.map((item) => item.key), ["bergamot", "oud"]);
  assert.deepEqual(profile.olfactory.notes.all, ["Bergamot", "Bergamota", "Oud", "Agarwood"]);
  assert.equal(normalized.quality.pyramidCoverage, "partial");
});

test("rejects profiles outside the established contract", () => {
  assert.throws(() => normalizeFragranceSimilarityProfile({ id: "invalid" }), /invalid fragrance profile/i);
});
