import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { ATELIER_ARCHITECTURE } from "../src/js/features/laboratory/architecture.js";

const { room, window, door } = ATELIER_ARCHITECTURE;

test("atelier architecture defines a bounded room around the existing workbench", () => {
  assert.equal(room.width, 11);
  assert.ok(room.depth >= 7);
  assert.ok(room.height >= 3.5);
  assert.ok(room.sideHalfWidth > room.width / 2 - 0.2);
  assert.ok(room.backZ < 0 && room.frontZ > 0);
});

test("left-side window opening fits inside the side wall", () => {
  const minimumZ = window.centerZ - window.width / 2;
  const maximumZ = window.centerZ + window.width / 2;
  assert.ok(minimumZ > room.backZ);
  assert.ok(maximumZ < room.frontZ);
  assert.ok(window.sillHeight > 0);
  assert.ok(window.headHeight < room.height);
  assert.ok(window.headHeight > window.sillHeight);
});

test("rear door opening fits inside the back wall and leaves the shelving span clear", () => {
  const minimumX = door.centerX - door.width / 2;
  const maximumX = door.centerX + door.width / 2;
  assert.ok(minimumX > -room.width / 2);
  assert.ok(maximumX < room.width / 2);
  assert.ok(minimumX > 3);
  assert.ok(door.headHeight > 2.5 && door.headHeight < room.height);
});

test("architecture presets use the art-direction material palette", () => {
  assert.equal(ATELIER_ARCHITECTURE.materials.walnutColor, "#49362F");
  assert.equal(ATELIER_ARCHITECTURE.materials.stoneColor, "#A99A88");
  assert.equal(ATELIER_ARCHITECTURE.materials.brassColor, "#B9915F");
  assert.equal(ATELIER_ARCHITECTURE.floor.metalness, 0);
});

test("Three.js scene mounts the bounded room with its window, door and upper structure", async () => {
  const scene = await readFile(new URL("../src/js/features/laboratory/scene.js", import.meta.url), "utf8");
  assert.match(scene, /createRoomArchitecture\(scene, materials\)/);
  assert.match(scene, /windowGlassMaterial/);
  assert.match(scene, /exteriorGlow/);
  assert.match(scene, /doorFaceZ/);
  assert.match(scene, /ceiling slats over the back work zone/);
  assert.match(scene, /PlaneGeometry\(room\.width, room\.depth\)/);
  assert.doesNotMatch(scene, /PlaneGeometry\(200, 200\)/);
});

test("the architecture module is precached and PWA cache version is incremented", async () => {
  const serviceWorker = await readFile(new URL("../sw.js", import.meta.url), "utf8");
  assert.match(serviceWorker, /shell-v27/);
  assert.match(serviceWorker, /features\/laboratory\/architecture\.js/);
});
