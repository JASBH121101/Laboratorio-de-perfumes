import test from "node:test";
import assert from "node:assert/strict";
import { getFragranceSuggestionKeyboardAction } from "../src/js/features/laboratory/fragrance-similarity/interaction.js";

test("ArrowDown starts at the first option and advances without losing the active index", () => {
  assert.deepEqual(getFragranceSuggestionKeyboardAction("ArrowDown",-1,3),{type:"move",activeIndex:0});
  assert.deepEqual(getFragranceSuggestionKeyboardAction("ArrowDown",0,3),{type:"move",activeIndex:1});
});

test("ArrowUp starts at the last option and both directions wrap predictably", () => {
  assert.deepEqual(getFragranceSuggestionKeyboardAction("ArrowUp",-1,3),{type:"move",activeIndex:2});
  assert.deepEqual(getFragranceSuggestionKeyboardAction("ArrowUp",0,3),{type:"move",activeIndex:2});
  assert.deepEqual(getFragranceSuggestionKeyboardAction("ArrowDown",2,3),{type:"move",activeIndex:0});
});

test("Enter selects only an active option and Escape dismisses the suggestion list", () => {
  assert.deepEqual(getFragranceSuggestionKeyboardAction("Enter",1,3),{type:"select",activeIndex:1});
  assert.deepEqual(getFragranceSuggestionKeyboardAction("Enter",-1,3),{type:"none",activeIndex:-1});
  assert.deepEqual(getFragranceSuggestionKeyboardAction("Escape",1,3),{type:"dismiss",activeIndex:-1});
});

test("empty suggestions and unrelated keys do not trigger selection", () => {
  assert.deepEqual(getFragranceSuggestionKeyboardAction("ArrowDown",-1,0),{type:"none",activeIndex:-1});
  assert.deepEqual(getFragranceSuggestionKeyboardAction("Tab",0,3),{type:"none",activeIndex:0});
});

test("rejects malformed keyboard state", () => {
  assert.throws(()=>getFragranceSuggestionKeyboardAction(null,-1,2),/key must be a string/i);
  assert.throws(()=>getFragranceSuggestionKeyboardAction("ArrowDown",0,-1),/non-negative integer/i);
  assert.throws(()=>getFragranceSuggestionKeyboardAction("ArrowDown",0.5,2),/active suggestion index/i);
});
