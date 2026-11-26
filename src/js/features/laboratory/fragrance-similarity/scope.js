import { validateFragranceSimilarityProfile } from "./contracts.js";
import { buildFragranceSimilarityCatalog } from "./model.js";
import { rankFragranceSimilarityCandidates } from "./ranking.js";

export const FRAGRANCE_SIMILARITY_SCOPES = Object.freeze({
  GLOBAL_CATALOG: "global-catalog",
  OWN_INVENTORY: "own-inventory"
});
export const FRAGRANCE_INVENTORY_AVAILABILITY = Object.freeze([
  "in-stock",
  "out-of-stock",
  "unknown"
]);

const DEFAULT_GLOBAL_PROFILES = buildFragranceSimilarityCatalog().profiles;
const VALID_SCOPES = Object.freeze(Object.values(FRAGRANCE_SIMILARITY_SCOPES));

function validateProfile(profile, label) {
  const validation = validateFragranceSimilarityProfile(profile);
  if (!validation.valid) throw new TypeError(label + " profile is invalid: " + validation.issues.join(", "));
}

function cleanOptional(value, label) {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "string" || !value.trim()) throw new TypeError(label + " must be a non-empty string when provided.");
  return value.trim();
}

function inventoryMetadata(entry, index, seenProfiles, seenItems) {
  if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
    throw new TypeError("Inventory entry at index " + index + " must be an object.");
  }
  validateProfile(entry.profile, "Inventory entry " + index);
  const profileId = entry.profile.id;
  if (seenProfiles.has(profileId)) throw new TypeError("Inventory contains duplicate fragrance profile ID: " + profileId);
  seenProfiles.add(profileId);

  const inventoryItemId = cleanOptional(entry.inventoryItemId, "inventoryItemId");
  if (!inventoryItemId) throw new TypeError("Every own-inventory entry requires a stable inventoryItemId.");
  if (seenItems.has(inventoryItemId)) throw new TypeError("Inventory contains duplicate inventoryItemId: " + inventoryItemId);
  seenItems.add(inventoryItemId);

  const sku = cleanOptional(entry.sku, "sku");
  const availabilityStatus = entry.availabilityStatus ?? "unknown";
  if (!FRAGRANCE_INVENTORY_AVAILABILITY.includes(availabilityStatus)) {
    throw new TypeError("Unsupported inventory availability status: " + availabilityStatus);
  }
  const quantity = entry.quantity ?? null;
  if (quantity !== null && (typeof quantity !== "number" || !Number.isFinite(quantity) || quantity < 0)) {
    throw new RangeError("Inventory quantity must be a finite non-negative number.");
  }

  return Object.freeze({
    profileId,
    scope: FRAGRANCE_SIMILARITY_SCOPES.OWN_INVENTORY,
    inventoryItemId,
    sku,
    availability: Object.freeze({ status: availabilityStatus, quantity })
  });
}

export function resolveFragranceSimilarityScope({
  scope = FRAGRANCE_SIMILARITY_SCOPES.GLOBAL_CATALOG,
  globalProfiles = DEFAULT_GLOBAL_PROFILES,
  inventoryEntries = [],
  inventorySourceLabel = "Inventario propio"
} = {}) {
  if (!VALID_SCOPES.includes(scope)) throw new TypeError("Unsupported fragrance search scope: " + scope);

  if (scope === FRAGRANCE_SIMILARITY_SCOPES.GLOBAL_CATALOG) {
    if (!Array.isArray(globalProfiles)) throw new TypeError("Global fragrance profiles must be an array.");
    const seen = new Set();
    for (const profile of globalProfiles) {
      validateProfile(profile, "Global catalog");
      if (seen.has(profile.id)) throw new TypeError("Global catalog contains duplicate profile ID: " + profile.id);
      seen.add(profile.id);
    }
    const metadata = globalProfiles.map((profile) => Object.freeze({
      profileId: profile.id,
      scope,
      inventoryItemId: null,
      sku: null,
      availability: Object.freeze({ status: "not-tracked", quantity: null })
    }));
    return Object.freeze({
      status: globalProfiles.length ? "ready" : "catalog-empty",
      scope,
      sourceLabel: "Catálogo global de referencias",
      totalCandidates: globalProfiles.length,
      candidates: Object.freeze([...globalProfiles]),
      candidateMetadata: Object.freeze(metadata),
      inventoryConnected: false,
      message: "El catálogo global reúne referencias olfativas. No confirma existencia comercial ni disponibilidad en inventario."
    });
  }

  if (!Array.isArray(inventoryEntries)) throw new TypeError("Own inventory entries must be an array.");
  if (typeof inventorySourceLabel !== "string" || !inventorySourceLabel.trim()) {
    throw new TypeError("Inventory source label must be a non-empty string.");
  }

  const seenProfiles = new Set();
  const seenItems = new Set();
  const metadata = inventoryEntries.map((entry, index) =>
    inventoryMetadata(entry, index, seenProfiles, seenItems)
  );
  const candidates = inventoryEntries.map((entry) => entry.profile);

  return Object.freeze({
    status: candidates.length ? "ready" : "inventory-empty",
    scope,
    sourceLabel: inventorySourceLabel.trim(),
    totalCandidates: candidates.length,
    candidates: Object.freeze(candidates),
    candidateMetadata: Object.freeze(metadata),
    inventoryConnected: candidates.length > 0,
    message: candidates.length
      ? "Los resultados se limitan a los perfiles entregados por el adaptador de inventario propio. No se agregan referencias del catálogo global."
      : "El inventario propio no proporcionó perfumes para comparar. No se usará el catálogo global como sustituto."
  });
}

