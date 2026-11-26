export function getFragranceSuggestionKeyboardAction(key, activeIndex, itemCount) {
  if (typeof key !== "string") throw new TypeError("Keyboard key must be a string.");
  if (!Number.isInteger(activeIndex)) throw new TypeError("Active suggestion index must be an integer.");
  if (!Number.isInteger(itemCount) || itemCount < 0) throw new RangeError("Suggestion count must be a non-negative integer.");

  if (key === "Escape") return Object.freeze({ type: "dismiss", activeIndex: -1 });
  if (key === "ArrowDown" || key === "ArrowUp") {
    if (!itemCount) return Object.freeze({ type: "none", activeIndex: -1 });
    const direction = key === "ArrowDown" ? 1 : -1;
    const validIndex = activeIndex >= 0 && activeIndex < itemCount;
    const nextIndex = validIndex
      ? (activeIndex + direction + itemCount) % itemCount
      : direction > 0 ? 0 : itemCount - 1;
    return Object.freeze({ type: "move", activeIndex: nextIndex });
  }
  if (key === "Enter" && activeIndex >= 0 && activeIndex < itemCount) {
    return Object.freeze({ type: "select", activeIndex });
  }
  return Object.freeze({ type: "none", activeIndex });
}
