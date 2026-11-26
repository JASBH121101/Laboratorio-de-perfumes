# CHECKPOINT — JB PERFUME LAB
## FRAGRANCE SIMILARITY ENGINE · BLOCKS 33–34

**STATUS:** COMPLETED / CERTIFIED / MERGED

**REPOSITORY:** `JASBH121101/Laboratorio-de-perfumes`  
**FUNCTIONAL BRANCH:** `feature/blocks33-34-result-filters-search-scope`  
**FUNCTIONAL PR:** #73 — https://github.com/JASBH121101/Laboratorio-de-perfumes/pull/73  
**FUNCTIONAL MERGE SHA:** `32e3f8f2681d70be5200afd84d3da3dca63fe801`

### BLOCK 33 — RESULT FILTERS
- Pure filter module: `src/js/features/laboratory/fragrance-similarity/filters.js`.
- Filters by designer/niche/arabian category.
- Similarity bands: very-high, high, moderate, limited, low.
- Evidence-confidence levels: high, medium, low, very-low.
- Minimum and maximum similarity score.
- House text search.
- Explicit availability filtering.
- Exposes facets and before/after/removed/truncated result counts.
- Does not mutate scores or reorder candidates.
- Missing stock state is `not-tracked`, never assumed to be in stock.

### BLOCK 34 — SEARCH SCOPE
- Pure scope module: `src/js/features/laboratory/fragrance-similarity/scope.js`.
- `global-catalog`: compares only supplied global reference profiles; availability is `not-tracked`.
- `own-inventory`: compares only explicitly supplied inventory adapter profiles.
- Requires stable `inventoryItemId`; optional SKU, quantity and availability are preserved.
- Availability states: `in-stock`, `out-of-stock`, `unknown`.
- Scope-aware ranking attaches source and availability metadata to scored, insufficient-data and below-threshold results.
- Similarity scores remain unchanged by source or stock metadata.
- Empty inventory returns `inventory-empty`; there is no silent fallback to global catalog.

### IMPORTANT INVENTORY BOUNDARY
The current JB Perfume Lab archive stores formula creations, sensory experiments and creative profiles. The educational perfume library stores olfactory notes. There is no retail product-stock repository exposed by this application today.

Therefore, the own-inventory mode is **implemented and tested as an adapter contract, but is not yet connected to a real commercial stock source**. An actual stock integration must supply product profiles and stock metadata in the documented shape. Formula creations and educational note records must not be represented as sellable inventory.

### PWA / OFFLINE
- Service worker cache: `shell-v50`.
- Added filters and scope engines to the offline app shell.
- Removed six duplicate app-shell paths.
- No new dependencies, APIs, paid providers, external synchronization or Supabase changes.

### VALIDATION
- GitHub Actions run #1174 — PUSH — SUCCESS.
- GitHub Actions run #1175 — PULL REQUEST — SUCCESS.
- **279 tests passed / 0 failed.**
- Browser module syntax checks — PASS.
- Foundation structure validator — PASS.

### MERGE
- PR #73 — MERGED.
- Merge SHA: `32e3f8f2681d70be5200afd84d3da3dca63fe801`.

### COMPLETED BLOCKS
- Blocks 1–32: previously completed and merged.
- Block 33: completed / certified / merged.
- Block 34: completed / certified / merged.

### NEXT PAIR
- **BLOCK 35:** reverse-search UI: query input, unambiguous reference selection, global/inventory switch, filters and alternative cards.
- **BLOCK 36:** complete integration, responsive/accessibility and end-to-end QA, empty/error states and final flow certification.

**GLOBAL STATUS:** Blocks 1–34 completed and merged to `main`.

**SCOPE NOTE:** Search engines, filters and scope selection are available as pure engines. The actual search UI and the connector to a real retail-stock system remain pending.
