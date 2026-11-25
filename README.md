# JB Virtual Perfume Lab

Personal, Android-first virtual fragrance concept laboratory. The initial product is a touch-friendly Progressive Web App (PWA); interactive 3D, note composition and creative analysis will be delivered in later blocks.

## Product principles

- Explore fragrance ideas, note families and conceptual accords.
- Build a touch-first interface that works on Android and desktop.
- Keep experiment data local-first when persistence is introduced.
- Preserve original concepts and make variants instead of silently overwriting work.
- Produce creative briefs for professional perfumers and manufacturers.
- **This is a creative concept tool, not a chemistry simulator.** It does not provide formulas, ingredient dosages, manufacturing instructions, safety certification or claims of real-world performance.

## Development

Requirements: Node.js 22+ and npm.

```bash
npm test
npm run validate
```

JB Expert QA 2.0 is declared as a development dependency. The dependency has not yet been installed or runtime-validated in this environment. Its commands are available after a successful install:

```bash
npm install
npm run qa:static
npm run qa:security
npm run qa:dashboard
```

## Architecture

The foundation uses native HTML, CSS and JavaScript modules. This keeps the initial PWA lightweight and avoids introducing a build tool before it is needed. Three.js is intentionally deferred to the 3D laboratory block, where it can be added with a deliberate performance and delivery strategy.

See [docs/architecture.md](docs/architecture.md) for module boundaries and delivery decisions.

## Current status

- Repository initialization: completed on `main`.
- Block 1 — Foundation & Architecture: in progress on `feature/lab-foundation`.
- Baseline test and static validation scripts: added in this block.
- GitHub Actions quality workflow: added; execution must be confirmed from GitHub after the branch is pushed.
- GitHub Pages: publishes only the configured source branch. The foundation will become visible there after the PR is reviewed and merged to `main`, provided Pages is enabled for `main` and `/(root)`.
