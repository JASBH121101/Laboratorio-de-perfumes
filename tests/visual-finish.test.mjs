import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { LAB_RENDER_PROFILES } from "../src/js/features/laboratory/render-profile.js";

const scene = await readFile(new URL("../src/js/features/laboratory/scene.js", import.meta.url), "utf8");
const styles = await readFile(new URL("../src/css/laboratory.css", import.meta.url), "utf8");

test("each rendering tier defines a restrained exposure and environment grade", () => {
  const profiles = Object.values(LAB_RENDER_PROFILES);
  assert.equal(profiles.length, 3);
  for (const profile of profiles) {
    assert.ok(profile.exposure >= 1 && profile.exposure <= 1.1);
    assert.ok(profile.environmentIntensity >= 0.4 && profile.environmentIntensity <= 0.75);
    assert.ok(profile.backgroundIntensity >= 0.6 && profile.backgroundIntensity <= 0.9);
  }
  assert.ok(LAB_RENDER_PROFILES.mobileLite.exposure < LAB_RENDER_PROFILES.desktopHigh.exposure);
  assert.ok(LAB_RENDER_PROFILES.mobileLite.environmentIntensity < LAB_RENDER_PROFILES.desktopHigh.environmentIntensity);
});

test("renderer and environment consume the selected tier's finish settings", () => {
  assert.match(scene, /renderer\.toneMapping = THREE\.ACESFilmicToneMapping/);
  assert.match(scene, /renderer\.toneMappingExposure = renderProfile\.exposure/);
  assert.match(scene, /scene\.environmentIntensity = renderProfile\.environmentIntensity/);
  assert.match(scene, /scene\.backgroundIntensity = renderProfile\.backgroundIntensity/);
  assert.match(scene, /stage\.dataset\.visualTier = renderProfile\.id/);
});

test("stage vignette is tiered and cannot intercept pointer or touch interaction", () => {
  assert.match(styles, /\.lab-stage::after/);
  assert.match(styles, /data-visual-tier="mobile-lite"/);
  assert.match(styles, /data-visual-tier="mobile-standard"/);
  assert.match(styles, /data-visual-tier="desktop-high"/);
  assert.match(styles, /pointer-events: none/);
  assert.match(styles, /radial-gradient\(ellipse at 50% 48%/);
});

test("final visual finish avoids a heavy WebGL post-processing dependency", () => {
  assert.doesNotMatch(scene, /EffectComposer|UnrealBloomPass|BokehPass/);
  assert.doesNotMatch(styles, /backdrop-filter: blur\(.*\) saturate/);
  assert.match(scene, /renderer\.outputColorSpace = THREE\.SRGBColorSpace/);
});
