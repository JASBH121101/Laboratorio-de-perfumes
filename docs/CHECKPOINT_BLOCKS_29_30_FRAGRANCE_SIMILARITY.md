# CHECKPOINT — JB PERFUME LAB
## FRAGRANCE SIMILARITY ENGINE · BLOCKS 29–30

**STATUS:** COMPLETED / CERTIFIED BY CI / MERGED

**REPOSITORY:** `JASBH121101/Laboratorio-de-perfumes`  
**FUNCTIONAL BRANCH:** `feature/blocks29-30-similarity-score-explanations`  
**FUNCTIONAL PR:** #69 — https://github.com/JASBH121101/Laboratorio-de-perfumes/pull/69  
**FUNCTIONAL MERGE SHA:** `8c95adbd3ca5bb9feb109320ee6744bb79b27f7a`

### BLOCK 29 — GLOBAL SIMILARITY SCORING
Default provisional weights:
- Aggregate notes: 32%.
- Top/heart/base pyramid: 22%.
- Olfactory families: 14%.
- Subfamilies: 6%.
- Accords: 10%.
- Character descriptors: 16%.

Implementation:
- Custom weights supported and normalized.
- Only comparable dimensions with positive configured weight participate.
- Missing dimensions are excluded, not scored as mismatches.
- Available weights are renormalized.
- At least two weighted comparable dimensions are required for a global score.
- Insufficient evidence returns `score: null`, status `insufficient-data`.
- Per-dimension scores, effective weights, contributions, coverage and exclusions are exposed.

**CONFIDENCE IS SEPARATE FROM SIMILARITY:**
- 50% dimension-weight coverage.
- 30% descriptor richness.
- 20% top/heart/base pyramid completeness.
- Levels: high ≥80; medium ≥65; low ≥45; very-low <45.
- Confidence index is an evidence-quality indicator, not a probability.

**MODEL STATUS:** PROVISIONAL. Weights require human sensory validation before claiming calibration.

### BLOCK 30 — SIMILARITY EXPLANATION ENGINE
- Shared notes, families, subfamilies, accords and character descriptors.
- Shared descriptors by top, heart and base.
- Reference-only and candidate-only declared descriptors.
- Explicit list of dimensions excluded because source data is missing.
- Explains that source-only note descriptors do not prove real-world note absence.
- No claims of chemical equivalence, exact copy, authenticity or guaranteed performance.
- Pure structured output; no UI, database, network or provider dependency.

### VALIDATION
- GitHub Actions run #1129 — SUCCESS.
- **251 tests passed / 0 failed.**
- Browser module syntax checks — PASS.
- Foundation structure validator — PASS.
- No new dependencies, APIs, paid services, AI providers, cloud synchronization or Supabase changes.

### MERGE
- PR #69 — MERGED.
- Merge SHA: `8c95adbd3ca5bb9feb109320ee6744bb79b27f7a`.

### COMPLETED BLOCKS
- Blocks 1–28: previously completed and merged.
- Block 29: completed / certified / merged.
- Block 30: completed / certified / merged.

### NEXT PAIR
- **BLOCK 31:** perfume name/house search, typo tolerance, suggestions and ambiguous-result resolution.
- **BLOCK 32:** similarity bands, ranking and ordering by similarity/evidence quality.

**GLOBAL STATUS:** Blocks 1–30 completed and merged to `main`.

**SCOPE NOTE:** Global editorial scoring and explanations now exist as pure engines. The reverse-search UI, typo-tolerant lookup and candidate ranking remain pending. Physical Android acceptance for prior UI work remains a separate manual validation.
