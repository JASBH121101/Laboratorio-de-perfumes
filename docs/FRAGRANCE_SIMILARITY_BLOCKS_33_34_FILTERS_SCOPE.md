# Blocks 33–34 — Result filtering and search scope

## Block 33 — Result filtering

A pure filter engine applies category, similarity band, evidence-confidence level, minimum/maximum similarity score, house text and explicit availability-status filters to already-ranked results. It does not change similarity scores or ranking order. It exposes before/after counts, removed count, truncation state and facets for category, band, confidence and availability.

Availability is not inferred. Missing availability metadata is classified as `not-tracked`, not as in stock or out of stock.

## Block 34 — Search scope

The scope adapter supports:
- `global-catalog`: supplied global reference profiles. Results are labeled as public-catalog references and their stock state is `not-tracked`.
- `own-inventory`: only profiles explicitly supplied through inventory adapter entries, each requiring a stable `inventoryItemId`. Optional SKU, availability status and quantity are preserved.

An empty own inventory returns `inventory-empty`; there is no silent fallback to the global catalog. The scope-aware ranking attaches source and stock metadata to scored, insufficient-data and below-threshold candidates without modifying their similarity score.

**Current integration boundary:** the inspected application archive stores fragrance-formula creations, sensory experiments and creative profiles, while the perfume library stores educational olfactory notes. It does not currently expose a retail perfume stock/product inventory. Therefore the own-inventory mode is implemented as a validated adapter contract, but it is not connected to an actual stock repository in this application. A later inventory integration must provide entries in the documented adapter shape; formula creations or educational note records must not be misrepresented as stock.

Both modules are local pure JavaScript. They add no network, paid service, new dependency, or Supabase integration.
