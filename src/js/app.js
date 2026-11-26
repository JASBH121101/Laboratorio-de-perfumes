import { resolveView } from "./core/navigation.js";
import { createPwaManager } from "./core/pwa.js";
import { renderLibraryDetail, renderLibraryResults } from "./features/perfume-library/library.js";
import { addMixNote, createMixState, removeMixNote, replaceMixItems, resetMix, setMixNotePoints, undoMix } from "./features/laboratory/mixing/state.js";
import { renderMixPickerResults, renderMixStudio } from "./features/laboratory/mixing/panel.js";
import { buildCreativeRecommendations } from "./features/laboratory/creative-assistant/engine.js";
import { renderCreativeAssistant } from "./features/laboratory/creative-assistant/panel.js";
import { generateFormulationProposals } from "./features/laboratory/formulation-proposals/engine.js";
import { renderFormulationProposals } from "./features/laboratory/formulation-proposals/panel.js";
import { analyzeInspirationDifferentiation } from "./features/laboratory/inspiration-differentiation/engine.js";
import { renderInspirationDifferentiation } from "./features/laboratory/inspiration-differentiation/panel.js";
import { buildClientBrief } from "./features/laboratory/client-brief/engine.js";
import { renderClientBriefPanel } from "./features/laboratory/client-brief/panel.js";
import { renderAudienceFit } from "./features/laboratory/audience-fit/panel.js";
import { loadMixDraft, saveMixDraft } from "./features/laboratory/mixing/draft-storage.js";
import { renderCreativeAnalysis } from "./features/laboratory/analysis/panel.js";
import { renderOriginalityAnalysis } from "./features/laboratory/originality/panel.js";
import { compareSavedCompositions } from "./features/laboratory/comparison/engine.js";
import { renderAnalyticalComparison } from "./features/laboratory/comparison/panel.js";
import { renderPersonalSignatureHistory } from "./features/laboratory/signature-history/panel.js";
import { renderSensoryExperiments } from "./features/laboratory/sensory-experiments/panel.js";
import { buildProfessionalReport, toProfessionalReportCsv } from "./features/laboratory/professional-reports/engine.js";
import { renderProfessionalReports } from "./features/laboratory/professional-reports/panel.js";
import {
  buildSensoryBackup, createSensoryExperiment, mergeSensoryExperiments, parseSensoryBackup
} from "./features/laboratory/sensory-experiments/model.js";
import { renderEvolutionSimulator } from "./features/laboratory/evolution/panel.js";
import { createArchiveRepository } from "./features/archive/repository.js";
import {
  activateArchiveVariant, buildArchiveBackup, compareArchiveVariants,
  createArchiveCreation, createArchiveVariant, getActiveVariant, getVariant,
  mergeImportedCreations, parseArchiveBackup, renameArchiveCreation,
  renameArchiveVariant, restoreArchiveVersion, saveArchiveVersion
} from "./features/archive/model.js";
import { renderArchiveQuickSave, renderArchiveView } from "./features/archive/panel.js";
import { renderPage } from "./ui/views.js";

const appRoot = document.querySelector("#app");
const notice = document.querySelector("#app-notice");
const noticeTitle = document.querySelector("#app-notice-title");
const noticeMessage = document.querySelector("#app-notice-message");
const noticeAction = document.querySelector("#app-notice-action");
const libraryState = { query: "", family: "all", role: "all", selectedId: null };
const mixPickerState = { query: "", family: "all", role: "all", kind: "all", expanded: false };
const creativeAssistantState = { mode: "personal", description: "", result: null, proposals: null };
const inspirationDifferentiationState = { referenceLabel: "", liked: "", avoid: "", result: null };
const clientBriefState = { fields: {}, result: null };
const archiveRepository = createArchiveRepository();

let mixingState = loadMixDraft() ?? createMixState();
let analysisDirection = "balanced";
let evolutionStage = "opening";
let archiveState = {
  creations: [],
  selectedCreationId: null,
  selectedVariantId: null,
  comparison: null,
  comparisonPair: null,
  experiments: [],
  sensorySelection: "",
  reportSelection: "",
  professionalReport: null,
  error: "",
  storageMode: globalThis.indexedDB ? "IndexedDB" : "localStorage"
};

function showNotice({ title, message, action = false }) {
  if (!notice) return;
  noticeTitle.textContent = title;
  noticeMessage.textContent = message;
  noticeAction.hidden = !action;
  notice.hidden = false;
}

function hideNotice() {
  notice.hidden = true;
  noticeAction.hidden = true;
}

function handleArchiveError(error) {
  const message = error instanceof Error ? error.message : "No se pudo completar la operación del archivo.";
  archiveState.error = message;
  showNotice({ title: "Archivo local", message });
}

const pwa = createPwaManager({
  onInstallState: ({ installed }) => {
    for (const installButton of appRoot.querySelectorAll("[data-action='install']")) {
      installButton.hidden = installed;
      installButton.setAttribute("aria-hidden", String(installed));
    }
  },
  onUpdateAvailable: () => showNotice({
    title: "Nueva versión disponible",
    message: "Hay una actualización lista. Aplícala para cargar los últimos cambios del laboratorio.",
    action: true
  }),
  onNotice: showNotice
});

