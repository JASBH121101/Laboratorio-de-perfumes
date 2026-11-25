import test from "node:test";
import assert from "node:assert/strict";
import { isPwaInstalled } from "../src/js/core/pwa.js";

test("standalone and fullscreen display modes count as installed", () => {
  assert.equal(isPwaInstalled("standalone"), true);
  assert.equal(isPwaInstalled("fullscreen"), true);
});

test("browser display mode does not count as installed", () => {
  assert.equal(isPwaInstalled("browser"), false);
  assert.equal(isPwaInstalled(""), false);
});

test("legacy standalone flag is supported", () => {
  assert.equal(isPwaInstalled("browser", true), true);
});
