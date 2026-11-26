import test from "node:test";
import assert from "node:assert/strict";
import { buildFragranceSimilarityExperience } from "../src/js/features/laboratory/fragrance-similarity/experience.js";
import { renderFragranceSimilarityPanel, renderFragranceSimilarityResults, renderFragranceSimilaritySuggestions } from "../src/js/features/laboratory/fragrance-similarity/panel.js";

test("renders accessible reverse-search and filter controls", () => {
  const html = renderFragranceSimilarityPanel({});
  assert.match(html,/id="fragrance-similarity"/);
  assert.match(html,/for="fragrance-similarity-search"/);
  assert.match(html,/role="combobox"/);
  assert.match(html,/aria-autocomplete="list"/);
  assert.match(html,/aria-controls="fragrance-similarity-listbox"/);
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
  assert.match(html,/id="fragrance-similarity-option-/);
  assert.match(html,/Tom Ford/);
  const active = renderFragranceSimilaritySuggestions(buildFragranceSimilarityExperience({query:"Tom Ford"}),{activeIndex:0});
  assert.match(active,/aria-selected="true"/);
  const closed = renderFragranceSimilaritySuggestions(buildFragranceSimilarityExperience({query:"Tom Ford"}),{open:false});
  assert.equal(closed,"");
});

test("renders editorial score, confidence and olfactory evidence separately", () => {
  const html = renderFragranceSimilarityResults(buildFragranceSimilarityExperience({selectedReferenceId:"tom-ford-oud-wood"}));
  assert.match(html,/similitud/);
  assert.match(html,/Confianza/);
  assert.match(html,/Índice de confianza/);
  assert.match(html,/Dimensiones comparables/);
  assert.match(html,/Peso de datos disponible/);
  assert.match(html,/Coincidencias olfativas/);
  assert.match(html,/no expresa probabilidad/i);
});

test("explains missing own inventory without catalog fallback", () => {
  const html = renderFragranceSimilarityResults(buildFragranceSimilarityExperience({selectedReferenceId:"tom-ford-oud-wood",scope:"own-inventory"}));
  assert.match(html,/Inventario propio sin conectar/);
  assert.doesNotMatch(html,/ALTERNATIVAS ENCONTRADAS/);
});


test("offers a direct filter reset when the active filters hide every candidate", () => {
  const session = buildFragranceSimilarityExperience({
    selectedReferenceId:"tom-ford-oud-wood",
    filters:{houseQuery:"Casa que no existe"}
  });
  const html = renderFragranceSimilarityResults(session);
  assert.equal(session.filtered.status,"no-filtered-results");
  assert.match(html,/Sin resultados con estos filtros/);
  assert.match(html,/data-action="reset-fragrance-similarity-filters"/);
});

test("renders an explicit no-match search message and a minimum-query hint", () => {
  const noMatch = renderFragranceSimilaritySuggestions(buildFragranceSimilarityExperience({query:"zzzxqv-unlisted"}));
  const short = renderFragranceSimilaritySuggestions(buildFragranceSimilarityExperience({query:"x"}));
  assert.match(noMatch,/No encontramos coincidencias/);
  assert.match(short,/al menos dos caracteres/);
});
