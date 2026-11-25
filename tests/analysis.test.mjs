import test from "node:test";
import assert from "node:assert/strict";
import { addMixNote, createMixState, setMixNotePoints } from "../src/js/features/laboratory/mixing/state.js";
import {
  analyzeComposition, getAnalysisDirections, suggestAdjustments
} from "../src/js/features/laboratory/analysis/engine.js";
import { renderCreativeAnalysis } from "../src/js/features/laboratory/analysis/panel.js";

function mix(ids) {
  let state = createMixState();
  for (const id of ids) state = addMixNote(state, id);
  return state;
}

test("empty composition produces an explicit empty analysis", () => {
  const result = analyzeComposition(createMixState());
  assert.equal(result.isEmpty, true);
  assert.equal(result.referenceCount, 0);
  assert.ok(result.observations[0].includes("Añadí"));
});

test("analysis reports family distribution and a dominant family", () => {
  const state = mix(["bergamot", "lemon", "lime"]);
  const result = analyzeComposition(state);
  assert.ok(result.familyCount >= 1);
  assert.equal(result.families[0].label, "Cítrica");
  assert.ok(result.dominantFamily);
  assert.equal(result.totalPoints, 100);
});

test("role coverage reports missing pyramid zones without inventing values", () => {
  const result = analyzeComposition(mix(["bergamot"]));
  assert.ok(result.missingRoles.includes("Fondo"));
  assert.ok(result.roleCoverage.some((role) => role.role === "Salida"));
});

test("profile signals use editorial facets and are bounded", () => {
  const result = analyzeComposition(mix(["vanilla", "sandalwood", "bergamot"]));
  for (const signal of result.profileSignals) {
    assert.ok(signal.share >= 0 && signal.share <= 100);
  }
});

test("overlapping facets are surfaced as observations, not automatic conflicts", () => {
  const result = analyzeComposition(mix(["bergamot", "lemon", "lime"]));
  assert.ok(result.repeatedFacets.length > 0);
  assert.ok(result.observations.some((item) => item.includes("Se repiten facetas")));
});

test("more-sweet direction suggests an unselected sweet reference", () => {
  const suggestions = suggestAdjustments(mix(["bergamot", "cedarwood"]), "sweeter");
  assert.ok(suggestions.length > 0);
  assert.ok(suggestions.every((item) => !["bergamot", "cedarwood"].includes(item.id)));
});

test("less-sweet direction suggests fresh, woody or spicy counterpoints", () => {
  const suggestions = suggestAdjustments(mix(["vanilla", "tonka"]), "lessSweet");
  assert.ok(suggestions.length > 0);
  assert.ok(suggestions.some((item) => ["Cítrica", "Verde", "Aromática", "Amaderada", "Especiada", "Acuática"].includes(item.family)));
});

test("balanced direction rewards a missing family or pyramid role", () => {
  const suggestions = suggestAdjustments(mix(["bergamot", "lemon"]), "balanced");
  assert.ok(suggestions.length > 0);
  assert.ok(suggestions.some((item) => item.reason.length > 0));
});

test("suggestions do not include items already in the mix and are limited", () => {
  const state = mix(["bergamot", "rose", "vanilla"]);
  const suggestions = suggestAdjustments(state, "fresher", 3);
  assert.ok(suggestions.length <= 3);
  assert.ok(suggestions.every((item) => !state.items.some((entry) => entry.id === item.id)));
});

test("all supported creative directions have a stable label", () => {
  const directions = getAnalysisDirections();
  assert.ok(directions.length >= 8);
  assert.ok(directions.every((item) => item.id && item.label));
});

test("analysis renderer labels the reading as heuristic and disclaims physical performance", () => {
  const html = renderCreativeAnalysis(mix(["bergamot", "rose"]), "balanced");
  assert.match(html, /Lectura/);
  assert.match(html, /heurística/);
  assert.match(html, /no miden compatibilidad molecular/);
});

test("empty analysis renderer does not request nonexistent perfume properties", () => {
  const html = renderCreativeAnalysis(createMixState());
  assert.match(html, /Primero construí una composición/);
});

test("creative direction change renderer returns matching selector state", () => {
  const html = renderCreativeAnalysis(mix(["bergamot", "rose"]), "woodier");
  assert.match(html, /value="woodier" selected/);
});
