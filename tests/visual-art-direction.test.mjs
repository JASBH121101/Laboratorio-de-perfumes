import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const specification = await readFile(new URL("../docs/PHASE2_VISUAL_ART_DIRECTION.md", import.meta.url), "utf8");

test("Phase 2 visual specification defines all twelve implementation blocks", () => {
  for (let block = 1; block <= 12; block += 1) {
    assert.match(specification, new RegExp(`\\| ${block}\\. `), `Missing Phase 2 block ${block}`);
  }
});

test("art direction preserves Android-first rendering and interaction constraints", () => {
  for (const phrase of [
    "Three.js is currently imported only when the Laboratory route is opened",
    "touch orbit",
    "pinch zoom",
    "No unconditional render loop while the user is idle",
    "Mobile Lite",
    "Mobile Standard",
    "Desktop High"
  ]) assert.ok(specification.includes(phrase), `Missing required direction: ${phrase}`);
});

test("asset policy excludes paid services and proprietary GTA VI content", () => {
  assert.match(specification, /No paid asset packs, subscriptions, hosted rendering services or paid APIs/);
  assert.match(specification, /Do not include GTA VI screenshots, ripped models, textures, audio, logos or proprietary game assets/);
});

test("Block 1 records design complete and reserves implementation for later blocks", () => {
  assert.match(specification, /1\. Visual Benchmark & Art Direction[\s\S]*?\*\*Completed — this document\*\*/);
  assert.match(specification, /Room, materials, lighting and props rebuilt — deferred to Blocks 3–8/);
  assert.ok(specification.includes("| 2. Rendering Pipeline Upgrade |") && specification.includes("**Completed — adaptive profiles integrated**"));
  assert.match(specification, /Android performance certified — reserved for Block 12/);
});
