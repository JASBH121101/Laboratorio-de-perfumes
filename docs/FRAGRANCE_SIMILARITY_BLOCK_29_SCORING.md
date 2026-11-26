# Block 29 — Global similarity score and confidence

## Model status

The first global score is an explicit, deterministic editorial model. Its weights are **provisional**, not calibrated by sensory panel measurements. The result is a 0–100 similarity estimate from public catalog descriptors, not a probability, chemical analysis or guarantee that two fragrances smell the same.

## Default dimension weights

| Dimension | Weight |
|---|---:|
| Aggregate declared notes | 32% |
| Top/heart/base pyramid | 22% |
| Olfactory families | 14% |
| Subfamilies | 6% |
| Accords | 10% |
| Character descriptors | 16% |
| **Total** | **100%** |

The pyramid component averages the available top, heart and base overlap indices equally. Each component index is the intersection/union result from Block 28.

## Missing-data behavior

Only comparable dimensions contribute. The remaining weights are renormalized across the evidence that exists, so a missing accord does not count as a mismatch. The result also exposes available weight coverage and excluded dimensions. At least two comparable dimensions are required for a global score; otherwise the score is null with status `insufficient-data`.

Custom dimension weights are supported and normalized to a common scale. Unknown, negative, non-finite, or all-zero weight sets are rejected.

## Confidence is separate

The confidence index is not a probability. It combines:
- 50% comparable dimension-weight coverage.
- 30% descriptor richness (notes, character and family presence).
- 20% declared top/heart/base pyramid completeness.

The level thresholds are: high ≥80, medium ≥65, low ≥45, very low <45. A high similarity score can therefore have very low confidence when the data is sparse.

## Outputs

The engine returns the global estimate, per-component scores, configured/effective weights, contribution details, included/excluded dimensions and a separate evidence-quality index with reasons. The model is versioned and explicitly marked provisional.
