import { buildFragranceSimilarityCatalog } from "./model.js";

const CATEGORIES = Object.freeze(["designer", "niche", "arabian"]);
const DEFAULT_PROFILES = buildFragranceSimilarityCatalog().profiles;
const PROFILE_INDEX = new Map(DEFAULT_PROFILES.map((profile) => [profile.id, profile]));
const INDEX = Object.freeze(DEFAULT_PROFILES.map((profile) => Object.freeze({
  profile,
  name: normalize(profile.identity.name),
  house: normalize(profile.identity.house),
  nameTokens: Object.freeze(tokens(profile.identity.name)),
  houseTokens: Object.freeze(tokens(profile.identity.house))
})));

function normalize(value) {
  return String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("en").replace(/&/g, " and ").replace(/[^a-z0-9]+/g, " ")
    .trim().replace(/\s+/g, " ");
}
function tokens(value) { return normalize(value).split(" ").filter(Boolean); }

function editDistance(left, right) {
  if (left === right) return 0;
  const rows = Array.from({ length: left.length + 1 }, () => Array(right.length + 1).fill(0));
  for (let i = 0; i <= left.length; i += 1) rows[i][0] = i;
  for (let j = 0; j <= right.length; j += 1) rows[0][j] = j;
  for (let i = 1; i <= left.length; i += 1) {
    for (let j = 1; j <= right.length; j += 1) {
      const cost = left[i - 1] === right[j - 1] ? 0 : 1;
      rows[i][j] = Math.min(rows[i - 1][j] + 1, rows[i][j - 1] + 1, rows[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && left[i - 1] === right[j - 2] && left[i - 2] === right[j - 1]) {
        rows[i][j] = Math.min(rows[i][j], rows[i - 2][j - 2] + 1);
      }
    }
  }
  return rows[left.length][right.length];
}

function scoreToken(query, candidate) {
  if (query === candidate) return { score: 100, fuzzy: false };
  if (query.length >= 3 && candidate.startsWith(query)) return { score: 91, fuzzy: false };
  if (candidate.length >= 4 && query.startsWith(candidate)) return { score: 84, fuzzy: false };
  const limit = query.length >= 8 ? 2 : query.length >= 3 ? 1 : 0;
  if (!limit) return null;
  const distance = editDistance(query, candidate);
  if (distance > limit) return null;
  return { score: Math.max(68, 88 - distance * 12 - Math.abs(query.length - candidate.length) * 3), fuzzy: true };
}

function scoreTokens(queryTokens, candidateTokens) {
  if (!queryTokens.length || !candidateTokens.length) return null;
  const matches = queryTokens.map((query) => {
    let best = null;
    for (const candidate of candidateTokens) {
      const result = scoreToken(query, candidate);
      if (result && (!best || result.score > best.score)) best = result;
    }
    return best;
  });
  if (matches.some((match) => !match)) return null;
  return {
    score: matches.reduce((sum, match) => sum + match.score, 0) / matches.length,
    fuzzy: matches.some((match) => match.fuzzy)
  };
}

function scoreField(query, field, fieldTokens) {
  if (!field) return null;
  if (field === query) return { score: 100, exact: true, fuzzy: false };
  if (field.startsWith(query)) return { score: 96, exact: false, fuzzy: false };
  if (field.includes(query)) return { score: 92, exact: false, fuzzy: false };
  const result = scoreTokens(tokens(query), fieldTokens);
  return result ? { ...result, exact: false } : null;
}

function resolveMatchedFields(queryTokens, entry, includeHouse) {
  const matched = queryTokens.map((query) => {
    let best = null;
    for (const [field, fieldTokens] of [
      ["name", entry.nameTokens],
      ...(includeHouse ? [["house", entry.houseTokens]] : [])
    ]) {
      for (const candidate of fieldTokens) {
        const result = scoreToken(query, candidate);
        if (result && (!best || result.score > best.score)) best = { field, score: result.score };
      }
    }
    return best;
  });
  if (matched.some((item) => !item)) return [];
  return [...new Set(matched.map((item) => item.field))];
}

function evaluate(query, queryTokens, entry, includeHouse) {
  const nameMatch = scoreField(query, entry.name, entry.nameTokens);
  const houseMatch = includeHouse ? scoreField(query, entry.house, entry.houseTokens) : null;
  const allTokens = includeHouse ? [...entry.nameTokens, ...entry.houseTokens] : entry.nameTokens;
  const combinedMatch = scoreTokens(queryTokens, allTokens);
  let best = null;
  let matchType = "name-tokens";
  let matchedFields = [];

  if (nameMatch?.exact) {
    best = nameMatch; matchType = "exact-name"; matchedFields = ["name"];
  } else if (houseMatch?.exact) {
    best = houseMatch; matchType = "exact-house"; matchedFields = ["house"];
  } else if (nameMatch?.score >= 96) {
    best = nameMatch; matchType = "name-prefix"; matchedFields = ["name"];
  } else if (nameMatch?.score >= 92) {
    best = nameMatch; matchType = "name-contains"; matchedFields = ["name"];
  } else {
    const choices = [nameMatch, houseMatch, combinedMatch].filter(Boolean).sort((a, b) => b.score - a.score);
    best = choices[0] ?? null;
    if (best) {
      matchedFields = resolveMatchedFields(queryTokens, entry, includeHouse);
      const byName = matchedFields.includes("name");
      const byHouse = matchedFields.includes("house");
      matchType = byName && byHouse ? "name-and-house" : byHouse ? "house" : best.fuzzy ? "fuzzy-name" : "name-tokens";
    }
  }
  if (!best) return null;
  return Object.freeze({
    profile: entry.profile,
    id: entry.profile.id,
    name: entry.profile.identity.name,
    house: entry.profile.identity.house,
    category: entry.profile.identity.category,
    searchScore: Math.round(best.score),
    matchType,
    matchedFields: Object.freeze(matchedFields)
  });
}

export function getFragranceSimilarityReferenceById(id) {
  if (typeof id !== "string" || !id.trim()) return null;
  return PROFILE_INDEX.get(id.trim()) ?? null;
}

export function searchFragranceReferences(query, options = {}) {
  if (typeof query !== "string") throw new TypeError("Fragrance search query must be a string.");
  if (!options || typeof options !== "object" || Array.isArray(options)) throw new TypeError("Search options must be an object.");

  const normalized = normalize(query);
  const queryTokens = tokens(normalized);
  const includeHouse = options.includeHouse !== false;
  const category = options.category ?? null;
  const limit = options.limit ?? 12;
  const minimumScore = options.minimumSearchScore ?? 60;
  if (!Number.isInteger(limit) || limit < 1 || limit > 50) throw new RangeError("Search limit must be between 1 and 50.");
  if (category !== null && !CATEGORIES.includes(category)) throw new TypeError("Unsupported fragrance category: " + category);
  if (!Number.isFinite(minimumScore) || minimumScore < 0 || minimumScore > 100) throw new RangeError("Minimum search score must be between 0 and 100.");

  if (!normalized) return Object.freeze({ status: "empty-query", query: "", totalMatches: 0, results: Object.freeze([]) });
  if (normalized.length < 2) return Object.freeze({
    status: "query-too-short", query: normalized, totalMatches: 0, results: Object.freeze([]),
    message: "Escribí al menos dos caracteres para buscar."
  });

  const ranked = INDEX
    .filter((entry) => !category || entry.profile.identity.category === category)
    .map((entry) => evaluate(normalized, queryTokens, entry, includeHouse))
    .filter((item) => item && item.searchScore >= minimumScore)
    .sort((a, b) => b.searchScore - a.searchScore || a.name.localeCompare(b.name, "es") || a.id.localeCompare(b.id));

  if (!ranked.length) return Object.freeze({
    status: "no-results", query: normalized, totalMatches: 0, results: Object.freeze([]),
    message: "No encontramos coincidencias en el catálogo local. Revisá el nombre o probá con la casa."
  });

  const exactNames = ranked.filter((item) => item.matchType === "exact-name" && item.searchScore === 100);
  const closeMatches = ranked.filter((item) => item.searchScore >= ranked[0].searchScore - 4);
  const status = exactNames.length === 1
    ? "exact-match"
    : closeMatches.length > 1 && ranked[0].searchScore >= 78
      ? "needs-selection"
      : "suggestions";

  return Object.freeze({
    status, query: normalized, totalMatches: ranked.length, results: Object.freeze(ranked.slice(0, limit)),
    message: status === "needs-selection"
      ? "Hay varias coincidencias cercanas. Seleccioná el perfume y la casa correctos."
      : status === "exact-match"
        ? "Encontramos una coincidencia exacta por nombre."
        : "Estas son las coincidencias y sugerencias más cercanas del catálogo."
  });
}
