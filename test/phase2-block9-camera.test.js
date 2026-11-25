import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");

test("Phase 2 Block 9 camera presets and transitions are wired", async () => {
  const [scene, views, app, css, sw, spec] = await Promise.all([
    read("src/js/features/laboratory/scene.js"),
    read("src/js/ui/views.js"),
    read("src/js/app.js"),
    read("src/css/laboratory.css"),
    read("sw.js"),
    read("docs/PHASE2_VISUAL_ART_DIRECTION.md")
  ]);
  for (const preset of ["overview", "workbench", "bottle"]) {
    assert.match(scene, new RegExp(preset));
    assert.match(views, new RegExp(`data-camera-preset="${preset}"`));
  }
  assert.match(scene, /prefers-reduced-motion/);
  assert.match(scene, /cancelAnimationFrame/);
  assert.match(app, /setCameraPreset|cameraPreset/);
  assert.match(css, /lab-camera-presets/);
  assert.equal((views.match(/class="lab-camera-presets"/g) || []).length, 1);
  assert.match(views, /aria-pressed="true"/);
  assert.match(sw, /shell-v18/);
  assert.match(spec, /Block 9 implementation record/);
});