function getArchiveViewState() {
  return { ...archiveState, hasCurrentComposition: mixingState.items.length > 0 };
}

function updateArchiveUI() {
  const viewState = getArchiveViewState();
  const archiveRoot = appRoot.querySelector("#archive-root");
  if (archiveRoot) archiveRoot.outerHTML = renderArchiveView(viewState);
  const quickSave = appRoot.querySelector("#archive-quick-save");
  if (quickSave) quickSave.outerHTML = renderArchiveQuickSave(viewState);
  const comparisonPanel = appRoot.querySelector("#archive-comparison-root");
  if (comparisonPanel) comparisonPanel.outerHTML = renderAnalyticalComparison(archiveState);
  const signatureHistory = appRoot.querySelector("#signature-history-root");
  if (signatureHistory) signatureHistory.outerHTML = renderPersonalSignatureHistory(archiveState);
  const sensoryPanel = appRoot.querySelector("#sensory-experiments-root");
  if (sensoryPanel) sensoryPanel.outerHTML = renderSensoryExperiments(archiveState);
  const reportsPanel = appRoot.querySelector("#professional-reports-root");
  if (reportsPanel) reportsPanel.outerHTML = renderProfessionalReports(archiveState);
  updateOriginalityAnalysis();
}

async function refreshArchive() {
  try {
    [archiveState.creations, archiveState.experiments] = await Promise.all([
      archiveRepository.list(),
      archiveRepository.listExperiments()
    ]);
    archiveState.storageMode = archiveRepository.getStorageMode();
    archiveState.professionalReport = null;
    archiveState.error = "";
    if (archiveState.selectedCreationId) {
      const selected = archiveState.creations.find((creation) => creation.id === archiveState.selectedCreationId);
      if (!selected) {
        archiveState.selectedCreationId = null;
        archiveState.selectedVariantId = null;
        archiveState.comparison = null;
      } else if (!getVariant(selected, archiveState.selectedVariantId)) {
        archiveState.selectedVariantId = getActiveVariant(selected)?.id ?? null;
      }
    }
    updateArchiveUI();
    return archiveState.creations;
  } catch (error) {
    handleArchiveError(error);
    updateArchiveUI();
    return [];
  }
}

async function persistCreation(creation, successMessage = "Cambios guardados en este dispositivo.") {
  await archiveRepository.put(creation);
  await refreshArchive();
  showNotice({ title: "Archivo actualizado", message: successMessage });
}

function findSelectedCreation() {
  return archiveState.creations.find((creation) => creation.id === archiveState.selectedCreationId) ?? null;
}

async function saveSensoryExperimentFromForm() {
  const form = appRoot.querySelector("#sensory-experiment-form");
  if (!form) throw new Error("No hay un formulario de experimento disponible.");
  if (!form.reportValidity()) return;
  const data = new FormData(form);
  let selection;
  try { selection = JSON.parse(String(data.get("variantKey") || "")); }
  catch { throw new Error("Seleccioná una variante válida."); }
  const creation = archiveState.creations.find((item) => item.id === selection.creationId);
  const variant = creation?.variants?.find((item) => item.id === selection.variantId);
  if (!creation || !variant) throw new Error("La creación o variante seleccionada ya no existe.");
  const ratings = Object.fromEntries(["intensity", "freshness", "sweetness", "floral", "woody", "spicy", "persistence"]
    .map((key) => [key, data.get(`rating_${key}`) || null]));
  const experiment = createSensoryExperiment({
    creation,
    variant,
    title: data.get("title"),
    observedAt: data.get("observedAt"),
    observer: data.get("observer"),
    context: data.get("context"),
    elapsedMinutes: data.get("elapsedMinutes"),
    impression: data.get("impression"),
    tags: data.getAll("tags"),
    ratings
  });
  await archiveRepository.putExperiment(experiment);
  archiveState.sensorySelection = String(data.get("variantKey") || "");
  await refreshArchive();
  showNotice({ title: "Observación guardada", message: `El experimento quedó vinculado a ${creation.name} · variante ${variant.label} · versión ${experiment.versionNumber}.` });
}

async function importSensoryBackupFile(file) {
  if (!file) return;
  const imported = parseSensoryBackup(await file.text());
  const merged = mergeSensoryExperiments(archiveState.experiments, imported);
  await archiveRepository.putExperiments(merged);
  await refreshArchive();
  showNotice({ title: "Respaldo sensorial importado", message: `${imported.length} registros se incorporaron sin sobrescribir identificadores existentes.` });
}

function loadVariantIntoLab(creation, variant) {
  if (!creation || !variant) throw new Error("No se encontró la creación o variante seleccionada.");
  archiveState.selectedCreationId = creation.id;
  archiveState.selectedVariantId = variant.id;
  archiveState.comparison = null;
  mixingState = { items: variant.items.map((item) => ({ ...item })), history: [] };
  saveMixDraft(mixingState.items);
  evolutionStage = "opening";
  window.location.hash = "#lab";
  render();
  showNotice({
    title: "Creación cargada",
    message: `${creation.name} · Variante ${variant.label} está lista para continuar.`
  });
}

