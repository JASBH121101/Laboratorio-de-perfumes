# Foundation architecture

## Runtime

The first version uses native browser capabilities: semantic HTML, responsive CSS and JavaScript ES modules. It is served as a static site and uses relative asset paths so it can live at the root of a GitHub Pages project site.

Three.js is deliberately deferred until the 3D laboratory block. The 3D engine will be isolated behind a scene module so navigation, content and data logic do not depend on WebGL.

## Module boundaries

- `src/js/app.js`: application entrypoint, event delegation, theme preference and service-worker registration.
- `src/js/core/navigation.js`: supported view identifiers and hash routing.
- `src/js/ui/views.js`: presentation-only view templates.
- `src/css/styles.css`: tokens, shell, responsive layout, touch navigation and reduced-motion behavior.
- `manifest.webmanifest` and `sw.js`: install metadata and static app-shell caching.
- `scripts/validate-foundation.mjs`: dependency-free structural validation.
- `tests/`: Node built-in test runner.

## Future domain boundaries

The following modules are planned, not implemented in Block 1:

1. Fragrance reference library and note taxonomy.
2. Concept composition model with normalized abstract values, never chemical dosages.
3. Three.js scene and touch interaction adapters.
4. Creative evaluation and mentor rules.
5. Versioned local repository and export adapters.
6. Similarity research dataset with provenance and confidence.

## Product and safety boundary

The product represents fragrance concepts for creative exploration. It is not a chemical formulation tool, laboratory instrument, safety evaluator or substitute for professional perfumery. Real-world performance requires physical samples, sensory evaluation and professional formulation.

## Delivery

Changes are developed on feature branches, validated by pull request and merged into `main` only after review. GitHub Pages should publish `main` from `/(root)`. The quality workflow runs dependency-free checks on Node.js 22; JB Expert QA commands remain a separate optional validation until the package install is confirmed.
