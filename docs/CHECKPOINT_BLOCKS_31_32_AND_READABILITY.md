# CHECKPOINT — JB PERFUME LAB
## FRAGRANCE SIMILARITY ENGINE · BLOCKS 31–32 + TYPOGRAPHY AUDIT

**STATUS:** COMPLETED / CERTIFIED / MERGED

**REPOSITORY:** `JASBH121101/Laboratorio-de-perfumes`  
**FUNCTIONAL BRANCH:** `feature/blocks31-32-reference-search-ranking-readability`  
**FUNCTIONAL PR:** #71 — https://github.com/JASBH121101/Laboratorio-de-perfumes/pull/71  
**FUNCTIONAL MERGE SHA:** `d4c2fd5df8a468571ebd1de215898737973314b4`

### BLOCK 31 — REFERENCE SEARCH
- Search across the existing local reference catalog (1,479 perfume profiles).
- Accent/case/punctuation normalization.
- Exact, prefix, token and bounded typo-tolerant matching, including adjacent transposition.
- Search by perfume name, house, or combined name + house.
- Distinguishes exact match, suggestions, ambiguous results, empty query, short query and no results.
- Category filtering, result limit and house-search toggle.
- Exact stable profile ID resolution.
- Search relevance remains separate from olfactory similarity.

### BLOCK 32 — CANDIDATE RANKING
- Compares candidate profiles through Blocks 28–30.
- Sorts by global editorial similarity score.
- Bands: very high 90–100; high 75–89; moderate 60–74; limited 40–59; low 0–39.
- Confidence and evidence coverage are tie-breakers only; neither alters the similarity score.
- Candidates with insufficient evidence are kept separate and do not receive fabricated percentages.
- Minimum score and result-count controls.

### TYPOGRAPHY / READABILITY REVIEW
Files reviewed:
- `src/css/styles.css`
- `src/css/design-system.css`
- `src/css/perfume-library.css`
- `src/css/laboratory.css`
- `src/css/analytics.css`

Implemented:
- Raised every explicit `font-size` and font shorthand pixel value below 14px to **14px**.
- Automated final audit across the five CSS files: **0 pixel typography declarations below 14px**.
- Kept body base at **16px**, line-height **1.55**.
- Mobile text inputs, selects and textareas use **16px**, avoiding browser auto-zoom when focused.
- Readability regression test enforces 14px minimum and 16px mobile controls.
- Removed duplicated mobile typography rule.
- PWA cache advanced from `shell-v48` to **`shell-v49`**.
- Added search and ranking modules to the offline app shell.

**MANUAL ANDROID CHECK STILL PENDING:** review real device rendering for truncation, line breaks, card heights, table overflow, mobile navigation, controls and chart labels. Automated CSS size checks do not prove visual layout at every device width.

### VALIDATION
- GitHub Actions run #1160 — PUSH — SUCCESS.
- GitHub Actions run #1161 — PULL REQUEST — SUCCESS.
- **268 tests passed / 0 failed.**
- Browser module syntax checks — PASS.
- Foundation structure validator — PASS.

### MERGE
- PR #71 — MERGED.
- Merge SHA: `d4c2fd5df8a468571ebd1de215898737973314b4`.

### COMPLETED BLOCKS
- Blocks 1–30: previously completed and merged.
- Block 31: completed / certified / merged.
- Block 32: completed / certified / merged.

### NEXT PAIR
- **BLOCK 33:** candidate filters and result presentation modes.
- **BLOCK 34:** global reference-catalog mode versus own-inventory-only mode, with source and availability distinctions.

**GLOBAL STATUS:** Blocks 1–32 completed and merged to `main`.

**SCOPE NOTE:** Reference search and candidate ranking engines are complete. The user-facing search/results UI remains pending. Physical Android visual acceptance of the font changes remains pending.
