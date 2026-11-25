# Phase 2 — Premium Realistic 3D Atelier
## Block 1 — Visual Benchmark & Art Direction

**Status:** design baseline documented; implementation scope approved for Phase 2  
**Baseline commit:** `0ba9dc2101fdbbc7738ac219f9610ed851fabd5a`  
**Scope:** visual direction, scene audit, quality targets and acceptance criteria. This block does not replace the existing 3D scene.

## 1. Product direction

Create a believable, premium perfumery atelier that feels like a small physical place rather than a collection of floating geometric props. The visual ambition is cinematic environmental realism: convincing scale, layered architecture, tactile materials, controlled reflections, natural/warm lighting and carefully framed composition.

The requested GTA VI inspiration is interpreted only as a quality reference for environmental presentation, lighting, materials, atmosphere and visual density. This project will not copy GTA VI assets, environments, logos, proprietary shaders or game content, and this mobile web app will not claim AAA game parity.

The environment remains a creative concept laboratory. Props are visual representations; nothing in the scene measures, mixes, dispenses or validates real chemical materials.

## 2. Current scene audit

The audit is based on `src/js/features/laboratory/scene.js`, `catalog.js`, `laboratory.css`, `index.html` and `sw.js` on the baseline commit.

| Area | Current implementation | Visual consequence | Phase 2 direction |
|---|---|---|---|
| Room | Rear wall, two shelves, one large floor plane and a workbench | Incomplete room; open edges and weak spatial context | A coherent room shell with side walls, ceiling treatment, window/light source, trim and a designed back wall |
| Furniture | Large box meshes with limited bevels | Hard, toy-like silhouettes | More believable proportions, softened edges, layered joinery and consistent scale |
| Bottle | Box-shaped body, simple liquid insert, cylinder neck/cap | Generic silhouette and limited glass depth | Distinctive bottle geometry, bevels, glass thickness cues, liquid meniscus and premium cap/label detailing |
| Vials and tools | Cylinders, boxes and simple primitives | Repeated, low-detail shapes | Purposeful silhouettes, labels, closures, trays and varied material response |
| Materials | Mostly flat `MeshStandardMaterial` / `MeshPhysicalMaterial` colors | Little micro-surface detail or material separation | PBR-oriented material presets for walnut, stone, brushed brass, ceramic, glass and lacquer |
| Lighting | Hemisphere, directional, fill and point lights | General illumination but limited environmental bounce/reflection cues | Natural window key, restrained warm practicals, controlled fill and subtle rim separation |
| Shadows/reflections | No real-time shadow map; no environment map visible in scene setup | Props feel less grounded; glass/metal lack environmental context | Contact/baked shadow approach first; environment reflections and selective shadow quality by device tier |
| Camera | Single perspective orbit camera; event-driven rendering | Functional inspection, but limited cinematic composition | Designed default framing plus resettable, accessible inspection camera |
| Rendering | Three.js 0.187.0; ACES tone mapping; sRGB output; capped pixel ratio | Good foundation, but rendering and scene quality are not yet a coherent quality system | Explicit renderer profile, quality tiers and measurable resource budgets |
| PWA/runtime | Three.js module is lazy-loaded and cached by the service worker on first successful 3D use | General app remains lighter; first 3D use requires network | Preserve lazy loading, pin dependencies, bundle/copy only required free assets and version the app-shell cache correctly |

### Existing mobile constraints to preserve

- Three.js is currently imported only when the Laboratory route is opened.
- Renderer pixel ratio is capped at 1.25 on mobile and 1.5 elsewhere.
- Real-time shadow maps are not enabled in the baseline.
- The scene renders on interaction/resize rather than running an unconditional animation loop.
- Existing touch orbit, pinch zoom, tap selection, keyboard controls, composition vessel updates and object inspectors must continue to work.
- The scene must clean up geometry, materials, listeners and WebGL resources when disposed.

These are important strengths, not defects to remove in pursuit of visual quality.

## 3. Art direction

### Visual identity

Retain JB Atelier's burgundy/plum and champagne-gold identity, but introduce a restrained natural-material palette so the room does not read as a flat purple stage.

| Role | Direction | Reference tone |
|---|---|---|
| Deep structure | Charcoal plum / smoked graphite | `#211A21` |
| Cabinetry | Dark walnut with visible grain | `#49362F` |
| Stone surfaces | Warm travertine / limestone | `#A99A88` |
| Metal details | Brushed champagne brass, not mirror gold | `#B9915F` |
| Upholstery/accent | Muted oxblood / plum lacquer | `#563541` |
| Glass | Cool neutral glass with warm edge highlights | `#C6D8D4` |
| Liquid | Transparent amber, rose or pale-gold tint according to conceptual family | Per composition |
| Light accents | Warm ivory, with a restrained cool daylight contrast | `#F0DCC0` / `#B9C8D4` |

