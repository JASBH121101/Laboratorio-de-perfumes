import test from "node:test";
import assert from "node:assert/strict";
import { PERFUME_ITEMS } from "../src/js/features/perfume-library/data.js";
import { filterPerfumeLibrary, getPerfumeLibraryItem, getPerfumeLibraryStats } from "../src/js/features/perfume-library/library.js";

test("the educational perfume library has a populated and stable catalogue", () => {
  assert.equal(PERFUME_ITEMS.length, 60);
  assert.ok(getPerfumeLibraryStats().families >= 10);
});

test("each reference has a unique id and required editorial fields", () => {
  const ids = PERFUME_ITEMS.map((item) => item.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const item of PERFUME_ITEMS) {
    assert.ok(item.name);
    assert.ok(item.family);
    assert.ok(["Nota olfativa", "Acorde"].includes(item.kind));
    assert.ok(item.profile);
    assert.ok(item.roles.length > 0);
  }
});

test("family, pyramid role and text search filters combine", () => {
  const results = filterPerfumeLibrary({ family: "Cítrica", role: "Salida", query: "limón" });
  assert.deepEqual(results.map((item) => item.id), ["lemon"]);
});

test("accords are separately identifiable from olfactory notes", () => {
  assert.equal(getPerfumeLibraryItem("marine").kind, "Acorde");
  assert.equal(getPerfumeLibraryItem("bergamot").kind, "Nota olfativa");
});

test("query can match sensory descriptors and pairing suggestions", () => {
  assert.ok(filterPerfumeLibrary({ query: "terrosa" }).some((item) => item.id === "vetiver"));
  assert.ok(filterPerfumeLibrary({ query: "neroli" }).some((item) => item.id === "orange-blossom"));
});

test("unknown detail ids return null", () => {
  assert.equal(getPerfumeLibraryItem("not-real"), null);
});
