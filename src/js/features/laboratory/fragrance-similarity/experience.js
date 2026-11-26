import { buildFragranceSimilarityCatalog } from "./model.js";
import { getFragranceSimilarityReferenceById, searchFragranceReferences } from "./search.js";
import { filterFragranceSimilarityResults } from "./filters.js";
import { rankFragranceSimilarityInScope, resolveFragranceSimilarityScope, FRAGRANCE_SIMILARITY_SCOPES } from "./scope.js";
const GLOBAL_PROFILES = buildFragranceSimilarityCatalog().profiles;
const GLOBAL_SCOPE_SELECTION = resolveFragranceSimilarityScope({
  scope: FRAGRANCE_SIMILARITY_SCOPES.GLOBAL_CATALOG,
  globalProfiles: GLOBAL_PROFILES
});
const GLOBAL_RANKING_CACHE = new Map();

function getGlobalRanking(reference) {
  if (GLOBAL_RANKING_CACHE.has(reference.id)) return GLOBAL_RANKING_CACHE.get(reference.id);
  const result = rankFragranceSimilarityInScope(reference, GLOBAL_SCOPE_SELECTION, { limit: 50 });
  if (GLOBAL_RANKING_CACHE.size >= 12) GLOBAL_RANKING_CACHE.delete(GLOBAL_RANKING_CACHE.keys().next().value);
  GLOBAL_RANKING_CACHE.set(reference.id, result);
  return result;
}

export function buildFragranceSimilarityExperience({ query = "", selectedReferenceId = "", scope = FRAGRANCE_SIMILARITY_SCOPES.GLOBAL_CATALOG, filters = {}, inventoryEntries = [] } = {}) {
  if (typeof query !== "string") throw new TypeError("Fragrance experience query must be a string.");
  if (typeof selectedReferenceId !== "string") throw new TypeError("Selected fragrance reference ID must be a string.");
  if (!filters || typeof filters !== "object" || Array.isArray(filters)) throw new TypeError("Fragrance experience filters must be an object.");
  if (!Array.isArray(inventoryEntries)) throw new TypeError("Inventory entries must be an array.");
  const search = query.trim() ? searchFragranceReferences(query, { limit: 8 }) :
    Object.freeze({ status: "empty-query", query: "", totalMatches: 0, results: Object.freeze([]) });
  const reference = selectedReferenceId ? getFragranceSimilarityReferenceById(selectedReferenceId) : null;
  const scopeSelection = scope === FRAGRANCE_SIMILARITY_SCOPES.GLOBAL_CATALOG
    ? GLOBAL_SCOPE_SELECTION
    : resolveFragranceSimilarityScope({
      scope, globalProfiles: GLOBAL_PROFILES, inventoryEntries, inventorySourceLabel: "Adaptador de inventario propio"
    });
  let ranking = null;
  let filtered = null;
  if (reference) {
    ranking = scope === FRAGRANCE_SIMILARITY_SCOPES.GLOBAL_CATALOG
      ? getGlobalRanking(reference)
      : rankFragranceSimilarityInScope(reference, scopeSelection, { limit: 50 });
    filtered = filterFragranceSimilarityResults(ranking, filters);
  }
  return Object.freeze({
    search, reference, scopeSelection, ranking, filtered,
    status: !selectedReferenceId ? "reference-required" : !reference ? "reference-not-found" : filtered?.status ?? "unavailable"
  });
}