function attachSourceMetadata(candidate, metadata) {
  const source = metadata.get(candidate.id);
  if (!source) throw new Error("Missing source metadata for fragrance profile " + candidate.id);
  return Object.freeze({
    ...candidate,
    source: Object.freeze({
      scope: source.scope,
      label: source.scope === FRAGRANCE_SIMILARITY_SCOPES.GLOBAL_CATALOG
        ? "Referencia del catálogo global"
        : "Perfume registrado en inventario propio",
      inventoryItemId: source.inventoryItemId,
      sku: source.sku
    }),
    availability: source.availability
  });
}

export function rankFragranceSimilarityInScope(referenceProfile, scopeSelection, options = {}) {
  if (!scopeSelection || typeof scopeSelection !== "object" || !VALID_SCOPES.includes(scopeSelection.scope)) {
    throw new TypeError("A resolved fragrance search scope is required.");
  }
  if (!Array.isArray(scopeSelection.candidates) || !Array.isArray(scopeSelection.candidateMetadata)) {
    throw new TypeError("Resolved fragrance scope candidates and metadata are required.");
  }
  if (scopeSelection.candidates.length !== scopeSelection.candidateMetadata.length) {
    throw new TypeError("Fragrance scope candidates and source metadata must align.");
  }
  if (scopeSelection.status !== "ready") {
    return Object.freeze({
      status: scopeSelection.status,
      scope: Object.freeze({ key: scopeSelection.scope, label: scopeSelection.sourceLabel }),
      reference: Object.freeze({ id: referenceProfile?.id ?? null, name: referenceProfile?.identity?.name ?? null }),
      totalCandidates: 0,
      totalRankedCandidates: 0,
      totalInsufficientData: 0,
      totalFilteredOut: 0,
      results: Object.freeze([]),
      insufficientData: Object.freeze([]),
      filteredOut: Object.freeze([]),
      message: scopeSelection.message
    });
  }

  const metadata = new Map(scopeSelection.candidateMetadata.map((item) => [item.profileId, item]));
  if (metadata.size !== scopeSelection.candidateMetadata.length) {
    throw new TypeError("Fragrance scope contains duplicate candidate metadata IDs.");
  }
  for (const candidate of scopeSelection.candidates) {
    if (!metadata.has(candidate.id)) throw new TypeError("Fragrance scope metadata is missing for " + candidate.id);
  }

  const ranking = rankFragranceSimilarityCandidates(referenceProfile, scopeSelection.candidates, options);
  const decorate = (items) => Object.freeze(items.map((item) => attachSourceMetadata(item, metadata)));
  return Object.freeze({
    ...ranking,
    scope: Object.freeze({
      key: scopeSelection.scope,
      label: scopeSelection.sourceLabel,
      inventoryConnected: scopeSelection.inventoryConnected
    }),
    results: decorate(ranking.results),
    insufficientData: decorate(ranking.insufficientData),
    filteredOut: decorate(ranking.filteredOut),
    sourceSummary: Object.freeze({
      scope: scopeSelection.scope,
      sourceLabel: scopeSelection.sourceLabel,
      suppliedCandidates: scopeSelection.totalCandidates,
      scoredCandidates: ranking.totalRankedCandidates,
      insufficientDataCandidates: ranking.totalInsufficientData,
      belowMinimumScoreCandidates: ranking.totalFilteredOut
    }),
    scopeMessage: scopeSelection.message
  });
}
