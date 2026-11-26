import { PERFUME_ITEMS } from "../../perfume-library/data.js";
import { analyzeAudienceFit } from "../audience-fit/engine.js";
import { benchmarkFormulaAgainstCatalog } from "../reference-benchmark/engine.js";
import { estimatePerformance } from "../performance-estimator/engine.js";

export const PROFILE_HISTORY_SCHEMA_VERSION = 1;
const NOTE_IDS = new Set(PERFUME_ITEMS.map((item) => item.id));
const CATEGORIES = Object.freeze([
  ["arabian", "Árabe / Ninja"],
  ["niche", "Nicho"],
  ["designer", "Diseñador"]
]);
const makeId = () => globalThis.crypto?.randomUUID?.()
  ?? `profile-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
const nowIso = () => new Date().toISOString();

function cleanText(value, max, label, required = false) {
  const text = String(value ?? "").replace(/[<>]/g, "").replace(/\s+/g, " ").trim();
  if (required && !text) throw new Error(`${label} es obligatorio.`);
  if (text.length > max) throw new Error(`${label} supera ${max} caracteres.`);
  return text;
}

function normalizeItems(items) {
  if (!Array.isArray(items) || items.length < 2 || items.length > PERFUME_ITEMS.length) {
    throw new Error("Cada alternativa debe contener entre dos y todas las referencias disponibles.");
  }
  const seen = new Set();
  const result = items.map((entry) => {
    const id = String(entry?.id ?? "");
    const points = Number(entry?.points);
    if (!NOTE_IDS.has(id) || seen.has(id) || !Number.isInteger(points) || points < 0 || points > 100) {
      throw new Error("La alternativa contiene referencias o puntos inválidos.");
    }
    seen.add(id);
    return { id, points };
  });
  if (result.reduce((sum, item) => sum + item.points, 0) !== 100) {
    throw new Error("Cada alternativa debe conservar 100 puntos creativos.");
  }
  return result;
}

function normalizeProposal(proposal, index) {
  return {
    id: cleanText(proposal?.id || `alternative-${index + 1}`, 80, "Identificador de alternativa", true),
    title: cleanText(proposal?.title, 100, "Título de alternativa", true),
    subtitle: cleanText(proposal?.subtitle || "", 180, "Descripción de alternativa"),
    items: normalizeItems(proposal?.items)
  };
}

export function createCreativeProfile({
  label,
  mode = "client",
  fields = {},
  description,
  proposals,
  now = nowIso(),
  id = makeId()
} = {}) {
  const alternatives = (Array.isArray(proposals) ? proposals : []).map(normalizeProposal);
  if (alternatives.length < 2 || alternatives.length > 3) {
    throw new Error("El historial necesita al menos dos alternativas A/B/C válidas.");
  }
  const cleanFields = {
    occasion: cleanText(fields.occasion || "", 40, "Ocasión"),
    style: cleanText(fields.style || "", 40, "Estilo"),
    presence: cleanText(fields.presence || "", 30, "Presencia"),
    liked: cleanText(fields.liked || "", 280, "Preferencias"),
    avoid: cleanText(fields.avoid || "", 280, "Rasgos a evitar"),
    additional: cleanText(fields.additional || "", 280, "Contexto adicional")
  };
  return {
    schemaVersion: PROFILE_HISTORY_SCHEMA_VERSION,
    id: cleanText(id, 120, "Identificador", true),
    label: cleanText(label, 70, "Nombre del perfil", true),
    mode: ["personal", "client", "inspiration"].includes(mode) ? mode : "client",
    fields: cleanFields,
    description: cleanText(description, 1200, "Brief", true),
    alternatives,
    createdAt: new Date(now).toISOString(),
    updatedAt: new Date(now).toISOString()
  };
}

export function validateCreativeProfile(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new Error("El perfil guardado tiene un formato inválido.");
  }
  if (input.schemaVersion !== PROFILE_HISTORY_SCHEMA_VERSION) {
    throw new Error("La versión del perfil guardado no es compatible.");
  }
  const record = createCreativeProfile({
    id: input.id,
    label: input.label,
    mode: input.mode,
    fields: input.fields,
    description: input.description,
    proposals: input.alternatives,
    now: input.createdAt
  });
  const updatedAt = new Date(input.updatedAt || input.createdAt).toISOString();
  return { ...record, updatedAt };
}

function summarizeAlternative(alternative, options) {
  const items = normalizeItems(alternative.items);
  const audience = analyzeAudienceFit(items);
  const benchmark = benchmarkFormulaAgainstCatalog(items);
  const performance = estimatePerformance(items, options);
  const topMatches = Object.fromEntries(CATEGORIES.map(([key]) => {
    const match = benchmark.matchesByCategory?.[key]?.[0];
    return [key, match ? {
      name: match.name,
      house: match.house,
      score: match.score,
      confidence: match.confidence
    } : null];
  }));
  return {
    id: alternative.id,
    title: alternative.title,
    subtitle: alternative.subtitle,
    items,
    metrics: {
      audience: {
        status: audience.status,
        positioning: audience.positioning,
        agePosition: audience.agePosition,
        confidence: audience.confidence
      },
      benchmark: {
        status: benchmark.status,
        topMatches,
        totalCatalog: benchmark.totalCatalog
      },
      performance: {
        status: performance.status,
        persistence: performance.persistence,
        projection: performance.projection,
        confidence: performance.confidence,
        concentration: options.concentration,
        environment: options.environment
      }
    }
  };
}

export function compareCreativeProfiles(leftInput, rightInput, options = {}) {
  const left = validateCreativeProfile(leftInput);
  const right = validateCreativeProfile(rightInput);
  if (left.id === right.id) throw new Error("Seleccioná dos perfiles diferentes para comparar.");
  const scenario = {
    concentration: ["edt", "edp", "parfum"].includes(options.concentration) ? options.concentration : "edp",
    environment: ["neutral", "warm", "cool", "outdoor", "indoor"].includes(options.environment) ? options.environment : "neutral"
  };
  return {
    left: { id: left.id, label: left.label, createdAt: left.createdAt },
    right: { id: right.id, label: right.label, createdAt: right.createdAt },
    scenario,
    leftAlternatives: left.alternatives.map((item) => summarizeAlternative(item, scenario)),
    rightAlternatives: right.alternatives.map((item) => summarizeAlternative(item, scenario)),
    note: "La comparación es editorial y heurística. El benchmark usa notas públicas y familias; el posicionamiento es orientativo; el rendimiento conserva confianza muy baja. No acredita similitud química, preferencia real ni desempeño físico."
  };
}

export function compareProfileSnapshots(profiles = [], leftId, rightId, options = {}) {
  const left = profiles.find((item) => item.id === leftId);
  const right = profiles.find((item) => item.id === rightId);
  if (!left || !right) throw new Error("Seleccioná dos perfiles del historial.");
  return compareCreativeProfiles(left, right, options);
}
