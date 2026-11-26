import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("laboratory exposes compact in-page navigation for its main work areas", async () => {
  const views = await readFile(new URL("../src/js/ui/views.js", import.meta.url), "utf8");
  assert.match(views, /class="lab-section-nav"/);
  assert.match(views, /aria-label="Secciones del laboratorio"/);
  for (const target of ["mix-studio", "creative-assistant", "creative-analysis", "originality-analysis", "evolution-simulator", "performance-estimate"]) {
    assert.ok(views.includes(`href="#${target}"`), `Missing in-page navigation target: ${target}`);
  }
});

test("laboratory navigation remains horizontally scrollable and chart sections retain anchor clearance", async () => {
  const analytics = await readFile(new URL("../src/css/analytics.css", import.meta.url), "utf8");
  const laboratory = await readFile(new URL("../src/css/laboratory.css", import.meta.url), "utf8");
  assert.match(analytics, /\.lab-section-nav[\s\S]*overflow-x:auto/);
  assert.match(analytics, /@media\(max-width:700px\)/);
  assert.match(analytics, /scroll-margin-top:126px/);
  assert.match(laboratory, /\.analysis-profile-list/);
  assert.match(laboratory, /\.analysis-empty-link/);
});
