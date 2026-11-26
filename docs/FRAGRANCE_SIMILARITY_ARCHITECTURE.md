# JB Fragrance Similarity — Architecture and contract

**Project:** JB Perfume Lab  
**Track:** Reverse fragrance lookup  
**Status:** Blocks 25–26 foundation  
**Runtime target:** Browser ES modules, Android-first, offline-capable

## Purpose

Add a reverse lookup workflow: a user selects or searches a reference perfume and the lab ranks other catalog perfumes by similarity of their available public olfactory descriptors. This is separate from the current commercial benchmark, which asks which catalog perfumes resemble an active creative composition.

## Existing data reused

The first version reuses the local `REFERENCE_PERFUMES` catalog (1,479 records) and its existing Scento attribution and CC BY 4.0 notice. Each record may contain identity, house, category, family, character descriptors, an aggregate note list, and optional top/heart/base note arrays.

The model preserves source data and gaps. It does not assume that an empty top/heart/base array means the note is absent from the perfume. It does not generate missing notes, subfamilies, or accords. The public note pyramid is descriptive metadata, not a proprietary formula.

## Module boundary

The new module lives under `src/js/features/laboratory/fragrance-similarity/` and is designed as pure JavaScript:

- It accepts catalog records or normalized profiles as arguments.
- It returns deterministic data structures.
- It has no DOM access, UI templates, local storage, IndexedDB, network requests, API keys, or paid-provider dependencies.
- It does not mutate the existing reference catalog or the formulation archive.
- The current `reference-benchmark` module remains independent and keeps its composition-to-catalog direction.

The module can later be consumed by a dedicated panel without making the matching engine depend on that panel.

## Profile contract

A normalized profile contains:

- `schemaVersion` and stable record `id`.
- `identity`: perfume name, house, and source category.
- `olfactory`: declared family; optional subfamilies and accords; aggregate notes; top, heart, and base arrays; and source character descriptors.
- `provenance`: dataset, attribution, license, snapshot, dataset URL, and individual record URL when available.
- `quality`: note and character counts, note-pyramid coverage, and explicit availability flags.

Unavailable information is represented as `null` or an empty array according to the contract; absence is not converted into an invented descriptor.

## Similarity and confidence policy

A future similarity score is an **editorial estimate from 0 to 100** based on public note and profile descriptors. It is not a chemical formula comparison, laboratory measurement, probability of duplication, legal originality check, or guarantee that two fragrances smell identical.

Confidence is an independent field. A high score with sparse or incomplete source data must not be presented as highly confident. Later scoring blocks must expose the evidence and missing data that influence each result.

The engine must distinguish:
- Shared descriptors and family/profile overlap.
- Differences in notes, family and character.
- Missing or incomplete pyramid data.
- Similarity score versus confidence in the underlying comparison.

No fixed weights are considered calibrated merely because they sum to 100. Any weights introduced by the scoring block must be documented, tested against explicit examples, and labeled provisional until human sensory validation exists.

## Twelve-block implementation sequence

| Project block | Deliverable |
|---|---|
| 25 | Independent architecture and public contracts |
| 26 | Normalized olfactory profile model and source provenance |
| 27 | Synonym normalization, duplicate handling, and data-quality policy |
| 28 | Olfactory comparison engine: notes, families, accords, pyramid, and character |
| 29 | Transparent similarity score and separate confidence calculation |
| 30 | Evidence explanations: shared traits, differences, and limitations |
| 31 | Name/house search, typo tolerance, suggestions, and ambiguity handling |
| 32 | Match ranking and readable similarity bands |
| 33 | Filters for olfactory direction and use context |
| 34 | Global-catalog mode versus inventory-only mode, with availability kept separate from similarity |
| 35 | Responsive user interface and accessible empty/error states |
| 36 | Regression, quality certification, integration, and final checkpoint |

## Non-goals and safeguards

This track does not reconstruct proprietary formulas, estimate ingredient percentages, offer production instructions, or make safety claims. It does not add external API calls, cloud synchronization, a subscription, an AI provider, or a dependency that could introduce cost. All current work remains local and reproducible.
