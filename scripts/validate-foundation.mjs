import { access, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { LAB_PROPS } from "../src/js/features/laboratory/catalog.js";
import { addMixNote, createMixState, getMixTotal } from "../src/js/features/laboratory/mixing/state.js";
import { analyzeComposition, suggestAdjustments } from "../src/js/features/laboratory/analysis/engine.js";
import { buildArchiveBackup, createArchiveCreation, createArchiveVariant, parseArchiveBackup, saveArchiveVersion } from "../src/js/features/archive/model.js";

const requiredFiles = [
  "index.html", "manifest.webmanifest", "sw.js", "assets/icon.svg", "assets/brand-logo.svg",
  "assets/icon-192.png", "assets/icon-512.png",
  "src/css/styles.css", "src/css/design-system.css", "src/css/perfume-library.css", "src/css/laboratory.css",
  "src/js/app.js", "src/js/core/navigation.js", "src/js/core/pwa.js",
  "src/js/features/perfume-library/data.js", "src/js/features/perfume-library/library.js",
  "src/js/features/laboratory/catalog.js", "src/js/features/laboratory/inspector.js", "src/js/features/laboratory/scene.js", "src/js/features/laboratory/render-profile.js", "src/js/features/laboratory/architecture.js", "src/js/features/laboratory/materials.js", "src/js/features/laboratory/environment.js", "src/js/features/laboratory/perfume-assets.js", "src/js/features/laboratory/performance-audit.js",
  "src/js/features/laboratory/mixing/state.js", "src/js/features/laboratory/mixing/draft-storage.js", "src/js/features/laboratory/mixing/panel.js",
  "src/js/features/laboratory/analysis/engine.js", "src/js/features/laboratory/analysis/panel.js",
  "src/js/features/laboratory/evolution/engine.js", "src/js/features/laboratory/evolution/panel.js",
  "src/js/features/archive/model.js", "src/js/features/archive/repository.js", "src/js/features/archive/panel.js",
  "src/js/ui/views.js"
];

const failures = [];
for (const file of requiredFiles) {
  try { await access(resolve(file)); }
  catch { failures.push(`Missing required file: ${file}`); }
}

const packageJson = JSON.parse(await readFile("package.json", "utf8"));
const manifest = JSON.parse(await readFile("manifest.webmanifest", "utf8"));
const html = await readFile("index.html", "utf8");
const sw = await readFile("sw.js", "utf8");
const app = await readFile("src/js/app.js", "utf8");
const scene = await readFile("src/js/features/laboratory/scene.js", "utf8");
const renderProfile = await readFile("src/js/features/laboratory/render-profile.js", "utf8");
const performanceAudit = await readFile("src/js/features/laboratory/performance-audit.js", "utf8");
const architecture = await readFile("src/js/features/laboratory/architecture.js", "utf8");
const materials = await readFile("src/js/features/laboratory/materials.js", "utf8");
const environment = await readFile("src/js/features/laboratory/environment.js", "utf8");
const perfumeAssets = await readFile("src/js/features/laboratory/perfume-assets.js", "utf8");
const mixPanel = await readFile("src/js/features/laboratory/mixing/panel.js", "utf8");
const analysisPanel = await readFile("src/js/features/laboratory/analysis/panel.js", "utf8");
const evolutionPanel = await readFile("src/js/features/laboratory/evolution/panel.js", "utf8");
const evolutionEngine = await readFile("src/js/features/laboratory/evolution/engine.js", "utf8");
const labCss = await readFile("src/css/laboratory.css", "utf8");
const views = await readFile("src/js/ui/views.js", "utf8");
const archivePanel = await readFile("src/js/features/archive/panel.js", "utf8");
const archiveRepository = await readFile("src/js/features/archive/repository.js", "utf8");

if (!packageJson.scripts?.test || !packageJson.scripts?.validate) failures.push("Missing test or validate npm script.");
if (manifest.start_url !== "./" || manifest.scope !== "./") failures.push("PWA paths must be relative for GitHub Pages project sites.");
if (manifest.display !== "standalone") failures.push("PWA must request standalone display mode.");
for (const size of ["192x192", "512x512"]) {
  if (!manifest.icons?.some((icon) => icon.sizes === size && icon.type === "image/png")) failures.push(`PWA manifest is missing a ${size} PNG icon.`);
}
if (!html.includes('rel="manifest"') || !html.includes("apple-touch-icon")) failures.push("PWA manifest or Apple touch icon link is missing.");
if (!manifest.icons?.some((icon) => icon.src === "./assets/brand-logo.svg")) failures.push("Official Perfumería JB logo is missing from PWA icon metadata.");
if (!html.includes('id="app-notice"')) failures.push("Persistent PWA notice container is missing.");
if (!html.includes("./src/js/app.js") || !html.includes("./src/css/design-system.css")) failures.push("Application or design-system entrypoint is missing.");
if (!/shell-v[0-9]+/.test(sw) || !sw.includes("SKIP_WAITING")) failures.push("Versioned service-worker update lifecycle is missing.");
if (!app.includes("loadMixDraft() ?? createMixState()") || !app.includes("saveMixDraft(mixingState.items)")) failures.push("Local creation draft restore/autosave is not wired to the mixing state.");
if (!app.includes("createPwaManager") || !app.includes("check-updates")) failures.push("PWA install/update controls are not wired.");
if (!app.includes("renderLibraryResults") || !app.includes("library-family")) failures.push("Perfume Library filters are not wired.");
if (!html.includes("three@0.187.0") || !html.includes('type="importmap"')) failures.push("Pinned Three.js import map is missing.");
if (!sw.includes("THREE_MODULE_URL") || !sw.includes("THREE_CORE_URL") || !sw.includes("three@0.187.0")) failures.push("Three.js module and core are not handled by the PWA cache.");
if (sw.includes("cache.add(new Request(THREE_MODULE_URL")) failures.push("Three.js CDN files should be cached on first 3D use, not during PWA installation.");
if (!sw.includes("src/js/features/laboratory/scene.js") || !sw.includes("src/css/laboratory.css")) failures.push("3D application modules are missing from the offline shell.");
if (!sw.includes("mixing/state.js") || !sw.includes("mixing/draft-storage.js") || !sw.includes("mixing/panel.js")) failures.push("Virtual mixing modules are missing from the PWA offline shell.");
if (!sw.includes("analysis/engine.js") || !sw.includes("analysis/panel.js")) failures.push("Creative analysis modules are missing from the PWA offline shell.");
if (!app.includes('import("./features/laboratory/scene.js")') || !app.includes("[data-lab-stage]")) failures.push("The 3D scene must be lazy-loaded only in the laboratory view.");
if (!scene.includes("WebGLRenderer") || !scene.includes("Raycaster") || !scene.includes("pointerdown")) failures.push("Interactive 3D renderer or object selection is missing.");
if (!scene.includes("clearSelection") || !scene.includes("resetCamera")) failures.push("3D selection or camera reset controls are missing.");
if (!scene.includes("resolveLaboratoryRenderProfile") || !scene.includes("renderProfile.pixelRatioCap") || !scene.includes("renderer.shadowMap.enabled")) failures.push("Adaptive renderer profile is not connected to the 3D scene.");
if (!renderProfile.includes("mobile-lite") || !renderProfile.includes("mobile-standard") || !renderProfile.includes("desktop-high")) failures.push("Mobile Lite, Mobile Standard and Desktop High render profiles are required.");
if (!scene.includes("createRoomArchitecture(scene, materials)") || !scene.includes("windowGlassMaterial") || !scene.includes("PlaneGeometry(room.width, room.depth)") || !architecture.includes("ATELIER_ARCHITECTURE")) failures.push("Bounded atelier room architecture, window glazing or layout config is missing.");
if (scene.includes("PlaneGeometry(200, 200)")) failures.push("The old infinite laboratory floor must not return.");
if (!scene.includes("createAtelierMaterials") || !scene.includes("materials.counterstone") || !materials.includes("new THREE.CanvasTexture") || !materials.includes("roughnessMap: brassMaps.roughness") || !materials.includes("function createPlasterMaps") || !materials.includes("bumpMap: plasterMaps.bump")) failures.push("Procedural PBR materials and mineral-plaster wall finish are not integrated across the atelier.");
if (!scene.includes("createContactShadowMaterial") || !scene.includes("keyLight.castShadow = renderProfile.shadowsEnabled") || !scene.includes("THREE.PCFSoftShadowMap")) failures.push("Tiered lighting and contact shadow strategy are missing.");
if (!scene.includes("createAtelierEnvironment(renderer, scene") || !environment.includes("new THREE.PMREMGenerator(renderer)") || !environment.includes("scene.environmentIntensity")) failures.push("Procedural environment reflections and atmosphere are missing.");
if (!scene.includes("function updateHoverAt") || !scene.includes("function animateSelectedProp") || !scene.includes("pointerleave") || !scene.includes("stopObjectFocusAnimation")) failures.push("Hover feedback and transient selection animation are missing.");
if (!scene.includes("renderer.toneMappingExposure = renderProfile.exposure") || !scene.includes("scene.environmentIntensity = renderProfile.environmentIntensity") || !scene.includes("stage.dataset.visualTier = renderProfile.id")) failures.push("Tiered final visual finish is not applied to the atelier scene.");
if (!scene.includes("createFlaconGeometry()") || !scene.includes("createRoundedPlateGeometry") || !perfumeAssets.includes("bevelEnabled: true")) failures.push("Premium beveled perfume assets are missing.");
if (!scene.includes("makeMeasurementTexture") || !scene.includes("materials.vesselGlass") || !scene.includes("const inset = new THREE.Mesh")) failures.push("Refined laboratory beaker, glass or organizer equipment is missing.");
if (!scene.includes("function setComposition") || !scene.includes("mixLiquid")) failures.push("3D composition vessel visual is missing.");
if (LAB_PROPS.length !== 8) failures.push("The 3D scene should expose eight selectable props.");
if (!app.includes("addMixNote") || !app.includes("setMixNotePoints") || !app.includes("undoMix") || !app.includes("data-mix-dropzone")) failures.push("Virtual mixing actions are not wired to the application.");
if (!mixPanel.includes("No son porcentajes") || !mixPanel.includes("mix-note-picker") || !mixPanel.includes("data-mix-dropzone")) failures.push("Conceptual point labels, library picker or drop zone are missing.");
if (!labCss.includes(".mix-studio") || !labCss.includes(".mix-range")) failures.push("Virtual mixing responsive styles are missing.");
if (!views.includes("renderCreativeAnalysis(mixingState, analysisDirection)") || !app.includes("updateCreativeAnalysis")) failures.push("Creative analysis panel is not connected to the Laboratory view and state updates.");
if (!sw.includes("evolution/engine.js") || !sw.includes("evolution/panel.js")) failures.push("Evolution simulator modules are missing from the PWA offline shell.");
if (!sw.includes("archive/model.js") || !sw.includes("archive/repository.js") || !sw.includes("archive/panel.js")) failures.push("Creative archive modules are missing from the PWA offline shell.");
const escapedNewlinePrefix = String.fromCharCode(92) + "n  ";
if (!/shell-v28/.test(sw) || !sw.includes("laboratory/performance-audit.js") || sw.includes(escapedNewlinePrefix)) failures.push("Service worker must use shell-v27, precache the performance audit module and keep valid JavaScript source line breaks.");
if (!scene.includes("runPerformanceAudit") || !scene.includes("performanceAuditAbort?.abort()")) failures.push("3D performance audit must be on-demand and abort on scene disposal.");
if (!views.includes('data-action="run-lab-performance-audit"') || !views.includes('id="lab-performance-report"')) failures.push("Local performance audit controls and report output are missing.");
if (!app.includes("formatLabPerformanceReport") || !app.includes("run-lab-performance-audit")) failures.push("Performance report UI is not wired to the local audit.");
if (!performanceAudit.includes("summarizeFrameSamples") || !performanceAudit.includes("p95FrameMs") || !performanceAudit.includes("contextLost")) failures.push("Performance audit must report frame cadence, p95 and WebGL context state.");

if (!views.includes("renderEvolutionSimulator(mixingState, evolutionStage)") || !app.includes("data-evolution-stage") || !app.includes("updateEvolutionSimulator")) failures.push("Evolution simulator is not wired into the Laboratory view and state updates.");
if (!evolutionPanel.includes("No simula volatilidad") || !evolutionEngine.includes("analyzeEvolutionStage")) failures.push("Evolution simulator disclaimer or engine is missing.");
if (!app.includes("createArchiveRepository") || !app.includes("saveCurrentAsVersion") || !app.includes("parseArchiveBackup")) failures.push("Local archive repository, version saving or backup import is not wired.");
if (!app.includes("function requireWorkingComposition()") || !app.includes("saveMixDraft(mixingState.items)") || !app.includes("mixingState = { items: variant.items.map((item) => ({ ...item })), history: [] }")) failures.push("Archive variant selection and restore must synchronize the active working composition and local draft.");
if (!app.includes("renderArchiveQuickSave(getArchiveViewState())") || !app.includes("hasCurrentComposition: mixingState.items.length > 0")) failures.push("Quick-save controls must track the live working composition and prevent empty saves.");
if (!views.includes("renderArchiveView(archiveState)") || !views.includes("renderArchiveQuickSave(archiveState)")) failures.push("Archive screen or laboratory quick-save panel is not connected.");
if (!archiveRepository.includes("indexedDBApi.open") || !archiveRepository.includes("localStorage")) failures.push("Archive needs IndexedDB storage and a localStorage fallback.");
if (!archivePanel.includes("data-restore-version") || !archivePanel.includes('data-action="compare-archive-variants"') || !archivePanel.includes("Exportar todo")) failures.push("Archive history, comparison or backup controls are missing.");
if (!analysisPanel.includes("heurística") || !analysisPanel.includes("no miden compatibilidad molecular")) failures.push("Creative analysis limitations must be visible to the user.");
let sampleMix = createMixState();
sampleMix = addMixNote(sampleMix, "bergamot");
sampleMix = addMixNote(sampleMix, "rose");
if (getMixTotal(sampleMix) !== 100) failures.push("Conceptual mix points must normalize to 100.");
const sampleAnalysis = analyzeComposition(sampleMix);
if (sampleAnalysis.isEmpty || sampleAnalysis.totalPoints !== 100 || sampleAnalysis.referenceCount !== 2) failures.push("Creative analysis must summarize a valid normalized mix.");
if (!Array.isArray(suggestAdjustments(sampleMix, "fresher", 3))) failures.push("Creative advisor must return a suggestion list.");
const archiveVariantMix = addMixNote(sampleMix, "vanilla");
let sampleArchive = createArchiveCreation({ name: "QA archive", items: sampleMix.items, id: "qa-archive", now: "2026-11-25T00:00:00.000Z" });
sampleArchive = createArchiveVariant(sampleArchive, { items: archiveVariantMix.items, id: "qa-archive:B", now: "2026-11-25T00:01:00.000Z" });
sampleArchive = saveArchiveVersion(sampleArchive, "qa-archive:B", sampleMix.items, "QA version", "2026-11-25T00:02:00.000Z");
const archiveRoundTrip = parseArchiveBackup(buildArchiveBackup([sampleArchive]));
if (archiveRoundTrip[0]?.variants.length !== 2 || archiveRoundTrip[0]?.variants[1]?.versions.length !== 2) failures.push("Creative archive variant/version backup round-trip failed.");

if (failures.length) {
  console.error("Foundation validation failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log(`Foundation validation passed: ${requiredFiles.length} files, branded PWA, perfume library, 3D laboratory, mixing, analysis, evolution and local creative archive verified.`);
}
