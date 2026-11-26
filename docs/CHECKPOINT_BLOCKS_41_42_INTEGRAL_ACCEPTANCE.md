# CHECKPOINT — BLOCKS 41–42: INTEGRAL ACCEPTANCE CERTIFICATION

**Project:** JB Perfume Lab — Fragrance Similarity Engine  
**Status:** AUTOMATED ACCEPTANCE COMPLETED / CI VERIFIED / MERGED  
**Main commit:** `18ccf6805c5c4f42d9a413d8b38aaec72c5050ed`

## Block 41 — End-to-end acceptance suite

Added `tests/fragrance-similarity-acceptance.test.mjs` with nine integrated acceptance scenarios using the production experience builder and real local modules:

1. Reverse search with typo tolerance, explicit reference selection, bounded ranking and candidate evidence.
2. Query changes clearing the selected reference until another reference is selected.
3. Unknown reference IDs failing closed without stale ranking output.
4. Filter narrowing and reset preserving stable IDs, scores and confidence evidence.
5. Global catalog → empty own inventory → global catalog without cross-scope leakage.
6. Own-inventory adapter returning only supplied products and preserving SKU/availability/quantity.
7. Keyboard navigation, Enter selection and Escape dismissal.
8. PWA offline-shell coverage for all 13 similarity engine modules, with unique cache paths.
9. Explicit editorial interpretation and limitations on similarity results.

## Block 42 — Certification and readiness

### Automated checks

- **Functional PR #83:** merged by squash.
- **Merge commit:** `18ccf6805c5c4f42d9a413d8b38aaec72c5050ed`.
- **PR CI run #45890774492:** SUCCESS — **308/308 tests passed**, 0 failed; browser module syntax and application/PWA structure validation passed.
- **Post-merge CI run #45890857236:** SUCCESS — **308/308 tests passed**, 0 failed; browser module syntax and foundation validator passed.
- **GitHub Pages deployment #45890856604:** SUCCESS.
- **Final verified main SHA:** `18ccf6805c5c4f42d9a413d8b38aaec72c5050ed`.

### Android physical acceptance — NOT YET EXECUTED

The following checks still require a real Android device. CI must not be treated as a substitute:

- [ ] Open the deployed site in Chrome Android and confirm that the current build loads without runtime errors.
- [ ] Test similarity search, suggestions, reference selection and soft-keyboard interaction.
- [ ] Check filters, reset, result explanations, score/confidence labels and narrow-screen layout.
- [ ] Switch Global catalog ↔ Own inventory and verify the explicit empty state.
- [ ] Install or open the PWA, then verify cached shell behavior after a successful online visit.
- [ ] Publish a newer shell and test update notice, dismissal persistence, manual “Buscar versión” and activation after reload.
- [ ] Check touch targets, scrolling, bottom navigation, text clipping and chart legibility.
- [ ] Confirm the live GitHub Pages URL on the device rather than relying on a cached copy.

### Remaining technical limits

- Own inventory remains an adapter contract. A real source of products/stock and an explicit product-to-fragrance-profile mapping are still required. No stock is inferred from saved formulas, experiments or educational records.
- Similarity scores are editorial estimates from public notes/descriptors. They are not chemical equivalence, probability, verified sensory equivalence, authenticity checks or performance guarantees.
- Successful CI and Pages deployment do not prove physical Android, touch, visual or offline acceptance on a particular device.

## Project status

**Blocks 1–42:** automated functionality and regression work completed and merged.  
**Automated certification:** PASS.  
**GitHub Pages deployment:** PASS.  
**Physical Android acceptance:** PENDING.  
**Live inventory integration:** PENDING real data source and mapping.

The engine may be described as **automated-regression certified**. Do not describe it as physically Android-certified or connected to live commercial inventory until those remaining checks are completed.
