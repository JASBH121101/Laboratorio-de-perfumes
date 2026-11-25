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

Three.js is pinned to `0.187.0` and loaded only when the 3D laboratory is opened. The service worker caches the pinned Three.js module and its core file on the first successful 3D load. This keeps the general PWA installation and updates lighter. The first visit to the 3D scene requires a network connection; after both files are cached, the scene can load offline.

Increment the shell version in `sw.js` whenever shipping a new app-shell release.

## Perfume Library

The editorial library contains 60 references with family, indicative pyramid role, sensory facets, profiles and creative pairing ideas. These are educational descriptions, not fixed technical rules or formulas.

## 3D Laboratory

Block 4 adds a lazy-loaded Three.js scene with a workbench, perfume bottle, reference vials, beaker, pipette and tray. On Android, drag one finger to orbit and pinch with two fingers to zoom. Tap an object to open its inspector card. Desktop users can drag with the mouse and zoom with the wheel. Arrow keys rotate the camera; plus/minus adjust zoom; Escape clears selection.

The scene is deliberately static between interactions, uses a capped device pixel ratio, and does not enable real-time shadow maps. This keeps the renderer lighter on mobile devices. A WebGL-unavailable fallback is shown when the browser cannot create a renderer.

Block 4 provides visual inspection. Block 5 adds a conceptual composition panel, abstract point weights, undo/reset and a live beaker color/level display.

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
- Block 4 — 3D Laboratory Core: integrated and Pages-published.
- Block 5 — Virtual Mixing Studio: integrated and Pages-published.
- Block 6 — Creative Analysis Engine: integrated and Pages-published.
- Block 7 — Conceptual Evolution Simulator: integrated and Pages-published.


## Virtual Mixing Studio — Block 5

The mixing studio accepts references from the library picker, quick-add chips, note detail cards or selected 3D vials. Desktop users can drag a quick reference into the drop zone; Android users can tap the same reference. Each composition is normalized to 100 **creative points**. Changing one reference redistributes the remaining points, and removing a reference rebalances the rest. Undo and reset are available.

These points are internal creative weights only. They are not percentages, ingredient ratios, concentrations, dosages, production instructions or predictions of a real perfume. The beaker's color and displayed level are visual metaphors based on selected note families and reference count.

The current composition remains in memory for the active app session. Persistent drafts, named variants and export belong to the later archive/persistence block.


## Creative Analysis Engine — Block 6

The analysis engine reads the current conceptual composition and summarizes family distribution, reference coverage across the indicative top/heart/base roles, repeated sensory descriptors and editorial sensory signals (sweet/creamy, fresh/luminous, woody/earthy, floral, spicy, clean/close).

It does not generate a single unexplained quality score. Observations describe patterns to review, not automatic verdicts. The Creative Advisor offers up to three references from the existing library for a selected direction: sweeter, less sweet, fresher, woodier, more floral, spicier, cleaner/intimate or more balanced/contrasted. Each suggestion explains its editorial rationale and possible trade-off and can be added to the conceptual composition.

All indicators are derived from the library's editorial text and the composition's abstract creative points. They are not sensory measurements, objective formula compatibility, molecular analysis, longevity, projection, sillage or safety assessments. The user must evaluate real samples with professional support.


## Conceptual Evolution Simulator — Block 7

The simulator provides an interactive editorial reading of the composition across three stages: opening (0–15 min), heart (15 min–2 h) and drydown (2 h onward). It lists library references assigned to each selected role and normalizes their creative-point shares within that stage. These time ranges are illustrative UI labels, not fragrance performance predictions. It does not model evaporation, chemistry, longevity, projection or actual scent evolution.
