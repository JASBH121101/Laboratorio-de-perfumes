import { validateFragranceSimilarityProfile } from "./contracts.js";

export const FRAGRANCE_SIMILARITY_DEFAULT_WEIGHTS = Object.freeze({
  notes: 0.32,
  pyramid: 0.22,
  families: 0.14,
  subfamilies: 0.06,
  accords: 0.10,
  character: 0.16
});

export const FRAGRANCE_SIMILARITY_SCORE_MODEL = Object.freeze({
  version: "1.0",
  status: "provisional",
  metric: "weighted editorial descriptor overlap",
  missingData: "excluded and reported; never treated as a zero match",
  confidence: "separate evidence-quality index; not a probability"
});

const DIMENSIONS = Object.freeze(Object.keys(FRAGRANCE_SIMILARITY_DEFAULT_WEIGHTS));
const PYRAMID_STAGES = Object.freeze(["top", "heart", "base"]);
const PYRAMID_STAGE_WEIGHTS = Object.freeze({ top: 1 / 3, heart: 1 / 3, base: 1 / 3 });

const clamp = (value, minimum = 0, maximum = 100) => Math.min(maximum, Math.max(minimum, value));
const round = (value) => Math.round(value);
const isObject = (value) => value !== null && typeof value === "object" && !Array.isArray(value);

function validateProfile(profile, label) {
  const result = validateFragranceSimilarityProfile(profile);
  if (!result.valid) {
    throw new TypeError(`${label} profile is invalid: ${result.issues.join(", ")}`);
  }
}

function resolveWeights(customWeights = {}) {
  if (!isObject(customWeights)) throw new TypeError("Similarity weights must be an object.");

  const unknown = Object.keys(customWeights).filter((key) => !DIMENSIONS.includes(key));
  if (unknown.length) throw new TypeError(`Unknown similarity weight dimensions: ${unknown.join(", ")}`);

  const merged = { ...FRAGRANCE_SIMILARITY_DEFAULT_WEIGHTS };
  for (const [key, value] of Object.entries(customWeights)) {
    if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
      throw new TypeError(`Similarity weight "${key}" must be a finite, non-negative number.`);
    }
    merged[key] = value;
  }

  const total = Object.values(merged).reduce((sum, value) => sum + value, 0);
  if (total <= 0) throw new RangeError("At least one similarity weight must be greater than zero.");

  return Object.freeze(Object.fromEntries(
    Object.entries(merged).map(([key, value]) => [key, value / total])
  ));
}

function comparableOverlap(result) {
  if (result?.status !== "comparable") return null;
  const score = result.overlapIndex;
  return Number.isFinite(score) && score >= 0 && score <= 100 ? score : null;
}

function pyramidMetric(comparison) {
  const stages = comparison?.components?.pyramid?.stages ?? {};
  const included = PYRAMID_STAGES
    .map((stage) => ({ stage, score: comparableOverlap(stages[stage]), weight: PYRAMID_STAGE_WEIGHTS[stage] }))
    .filter((item) => item.score !== null);

  if (!included.length) return Object.freeze({ score: null, coverage: 0, stages: Object.freeze([]) });

  const weightTotal = included.reduce((sum, item) => sum + item.weight, 0);
  const weightedScore = included.reduce((sum, item) => sum + item.score * item.weight, 0);

  return Object.freeze({
    score: weightedScore / weightTotal,
    coverage: weightTotal,
    stages: Object.freeze(included.map((item) => item.stage))
  });
}

function profileRichness(profile) {
  const noteScore = clamp(profile.quality.noteCount / 8, 0, 1);
  const characterScore = clamp(profile.quality.characterCount / 4, 0, 1);
  const familyScore = profile.olfactory.family ? 1 : 0;
  return noteScore * 0.70 + characterScore * 0.20 + familyScore * 0.10;
}

function pyramidQuality(profile) {
  return ({
    complete: 1,
    partial: 0.5,
    unavailable: 0
  })[profile.quality.pyramidCoverage] ?? 0;
}

function confidenceBand(index) {
  if (index >= 80) return "high";
  if (index >= 65) return "medium";
  if (index >= 45) return "low";
  return "very-low";
}

function confidenceLabel(level) {
  return ({
    high: "Alta",
    medium: "Media",
    low: "Baja",
    "very-low": "Muy baja"
  })[level];
}

function buildConfidence({ referenceProfile, candidateProfile, availableWeight, skippedDimensions }) {
  const dimensionCoverage = clamp(availableWeight * 100);
  const dataRichness = clamp(
    ((profileRichness(referenceProfile) + profileRichness(candidateProfile)) / 2) * 100
  );
  const pyramidCoverage = clamp(
    ((pyramidQuality(referenceProfile) + pyramidQuality(candidateProfile)) / 2) * 100
  );

  const index = round(
    dimensionCoverage * 0.50 +
    dataRichness * 0.30 +
    pyramidCoverage * 0.20
  );
  const level = confidenceBand(index);
  const reasons = [];

  if (dimensionCoverage < 100) reasons.push("Hay dimensiones sin datos comparables en una o ambas fichas.");
  if (referenceProfile.quality.pyramidCoverage !== "complete" ||
      candidateProfile.quality.pyramidCoverage !== "complete") {
    reasons.push("La pirámide de notas está incompleta en al menos una ficha.");
  }
  if (referenceProfile.quality.noteCount < 4 || candidateProfile.quality.noteCount < 4) {
    reasons.push("Una o ambas fichas contienen pocas notas declaradas.");
  }
  if (!referenceProfile.quality.hasCharacter || !candidateProfile.quality.hasCharacter) {
    reasons.push("Faltan descriptores de carácter en una o ambas fichas.");
  }
  if (skippedDimensions.length) {
    reasons.push(`Dimensiones omitidas: ${skippedDimensions.join(", ")}.`);
  }
  if (!reasons.length) reasons.push("Las dimensiones principales tienen una cobertura amplia en las fichas disponibles.");

  return Object.freeze({
    index,
    level,
    label: confidenceLabel(level),
    meaning: "Indicador de calidad y cobertura de la evidencia; no es una probabilidad estadística.",
    components: Object.freeze({
      dimensionCoverage: round(dimensionCoverage),
      dataRichness: round(dataRichness),
      pyramidCoverage: round(pyramidCoverage)
    }),
    formula: Object.freeze({
      dimensionCoverage: 0.50,
      dataRichness: 0.30,
      pyramidCoverage: 0.20
    }),
    reasons: Object.freeze(reasons)
  });
}

