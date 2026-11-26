# JB Perfume Lab — Product & Technical Specification

## 1. Product direction

JB Perfume Lab is a minimal, Android-first and local-first workspace for conceptual fragrance composition, olfactory analysis, experiment tracking and development of a personal creative identity.

The product deliberately excludes 3D scenes, WebGL, Three.js, virtual bottles, room environments, camera controls, zoom, lighting, shadows and 3D animation. The interface is built around structured data, responsive tables, charts, comparisons and a local creative archive.

## 2. Core areas

1. **Dashboard:** counts of saved creations, variants, versions and unique references; aggregate family distribution; recent activity; current draft.
2. **Formulation workspace:** add/remove library references, edit normalized creative points, view family/profile/pyramid analytics and autosave the draft.
3. **Reference library:** educational notes and accords with family, indicative pyramid roles, sensory descriptors and creative pairings.
4. **Creative archive:** named creations, variants, version history, restore, compare, JSON import and export.
5. **Originality & personal identity:** internal differentiation against the user's own saved formulas, family-profile affinity and creative exploration prompts.
6. **Experiment evaluation:** planned extension for human sensory evaluations, dated observations and side-by-side test results.

## 3. Product boundaries

This is an editorial and creative concept tool, not a chemistry simulator or manufacturing guide. The normalized 100-point composition is a relative creative weighting system. It is not a percentage recipe, mass ratio, concentration, dosage, volume, safety assessment or guarantee of a real-world scent result.

The sensory signals and pyramid roles originate from educational descriptions in the reference library. They are heuristic editorial descriptors rather than chemical measurements or universal classification rules.

## 4. Personal Originality Engine

The Originality Engine compares the active candidate only against distinct formula snapshots in the user's local archive. Its Internal Differentiation Index uses three transparent heuristics:

- **Reference novelty:** how frequently the selected references appear in the personal archive.
- **Pair novelty:** how many pairs of references have not appeared together in saved formula snapshots.
- **Structural distance:** how different the candidate's normalized reference weights are from its nearest saved composition.

A separate Personal Pattern Affinity measure compares the distribution of olfactory families against historical compositions. Differentiation and stylistic affinity must remain separate: a formula can be very different from previous work while not matching the creator's established tendencies.

The system must not invent a score before there is a sufficient personal baseline. Exact matches are excluded from self-comparison. The interface labels the score as internal differentiation and explains that it does not compare global perfume catalogs, commercial formulas, patents or market releases. No score proves global novelty, legal protectability, exclusivity or commercial uniqueness.

Scoring weights are heuristic product choices, not empirically validated measures of perfume originality. The score must be treated as an exploratory comparison aid.

## 5. Analytics

Dashboard totals and charts must be derived from local archive records and the live draft. Empty archives show truthful zero/empty states; no synthetic performance, quality or popularity indicators may be introduced. Family charts are aggregated from creative points in saved variants, while sensory/pyramid charts remain tied to the active composition unless a comparison view is explicitly selected.

## 6. PWA update lifecycle

The service worker uses a versioned app shell. A new waiting service worker may produce one update notice. Closing the notice persists that dismissal for the same waiting release. A newly installed worker clears the dismissal and can display a new notice. Automatic checks must not be triggered on every focus or visibility interaction. The message "Está todo actualizado" appears only after the user explicitly activates the manual version check.

Applying an update sends SKIP_WAITING; the app reloads after controllerchange. If there is no waiting worker, the manual action reports the current update-check result without inventing a new release.

## 7. Local storage and portability

The draft is autosaved locally. The archive uses IndexedDB with a localStorage fallback. No cloud synchronization is performed. Browser data deletion, device loss or switching devices can remove local records, so the app must preserve JSON backup import/export and remind the user to keep external backups.

## 8. Technical constraints

- No paid runtime services or APIs.
- No Three.js, WebGL or 3D asset downloads.
- No new runtime dependencies for charts; use responsive SVG/CSS visualizations.
- Preserve keyboard accessibility and Android touch targets.
- Retain the existing archive schema unless a migration is explicitly introduced and tested.
- Keep service-worker paths relative for GitHub Pages project hosting.
- Increment the shell version when shipping app-shell changes.

## 9. Roadmap and acceptance

| Block | Scope | Acceptance |
|---|---|---|
| 1 | PWA update lifecycle | Dismissal persists for the same release; new release prompts once; current-version result only on manual check |
| 2 | 3D decommission | No 3D runtime modules, camera controls, imports, CDN cache entries or 3D-only tests |
| 3 | Analytics dashboard | Local counts, family distribution, recent archive and draft state are data-derived and responsive |
| 4 | Originality and personal identity | No score without personal baseline; internal differentiation and personal-pattern affinity remain distinct |
| 5 | Certification and release | All unit tests, syntax checks and foundation validation green; review, merge and Pages deploy verified |
| 6 | Formulation UX | Faster ingredient search, clearer editing and robust mobile interactions | **Implemented on feature branch; CI pending** |
| 7 | Analytical comparison | Compare family, sensory and pyramid profiles between saved variants |
| 8 | Creative signature history | Track recurring preferences and how the user's creative profile changes over time |
| 9 | Sensory experiment records | Dated human evaluations, observations and controlled comparisons |
| 10 | Reports and export | Printable analytical summary and structured data export |

## 10. Current implementation status

- PWA update lifecycle: completed, merged in PR #32 and covered by passing CI.
- 3D runtime removal: completed. Runtime modules, HTML import map, service-worker CDN/cache entries, rendering modules and 3D-only test suites removed.
- Dashboard: completed and wired into the home view; the main branch and GitHub Pages deployment include it.
- Originality engine and UI: completed with regression tests; score is limited to the user's own archive.
- CI: 97/97 tests passed, syntax check passed and foundation validator passed.
- PR #32: merged by squash into main. Main commit: 3840ed55510b87291c848442f5935d8b46c1f1e8.
- GitHub Pages build and deploy workflow: completed successfully.
- Physical Android responsive review, actual PWA dismissal/release behavior and device-level inspection: pending.
