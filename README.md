# JB Virtual Perfume Lab

Personal, Android-first virtual fragrance concept laboratory. The initial product is a touch-friendly Progressive Web App (PWA); interactive 3D, note composition and creative analysis will be delivered in later blocks.

## Product principles

- Explore fragrance ideas, note families and conceptual accords.
- Build a touch-first interface that works on Android and desktop.
- Keep experiment data local-first when persistence is introduced.
- Preserve original concepts and make variants instead of silently overwriting work.
- Produce creative briefs for professional perfumers and manufacturers.
- **This is a creative concept tool, not a chemistry simulator.** It does not provide formulas, ingredient dosages, manufacturing instructions, safety certification or claims of real-world performance.

## Install on Android

Once the site is published over HTTPS, open it in Chrome on Android. Use the **Instalar** control in the app when the browser offers the install prompt. If no prompt is available yet, open Chrome's menu (⋮) and select **Install app** or **Add to Home screen**. The exact label depends on the browser and device.

The install creates a home-screen web app; it is not a separately distributed native APK.

## Updates

The service worker uses a versioned app-shell cache. When a new deployment is available, the app displays an update notice. Selecting **Actualizar** activates the waiting worker and reloads the app with the new files. The app also checks for updates when opened or brought back into the foreground. A network connection is required to fetch a new release.

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

See the architecture notes in docs/architecture.md for module boundaries and delivery decisions.

## Current status

- Block 1 — Foundation & Architecture: implemented and CI-validated on feature/lab-foundation.
- Block 2 — Design System & PWA Experience: being built on feature/lab-design-system.
- Three.js, the note library, virtual mixing and creative analysis remain future blocks.
- GitHub Pages should publish main from the repository root after the feature PRs are merged.
