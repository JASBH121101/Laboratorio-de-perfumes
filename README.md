# JB Virtual Perfume Lab

Personal, Android-first virtual fragrance concept laboratory. The application is a touch-friendly Progressive Web App (PWA) with a Three.js 3D atelier, an educational note library and a roadmap toward conceptual composition and creative analysis.

## Product principles

- Explore fragrance ideas, note families and conceptual accords.
- Use an Android-first interface with touch gestures and desktop controls.
- Keep experiment data local-first when persistence is introduced.
- Preserve original concepts and make variants instead of silently overwriting work.
- Produce creative briefs for professional perfumers and manufacturers.
- **This is a creative concept tool, not a chemistry simulator.** It does not provide formulas, ingredient dosages, manufacturing instructions, safety certification or claims of real-world performance.

## Official brand asset

The official Perfumería JB logo is maintained in `assets/brand-logo.svg` and used in the application header, loading screen and PWA icon metadata.

## Install on Android

Open the published site over HTTPS in Chrome on Android. Use **Instalar** when the browser offers the prompt. If the prompt is unavailable, open Chrome's menu (⋮) and select **Install app** or **Add to Home screen**. The exact label depends on the browser and device.

This creates a home-screen web app; it is not a separately distributed native APK.

## Updates and offline behavior

The service worker uses a versioned app-shell cache. When a new deployment is available, the app displays an update notice. Selecting **Actualizar** activates the waiting worker and reloads the app with the new files. A network connection is required to fetch a new release.

Three.js is pinned to `0.187.0` and loaded only when the 3D laboratory is opened. The service worker attempts to cache the exact CDN module; failure to cache this optional external dependency does not block installation or PWA updates. Once cached, the 3D module can be served offline. The first visit to the 3D scene requires a network connection if the module was not precached.

Increment the shell version in `sw.js` whenever shipping a new app-shell release.

## Perfume Library

The editorial library contains 60 references with family, indicative pyramid role, sensory facets, profiles and creative pairing ideas. These are educational descriptions, not fixed technical rules or formulas.

## 3D Laboratory

Block 4 adds a lazy-loaded Three.js scene with a workbench, perfume bottle, reference vials, beaker, pipette and tray. On Android, drag one finger to orbit and pinch with two fingers to zoom. Tap an object to open its inspector card. Desktop users can drag with the mouse and zoom with the wheel. Arrow keys rotate the camera; plus/minus adjust zoom; Escape clears selection.

The scene is deliberately static between interactions, uses a capped device pixel ratio, and does not enable real-time shadow maps. This keeps the renderer lighter on mobile devices. A WebGL-unavailable fallback is shown when the browser cannot create a renderer.

Block 4 provides visual inspection only. Virtual composition, quantities and mixing interactions are reserved for Block 5.

## Development

Requirements: Node.js 22+ and npm.

```bash
npm test
npm run validate
```

JB Expert QA 2.0 is declared as a development dependency. It has not yet been installed or runtime-validated in this repository environment.

## Current status

- Block 1 — Foundation & Architecture: integrated and CI-validated.
- Block 2 — Design System & PWA Experience: integrated and Pages-published.
- Block 3 — Perfume Library & Official Branding: integrated and Pages-published.
- Block 4 — 3D Laboratory Core: in development on `feature/block4-3d-laboratory`.
- Block 5 — Virtual Mixing Studio: planned.