Color is not a substitute for material definition. Wood must read as wood through grain direction and roughness; stone through subtle variation; metal through directional highlights; glass through edge reflections and thickness cues.

### Spatial composition

The environment should read as a compact, premium perfumery workshop:

1. **Foreground:** main work surface, signature bottle and the active conceptual vessel. Keep interaction targets clear.
2. **Midground:** selected reference vials, pipette, tray and a small number of supporting tools.
3. **Background:** complete back wall, shelving with restrained bottle silhouettes, cabinetry and architectural trim.
4. **Side depth:** a window or illuminated opening to establish a believable key-light direction; side-wall or doorway details should frame, not crowd, the workbench.
5. **Floor/ceiling:** coherent room boundaries and contact with furniture; avoid an infinite floor plane that exposes the scene as a miniature stage.

The camera's default composition must keep the main bottle, mixing vessel and at least the principal reference objects visible on a narrow Android viewport. Users may orbit and zoom for inspection.

### Material treatment

Use physically based rendering as an authoring model, with deliberate roughness/metalness values and consistent texture scale. Avoid using metalness to make every dark object look premium.

- Walnut: non-metallic, medium/high roughness, subtle grain and restrained color variation.
- Travertine/limestone: non-metallic, high roughness, low-contrast mottling or procedural variation.
- Brushed brass: metallic, medium/low roughness, directional brushed response; avoid a flat yellow surface.
- Lacquer/paint: non-metallic, smoother clear-coated finish with controlled highlights.
- Bottle glass: physical/transparent treatment with thickness and environment cues; avoid stacking transparency and opacity settings without testing sorting and mobile performance.
- Liquid: distinct from glass, slightly tinted, with a visible surface line; never imply a real formula or measured volume.
- Labels: crisp typography, restrained contrast and consistent scale; textures should be generated locally where practical.

### Lighting and atmosphere

The primary light should have a visible reason to exist: a window or softbox-like opening. Add warm practical lighting near shelves/workbench for atmosphere. Use a restrained cool fill to separate glass silhouettes from the dark room. Use a subtle rim light only where it contributes to object readability.

Prioritize contact grounding and reflection cues over multiple expensive dynamic lights. Ambient occlusion, bloom and depth of field are optional polish, not required defaults. Avoid excessive bloom, colored neon, fog density or cinematic blur that makes labels and controls hard to inspect.

## 4. Camera and interaction quality

- Keep touch orbit, pinch zoom, tap-to-inspect and keyboard support.
- Provide a composed default view and predictable reset behavior.
- Avoid motion that continues when the user is idle.
- Preserve clear focus and hit targets; selected props must remain identifiable.
- Any animation introduced later must respect `prefers-reduced-motion` and avoid interfering with touch gestures.
- Keep the camera's clipping planes and framing appropriate to the room scale; avoid props disappearing while orbiting.

## 5. Android-first quality tiers

The scene must adapt to the actual browser/device capabilities; do not assume all Android phones have the same GPU or thermal headroom. Initial tiers are targets to validate, not claims of achieved FPS.

| Tier | Intended device | Rendering policy | Target |
|---|---|---|---|
| Mobile Lite | constrained/mobile GPU or reduced-power mode | pixel ratio around 1.0; no real-time shadows; minimal post-processing; optimized geometry/material count | stable interaction, target at least 30 FPS where the device permits |
| Mobile Standard | capable Android GPU | pixel ratio capped at 1.25; selective contact/shadow treatment; minimal post-processing | aim for 45–60 FPS without sustained thermal degradation |
| Desktop High | desktop/laptop browser | pixel ratio capped at 1.5; optional higher-quality shadows/reflections and subtle post-processing | aim for 60 FPS on suitable hardware |

Adaptive tier selection must fail safely toward Lite. It must not rely on a paid API, remote account, analytics service or GPU benchmark endpoint. User-selectable quality can be added if automatic selection is unreliable.

### Performance budgets to measure in later blocks

- No unconditional render loop while the user is idle.
- Keep total draw calls and material count low; merge static architectural surfaces where safe.
- Prefer shared geometry/materials for repeated props.
- Start with locally generated/simple textures; keep texture dimensions modest and use compressed assets only when their decode cost and browser support are understood.
- Avoid downloading large HDRIs or GLB packs from third-party services at runtime.
- Keep all visual dependencies pinned and compatible with the existing offline strategy.
- Profile frame time, memory, asset load size and thermal behavior on real Android hardware before certifying a tier.

## 6. Asset, license and cost policy

