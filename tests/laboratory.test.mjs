import test from "node:test";
import assert from "node:assert/strict";
import { LAB_PROPS, LAB_RENDER_CONFIG, getLabProp } from "../src/js/features/laboratory/catalog.js";
import { renderLabInspector } from "../src/js/features/laboratory/inspector.js";
import { renderPage } from "../src/js/ui/views.js";
import { createMixState, addMixNote } from "../src/js/features/laboratory/mixing/state.js";

test("3D scene catalogue contains eight selectable atelier props", () => {
  assert.equal(LAB_PROPS.length, 8);
  assert.equal(new Set(LAB_PROPS.map((item) => item.id)).size, 8);
});

test("every prop has a valid position, display name and category", () => {
  for (const item of LAB_PROPS) {
    assert.equal(item.position.length, 3);
    assert.ok(item.title);
    assert.ok(item.category);
    assert.ok(Number.isFinite(item.scale));
  }
});

test("library-linked props point to existing reference notes", async () => {
  const { getPerfumeLibraryItem } = await import("../src/js/features/perfume-library/library.js");
  for (const item of LAB_PROPS.filter((prop) => prop.noteId)) {
    assert.ok(getPerfumeLibraryItem(item.noteId), `Missing note for ${item.id}`);
  }
});

test("unknown prop ids return null", () => {
  assert.equal(getLabProp("not-a-real-prop"), null);
});

test("renderLabInspector shows a selection prompt when empty", () => {
  assert.match(renderLabInspector(), /Seleccioná un objeto/);
});

test("renderLabInspector joins a selected virtual vial to the perfume library", () => {
  const html = renderLabInspector("bergamot-vial");
  assert.match(html, /Vial cítrico/);
  assert.match(html, /Bergamota/);
  assert.match(html, /Cítrica/);
});

test("renderLabInspector does not invent a formula or dosage", () => {
  const html = renderLabInspector("glass-beaker");
  assert.match(html, /representación visual conceptual/);
  assert.doesNotMatch(html, /ml|gramos|porcentaje de concentración/i);
});

test("renderer quality bounds are mobile-conscious", () => {
  assert.equal(LAB_RENDER_CONFIG.threeRevision, "187");
  assert.ok(LAB_RENDER_CONFIG.maxPixelRatio <= 1.5);
  assert.ok(LAB_RENDER_CONFIG.mobileMaxPixelRatio <= 1.25);
  assert.ok(LAB_RENDER_CONFIG.minCameraRadius < LAB_RENDER_CONFIG.initialCameraRadius);
});

test("rendering the Laboratory route passes the composition state into the mixing studio", () => {
  const mixingState = addMixNote(createMixState(), "bergamot");
  const html = renderPage("lab", {}, mixingState);
  assert.match(html, /data-lab-stage/);
  assert.match(html, /id="mix-studio"/);
  assert.match(html, /Bergamota/);
  assert.match(html, /100 pts/);
});

test("rendering the Laboratory route with an empty composition does not throw", () => {
  const html = renderPage("lab", {}, createMixState());
  assert.match(html, /Laboratorio/);
  assert.match(html, /Tu recipiente está vacío/);
  assert.match(html, /id="mix-studio"/);
});

test("other routes keep receiving their own view state", () => {
  const home = renderPage("home", {}, createMixState());
  const notes = renderPage("notes", { query: "bergamota" }, createMixState());
  assert.match(home, /Las ideas también/);
  assert.match(notes, /Biblioteca/);
});
