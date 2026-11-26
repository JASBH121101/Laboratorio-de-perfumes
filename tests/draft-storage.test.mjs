import test from "node:test";
import assert from "node:assert/strict";
import { addMixNote, createMixState } from "../src/js/features/laboratory/mixing/state.js";
import { loadMixDraft, saveMixDraft } from "../src/js/features/laboratory/mixing/draft-storage.js";

function withStorage(run) {
  const store = new Map();
  const mock = {
    getItem(key) { return store.has(key) ? store.get(key) : null; },
    setItem(key, value) { store.set(key, String(value)); },
    removeItem(key) { store.delete(key); }
  };
  const prior = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: mock });
  try { return run(mock); }
  finally {
    if (prior) Object.defineProperty(globalThis, "localStorage", prior);
    else delete globalThis.localStorage;
  }
}

test("draft autosave stores a validated creative composition and restores without undo history", () => {
  withStorage((storage) => {
    let state = addMixNote(createMixState(), "bergamot");
    state = addMixNote(state, "rose");
    assert.equal(saveMixDraft(state.items), true);
    const raw = JSON.parse(storage.getItem("jb-vpl-creation-draft-v1"));
    assert.equal(raw.version, 1);
    assert.ok(Number.isFinite(Date.parse(raw.savedAt)));
    const restored = loadMixDraft();
    assert.deepEqual(restored.items, state.items);
    assert.deepEqual(restored.history, []);
  });
});

test("clearing the composition removes the local draft", () => {
  withStorage((storage) => {
    assert.equal(saveMixDraft([{ id: "bergamot", points: 100 }]), true);
    assert.equal(saveMixDraft([]), true);
    assert.equal(storage.getItem("jb-vpl-creation-draft-v1"), null);
    assert.equal(loadMixDraft(), null);
  });
});

test("invalid draft JSON, unknown notes, duplicates and non-100 totals are rejected", () => {
  withStorage((storage) => {
    storage.setItem("jb-vpl-creation-draft-v1", "{broken");
    assert.equal(loadMixDraft(), null);
    storage.setItem("jb-vpl-creation-draft-v1", JSON.stringify({ version: 1, items: [{ id: "unknown", points: 100 }] }));
    assert.equal(loadMixDraft(), null);
    storage.setItem("jb-vpl-creation-draft-v1", JSON.stringify({ version: 1, items: [{ id: "bergamot", points: 80 }] }));
    assert.equal(loadMixDraft(), null);
    assert.equal(saveMixDraft([{ id: "bergamot", points: 60 }, { id: "bergamot", points: 40 }]), false);
  });
});

test("draft storage is wired to app startup, composition changes and PWA shell", async () => {
  const { readFile } = await import("node:fs/promises");
  const app = await readFile(new URL("../src/js/app.js", import.meta.url), "utf8");
  const panel = await readFile(new URL("../src/js/features/laboratory/mixing/panel.js", import.meta.url), "utf8");
  const sw = await readFile(new URL("../sw.js", import.meta.url), "utf8");
  assert.match(app, /loadMixDraft\(\) \?\? createMixState\(\)/);
  assert.match(app, /saveMixDraft\(mixingState\.items\)/);
  assert.match(panel, /Borrador automático local/);
  assert.match(sw, /mixing\/draft-storage\.js/);
  assert.match(sw, /shell-v38/);
});
