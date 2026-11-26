import test from "node:test";
import assert from "node:assert/strict";
import { createCreativeProfile, validateCreativeProfile, compareCreativeProfiles } from "../src/js/features/laboratory/profile-history/engine.js";
import { renderProfileHistory } from "../src/js/features/laboratory/profile-history/panel.js";
import { buildClientBrief } from "../src/js/features/laboratory/client-brief/engine.js";
import { generateFormulationProposals } from "../src/js/features/laboratory/formulation-proposals/engine.js";

function profile(id, label, briefInput) {
  const brief = buildClientBrief(briefInput);
  const proposals = generateFormulationProposals({ description: brief.description, mode: "client" });
  return createCreativeProfile({
    id, label, mode: "client", fields: brief.fields,
    description: brief.description, proposals: proposals.proposals,
    now: "2026-11-26T09:00:00.000Z"
  });
}

test("creative profile history stores brief fields and 2–3 valid A/B/C snapshots", () => {
  const saved = profile("profile-fresh", "Fresco diario", {
    occasion: "diario", style: "fresco", presence: "discreta", liked: "cítrico y limpio", avoid: "dulzor marcado"
  });
  assert.equal(saved.label, "Fresco diario");
  assert.equal(saved.alternatives.length, 3);
  assert.ok(saved.alternatives.every((item) => item.items.reduce((sum, row) => sum + row.points, 0) === 100));
  assert.equal(validateCreativeProfile(saved).description, saved.description);
});

test("profile history rejects invalid alternatives and unsafe oversized labels", () => {
  const base = profile("profile-valid", "Perfil amaderado", {
    occasion: "noche", style: "amaderado", presence: "marcada", liked: "maderas y especias"
  });
  assert.throws(() => createCreativeProfile({
    label: "Perfil", description: base.description, proposals: [{ ...base.alternatives[0], items: [{ id: "unknown", points: 100 }] }]
  }), /alternativas|referencias|puntos/i);
  assert.throws(() => createCreativeProfile({
    label: "x".repeat(71), description: base.description, proposals: base.alternatives
  }), /70 caracteres/);
});

test("profile comparison evaluates audience fit, catalog benchmark and selectable performance scenario", () => {
  const left = profile("profile-left", "Fresco diario", {
    occasion: "diario", style: "fresco", presence: "discreta", liked: "cítrico y acuático"
  });
  const right = profile("profile-right", "Cálido nocturno", {
    occasion: "noche", style: "amaderado", presence: "marcada", liked: "ámbar y especias"
  });
  const result = compareCreativeProfiles(left, right, { concentration: "parfum", environment: "cool" });
  assert.equal(result.leftAlternatives.length, 3);
  assert.equal(result.rightAlternatives.length, 3);
  assert.equal(result.scenario.concentration, "parfum");
  assert.equal(result.scenario.environment, "cool");
  assert.ok(result.leftAlternatives.every((item) => item.metrics.audience.status === "ready"));
  assert.ok(result.leftAlternatives.every((item) => item.metrics.performance.status === "ready"));
  assert.ok(Object.hasOwn(result.leftAlternatives[0].metrics.benchmark.topMatches, "arabian"));
  assert.match(result.note, /heurística/);
});

test("profile comparison requires two different saved profiles", () => {
  const saved = profile("profile-one", "Perfil", {
    occasion: "diario", style: "fresco", presence: "discreta", liked: "cítrico"
  });
  assert.throws(() => compareCreativeProfiles(saved, saved), /dos perfiles diferentes/);
});

test("profile history panel renders privacy-safe archive, compare controls and result cards", () => {
  const left = profile("profile-a", "Perfil A", { occasion: "diario", style: "fresco", presence: "discreta", liked: "cítrico" });
  const right = profile("profile-b", "Perfil B", { occasion: "noche", style: "amaderado", presence: "marcada", liked: "maderas" });
  const result = compareCreativeProfiles(left, right);
  const html = renderProfileHistory({
    profiles: [left, right], profileLeftId: left.id, profileRightId: right.id,
    profileComparison: result
  });
  assert.match(html, /Historial y comparación de/);
  assert.match(html, /Guardar perfiles/);
  assert.match(html, /profile-compare-left/);
  assert.match(html, /profile-compare-right/);
  assert.match(html, /PÚBLICO ORIENTATIVO/);
  assert.match(html, /Árabe \/ Ninja/);
  assert.match(html, /RENDIMIENTO ESTIMADO/);
  assert.doesNotMatch(html, /<script/);
});

test("empty profile history offers a clear start and disables comparison", () => {
  const html = renderProfileHistory({ profiles: [] });
  assert.match(html, /El historial está vacío/);
  assert.match(html, /Preparar un perfil/);
  assert.match(html, /disabled/);
});
