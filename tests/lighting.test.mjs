import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { LAB_PROPS } from "../src/js/features/laboratory/catalog.js";
import { LAB_RENDER_PROFILES } from "../src/js/features/laboratory/render-profile.js";

const scene = await readFile(new URL("../src/js/features/laboratory/scene.js", import.meta.url), "utf8");

test("contact shadows are available on every device without enabling mobile shadow maps", () => {
  assert.equal(LAB_RENDER_PROFILES.mobileLite.shadowsEnabled, false);
  assert.equal(LAB_RENDER_PROFILES.mobileStandard.shadowsEnabled, false);
  assert.equal(LAB_RENDER_PROFILES.desktopHigh.shadowsEnabled, true);
  assert.match(scene, /createContactShadowMaterial/);
  assert.match(scene, /createRadialGradient/);
  assert.match(scene, /depthWrite: false/);
});

test("dynamic PCF soft shadows are restricted to the high desktop profile", () => {
  assert.match(scene, /renderer\.shadowMap\.type = THREE\.PCFSoftShadowMap/);
  assert.match(scene, /keyLight\.castShadow = renderProfile\.shadowsEnabled/);
  assert.match(scene, /if \(renderProfile\.shadowsEnabled\)/);
  assert.match(scene, /object\.receiveShadow = true/);
});

test("primary warm key light is placed at the side window and receives cool fill", () => {
  assert.match(scene, /keyLight\.position\.set\(-5\.15, 5\.2, -0\.65\)/);
  assert.match(scene, /keyLight\.target\.position\.set\(0, 1\.0, 0\)/);
  assert.match(scene, /new THREE\.DirectionalLight\(0xb7cbd8, 0\.85\)/);
  assert.match(scene, /shelfPractical/);
  assert.match(scene, /benchPractical/);
});

test("the visible glass vessels and tools are grounded near the workbench surface", () => {
  const groundedProps = LAB_PROPS.filter((prop) => [
    "author-bottle",
    "bergamot-vial",
    "rose-vial",
    "sandalwood-vial",
    "vanilla-vial",
    "glass-beaker",
    "glass-pipette",
    "note-tray"
  ].includes(prop.id));
  assert.equal(groundedProps.length, 8);
  for (const prop of groundedProps) {
    assert.ok(prop.position[1] >= 0.7 && prop.position[1] <= 0.9, `${prop.id} height is outside the workbench range`);
  }
});

test("contact shadows are placed beneath each prop and the workbench legs", () => {
  assert.match(scene, /for \(const prop of LAB_PROPS\)/);
  assert.match(scene, /addContactShadow\(scene, contactShadowMaterial, prop\.position\[0\], prop\.position\[2\]/);
  assert.match(scene, /for \(const x of \[-4\.15, 4\.15\]\)/);
  assert.match(scene, /isContactShadow/);
});


test("contact-shadow decal has a stronger central contact core and soft outer falloff", () => {
  assert.match(scene, /createRadialGradient\(80, 80, 2, 80, 80, 76\)/);
  assert.match(scene, /rgba\(10, 8, 11, 0\.58\)/);
  assert.match(scene, /opacity: 0\.66/);
  assert.match(scene, /polygonOffsetFactor: -1/);
});
