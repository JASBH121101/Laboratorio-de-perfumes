# Phase 2 — Visual Correction: Experiment-First Workspace

**Repository:** `JASBH121101/Laboratorio-de-perfumes`  
**Pull request:** #23 — draft, not merged  
**Branch:** `feature/phase2-visual-correction-frontal-workspace`  
**Purpose:** respond to the first physical Android visual review without replacing the existing Phase 2 rendering foundation.

## Findings from the Android review

The device returned an indicative average of 80.9 FPS against the Mobile Standard target of 45 FPS, with 12.4 ms average frame time, 22.0 ms P95, 0.6% of frames above 33.3 ms and no lost WebGL context in that sample. This supports continuing with visual corrections, but it is not a sustained thermal or battery certification.

The screenshots also showed two important visual defects:
- the user could orbit around to an exterior/back-of-room view;
- the full room remained the dominant visual context when the user wanted to work at the bench.

## Corrective work — current PR scope

### A. Experiment-first composition

- A dedicated front-facing experiment set keeps the workbench visible against a compact studio floor and a restrained rear presentation panel.
- Full room walls, door, window, floor architecture and display shelving are grouped separately and hidden by default.
- The experiment workspace is the default mode when the Laboratory opens.
- The full room remains available through **Ver atelier completo** and the same control returns to the experiment workspace.
- The workbench, interactive props, inspection, composition vessel and performance audit remain in place.

### B. Camera constraints

- Default camera framing starts on the frontal workbench rather than an exterior room view.
- Horizontal orbit is constrained to -0.5 to +0.5 radians.
- Elevation is constrained to 0.9 to 1.3 radians.
- Zoom radius is constrained to 5.1 to 12.1 scene units.
- Frasco, Mesa, General and Atelier use separate intended framings.
- Touch orbit, pinch zoom, wheel, keyboard navigation and preset transitions all pass through the same camera clamp.

### C. PWA and regression coverage

- Camera constraints are covered by unit tests.
- Foundation validation checks the experiment backdrop, mode switch, camera preset and camera module registration.
- Service-worker shell cache advances from `shell-v21` to `shell-v22` and precaches `camera-controls.js`.
- No paid assets, external runtime assets, new runtime dependencies, hosted services or telemetry were introduced.

## Status

| Work item | Status |
|---|---|
| Android screenshot review and findings | Completed |
| Frontal experiment workspace as default | Implemented in PR #23; automated CI still pending |
| Compact studio backdrop instead of empty-room walls | Implemented in PR #23; physical visual review pending |
| Optional full-atelier mode | Implemented in PR #23; physical visual review pending |
| Camera orbit/elevation/zoom limits | Implemented in PR #23; physical interaction review pending |
| Camera unit tests and foundation validation rules | Added; CI execution pending |
| PWA shell v22 and camera-controls precache | Implemented; deploy/offline verification pending |
| High-fidelity bottle, glass, labels and tool model refinement | Not started in this corrective track |
| Draw-call and geometry optimization | Not started in this corrective track |
| Android long-session heat/battery and offline certification | Pending |

## Acceptance criteria

- [ ] Laboratory opens in experiment mode with no complete room visible.
- [ ] Workbench, active conceptual vessel and main tools remain visible and selectable.
- [ ] User can open the full atelier explicitly and return to the experiment workspace.
- [ ] Orbit cannot rotate to the back/outside of the room.
- [ ] Pinch, wheel and keyboard zoom remain within camera bounds.
- [ ] General, Frasco and Mesa presets frame the intended subject.
- [ ] Existing reduced-motion behavior and event-driven rendering are preserved.
- [ ] Automated tests and foundation validation pass in CI.
- [ ] Updated PWA loads the new module online and after it has been cached offline.
- [ ] Physical Android visual review confirms the new framing and mode switch.
- [ ] Long-session thermal/battery observation is recorded separately from browser telemetry.

## Remaining Phase 2 work

This corrective PR does not claim that the premium visual rebuild is complete. The next visual pass should refine the bottle silhouette and scale, physically convincing glass and liquid, cap/atomizer, label typography, vial variation, pipette and tray details. After that, reduce avoidable draw calls and repeated geometry while preserving the observed Android frame cadence. Physical-device visual, thermal, battery, interaction and offline checks remain required before final Block 12 sign-off.
