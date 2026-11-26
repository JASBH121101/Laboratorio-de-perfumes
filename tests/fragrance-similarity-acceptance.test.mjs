import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { buildFragranceSimilarityCatalog } from "../src/js/features/laboratory/fragrance-similarity/model.js";
import { buildFragranceSimilarityExperience } from "../src/js/features/laboratory/fragrance-similarity/experience.js";
import { getFragranceSuggestionKeyboardAction } from "../src/js/features/laboratory/fragrance-similarity/interaction.js";

const REFERENCE_ID = "tom-ford-oud-wood";

test("acceptance: reverse search resolves a typo and returns explained, bounded candidates", () => {
  const session = buildFragranceSimilarityExperience({
    query: "Oud Wod",
    selectedReferenceId: REFERENCE_ID
  });

  assert.ok(["suggestions", "exact-match"].includes(session.search.status));
  assert.equal(session.reference?.id, REFERENCE_ID);
  assert.equal(session.status, "ready");
  assert.ok(session.search.results.length <= 8);
  assert.ok(session.ranking.results.length <= 50);
  assert.ok(session.filtered.results.length > 0);
  assert.ok(session.filtered.results.every((item) => item.id !== REFERENCE_ID));
  assert.ok(session.filtered.results.every((item) => item.source.scope === "global-catalog"));
  assert.ok(session.filtered.results.every((item) =>
    Number.isInteger(item.score) && item.score >= 0 && item.score <= 100 &&
    typeof item.confidence?.level === "string"
  ));
});

test("acceptance: changing a query clears selection until a new reference is chosen", () => {
  const session = buildFragranceSimilarityExperience({
    query: "Sauvage",
    selectedReferenceId: ""
  });

  assert.equal(session.status, "reference-required");
  assert.equal(session.reference, null);
  assert.equal(session.ranking, null);
  assert.ok(session.search.results.some((item) => item.name.toLowerCase().includes("sauvage")));
});

test("acceptance: unknown reference IDs fail closed without presenting stale rankings", () => {
  const session = buildFragranceSimilarityExperience({
    query: "Oud Wood",
    selectedReferenceId: "not-a-real-reference-id"
  });

  assert.equal(session.status, "reference-not-found");
  assert.equal(session.reference, null);
  assert.equal(session.ranking, null);
  assert.equal(session.filtered, null);
});

test("acceptance: narrowing and clearing filters preserves the original ranking and evidence", () => {
  const baseline = buildFragranceSimilarityExperience({ selectedReferenceId: REFERENCE_ID });
  const narrowed = buildFragranceSimilarityExperience({
    selectedReferenceId: REFERENCE_ID,
    filters: { minimumScore: 90 }
  });
  const cleared = buildFragranceSimilarityExperience({
    selectedReferenceId: REFERENCE_ID,
    filters: {}
  });

  assert.ok(narrowed.filtered.results.length <= baseline.filtered.results.length);
  assert.ok(narrowed.filtered.results.every((item) => item.score >= 90));
  assert.deepEqual(
    cleared.filtered.results.map((item) => [item.id, item.score, item.confidence.level]),
    baseline.filtered.results.map((item) => [item.id, item.score, item.confidence.level])
  );
});

test("acceptance: global → empty own inventory → global never leaks candidates across scopes", () => {
  const globalBefore = buildFragranceSimilarityExperience({ selectedReferenceId: REFERENCE_ID });
  const emptyOwn = buildFragranceSimilarityExperience({
    selectedReferenceId: REFERENCE_ID,
    scope: "own-inventory"
  });
  const globalAfter = buildFragranceSimilarityExperience({ selectedReferenceId: REFERENCE_ID });

  assert.ok(globalBefore.filtered.results.length > 0);
  assert.equal(emptyOwn.scopeSelection.status, "inventory-empty");
  assert.equal(emptyOwn.ranking.status, "inventory-empty");
  assert.equal(emptyOwn.filtered.status, "inventory-empty");
  assert.deepEqual(emptyOwn.filtered.results, []);
  assert.deepEqual(
    globalAfter.filtered.results.map((item) => [item.id, item.score]),
    globalBefore.filtered.results.map((item) => [item.id, item.score])
  );
});

