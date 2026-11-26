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
import { buildClientBrief } from "../src/js/features/laboratory/client-brief/engine.js";
import { analyzeAudienceFit } from "../src/js/features/laboratory/audience-fit/engine.js";
import { FRAGRANCE_SIMILARITY_SCORE, validateFragranceSimilarityProfile } from "../src/js/features/laboratory/fragrance-similarity/contracts.js";
import { buildFragranceSimilarityCatalog } from "../src/js/features/laboratory/fragrance-similarity/model.js";
import { normalizeOlfactoryTerm, normalizeFragranceSimilarityProfile } from "../src/js/features/laboratory/fragrance-similarity/normalization.js";
import { compareFragranceProfiles } from "../src/js/features/laboratory/fragrance-similarity/comparison.js";
import { scoreFragranceSimilarity, FRAGRANCE_SIMILARITY_DEFAULT_WEIGHTS } from "../src/js/features/laboratory/fragrance-similarity/scoring.js";
import { explainFragranceSimilarity } from "../src/js/features/laboratory/fragrance-similarity/explanation.js";
import { searchFragranceReferences, getFragranceSimilarityReferenceById } from "../src/js/features/laboratory/fragrance-similarity/search.js";
import { rankFragranceSimilarityCandidates } from "../src/js/features/laboratory/fragrance-similarity/ranking.js";
import { filterFragranceSimilarityResults } from "../src/js/features/laboratory/fragrance-similarity/filters.js";
import { resolveFragranceSimilarityScope, rankFragranceSimilarityInScope } from "../src/js/features/laboratory/fragrance-similarity/scope.js";
import { buildFragranceSimilarityExperience } from "../src/js/features/laboratory/fragrance-similarity/experience.js";
import { renderFragranceSimilarityPanel } from "../src/js/features/laboratory/fragrance-similarity/panel.js";

