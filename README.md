# JB Virtual Perfume Lab

Personal, Android-first virtual fragrance concept laboratory. The application is a touch-friendly Progressive Web App (PWA); interactive 3D, conceptual composition and creative analysis will be delivered in later blocks.

## Product principles

- Explore fragrance ideas, note families and conceptual accords.
- Build a touch-first interface that works on Android and desktop.
- Keep experiment data local-first when persistence is introduced.
- Preserve original concepts and make variants instead of silently overwriting work.
- Produce creative briefs for professional perfumers and manufacturers.
- **This is a creative concept tool, not a chemistry simulator.** It does not provide formulas, ingredient dosages, manufacturing instructions, safety certification or claims of real-world performance.

## Official brand asset

The official Perfumería JB logo is maintained in `assets/brand-logo.svg` and used in the application header and PWA icon metadata.

## Install on Android

Open the published site over HTTPS in Chrome on Android. Use **Instalar** when the browser offers the prompt. If the prompt is unavailable, open Chrome's menu (⋮) and select **Install app** or **Add to Home screen**. The exact label depends on the browser and device.

This creates a home-screen web app; it is not a separately distributed native APK.

## Updates

The service worker uses a versioned app-shell cache. When a new deployment is available, the app displays an update notice. Selecting **Actualizar** activates the waiting worker and reloads the app with the new files. The app also checks for updates when opened or brought back into the foreground. A network connection is required to fetch a new release.

Increment the shell version in `sw.js` whenever shipping a new app-shell release.

## Perfume Library

The initial editorial library contains notes and accords with family, indicative pyramid role, sensory facets, descriptions and creative pairing ideas. The categories and suggested placements are a learning aid, not fixed technical rules. An accord is a conceptual combination; it is not a single raw material.

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
- Block 3 — Perfume Library & Official Branding: in development on `feature/block3-perfume-library-branding`.
- Three.js, virtual mixing, creative analysis and local project persistence remain future blocks.
