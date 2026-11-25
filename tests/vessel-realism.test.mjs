import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");

test("vials use rounded revolved geometry and a visible liquid meniscus", async () => {
  const scene = await read("src/js/features/laboratory/scene.js");
  assert.match(scene, /new THREE\.LatheGeometry\(bodyProfile, 40\)/);
  assert.match(scene, /new THREE\.LatheGeometry\(contentProfile, 36\)/);
  assert.match(scene, /liquidMeniscus/);
  assert.match(scene, /glassHeel/);
});

test("beaker liquid is a compound volume with a top surface and meniscus", async () => {
  const scene = await read("src/js/features/laboratory/scene.js");
  assert.match(scene, /conceptual-liquid-volume/);
  assert.match(scene, /new THREE\.CircleGeometry\(0\.32, 48\)/);
  assert.match(scene, /new THREE\.TorusGeometry\(0\.315, 0\.006, 8, 48\)/);
  assert.match(scene, /innerBase/);
  assert.match(scene, /innerLip/);
});

test("graduation graphics are explicitly visual and do not claim calibrated millilitres", async () => {
  const scene = await read("src/js/features/laboratory/scene.js");
  assert.match(scene, /VISUAL INDEX/);
  assert.doesNotMatch(scene, /fillText\("mL"/);
  assert.match(scene, /for \(let index = 0; index < 13; index \+= 1\)/);
});

test("glass materials use controlled physical transmission and labels have a paper-like surface", async () => {
  const [materials, scene] = await Promise.all([
    read("src/js/features/laboratory/materials.js"),
    read("src/js/features/laboratory/scene.js")
  ]);
  assert.match(materials, /transmission: 0\.38/);
  assert.match(materials, /transmission: 0\.52/);
  assert.match(materials, /ior: 1\.47/);
  assert.match(scene, /#eee5d6/);
  assert.match(scene, /rgba\(91, 68, 48, 0\.035\)/);
});

test("Block 15 keeps the scene cached and documents conceptual-only quantities", async () => {
  const [sw, docs] = await Promise.all([
    read("sw.js"),
    read("docs/PHASE2_VISUAL_ART_DIRECTION.md")
  ]);
  assert.match(sw, /shell-v24/);
  assert.match(docs, /15\. Vessel & Glass Realism/);
  assert.match(docs, /Graduations are non-calibrated visual index marks/);
});
