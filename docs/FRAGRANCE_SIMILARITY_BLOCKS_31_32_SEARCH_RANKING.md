# Blocks 31–32 — Reference search and similarity ranking

## Block 31 — Search by perfume name and house

The engine uses the included licensed offline catalog (1,479 records). It normalizes accents, punctuation and case; supports exact, prefix, token and bounded Damerau–Levenshtein typo matching; and searches perfume name, house or a combined query. Category, result-count and house-search filters are available.

Search states distinguish empty queries, too-short input, exact unique matches, suggestions, ambiguous matches requiring selection and no-result cases. Results expose a search relevance score and match type; that score is not olfactory similarity. A selected result is resolved by stable profile ID before comparison.

## Block 32 — Candidate ranking

The ranking engine compares each candidate with the selected reference using Blocks 28–30. It returns global editorial score, similarity band, separate evidence confidence, data coverage and structured explanation. Candidates without enough comparable evidence remain outside the scored ranking. A minimum score and result limit can be applied.

Bands: very high (90–100), high (75–89), moderate (60–74), limited (40–59), low (0–39). Similarity score is primary. Confidence and evidence coverage are tie-breakers only and never modify the score. The output is an editorial descriptor estimate, not chemical or sensory equivalence.

Both engines are pure JavaScript and use the local dataset; no network service or paid provider is called.
