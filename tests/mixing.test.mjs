import test from "node:test";
import assert from "node:assert/strict";
import {
  addMixNote, createMixState, getMixTotal, hasMixNote, removeMixNote,
  resetMix, setMixNotePoints, undoMix
} from "../src/js/features/laboratory/mixing/state.js";
import { renderMixStudio } from "../src/js/features/laboratory/mixing/panel.js";

test("a first note receives all 100 creative points", () => {
  const state = addMixNote(createMixState(), "bergamot");
  assert.deepEqual(state.items, [{ id: "bergamot", points: 100 }]);
  assert.equal(getMixTotal(state), 100);
});

test("adding references evenly redistributes creative points to 100", () => {
  let state = createMixState();
  for (const id of ["bergamot", "rose", "sandalwood", "vanilla"]) state = addMixNote(state, id);
  assert.deepEqual(state.items.map((item) => item.points), [25, 25, 25, 25]);
  assert.equal(getMixTotal(state), 100);
});

test("duplicate notes are ignored without adding history", () => {
  let state = addMixNote(createMixState(), "bergamot");
  const before = state;
  state = addMixNote(state, "bergamot");
  assert.equal(state, before);
  assert.equal(state.items.length, 1);
});

test("changing one creative weight preserves a total of 100 points", () => {
  let state = createMixState();
  for (const id of ["bergamot", "rose", "sandalwood"]) state = addMixNote(state, id);
  state = setMixNotePoints(state, "bergamot", 60);
  assert.equal(state.items.find((item) => item.id === "bergamot").points, 60);
  assert.equal(getMixTotal(state), 100);
});

test("removing a note redistributes remaining points", () => {
  let state = createMixState();
  for (const id of ["bergamot", "rose", "sandalwood"]) state = addMixNote(state, id);
  state = removeMixNote(state, "rose");
  assert.equal(state.items.length, 2);
  assert.equal(getMixTotal(state), 100);
});

test("removing the last note returns an empty recipient", () => {
  let state = addMixNote(createMixState(), "bergamot");
  state = removeMixNote(state, "bergamot");
  assert.deepEqual(state.items, []);
  assert.equal(getMixTotal(state), 0);
});

test("undo restores the immediately previous composition", () => {
  let state = addMixNote(createMixState(), "bergamot");
  const before = state;
  state = addMixNote(state, "rose");
  state = undoMix(state);
  assert.deepEqual(state.items, before.items);
});

test("reset can be undone", () => {
  let state = addMixNote(createMixState(), "bergamot");
  state = addMixNote(state, "rose");
  state = resetMix(state);
  assert.equal(state.items.length, 0);
  state = undoMix(state);
  assert.equal(state.items.length, 2);
  assert.equal(getMixTotal(state), 100);
});

test("unknown note operations do not mutate the composition", () => {
  const state = addMixNote(createMixState(), "bergamot");
  assert.equal(removeMixNote(state, "unknown"), state);
  assert.equal(setMixNotePoints(state, "unknown", 20), state);
  assert.equal(hasMixNote(state, "bergamot"), true);
});

test("mix studio renderer labels point weights as conceptual", () => {
  const state = addMixNote(createMixState(), "bergamot");
  const html = renderMixStudio(state);
  assert.match(html, /100 pts/);
  assert.match(html, /ponderaciones creativas/);
  assert.match(html, /No son porcentajes/);
});

test("mix total remains 100 after a sequence of operations", () => {
  let state = createMixState();
  for (const id of ["bergamot", "rose", "vanilla", "vetiver", "marine"]) {
    state = addMixNote(state, id);
    assert.equal(getMixTotal(state), 100);
  }
  for (const [id, points] of [["bergamot", 12], ["vanilla", 40], ["marine", 0], ["vetiver", 23]]) {
    state = setMixNotePoints(state, id, points);
    assert.equal(getMixTotal(state), 100);
  }
});