function downloadJson(payload, filename) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.hidden = true;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function downloadText(content, filename, mimeType = "text/plain;charset=utf-8") {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.hidden = true;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function safeFilename(value) {
  return String(value || "JB-Perfume-Lab")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48) || "jb-perfume-lab";
}

function render() {
  const activeView = resolveView(window.location.hash);
  appRoot.innerHTML = renderPage(activeView, libraryState, mixingState, analysisDirection, evolutionStage, getArchiveViewState(), mixPickerState, creativeAssistantState, inspirationDifferentiationState, clientBriefState);

  if (pwa.isInstalled()) {
    appRoot.querySelectorAll("[data-action='install']").forEach((button) => {
      button.hidden = true;
      button.setAttribute("aria-hidden", "true");
    });
  }
}

function updateLibrary() {
  const results = appRoot.querySelector("#library-results");
  const detail = appRoot.querySelector("#library-detail");
  if (results) results.innerHTML = renderLibraryResults(libraryState);
  if (detail) detail.outerHTML = renderLibraryDetail(libraryState.selectedId, mixingState);
}

function updateEvolutionSimulator() {
  const panel = appRoot.querySelector("#evolution-simulator");
  if (panel) panel.outerHTML = renderEvolutionSimulator(mixingState, evolutionStage);
}

function updateCreativeAnalysis() {
  const panel = appRoot.querySelector("#creative-analysis");
  if (panel) panel.outerHTML = renderCreativeAnalysis(mixingState, analysisDirection);
  updateOriginalityAnalysis();
  updateAudienceFit();
}

function updateAudienceFit() {
  const panel = appRoot.querySelector("#audience-fit-analysis");
  if (panel) panel.outerHTML = renderAudienceFit(mixingState.items);
}

function updateOriginalityAnalysis() {
  const panel = appRoot.querySelector("#originality-analysis");
  if (panel) panel.outerHTML = renderOriginalityAnalysis(mixingState, archiveState.creations);
}

function updateMixPickerResults() {
  const results = appRoot.querySelector("#mix-picker-results");
  if (results) results.innerHTML = renderMixPickerResults(mixingState, mixPickerState);
  const clear = appRoot.querySelector(".mix-picker-clear");
  if (clear) clear.disabled = !mixPickerState.query && mixPickerState.family === "all" && mixPickerState.role === "all" && mixPickerState.kind === "all";
}

function updateCreativeAssistant() {
  const panel = appRoot.querySelector("#creative-assistant");
  if (panel) panel.outerHTML = renderCreativeAssistant(creativeAssistantState);
  const proposalsPanel = appRoot.querySelector("#formulation-proposals");
  if (proposalsPanel) proposalsPanel.outerHTML = renderFormulationProposals({ result: creativeAssistantState.proposals });
}

function updateInspirationDifferentiation() {
  const panel = appRoot.querySelector("#inspiration-differentiation");
  if (panel) panel.outerHTML = renderInspirationDifferentiation(inspirationDifferentiationState);
}

function updateClientBrief() {
  const panel = appRoot.querySelector("#client-brief-panel");
  if (panel) panel.outerHTML = renderClientBriefPanel(clientBriefState);
}

function updateMixStudio() {
  saveMixDraft(mixingState.items);
  const panel = appRoot.querySelector("#mix-studio");
  if (panel) panel.outerHTML = renderMixStudio(mixingState, mixPickerState);
  const quickSave = appRoot.querySelector("#archive-quick-save");
  if (quickSave) quickSave.outerHTML = renderArchiveQuickSave(getArchiveViewState());
  updateCreativeAnalysis();
  updateEvolutionSimulator();
  updateLibrary();
}

function addNoteToMix(noteId) {
  if (!noteId) return;
  const previous = mixingState;
  mixingState = addMixNote(mixingState, noteId);
  if (mixingState === previous) {
    showNotice({ title: "Referencia ya añadida", message: "Esa nota o acorde ya forma parte de la composición." });
    return;
  }
  updateMixStudio();
  showNotice({ title: "Referencia añadida", message: "La composición conceptual y sus análisis se actualizaron." });
}

function requireWorkingComposition() {
  if (!mixingState.items.length) {
    throw new Error("Añadí al menos una referencia a la composición antes de crear, guardar una versión o abrir una variante.");
  }
}

async function saveNewCreation(name, description = "") {
  requireWorkingComposition();
  const creation = createArchiveCreation({ name, description, items: mixingState.items });
  await persistCreation(creation, `${creation.name} se guardó como una creación independiente.`);
  archiveState.selectedCreationId = creation.id;
  archiveState.selectedVariantId = creation.activeVariantId;
  archiveState.comparison = null;
  updateArchiveUI();
}

