# CHECKPOINT — JB PERFUME LAB
## FRAGRANCE SIMILARITY ENGINE · BLOCKS 35–36

**STATUS:** COMPLETED / CI CERTIFIED / MERGED

**REPOSITORY:** `JASBH121101/Laboratorio-de-perfumes`
**FUNCTIONAL BRANCH:** `feature/blocks35-36-reverse-search-ui-integration`
**FUNCTIONAL PR:** #75 — https://github.com/JASBH121101/Laboratorio-de-perfumes/pull/75
**FUNCTIONAL MERGE SHA:** `79517fd99bf182f73fe04fa7cb1ddc47016ee4c0`
**MAIN SHA AT CHECKPOINT CREATION:** `79517fd99bf182f73fe04fa7cb1ddc47016ee4c0`

## BLOCK 35 — REVERSE-SEARCH UI

- Added the reverse-search experience controller at `src/js/features/laboratory/fragrance-similarity/experience.js`.
- Added the UI renderer at `src/js/features/laboratory/fragrance-similarity/panel.js`.
- Search supports perfume name and house query over the local reference catalog, with selectable suggestions and stable profile IDs.
- The user must explicitly select a perfume reference before candidate alternatives are calculated.
- Results show ranked perfume alternatives, an editorial similarity score, separate evidence confidence, and explanatory matched/different olfactory descriptors.
- Filters include commercial category, similarity band, confidence, minimum similarity score and house name.
- Global ranking results are cached per selected reference (bounded cache) so filter changes do not repeat the full ranking operation.

## BLOCK 36 — APP INTEGRATION AND QUALITY

- Integrated the panel into the Laboratory view and section navigation.
- Added delegated application handlers for query changes, reference selection, scope changes, filters and reset actions.
- Added responsive mobile/tablet/desktop layout, accessible labels, visible keyboard focus, listbox suggestion semantics and live result regions.
- Added explicit empty states for missing reference, missing matches and empty inventory.
- Added controller, renderer and foundation integration tests.
- Updated GitHub Actions browser module syntax checks.
- Advanced the PWA shell to `shell-v51`; cached both new modules in `sw.js`.
- Verified **70 APP_SHELL paths with no duplicate entries**.

## SEARCH SCOPE AND INVENTORY BOUNDARY

- `global-catalog` uses the existing local fragrance reference catalog. The badge `Stock: no verificado` is deliberate: catalog presence does not establish commercial availability.
- `own-inventory` uses the existing adapter contract only. The current application still has no connected commercial product-stock repository.
- The UI explicitly reports that own inventory is not connected and never silently substitutes the global catalog.
- Formula creations, sensory experiments and educational olfactory notes are not presented as sellable inventory.
- The similarity percentage remains an editorial estimate from public olfactory descriptors, not a probability, chemical equivalence or guarantee of sensory identity. Confidence is a separate evidence-quality indicator.

## VALIDATION

- **GitHub Actions push run #45873457345:** SUCCESS.
- **GitHub Actions pull request run #45873482428:** SUCCESS.
- **Result:** **288/288 tests passed, 0 failed**.
- Browser module syntax checks: PASS.
- Foundation structure / integration validator: PASS.
- No new dependencies, external APIs, paid services, cloud providers or Supabase changes.

## MERGE

- **PR #75:** MERGED by squash.
- **Functional merge SHA:** `79517fd99bf182f73fe04fa7cb1ddc47016ee4c0`.

## COMPLETED BLOCKS

- Blocks 1–34: previously completed and merged.
- Block 35: completed / integrated / tested.
- Block 36: completed / integrated / certified / merged.

**GLOBAL STATUS:** Blocks 1–36 completed and merged to `main`.

## REMAINING BOUNDARY / NEXT WORK

The reverse-search user interface and the global reference catalog flow are integrated. Actual own-inventory search still needs a real commercial product/stock source. The next integration must consume an existing repository and map its product, profile and availability fields to the documented `inventoryEntries` adapter contract. Do not treat archive formulas, sensory experiments or educational notes as stock.

No Android device-level visual acceptance has been performed as part of this CI run; responsive CSS and automated markup checks do not replace physical-device inspection.
