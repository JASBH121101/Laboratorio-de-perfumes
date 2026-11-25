import { PERFUME_ITEMS } from "../perfume-library/data.js";

export const ARCHIVE_SCHEMA_VERSION = 1;
export const MAX_ARCHIVE_CREATIONS = 200;
export const MAX_VARIANTS = 3;
export const MAX_VERSIONS_PER_VARIANT = 50;
export const VARIANT_LABELS = Object.freeze(["A", "B", "C"]);

const NOTE_IDS = new Set(PERFUME_ITEMS.map((item) => item.id));
const nowIso = () => new Date().toISOString();
const makeId = () => globalThis.crypto?.randomUUID?.() ??
  `jb-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 11)}`;
const copyItems = (items) => items.map(({ id, points }) => ({ id, points }));

function cleanText(value, maxLength, label, required = false) {
  const text = String(value ?? "").trim();
  if (required && !text) throw new Error(`${label} es obligatorio.`);
  if (text.length > maxLength) throw new Error(`${label} supera el límite de ${maxLength} caracteres.`);
  return text;
}

export function normalizeArchiveItems(items = []) {
  if (!Array.isArray(items) || items.length > PERFUME_ITEMS.length) {
    throw new Error("La composición contiene una lista de referencias no válida.");
  }
  const seen = new Set();
  const normalized = items.map((entry) => {
    const id = String(entry?.id ?? "");
    const points = Number(entry?.points);
    if (!NOTE_IDS.has(id)) throw new Error(`La referencia «${id}» no existe en la biblioteca actual.`);
    if (seen.has(id)) throw new Error(`La referencia «${id}» está duplicada.`);
    if (!Number.isInteger(points) || points < 0 || points > 100) {
      throw new Error(`El peso creativo de «${id}» no es válido.`);
    }
    seen.add(id);
    return { id, points };
  });
  const total = normalized.reduce((sum, item) => sum + item.points, 0);
  if (normalized.length && total !== 100) {
    throw new Error("La composición debe sumar exactamente 100 puntos creativos.");
  }
  return normalized;
}

function createVersion(items, number, note, now) {
  return {
    number,
    createdAt: now,
    note: cleanText(note || "Guardado manual", 180, "Nota de versión"),
    items: copyItems(items)
  };
}

export function createArchiveCreation({
  name,
  description = "",
  items = [],
  now = nowIso(),
  id = makeId()
} = {}) {
  const cleanName = cleanText(name, 60, "Nombre", true);
  const cleanDescription = cleanText(description, 1200, "Descripción");
  const composition = normalizeArchiveItems(items);
  const creationId = cleanText(id, 100, "Identificador", true);
  const variantId = `${creationId}:A`;
  const variant = {
    id: variantId,
    label: "A",
    name: "Original",
    createdAt: now,
    updatedAt: now,
    items: copyItems(composition),
    versions: [createVersion(composition, 1, "Versión inicial", now)]
  };
  return {
    schemaVersion: ARCHIVE_SCHEMA_VERSION,
    id: creationId,
    name: cleanName,
    description: cleanDescription,
    createdAt: now,
    updatedAt: now,
    activeVariantId: variantId,
    variants: [variant]
  };
}

export function getActiveVariant(creation) {
  return creation?.variants?.find((variant) => variant.id === creation.activeVariantId)
    ?? creation?.variants?.[0]
    ?? null;
}

export function getVariant(creation, variantId) {
  return creation?.variants?.find((variant) => variant.id === variantId) ?? null;
}

export function renameArchiveCreation(creation, name, now = nowIso()) {
  return { ...creation, name: cleanText(name, 60, "Nombre", true), updatedAt: now };
}

export function renameArchiveVariant(creation, variantId, name, now = nowIso()) {
  const cleanName = cleanText(name, 60, "Nombre de variante", true);
  const variants = creation.variants.map((variant) => variant.id === variantId
    ? { ...variant, name: cleanName, updatedAt: now }
    : variant);
  if (variants.every((variant, index) => variant === creation.variants[index])) return creation;
  return { ...creation, variants, updatedAt: now };
}

export function activateArchiveVariant(creation, variantId, now = nowIso()) {
  if (!getVariant(creation, variantId)) throw new Error("La variante seleccionada no existe.");
  return { ...creation, activeVariantId: variantId, updatedAt: now };
}