async function saveCurrentAsVersion() {
  requireWorkingComposition();
  const creation = findSelectedCreation();
  if (!creation) throw new Error("Primero seleccioná una creación del archivo.");
  const variant = getVariant(creation, archiveState.selectedVariantId) ?? getActiveVariant(creation);
  const updated = saveArchiveVersion(creation, variant.id, mixingState.items, "Guardado desde el laboratorio");
  if (updated === creation) {
    showNotice({ title: "Sin cambios nuevos", message: "La composición actual ya coincide con esta versión guardada." });
    return;
  }
  archiveState.selectedVariantId = variant.id;
  await persistCreation(updated, `${creation.name} · Variante ${variant.label}: nueva versión guardada.`);
}

async function createVariantFromCurrent() {
  requireWorkingComposition();
  const creation = findSelectedCreation();
  if (!creation) throw new Error("Seleccioná una creación antes de crear una variante.");
  const updated = createArchiveVariant(creation, { items: mixingState.items });
  archiveState.selectedVariantId = updated.activeVariantId;
  archiveState.comparison = null;
  await persistCreation(updated, `${creation.name}: se creó la variante ${getVariant(updated, updated.activeVariantId).label}.`);
}

async function importBackupFile(file) {
  if (!file) return;
  const imported = parseArchiveBackup(await file.text());
  if (archiveState.creations.length + imported.length > 200) {
    throw new Error("La importación superaría el límite local de 200 creaciones.");
  }
  const merged = mergeImportedCreations(archiveState.creations, imported);
  await archiveRepository.putMany(merged);
  await refreshArchive();
  showNotice({ title: "Respaldo importado", message: `${imported.length} creaciones incorporadas. Las que tenían un identificador repetido se conservaron como copias separadas.` });
}


appRoot.addEventListener("input", (event) => {
  if (event.target.id === "mix-picker-search") {
    mixPickerState.query = event.target.value;
    mixPickerState.expanded = false;
    updateMixPickerResults();
  } else if (event.target.id === "inspiration-reference-label") {
    inspirationDifferentiationState.referenceLabel = event.target.value;
  } else if (event.target.id === "inspiration-liked") {
    inspirationDifferentiationState.liked = event.target.value;
  } else if (event.target.id === "inspiration-avoid") {
    inspirationDifferentiationState.avoid = event.target.value;
  } else if (event.target.id === "creative-assistant-brief") {
    creativeAssistantState.description = event.target.value;
  } else if (["client-brief-liked", "client-brief-avoid", "client-brief-additional"].includes(event.target.id)) {
    const field = event.target.id.replace("client-brief-", "");
    clientBriefState.fields[field] = event.target.value;
  } else if (event.target.id === "library-search") {
    libraryState.query = event.target.value;
    updateLibrary();
  }
});

appRoot.addEventListener("change", async (event) => {
  if (event.target.id === "mix-picker-family") {
    mixPickerState.family = event.target.value;
    mixPickerState.expanded = false;
    updateMixPickerResults();
  } else if (event.target.id === "mix-picker-kind") {
    mixPickerState.kind = event.target.value;
    mixPickerState.expanded = false;
    updateMixPickerResults();
  } else if (event.target.id === "mix-picker-role") {
    mixPickerState.role = event.target.value;
    mixPickerState.expanded = false;
    updateMixPickerResults();
  } else if (event.target.id === "creative-assistant-mode") {
    creativeAssistantState.mode = event.target.value;
  } else if (["client-brief-occasion", "client-brief-style", "client-brief-presence"].includes(event.target.id)) {
    const field = event.target.id.replace("client-brief-", "");
    clientBriefState.fields[field] = event.target.value;
  } else if (event.target.id === "library-family") {
    libraryState.family = event.target.value;
    updateLibrary();
  } else if (event.target.id === "library-role") {
    libraryState.role = event.target.value;
    updateLibrary();
  }
  if (event.target.matches("[data-mix-weight]")) {
    const requested = event.target.value.trim();
    if (!requested || !Number.isFinite(Number(requested))) {
      updateMixStudio();
    } else {
      mixingState = setMixNotePoints(mixingState, event.target.dataset.mixWeight, requested);
      updateMixStudio();
    }
  }
  if (event.target.matches("[data-analysis-direction]")) {
    analysisDirection = event.target.value;
    updateCreativeAnalysis();
  }
  if (event.target.id === "archive-import-file") {
    try {
      await importBackupFile(event.target.files?.[0]);
    } catch (error) {
      handleArchiveError(error);
    } finally {
      event.target.value = "";
    }
  }
  if (event.target.id === "professional-report-variant") {
    archiveState.reportSelection = event.target.value;
    archiveState.professionalReport = null;
    const reportPanel = appRoot.querySelector("#professional-reports-root");
    if (reportPanel) reportPanel.outerHTML = renderProfessionalReports(archiveState);
  }
  if (event.target.id === "sensory-import-file") {
    try {
      await importSensoryBackupFile(event.target.files?.[0]);
    } catch (error) {
      handleArchiveError(error);
    } finally {
      event.target.value = "";
    }
  }
});