export function scoreFragranceSimilarity(comparison, referenceProfile, candidateProfile, options = {}) {
  validateProfile(referenceProfile, "Reference");
  validateProfile(candidateProfile, "Candidate");
  if (!isObject(comparison) || !isObject(comparison.components)) {
    throw new TypeError("A fragrance comparison result is required.");
  }
  if (!isObject(options)) throw new TypeError("Similarity scoring options must be an object.");

  if (comparison.reference?.id !== referenceProfile.id || comparison.candidate?.id !== candidateProfile.id) {
    throw new TypeError("Comparison profile identities do not match the scoring inputs.");
  }

  const weights = resolveWeights(options.weights);
  const metrics = {
    notes: { score: comparableOverlap(comparison.components.notes?.all), coverage: 1 },
    pyramid: pyramidMetric(comparison),
    families: { score: comparableOverlap(comparison.components.families), coverage: 1 },
    subfamilies: { score: comparableOverlap(comparison.components.subfamilies), coverage: 1 },
    accords: { score: comparableOverlap(comparison.components.accords), coverage: 1 },
    character: { score: comparableOverlap(comparison.components.character), coverage: 1 }
  };

  const includedDimensions = DIMENSIONS.filter((dimension) =>
    metrics[dimension].score !== null && metrics[dimension].coverage > 0 && weights[dimension] > 0
  );
  const excludedDimensions = DIMENSIONS.filter((dimension) => !includedDimensions.includes(dimension));
  const availableWeight = includedDimensions.reduce(
    (sum, dimension) => sum + weights[dimension] * metrics[dimension].coverage,
    0
  );
  const weightedTotal = includedDimensions.reduce(
    (sum, dimension) => sum + metrics[dimension].score * weights[dimension] * metrics[dimension].coverage,
    0
  );
  const confidence = buildConfidence({
    referenceProfile,
    candidateProfile,
    availableWeight,
    skippedDimensions: comparison.coverage?.skippedDimensions ?? []
  });

  const hasEnoughEvidence = comparison.status === "ready" &&
    includedDimensions.length >= 2 &&
    availableWeight > 0;

  const components = Object.freeze(Object.fromEntries(DIMENSIONS.map((dimension) => {
    const metric = metrics[dimension];
    const configuredWeight = weights[dimension];
    const effectiveWeight = configuredWeight * (metric.score === null ? 0 : metric.coverage);
    return [dimension, Object.freeze({
      score: metric.score === null ? null : round(metric.score),
      configuredWeight: round(configuredWeight * 1000) / 1000,
      effectiveWeight: round(effectiveWeight * 1000) / 1000,
      coverage: round(metric.coverage * 100),
      included: metric.score !== null && metric.coverage > 0 && configuredWeight > 0
    })];
  })));

  if (!hasEnoughEvidence) {
    return Object.freeze({
      status: "insufficient-data",
      score: null,
      scoreLabel: "Similitud editorial estimada",
      confidence,
      components,
      weights,
      coverage: Object.freeze({
        configuredWeight: 100,
        availableWeight: round(availableWeight * 100),
        includedDimensions: Object.freeze(includedDimensions),
        excludedDimensions: Object.freeze(excludedDimensions),
        comparableDimensionCount: includedDimensions.length
      }),
      model: FRAGRANCE_SIMILARITY_SCORE_MODEL,
      limitations: Object.freeze([
        "No hay evidencia suficiente en al menos dos dimensiones comparables.",
        "El resultado no demuestra equivalencia química ni identidad sensorial."
      ])
    });
  }

  const score = round(clamp(weightedTotal / availableWeight));
  const contributionTotal = availableWeight;

  const contributionDetails = Object.freeze(Object.fromEntries(DIMENSIONS.map((dimension) => {
    const metric = metrics[dimension];
    const effectiveWeight = weights[dimension] * (metric.score === null ? 0 : metric.coverage);
    const contribution = metric.score === null || !contributionTotal
      ? 0
      : (metric.score * effectiveWeight / contributionTotal);
    return [dimension, round(contribution * 10) / 10];
  })));

  return Object.freeze({
    status: "ready",
    score,
    scoreLabel: "Similitud editorial estimada",
    confidence,
    components,
    weights,
    contributionDetails,
    coverage: Object.freeze({
      configuredWeight: 100,
      availableWeight: round(availableWeight * 100),
      includedDimensions: Object.freeze(includedDimensions),
      excludedDimensions: Object.freeze(excludedDimensions),
      comparableDimensionCount: includedDimensions.length
    }),
    model: FRAGRANCE_SIMILARITY_SCORE_MODEL,
    limitations: Object.freeze([
      "El porcentaje es una estimación editorial basada en descriptores públicos, no una medición química ni una probabilidad de que dos perfumes huelan igual.",
      "Las dimensiones sin datos se excluyen y reducen la cobertura y la confianza; no se interpretan como desacuerdos.",
      "Las ponderaciones son provisionales y requieren validación sensorial humana antes de considerarse calibradas."
    ])
  });
}
