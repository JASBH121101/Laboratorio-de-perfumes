import test from "node:test";
import assert from "node:assert/strict";
import { toFragranceSimilarityProfile } from "../src/js/features/laboratory/fragrance-similarity/model.js";
import {
  FRAGRANCE_SIMILARITY_SCOPES,
  rankFragranceSimilarityInScope,
  resolveFragranceSimilarityScope
} from "../src/js/features/laboratory/fragrance-similarity/scope.js";

const source = {
  name: "Test dataset", attribution: "Test attribution", license: "CC BY 4.0",
  snapshot: "2026-10-29", url: "https://example.com/dataset"
};
function profile(id, overrides = {}) {
  return toFragranceSimilarityProfile({
    id, name: overrides.name ?? id, house: overrides.house ?? "Test House",
    category: overrides.category ?? "designer", family: "Wood & Root",
    notes: ["Bergamot", "Rose", "Musk", "Vanilla"],
    top: ["Bergamot"], heart: ["Rose"], base: ["Musk", "Vanilla"],
    character: ["woody", "warm"]
  }, source);
}
const reference = profile("reference", { name: "Reference" });
const globalProfiles = [profile("global-a", { name: "Global A" }), profile("global-b", { name: "Global B" })];

test("global scope selects only the global catalog and never claims stock availability", () => {
  const selection = resolveFragranceSimilarityScope({
    scope: FRAGRANCE_SIMILARITY_SCOPES.GLOBAL_CATALOG, globalProfiles,
    inventoryEntries: [{ inventoryItemId: "unused", profile: profile("inventory-a") }]
  });
  assert.equal(selection.status, "ready");
  assert.deepEqual(selection.candidates.map((item) => item.id), ["global-a", "global-b"]);
  assert.equal(selection.candidateMetadata[0].availability.status, "not-tracked");
  assert.equal(selection.inventoryConnected, false);
});

test("own-inventory scope accepts explicit inventory adapter entries and retains stock metadata", () => {
  const inventoryProfile = profile("owned", { name: "Own perfume" });
  const selection = resolveFragranceSimilarityScope({
    scope: FRAGRANCE_SIMILARITY_SCOPES.OWN_INVENTORY,
    inventorySourceLabel: "Inventario local",
    inventoryEntries: [{
      inventoryItemId: "stock-001", sku: "JB-001", profile: inventoryProfile,
      availabilityStatus: "in-stock", quantity: 4
    }]
  });
  assert.equal(selection.status, "ready");
  assert.equal(selection.candidates[0].id, "owned");
  assert.equal(selection.candidateMetadata[0].availability.status, "in-stock");
  assert.equal(selection.candidateMetadata[0].availability.quantity, 4);
  assert.equal(selection.candidateMetadata[0].sku, "JB-001");
});

test("own-inventory scope does not silently fall back to global catalog when empty", () => {
  const selection = resolveFragranceSimilarityScope({
    scope: FRAGRANCE_SIMILARITY_SCOPES.OWN_INVENTORY,
    globalProfiles,
    inventoryEntries: []
  });
  assert.equal(selection.status, "inventory-empty");
  assert.equal(selection.candidates.length, 0);
  assert.equal(selection.totalCandidates, 0);
  assert.match(selection.message, /No se usará el catálogo global/);
});

test("scope-aware ranking attaches source and availability while preserving score", () => {
  const selection = resolveFragranceSimilarityScope({
    scope: FRAGRANCE_SIMILARITY_SCOPES.OWN_INVENTORY,
    inventoryEntries: [{
      inventoryItemId: "stock-002", profile: profile("owned-2"),
      availabilityStatus: "out-of-stock", quantity: 0
    }]
  });
  const result = rankFragranceSimilarityInScope(reference, selection);
  assert.equal(result.status, "ready");
  assert.equal(result.scope.key, "own-inventory");
  assert.equal(result.results[0].availability.status, "out-of-stock");
  assert.equal(result.results[0].source.inventoryItemId, "stock-002");
  assert.equal(result.results[0].score, 100);
});

test("catalog scope ranking marks availability as not tracked rather than in stock", () => {
  const selection = resolveFragranceSimilarityScope({
    scope: FRAGRANCE_SIMILARITY_SCOPES.GLOBAL_CATALOG, globalProfiles: [profile("global-3")]
  });
  const result = rankFragranceSimilarityInScope(reference, selection);
  assert.equal(result.results[0].source.scope, "global-catalog");
  assert.equal(result.results[0].availability.status, "not-tracked");
  assert.equal(result.results[0].availability.quantity, null);
});

test("validates inventory identifiers, statuses, quantities and duplicate profiles", () => {
  assert.throws(() => resolveFragranceSimilarityScope({
    scope: "other"
  }), /unsupported fragrance search scope/i);
  assert.throws(() => resolveFragranceSimilarityScope({
    scope: "own-inventory", inventoryEntries: [{ profile: profile("missing-id") }]
  }), /stable inventoryItemId/i);
  assert.throws(() => resolveFragranceSimilarityScope({
    scope: "own-inventory", inventoryEntries: [
      { inventoryItemId: "a", profile: profile("duplicate") },
      { inventoryItemId: "b", profile: profile("duplicate") }
    ]
  }), /duplicate fragrance profile ID/i);
  assert.throws(() => resolveFragranceSimilarityScope({
    scope: "own-inventory", inventoryEntries: [{
      inventoryItemId: "bad-quantity", profile: profile("bad"), quantity: -1
    }]
  }), /non-negative number/i);
  assert.throws(() => resolveFragranceSimilarityScope({
    scope: "own-inventory", inventoryEntries: [{
      inventoryItemId: "bad-status", profile: profile("bad-status"), availabilityStatus: "maybe"
    }]
  }), /unsupported inventory availability/i);
});
