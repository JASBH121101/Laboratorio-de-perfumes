import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const scene = await readFile(new URL("../src/js/features/laboratory/scene.js", import.meta.url), "utf8");
const view = await readFile(new URL("../src/js/ui/views.js", import.meta.url), "utf8");
const app = await readFile(new URL("../src/js/app.js", import.meta.url), "utf8");
const styles = await readFile(new URL("../src/css/laboratory.css", import.meta.url), "utf8");
const { LAB_CAMERA_PRESETS, LAB_CAMERA_LIMITS, clampLaboratoryOrbit } = await import("../src/js/features/laboratory/camera-controls.js");

test("camera offers separate experiment and atelier presets with distinct framing", () => {
  for (const preset of ["overview", "bottle", "workbench", "atelier"]) {
    assert.ok(LAB_CAMERA_PRESETS[preset], `Missing camera preset: ${preset}`);
  }
  assert.match(scene, /animateCameraPreset/);
  assert.match(scene, /setCameraPreset: animateCameraPreset/);
  assert.deepEqual(LAB_CAMERA_PRESETS.bottle.target, [0, 1.28, 0.12]);
  assert.deepEqual(LAB_CAMERA_PRESETS.workbench.target, [0, 1.16, 0.05]);
  assert.ok(LAB_CAMERA_PRESETS.bottle.radius < LAB_CAMERA_PRESETS.workbench.radius);
  assert.ok(LAB_CAMERA_PRESETS.atelier.radius > LAB_CAMERA_PRESETS.overview.radius);
  assert.deepEqual(clampLaboratoryOrbit({ theta: 3, phi: 1.13, radius: 20 }), {
    theta: LAB_CAMERA_LIMITS.maxTheta,
    phi: 1.13,
    radius: LAB_CAMERA_LIMITS.maxRadius
  });
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
  assert.match(app, /button\.dataset\.cameraPreset === cameraPreset/);
  assert.match(app, /button\.setAttribute\("aria-pressed", String\(active\)\)/);
});

test("preset styling exposes a visible selected state and keyboard focus", () => {
  assert.match(styles, /\.lab-camera-presets button\.is-active/);
  assert.match(styles, /focus-visible/);
});
