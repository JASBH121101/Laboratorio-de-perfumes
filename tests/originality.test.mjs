import test from "node:test";
import assert from "node:assert/strict";
import { addMixNote, createMixState } from "../src/js/features/laboratory/mixing/state.js";
import { analyzeOriginality, suggestPersonalChallenge } from "../src/js/features/laboratory/originality/engine.js";
import { renderOriginalityAnalysis } from "../src/js/features/laboratory/originality/panel.js";
import { createArchiveCreation, createArchiveVariant, saveArchiveVersion } from "../src/js/features/archive/model.js";

function mix(ids) {
  let state = createMixState();
  for (const id of ids) state = addMixNote(state, id);
  return state;
}

test("originality engine does not invent a score without a personal baseline", () => {
  const result = analyzeOriginality(mix(["bergamot", "rose"]), []);
  assert.equal(result.status, "needs-history");
  assert.equal(result.score, null);
});

test("originality score compares a candidate against distinct saved formulas", () => {
  const first = createArchiveCreation({ name: "Primera", items: mix(["bergamot", "rose", "sandalwood"]).items, now: "2026-01-01T00:00:00.000Z" });
  const state = mix(["yuzu", "iris", "vetiver", "vanilla"]);
  const result = analyzeOriginality(state, [first]);
  assert.equal(result.status, "ready");
  assert.ok(result.score >= 0 && result.score <= 100);
  assert.ok(result.noteRarity >= 0 && result.noteRarity <= 100);
  assert.ok(result.pairNovelty >= 0 && result.pairNovelty <= 100);
});

test("an identical saved composition is excluded from its own comparison", () => {
  const state = mix(["bergamot", "rose"]);
  const creation = createArchiveCreation({ name: "Candidata guardada", items: state.items });
  const result = analyzeOriginality(state, [creation]);
  assert.equal(result.status, "needs-history");
});

test("historical variants and versions are used as the personal baseline", () => {
  const stateA = mix(["bergamot", "rose"]);
  const creation = createArchiveCreation({ name: "Proyecto", items: stateA.items });
  const stateB = mix(["yuzu", "cedarwood", "vanilla"]);
  const withVariant = createArchiveVariant(creation, { items: stateB.items });
  const result = analyzeOriginality(mix(["lemon", "iris", "vetiver"]), [withVariant]);
  assert.equal(result.status, "ready");
  assert.ok(result.historicalFormulaCount >= 2);
});

test("creative challenge proposes an unselected library reference", () => {
  const state = mix(["bergamot", "rose"]);
  const challenge = suggestPersonalChallenge(state, []);
  assert.ok(challenge);
  assert.ok(!state.items.some((item) => item.id === challenge.id));
});

test("originality panel distinguishes no composition, no baseline and measured state", () => {
  assert.match(renderOriginalityAnalysis(createMixState(), []), /EN ESPERA/);
  assert.match(renderOriginalityAnalysis(mix(["bergamot"]), []), /BASE EN CONSTRUCCIÓN/);
  const first = createArchiveCreation({ name: "Primera", items: mix(["bergamot", "rose"]).items });
  const second = createArchiveCreation({ name: "Segunda", items: mix(["yuzu", "vanilla"]).items });
  const html = renderOriginalityAnalysis(mix(["lemon", "iris"]), [first, second]);
  assert.match(html, /ÍNDICE DE DIFERENCIACIÓN INTERNA/);
  assert.match(html, /No consulta catálogos comerciales/);
});
