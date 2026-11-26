# Block 28 — Olfactory comparison engine

## Purpose

Compare two normalized fragrance profiles and return evidence independently by dimension. The engine has no UI, network, database, persistence or provider dependencies.

## Dimensions

- Aggregate declared notes.
- Family tags and subfamilies.
- Accords, when both profiles declare them.
- Top, heart and base stages independently.
- Character descriptors.

Each comparable dimension returns a 0–100 **descriptor overlap index** using intersection divided by union (Jaccard overlap), matched descriptors and source-only descriptors for both profiles.

## Missing-data handling

A dimension is marked `not-comparable` when either profile lacks that dimension. Missing data is not scored as a zero match. Pyramid stages are compared only when both sides have at least one declared descriptor for that stage. Aggregate note lists remain separate from the top/heart/base assignments.

## Output boundary

The engine reports comparable dimensions, skipped dimensions and descriptor counts. It intentionally does **not** produce one combined similarity percentage, confidence level or candidate ranking. Those calculations belong to Blocks 29 and 32 and must account for data coverage and evidence quality.
