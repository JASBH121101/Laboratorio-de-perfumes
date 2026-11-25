import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const assets = await readFile(new URL("../src/js/features/laboratory/perfume-assets.js", import.meta.url), "utf8");
const scene = await readFile(new URL("../src/js/features/laboratory/scene.js", import.meta.url), "utf8");

test("premium flacon geometry has curved shoulders, an integrated neck and beveled glass edges", () => {
  assert.match(assets, /new THREE\.ExtrudeGeometry\(shape/);
  assert.match(assets, /bevelEnabled: true/);
  assert.match(assets, /bevelSegments: 4/);
  assert.match(assets, /shape\.quadraticCurveTo/);
  assert.match(scene, /createFlaconGeometry\(\)/);
  assert.doesNotMatch(scene, /new THREE\.BoxGeometry\(0\.88, 1\.08, 0\.46\)/);
});

test("bottle asset includes liquid, dip tube, layered label and premium cap details", () => {
  for (const feature of [
    "dipTube",
    "labelBacking",
    "labelInset",
    "capLowerRing",
    "capTop",
    "for (let index = 0; index < 8; index += 1)"
  ]) assert.ok(scene.includes(feature), `Missing bottle feature: ${feature}`);
  assert.match(scene, /materials\.brass/);
  assert.match(scene, /materials\.darkWalnut/);
});

test("vials use more detailed glass geometry, collars and layered labels", () => {
  assert.match(scene, /CylinderGeometry\(0\.19, 0\.21, 0\.57, 32\)/);
  assert.match(scene, /const collar = new THREE\.Mesh\(new THREE\.CylinderGeometry\(0\.125/);
  assert.match(scene, /createRoundedPlateGeometry\(0\.34, 0\.2/);
});

test("rounded plate geometry is reusable for bottle and vial labels", () => {
  assert.match(assets, /export function createRoundedPlateGeometry/);
  assert.match(assets, /THREE\.MathUtils\.clamp/);
  assert.match(scene, /createRoundedPlateGeometry\(0\.72, 0\.38/);
  assert.match(scene, /createRoundedPlateGeometry\(0\.34, 0\.2/);
});
