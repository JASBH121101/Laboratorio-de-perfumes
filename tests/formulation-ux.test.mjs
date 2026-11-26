import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { addMixNote, createMixState } from "../src/js/features/laboratory/mixing/state.js";
import { renderMixPickerResults, renderMixStudio } from "../src/js/features/laboratory/mixing/panel.js";
import { filterPerfumeLibrary } from "../src/js/features/perfume-library/library.js";

test("formulation finder filters by family, item type and olfactory role", () => {
  const results = filterPerfumeLibrary({ family: "Cítrica", kind: "Nota olfativa", role: "Salida" });
  assert.ok(results.length > 0);
  assert.ok(results.every((item) => item.family === "Cítrica" && item.kind === "Nota olfativa" && item.roles.includes("Salida")));
});

test("formulation search is accent-insensitive and matches multiple terms", () => {
  assert.deepEqual(
    filterPerfumeLibrary({ query: "citrica brillante" }).map((item) => item.id),
    ["bergamot"]
  );
  assert.ok(filterPerfumeLibrary({ query: "amaderada seca" }).some((item) => item.id === "vetiver"));
});

test("formulation finder renders quick add actions and marks already selected references", () => {
  let state = addMixNote(createMixState(), "bergamot");
  const results = renderMixPickerResults(state, { query: "bergamota" });
  assert.match(results, /Bergamota/);
  assert.match(results, /Añadida/);
  assert.match(results, /disabled/);
});

test("picker displays a useful empty state and clear-filters action", () => {
  const html = renderMixPickerResults(createMixState(), { query: "no-existe-ninguna" });
  assert.match(html, /No hay referencias con esos filtros/);
  assert.match(html, /clear-mix-picker/);
});

test("picker limits the initial results and supports expanding the list", () => {
  const html = renderMixPickerResults(createMixState(), {});
  assert.match(html, /Mostrar .* más referencias/);
  const expanded = renderMixPickerResults(createMixState(), { expanded: true });
  assert.ok((expanded.match(/class="mix-picker-result/g) || []).length > 6);
});

test("composition rows expose slider and precise numeric weight controls", () => {
  const html = renderMixStudio(addMixNote(createMixState(), "bergamot"));
  assert.match(html, /type="range"/);
  assert.match(html, /type="number"/);
  assert.match(html, /data-mix-weight="bergamot"/);
  assert.match(html, /TOTAL DE LA COMPOSICIÓN/);
  assert.match(html, /se distribuyen entre las demás referencias/);
});

test("application keeps finder filters, result expansion and manual clear actions wired", async () => {
  const app = await readFile(new URL("../src/js/app.js", import.meta.url), "utf8");
  assert.match(app, /event\.target\.id === "mix-picker-search"/);
  assert.match(app, /event\.target\.id === "mix-picker-family"/);
  assert.match(app, /event\.target\.id === "mix-picker-kind"/);
  assert.match(app, /event\.target\.id === "mix-picker-role"/);
  assert.match(app, /action === "toggle-mix-picker"/);
  assert.match(app, /action === "clear-mix-picker"/);
  assert.match(app, /renderMixStudio\(mixingState, mixPickerState\)/);
});
