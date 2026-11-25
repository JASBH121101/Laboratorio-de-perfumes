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
| 3. Architectural Environment | Complete room shell, window/opening, walls, ceiling treatment, floor, doors/trim and spatial depth | **Completed — bounded atelier shell integrated** |
| 4. PBR Material System | Shared materials and locally generated/substantiated texture detail for wood, stone, glass, metal and lacquer | **Completed — procedural PBR library integrated** |
| 5. Advanced Lighting & Shadows | Window key, fill/practicals, contact grounding, selective shadow strategy and profile-based cost | **Completed — tiered lighting and contact shadows integrated** |
| 6. Environment & Atmosphere | Reflection environment, background depth, restrained atmosphere and scene composition | **Completed — local panorama and PMREM reflections integrated** |
| 7. High-Quality Perfume Assets | Signature bottles, caps, labels, glass thickness cues and liquid presentation | **Completed — premium flacon and vial assets integrated** |
| 8. Laboratory Equipment & Props | Refined vials, vessels, pipettes, trays, furniture details and supporting props | **Completed — beaker, pipette and organizer refined** |
| 9. Cinematic Camera System | Default framing, camera presets/transitions, inspection controls and accessibility | **Completed — preset views and reduced-motion-aware transitions integrated** |
| 10. Animation & Interaction Polish | Lightweight object feedback, transitions, controlled motion and reduced-motion behavior | **Completed — hover and selection feedback integrated** |
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


## 10. Block 3 implementation record — Architectural Environment

**Implementation branch:** `feature/phase2-block3-atelier-architecture`

- Added `src/js/features/laboratory/architecture.js` as a dependency-free layout/material palette definition for a compact 11 × 7.8 × 4 unit atelier.
- Replaced the 200 × 200 infinite floor plane with a bounded warm-stone floor sized to the room footprint.
- Built a rear wall with a real door opening, split left wall geometry around a divided window opening, and a continuous right wall.
- Added window glass, frame, mullions, sill, daylight backing panel, door leaf/casing/handle, timber skirting, rear display-wall slats, right-wall inset panels, upper beams, short ceiling canopy slats and a front threshold.
- Kept the front open so the existing elevated camera can still inspect the main workbench and selectable objects.
- Reused local Three.js geometry and materials only; no new runtime dependency, paid service or external asset was introduced.
- Added layout tests for room dimensions and opening bounds, static foundation checks, CI syntax checking and PWA precache entry. App-shell cache is now `shell-v11`.

### Block 3 acceptance record

- [x] Bounded room footprint replaces the infinite ground plane.
- [x] Rear wall and side walls establish a coherent room shell.
- [x] Left-side window opening has glazing, frame, sill and mullions.
- [x] Rear door opening has leaf, casing and handle detailing.
- [x] Rear/side wall paneling, skirting and upper ceiling structure add architectural depth.
- [x] The front remains open for visibility and interaction.
- [x] Architecture layout, foundation validation, CI syntax check and PWA cache registration added.
- [ ] Material-level realism and texture system — Block 4.
- [ ] Lighting/reflections and contact shadow tuning — Blocks 5–6.
- [ ] Physical Android visual/FPS verification — Block 12.


## 11. Block 4 implementation record — PBR Material System

**Implementation branch:** `feature/phase2-block4-pbr-material-system`

- Added `src/js/features/laboratory/materials.js`, a local procedural material factory using browser CanvasTexture generation.
- Created walnut grain color/bump maps, travertine-like stone color/bump maps and brushed brass color/roughness maps.
- Added shared PBR presets for walnut, dark walnut, stone, counter stone, brushed brass, wall, lacquer, bottle glass and window glass.
- Applied shared materials to room architecture, floor, workbench top/trim, table legs, shelving, door/window trim, perfume bottle glass/caps, vial caps, tray and pipette details.
- Texture dimensions are 256 px on mobile and 512 px on desktop; anisotropy is capped by both the selected rendering profile and actual GPU maximum.
- Existing local scene cleanup disposes geometry, material and texture resources when leaving the Laboratory view.
- No external textures/HDRIs, network asset packs, paid resources or runtime packages were added.
- Added PBR static regression tests, foundation checks, CI syntax checks and PWA precaching. Cache is now `shell-v12`.

### Block 4 acceptance record

- [x] Local walnut, stone and brushed-brass color textures generated at runtime.
- [x] Bump/roughness maps add controlled surface variation.
- [x] Shared material presets reduce duplicated material definitions.
- [x] Materials are integrated across architecture, furniture and selected props.
- [x] Texture size and anisotropy adapt to the active graphics profile and device capability.
- [x] No external runtime assets or paid dependencies.
- [x] Static material regression checks, foundation validation and CI syntax coverage added.
- [x] PWA cache incremented and the material module precached.
- [ ] Physical-device visual comparison and tuning — Block 12.
- [ ] Environment reflections, lighting and shadow strategy — Blocks 5–6.


