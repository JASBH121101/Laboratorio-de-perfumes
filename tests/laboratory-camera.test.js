import assert from "node:assert/strict";
import test from "node:test";
import {
  clampLaboratoryOrbit,
  LAB_CAMERA_LIMITS,
  LAB_CAMERA_PRESETS
} from "../src/js/features/laboratory/camera-controls.js";

test("frontal orbit clamps horizontal rotation to the atelier opening", () => {
  assert.deepEqual(clampLaboratoryOrbit({ theta: 8, phi: 1.13, radius: 8.8 }), {
    theta: LAB_CAMERA_LIMITS.maxTheta,
    phi: 1.13,
    radius: 8.8
  });
  assert.equal(clampLaboratoryOrbit({ theta: -8, phi: 1.13, radius: 8.8 }).theta, LAB_CAMERA_LIMITS.minTheta);
});

test("camera elevation and zoom stay inside safe inspection bounds", () => {
  const orbit = clampLaboratoryOrbit({ theta: 0, phi: -4, radius: 40 });
  assert.equal(orbit.phi, LAB_CAMERA_LIMITS.minPhi);
  assert.equal(orbit.radius, LAB_CAMERA_LIMITS.maxRadius);
  const close = clampLaboratoryOrbit({ theta: 0, phi: 5, radius: 0 });
  assert.equal(close.phi, LAB_CAMERA_LIMITS.maxPhi);
  assert.equal(close.radius, LAB_CAMERA_LIMITS.minRadius);
});

test("invalid camera input falls back to the frontal workbench position", () => {
  assert.deepEqual(clampLaboratoryOrbit({ theta: Number.NaN, phi: Number.NaN, radius: Number.NaN }), {
    theta: 0,
    phi: 1.13,
    radius: 8.8
  });
});

test("camera presets keep the workbench as the primary frontal view", () => {
  assert.equal(LAB_CAMERA_PRESETS.workbench.theta, 0);
  assert.deepEqual(LAB_CAMERA_PRESETS.workbench.target, [0, 1.16, 0.05]);
  assert.ok(LAB_CAMERA_PRESETS.bottle.radius < LAB_CAMERA_PRESETS.workbench.radius);
  assert.ok(LAB_CAMERA_PRESETS.overview.radius > LAB_CAMERA_PRESETS.workbench.radius);
  assert.ok(LAB_CAMERA_PRESETS.atelier.radius > LAB_CAMERA_PRESETS.overview.radius);
  assert.deepEqual(LAB_CAMERA_PRESETS.atelier.target, [0, 1.55, 0]);
});

test("orbit limits keep the view in a controlled frontal arc", () => {
  assert.equal(LAB_CAMERA_LIMITS.minTheta, -0.5);
  assert.equal(LAB_CAMERA_LIMITS.maxTheta, 0.5);
  assert.ok(LAB_CAMERA_LIMITS.maxRadius <= 12.1);
});
