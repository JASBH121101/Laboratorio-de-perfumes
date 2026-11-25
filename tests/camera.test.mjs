import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const scene = await readFile(new URL("../src/js/features/laboratory/scene.js", import.meta.url), "utf8");
const view = await readFile(new URL("../src/js/ui/views.js", import.meta.url), "utf8");
const app = await readFile(new URL("../src/js/app.js", import.meta.url), "utf8");
const styles = await readFile(new URL("../src/css/laboratory.css", import.meta.url), "utf8");

test("camera offers overview, bottle and workbench presets with distinct cinematic framing", () => {
  for (const preset of ["overview", "bottle", "workbench", "experiment"]) {
    assert.ok(scene.includes(`${preset}:`), `Missing camera preset: ${preset}`);
  }
  assert.match(scene, /animateCameraPreset/);
  assert.match(scene, /setCameraPreset: \(preset\) =>/);
  assert.match(scene, /setExperimentMode/);
  assert.match(scene, /experiment: \{ theta: 0, phi: 1\.42/);
  assert.match(scene, /target: \[0, 1\.38, 0\.12\]/);
  assert.match(scene, /target: \[0, 0\.94, 0\.08\]/);
  assert.match(scene, /radius: 6\.35/);
});

test("camera preset transitions are eased, interruptible and respect reduced motion", () => {
  assert.match(scene, /const ease = \(t\) => t \* t \* \(3 - 2 \* t\)/);
  assert.match(scene, /stopCameraTransition\(\)/);
  assert.match(scene, /cancelAnimationFrame/);
  assert.match(scene, /prefers-reduced-motion: reduce/);
  assert.match(scene, /if \(progress < 1\) cameraTransitionFrame = requestAnimationFrame\(frame\)/);
});

test("manual pointer, wheel and keyboard controls interrupt a running camera transition", () => {
  assert.match(scene, /function onPointerDown\(event\) \{\s*if \(disposed\) return;\s*stopCameraTransition\(\)/);
  assert.match(scene, /function onWheel\(event\) \{\s*stopCameraTransition\(\)/);
  assert.match(scene, /function onKeyDown\(event\) \{\s*stopCameraTransition\(\)/);
  assert.match(scene, /stopCameraTransition\(\);\s*stopObjectFocusAnimation\(\);\s*if \(resizeObserver\)/);
});

test("camera preset controls are accessible and the app connects each button to the controller", () => {
  for (const preset of ["overview", "bottle", "workbench"]) {
    assert.ok(view.includes(`data-camera-preset="${preset}"`));
  }
  assert.match(view, /role="group" aria-label="Encuadres de cámara"/);
  assert.equal((view.match(/class="lab-camera-presets"/g) || []).length, 1, "Stage must expose one camera preset group");
  assert.match(view, /aria-pressed="true"/);
  assert.match(app, /labController\?\.setCameraPreset\?\.\(cameraPreset\)/);
  assert.match(app, /button\.dataset\.cameraPreset === activePreset/);
  assert.match(app, /button\.setAttribute\("aria-pressed", String\(active\)\)/);
});

test("preset styling exposes a visible selected state and keyboard focus", () => {
  assert.match(styles, /\.lab-camera-presets button\.is-active/);
  assert.match(styles, /focus-visible/);
});
