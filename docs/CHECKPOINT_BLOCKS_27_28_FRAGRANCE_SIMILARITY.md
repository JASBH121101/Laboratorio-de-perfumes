# CHECKPOINT — JB PERFUME LAB
## FRAGRANCE SIMILARITY ENGINE · BLOCKS 27–28

**STATUS:** COMPLETED / CERTIFIED BY CI / MERGED

**REPOSITORY:** `JASBH121101/Laboratorio-de-perfumes`  
**FUNCTIONAL BRANCH:** `feature/blocks27-28-fragrance-compare-engine`  
**FUNCTIONAL PR:** #67 — https://github.com/JASBH121101/Laboratorio-de-perfumes/pull/67  
**FUNCTIONAL MERGE SHA:** `745747a64998bb6e295038f96ce08dc1201c684f`

### BLOCK 27 — SEMANTIC NORMALIZATION
- Unicode accent, case, punctuation and spacing normalization.
- Curated bilingual note aliases (Bergamot/Bergamota, Blackcurrant/Cassis, Olibanum/Incienso, and others).
- Editorial family taxonomy mapped to broader olfactory tags.
- Multi-facet family groups preserve all mapped tags (Wood & Root → woody + earthy; Amber & Resin → amber + resinous; Smoke & Leather → smoky + leathery; Salt & Mineral → aquatic + mineral).
- Semantic duplicates are consolidated per dimension while the first source label is retained.
- Unknown terms remain stable and distinct; no guessed synonym mappings.
- Similar-but-distinct descriptors remain separate.

### BLOCK 28 — OLFACTORY COMPARISON ENGINE
- Independent comparison for aggregate notes, families, subfamilies, accords, top, heart, base and character.
- Per-dimension overlap index from 0–100 using intersection divided by union.
- Returns matched descriptors and reference-only/candidate-only descriptors.
- Missing fields are marked not-comparable, not treated as zero similarity.
- No single global similarity percentage, confidence or ranking has been introduced yet.

### VALIDATION
- GitHub Actions run #1113 (push): SUCCESS.
- GitHub Actions run #1114 (pull request): SUCCESS.
- **240 tests passed / 0 failed.**
- Browser module syntax checks: PASS.
- Foundation structure validator: PASS.
- No new dependencies, paid services, external APIs, AI providers, cloud sync or Supabase changes.

### MERGE
- PR #67: MERGED.
- Integration SHA: `745747a64998bb6e295038f96ce08dc1201c684f`.

### NEXT PAIR
- **BLOCK 29:** global transparent similarity score and separate confidence, accounting for data coverage and evidence.
- **BLOCK 30:** explain similarities, differences, evidence and source-data limitations.

**GLOBAL STATUS:** Blocks 1–28 completed and merged to `main`.

**SCOPE NOTE:** The current blocks deliver semantic normalization and evidence comparison only. They do not yet provide a global similarity percentage, ranking, fragrance search UI or inventory filter. Android visual acceptance from earlier blocks remains a separate manual check.
