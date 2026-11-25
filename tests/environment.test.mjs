import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const environment = await readFile(new URL("../src/js/features/laboratory/environment.js", import.meta.url), "utf8");
const scene = await readFile(new URL("../src/js/features/laboratory/scene.js", import.meta.url), "utf8");

test("environment panorama is generated locally and uses equirectangular mapping", () => {
  assert.match(environment, /document\.createElement\("canvas"\)/);
  assert.match(environment, /new THREE\.CanvasTexture\(canvas\)/);
  assert.match(environment, /THREE\.EquirectangularReflectionMapping/);
  assert.doesNotMatch(environment, /https?:\/\//);
});

test("PMREM reflections are generated once with a safe local panorama fallback", () => {
  assert.match(environment, /new THREE\.PMREMGenerator\(renderer\)/);
  assert.match(environment, /fromEquirectangular\(texture\)/);
  assert.match(environment, /scene\.environment = reflectionTarget\.texture/);
  assert.match(environment, /scene\.environment = texture/);
});

test("panorama resolution adapts to mobile and desktop render profiles", () => {
  assert.match(environment, /textureSize >= 512 \? 512 : 256/);
  assert.match(scene, /textureSize: isMobile \? 256 : 512/);
});

test("the environment adds restrained background atmosphere and releases GPU resources", () => {
  assert.match(environment, /scene\.environmentIntensity = 0\.62/);
  assert.match(environment, /scene\.backgroundIntensity = 0\.78/);
  assert.match(environment, /new THREE\.Fog\(0x241d25, 13, 25\)/);
  assert.match(environment, /reflectionTarget\?\.dispose\(\)/);
  assert.match(environment, /texture\.dispose\(\)/);
  assert.match(scene, /environmentResources\.dispose\(\)/);
});

test("the laboratory mounts the local environment before rendering the scene", () => {
  assert.match(scene, /createAtelierEnvironment\(renderer, scene/);
  assert.match(scene, /environmentResources = createAtelierEnvironment/);
});
