import { PERFUME_ITEMS } from "../../perfume-library/data.js";

function normalizeItems(items = []) {
  return (Array.isArray(items) ? items : [])
    .filter((item) => item && typeof item.id === "string" && Number.isFinite(Number(item.points)))
    .map((item) => ({ id: item.id, points: Math.max(0, Number(item.points)) }))
    .filter((item) => item.points > 0);
}

function signature(items) {
  return normalizeItems(items).sort((a, b) => a.id.localeCompare(b.id))
    .map((item) => `${item.id}:${item.points}`).join("|");
}

function collectHistoricalFormulas(creations = []) {
  const unique = new Map();
  for (const creation of creations) {
    for (const variant of creation.variants || []) {
      const snapshots = [...(variant.versions || []).map((version) => version.items), variant.items];
      for (const items of snapshots) {
        const clean = normalizeItems(items);
        if (!clean.length) continue;
        const key = signature(clean);
        if (!unique.has(key)) unique.set(key, clean);
      }
    }
  }
  return [...unique.values()];
}

function getPairKey(left, right) {
  return [left, right].sort().join("::");
}

function weightedSimilarity(leftItems, rightItems) {
  const left = new Map(leftItems.map((item) => [item.id, item.points]));
  const right = new Map(rightItems.map((item) => [item.id, item.points]));
  const ids = new Set([...left.keys(), ...right.keys()]);
  let intersection = 0;
  let union = 0;
  for (const id of ids) {
    const a = left.get(id) || 0;
    const b = right.get(id) || 0;
    intersection += Math.min(a, b);
    union += Math.max(a, b);
  }
  return union ? intersection / union : 0;
}

function familyProfile(items) {
  const profile = new Map();
  for (const item of items) {
    const note = PERFUME_ITEMS.find((entry) => entry.id === item.id);
    if (!note) continue;
    profile.set(note.family, (profile.get(note.family) || 0) + item.points);
  }
  const total = [...profile.values()].reduce((sum, value) => sum + value, 0);
  return new Map([...profile.entries()].map(([family, points]) => [family, total ? points / total : 0]));
}

function cosineProfileSimilarity(leftItems, rightItems) {
  const left = familyProfile(leftItems);
  const right = familyProfile(rightItems);
  const keys = new Set([...left.keys(), ...right.keys()]);
  let dot = 0;
  let leftNorm = 0;
  let rightNorm = 0;
  for (const key of keys) {
    const a = left.get(key) || 0;
    const b = right.get(key) || 0;
    dot += a * b;
    leftNorm += a * a;
    rightNorm += b * b;
  }
  if (!leftNorm || !rightNorm) return 0;
  return dot / (Math.sqrt(leftNorm) * Math.sqrt(rightNorm));
}

