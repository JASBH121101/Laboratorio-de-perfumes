import { PERFUME_ITEMS } from "../../perfume-library/data.js";

export const SENSORY_EXPERIMENT_SCHEMA_VERSION = 1;
export const SENSORY_TAGS = Object.freeze([
  "cítrico", "floral", "verde", "frutal", "dulce", "amaderado", "especiado",
  "resinoso", "almizclado", "gourmand", "cuero", "acuático", "empolvado"
]);
export const SENSORY_RATINGS = Object.freeze({
  intensity: "Intensidad percibida",
  freshness: "Frescura",
  sweetness: "Dulzor",
  floral: "Carácter floral",
  woody: "Carácter amaderado",
  spicy: "Carácter especiado",
  persistence: "Persistencia percibida"
});
export const SENSORY_CONTEXTS = Object.freeze({
  blotter: "Papel secante",
  skin: "Piel",
  air: "Ambiente",
  other: "Otro"
});

const LIBRARY_IDS = new Set(PERFUME_ITEMS.map((item) => item.id));
const nowIso = () => new Date().toISOString();
const makeId = () => globalThis.crypto?.randomUUID?.()
  ?? `sensory-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

function cleanText(value, maxLength, label, required = false) {
  const text = String(value ?? "").trim();
  if (required && !text) throw new Error(`${label} es obligatorio.`);
  if (text.length > maxLength) throw new Error(`${label} supera el límite de ${maxLength} caracteres.`);
  return text;
}

function validateSnapshot(items) {
  if (!Array.isArray(items) || !items.length || items.length > PERFUME_ITEMS.length) {
    throw new Error("El experimento necesita una composición guardada válida.");
  }
  const seen = new Set();
  const normalized = items.map((item) => {
    const id = String(item?.id ?? "");
    const points = Number(item?.points);
    if (!LIBRARY_IDS.has(id) || seen.has(id) || !Number.isInteger(points) || points < 0 || points > 100) {
      throw new Error("La instantánea del experimento contiene referencias o puntos inválidos.");
    }
    seen.add(id);
    return { id, points };
  });
  if (normalized.reduce((sum, item) => sum + item.points, 0) !== 100) {
    throw new Error("La instantánea debe conservar 100 puntos creativos.");
  }
  return normalized;
}

function normalizeRatings(input = {}) {
  return Object.fromEntries(Object.keys(SENSORY_RATINGS).map((key) => {
    const raw = input[key];
    if (raw === "" || raw === null || raw === undefined) return [key, null];
    const value = Number(raw);
    if (!Number.isInteger(value) || value < 1 || value > 5) {
      throw new Error(`La valoración «${SENSORY_RATINGS[key]}» debe estar entre 1 y 5.`);
    }
    return [key, value];
  }));
}

function normalizeTags(input = []) {
  if (!Array.isArray(input)) throw new Error("Las facetas observadas no tienen un formato válido.");
  const tags = [...new Set(input.map((tag) => String(tag)))];
  if (tags.some((tag) => !SENSORY_TAGS.includes(tag))) {
    throw new Error("El experimento contiene una faceta sensorial no reconocida.");
  }
  return tags;
}

export function createSensoryExperiment({
  creation,
  variant,
  title,
  observedAt = nowIso(),
  observer = "",
  context = "blotter",
  elapsedMinutes = "",
  impression,
  tags = [],
  ratings = {},
  now = nowIso(),
  id = makeId()
} = {}) {
  if (!creation?.id || !Array.isArray(creation.variants) || !variant?.id
      || !creation.variants.some((item) => item.id === variant.id)) {
    throw new Error("Seleccioná una creación y una variante guardadas.");
  }
  const observedTimestamp = Date.parse(observedAt);
  if (!Number.isFinite(observedTimestamp)) throw new Error("La fecha de observación no es válida.");
  if (!Object.hasOwn(SENSORY_CONTEXTS, context)) throw new Error("El contexto de evaluación no es válido.");
  const elapsed = elapsedMinutes === "" || elapsedMinutes === null || elapsedMinutes === undefined
    ? null : Number(elapsedMinutes);
  if (elapsed !== null && (!Number.isInteger(elapsed) || elapsed < 0 || elapsed > 10080)) {
    throw new Error("El tiempo transcurrido debe estar entre 0 y 10080 minutos.");
  }
  const latestVersion = [...(variant.versions ?? [])].sort((a, b) => b.number - a.number)[0];
  const composition = validateSnapshot(latestVersion?.items ?? variant.items);
  const versionNumber = Number(latestVersion?.number ?? 1);
  return {
    schemaVersion: SENSORY_EXPERIMENT_SCHEMA_VERSION,
    id: cleanText(id, 120, "Identificador", true),
    creationId: cleanText(creation.id, 100, "Identificador de creación", true),
    creationName: cleanText(creation.name, 60, "Nombre de creación", true),
    variantId: cleanText(variant.id, 120, "Identificador de variante", true),
    variantLabel: cleanText(variant.label, 8, "Etiqueta de variante", true),
    variantName: cleanText(variant.name, 60, "Nombre de variante", true),
    versionNumber: Number.isInteger(versionNumber) && versionNumber > 0 ? versionNumber : 1,
    composition,
    title: cleanText(title, 80, "Título del experimento", true),
    observedAt: new Date(observedTimestamp).toISOString(),
    observer: cleanText(observer, 60, "Evaluador"),
    context,
    elapsedMinutes: elapsed,
    impression: cleanText(impression, 1600, "Observación", true),
    tags: normalizeTags(tags),
    ratings: normalizeRatings(ratings),
    createdAt: now,
    updatedAt: now
  };
}

export function validateSensoryExperiment(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new Error("El registro sensorial tiene un formato inválido.");
  }
  if (!Object.hasOwn(SENSORY_CONTEXTS, input.context)) throw new Error("El contexto de evaluación no es válido.");
  const observed = new Date(input.observedAt);
  const created = new Date(input.createdAt || nowIso());
  const updated = new Date(input.updatedAt || input.createdAt || nowIso());
  if (!Number.isFinite(observed.getTime()) || !Number.isFinite(created.getTime()) || !Number.isFinite(updated.getTime())) {
    throw new Error("El registro contiene fechas inválidas.");
  }
  const elapsed = input.elapsedMinutes === null || input.elapsedMinutes === undefined ? null : Number(input.elapsedMinutes);
  if (elapsed !== null && (!Number.isInteger(elapsed) || elapsed < 0 || elapsed > 10080)) {
    throw new Error("El tiempo transcurrido del registro no es válido.");
  }
  return {
    schemaVersion: SENSORY_EXPERIMENT_SCHEMA_VERSION,
    id: cleanText(input.id, 120, "Identificador", true),
    creationId: cleanText(input.creationId, 100, "Identificador de creación", true),
    creationName: cleanText(input.creationName, 60, "Nombre de creación", true),
    variantId: cleanText(input.variantId, 120, "Identificador de variante", true),
    variantLabel: cleanText(input.variantLabel, 8, "Etiqueta de variante", true),
    variantName: cleanText(input.variantName, 60, "Nombre de variante", true),
    versionNumber: Number.isInteger(Number(input.versionNumber)) && Number(input.versionNumber) > 0 ? Number(input.versionNumber) : 1,
    composition: validateSnapshot(input.composition),
    title: cleanText(input.title, 80, "Título del experimento", true),
    observedAt: observed.toISOString(),
    observer: cleanText(input.observer, 60, "Evaluador"),
    context: input.context,
    elapsedMinutes: elapsed,
    impression: cleanText(input.impression, 1600, "Observación", true),
    tags: normalizeTags(input.tags),
    ratings: normalizeRatings(input.ratings),
    createdAt: created.toISOString(),
    updatedAt: updated.toISOString()
  };
}

export function buildSensoryBackup(experiments = [], exportedAt = nowIso()) {
  if (!Array.isArray(experiments) || experiments.length > 5000) {
    throw new Error("El respaldo supera el número permitido de experimentos.");
  }
  const ids = new Set();
  const normalized = experiments.map(validateSensoryExperiment);
  for (const item of normalized) {
    if (ids.has(item.id)) throw new Error("El respaldo contiene identificadores de experimento duplicados.");
    ids.add(item.id);
  }
  return {
    app: "JB Perfume Lab Sensory Experiments",
    schemaVersion: SENSORY_EXPERIMENT_SCHEMA_VERSION,
    exportedAt,
    experimentCount: normalized.length,
    experiments: normalized
  };
}

export function parseSensoryBackup(input) {
  const text = typeof input === "string" ? input : JSON.stringify(input);
  if (text.length > 5_000_000) throw new Error("El respaldo sensorial supera el límite de 5 MB.");
  let payload;
  try { payload = JSON.parse(text); }
  catch { throw new Error("El archivo no contiene un respaldo sensorial JSON válido."); }
  if (payload?.app !== "JB Perfume Lab Sensory Experiments" || payload.schemaVersion !== SENSORY_EXPERIMENT_SCHEMA_VERSION) {
    throw new Error("El archivo no corresponde a un respaldo sensorial compatible.");
  }
  if (!Array.isArray(payload.experiments) || payload.experiments.length > 5000) {
    throw new Error("El respaldo contiene una cantidad de experimentos no permitida.");
  }
  return buildSensoryBackup(payload.experiments, payload.exportedAt).experiments;
}

export function mergeSensoryExperiments(existing = [], imported = []) {
  const ids = new Set(existing.map((item) => item.id));
  return imported.map((entry) => {
    const item = validateSensoryExperiment(entry);
    if (!ids.has(item.id)) {
      ids.add(item.id);
      return item;
    }
    const copy = { ...item, id: makeId(), createdAt: nowIso(), updatedAt: nowIso() };
    ids.add(copy.id);
    return copy;
  });
}
