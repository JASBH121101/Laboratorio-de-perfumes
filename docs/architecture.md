# Foundation, interface and 3D architecture

## Runtime

The application uses semantic HTML, responsive CSS and native JavaScript ES modules. Relative local asset paths keep it deployable at the root of the GitHub Pages project site. Three.js 0.187.0 is pinned through an import map and loaded dynamically only after entering the 3D laboratory.

## Module boundaries

- src/js/app.js: application entrypoint, event delegation, theme preference, PWA wiring and lazy scene mounting.
- src/js/core/navigation.js: supported view identifiers and hash routing.
- src/js/core/pwa.js: install prompt handling, installation detection, service-worker registration, update checks and controlled activation.
- src/js/features/perfume-library/: note and accord reference library.
- src/js/features/laboratory/catalog.js: selectable 3D prop metadata and mobile render bounds.
- src/js/features/laboratory/inspector.js: object information joined to the perfume library.
- src/js/features/laboratory/scene.js: Three.js scene, WebGL renderer, props, raycasting, pointer gestures, camera, composition vessel tint/level and disposal.
- src/js/features/laboratory/mixing/state.js: normalized 100-point creative composition, add/remove/reweight operations and bounded undo history.
- src/js/features/laboratory/mixing/panel.js: library picker, draggable quick notes, drop zone, weight sliders, undo and reset.
- src/js/ui/views.js: presentation-only view templates.
- src/css/: base shell, design system, perfume library and 3D workspace styles.
- manifest.webmanifest: installed application identity, display settings and icons.
- sw.js: versioned app-shell cache, optional Three.js CDN cache, offline fallback and explicit update activation.
- scripts/validate-foundation.mjs: dependency-free structural validation.
- tests/: Node built-in test runner.

## 3D scene and performance

The scene creates a workbench and eight selectable props from local geometry. It uses a low-power WebGL context, no real-time shadow maps, a capped device pixel ratio, event-driven rendering and a ResizeObserver. The scene is mounted only in the laboratory view and fully disposes renderer resources when the user navigates away.

Pointer interaction supports one-finger orbit, two-finger pinch zoom and tap-to-inspect. Mouse dragging, wheel zoom, arrow-key rotation, plus/minus zoom and Escape selection reset are also supported. A WebGL fallback is rendered if the browser cannot create a context.

## Three.js delivery and offline behavior

Three.js is pinned to 0.187.0 from jsDelivr. The app-shell install does not download Three.js. On first use of the 3D view, the service worker caches both the pinned module and its relative core dependency. Cross-origin fetch handling is restricted to those two exact URLs. This keeps PWA installation and updates lighter; the first opening of the 3D view needs a network connection, while later openings can use the cached files offline.

The Three.js license is MIT; see docs/THIRD-PARTY-NOTICES.md.

## PWA update lifecycle

1. The browser registers the service worker from the site root.
2. A changed worker downloads the new local app shell and attempts to precache the pinned Three.js module.
3. If an older worker currently controls the page, the new worker waits and the app displays an update notice.
4. The user chooses Actualizar. The app posts SKIP_WAITING to the waiting worker.
5. The new worker activates, removes older app-shell caches and takes control; the app reloads once.

**Release rule:** increment the shell version in sw.js whenever shipping a new app-shell release.

## Product and safety boundary

The product represents fragrance concepts for creative exploration. It is not a chemical formulation tool, laboratory instrument, safety evaluator or substitute for professional perfumery. The 3D objects are visual props, not lab equipment that measures or controls real ingredients. Virtual composition is reserved for Block 5 and will use abstract creative values, not chemical concentrations.

## Delivery

Changes are developed on feature branches, validated by pull request and merged into main only after review. GitHub Pages publishes main from /(root). The quality workflow runs dependency-free tests and structure validation on Node.js 22. JB Expert QA commands remain separate until the dependency is installed and validated.
