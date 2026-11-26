/**
 * Public contracts for the reverse fragrance-similarity module.
 * This file is intentionally pure: no DOM, storage, network, or application imports.
 */
export const FRAGRANCE_SIMILARITY_SCHEMA_VERSION = 1;

export const FRAGRANCE_SIMILARITY_SCORE = Object.freeze({
  minimum: 0,
  maximum: 100,
  unit: "%",
  interpretation: "editorial similarity estimate",
  disclaimer: "A modeled comparison of public olfactory descriptors, not a chemical or sensory equivalence measurement."
});

export const FRAGRANCE_SIMILARITY_CONFIDENCE_LEVELS = Object.freeze([
  "very-low",
  "low",
  "medium",
  "high"
]);

export const FRAGRANCE_SIMILARITY_PYRAMID_COVERAGE = Object.freeze([
  "complete",
  "partial",
  "unavailable"
]);

export const FRAGRANCE_SIMILARITY_MODULE_CONTRACT = Object.freeze({
  name: "JB Fragrance Similarity",
  schemaVersion: FRAGRANCE_SIMILARITY_SCHEMA_VERSION,
  profile: Object.freeze({
    required: Object.freeze([
      "schemaVersion",
      "id",
      "identity",
      "olfactory",
      "provenance",
      "quality"
    ]),
    identity: Object.freeze(["id", "name", "house", "category"]),
    olfactory: Object.freeze(["family", "subfamilies", "accords", "notes", "character"]),
    notes: Object.freeze(["all", "top", "heart", "base"]),
    provenance: Object.freeze([
      "dataset",
      "attribution",
      "license",
      "snapshot",
      "datasetUrl",
      "recordUrl"
    ]),
    quality: Object.freeze([
      "noteCount",
      "characterCount",
      "pyramidCoverage",
      "hasNotes",
      "hasCharacter"
    ])
  }),
  result: Object.freeze({
    score: Object.freeze({ minimum: 0, maximum: 100, meaning: "editorial similarity estimate" }),
    confidence: FRAGRANCE_SIMILARITY_CONFIDENCE_LEVELS,
    evidence: Object.freeze(["shared notes", "family overlap", "pyramid alignment", "character overlap"]),
    explanation: Object.freeze(["similarities", "differences", "data limitations"])
  }),
  boundaries: Object.freeze([
    "Compare public olfactory descriptors; never infer a proprietary formula.",
    "Keep similarity score separate from confidence and data coverage.",
    "Do not treat creative points as ingredient percentages or manufacturing ratios.",
    "Do not claim chemical identity, exact duplication, or guaranteed sensory equivalence.",
    "Keep the engine independent from UI, persistence, network services, and paid providers."
  ])
});

const isObject = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
const isText = (value) => typeof value === "string" && value.trim().length > 0;
const isNullableText = (value) => value === null || typeof value === "string";
const isTextArray = (value) => Array.isArray(value) && value.every(isText);

export function validateFragranceSimilarityProfile(profile) {
  const issues = [];
  if (!isObject(profile)) {
    return Object.freeze({ valid: false, issues: Object.freeze(["profile.must_be_object"]) });
  }

  if (profile.schemaVersion !== FRAGRANCE_SIMILARITY_SCHEMA_VERSION) issues.push("profile.schema_version");
  if (!isText(profile.id)) issues.push("profile.id");
  if (!isObject(profile.identity)) issues.push("profile.identity");
  else {
    if (!isText(profile.identity.name)) issues.push("profile.identity.name");
    if (!isNullableText(profile.identity.house)) issues.push("profile.identity.house");
    if (!isNullableText(profile.identity.category)) issues.push("profile.identity.category");
  }

  if (!isObject(profile.olfactory)) issues.push("profile.olfactory");
  else {
    if (!isNullableText(profile.olfactory.family)) issues.push("profile.olfactory.family");
    if (!(profile.olfactory.subfamilies === null || isTextArray(profile.olfactory.subfamilies))) {
      issues.push("profile.olfactory.subfamilies");
    }
    if (!(profile.olfactory.accords === null || isTextArray(profile.olfactory.accords))) {
      issues.push("profile.olfactory.accords");
    }

    const notes = profile.olfactory.notes;
    if (!isObject(notes)) issues.push("profile.olfactory.notes");
    else {
      for (const section of FRAGRANCE_SIMILARITY_MODULE_CONTRACT.profile.notes) {
        if (!isTextArray(notes[section])) issues.push(`profile.olfactory.notes.${section}`);
      }
    }
    if (!isTextArray(profile.olfactory.character)) issues.push("profile.olfactory.character");
  }

  if (!isObject(profile.provenance)) issues.push("profile.provenance");
  else {
    for (const field of ["dataset", "attribution", "license", "snapshot", "datasetUrl"]) {
      if (!isText(profile.provenance[field])) issues.push(`profile.provenance.${field}`);
    }
    if (!isNullableText(profile.provenance.recordUrl)) issues.push("profile.provenance.recordUrl");
  }

  if (!isObject(profile.quality)) issues.push("profile.quality");
  else {
    if (!Number.isInteger(profile.quality.noteCount) || profile.quality.noteCount < 0) issues.push("profile.quality.noteCount");
    if (!Number.isInteger(profile.quality.characterCount) || profile.quality.characterCount < 0) issues.push("profile.quality.characterCount");
    if (!FRAGRANCE_SIMILARITY_PYRAMID_COVERAGE.includes(profile.quality.pyramidCoverage)) {
      issues.push("profile.quality.pyramidCoverage");
    }
    if (typeof profile.quality.hasNotes !== "boolean") issues.push("profile.quality.hasNotes");
    if (typeof profile.quality.hasCharacter !== "boolean") issues.push("profile.quality.hasCharacter");
    if (isObject(profile.olfactory) && isObject(profile.olfactory.notes)) {
      const noteCount = Array.isArray(profile.olfactory.notes.all) ? profile.olfactory.notes.all.length : -1;
      const characterCount = Array.isArray(profile.olfactory.character) ? profile.olfactory.character.length : -1;
      if (profile.quality.noteCount !== noteCount) issues.push("profile.quality.note_count_mismatch");
      if (profile.quality.characterCount !== characterCount) issues.push("profile.quality.character_count_mismatch");
      if (profile.quality.hasNotes !== (noteCount > 0)) issues.push("profile.quality.has_notes_mismatch");
      if (profile.quality.hasCharacter !== (characterCount > 0)) issues.push("profile.quality.has_character_mismatch");
    }
  }

  return Object.freeze({ valid: issues.length === 0, issues: Object.freeze(issues) });
}

export function isFragranceSimilarityProfile(profile) {
  return validateFragranceSimilarityProfile(profile).valid;
}