## 12. Block 5 implementation record — Advanced Lighting & Shadows

**Implementation branch:** `feature/phase2-block5-lighting-contact-shadows`

- Rebalanced the ambient, warm directional key, cool directional fill and rear rim light for a readable window-led lighting direction.
- Added two restrained warm practical point lights near the shelving and workbench.
- Restricted PCF soft shadow maps to Desktop High; Mobile Lite and Mobile Standard keep dynamic shadow maps disabled.
- Added low-cost radial contact-shadow decals under all eight selectable props and the four workbench legs. The decal texture is generated locally with CanvasTexture and uses transparent, depth-write-disabled material.
- Repositioned the signature bottle, four vials, beaker, pipette and reference tray so their lower geometry aligns with the workbench top rather than floating above it.
- Added tests for profile-specific shadow policy, window-led lighting, prop heights and contact-shadow coverage.
- Incremented the service-worker cache to `shell-v13`; no paid resources, remote textures or dependencies were added.

### Block 5 acceptance record

- [x] Warm window-aligned key light, cool fill, rear rim and warm local practicals.
- [x] Mobile tiers avoid real-time shadow-map cost.
- [x] Desktop High uses PCF soft shadow maps with bounded shadow camera.
- [x] Procedural radial contact shadows support mobile and desktop.
- [x] All eight workbench props have contact-shadow placement.
- [x] Workbench legs have floor contact-shadow placement.
- [x] Main bottle, vials, beaker, pipette and tray grounded to the workbench.
- [x] Tests, foundation validation, and updated PWA cache entry added.
- [ ] Environment reflections and atmospheric depth — Block 6.
- [ ] Physical device brightness/performance/thermal comparison — Block 12.


## 13. Block 6 implementation record — Environment & Atmosphere

**Implementation branch:** `feature/phase2-block6-environment-reflections`

- Added `src/js/features/laboratory/environment.js` to generate a compact equirectangular panorama procedurally in a local canvas.
- Added broad warm and cool light cards to the panorama so glass and brushed metal receive coherent reflection cues.
- Converts the panorama into a PMREM reflection environment once per 3D mount, then assigns it to `scene.environment`; the same panorama supplies a restrained background for the open-front room.
- Mobile creates a 256 px source panorama; desktop creates a 512 px source panorama.
- Added low-density scene fog and controlled `environmentIntensity` / `backgroundIntensity` values for spatial depth without adding post-processing.
- Environment render target and source texture are released when the Laboratory scene is disposed. PMREM generation has a local panorama fallback.
- Added tests for local generation, equirectangular mapping, PMREM fallback, adaptive resolution and GPU resource disposal.
- Added the module to the PWA cache, advanced to `shell-v14`, and added static foundation + CI syntax validation.

### Block 6 acceptance record

- [x] Local environment panorama; no downloaded HDRI or remote service.
- [x] Equirectangular mapping and PMREM reflection map.
- [x] Same panorama supplies restrained background context.
- [x] Mobile/desktop source resolution scales with render profile.
- [x] Environment intensity, background intensity and fog establish controlled atmosphere.
- [x] Safe panorama fallback if PMREM generation fails.
- [x] PMREM render target and canvas texture released on scene disposal.
- [x] Tests, foundation validation, CI syntax and PWA precache updated.
- [ ] Actual glass/metal appearance tuning on target Android hardware — Block 12.
- [ ] Perfume bottle geometry/labels/glass thickness refinement — Block 7.


## 14. Block 7 implementation record — High-Quality Perfume Assets

**Implementation branch:** `feature/phase2-block7-premium-perfume-assets`

- Added `src/js/features/laboratory/perfume-assets.js` with reusable rounded-plate geometry and a custom beveled flacon silhouette.
- Replaced the main box-shaped bottle with curved shoulders, an integrated neck, rounded/beveled edges and a wider glass body.
- Added an internal colored-liquid volume and visible dip tube.
- Rebuilt the main cap as a dark-walnut cylinder with brushed-brass lower ring, upper medallion and eight fine vertical accent grooves.
- Added a layered front label: brass rounded backing, dark inset plate and an independent typography texture.
- Refined reference vial geometry with more cylinder segments, neck collars, dark caps, brass accent rings and layered labels.
- All geometry is generated locally with Three.js. New geometry and materials are included in the existing scene-disposal lifecycle.
- Added asset regression tests, foundation validation, CI syntax checking and PWA precache entry. Cache is now `shell-v15`.

### Block 7 acceptance record

- [x] Main bottle no longer uses the plain rectangular box silhouette.
- [x] Custom curved/bisected flacon geometry with beveled edges.
- [x] Liquid volume and internal dip tube visible as conceptual visual elements.
- [x] Layered label plate and premium cap details.
- [x] Refined glass vial/cap/label geometry.
- [x] Reusable rounded plate geometry.
- [x] Tests, structure validator, CI syntax check and PWA cache updated.
- [ ] Real-world reference comparison for glass/refraction and physical scale — Block 12.
- [ ] Additional laboratory equipment and furniture details — Block 8.


