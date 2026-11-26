import test from "node:test";
import assert from "node:assert/strict";
import {
  compareCompositions, compareSavedCompositions, makeComparisonSelectionKey
} from "../src/js/features/laboratory/comparison/engine.js";

const left = {
  name: "Perfil cítrico",
  items: [{ id: "bergamot", points: 50 }, { id: "rose", points: 50 }]
};
const right = {
  name: "Perfil floral",
  items: [{ id: "bergamot", points: 25 }, { id: "vanilla", points: 75 }]
};

test("identical compositions report full structural coincidence and no difference", () => {
  const result = compareCompositions(left, { ...left, name: "Copia" });
  assert.equal(result.similarity, 100);
  assert.equal(result.difference, 0);
  assert.equal(result.sharedCount, 2);
  assert.equal(result.changedCount, 0);
  assert.deepEqual(result.added, []);
  assert.deepEqual(result.removed, []);
});

test("comparison quantifies overlap, added references, removed references and point deltas", () => {
  const result = compareCompositions(left, right);
  assert.equal(result.similarity, 25);
  assert.equal(result.difference, 75);
  assert.equal(result.sharedCount, 1);
  assert.deepEqual(result.added, ["vanilla"]);
  assert.deepEqual(result.removed, ["rose"]);
  assert.equal(result.changedCount, 3);
  assert.equal(result.references.find((row) => row.id === "vanilla").delta, 75);
  assert.equal(result.references.find((row) => row.id === "bergamot").delta, -25);
});

test("comparison includes family, facet and pyramid-role breakdowns", () => {
  const result = compareCompositions(left, right);
  assert.ok(result.familyRows.some((row) => row.family === "Cítrica"));
  assert.ok(result.facetRows.some((row) => row.facet === "cítrica"));
  assert.ok(result.roleRows.length > 0);
  assert.ok(result.familyRows.every((row) => Number.isInteger(row.leftPoints) && Number.isInteger(row.rightPoints)));
});

test("comparison rejects empty, unnormalized, duplicate and unknown compositions", () => {
  assert.throws(() => compareCompositions({ name: "Vacía", items: [] }, right), /no contiene/);
  assert.throws(() => compareCompositions({ name: "Inválida", items: [{ id: "bergamot", points: 40 }] }, right), /100 puntos/);
  assert.throws(() => compareCompositions({ name: "Duplicada", items: [{ id: "bergamot", points: 50 }, { id: "bergamot", points: 50 }] }, right), /duplicada/);
  assert.throws(() => compareCompositions({ name: "Desconocida", items: [{ id: "unknown", points: 100 }] }, right), /no existe/);
});

test("saved comparison resolves variants across different creations", () => {
  const creations = [
    { id: "creation-a", name: "Creación A", variants: [{ id: "variant-a", label: "A", name: "Original", items: left.items }] },
    { id: "creation-b", name: "Creación B", variants: [{ id: "variant-b", label: "A", name: "Original", items: right.items }] }
  ];
  const result = compareSavedCompositions(
    creations,
    makeComparisonSelectionKey("creation-a", "variant-a"),
    makeComparisonSelectionKey("creation-b", "variant-b")
  );
  assert.equal(result.left.name, "Creación A · Variante A · Original");
  assert.equal(result.right.name, "Creación B · Variante A · Original");
  assert.equal(result.similarity, 25);
  assert.throws(() => compareSavedCompositions(creations, makeComparisonSelectionKey("creation-a", "variant-a"), makeComparisonSelectionKey("creation-a", "variant-a")), /diferentes/);
  assert.throws(() => compareSavedCompositions(creations, "bad-key", makeComparisonSelectionKey("creation-b", "variant-b")), /selección/);
});