- No paid asset packs, subscriptions, hosted rendering services or paid APIs.
- Prefer original procedural geometry/materials and self-created local textures.
- Any future external model, texture or HDRI must have a documented source, license and attribution requirements before inclusion.
- Do not include GTA VI screenshots, ripped models, textures, audio, logos or proprietary game assets in the repository.
- Do not add a new runtime dependency unless its need, size, license, offline behavior and Android cost are justified.
- Keep Three.js pinned to the current 0.187.0 revision unless a separate compatibility decision and regression plan approve an upgrade.

## 7. Phase 2 roadmap — all blocks

| Block | Scope | Status |
|---|---|---|
| 1. Visual Benchmark & Art Direction | Audit baseline, define cinematic atelier direction, palette, materials, camera, device tiers and acceptance criteria | **Completed — this document** |
| 2. Rendering Pipeline Upgrade | Renderer profiles, color management audit, quality selection, capability fallbacks and rendering configuration | **Completed — adaptive profiles integrated** |
| 3. Architectural Environment | Complete room shell, window/opening, walls, ceiling treatment, floor, doors/trim and spatial depth | Pending |
| 4. PBR Material System | Shared materials and locally generated/substantiated texture detail for wood, stone, glass, metal and lacquer | Pending |
| 5. Advanced Lighting & Shadows | Window key, fill/practicals, contact grounding, selective shadow strategy and profile-based cost | Pending |
| 6. Environment & Atmosphere | Reflection environment, background depth, restrained atmosphere and scene composition | Pending |
| 7. High-Quality Perfume Assets | Signature bottles, caps, labels, glass thickness cues and liquid presentation | Pending |
| 8. Laboratory Equipment & Props | Refined vials, vessels, pipettes, trays, furniture details and supporting props | Pending |
| 9. Cinematic Camera System | Default framing, camera presets/transitions, inspection controls and accessibility | Pending |
| 10. Animation & Interaction Polish | Lightweight object feedback, transitions, controlled motion and reduced-motion behavior | Pending |
| 11. Post-Processing & Final Visual Effects | Tier-gated subtle effects, exposure/color grading and visual regression checks | Pending |
| 12. Android Performance & Visual Certification | Device profiling, quality-tier tuning, memory/load/FPS checks and final regression certification | Pending |

## 8. Block 1 acceptance record

- [x] Current scene implementation and rendering constraints inspected.
- [x] Visual identity and target environment defined.
- [x] Material, lighting, camera and composition principles documented.
- [x] Mobile quality tiers and measurable profiling targets defined.
- [x] Free/local asset policy and intellectual-property boundaries documented.
- [x] All twelve Phase 2 blocks listed with explicit status.
- [ ] Room, materials, lighting and props rebuilt — deferred to Blocks 3–8; renderer profile integration is recorded under Block 2.
- [ ] Android performance certified — reserved for Block 12.

**Exit condition:** Block 1 is complete when the art-direction specification and full roadmap are committed, automated documentation checks pass, and the Phase 2 implementation can proceed without unresolved visual or cost-policy decisions.


## 9. Block 2 implementation record — Rendering Pipeline Upgrade

**Implementation branch:** `feature/phase2-block2-rendering-pipeline`

- Added `src/js/features/laboratory/render-profile.js` as a dependency-free profile selector.
- Integrated profile selection into the existing Three.js scene using available `navigator.deviceMemory`, `navigator.hardwareConcurrency` and `renderer.capabilities.maxTextureSize`.
- Unknown or constrained Android capabilities fall back to Mobile Lite. Capable Android devices can select Mobile Standard; Desktop High requires stronger reported memory, CPU and texture capability.
- The renderer consumes the profile's pixel-ratio cap and shadow/post-processing policy. Current profiles keep real-time shadows and post-processing disabled until later blocks establish and measure their value.
- Existing ACES filmic tone mapping, sRGB output, lazy Three.js import, touch controls, on-demand rendering and disposal lifecycle remain in place.
- Added unit coverage for unknown hardware, constrained Android, capable Android, limited GPU capability and desktop selection.
- Added the module to the PWA app-shell cache, incremented the cache to `shell-v10`, and added CI syntax/structure checks.

### Block 2 acceptance record

- [x] Three named quality profiles with immutable configuration.
- [x] Conservative fallback when Android hardware data is missing or constrained.
- [x] Actual WebGL texture limit participates in final profile selection.
- [x] Pixel ratio is selected from the active profile.
- [x] Existing color management and event-driven rendering are preserved.
- [x] Unit tests, foundation validation and CI syntax coverage added.
- [x] PWA cache updated to `shell-v10` with the new module precached.
- [ ] Physical-device FPS, battery and thermal profiling — reserved for Block 12.