export function saveArchiveVersion(creation, variantId, items, note = "Guardado manual", now = nowIso()) {
  const composition = normalizeArchiveItems(items);
  const current = getVariant(creation, variantId);
  if (!current) throw new Error("La variante seleccionada no existe.");
  if (JSON.stringify(current.items) === JSON.stringify(composition)) return creation;
  const lastNumber = current.versions.reduce((max, version) => Math.max(max, version.number), 0);
  const version = createVersion(composition, lastNumber + 1, note, now);
  const versions = [...current.versions, version].slice(-MAX_VERSIONS_PER_VARIANT);
  const updated = {
    ...current,
    items: copyItems(composition),
    versions,
    updatedAt: now
  };
  return {
    ...creation,
    variants: creation.variants.map((variant) => variant.id === variantId ? updated : variant),
    updatedAt: now
  };
}

export function createArchiveVariant(creation, {
  items = getActiveVariant(creation)?.items ?? [],
  name = "",
  note = "Nueva variante",
  now = nowIso(),
  id = makeId()
} = {}) {
  if (creation.variants.length >= MAX_VARIANTS) {
    throw new Error("El archivo admite hasta tres variantes por creación: A, B y C.");
  }
  const used = new Set(creation.variants.map((variant) => variant.label));
  const label = VARIANT_LABELS.find((candidate) => !used.has(candidate));
  const composition = normalizeArchiveItems(items);
  const variant = {
    id: cleanText(id, 120, "Identificador de variante", true),
    label,
    name: cleanText(name || `Variante ${label}`, 60, "Nombre de variante", true),
    createdAt: now,
    updatedAt: now,
    items: copyItems(composition),
    versions: [createVersion(composition, 1, note, now)]
  };
  return {
    ...creation,
    variants: [...creation.variants, variant],
    activeVariantId: variant.id,
    updatedAt: now
  };
}

export function restoreArchiveVersion(creation, variantId, versionNumber, now = nowIso()) {
  const variant = getVariant(creation, variantId);
  const target = variant?.versions.find((version) => version.number === Number(versionNumber));
  if (!variant || !target) throw new Error("No se encontró la versión que querés recuperar.");
  return saveArchiveVersion(
    creation,
    variantId,
    target.items,
    `Restaurada desde v${target.number}`,
    now
  );
}

export function compareArchiveVariants(creation, leftVariantId, rightVariantId) {
  const left = getVariant(creation, leftVariantId);
  const right = getVariant(creation, rightVariantId);
  if (!left || !right) throw new Error("Seleccioná dos variantes válidas para comparar.");
  const leftMap = new Map(left.items.map((item) => [item.id, item.points]));
  const rightMap = new Map(right.items.map((item) => [item.id, item.points]));
  const ids = [...new Set([...leftMap.keys(), ...rightMap.keys()])];
  return {
    left: { id: left.id, label: left.label, name: left.name },
    right: { id: right.id, label: right.label, name: right.name },
    rows: ids.map((id) => ({
      id,
      leftPoints: leftMap.get(id) ?? 0,
      rightPoints: rightMap.get(id) ?? 0,
      delta: (rightMap.get(id) ?? 0) - (leftMap.get(id) ?? 0)
    })).sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta) || a.id.localeCompare(b.id)),
    added: ids.filter((id) => !leftMap.has(id)),
    removed: ids.filter((id) => !rightMap.has(id))
  };
}

export function deleteArchiveCreation(creation, creationId) {
  return creation.filter((item) => item.id !== creationId);
}

function validateVersion(version, previousNumber = 0) {
  const number = Number(version?.number);
  if (!Number.isInteger(number) || number <= previousNumber) throw new Error("El historial contiene números de versión inválidos.");
  return {
    number,
    createdAt: new Date(version.createdAt).toISOString(),
    note: cleanText(version.note || "", 180, "Nota de versión"),
    items: normalizeArchiveItems(version.items)
  };
}