appRoot.addEventListener("click", async (event) => {
  const navTarget = event.target.closest("[data-nav]");
  if (navTarget) {
    event.preventDefault();
    const target = navTarget.getAttribute("data-nav");
    window.location.hash = target === "home" ? "#home" : `#${target}`;
    return;
  }

  const noteTarget = event.target.closest("[data-open-note]");
  if (noteTarget) {
    libraryState.selectedId = noteTarget.dataset.openNote;
    updateLibrary();
    return;
  }

  const addMixTarget = event.target.closest("[data-add-to-mix]");
  if (addMixTarget) {
    addNoteToMix(addMixTarget.dataset.addToMix);
    return;
  }

  const evolutionTarget = event.target.closest("[data-evolution-stage]");
  if (evolutionTarget) {
    evolutionStage = evolutionTarget.dataset.evolutionStage;
    updateEvolutionSimulator();
    return;
  }

  const removeMixTarget = event.target.closest("[data-remove-mix-note]");
  if (removeMixTarget) {
    mixingState = removeMixNote(mixingState, removeMixTarget.dataset.removeMixNote);
    updateMixStudio();
    return;
  }

  const archiveCard = event.target.closest("[data-open-archive]");
  if (archiveCard) {
    archiveState.selectedCreationId = archiveCard.dataset.openArchive;
    const creation = findSelectedCreation();
    archiveState.selectedVariantId = getActiveVariant(creation)?.id ?? null;
    archiveState.comparison = null;
    updateArchiveUI();
    return;
  }

  const loadCreation = event.target.closest("[data-load-archive]");
  if (loadCreation) {
    const creation = archiveState.creations.find((item) => item.id === loadCreation.dataset.loadArchive);
    loadVariantIntoLab(creation, getActiveVariant(creation));
    return;
  }

  const loadVariant = event.target.closest("[data-load-variant]");
  if (loadVariant) {
    const creation = findSelectedCreation();
    loadVariantIntoLab(creation, getVariant(creation, loadVariant.dataset.loadVariant));
    return;
  }

  const selectVariant = event.target.closest("[data-select-variant]");
  if (selectVariant) {
    const creation = findSelectedCreation();
    const variant = getVariant(creation, selectVariant.dataset.selectVariant);
    if (!creation || !variant) throw new Error("No se encontró la variante que intentás seleccionar.");
    const updated = activateArchiveVariant(creation, variant.id);
    archiveState.selectedVariantId = variant.id;
    archiveState.comparison = null;
    mixingState = { items: variant.items.map((item) => ({ ...item })), history: [] };
    saveMixDraft(mixingState.items);
    updateMixStudio();
    await persistCreation(updated, `Variante ${variant.label} seleccionada y cargada en el espacio de trabajo.`);
    return;
  }

  const restoreTarget = event.target.closest("[data-restore-version]");
  if (restoreTarget) {
    const creation = findSelectedCreation();
    const updated = restoreArchiveVersion(
      creation,
      restoreTarget.dataset.restoreVersion,
      Number(restoreTarget.dataset.versionNumber)
    );
    const variant = getVariant(updated, restoreTarget.dataset.restoreVersion);
    archiveState.selectedVariantId = variant.id;
    mixingState = { items: variant.items.map((item) => ({ ...item })), history: [] };
    archiveState.comparison = null;
    saveMixDraft(mixingState.items);
    updateMixStudio();
    await persistCreation(updated, `Se restauró el contenido histórico como una versión nueva de la variante ${variant.label} y se cargó en el espacio de trabajo.`);
    return;
  }

  const action = event.target.closest("[data-action]")?.dataset.action;
  if (!action) return;

  try {
    if (action === "theme") {
      const nextTheme = document.documentElement.dataset.theme === "light" ? "dark" : "light";
      document.documentElement.dataset.theme = nextTheme;
      try { localStorage.setItem("jb-vpl-theme", nextTheme); } catch { /* Use session theme only. */ }
    } else if (action === "install") {
      await pwa.install();
    } else if (action === "check-updates") {
      await pwa.checkForUpdates();
    } else if (action === "clear-library") {
      libraryState.query = "";
      libraryState.family = "all";
      libraryState.role = "all";
      libraryState.selectedId = null;
      const search = appRoot.querySelector("#library-search");
      const family = appRoot.querySelector("#library-family");
      const role = appRoot.querySelector("#library-role");
      if (search) search.value = "";
      if (family) family.value = "all";
      if (role) role.value = "all";
      updateLibrary();
    } else if (action === "close-note-detail") {
      libraryState.selectedId = null;
      updateLibrary();
    } else if (action === "toggle-mix-picker") {
      mixPickerState.expanded = !mixPickerState.expanded;
      updateMixPickerResults();
    } else if (action === "clear-mix-picker") {
      mixPickerState.query = "";
      mixPickerState.family = "all";
      mixPickerState.role = "all";
      mixPickerState.kind = "all";
      mixPickerState.expanded = false;
      const search = appRoot.querySelector("#mix-picker-search");
      const family = appRoot.querySelector("#mix-picker-family");
      const kind = appRoot.querySelector("#mix-picker-kind");
      const role = appRoot.querySelector("#mix-picker-role");
      if (search) search.value = "";
      if (family) family.value = "all";
      if (kind) kind.value = "all";
      if (role) role.value = "all";
      updateMixPickerResults();
    } else if (action === "prepare-client-brief") {
      clientBriefState.fields = {
        occasion: appRoot.querySelector("#client-brief-occasion")?.value || "sin definir",
        style: appRoot.querySelector("#client-brief-style")?.value || "sin preferencia",
        presence: appRoot.querySelector("#client-brief-presence")?.value || "sin definir",
        liked: appRoot.querySelector("#client-brief-liked")?.value || "",
        avoid: appRoot.querySelector("#client-brief-avoid")?.value || "",
        additional: appRoot.querySelector("#client-brief-additional")?.value || ""
      };
      clientBriefState.result = buildClientBrief(clientBriefState.fields);
      updateClientBrief();
    } else if (action === "clear-client-brief") {
      clientBriefState.fields = {};
      clientBriefState.result = null;
      updateClientBrief();
    } else if (action === "send-client-brief-to-assistant") {
      if (clientBriefState.result?.status !== "ready") throw new Error("Primero prepará un brief con suficiente dirección creativa.");
      creativeAssistantState.mode = "client";
      creativeAssistantState.description = clientBriefState.result.description;
      creativeAssistantState.result = buildCreativeRecommendations({ description: creativeAssistantState.description, mode: "client" });
      creativeAssistantState.proposals = generateFormulationProposals({ description: creativeAssistantState.description, mode: "client" });
      updateCreativeAssistant();
      window.location.hash = "#lab";
      showNotice({ title: "Brief enviado al asistente", message: "El perfil se analizó con la biblioteca local. Revisá las recomendaciones y propuestas antes de transferir materias." });
    } else if (action === "run-creative-assistant") {
      creativeAssistantState.description = appRoot.querySelector("#creative-assistant-brief")?.value || "";
      creativeAssistantState.mode = appRoot.querySelector("#creative-assistant-mode")?.value || "personal";
      creativeAssistantState.result = buildCreativeRecommendations({
        description: creativeAssistantState.description,
        mode: creativeAssistantState.mode
      });
      creativeAssistantState.proposals = generateFormulationProposals({
        description: creativeAssistantState.description,
        mode: creativeAssistantState.mode
      });
      updateCreativeAssistant();
    } else if (action === "clear-creative-assistant") {
      creativeAssistantState.description = "";
      creativeAssistantState.result = null;
      creativeAssistantState.proposals = null;
      updateCreativeAssistant();
    } else if (action === "apply-creative-assistant-suggestions") {
      const suggestions = creativeAssistantState.result?.suggestions || [];
      if (!suggestions.length) throw new Error("Primero generá una propuesta con referencias disponibles.");
      let added = 0;
      for (const suggestion of suggestions) {
        const previous = mixingState;
        mixingState = addMixNote(mixingState, suggestion.id);
        if (mixingState !== previous) added += 1;
      }
      if (added) updateMixStudio();
      showNotice({
        title: added ? "Materias enviadas al formulador" : "Materias ya presentes",
        message: added ? `${added} referencias se agregaron a tu composición. Revisá y ajustá manualmente sus puntos creativos.` : "Las referencias sugeridas ya forman parte de tu composición."
      });
    } else if (action === "analyze-inspiration-profile") {
      inspirationDifferentiationState.referenceLabel = appRoot.querySelector("#inspiration-reference-label")?.value || "";
      inspirationDifferentiationState.liked = appRoot.querySelector("#inspiration-liked")?.value || "";
      inspirationDifferentiationState.avoid = appRoot.querySelector("#inspiration-avoid")?.value || "";
      inspirationDifferentiationState.result = analyzeInspirationDifferentiation({
        referenceLabel: inspirationDifferentiationState.referenceLabel,
        liked: inspirationDifferentiationState.liked,
        avoid: inspirationDifferentiationState.avoid,
        creations: archiveState.creations
      });
      updateInspirationDifferentiation();
    } else if (action === "clear-inspiration-profile") {
      inspirationDifferentiationState.referenceLabel = "";
      inspirationDifferentiationState.liked = "";
      inspirationDifferentiationState.avoid = "";
      inspirationDifferentiationState.result = null;
      updateInspirationDifferentiation();
    } else if (action === "send-inspiration-direction") {
      const directionId = event.target.closest("[data-direction-id]")?.dataset.directionId;
      const direction = inspirationDifferentiationState.result?.directions?.find((item) => item.id === directionId);
      if (!direction) throw new Error("No se encontró esa dirección de inspiración. Analizá el perfil nuevamente.");
      creativeAssistantState.mode = "personal";
      creativeAssistantState.description = [
        inspirationDifferentiationState.liked,
        inspirationDifferentiationState.avoid ? `Evitar: ${inspirationDifferentiationState.avoid}` : "",
        direction.briefForAssistant
      ].filter(Boolean).join(". ");
      creativeAssistantState.result = buildCreativeRecommendations({ description: creativeAssistantState.description, mode: "personal" });
      creativeAssistantState.proposals = generateFormulationProposals({ description: creativeAssistantState.description, mode: "personal" });
      updateCreativeAssistant();
      window.location.hash = "#lab";
      showNotice({ title: "Dirección convertida en brief", message: `${direction.title} pasó al asistente creativo y generó nuevas alternativas. Revisalas antes de cargar una composición.` });
    } else if (action === "load-formulation-proposal") {
      const proposalId = event.target.closest("[data-proposal-id]")?.dataset.proposalId;
      const proposal = creativeAssistantState.proposals?.proposals?.find((item) => item.id === proposalId);
      if (!proposal) throw new Error("No se encontró la propuesta que querés cargar. Volvé a generar las alternativas.");
      if (mixingState.items.length && !window.confirm(`¿Reemplazar la composición actual por «${proposal.title}»? Podés usar Deshacer para recuperar la mezcla anterior.`)) return;
      mixingState = replaceMixItems(mixingState, proposal.items);
      updateMixStudio();
      showNotice({ title: "Propuesta cargada", message: `${proposal.title} se cargó con ${proposal.totalCreativePoints} puntos creativos. Podés editarla o deshacer el cambio.` });
    } else if (action === "undo-mix") {
      mixingState = undoMix(mixingState);
      updateMixStudio();
    } else if (action === "reset-mix") {
      mixingState = resetMix(mixingState);
      updateMixStudio();
    } else if (action === "save-current-as-creation") {
      await saveNewCreation(appRoot.querySelector("#archive-quick-name")?.value);
    } else if (action === "create-archive") {
      await saveNewCreation(
        appRoot.querySelector("#archive-new-name")?.value,
        appRoot.querySelector("#archive-new-description")?.value ?? ""
      );
      updateArchiveUI();
    } else if (action === "save-archive-version") {
      await saveCurrentAsVersion();
    } else if (action === "create-archive-variant") {
      await createVariantFromCurrent();
    } else if (action === "rename-archive") {
      const creation = findSelectedCreation();
      if (!creation) throw new Error("Seleccioná una creación.");
      await persistCreation(renameArchiveCreation(creation, appRoot.querySelector("#archive-rename-name")?.value));
    } else if (action === "rename-archive-variant") {
      const creation = findSelectedCreation();
      if (!creation) throw new Error("Seleccioná una creación.");
      const updated = renameArchiveVariant(creation, archiveState.selectedVariantId, appRoot.querySelector("#archive-variant-name")?.value);
      await persistCreation(updated, "Nombre de variante actualizado.");
    } else if (action === "compare-archive-variants") {
      const creation = findSelectedCreation();
      archiveState.comparison = compareArchiveVariants(
        creation,
        appRoot.querySelector("#archive-compare-left")?.value,
        appRoot.querySelector("#archive-compare-right")?.value
      );
      updateArchiveUI();
    } else if (action === "compare-saved-compositions") {
      const leftKey = appRoot.querySelector("#comparison-left")?.value;
      const rightKey = appRoot.querySelector("#comparison-right")?.value;
      compareSavedCompositions(archiveState.creations, leftKey, rightKey);
      archiveState.comparisonPair = { leftKey, rightKey };
      updateArchiveUI();
    } else if (action === "save-sensory-experiment") {
      await saveSensoryExperimentFromForm();
    } else if (action === "delete-sensory-experiment") {
      const id = event.target.closest("[data-experiment-id]")?.dataset.experimentId;
      const experiment = archiveState.experiments.find((item) => item.id === id);
      if (experiment && window.confirm(`¿Eliminar la observación «${experiment.title}»? Esta acción no modifica la fórmula.`)) {
        await archiveRepository.removeExperiment(id);
        await refreshArchive();
        showNotice({ title: "Observación eliminada", message: "El registro sensorial se eliminó del dispositivo." });
      }
    } else if (action === "generate-professional-report") {
      const key = appRoot.querySelector("#professional-report-variant")?.value;
      let selection;
      try { selection = JSON.parse(String(key || "")); }
      catch { throw new Error("Seleccioná una variante válida para el informe."); }
      const creation = archiveState.creations.find((item) => item.id === selection.creationId);
      const variant = creation?.variants?.find((item) => item.id === selection.variantId);
      if (!creation || !variant) throw new Error("La creación o variante seleccionada ya no existe.");
      archiveState.reportSelection = String(key);
      archiveState.professionalReport = buildProfessionalReport({
        creation, variant, experiments: archiveState.experiments
      });
      const reportPanel = appRoot.querySelector("#professional-reports-root");
      if (reportPanel) reportPanel.outerHTML = renderProfessionalReports(archiveState);
      showNotice({ title: "Informe generado", message: `Dossier preparado para ${creation.name} · variante ${variant.label} · versión ${archiveState.professionalReport.variant.versionNumber}.` });
    } else if (action === "print-professional-report") {
      if (!archiveState.professionalReport) throw new Error("Generá un informe antes de imprimirlo.");
      const cleanup = () => document.body.classList.remove("printing-professional-report");
      window.addEventListener("afterprint", cleanup, { once: true });
      document.body.classList.add("printing-professional-report");
      window.print();
    } else if (action === "export-professional-report-csv") {
      if (!archiveState.professionalReport) throw new Error("Generá un informe antes de exportar CSV.");
      downloadText(
        toProfessionalReportCsv(archiveState.professionalReport),
        `${safeFilename(archiveState.professionalReport.creation.name)}-informe.csv`,
        "text/csv;charset=utf-8"
      );
      showNotice({ title: "CSV exportado", message: "El informe tabular está listo para abrirse en una hoja de cálculo." });
    } else if (action === "export-professional-report-json") {
      if (!archiveState.professionalReport) throw new Error("Generá un informe antes de exportar JSON.");
      downloadJson(archiveState.professionalReport, `${safeFilename(archiveState.professionalReport.creation.name)}-informe.json`);
      showNotice({ title: "Informe JSON exportado", message: "El archivo incluye composición, análisis editorial y observaciones sensoriales." });
    } else if (action === "export-sensory-backup") {
      const backup = buildSensoryBackup(archiveState.experiments);
      downloadJson(backup, `jb-perfume-lab-sensory-${new Date().toISOString().slice(0,10)}.json`);
      showNotice({ title: "Respaldo sensorial preparado", message: "Guardá el JSON fuera del dispositivo para conservar tus observaciones." });
    } else if (action === "delete-archive") {
      const id = event.target.closest("[data-archive-id]")?.dataset.archiveId ?? archiveState.selectedCreationId;
      const creation = archiveState.creations.find((item) => item.id === id);
      if (creation && window.confirm(`¿Eliminar «${creation.name}» y todo su historial? Exportá un respaldo antes si necesitás conservarlo.`)) {
        await archiveRepository.removeExperimentsForCreation(id);
        await archiveRepository.remove(id);
        archiveState.selectedCreationId = null;
        archiveState.selectedVariantId = null;
        archiveState.comparison = null;
        await refreshArchive();
        showNotice({ title: "Creación eliminada", message: "El archivo local se actualizó." });
      }
    } else if (action === "export-archive-backup") {
      const backup = buildArchiveBackup(archiveState.creations);
      downloadJson(backup, `jb-perfume-lab-backup-${new Date().toISOString().slice(0,10)}.json`);
      showNotice({ title: "Respaldo preparado", message: "Guardá el archivo JSON fuera del teléfono o en otro lugar seguro." });
    } else if (action === "export-single-archive") {
      const creation = findSelectedCreation();
      if (!creation) throw new Error("Seleccioná una creación para exportar.");
      downloadJson(buildArchiveBackup([creation]), `${safeFilename(creation.name)}.json`);
      showNotice({ title: "Creación exportada", message: "El archivo JSON incluye sus variantes y el historial de versiones." });
    }
  } catch (error) {
    handleArchiveError(error);
  }
});

