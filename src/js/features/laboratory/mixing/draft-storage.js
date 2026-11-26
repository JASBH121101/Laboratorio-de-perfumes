import { getPerfumeLibraryItem } from "../../perfume-library/library.js";

const STORAGE_KEY = "jb-vpl-creation-draft-v1";
const DRAFT_VERSION = 1;
const MAX_ITEMS = 60;

function getStorage() {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

function sanitizeItems(items) {
  if (!Array.isArray(items) || items.length > MAX_ITEMS) return null;
  const seen = new Set();
  const sanitized = [];
  for (const item of items) {
    if (!item || typeof item.id !== "string" || seen.has(item.id)) return null;
    if (!getPerfumeLibraryItem(item.id)) return null;
    const points = Number(item.points);
    if (!Number.isInteger(points) || points < 0 || points > 100) return null;
    seen.add(item.id);
    sanitized.push({ id: item.id, points });
  }
  if (sanitized.length && sanitized.reduce((sum, item) => sum + item.points, 0) !== 100) return null;
  return sanitized;
}

export function saveMixDraft(items) {
  const storage = getStorage();
  if (!storage) return false;
  const sanitized = sanitizeItems(items);
  if (!sanitized) return false;
  try {
    if (!sanitized.length) {
      storage.removeItem(STORAGE_KEY);
      return true;
    }
    storage.setItem(STORAGE_KEY, JSON.stringify({
      version: DRAFT_VERSION,
      savedAt: new Date().toISOString(),
      items: sanitized
    }));
    return true;
  } catch {
    return false;
  }
}

export function loadMixDraft() {
  const storage = getStorage();
  if (!storage) return null;
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const payload = JSON.parse(raw);
    if (payload?.version !== DRAFT_VERSION) return null;
    const items = sanitizeItems(payload.items);
    if (!items || !items.length) return null;
    return { items, history: [] };
  } catch {
    return null;
  }
}

export function clearMixDraft() {
  const storage = getStorage();
  if (!storage) return false;
  try {
    storage.removeItem(STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}
