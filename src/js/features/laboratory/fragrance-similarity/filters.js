const VALID_BANDS = Object.freeze(["very-high", "high", "moderate", "limited", "low"]);
const VALID_CONFIDENCE = Object.freeze(["high", "medium", "low", "very-low"]);
const VALID_CATEGORIES = Object.freeze(["designer", "niche", "arabian"]);
const VALID_AVAILABILITY = Object.freeze(["in-stock", "out-of-stock", "unknown", "not-tracked"]);

function normalizeText(value) {
  return String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("en").replace(/[^a-z0-9]+/g, " ").trim().replace(/\s+/g, " ");
}

function resolveList(value, allowed, label) {
  if (value === undefined || value === null) return null;
  const items = Array.isArray(value) ? value : [value];
  const unique = [...new Set(items)];
  const invalid = unique.filter((item) => !allowed.includes(item));
  if (invalid.length) throw new TypeError("Unsupported " + label + ": " + invalid.join(", "));
  return unique.length ? unique : null;
}

function validateRange(filters) {
  const minimumScore = filters.minimumScore ?? 0;
  const maximumScore = filters.maximumScore ?? 100;
  if (!Number.isFinite(minimumScore) || minimumScore < 0 || minimumScore > 100) {
    throw new RangeError("Minimum score must be between 0 and 100.");
  }
  if (!Number.isFinite(maximumScore) || maximumScore < 0 || maximumScore > 100) {
    throw new RangeError("Maximum score must be between 0 and 100.");
  }
  if (minimumScore > maximumScore) throw new RangeError("Minimum score cannot exceed maximum score.");
  return { minimumScore, maximumScore };
}

function candidateAvailability(candidate) {
  return candidate?.availability?.status ?? "not-tracked";
}

function buildFacets(results) {
  const countBy = (keyFn) => {
    const counts = new Map();
    for (const result of results) {
      const key = keyFn(result);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return Object.freeze(Object.fromEntries([...counts.entries()].sort(([a], [b]) => String(a).localeCompare(String(b), "es"))));
  };
  return Object.freeze({
    categories: countBy((item) => item.category ?? "unknown"),
    bands: countBy((item) => item.similarityBand?.key ?? "unknown"),
    confidence: countBy((item) => item.confidence?.level ?? "unknown"),
    availability: countBy(candidateAvailability)
  });
}

export function filterFragranceSimilarityResults(rankingResult, filters = {}) {
  if (!rankingResult || typeof rankingResult !== "object" || !Array.isArray(rankingResult.results)) {
    throw new TypeError("A fragrance similarity ranking result is required.");
  }
  if (!filters || typeof filters !== "object" || Array.isArray(filters)) {
    throw new TypeError("Fragrance result filters must be an object.");
  }

  const categories = resolveList(filters.categories ?? filters.category, VALID_CATEGORIES, "categories");
  const bands = resolveList(filters.bands ?? filters.band, VALID_BANDS, "similarity bands");
  const confidenceLevels = resolveList(filters.confidenceLevels ?? filters.confidence, VALID_CONFIDENCE, "confidence levels");
  const availabilityStatuses = resolveList(filters.availabilityStatuses ?? filters.availability, VALID_AVAILABILITY, "availability statuses");
  const { minimumScore, maximumScore } = validateRange(filters);
  const houseQuery = normalizeText(filters.houseQuery ?? filters.house ?? "");

  const sourceResults = rankingResult.results;
  const results = sourceResults.filter((candidate) => {
    if (categories && !categories.includes(candidate.category)) return false;
    if (bands && !bands.includes(candidate.similarityBand?.key)) return false;
    if (confidenceLevels && !confidenceLevels.includes(candidate.confidence?.level)) return false;
    if (availabilityStatuses && !availabilityStatuses.includes(candidateAvailability(candidate))) return false;
    if (!Number.isFinite(candidate.score) || candidate.score < minimumScore || candidate.score > maximumScore) return false;
    if (houseQuery && !normalizeText(candidate.house).includes(houseQuery)) return false;
    return true;
  });

  const applied = Object.freeze({
    categories: categories ?? Object.freeze([]),
    bands: bands ?? Object.freeze([]),
    confidenceLevels: confidenceLevels ?? Object.freeze([]),
    availabilityStatuses: availabilityStatuses ?? Object.freeze([]),
    minimumScore,
    maximumScore,
    houseQuery
  });

  return Object.freeze({
    status: results.length ? "ready" : sourceResults.length ? "no-filtered-results" : rankingResult.status,
    reference: rankingResult.reference ?? null,
    scope: rankingResult.scope ?? null,
    sourceResultCount: sourceResults.length,
    totalRankedCandidates: rankingResult.totalRankedCandidates ?? sourceResults.length,
    totalVisibleResults: results.length,
    removedByFilters: sourceResults.length - results.length,
    truncatedByRankingLimit: (rankingResult.totalRankedCandidates ?? sourceResults.length) > sourceResults.length,
    filters: applied,
    facets: buildFacets(sourceResults),
    results: Object.freeze(results)
  });
}
