import { REFERENCE_PERFUMES, REFERENCE_CATALOG_SOURCE } from "../reference-benchmark/data.js";
import {
  FRAGRANCE_SIMILARITY_SCHEMA_VERSION,
  validateFragranceSimilarityProfile
} from "./contracts.js";

const cleanText = (value) => typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
const comparisonKey = (value) => cleanText(value)
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLocaleLowerCase("en")
  .replace(/[^a-z0-9]+/g, " ")
  .trim();

function cleanTextArray(values) {
  if (!Array.isArray(values)) return [];
  const seen = new Set();
  const result = [];
  for (const raw of values) {
    const value = cleanText(raw);
    const key = comparisonKey(value);
    if (!value || !key || seen.has(key)) continue;
    seen.add(key);
    result.push(value);
  }
  return result;
}

function optionalText(value) {
  return cleanText(value) || null;
}

function freezeDeep(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.values(value).forEach(freezeDeep);
  return Object.freeze(value);
}

function pyramidCoverage(top, heart, base) {
  const present = [top, heart, base].filter((section) => section.length > 0).length;
  if (present === 3) return "complete";
  if (present > 0) return "partial";
  return "unavailable";
}

function validateSource(source) {
  const fields = ["name", "attribution", "license", "snapshot", "url"];
  const missing = fields.filter((field) => !cleanText(source?.[field]));
  if (missing.length) {
    throw new TypeError(`Similarity source metadata is incomplete: ${missing.join(", ")}`);
  }
}

export function toFragranceSimilarityProfile(record, source = REFERENCE_CATALOG_SOURCE) {
  if (!record || typeof record !== "object" || Array.isArray(record)) {
    throw new TypeError("A fragrance catalog record must be an object.");
  }

  const id = cleanText(String(record.id ?? ""));
  const name = cleanText(record.name);
  if (!id || !name) throw new TypeError("A fragrance record requires a stable id and name.");

  validateSource(source);

  const top = cleanTextArray(record.top);
  const heart = cleanTextArray(record.heart);
  const base = cleanTextArray(record.base);
  const aggregateNotes = cleanTextArray(record.notes);
  // The aggregate list preserves notes that the source does not assign to a pyramid stage.
  // No missing top/heart/base assignment is inferred.
  const allNotes = cleanTextArray([...top, ...heart, ...base, ...aggregateNotes]);
  const character = cleanTextArray(record.character);
  const subfamilies = Array.isArray(record.subfamilies) ? cleanTextArray(record.subfamilies) : null;
  const accords = Array.isArray(record.accords) ? cleanTextArray(record.accords) : null;

  const profile = {
    schemaVersion: FRAGRANCE_SIMILARITY_SCHEMA_VERSION,
    id,
    identity: {
      name,
      house: optionalText(record.house),
      category: optionalText(record.category)
    },
    olfactory: {
      family: optionalText(record.family),
      subfamilies,
      accords,
      notes: { all: allNotes, top, heart, base },
      character
    },
    provenance: {
      dataset: cleanText(source.name),
      attribution: cleanText(source.attribution),
      license: cleanText(source.license),
      snapshot: cleanText(source.snapshot),
      datasetUrl: cleanText(source.url),
      recordUrl: optionalText(record.url)
    },
    quality: {
      noteCount: allNotes.length,
      characterCount: character.length,
      pyramidCoverage: pyramidCoverage(top, heart, base),
      hasNotes: allNotes.length > 0,
      hasCharacter: character.length > 0
    }
  };

  const validation = validateFragranceSimilarityProfile(profile);
  if (!validation.valid) {
    throw new TypeError(`Invalid fragrance similarity profile: ${validation.issues.join(", ")}`);
  }
  return freezeDeep(profile);
}

export function buildFragranceSimilarityCatalog(
  records = REFERENCE_PERFUMES,
  source = REFERENCE_CATALOG_SOURCE
) {
  if (!Array.isArray(records)) throw new TypeError("The fragrance catalog must be an array.");

  const profiles = [];
  const rejected = [];
  for (const record of records) {
    try {
      profiles.push(toFragranceSimilarityProfile(record, source));
    } catch (error) {
      rejected.push({
        id: cleanText(String(record?.id ?? "")) || null,
        name: cleanText(record?.name) || null,
        reason: error instanceof Error ? error.message : "Unknown profile conversion error"
      });
    }
  }

  return freezeDeep({
    status: rejected.length === 0 ? "ready" : profiles.length ? "partial" : "invalid",
    totalRecords: records.length,
    acceptedRecords: profiles.length,
    rejectedRecords: rejected.length,
    profiles,
    rejected,
    source: {
      dataset: cleanText(source?.name),
      attribution: cleanText(source?.attribution),
      license: cleanText(source?.license),
      snapshot: cleanText(source?.snapshot),
      datasetUrl: cleanText(source?.url)
    }
  });
}
