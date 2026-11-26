import { validateFragranceSimilarityProfile } from "./contracts.js";
import { compareFragranceProfiles } from "./comparison.js";
import { explainFragranceSimilarity } from "./explanation.js";
import { scoreFragranceSimilarity } from "./scoring.js";

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

export const FRAGRANCE_SIMILARITY_BANDS = Object.freeze([
  Object.freeze({ key: "very-high", label: "Muy alta", minimum: 90, maximum: 100 }),
  Object.freeze({ key: "high", label: "Alta", minimum: 75, maximum: 89 }),
  Object.freeze({ key: "moderate", label: "Moderada", minimum: 60, maximum: 74 }),
  Object.freeze({ key: "limited", label: "Limitada", minimum: 40, maximum: 59 }),
  Object.freeze({ key: "low", label: "Baja", minimum: 0, maximum: 39 })
]);

function validateProfile(profile, label) {
  const result = validateFragranceSimilarityProfile(profile);
  if (!result.valid) throw new TypeError(label + " fragrance profile is invalid: " + result.issues.join(", "));
}
function similarityBand(score) {
  return FRAGRANCE_SIMILARITY_BANDS.find((band) => score >= band.minimum && score <= band.maximum) ?? FRAGRANCE_SIMILARITY_BANDS.at(-1);
}
function validateOptions(options) {
  if (!options || typeof options !== "object" || Array.isArray(options)) throw new TypeError("Fragrance ranking options must be an object.");
  const limit = options.limit ?? DEFAULT_LIMIT;
  const minimumScore = options.minimumScore ?? 0;
  if (!Number.isInteger(limit) || limit < 1 || limit > MAX_LIMIT) throw new RangeError("Ranking limit must be between 1 and 50.");
  if (!Number.isFinite(minimumScore) || minimumScore < 0 || minimumScore > 100) throw new RangeError("Minimum similarity score must be between 0 and 100.");
  return { limit, minimumScore };
}

export function rankFragranceSimilarityCandidates(referenceProfile, candidateProfiles = [], options = {}) {
  validateProfile(referenceProfile, "Reference");
  if (!Array.isArray(candidateProfiles)) throw new TypeError("Fragrance ranking candidates must be an array of profiles.");
  const { limit, minimumScore } = validateOptions(options);
  const seen = new Set([referenceProfile.id]);
  const ranked = [];
  const insufficientData = [];
  const filteredOut = [];

  for (const candidateProfile of candidateProfiles) {
    validateProfile(candidateProfile, "Candidate");
    if (seen.has(candidateProfile.id)) continue;
    seen.add(candidateProfile.id);

    const comparison = compareFragranceProfiles(referenceProfile, candidateProfile);
    const scoring = scoreFragranceSimilarity(comparison, referenceProfile, candidateProfile, { weights: options.weights });
    const explanation = explainFragranceSimilarity(comparison, scoring);
    const base = {
      id: candidateProfile.id,
      name: candidateProfile.identity.name,
      house: candidateProfile.identity.house,
      category: candidateProfile.identity.category,
      score: scoring.score,
      confidence: scoring.confidence,
      coverage: scoring.coverage,
      scoring,
      comparison,
      explanation
    };

    if (scoring.status !== "ready" || scoring.score === null) {
      insufficientData.push(Object.freeze({ ...base, reason: "insufficient-comparable-evidence" }));
      continue;
    }
    if (scoring.score < minimumScore) {
      filteredOut.push(Object.freeze({ ...base, reason: "below-minimum-score" }));
      continue;
    }
    ranked.push({ ...base, similarityBand: similarityBand(scoring.score) });
  }

  ranked.sort((a, b) =>
    b.score - a.score ||
    b.confidence.index - a.confidence.index ||
    b.coverage.availableWeight - a.coverage.availableWeight ||
    a.name.localeCompare(b.name, "es") ||
    a.id.localeCompare(b.id)
  );
  const results = ranked.slice(0, limit).map((item, index) => Object.freeze({ ...item, rank: index + 1 }));

  return Object.freeze({
    status: results.length ? "ready" : insufficientData.length ? "insufficient-data" : "no-results",
    reference: Object.freeze({ id: referenceProfile.id, name: referenceProfile.identity.name, house: referenceProfile.identity.house }),
    totalCandidates: seen.size - 1,
    totalRankedCandidates: ranked.length,
    totalInsufficientData: insufficientData.length,
    totalFilteredOut: filteredOut.length,
    results: Object.freeze(results),
    insufficientData: Object.freeze(insufficientData),
    filteredOut: Object.freeze(filteredOut),
    rankingPolicy: Object.freeze({
      primary: "global editorial similarity score, descending",
      tieBreakers: Object.freeze(["evidence confidence index, descending", "available data weight, descending", "name, ascending"]),
      scoreIsNotAdjustedByConfidence: true,
      minimumEvidenceRequirement: "at least two weighted comparable dimensions"
    }),
    bands: FRAGRANCE_SIMILARITY_BANDS
  });
}
