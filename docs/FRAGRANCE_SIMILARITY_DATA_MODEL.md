# Block 26 — Olfactory profile data model

## Input source

The model consumes records from the local `REFERENCE_PERFUMES` dataset. It retains the Scento dataset attribution, CC BY 4.0 license, snapshot date, dataset URL, and each record URL when one is supplied.

## Canonical profile shape

Each accepted record is represented as:

- `schemaVersion`, `id`.
- `identity.name`, `identity.house`, `identity.category`.
- `olfactory.family`, `olfactory.subfamilies`, `olfactory.accords`, `olfactory.character`.
- `olfactory.notes.all`, `top`, `heart`, and `base`.
- `provenance` with dataset, attribution, license, snapshot, and URLs.
- `quality` with descriptor counts, explicit availability flags, and pyramid coverage.

## Missing-data rules

The source dataset does not provide every field for every perfume. The model therefore preserves these distinctions:

- `top`, `heart`, and `base` are independent arrays. Empty arrays remain empty.
- `pyramidCoverage` is `complete` only when all three stages have declared notes; it is `partial` when one or two stages have data; otherwise it is `unavailable`.
- `notes.all` retains the source aggregate notes and any declared pyramid notes. Aggregate notes are never assigned to a pyramid stage by inference.
- Missing family, subfamilies, and accords remain `null`. The model does not derive accords from character words.
- `character` preserves the dataset descriptors and does not treat them as a note list.

The first model performs only whitespace cleanup and exact case/accent-insensitive duplicate removal. It does **not** merge synonyms such as “Bergamot” and “Bergamota”; synonym dictionaries and semantic normalization belong to Block 27.

## Quality and provenance

Every profile carries its source provenance and a small quality summary. The catalog builder returns accepted profiles and an explicit rejected-record list with reasons; conversion failures are not silently discarded.

This model intentionally does not calculate similarity, rankings, or confidence. Those belong to later blocks and must use the coverage/provenance information instead of treating missing values as negative matches.
