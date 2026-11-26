# Block 30 — Similarity explanation engine

## Purpose

Turn Block 28 comparison evidence and Block 29 scoring into a structured explanation that can later be rendered by the UI.

## Output sections

- **Similarities:** shared notes, families, subfamilies, accords, character descriptors and matching top/heart/base descriptors.
- **Differences:** descriptors listed only in the reference profile and descriptors listed only in the candidate profile, grouped by dimension or pyramid stage.
- **Skipped dimensions:** fields that could not be compared because one or both profiles lack public data.
- **Limitations:** provisional scoring weights, incomplete source data, and the distinction between a source not listing a note and the real perfume not containing or smelling of that note.

Each row preserves the source-facing labels and its dimension. The explanation engine does not infer note absence, proprietary formula, sensory equivalence, authenticity or performance.

The module returns plain structured data and has no DOM, UI, network, persistence, database or provider dependencies.
