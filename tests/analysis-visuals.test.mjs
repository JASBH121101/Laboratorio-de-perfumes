import { readFile } from "node:fs/promises";
import test from "node:test";
import assert from "node:assert/strict";
import { renderCreativeAnalysis } from "../src/js/features/laboratory/analysis/panel.js";
import { createMixState, addMixNote } from "../src/js/features/laboratory/mixing/state.js";

test("empty creative analysis remains clean and does not render charts", () => {
  const html = renderCreativeAnalysis(createMixState());
  assert.match(html, /Primero construí una composición/);
  assert.match(html, /analysis-empty-link/);
  assert.match(html, /href="#mix-studio"/);
  assert.doesNotMatch(html, /analysis-family-donut|analysis-profile-radar|<svg/);
});

test("populated analysis renders accessible family donut and sensory radar", () => {
  let state = createMixState();
  state = addMixNote(state, "bergamot");
  state = addMixNote(state, "vanilla");
  const html = renderCreativeAnalysis(state);
  assert.match(html, /analysis-family-donut/);
  assert.match(html, /Distribución de familias olfativas/);
  assert.match(html, /analysis-profile-radar/);
  assert.match(html, /Radar de facetas sensoriales/);
  assert.match(html, /analysis-family-legend-row/);
  assert.match(html, /analysis-role-track/);
});

test("chart system is SVG/CSS-only, keeps signal overlap explicit and has mobile layout", async () => {
  const { readFile } = await import("node:fs/promises");
  const panel = await readFile(new URL("../src/js/features/laboratory/analysis/panel.js", import.meta.url), "utf8");
  const css = await readFile(new URL("../src/css/laboratory.css", import.meta.url), "utf8");
  assert.match(panel, /renderFamilyDonut/);
  assert.match(panel, /renderProfileRadar/);
  assert.match(panel, /facetas pueden solaparse/);
  assert.match(css, /analysis-family-visual/);
  assert.match(css, /analysis-radar-area/);
  assert.match(css, /analysis-profile-radar/);
});


test("family chart legend exposes accessible share tracks and mobile chart layout", async () => {
  let state = createMixState();
  state = addMixNote(state, "bergamot");
  state = addMixNote(state, "vanilla");
  const html = renderCreativeAnalysis(state);
  assert.match(html, /analysis-family-legend-track/);
  assert.match(html, /role="progressbar"/);
  const css = await readFile(new URL("../src/css/laboratory.css", import.meta.url), "utf8");
  assert.match(css, /\.analysis-family-legend-track/);
  assert.match(css, /@media\(max-width:700px\)/);
  assert.match(css, /\.analysis-family-visual \{ grid-template-columns:minmax\(0,1fr\)/);
});