## 15. Block 8 implementation record — Laboratory Equipment & Props

**Implementation branch:** `feature/phase2-block8-laboratory-props`

- Added a dedicated transparent physical-glass preset for reusable lab vessels.
- Rebuilt the exploration beaker with a hollow 40-segment glass cylinder, thick base, rolled rim, foot ring and local measurement-scale texture.
- Rebuilt the pipette with a tapered precision tip, rounded plum bulb, three brass graduation bands and a dark end stop.
- Rebuilt the reference tray as a rounded/beveled organizer with a burgundy inset, brass rails, two dividers and small corner rivets.
- Aligned the tray base to the workbench surface.
- Preserved all eight selectable props and their IDs, descriptions, selection rings and inspector behavior.
- Added equipment regression tests, foundation checks, and incremented the PWA cache to `shell-v16`.

### Block 8 acceptance record

- [x] Beaker hollow wall, thick base, rolled glass rim and measurement graphic.
- [x] Pipette taper, bulb, graduation bands and end stop.
- [x] Rounded tray base, inset, divider compartments, brass rails and rivets.
- [x] Dedicated vessel-glass material preset.
- [x] Main 8 props remain in the selectable scene registry.
- [x] Equipment tests and PWA cache version updated.
- [ ] Physical Android inspection of label legibility and glass visibility — Block 12.


## 16. Block 9 implementation record — Cinematic Camera System

**Implementation branch:** `feature/phase2-block9-cinematic-camera`

- Exposed the scene's three camera presets in the stage UI as accessible actions: General, Frasco and Mesa.
- Recalibrated the bottle close-up to target the central concept flacon rather than the left-side reference vial; workbench framing now prioritizes the active vessel and surrounding tools.
- Preset transitions interpolate orbit, elevation, distance and camera target with a short smoothstep easing curve; rendering remains event-driven and there is no idle animation loop.
- Touch/pointer orbit, pinch zoom, wheel and keyboard navigation interrupt an in-progress preset transition immediately.
- The reduced-motion preference skips animation and applies the destination frame directly.
- Preset controls expose a visible selected state and update `aria-pressed`; Recentrar returns to General.
- Advanced the PWA app-shell cache to `shell-v18` so updated app, view and style assets are fetched.
- Added regression tests for preset framing, transition easing/cancellation, reduced motion, UI wiring, active state and keyboard focus.

### Block 9 acceptance record

- [x] General, Frasco and Mesa camera presets available from the stage.
- [x] Bottle preset frames the actual central bottle.
- [x] Workbench preset frames the active vessel and work surface.
- [x] Eased transitions with no continuous idle rendering.
- [x] Manual pointer, wheel and keyboard input interrupts preset transitions.
- [x] Reduced-motion preference disables animated transitions.
- [x] Selected state exposed visually and through `aria-pressed`.
- [x] PWA cache, test coverage and static foundation validation updated.
- [ ] Physical Android framing and legibility verification — Block 12.


## 17. Block 10 implementation record — Animation & Interaction Polish

**Implementation branch:** `feature/phase2-block10-interaction-polish`

- Added desktop mouse/pen hover hit-testing for the eight inspectable props. Hover changes the pointer cursor and reveals a subtle, low-opacity selection ring; pointer leave clears the state.
- Selected props use a short 170 ms ease-out scale pulse, capped at 2.8%, while the previous selection returns to its original scale.
- The focus animation updates only the previously selected and newly selected object, avoiding a full-scene animation loop.
- Hover and selected ring states remain separate; the active selection keeps stronger visual emphasis than hover.
- Reduced-motion preference applies the selected scale immediately without animating.
- A new selection cancels any in-flight scale pulse; scene disposal cancels pending animation frames and removes the pointer-leave listener.
- Existing touch tap selection, object IDs, selection events, inspector updates, touch orbit/pinch and camera transitions remain intact.
- Advanced the service-worker app-shell cache to `shell-v19`; added regression tests and foundation validation for hover, selection pulse, reduced motion and cleanup.

### Block 10 acceptance record

- [x] Mouse/pen hover hit-testing identifies interactive objects.
- [x] Hover adds restrained cursor and ring feedback.
- [x] Selection ring remains visually stronger than hover feedback.
- [x] Selected object receives a brief 2.8% scale pulse; previous object returns to base scale.
- [x] Animation is interrupted cleanly when selection changes.
- [x] Reduced-motion preference applies state without animation.
- [x] Pending animation frames and pointer listener are cleaned up on dispose.
- [x] Touch selection, inspector contract and camera controls preserved.
- [x] Regression tests, foundation checks and PWA cache updated.
- [ ] Physical Android interaction/legibility and FPS verification — Block 12.
