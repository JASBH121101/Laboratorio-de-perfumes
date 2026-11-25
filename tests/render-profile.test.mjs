import test from "node:test";
import assert from "node:assert/strict";
import { LAB_RENDER_PROFILES, resolveLaboratoryRenderProfile } from "../src/js/features/laboratory/render-profile.js";

test("unknown mobile capabilities safely select Mobile Lite", () => {
  const profile = resolveLaboratoryRenderProfile({ isMobile: true });
  assert.equal(profile.id, "mobile-lite");
  assert.equal(profile.pixelRatioCap, 1);
  assert.equal(profile.shadowsEnabled, false);
  assert.equal(profile.postProcessingEnabled, false);
});

test("constrained Android hardware selects Mobile Lite", () => {
  const profile = resolveLaboratoryRenderProfile({
    isMobile: true,
    deviceMemory: 4,
    hardwareConcurrency: 8,
    maxTextureSize: 4096
  });
  assert.equal(profile.id, "mobile-lite");
});

test("capable Android hardware selects Mobile Standard within the 1.25 pixel-ratio cap", () => {
  const profile = resolveLaboratoryRenderProfile({
    isMobile: true,
    deviceMemory: 8,
    hardwareConcurrency: 8,
    maxTextureSize: 4096
  });
  assert.equal(profile.id, "mobile-standard");
  assert.equal(profile.pixelRatioCap, 1.25);
  assert.equal(profile.antialias, false);
});

test("limited GPU texture capability forces the mobile fallback tier", () => {
  const profile = resolveLaboratoryRenderProfile({
    isMobile: true,
    deviceMemory: 8,
    hardwareConcurrency: 8,
    maxTextureSize: 2048
  });
  assert.equal(profile.id, "mobile-lite");
});

test("desktop with adequate capabilities selects Desktop High", () => {
  const profile = resolveLaboratoryRenderProfile({
    isMobile: false,
    deviceMemory: 16,
    hardwareConcurrency: 12,
    maxTextureSize: 16384
  });
  assert.equal(profile.id, "desktop-high");
  assert.equal(profile.pixelRatioCap, 1.5);
  assert.equal(profile.antialias, true);
});

test("unknown or constrained desktop capabilities do not select the high tier", () => {
  const profile = resolveLaboratoryRenderProfile({
    isMobile: false,
    deviceMemory: null,
    hardwareConcurrency: 4,
    maxTextureSize: 4096
  });
  assert.equal(profile.id, "mobile-standard");
});

test("render profile presets are immutable", () => {
  assert.ok(Object.isFrozen(LAB_RENDER_PROFILES));
  for (const profile of Object.values(LAB_RENDER_PROFILES)) assert.ok(Object.isFrozen(profile));
});