appRoot.addEventListener("dragstart", (event) => {
  const source = event.target.closest("[data-drag-note]");
  if (!source || !event.dataTransfer) return;
  event.dataTransfer.effectAllowed = "copy";
  event.dataTransfer.setData("text/plain", source.dataset.dragNote);
});

appRoot.addEventListener("dragover", (event) => {
  const dropZone = event.target.closest("[data-mix-dropzone]");
  if (!dropZone) return;
  event.preventDefault();
  dropZone.classList.add("is-drag-over");
  if (event.dataTransfer) event.dataTransfer.dropEffect = "copy";
});

appRoot.addEventListener("dragleave", (event) => {
  const dropZone = event.target.closest("[data-mix-dropzone]");
  if (dropZone && !dropZone.contains(event.relatedTarget)) dropZone.classList.remove("is-drag-over");
});

appRoot.addEventListener("drop", (event) => {
  const dropZone = event.target.closest("[data-mix-dropzone]");
  if (!dropZone) return;
  event.preventDefault();
  dropZone.classList.remove("is-drag-over");
  addNoteToMix(event.dataTransfer?.getData("text/plain"));
});

document.addEventListener("click", (event) => {
  const action = event.target.closest("[data-action]")?.dataset.action;
  if (action === "apply-update") pwa.applyUpdate();
  if (action === "dismiss-notice") {
    if (noticeTitle?.textContent === "Nueva versión disponible") pwa.dismissUpdateNotice();
    hideNotice();
  }
});

window.addEventListener("hashchange", render);

try {
  const savedTheme = localStorage.getItem("jb-vpl-theme");
  if (savedTheme === "light" || savedTheme === "dark") document.documentElement.dataset.theme = savedTheme;
} catch {
  // Use the default theme when browser storage is unavailable.
}

render();
pwa.init();
refreshArchive().then(() => render());