const requiredFiles = [
  "index.html", "manifest.webmanifest", "sw.js", "assets/icon.svg", "assets/brand-logo.svg",
  "assets/icon-192.png", "assets/icon-512.png",
  "src/css/styles.css", "src/css/design-system.css", "src/css/perfume-library.css",
  "src/css/laboratory.css", "src/css/analytics.css",
  "src/js/app.js", "src/js/core/navigation.js", "src/js/core/pwa.js",
  "src/js/features/perfume-library/data.js", "src/js/features/perfume-library/library.js",
  "src/js/features/laboratory/fragrance-similarity/contracts.js",
  "src/js/features/laboratory/fragrance-similarity/model.js",
  "src/js/features/laboratory/fragrance-similarity/normalization.js",
  "src/js/features/laboratory/fragrance-similarity/comparison.js",
  "src/js/features/laboratory/fragrance-similarity/scoring.js",
  "src/js/features/laboratory/fragrance-similarity/explanation.js",
  "src/js/features/laboratory/fragrance-similarity/search.js",
  "src/js/features/laboratory/fragrance-similarity/ranking.js",
  "src/js/features/laboratory/fragrance-similarity/filters.js",
  "src/js/features/laboratory/fragrance-similarity/scope.js",
  "src/js/features/laboratory/fragrance-similarity/experience.js",
  "src/js/features/laboratory/fragrance-similarity/panel.js",
  "src/js/features/laboratory/fragrance-similarity/interaction.js",
  "tests/fragrance-similarity-interaction.test.mjs",
  "tests/fragrance-similarity-experience.test.mjs",
  "tests/fragrance-similarity-panel.test.mjs",
  "tests/fragrance-similarity-filters.test.mjs",
  "tests/fragrance-similarity-scope.test.mjs",
  "tests/fragrance-similarity-search.test.mjs",
  "tests/fragrance-similarity-ranking.test.mjs",
  "tests/fragrance-similarity-scoring.test.mjs",
  "tests/fragrance-similarity-explanation.test.mjs",
  "tests/fragrance-similarity-normalization.test.mjs",
  "tests/fragrance-similarity-comparison.test.mjs",
  "tests/fragrance-similarity-contracts.test.mjs",
  "tests/fragrance-similarity-model.test.mjs",
  "src/js/features/laboratory/mixing/state.js", "src/js/features/laboratory/mixing/draft-storage.js",
  "src/js/features/laboratory/mixing/panel.js",
  "src/js/features/laboratory/analysis/engine.js", "src/js/features/laboratory/analysis/panel.js",
  "src/js/features/laboratory/analytics/dashboard.js",
  "src/js/features/laboratory/originality/engine.js", "src/js/features/laboratory/originality/panel.js",
  "src/js/features/laboratory/comparison/engine.js", "src/js/features/laboratory/comparison/panel.js",
  "src/js/features/laboratory/signature-history/engine.js", "src/js/features/laboratory/signature-history/panel.js",
  "src/js/features/laboratory/sensory-experiments/model.js", "src/js/features/laboratory/sensory-experiments/panel.js",
  "src/js/features/laboratory/profile-history/engine.js", "src/js/features/laboratory/profile-history/panel.js",
  "src/js/features/laboratory/performance-estimator/calibration.js", "src/js/features/laboratory/performance-estimator/calibration-panel.js",
  "src/js/features/laboratory/professional-reports/engine.js", "src/js/features/laboratory/professional-reports/panel.js",
  "src/js/features/laboratory/evolution/engine.js", "src/js/features/laboratory/evolution/panel.js",
  "src/js/features/archive/model.js", "src/js/features/archive/repository.js", "src/js/features/archive/panel.js",
  "src/js/ui/views.js", "tests/pwa.test.mjs", "tests/profile-history.test.mjs", "tests/originality.test.mjs", "tests/dashboard.test.mjs", "tests/formulation-ux.test.mjs", "tests/analytical-comparison.test.mjs", "tests/signature-history.test.mjs", "tests/sensory-experiments.test.mjs", "tests/performance-calibration.test.mjs", "tests/professional-reports.test.mjs", "tests/creative-assistant.test.mjs", "tests/formulation-proposals.test.mjs", "tests/inspiration-differentiation.test.mjs", "tests/readability.test.mjs"
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
if (!/shell-v52/.test(sw) || !sw.includes("SKIP_WAITING")) failures.push("PWA shell must be versioned at shell-v52 and support controlled activation.");
if (/three|THREE_|scene\.js|render-profile|performance-audit/i.test(sw)) failures.push("The PWA shell must not cache 3D modules or external 3D assets.");
for (const path of ["mixing/state.js", "mixing/draft-storage.js", "mixing/panel.js", "creative-assistant/engine.js", "creative-assistant/panel.js", "formulation-proposals/engine.js", "formulation-proposals/panel.js", "inspiration-differentiation/engine.js", "inspiration-differentiation/panel.js", "analysis/engine.js", "analysis/panel.js", "analytics/dashboard.js", "originality/engine.js", "originality/panel.js", "evolution/engine.js", "evolution/panel.js", "comparison/engine.js", "comparison/panel.js", "signature-history/engine.js", "signature-history/panel.js", "sensory-experiments/model.js", "sensory-experiments/panel.js", "professional-reports/engine.js", "professional-reports/panel.js", "archive/model.js", "archive/repository.js", "archive/panel.js"]) {
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
if (mixPanel.includes("<kbd>60</kbd>") || !mixPanel.includes("MATERIAS DISPONIBLES")) failures.push("Mobile reference counter must be clear and must not overlap the search field.");
if (!mixPanel.includes("mix-picker-family") || !mixPanel.includes("mix-picker-kind") || !mixPanel.includes("mix-picker-role") || !mixPanel.includes("data-add-to-mix")) failures.push("The formulation picker must expose family, type, role and direct-add controls.");
if (!mixPanel.includes('type="number"') || !mixPanel.includes('type="range"') || !mixPanel.includes("mix-weight-hint")) failures.push("Formulation weights must expose both slider and precise numeric editing.");

if (!analysisPanel.includes("renderFamilyDonut") || !analysisPanel.includes("renderProfileRadar")) failures.push("Family and sensory charts are missing.");
if (!app.includes("buildCreativeRecommendations") || !app.includes("renderCreativeAssistant") || !views.includes("renderCreativeAssistant")) failures.push("The local creative assistant is not wired into the lab workspace.");
if (!sw.includes("creative-assistant/engine.js") || !sw.includes("creative-assistant/panel.js")) failures.push("The local creative assistant is not available in the offline shell.");
if (!app.includes("apply-creative-assistant-suggestions") || !app.includes("addMixNote(mixingState, suggestion.id)")) failures.push("Creative assistant recommendations must be transferred to the formulation only after explicit user action.");
if (!app.includes("generateFormulationProposals") || !app.includes("replaceMixItems") || !app.includes("load-formulation-proposal") || !views.includes("renderFormulationProposals")) failures.push("Formulation proposals must be generated, rendered and loaded only through explicit action.");
if (!sw.includes("formulation-proposals/engine.js") || !sw.includes("formulation-proposals/panel.js")) failures.push("Formulation proposal modules are missing from the offline shell.");
if (!app.includes("window.confirm") || !app.includes("proposal.items")) failures.push("Loading an alternative must confirm replacement of an existing composition.");
if (!app.includes("analyzeInspirationDifferentiation") || !app.includes("send-inspiration-direction") || !views.includes("renderInspirationDifferentiation")) failures.push("Inspiration trait analysis and handoff to the creative assistant are not wired.");
if (!sw.includes("inspiration-differentiation/engine.js") || !sw.includes("inspiration-differentiation/panel.js")) failures.push("Inspiration differentiation modules are missing from the offline shell.");
if (!app.includes("inspirationDifferentiationState") || !app.includes("briefForAssistant")) failures.push("Inspiration analysis must remain locally stateful and create a brief only on explicit action.");
if (!sw.includes("performance-estimator/calibration.js") || !sw.includes("performance-estimator/calibration-panel.js") || !app.includes("observedPerformance") || !views.includes("renderPerformanceCalibration") || !app.includes("archiveState.experiments")) failures.push("Sensory observations and local performance calibration are not fully integrated or cached offline.");
if (!app.includes("createCreativeProfile") || !app.includes("save-client-profile") || !app.includes("compareProfileSnapshots") || !views.includes("renderProfileHistory") || !sw.includes("profile-history/engine.js") || !sw.includes("profile-history/panel.js")) failures.push("Creative profile history and comparison are not wired to local storage and the projects view.");
if (!app.includes("compareSavedCompositions") || !views.includes("renderAnalyticalComparison")) failures.push("Saved composition comparison is not wired into the archive view.");
if (!app.includes("buildClientBrief") || !app.includes("send-client-brief-to-assistant") || !views.includes("renderClientBriefPanel") || !sw.includes("client-brief/engine.js")) failures.push("Guided client briefs must be previewed and transferred to the local assistant only by explicit action.");
if (!app.includes("updateAudienceFit") || !views.includes("renderAudienceFit") || !sw.includes("audience-fit/engine.js") || !sw.includes("audience-fit/panel.js")) failures.push("Live audience positioning must update with the active composition and remain available offline.");
if (!sw.includes("reference-benchmark/data.js") || !sw.includes("reference-benchmark/engine.js") || !sw.includes("reference-benchmark/panel.js") || !originalityPanel.includes("renderCatalogBenchmark") || !views.includes("renderOriginalityAnalysis")) failures.push("Commercial reference benchmark must be integrated and cached offline.");
if (!sw.includes("performance-estimator/engine.js") || !sw.includes("performance-estimator/panel.js") || !app.includes("renderPerformanceEstimate") || !views.includes("renderPerformanceEstimate") || !app.includes("performance-concentration") || !app.includes("performance-environment")) failures.push("Performance estimator scenarios must be adjustable and wired into the composition workflow and offline shell.");
const similarityInteraction = await readFile("src/js/features/laboratory/fragrance-similarity/interaction.js", "utf8");
if (!app.includes("getFragranceSuggestionKeyboardAction") || !app.includes('addEventListener("keydown"') ||
    !app.includes("fragranceSimilarityState.suggestionsOpen = true") ||
    !sw.includes("fragrance-similarity/interaction.js") || !similarityInteraction.includes("ArrowDown") || !similarityInteraction.includes("Escape")) {
  failures.push("Fragrance search keyboard navigation is not wired to the offline shell and interaction contract.");
}
if (!app.includes("buildFragranceSimilarityExperience") || !app.includes("data-similarity-select") ||
    !views.includes("renderFragranceSimilarityPanel") ||
    !sw.includes("fragrance-similarity/experience.js") || !sw.includes("fragrance-similarity/panel.js")) {
  failures.push("Fragrance reverse-search interface is not fully wired into the lab view and offline shell.");
}
const reverseSession = buildFragranceSimilarityExperience({ query: "Oud Wod", selectedReferenceId: "tom-ford-oud-wood" });
const emptyInventorySession = buildFragranceSimilarityExperience({ selectedReferenceId: "tom-ford-oud-wood", scope: "own-inventory" });
const reverseMarkup = renderFragranceSimilarityPanel({});
if (!["suggestions", "exact-match"].includes(reverseSession.search.status) ||
    reverseSession.reference?.id !== "tom-ford-oud-wood" || !reverseSession.filtered?.results?.length ||
    emptyInventorySession.filtered?.status !== "inventory-empty" ||
    !reverseMarkup.includes('id="fragrance-similarity-search"') ||
    !reverseMarkup.includes('id="similarity-filter-band"')) {
  failures.push("Fragrance reverse-search integration or explicit inventory-empty rendering failed.");
}

const audienceFit = analyzeAudienceFit([{ id: "bergamot", points: 50 }, { id: "rose", points: 50 }]);
if (audienceFit.status !== "ready" || !audienceFit.positioning || !audienceFit.agePosition) failures.push("Audience positioning did not analyze a normalized local composition.");
const brief = buildClientBrief({ style: "fresco", occasion: "diario", presence: "discreta", liked: "cítrico y limpio" });
if (brief.status !== "ready" || !brief.description.includes("Presencia deseada: discreta")) failures.push("Guided client brief did not produce an assistant-ready profile.");
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

const similarityContractCheck = validateFragranceSimilarityProfile({
  schemaVersion: 1,
  id: "validator-profile",
  identity: { name: "Validator profile", house: null, category: "designer" },
  olfactory: {
    family: null,
    subfamilies: null,
    accords: null,
    notes: { all: [], top: [], heart: [], base: [] },
    character: []
  },
  provenance: {
    dataset: "Validator source",
    attribution: "Validator attribution",
    license: "CC BY 4.0",
    snapshot: "2026-10-29",
    datasetUrl: "https://example.com",
    recordUrl: null
  },
  quality: {
    noteCount: 0,
    characterCount: 0,
    pyramidCoverage: "unavailable",
    hasNotes: false,
    hasCharacter: false
  }
});
if (!similarityContractCheck.valid || FRAGRANCE_SIMILARITY_SCORE.minimum !== 0 || FRAGRANCE_SIMILARITY_SCORE.maximum !== 100) {
  failures.push("Fragrance similarity contract is invalid or its score bounds changed.");
}

const fragranceSimilarityCatalog = buildFragranceSimilarityCatalog();
if (
  fragranceSimilarityCatalog.status !== "ready" ||
  fragranceSimilarityCatalog.acceptedRecords !== 1479 ||
  fragranceSimilarityCatalog.rejectedRecords !== 0
) {
  failures.push("The fragrance similarity model must normalize all 1,479 licensed reference records without loss.");
}

const normalizedBergamot = normalizeOlfactoryTerm("Bergamota");
const normalizedBlackcurrant = normalizeOlfactoryTerm("Cassis");
if (normalizedBergamot !== "bergamot" || normalizedBlackcurrant !== "blackcurrant") {
  failures.push("Fragrance semantic normalization did not resolve its required bilingual aliases.");
}
const referenceProfile = fragranceSimilarityCatalog.profiles.find((item) => item.identity.name && item.olfactory.notes.all.length >= 2);
const candidateProfile = fragranceSimilarityCatalog.profiles.find((item) => item.id !== referenceProfile?.id && item.olfactory.notes.all.length >= 2);
if (!referenceProfile || !candidateProfile) {
  failures.push("Fragrance similarity comparator lacks two usable catalog profiles.");
} else {
  const normalizedProfile = normalizeFragranceSimilarityProfile(referenceProfile);
  const profileComparison = compareFragranceProfiles(referenceProfile, candidateProfile);
  if (!normalizedProfile.notes.all.length || !["ready", "insufficient-data"].includes(profileComparison.status) ||
      profileComparison.interpretation.globalSimilarityScore !== false) {
    failures.push("Fragrance olfactory comparison did not return normalized, evidence-only dimensions.");
  }

  if (profileComparison.status === "ready") {
    const profileScore = scoreFragranceSimilarity(profileComparison, referenceProfile, candidateProfile);
    const profileExplanation = explainFragranceSimilarity(profileComparison, profileScore);
    const totalWeights = Object.values(FRAGRANCE_SIMILARITY_DEFAULT_WEIGHTS).reduce((sum, value) => sum + value, 0);
    if (profileScore.status !== "ready" || !Number.isInteger(profileScore.score) ||
        profileScore.score < 0 || profileScore.score > 100 ||
        !profileScore.confidence || profileExplanation.status !== "ready" ||
        profileExplanation.score !== profileScore.score || Math.abs(totalWeights - 1) > 0.000001) {
      failures.push("Fragrance global scoring or evidence explanation did not return a valid independent result.");
    }
  }

  const referenceSearch = searchFragranceReferences("Oud Wood");
  const exactReference = getFragranceSimilarityReferenceById("tom-ford-oud-wood");
  const similarityRanking = rankFragranceSimilarityCandidates(referenceProfile, [candidateProfile]);
  if (referenceSearch.status !== "exact-match" ||
      referenceSearch.results[0]?.id !== "tom-ford-oud-wood" ||
      exactReference?.id !== "tom-ford-oud-wood" ||
      !["ready", "insufficient-data"].includes(similarityRanking.status) ||
      similarityRanking.totalCandidates !== 1) {
    failures.push("Fragrance reference search or candidate ranking failed its local catalog integration check.");
  }

  const ownScope = resolveFragranceSimilarityScope({
    scope: "own-inventory",
    inventorySourceLabel: "Validator inventory adapter",
    inventoryEntries: [{
      inventoryItemId: "validator-inventory-item",
      profile: candidateProfile,
      availabilityStatus: "unknown"
    }]
  });
  const scopedRanking = rankFragranceSimilarityInScope(referenceProfile, ownScope);
  const emptyOwnScope = resolveFragranceSimilarityScope({ scope: "own-inventory", inventoryEntries: [] });
  const filteredScopedRanking = filterFragranceSimilarityResults(scopedRanking, {
    availabilityStatuses: ["unknown"]
  });
  if (ownScope.status !== "ready" || ownScope.totalCandidates !== 1 ||
      scopedRanking.scope?.key !== "own-inventory" ||
      emptyOwnScope.status !== "inventory-empty" || emptyOwnScope.candidates.length !== 0 ||
      !Array.isArray(filteredScopedRanking.results)) {
    failures.push("Fragrance result filtering or explicit own-inventory scope validation failed.");
  }
}

let mix = addMixNote(createMixState(), "bergamot");
mix = addMixNote(mix, "rose");
if (getMixTotal(mix) !== 100) failures.push("Conceptual mixing state must normalize to 100 creative points.");
const analysis = analyzeComposition(mix);
if (analysis.isEmpty || analysis.totalPoints !== 100 || !analysis.families.length) failures.push("Creative analysis does not reflect the active composition.");

const first = createArchiveCreation({ name: "Validator baseline", items: mix.items });
const alternate = createArchiveVariant(first, { items: addMixNote(createMixState(), "yuzu").items });
const dossier = buildProfessionalReport({ creation: alternate, variant: alternate.variants[1] });
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
