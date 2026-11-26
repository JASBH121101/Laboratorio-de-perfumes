import { PERFUME_ITEMS } from "../../perfume-library/data.js";

const LIBRARY = new Map(PERFUME_ITEMS.map((item) => [item.id, item]));

function normalizeComposition(input, label) {
  if (!input || !Array.isArray(input.items) || input.items.length === 0) {
    throw new Error(`${label} no contiene una composición guardada.`);
  }
  const seen = new Set();
  const items = input.items.map((entry) => {
    const id = String(entry?.id ?? "");
    const reference = LIBRARY.get(id);
    const points = Number(entry?.points);
    if (!reference) throw new Error(`La referencia «${id}» no existe en la biblioteca actual.`);
    if (seen.has(id)) throw new Error(`La referencia «${id}» está duplicada en ${label}.`);
    if (!Number.isInteger(points) || points < 0 || points > 100) {
      throw new Error(`El peso creativo de «${id}» no es válido en ${label}.`);
    }
    seen.add(id);
    return { id, points, reference };
  });
  const total = items.reduce((sum, item) => sum + item.points, 0);
  if (total !== 100) throw new Error(`${label} debe sumar exactamente 100 puntos creativos.`);
  return { name: String(input.name || label), items };
}

function aggregate(items, selector) {
  const values = new Map();
  for (const item of items) {
    const selected = selector(item.reference) ?? [];
    for (const label of (Array.isArray(selected) ? selected : [selected])) {
      if (!label) continue;
      values.set(label, (values.get(label) ?? 0) + item.points);
    }
  }
  return values;
}

function compareBreakdown(leftMap, rightMap, labelKey) {
  const labels = [...new Set([...leftMap.keys(), ...rightMap.keys()])].sort((a, b) => a.localeCompare(b, "es"));
  return labels.map((label) => ({
    [labelKey]: label,
    leftPoints: leftMap.get(label) ?? 0,
    rightPoints: rightMap.get(label) ?? 0,
    delta: (rightMap.get(label) ?? 0) - (leftMap.get(label) ?? 0)
  })).sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta) || a[labelKey].localeCompare(b[labelKey], "es"));
}

export function makeComparisonSelectionKey(creationId, variantId) {
  return JSON.stringify({ creationId: String(creationId), variantId: String(variantId) });
}

function findSavedVariant(creations, key) {
  let selection;
  try { selection = JSON.parse(key); }
  catch { throw new Error("La selección de composición no es válida."); }
  const creation = creations.find((item) => item.id === selection?.creationId);
  const variant = creation?.variants?.find((item) => item.id === selection?.variantId);
  if (!creation || !variant) throw new Error("La composición seleccionada ya no está disponible en el archivo.");
  return {
    name: `${creation.name} · Variante ${variant.label} · ${variant.name}`,
    items: variant.items
  };
}

export function compareCompositions(leftInput, rightInput) {
  const left = normalizeComposition(leftInput, "La composición base");
  const right = normalizeComposition(rightInput, "La composición comparada");
  if (left.name === right.name && JSON.stringify(left.items) === JSON.stringify(right.items)) {
    // Identical content is valid; the comparison should report full similarity.
  }

  const leftMap = new Map(left.items.map((item) => [item.id, item.points]));
  const rightMap = new Map(right.items.map((item) => [item.id, item.points]));
  const ids = [...new Set([...leftMap.keys(), ...rightMap.keys()])];
  const references = ids.map((id) => {
    const reference = LIBRARY.get(id);
    const leftPoints = leftMap.get(id) ?? 0;
    const rightPoints = rightMap.get(id) ?? 0;
    return { id, name: reference.name, family: reference.family, leftPoints, rightPoints, delta: rightPoints - leftPoints };
  }).sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta) || a.name.localeCompare(b.name, "es"));

  const familyRows = compareBreakdown(
    aggregate(left.items, (reference) => reference.family),
    aggregate(right.items, (reference) => reference.family),
    "family"
  );
  const facetRows = compareBreakdown(
    aggregate(left.items, (reference) => reference.facets),
    aggregate(right.items, (reference) => reference.facets),
    "facet"
  );
  const roleRows = compareBreakdown(
    aggregate(left.items, (reference) => reference.roles),
    aggregate(right.items, (reference) => reference.roles),
    "role"
  );

  const overlapPoints = ids.reduce((sum, id) => sum + Math.min(leftMap.get(id) ?? 0, rightMap.get(id) ?? 0), 0);
  const added = ids.filter((id) => !leftMap.has(id));
  const removed = ids.filter((id) => !rightMap.has(id));
  const shared = ids.filter((id) => leftMap.has(id) && rightMap.has(id));
  return {
    left: { name: left.name, referenceCount: left.items.length },
    right: { name: right.name, referenceCount: right.items.length },
    similarity: overlapPoints,
    difference: 100 - overlapPoints,
    sharedCount: shared.length,
    added,
    removed,
    changedCount: references.filter((row) => row.delta !== 0).length,
    references,
    familyRows,
    facetRows,
    roleRows
  };
}

export function compareSavedCompositions(creations, leftKey, rightKey) {
  if (!Array.isArray(creations)) throw new Error("El archivo de creaciones no es válido.");
  if (!leftKey || !rightKey) throw new Error("Seleccioná dos composiciones guardadas.");
  if (leftKey === rightKey) throw new Error("Elegí dos composiciones diferentes para comparar.");
  const left = findSavedVariant(creations, leftKey);
  const right = findSavedVariant(creations, rightKey);
  return compareCompositions(left, right);
}
