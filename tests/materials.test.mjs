import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const materialModule = await readFile(new URL("../src/js/features/laboratory/materials.js", import.meta.url), "utf8");
const scene = await readFile(new URL("../src/js/features/laboratory/scene.js", import.meta.url), "utf8");

test("PBR maps are generated locally with CanvasTexture and no remote asset URLs", () => {
  assert.match(materialModule, /new THREE\.CanvasTexture/);
  assert.match(materialModule, /document\.createElement\("canvas"\)/);
  assert.doesNotMatch(materialModule, /https?:\/\//);
});

test("wood and stone materials use color and bump maps with repeat wrapping", () => {
  assert.match(materialModule, /THREE\.RepeatWrapping/);
  assert.match(materialModule, /bumpMap: woodMaps\.bump/);
  assert.match(materialModule, /bumpMap: stoneMaps\.bump/);
  assert.match(materialModule, /bumpScale:/);
  assert.match(materialModule, /repeatX:/);
});

test("brushed brass uses a roughness map and a metallic PBR response", () => {
  assert.match(materialModule, /roughnessMap: brassMaps\.roughness/);
  assert.match(materialModule, /metalness: 0\.78/);
  assert.match(materialModule, /createBrushedBrassMaps/);
});

test("texture quality scales to the selected device profile", () => {
  assert.match(scene, /textureSize: isMobile \? 256 : 512/);
  assert.match(scene, /Math\.min\(renderProfile\.maxAnisotropy, hardwareAnisotropy\)/);
  assert.match(materialModule, /texture\.anisotropy = Math\.max\(1, anisotropy\)/);
});

test("the same PBR material library is reused across room, furniture and props", () => {
  assert.match(scene, /createAtelierMaterials/);
  assert.match(scene, /createRoomArchitecture\(scene, materials\)/);
  assert.match(scene, /createFurniture\(scene, materials\)/);
  assert.match(scene, /createPropMesh\(prop, materials\)/);
  assert.match(scene, /materials\.counterstone/);
  assert.match(scene, /materials\.brass/);
});

test("shared PBR library includes dedicated transparent lab-vessel glass", () => {
  assert.match(materialModule, /const vesselGlass = new THREE\.MeshPhysicalMaterial/);
  assert.match(materialModule, /transmission: 0\.52/);
  assert.match(materialModule, /ior: 1\.47/);
  assert.match(materialModule, /vesselGlass,/);
});


test("atelier walls use a subtle locally generated mineral-plaster finish", () => {
  assert.match(materialModule, /function createPlasterMaps/);
  assert.match(materialModule, /const plasterMaps = createPlasterMaps\(size, anisotropy\)/);
  assert.match(materialModule, /map: plasterMaps\.color \|\| null/);
  assert.match(materialModule, /bumpMap: plasterMaps\.bump \|\| null/);
  assert.match(materialModule, /bumpScale: 0\.009/);
  assert.match(materialModule, /roughness: 0\.94/);
});

test("workbench stone uses a restrained honed finish", () => {
  assert.match(materialModule, /bumpScale: 0\.012,\s*roughness: 0\.7,\s*metalness: 0\.015/);
});
