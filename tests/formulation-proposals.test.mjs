import test from "node:test";
import assert from "node:assert/strict";
import { PERFUME_ITEMS } from "../src/js/features/perfume-library/data.js";
import { generateFormulationProposals } from "../src/js/features/laboratory/formulation-proposals/engine.js";
import { renderFormulationProposals } from "../src/js/features/laboratory/formulation-proposals/panel.js";
import { createMixState, replaceMixItems, undoMix, getMixTotal } from "../src/js/features/laboratory/mixing/state.js";

const brief = "Quiero una dirección cítrica y amaderada, fresca, no demasiado dulce y discreta para uso diario.";

test("proposal engine generates three real-library alternatives with different structures", () => {
  const result = generateFormulationProposals({ description: brief, mode: "personal" });
  assert.equal(result.status, "ready");
  assert.equal(result.proposals.length, 3);
  const known = new Set(PERFUME_ITEMS.map((item) => item.id));
  const signatures = result.proposals.map((proposal) => proposal.items.map((item) => item.id).join("|"));
  assert.equal(new Set(signatures).size, 3);
  for (const proposal of result.proposals) {
    assert.ok(proposal.items.length >= 2);
    assert.equal(proposal.totalCreativePoints, 100);
    assert.equal(proposal.items.reduce((sum, item) => sum + item.points, 0), 100);
    assert.ok(proposal.items.every((item) => known.has(item.id)));
    assert.ok(proposal.items.every((item) => Number.isInteger(item.points) && item.points >= 0));
  }
});

test("proposal engine excludes the family explicitly avoided in the brief", () => {
  const result = generateFormulationProposals({
    description: "Quiero algo floral y fresco, sin dulzor ni acordes gourmand para el día."
  });
  assert.equal(result.status, "ready");
  assert.ok(result.proposals.every((proposal) =>
    proposal.items.every((item) => item.family !== "Gourmand")
  ));
});

test("proposal engine asks for more direction instead of inventing options", () => {
  const result = generateFormulationProposals({ description: "Quiero algo bonito y diferente." });
  assert.notEqual(result.status, "ready");
  assert.deepEqual(result.proposals, []);
  assert.ok(result.followUpQuestion);
});

test("proposal panel renders weights and explicit load actions with safe text", () => {
  const result = generateFormulationProposals({ description: brief });
  const html = renderFormulationProposals({ result });
  assert.match(html, /A · Afinidad principal/);
  assert.match(html, /B · Contraste equilibrado/);
  assert.match(html, /C · Exploración alternativa/);
  assert.match(html, /load-formulation-proposal/);
  assert.match(html, /100<small> \/ 100 pts/);
  assert.match(html, /No representan concentraciones/);
});

test("loading a proposal validates real unique references and a normalized 100-point total", () => {
  const state = createMixState();
  const loaded = replaceMixItems(state, [
    { id: "bergamot", points: 55 },
    { id: "cedar", points: 45 }
  ]);
  assert.equal(getMixTotal(loaded), 100);
  assert.equal(loaded.items.length, 2);
  assert.equal(loaded.history.length, 1);
  const restored = undoMix(loaded);
  assert.deepEqual(restored.items, []);
});

test("proposal loader rejects unknown ids, duplicates, decimals and incorrect totals", () => {
  const state = createMixState();
  assert.throws(() => replaceMixItems(state, [{ id: "not-real", points: 100 }]), /desconocida/);
  assert.throws(() => replaceMixItems(state, [
    { id: "bergamot", points: 50 }, { id: "bergamot", points: 50 }
  ]), /desconocida o repetida/);
  assert.throws(() => replaceMixItems(state, [
    { id: "bergamot", points: 50.5 }, { id: "rose", points: 49.5 }
  ]), /enteros/);
  assert.throws(() => replaceMixItems(state, [
    { id: "bergamot", points: 40 }, { id: "rose", points: 40 }
  ]), /sumar exactamente 100/);
});

test("app wires generated proposals and explicit load action into the local mix", async () => {
  const { readFile } = await import("node:fs/promises");
  const app = await readFile(new URL("../src/js/app.js", import.meta.url), "utf8");
  const views = await readFile(new URL("../src/js/ui/views.js", import.meta.url), "utf8");
  assert.match(app, /generateFormulationProposals/);
  assert.match(app, /load-formulation-proposal/);
  assert.match(app, /replaceMixItems/);
  assert.match(app, /saveMixDraft\(mixingState\.items\)/);
  assert.match(views, /renderFormulationProposals/);
});
