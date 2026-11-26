import { buildFragranceSimilarityCatalog } from "./model.js";
import { getFragranceSimilarityReferenceById, searchFragranceReferences } from "./search.js";
import { filterFragranceSimilarityResults } from "./filters.js";
import { rankFragranceSimilarityInScope, resolveFragranceSimilarityScope, FRAGRANCE_SIMILARITY_SCOPES } from "./scope.js";
const GLOBAL_PROFILES = buildFragranceSimilarityCatalog().profiles;

export function buildFragranceSimilarityExperience({ query = "", selectedReferenceId = "", scope = FRAGRANCE_SIMILARITY_SCOPES.GLOBAL_CATALOG, filters = {}, inventoryEntries = [] } = {}) {
  if (typeof query !== "string") throw new TypeError("Fragrance experience query must be a string.");
  if (typeof selectedReferenceId !== "string") throw new TypeError("Selected fragrance reference ID must be a string.");
  if (!filters || typeof filters !== "object" || Array.isArray(filters)) throw new TypeError("Fragrance experience filters must be an object.");
  if (!Array.isArray(inventoryEntries)) throw new TypeError("Inventory entries must be an array.");
  const search = query.trim() ? searchFragranceReferences(query, { limit: 8 }) :
    Object.freeze({ status: "empty-query", query: "", totalMatches: 0, results: Object.freeze([]) });
  const reference = selectedReferenceId ? getFragranceSimilarityReferenceById(selectedReferenceId) : null;
  const scopeSelection = resolveFragranceSimilarityScope({
    scope, globalProfiles: GLOBAL_PROFILES, inventoryEntries, inventorySourceLabel: "Adaptador de inventario propio"
  });
  let ranking = null;
  let filtered = null;
  if (reference) {
    ranking = rankFragranceSimilarityInScope(reference, scopeSelection, { limit: 50 });
    filtered = filterFragranceSimilarityResults(ranking, filters);
  }
  return Object.freeze({
    search, reference, scopeSelection, ranking, filtered,
    status: !selectedReferenceId ? "reference-required" : !reference ? "reference-not-found" : filtered?.status ?? "unavailable"
  });
}
