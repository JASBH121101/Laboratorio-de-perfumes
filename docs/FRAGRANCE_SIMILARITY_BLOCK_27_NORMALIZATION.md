# Block 27 — Semantic normalization and data quality

## Purpose

Normalize language and writing variants before profile comparison. The original catalog labels remain untouched. Normalization produces canonical keys plus the first source label so the comparison engine can explain which descriptors matched.

## Supported operations

- Unicode accent normalization, case folding, punctuation and spacing cleanup.
- Curated bilingual aliases for frequent notes (for example Bergamot/Bergamota, Blackcurrant/Cassis and Olibanum/Incienso).
- Controlled mappings for character descriptors and the dataset's editorial family labels.
- Semantic duplicate removal after alias resolution, within each profile dimension.
- Unknown terms retain a deterministic normalized key instead of being guessed or removed.

## Family taxonomy mapping

The current reference dataset uses descriptive group labels. The normalizer maps those exact groups to broader comparison tags, such as White Bloom/Petal Garden → floral and Wood & Root → woody/earthy. Original family labels remain in the source profile. Unknown family labels receive their own key; they are not forced into a known family.

## Data-quality policy

- The normalizer does not rewrite the source profile or modify the licensed dataset.
- A missing descriptor remains missing.
- Similar but distinct notes are not merged without an explicit alias rule (for example Cedarwood and Sandalwood, Neroli and Orange Blossom, Cacao and Chocolate remain separate).
- Fuzzy typo correction is not included here; search suggestions and typo tolerance are handled in Block 31.
- Each canonical descriptor retains the source-facing label for explanations.

## Output

`normalizeFragranceSimilarityProfile(profile)` returns canonical key/label entries for family, subfamily, accord, note-pyramid and character dimensions, plus original quality and provenance metadata.
