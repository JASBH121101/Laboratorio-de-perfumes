import { resolveView } from "./core/navigation.js";
import { createPwaManager } from "./core/pwa.js";
import { renderLibraryDetail, renderLibraryResults } from "./features/perfume-library/library.js";
import { renderLabInspector } from "./features/laboratory/inspector.js";
import { formatLabPerformanceReport } from "./features/laboratory/performance-audit.js";
import { addMixNote, createMixState, removeMixNote, resetMix, setMixNotePoints, undoMix } from "./features/laboratory/mixing/state.js";
import { renderMixStudio } from "./features/laboratory/mixing/panel.js";
import { renderCreativeAnalysis } from "./features/laboratory/analysis/panel.js";
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
const archiveRepository = createArchiveRepository();

let mixingState = createMixState();
let analysisDirection = "balanced";
let evolutionStage = "opening";
let selectedLabPropId = null;
let labController = null;
let renderCycle = 0;
let archiveState = {
  creations: [],
  selectedCreationId: null,
  selectedVariantId: null,
  comparison: null,
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

function updateArchiveUI() {
  const archiveRoot = appRoot.querySelector("#archive-root");
  if (archiveRoot) archiveRoot.outerHTML = renderArchiveView(archiveState);
  const quickSave = appRoot.querySelector("#archive-quick-save");
  if (quickSave) quickSave.outerHTML = renderArchiveQuickSave(archiveState);
}

async function refreshArchive() {
  try {
    archiveState.creations = await archiveRepository.list();
    archiveState.storageMode = archiveRepository.getStorageMode();
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

function loadVariantIntoLab(creation, variant) {
  if (!creation || !variant) throw new Error("No se encontró la creación o variante seleccionada.");
  archiveState.selectedCreationId = creation.id;
  archiveState.selectedVariantId = variant.id;
  archiveState.comparison = null;
  mixingState = { items: variant.items.map((item) => ({ ...item })), history: [] };
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
  labController?.dispose();
  labController = null;
  const cycle = ++renderCycle;
  const activeView = resolveView(window.location.hash);
  appRoot.innerHTML = renderPage(activeView, libraryState, mixingState, analysisDirection, evolutionStage, archiveState);

  if (pwa.isInstalled()) {
    appRoot.querySelectorAll("[data-action='install']").forEach((button) => {
      button.hidden = true;
      button.setAttribute("aria-hidden", "true");
    });
  }
  if (activeView === "lab") mountLabScene(cycle);
}

function mountLabScene(cycle) {
  const stage = appRoot.querySelector("[data-lab-stage]");
  if (!stage) return;
  import("./features/laboratory/scene.js")
    .then(({ mountLaboratory }) => {
      if (cycle !== renderCycle || !stage.isConnected) return;
      labController = mountLaboratory(stage);
      labController.setComposition(mixingState.items);
      const modeLabel = stage.querySelector("[data-scene-mode-label]");
      if (modeLabel) modeLabel.textContent = stage.dataset.sceneMode === "experiment" ? "EXPERIMENT VIEW" : "ATELIER VIEW";
    })
    .catch((error) => {
      if (cycle !== renderCycle || !stage.isConnected) return;
      const canvasHost = stage.querySelector("[data-lab-canvas]");
      if (canvasHost) canvasHost.innerHTML = `<div class="lab-webgl-fallback"><strong>No se pudo cargar el motor 3D</strong><span>Revisa tu conexión o vuelve a cargar la sección. La biblioteca y el resto del laboratorio siguen disponibles.</span></div>`;
      console.warn("No se pudo cargar el módulo 3D:", error);
    });
}

function updateLibrary() {
  const results = appRoot.querySelector("#library-results");
  const detail = appRoot.querySelector("#library-detail");
  if (results) results.innerHTML = renderLibraryResults(libraryState);
  if (detail) detail.outerHTML = renderLibraryDetail(libraryState.selectedId, mixingState);
}

function updateLabInspector(propId = selectedLabPropId) {
  selectedLabPropId = propId;
  const inspector = appRoot.querySelector("#lab-inspector");
  if (inspector) inspector.innerHTML = renderLabInspector(propId, mixingState);
}

function updateEvolutionSimulator() {
  const panel = appRoot.querySelector("#evolution-simulator");
  if (panel) panel.outerHTML = renderEvolutionSimulator(mixingState, evolutionStage);
}

function updateCreativeAnalysis() {
  const panel = appRoot.querySelector("#creative-analysis");
  if (panel) panel.outerHTML = renderCreativeAnalysis(mixingState, analysisDirection);
}

function updateMixStudio() {
  const panel = appRoot.querySelector("#mix-studio");
  if (panel) panel.outerHTML = renderMixStudio(mixingState);
  labController?.setComposition(mixingState.items);
  const sceneStage = appRoot.querySelector("[data-lab-stage]");
  const modeLabel = sceneStage?.querySelector("[data-scene-mode-label]");
  if (modeLabel) modeLabel.textContent = sceneStage.dataset.sceneMode === "experiment" ? "EXPERIMENT VIEW" : "ATELIER VIEW";
  updateCreativeAnalysis();
  updateEvolutionSimulator();
  updateLibrary();
  updateLabInspector();
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
  showNotice({ title: "Referencia añadida", message: "La composición conceptual y el recipiente 3D se actualizaron." });
}

async function saveNewCreation(name, description = "") {
  const creation = createArchiveCreation({ name, description, items: mixingState.items });
  await persistCreation(creation, `${creation.name} se guardó como una creación independiente.`);
  archiveState.selectedCreationId = creation.id;
  archiveState.selectedVariantId = creation.activeVariantId;
  archiveState.comparison = null;
  updateArchiveUI();
}

async function saveCurrentAsVersion() {
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

appRoot.addEventListener("lab:item-selected", (event) => updateLabInspector(event.detail?.id ?? null));

appRoot.addEventListener("input", (event) => {
  if (event.target.id === "library-search") {
    libraryState.query = event.target.value;
    updateLibrary();
  }
});

appRoot.addEventListener("change", async (event) => {
  if (event.target.id === "library-family") {
    libraryState.family = event.target.value;
    updateLibrary();
  } else if (event.target.id === "library-role") {
    libraryState.role = event.target.value;
    updateLibrary();
  }
  if (event.target.matches("[data-mix-weight]")) {
    mixingState = setMixNotePoints(mixingState, event.target.dataset.mixWeight, event.target.value);
    updateMixStudio();
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
    const updated = activateArchiveVariant(creation, selectVariant.dataset.selectVariant);
    archiveState.selectedVariantId = selectVariant.dataset.selectVariant;
    archiveState.comparison = null;
    await persistCreation(updated, `Variante ${getVariant(updated, archiveState.selectedVariantId).label} seleccionada.`);
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
    await persistCreation(updated, `Se restauró el contenido histórico como una versión nueva de la variante ${variant.label}.`);
    return;
  }

  const cameraPreset = event.target.closest("[data-camera-preset]")?.dataset.cameraPreset;
  if (cameraPreset) {
    const actualExperimentMode = labController?.setCameraPreset?.(cameraPreset) === true;
    const activePreset = actualExperimentMode ? "experiment" : cameraPreset;
    const sceneStage = appRoot.querySelector("[data-lab-stage]");
    const modeLabel = sceneStage?.querySelector("[data-scene-mode-label]");
    if (modeLabel) modeLabel.textContent = sceneStage.dataset.sceneMode === "experiment" ? "EXPERIMENT VIEW" : "ATELIER VIEW";
    appRoot.querySelectorAll("[data-camera-preset]").forEach((button) => {
      const active = button.dataset.cameraPreset === activePreset;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
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
    } else if (action === "reset-lab-camera") {
      const experimentMode = labController?.resetCamera?.() === true;
      const activePreset = experimentMode ? "experiment" : "overview";
      const sceneStage = appRoot.querySelector("[data-lab-stage]");
      const modeLabel = sceneStage?.querySelector("[data-scene-mode-label]");
      if (modeLabel) modeLabel.textContent = sceneStage.dataset.sceneMode === "experiment" ? "EXPERIMENT VIEW" : "ATELIER VIEW";
      appRoot.querySelectorAll("[data-camera-preset]").forEach((button) => {
        const active = button.dataset.cameraPreset === activePreset;
        button.classList.toggle("is-active", active);
        button.setAttribute("aria-pressed", String(active));
      });
    } else if (action === "run-lab-performance-audit") {
      const button = appRoot.querySelector("[data-action='run-lab-performance-audit']");
      const reportOutput = appRoot.querySelector("#lab-performance-report");
      if (!button || !reportOutput || typeof labController?.runPerformanceAudit !== "function") {
        showNotice({ title: "Diagnóstico 3D", message: "La escena todavía se está preparando. Intentá de nuevo cuando aparezca SCENE READY." });
        return;
      }
      button.disabled = true;
      button.textContent = "Midiendo…";
      reportOutput.hidden = false;
      reportOutput.textContent = "Ejecutando una prueba breve de renderizado activo. No cierres esta vista.";
      try {
        const report = await labController.runPerformanceAudit();
        reportOutput.textContent = formatLabPerformanceReport(report);
      } catch (error) {
        reportOutput.textContent = `No se pudo completar el diagnóstico: ${error instanceof Error ? error.message : "error desconocido"}`;
      } finally {
        button.disabled = false;
        button.textContent = "Medir de nuevo";
      }
    } else if (action === "clear-lab-selection") {
      labController?.clearSelection();
      updateLabInspector(null);
    } else if (action === "add-picked-note") {
      addNoteToMix(appRoot.querySelector("#mix-note-picker")?.value);
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
    } else if (action === "delete-archive") {
      const id = event.target.closest("[data-archive-id]")?.dataset.archiveId ?? archiveState.selectedCreationId;
      const creation = archiveState.creations.find((item) => item.id === id);
      if (creation && window.confirm(`¿Eliminar «${creation.name}» y todo su historial? Exportá un respaldo antes si necesitás conservarlo.`)) {
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
  if (action === "dismiss-notice") hideNotice();
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
