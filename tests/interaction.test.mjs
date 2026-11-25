import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const scene = await readFile(new URL("../src/js/features/laboratory/scene.js", import.meta.url), "utf8");

test("hover raycasting adds a lightweight pointer and ring response only when no pointer is dragging", () => {
  assert.match(scene, /function updateHoverAt\(clientX, clientY\)/);
  assert.match(scene, /event\.pointerType === "mouse" \|\| event\.pointerType === "pen"/);
  assert.match(scene, /canvas\.style\.cursor = hoveredId \? "pointer" : "grab"/);
  assert.match(scene, /ring\.material\.opacity = isSelected \? 0\.9 : 0\.38/);
  assert.match(scene, /const isHovered = id === hoveredId && !isSelected/);
});

test("selection pulse scales only the previous and current selected objects and returns to base scale", () => {
  assert.match(scene, /propBaseScales\.set\(prop\.id, prop\.scale\)/);
  assert.match(scene, /function animateSelectedProp\(previousId, nextId\)/);
  assert.match(scene, /baseScale \* \(id === nextId \? 1\.028 : 1\)/);
  assert.match(scene, /THREE\.MathUtils\.lerp\(change\.from, change\.to, eased\)/);
  assert.match(scene, /const duration = 170/);
});

test("selection feedback respects reduced motion and cancels interrupted animations", () => {
  assert.match(scene, /prefers-reduced-motion: reduce/);
  assert.match(scene, /if \(reduceMotion\) \{\s*for \(const change of changes\) change\.root\.scale\.setScalar\(change\.to\)/);
  assert.match(scene, /function stopObjectFocusAnimation\(\)/);
  assert.match(scene, /cancelAnimationFrame\(objectFocusFrame\)/);
});

test("hover state clears on pointer leave and interaction handlers are removed on dispose", () => {
  assert.match(scene, /function onPointerLeave\(\)/);
  assert.match(scene, /canvas\.addEventListener\("pointerleave", onPointerLeave\)/);
  assert.match(scene, /canvas\.removeEventListener\("pointerleave", onPointerLeave\)/);
  assert.match(scene, /stopObjectFocusAnimation\(\);\s*if \(resizeObserver\)/);
});

test("selection still dispatches the selected prop id to the inspector and clears safely", () => {
  assert.match(scene, /detail: \{ id: selectedId \}/);
  assert.match(scene, /animateSelectedProp\(previousId, selectedId\)/);
  assert.match(scene, /function clearSelection\(\)/);
  assert.match(scene, /animateSelectedProp\(previousId, null\)/);
});
