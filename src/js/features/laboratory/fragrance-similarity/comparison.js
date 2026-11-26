import { normalizeFragranceSimilarityProfile } from "./normalization.js";

const scoreSetOverlap = (referenceEntries, candidateEntries) => {
  if (!referenceEntries.length || !candidateEntries.length) {
    return Object.freeze({
      status: "not-comparable",
      overlapIndex: null,
      matched: Object.freeze([]),
      referenceOnly: Object.freeze([]),
      candidateOnly: Object.freeze([]),
      descriptorCount: 0
    });
  }

  const referenceMap = new Map(referenceEntries.map((entry) => [entry.key, entry.label]));
  const candidateMap = new Map(candidateEntries.map((entry) => [entry.key, entry.label]));
  const referenceKeys = new Set(referenceMap.keys());
  const candidateKeys = new Set(candidateMap.keys());
  const intersection = [...referenceKeys].filter((key) => candidateKeys.has(key));
  const unionCount = new Set([...referenceKeys, ...candidateKeys]).size;

  return Object.freeze({
    status: "comparable",
    overlapIndex: unionCount ? Math.round((intersection.length / unionCount) * 100) : null,
    matched: Object.freeze(intersection.map((key) => Object.freeze({
      key,
      referenceLabel: referenceMap.get(key),
      candidateLabel: candidateMap.get(key)
    }))),
    referenceOnly: Object.freeze([...referenceKeys].filter((key) => !candidateKeys.has(key)).map((key) => Object.freeze({
      key,
      label: referenceMap.get(key)
    }))),
    candidateOnly: Object.freeze([...candidateKeys].filter((key) => !referenceKeys.has(key)).map((key) => Object.freeze({
      key,
      label: candidateMap.get(key)
    }))),
    descriptorCount: unionCount
  });
};

function comparePyramid(referenceNotes, candidateNotes) {
  const stages = ["top", "heart", "base"];
  const result = Object.fromEntries(stages.map((stage) => [
    stage,
    scoreSetOverlap(referenceNotes[stage], candidateNotes[stage])
  ]));
  const comparable = stages.filter((stage) => result[stage].status === "comparable");
  return Object.freeze({
    stages: Object.freeze(result),
    comparableStages: Object.freeze(comparable),
    comparableStageCount: comparable.length
  });
}

const componentEntries = (result) => Object.values(result).filter((item) => item.status === "comparable");
const componentDescriptorCount = (result) => componentEntries(result).reduce((sum, item) => sum + item.descriptorCount, 0);

export function compareFragranceProfiles(referenceProfile, candidateProfile) {
  const reference = normalizeFragranceSimilarityProfile(referenceProfile);
  const candidate = normalizeFragranceSimilarityProfile(candidateProfile);

  const components = Object.freeze({
    notes: Object.freeze({
      all: scoreSetOverlap(reference.notes.all, candidate.notes.all)
    }),
    families: scoreSetOverlap(reference.families, candidate.families),
    subfamilies: scoreSetOverlap(reference.subfamilies, candidate.subfamilies),
    accords: scoreSetOverlap(reference.accords, candidate.accords),
    pyramid: comparePyramid(reference.notes, candidate.notes),
    character: scoreSetOverlap(reference.character, candidate.character)
  });

  const comparableDimensions = [
    components.notes.all,
    components.families,
    components.subfamilies,
    components.accords,
    components.character,
    ...Object.values(components.pyramid.stages)
  ].filter((item) => item.status === "comparable");

  const descriptorCount = comparableDimensions.reduce((sum, item) => sum + item.descriptorCount, 0);
  const skippedDimensions = [
    ...(components.notes.all.status !== "comparable" ? ["notes"] : []),
    ...(components.families.status !== "comparable" ? ["families"] : []),
    ...(components.subfamilies.status !== "comparable" ? ["subfamilies"] : []),
    ...(components.accords.status !== "comparable" ? ["accords"] : []),
    ...Object.entries(components.pyramid.stages)
      .filter(([, item]) => item.status !== "comparable")
      .map(([stage]) => `pyramid.${stage}`),
    ...(components.character.status !== "comparable" ? ["character"] : [])
  ];

  const status = comparableDimensions.length > 0 && descriptorCount >= 2
    ? "ready"
    : "insufficient-data";

  return Object.freeze({
    status,
    reference: Object.freeze({
      id: reference.id,
      name: reference.identity.name,
      house: reference.identity.house
    }),
    candidate: Object.freeze({
      id: candidate.id,
      name: candidate.identity.name,
      house: candidate.identity.house
    }),
    components,
    coverage: Object.freeze({
      comparableDimensionCount: comparableDimensions.length,
      comparedDescriptorCount: descriptorCount,
      skippedDimensions: Object.freeze(skippedDimensions),
      referencePyramid: reference.quality.pyramidCoverage,
      candidatePyramid: candidate.quality.pyramidCoverage
    }),
    interpretation: Object.freeze({
      metric: "per-dimension descriptor overlap index",
      range: "0-100",
      globalSimilarityScore: false,
      confidenceCalculated: false,
      note: "These independent overlap indices are evidence for later scoring. They are not a combined similarity percentage or a sensory-equivalence claim."
    })
  });
}
