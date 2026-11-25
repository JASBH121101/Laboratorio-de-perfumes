import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { LAB_PROPS } from "../src/js/features/laboratory/catalog.js";

const scene = await readFile(new URL("../src/js/features/laboratory/scene.js", import.meta.url), "utf8");
const materials = await readFile(new URL("../src/js/features/laboratory/materials.js", import.meta.url), "utf8");

test("beaker has a hollow glass wall, thick base, lip and a measurement scale", () => {
  assert.match(scene, /CylinderGeometry\(0\.365, 0\.42, 0\.72, 40, 1, true\)/);
  assert.match(scene, /TorusGeometry\(0\.365, 0\.022, 10, 48\)/);
  assert.match(scene, /makeMeasurementTexture/);
  assert.match(scene, /scaleLabel/);
  assert.match(materials, /const vesselGlass = new THREE\.MeshPhysicalMaterial/);
});

test("pipette has a tapered tip, rounded bulb and graduated metallic bands", () => {
  assert.match(scene, /CylinderGeometry\(0\.032, 0\.045, 0\.92, 20\)/);
  assert.match(scene, /ConeGeometry\(0\.045, 0\.24, 18\)/);
  assert.match(scene, /SphereGeometry\(0\.13, 18, 16\)/);
  assert.match(scene, /TorusGeometry\(0\.043, 0\.006, 8, 20\)/);
});

test("reference tray is a rounded organizer with lining, dividers and rivets", () => {
  assert.match(scene, /createRoundedPlateGeometry\(1\.35, 0\.82, 0\.1, 0\.1\)/);
  assert.match(scene, /const inset = new THREE\.Mesh/);
  assert.match(scene, /for \(const x of \[-0\.23, 0\.24\]\)/);
  assert.match(scene, /SphereGeometry\(0\.026, 12, 10\)/);
  const tray = LAB_PROPS.find((prop) => prop.id === "note-tray");
  assert.ok(tray);
  assert.equal(tray.position[1], 0.74);
});

test("all eight visible props remain selectable after equipment refinement", () => {
  assert.equal(LAB_PROPS.length, 8);
  assert.match(scene, /createPropMesh\(prop, materials\)/);
  assert.match(scene, /selectable\.push\(group\)/);
});