test("acceptance: inventory adapter returns only supplied items and preserves stock metadata", () => {
  const catalog = buildFragranceSimilarityCatalog();
  const profiles = catalog.profiles.filter((profile) => profile.id !== REFERENCE_ID).slice(0, 4);
  assert.equal(profiles.length, 4);

  const entries = profiles.map((profile, index) => ({
    inventoryItemId: `acceptance-stock-${index + 1}`,
    sku: `JB-A${index + 1}`,
    profile,
    availabilityStatus: index === 0 ? "in-stock" : "out-of-stock",
    quantity: index === 0 ? 3 : 0
  }));
  const session = buildFragranceSimilarityExperience({
    selectedReferenceId: REFERENCE_ID,
    scope: "own-inventory",
    inventoryEntries: entries
  });

  assert.equal(session.scopeSelection.status, "ready");
  assert.equal(session.ranking.scope.key, "own-inventory");
  assert.deepEqual(
    session.filtered.results.map((item) => item.id).sort(),
    profiles.map((profile) => profile.id).sort()
  );
  assert.ok(session.filtered.results.every((item) =>
    entries.some((entry) => entry.inventoryItemId === item.source.inventoryItemId)
  ));
  const stocked = session.filtered.results.find((item) => item.availability.status === "in-stock");
  assert.ok(stocked);
  assert.equal(stocked.availability.quantity, 3);
});

test("acceptance: keyboard interaction supports navigation, selection and dismissal", () => {
  assert.deepEqual(getFragranceSuggestionKeyboardAction("ArrowDown", -1, 3), {
    type: "move", activeIndex: 0
  });
  assert.deepEqual(getFragranceSuggestionKeyboardAction("ArrowUp", -1, 3), {
    type: "move", activeIndex: 2
  });
  assert.deepEqual(getFragranceSuggestionKeyboardAction("Enter", 1, 3), {
    type: "select", activeIndex: 1
  });
  assert.deepEqual(getFragranceSuggestionKeyboardAction("Escape", 1, 3), {
    type: "dismiss", activeIndex: -1
  });
  assert.deepEqual(getFragranceSuggestionKeyboardAction("Enter", -1, 3), {
    type: "none", activeIndex: -1
  });
});

test("acceptance: PWA offline shell includes every similarity engine module exactly once", async () => {
  const source = await readFile(new URL("../sw.js", import.meta.url), "utf8");
  const shellMatch = source.match(/const APP_SHELL = \[([\s\S]*?)\n\];/);
  assert.ok(shellMatch, "PWA APP_SHELL must be declared");
  assert.match(source, /shell-v\d+/);

  const shellPaths = Array.from(shellMatch[1].matchAll(/"([^"]+)"/g), (match) => match[1]);
  assert.equal(new Set(shellPaths).size, shellPaths.length, "PWA shell paths must be unique");

  const modules = [
    "contracts.js", "model.js", "normalization.js", "comparison.js", "scoring.js",
    "explanation.js", "search.js", "ranking.js", "filters.js", "scope.js",
    "experience.js", "panel.js", "interaction.js"
  ];
  for (const module of modules) {
    assert.ok(
      shellPaths.includes(`./src/js/features/laboratory/fragrance-similarity/${module}`),
      `PWA shell is missing ${module}`
    );
  }
});

test("acceptance: score interpretation remains editorial, not chemical or sensory equivalence", () => {
  const session = buildFragranceSimilarityExperience({ selectedReferenceId: REFERENCE_ID });
  const result = session.filtered.results[0];

  assert.match(result.explanation.interpretation, /editorial/i);
  assert.match(result.explanation.interpretation, /química|sensorial/i);
  assert.ok(Array.isArray(result.explanation.limitations));
  assert.ok(result.explanation.limitations.length > 0);
});
