import test from "node:test";
import assert from "node:assert/strict";
import { buildFragranceSimilarityExperience } from "../src/js/features/laboratory/fragrance-similarity/experience.js";
import { renderFragranceSimilarityPanel, renderFragranceSimilarityResults, renderFragranceSimilaritySuggestions } from "../src/js/features/laboratory/fragrance-similarity/panel.js";

test("renders accessible reverse-search and filter controls", () => {
  const html = renderFragranceSimilarityPanel({});
  assert.match(html,/id="fragrance-similarity"/);
  assert.match(html,/for="fragrance-similarity-search"/);
  assert.match(html,/aria-live="polite"/);
  assert.match(html,/fragrance-similarity-scope/);
  assert.match(html,/similarity-filter-category/);
  assert.match(html,/similarity-filter-band/);
  assert.match(html,/similarity-filter-confidence/);
});

test("renders search suggestions as operable listbox options", () => {
  const html = renderFragranceSimilaritySuggestions(buildFragranceSimilarityExperience({query:"Tom Ford"}));
  assert.match(html,/role="listbox"/);
  assert.match(html,/data-similarity-select=/);
  assert.match(html,/Tom Ford/);
});

test("renders editorial score, confidence and olfactory evidence separately", () => {
  const html = renderFragranceSimilarityResults(buildFragranceSimilarityExperience({selectedReferenceId:"tom-ford-oud-wood"}));
  assert.match(html,/similitud/);
  assert.match(html,/Confianza/);
  assert.match(html,/Coincidencias olfativas/);
  assert.match(html,/no expresa probabilidad/i);
});

test("explains missing own inventory without catalog fallback", () => {
  const html = renderFragranceSimilarityResults(buildFragranceSimilarityExperience({selectedReferenceId:"tom-ford-oud-wood",scope:"own-inventory"}));
  assert.match(html,/Inventario propio sin conectar/);
  assert.doesNotMatch(html,/ALTERNATIVAS ENCONTRADAS/);
});