export function analyzeOriginality(state, creations = []) {
  const current = normalizeItems(state?.items);
  if (!current.length) {
    return { status: "empty", score: null, signatureFit: null, referenceCount: 0, observations: ["Añadí referencias para analizar la diferenciación de esta composición."] };
  }

  // Exact matches are excluded so a saved formula is never compared against itself.
  const currentSignature = signature(current);
  const history = collectHistoricalFormulas(creations).filter((items) => signature(items) !== currentSignature);
  const notesById = new Map(PERFUME_ITEMS.map((item) => [item.id, item]));
  const currentFamilies = familyProfile(current);
  const dominantFamily = [...currentFamilies.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || "Sin clasificar";
  if (!history.length) {
    return {
      status: "needs-history",
      score: null,
      signatureFit: null,
      referenceCount: current.length,
      dominantFamily,
      observations: [
        "Todavía no hay otra fórmula guardada con la que comparar esta composición.",
        "Guardá una primera creación y después registrá variantes o nuevas fórmulas para construir tu línea base personal."
      ]
    };
  }

  const noteFrequency = new Map();
  const knownPairs = new Set();
  for (const formula of history) {
    const ids = formula.map((item) => item.id);
    for (const id of ids) noteFrequency.set(id, (noteFrequency.get(id) || 0) + 1);
    for (let i = 0; i < ids.length; i += 1) {
      for (let j = i + 1; j < ids.length; j += 1) knownPairs.add(getPairKey(ids[i], ids[j]));
    }
  }

  const noteRarity = current.reduce((sum, item) => sum + 1 / (1 + (noteFrequency.get(item.id) || 0)), 0) / current.length;
  let pairNovelty = noteRarity;
  let pairCount = 0;
  if (current.length > 1) {
    let familiarPairs = 0;
    for (let i = 0; i < current.length; i += 1) {
      for (let j = i + 1; j < current.length; j += 1) {
        pairCount += 1;
        if (knownPairs.has(getPairKey(current[i].id, current[j].id))) familiarPairs += 1;
      }
    }
    pairNovelty = 1 - familiarPairs / pairCount;
  }

  const nearestSimilarity = Math.max(...history.map((formula) => weightedSimilarity(current, formula)));
  const distance = 1 - nearestSimilarity;
  const score = Math.round((noteRarity * 0.35 + pairNovelty * 0.35 + distance * 0.30) * 100);
  const signatureFit = Math.round(Math.max(...history.map((formula) => cosineProfileSimilarity(current, formula))) * 100);

  const observations = [];
  const unseen = current.filter((item) => !noteFrequency.has(item.id)).map((item) => notesById.get(item.id)?.name).filter(Boolean);
  if (unseen.length) observations.push(`Referencias no utilizadas antes en tu archivo: ${unseen.slice(0, 4).join(", ")}.`);
  if (pairNovelty >= 0.75) observations.push("La mayoría de las parejas de referencias no aparecen juntas en las fórmulas guardadas.");
  else if (pairNovelty <= 0.25) observations.push("La combinación conserva varias asociaciones que ya aparecen en tu historial.");
  if (distance >= 0.55) observations.push("La distribución se distancia de las fórmulas anteriores más cercanas.");
  else if (distance <= 0.2) observations.push("La estructura mantiene una cercanía notable con al menos una fórmula guardada.");
  if (!observations.length) observations.push("La composición combina elementos conocidos y cambios moderados frente a tu historial.");
  const label = score >= 80 ? "Muy diferenciada en tu archivo" : score >= 60 ? "Diferenciación alta" : score >= 40 ? "Diferenciación moderada" : "Cercana a tus fórmulas previas";

  return {
    status: "ready",
    score,
    scoreLabel: label,
    signatureFit,
    referenceCount: current.length,
    historicalFormulaCount: history.length,
    nearestSimilarity: Math.round(nearestSimilarity * 100),
    pairNovelty: Math.round(pairNovelty * 100),
    noteRarity: Math.round(noteRarity * 100),
    dominantFamily,
    observations
  };
}

export function suggestPersonalChallenge(state, creations = []) {
  const selected = new Set(normalizeItems(state?.items).map((item) => item.id));
  const usage = new Map();
  for (const formula of collectHistoricalFormulas(creations)) {
    for (const item of formula) usage.set(item.id, (usage.get(item.id) || 0) + 1);
  }
  const familyUsage = new Map();
  for (const [id, count] of usage) {
    const note = PERFUME_ITEMS.find((item) => item.id === id);
    if (note) familyUsage.set(note.family, (familyUsage.get(note.family) || 0) + count);
  }
  const candidate = PERFUME_ITEMS
    .filter((item) => !selected.has(item.id))
    .sort((a, b) => (familyUsage.get(a.family) || 0) - (familyUsage.get(b.family) || 0) || (usage.get(a.id) || 0) - (usage.get(b.id) || 0) || a.name.localeCompare(b.name))[0];
  if (!candidate) return null;
  return {
    id: candidate.id,
    name: candidate.name,
    family: candidate.family,
    reason: (familyUsage.get(candidate.family) || 0) === 0
      ? `La familia ${candidate.family.toLowerCase()} todavía no aparece en tu historial guardado.`
      : `Es una referencia poco explorada dentro de la familia ${candidate.family.toLowerCase()}.`
  };
}
