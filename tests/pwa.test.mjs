import test from "node:test";
import assert from "node:assert/strict";
import { isPwaInstalled, shouldAnnounceUpdate } from "../src/js/core/pwa.js";

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

test("a new waiting worker is announced on first silent detection", () => {
  assert.equal(shouldAnnounceUpdate({
    waiting: true, controlled: true, silent: true, alreadyAnnounced: false
  }), true);
});

test("background checks do not repeatedly announce a dismissed update", () => {
  assert.equal(shouldAnnounceUpdate({
    waiting: true, controlled: true, silent: true, alreadyAnnounced: true
  }), false);
});

test("manual update checks can resurface the notice", () => {
  assert.equal(shouldAnnounceUpdate({
    waiting: true, controlled: true, silent: false, alreadyAnnounced: true
  }), true);
});

test("no waiting worker or no controller does not announce an update", () => {
  assert.equal(shouldAnnounceUpdate({ waiting: false, controlled: true }), false);
  assert.equal(shouldAnnounceUpdate({ waiting: true, controlled: false }), false);
});
