import { access, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { PERFUME_ITEMS } from "../src/js/features/perfume-library/data.js";
import { addMixNote, createMixState, getMixTotal } from "../src/js/features/laboratory/mixing/state.js";
import { analyzeComposition } from "../src/js/features/laboratory/analysis/engine.js";
import { analyzeOriginality } from "../src/js/features/laboratory/originality/engine.js";
import { compareCompositions } from "../src/js/features/laboratory/comparison/engine.js";
import { analyzePersonalSignature } from "../src/js/features/laboratory/signature-history/engine.js";
import { buildProfessionalReport } from "../src/js/features/laboratory/professional-reports/engine.js";
import { renderAnalyticsDashboard } from "../src/js/features/laboratory/analytics/dashboard.js";
import { buildArchiveBackup, createArchiveCreation, createArchiveVariant, parseArchiveBackup } from "../src/js/features/archive/model.js";

const requiredFiles = [
  "index.html", "manifest.webmanifest", "sw.js", "assets/icon.svg", "assets/brand-logo.svg",
  "assets/icon-192.png", "assets/icon-512.png",
  "src/css/styles.css", "src/css/design-system.css", "src/css/perfume-library.css",
  "src/css/laboratory.css", "src/css/analytics.css",
  "src/js/app.js", "src/js/core/navigation.js", "src/js/core/pwa.js",
  "src/js/features/perfume-library/data.js", "src/js/features/perfume-library/library.js",
  "src/js/features/laboratory/mixing/state.js", "src/js/features/laboratory/mixing/draft-storage.js",
  "src/js/features/laboratory/mixing/panel.js",
  "src/js/features/laboratory/analysis/engine.js", "src/js/features/laboratory/analysis/panel.js",
  "src/js/features/laboratory/analytics/dashboard.js",
  "src/js/features/laboratory/originality/engine.js", "src/js/features/laboratory/originality/panel.js",
  "src/js/features/laboratory/comparison/engine.js", "src/js/features/laboratory/comparison/panel.js",
  "src/js/features/laboratory/signature-history/engine.js", "src/js/features/laboratory/signature-history/panel.js",
  "src/js/features/laboratory/sensory-experiments/model.js", "src/js/features/laboratory/sensory-experiments/panel.js",
  "src/js/features/laboratory/professional-reports/engine.js", "src/js/features/laboratory/professional-reports/panel.js",
  "src/js/features/laboratory/evolution/engine.js", "src/js/features/laboratory/evolution/panel.js",
  "src/js/features/archive/model.js", "src/js/features/archive/repository.js", "src/js/features/archive/panel.js",
  "src/js/ui/views.js", "tests/pwa.test.mjs", "tests/originality.test.mjs", "tests/dashboard.test.mjs", "tests/formulation-ux.test.mjs", "tests/analytical-comparison.test.mjs", "tests/signature-history.test.mjs", "tests/sensory-experiments.test.mjs", "tests/professional-reports.test.mjs"
];

const failures = [];
for (const file of requiredFiles) {
  try { await access(resolve(file)); }
  catch { failures.push(`Missing required file: ${file}`); }
}

const [packageJson, manifest, html, sw, app, views, pwa, mixPanel, analysisPanel, originalityPanel, dashboardCss] = await Promise.all([
  readFile("package.json", "utf8").then(JSON.parse),
  readFile("manifest.webmanifest", "utf8").then(JSON.parse),
  readFile("index.html", "utf8"),
  readFile("sw.js", "utf8"),
  readFile("src/js/app.js", "utf8"),
  readFile("src/js/ui/views.js", "utf8"),
  readFile("src/js/core/pwa.js", "utf8"),
  readFile("src/js/features/laboratory/mixing/panel.js", "utf8"),
  readFile("src/js/features/laboratory/analysis/panel.js", "utf8"),
  readFile("src/js/features/laboratory/originality/panel.js", "utf8"),
  readFile("src/css/analytics.css", "utf8")
]);

if (!packageJson.scripts?.test || !packageJson.scripts?.validate) failures.push("Missing test or validate npm script.");
if (manifest.start_url !== "./" || manifest.scope !== "./" || manifest.display !== "standalone") failures.push("PWA paths or standalone display mode are invalid.");
for (const size of ["192x192", "512x512"]) {
  if (!manifest.icons?.some((icon) => icon.sizes === size && icon.type === "image/png")) failures.push(`PWA manifest is missing a ${size} PNG icon.`);
}
if (!html.includes('rel="manifest"') || !html.includes('id="app-notice"')) failures.push("PWA manifest or update notice container is missing.");
if (!html.includes("./src/js/app.js") || !html.includes("./src/css/analytics.css")) failures.push("Application or analytical stylesheet entrypoint is missing.");
if (/importmap|three\.js|three@/i.test(html)) failures.push("The HTML must not load a Three.js import map or runtime.");
if (!/shell-v34/.test(sw) || !sw.includes("SKIP_WAITING")) failures.push("PWA shell must be versioned at shell-v34 and support controlled activation.");
if (/three|THREE_|scene\.js|render-profile|performance-audit/i.test(sw)) failures.push("The PWA shell must not cache 3D modules or external 3D assets.");
for (const path of ["mixing/state.js", "mixing/draft-storage.js", "mixing/panel.js", "analysis/engine.js", "analysis/panel.js", "analytics/dashboard.js", "originality/engine.js", "originality/panel.js", "evolution/engine.js", "evolution/panel.js", "comparison/engine.js", "comparison/panel.js", "signature-history/engine.js", "signature-history/panel.js", "sensory-experiments/model.js", "sensory-experiments/panel.js", "professional-reports/engine.js", "professional-reports/panel.js", "archive/model.js", "archive/repository.js", "archive/panel.js"]) {
  if (!sw.includes(path)) failures.push(`PWA shell is missing required module: ${path}`);
}
if (!app.includes("loadMixDraft() ?? createMixState()") || !app.includes("saveMixDraft(mixingState.items)")) failures.push("Local draft restore/autosave is not wired.");
if (!app.includes("createPwaManager") || !app.includes("check-updates") || !app.includes("dismissUpdateNotice")) failures.push("PWA manual update and dismissal controls are not wired.");
if (!app.includes("renderOriginalityAnalysis") || !app.includes("updateOriginalityAnalysis")) failures.push("Originality analysis is not refreshed with composition/archive updates.");
if (/Three|three|WebGL|labController|mountLabScene|camera-preset|zoom-camera|performance-audit/i.test(app)) failures.push("The active application runtime still contains 3D renderer or camera wiring.");
if (/Three|three|WebGL|lab-stage|lab-canvas|camera-preset|zoom-camera/i.test(views)) failures.push("The active views still contain 3D interface elements.");
if (pwa.includes('addEventListener("visibilitychange"') || pwa.includes('addEventListener("focus"')) failures.push("Automatic PWA checks must not run on every focus or visibility interaction.");
if (!pwa.includes("DISMISSED_UPDATE_KEY") || !pwa.includes("dismissUpdateNotice")) failures.push("PWA must persist dismissal of an already-announced waiting update.");
if (!mixPanel.includes("No son porcentajes") || !mixPanel.includes("data-mix-weight")) failures.push("Composition weights must remain explicitly conceptual and editable.");
if (!app.includes("mix-picker-search") || !app.includes("updateMixPickerResults") || !app.includes("toggle-mix-picker")) failures.push("The inline formulation finder is not wired to search, filters and expansion.");
if (!mixPanel.includes("mix-picker-family") || !mixPanel.includes("mix-picker-kind") || !mixPanel.includes("mix-picker-role") || !mixPanel.includes("data-add-to-mix")) failures.push("The formulation picker must expose family, type, role and direct-add controls.");
if (!mixPanel.includes('type="number"') || !mixPanel.includes('type="range"') || !mixPanel.includes("mix-weight-hint")) failures.push("Formulation weights must expose both slider and precise numeric editing.");

if (!analysisPanel.includes("renderFamilyDonut") || !analysisPanel.includes("renderProfileRadar")) failures.push("Family and sensory charts are missing.");
if (!app.includes("compareSavedCompositions") || !views.includes("renderAnalyticalComparison")) failures.push("Saved composition comparison is not wired into the archive view.");
const comparison = compareCompositions(
  { name: "Validator A", items: [{ id: "bergamot", points: 50 }, { id: "rose", points: 50 }] },
  { name: "Validator B", items: [{ id: "bergamot", points: 25 }, { id: "vanilla", points: 75 }] }
);
if (comparison.similarity !== 25 || comparison.difference !== 75 || !comparison.familyRows.length) failures.push("Analytical comparison did not calculate structural overlap and family differences.");

if (!app.includes("renderPersonalSignatureHistory") || !views.includes("renderPersonalSignatureHistory") || !dashboardCss.includes(".personal-signature-history")) failures.push("Personal signature history is not wired into the dashboard with responsive styling.");
if (!app.includes("saveSensoryExperimentFromForm") || !views.includes("renderSensoryExperiments") || !sw.includes("sensory-experiments/model.js") || !sw.includes("sensory-experiments/panel.js")) failures.push("Sensory experiment creation, project view or offline modules are not wired.");
if (!app.includes("archiveRepository.listExperiments()") || !app.includes("archiveRepository.putExperiment(experiment)") || !app.includes("archiveRepository.removeExperimentsForCreation(id)")) failures.push("Sensory records are not fully persisted or cleaned with their source creation.");
if (!app.includes("buildProfessionalReport") || !app.includes("toProfessionalReportCsv") || !views.includes("renderProfessionalReports") || !dashboardCss.includes(".professional-reports")) failures.push("Professional report generation, exports or responsive report styles are not wired.");
if (!originalityPanel.includes("ÍNDICE DE DIFERENCIACIÓN INTERNA") || !originalityPanel.includes("No consulta catálogos comerciales")) failures.push("Originality panel must explain its local comparison boundary.");
if (!dashboardCss.includes(".dashboard-kpis") || !dashboardCss.includes(".originality-metrics")) failures.push("Responsive analytics and originality styles are missing.");

if (PERFUME_ITEMS.length < 50) failures.push("The educational perfume reference library is unexpectedly incomplete.");
let mix = addMixNote(createMixState(), "bergamot");
mix = addMixNote(mix, "rose");
if (getMixTotal(mix) !== 100) failures.push("Conceptual mixing state must normalize to 100 creative points.");
const analysis = analyzeComposition(mix);
if (analysis.isEmpty || analysis.totalPoints !== 100 || !analysis.families.length) failures.push("Creative analysis does not reflect the active composition.");

const first = createArchiveCreation({ name: "Validator baseline", items: mix.items });
const alternate = createArchiveVariant(first, { items: addMixNote(createMixState(), "yuzu").items });
const dossier = buildProfessionalReport({ creation: alternate, variant: alternate.variants[0] });
if (dossier.summary.totalCreativePoints !== 100 || dossier.summary.referenceCount !== 1 || dossier.summary.experimentCount !== 0) failures.push("Professional report did not generate a complete variant dossier.");
const signature = analyzePersonalSignature([alternate]);
if (signature.status !== "ready" || signature.snapshotCount < 1 || signature.distinctReferenceCount < 1) failures.push("Personal signature history did not analyze saved version snapshots.");
const backup = buildArchiveBackup([alternate]);
const restored = parseArchiveBackup(backup);
if (restored.length !== 1 || restored[0].variants.length !== 2) failures.push("Local archive backup round-trip failed.");
const candidate = addMixNote(addMixNote(createMixState(), "sandalwood"), "vanilla");
const originality = analyzeOriginality(candidate, [alternate]);
if (originality.status !== "ready" || originality.score < 0 || originality.score > 100) failures.push("Personal originality engine did not produce a bounded internal comparison.");
const noBaseline = analyzeOriginality(candidate, []);
if (noBaseline.status !== "needs-history" || noBaseline.score !== null) failures.push("Originality must not invent a score without personal history.");

const dashboard = renderAnalyticsDashboard({ creations: [alternate] }, candidate);
if (!dashboard.includes("Uso de familias olfativas") || !dashboard.includes("Validator baseline")) failures.push("Analytics dashboard did not render local archive data.");

if (failures.length) {
  console.error("JB Perfume Lab validation failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log("JB Perfume Lab foundation validation passed: local formulation, 2D analytics, personal originality and PWA lifecycle.");
}