export function validateArchiveCreation(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("Una creación del respaldo tiene un formato inválido.");
  const name = cleanText(input.name, 60, "Nombre", true);
  const description = cleanText(input.description, 1200, "Descripción");
  const id = cleanText(input.id, 100, "Identificador", true);
  if (!Array.isArray(input.variants) || input.variants.length < 1 || input.variants.length > MAX_VARIANTS) {
    throw new Error(`La creación «${name}» debe contener entre una y tres variantes.`);
  }
  const labels = new Set();
  const variants = input.variants.map((variant) => {
    const label = String(variant?.label ?? "");
    if (!VARIANT_LABELS.includes(label) || labels.has(label)) throw new Error("El archivo contiene etiquetas de variante duplicadas o inválidas.");
    labels.add(label);
    if (!Array.isArray(variant.versions) || !variant.versions.length || variant.versions.length > MAX_VERSIONS_PER_VARIANT) {
      throw new Error("El historial de una variante está vacío o supera el límite permitido.");
    }
    let previousNumber = 0;
    const versions = variant.versions.map((version) => {
      const clean = validateVersion(version, previousNumber);
      previousNumber = clean.number;
      return clean;
    });
    const currentItems = normalizeArchiveItems(variant.items);
    const latest = versions[versions.length - 1];
    if (JSON.stringify(currentItems) !== JSON.stringify(latest.items)) {
      throw new Error("La composición actual no coincide con la última versión guardada.");
    }
    return {
      id: cleanText(variant.id, 120, "Identificador de variante", true),
      label,
      name: cleanText(variant.name, 60, "Nombre de variante", true),
      createdAt: new Date(variant.createdAt).toISOString(),
      updatedAt: new Date(variant.updatedAt).toISOString(),
      items: currentItems,
      versions
    };
  });
  const activeVariantId = variants.some((variant) => variant.id === input.activeVariantId)
    ? input.activeVariantId
    : variants[0].id;
  return {
    schemaVersion: ARCHIVE_SCHEMA_VERSION,
    id,
    name,
    description,
    createdAt: new Date(input.createdAt).toISOString(),
    updatedAt: new Date(input.updatedAt).toISOString(),
    activeVariantId,
    variants
  };
}

export function buildArchiveBackup(creations, exportedAt = nowIso()) {
  if (!Array.isArray(creations) || creations.length > MAX_ARCHIVE_CREATIONS) {
    throw new Error("El archivo supera el número máximo de creaciones exportables.");
  }
  return {
    app: "JB Virtual Perfume Lab",
    schemaVersion: ARCHIVE_SCHEMA_VERSION,
    exportedAt,
    creationCount: creations.length,
    creations: creations.map(validateArchiveCreation)
  };
}

export function parseArchiveBackup(input) {
  const text = typeof input === "string" ? input : JSON.stringify(input);
  if (text.length > 5_000_000) throw new Error("El respaldo supera el límite de 5 MB.");
  let payload;
  try { payload = JSON.parse(text); }
  catch { throw new Error("El archivo no contiene un respaldo JSON válido."); }
  if (payload?.app !== "JB Virtual Perfume Lab" || payload.schemaVersion !== ARCHIVE_SCHEMA_VERSION) {
    throw new Error("El archivo no corresponde a un respaldo compatible de JB Virtual Perfume Lab.");
  }
  if (!Array.isArray(payload.creations) || payload.creations.length > MAX_ARCHIVE_CREATIONS) {
    throw new Error("El respaldo contiene una cantidad de creaciones no permitida.");
  }
  const ids = new Set();
  const creations = payload.creations.map((creation) => {
    const valid = validateArchiveCreation(creation);
    if (ids.has(valid.id)) throw new Error("El respaldo contiene identificadores de creación duplicados.");
    ids.add(valid.id);
    return valid;
  });
  return creations;
}

export function mergeImportedCreations(existing, imported, now = nowIso()) {
  const existingIds = new Set(existing.map((creation) => creation.id));
  return imported.map((creation) => {
    if (!existingIds.has(creation.id)) {
      existingIds.add(creation.id);
      return creation;
    }
    const id = makeId();
    const variants = creation.variants.map((variant) => ({ ...variant, id: `${id}:${variant.label}` }));
    const renamed = { ...creation, id, variants, activeVariantId: `${id}:${creation.variants.find((item) => item.id === creation.activeVariantId)?.label ?? "A"}`, createdAt: now, updatedAt: now };
    existingIds.add(id);
    return renamed;
  });
}
