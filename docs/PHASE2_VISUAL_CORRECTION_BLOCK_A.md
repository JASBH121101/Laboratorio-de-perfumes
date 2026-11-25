# Phase 2 Visual Correction — Block A: Experiment Workspace & Camera

**Status:** In progress  
**Branch:** `feature/phase2-visual-correction-block-a`

## User review findings (Android screenshots, 2026-11-25)

- The premium atelier is visibly improved, but the room dominates the small screen and reads as a mostly empty room when the experiment has no content.
- The camera can orbit outside/behind the room shell, showing exterior wall surfaces and a door rather than the bench.
- Object scale/detail still needs a dedicated model/material refinement pass.

## Correction sequence

### A1 — Frontal camera baseline (implemented in this branch)

- Default camera starts frontal (`theta = 0`) and frames the bench/work area rather than using a diagonal room view.
- General/workbench/bottle presets now use frontal azimuths and tighter targets.
- Orbit is constrained to a limited horizontal arc so users cannot spin around and inspect the exterior back of the room.
- Elevation and zoom are bounded to keep camera movement predictable on touch.
- Manual pointer orbit, pinch zoom, wheel, keyboard, preset transitions and reduced-motion behavior remain supported.

### A2 — Experiment-only presentation (pending)

- Build a clean front-facing experiment stage/workbench presentation.
- Hide or suppress room architecture when the workspace has no experiment content; do not display an empty room as the default empty state.
- Keep a deliberate option to enter the full atelier/environment view.
- Define empty, active composition, selected-object and inspection states.
- Do not remove or silently change composition/archive persistence.

### A3 — Visual asset refinement (pending)

- Review flacon silhouette, glass appearance, liquid, cap, label proportions and text legibility.
- Refine vial, pipette, beaker and organizer silhouettes/details.
- Rework material and lighting only after camera and workspace composition are established.

## Acceptance criteria

- [x] Default framing is frontal and focused on the experiment bench.
- [x] Camera azimuth, elevation and distance are bounded across pointer/touch, pinch, wheel and keyboard.
- [x] Camera presets have frontal targets.
- [ ] Empty-state view does not expose a full empty room; experiment workbench remains visible.
- [ ] Full atelier is accessible as an intentional secondary view.
- [ ] Visual object refinement reviewed on target Android.
- [ ] CI regression checks pass and Android screenshots confirm the corrected framing.

## Safety and scope

This remains a creative concept laboratory. No chemical recipes, real mixing/dosing instructions, manufacturing claims or real-world safety assessment are added. No paid assets, runtime services or new dependencies.
