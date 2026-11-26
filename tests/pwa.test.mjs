import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
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

test("a newly detected waiting worker is announced once", () => {
  assert.equal(shouldAnnounceUpdate({
    waiting: true, controlled: true, silent: true, alreadyAnnounced: false
  }), true);
  assert.equal(shouldAnnounceUpdate({
    waiting: true, controlled: true, silent: true, alreadyAnnounced: true
  }), false);
});

test("a dismissed waiting update stays quiet during automatic checks", () => {
  assert.equal(shouldAnnounceUpdate({
    waiting: true, controlled: true, silent: true, alreadyAnnounced: false, dismissed: true
  }), false);
});

test("an explicit manual check may show a waiting update again", () => {
  assert.equal(shouldAnnounceUpdate({
    waiting: true, controlled: true, silent: false, alreadyAnnounced: true, dismissed: true
  }), true);
});

test("no waiting worker or no service-worker controller does not announce an update", () => {
  assert.equal(shouldAnnounceUpdate({ waiting: false, controlled: true }), false);
  assert.equal(shouldAnnounceUpdate({ waiting: true, controlled: false }), false);
});

test("automatic update checks are not bound to every focus or visibility change", async () => {
  const source = await readFile(new URL("../src/js/core/pwa.js", import.meta.url), "utf8");
  assert.match(source, /dismissUpdateNotice/);
  assert.match(source, /DISMISSED_UPDATE_KEY/);
  assert.doesNotMatch(source, /addEventListener\("visibilitychange"/);
  assert.doesNotMatch(source, /addEventListener\("focus"/);
});
