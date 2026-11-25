import test from "node:test";
import assert from "node:assert/strict";
import { resolveView, viewHash, VIEWS } from "../src/js/core/navigation.js";

test("navigation exposes the four foundation views", () => {
  assert.deepEqual(VIEWS, ["home", "lab", "notes", "projects"]);
});

test("resolveView accepts known hashes", () => {
  for (const view of VIEWS) assert.equal(resolveView(`#${view}`), view);
});

test("resolveView safely falls back for unknown or empty hashes", () => {
  assert.equal(resolveView(""), "home");
  assert.equal(resolveView("#unknown"), "home");
  assert.equal(resolveView("#/not-a-view"), "home");
});

test("viewHash only builds supported destinations", () => {
  assert.equal(viewHash("lab"), "#lab");
  assert.equal(viewHash("bad-route"), "#home");
});
