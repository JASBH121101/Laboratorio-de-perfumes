# Foundation and interface architecture

## Runtime

The application uses semantic HTML, responsive CSS and native JavaScript ES modules. Relative asset paths keep it deployable at the root of the GitHub Pages project site. Three.js is deferred until the 3D laboratory block and will be isolated behind its own scene module.

## Module boundaries

- src/js/app.js: application entrypoint, event delegation, theme preference and PWA UI wiring.
- src/js/core/navigation.js: supported view identifiers and hash routing.
- src/js/core/pwa.js: install prompt handling, installation detection, service-worker registration, update checks and controlled activation.
- src/js/ui/views.js: presentation-only view templates.
- src/css/styles.css: base shell and responsive layout.
- src/css/design-system.css: component states, interface tokens, touch targets and install/update notice styling.
- manifest.webmanifest: installed application identity, display settings and icons.
- sw.js: versioned app-shell cache, offline fallback and explicit update activation.
- scripts/validate-foundation.mjs: dependency-free structural validation.
- tests/: Node built-in test runner.

## PWA update lifecycle

1. The browser registers the service worker from the site root.
2. A changed worker downloads the new app shell into a versioned cache.
3. If an older worker currently controls the page, the new worker waits and the app displays an update notice.
4. The user chooses Actualizar. The app posts SKIP_WAITING to the waiting worker.
5. The new worker activates, removes older app-shell caches and takes control; the app reloads once.

Update checks run on launch and when the app returns to the foreground. The visible button also allows a manual check; manual checks can resurface the update notice after it has been dismissed. A network connection is required to download a new release.

**Release rule:** increment the shell version in sw.js (for example, shell-v3 to shell-v4) whenever shipping a new app-shell release. This gives installed clients a detectable service-worker change and a fresh cache namespace.

## Product and safety boundary

The product represents fragrance concepts for creative exploration. It is not a chemical formulation tool, laboratory instrument, safety evaluator or substitute for professional perfumery. Real-world performance requires physical samples, sensory evaluation and professional formulation.

## Delivery

Changes are developed on feature branches, validated by pull request and merged into main only after review. GitHub Pages should publish main from /(root). The quality workflow runs dependency-free tests and structure validation on Node.js 22. JB Expert QA commands remain separate until the dependency is installed and validated.
