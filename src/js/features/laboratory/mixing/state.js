const MAX_HISTORY = 40;

function clampPoints(value) {
  const parsed = Number.isFinite(Number(value)) ? Math.round(Number(value)) : 0;
  return Math.max(0, Math.min(100, parsed));
}

function distribute(total, weights) {
  if (!weights.length || total <= 0) return weights.map(() => 0);
  const safeWeights = weights.map((weight) => Math.max(0, Number(weight) || 0));
  const weightSum = safeWeights.reduce((sum, value) => sum + value, 0);
  const normalized = weightSum > 0
    ? safeWeights.map((weight) => (weight / weightSum) * total)
    : safeWeights.map(() => total / safeWeights.length);
  const whole = normalized.map(Math.floor);
  let remainder = total - whole.reduce((sum, value) => sum + value, 0);
  const order = normalized
    .map((value, index) => ({ index, fraction: value - whole[index] }))
    .sort((a, b) => b.fraction - a.fraction || a.index - b.index);
  for (let cursor = 0; cursor < remainder; cursor += 1) whole[order[cursor].index] += 1;
  return whole;
}

function snapshot(items) {
  return items.map((item) => ({ id: item.id, points: item.points }));
}

function commit(state, nextItems) {
  return {
    items: snapshot(nextItems),
    history: [...state.history, snapshot(state.items)].slice(-MAX_HISTORY)
  };
}

export function createMixState() {
  return { items: [], history: [] };
}

export function getMixTotal(state) {
  return state.items.reduce((sum, item) => sum + item.points, 0);
}

export function addMixNote(state, noteId) {
  if (typeof noteId !== "string" || !noteId.trim()) return state;
  if (state.items.some((item) => item.id === noteId)) return state;

  const newCount = state.items.length + 1;
  const nextNotePoints = Math.round(100 / newCount);
  const existingPoints = distribute(100 - nextNotePoints, state.items.map((item) => item.points));
  const nextItems = [
    ...state.items.map((item, index) => ({ id: item.id, points: existingPoints[index] })),
    { id: noteId, points: nextNotePoints }
  ];
  return commit(state, nextItems);
}

export function setMixNotePoints(state, noteId, requestedPoints) {
  if (!state.items.some((item) => item.id === noteId)) return state;
  if (state.items.length === 1) return state.items[0].points === 100 ? state : commit(state, [{ id: noteId, points: 100 }]);
  const target = clampPoints(requestedPoints);
  const others = state.items.filter((item) => item.id !== noteId);
  const otherPoints = distribute(100 - target, others.map((item) => item.points));
  let otherIndex = 0;
  const nextItems = state.items.map((item) => {
    if (item.id === noteId) return { id: item.id, points: target };
    return { id: item.id, points: otherPoints[otherIndex++] };
  });
  if (nextItems.every((item, index) => item.points === state.items[index].points)) return state;
  return commit(state, nextItems);
}

export function removeMixNote(state, noteId) {
  if (!state.items.some((item) => item.id === noteId)) return state;
  const remaining = state.items.filter((item) => item.id !== noteId);
  if (!remaining.length) return commit(state, []);
  const points = distribute(100, remaining.map((item) => item.points));
  return commit(state, remaining.map((item, index) => ({ id: item.id, points: points[index] })));
}

export function undoMix(state) {
  if (!state.history.length) return state;
  const history = state.history.slice(0, -1);
  return { items: snapshot(state.history[state.history.length - 1]), history };
}

export function resetMix(state) {
  if (!state.items.length) return state;
  return commit(state, []);
}

export function hasMixNote(state, noteId) {
  return state.items.some((item) => item.id === noteId);
}

export function createMixSnapshot(state) {
  return snapshot(state.items);
}
