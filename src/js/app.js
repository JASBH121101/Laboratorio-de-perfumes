import { resolveView } from "./core/navigation.js";
import { createPwaManager } from "./core/pwa.js";
import { renderLibraryDetail, renderLibraryResults } from "./features/perfume-library/library.js";
import { renderLabInspector } from "./features/laboratory/inspector.js";
import { addMixNote, createMixState, removeMixNote, resetMix, setMixNotePoints, undoMix } from "./features/laboratory/mixing/state.js";
import { renderMixStudio } from "./features/laboratory/mixing/panel.js";
import { renderCreativeAnalysis } from "./features/laboratory/analysis/panel.js";\nimport { renderEvolutionSimulator } from "./features/laboratory/evolution/panel.js";
import { renderPage } from "./ui/views.js";

const appRoot = document.querySelector("#app");
const notice = document.querySelector("#app-notice");
const noticeTitle = document.querySelector("#app-notice-title");
const noticeMessage = document.querySelector("#app-notice-message");
const noticeAction = document.querySelector("#app-notice-action");

const libraryState = { query: "", family: "all", role: "all", selectedId: null };
let mixingState = createMixState();
let analysisDirection = "balanced";\nlet evolutionStage = "opening";
let selectedLabPropId = null;
let labController = null;
let renderCycle = 0;

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

function mountLabScene(cycle) {
  const stage = appRoot.querySelector("[data-lab-stage]");
  if (!stage) return;

  import("./features/laboratory/scene.js")
    .then(({ mountLaboratory }) => {
      if (cycle !== renderCycle || !stage.isConnected) return;
      labController = mountLaboratory(stage);
      labController.setComposition(mixingState.items);
    })
    .catch((error) => {
      if (cycle !== renderCycle || !stage.isConnected) return;
      const canvasHost = stage.querySelector("[data-lab-canvas]");
      if (canvasHost) {
        canvasHost.innerHTML = `
          <div class="lab-webgl-fallback">
            <strong>No se pudo cargar el motor 3D</strong>
            <span>Revisa tu conexión o vuelve a cargar la sección. La biblioteca y el resto del laboratorio siguen disponibles.</span>
          </div>
        `;
      }
      console.warn("No se pudo cargar el módulo 3D:", error);
    });
}

function render() {
  labController?.dispose();
  labController = null;
  const cycle = ++renderCycle;
  const activeView = resolveView(window.location.hash);
  appRoot.innerHTML = renderPage(activeView, libraryState, mixingState, analysisDirection, evolutionStage);

  if (pwa.isInstalled()) {
    appRoot.querySelectorAll("[data-action='install']").forEach((button) => {
      button.hidden = true;
      button.setAttribute("aria-hidden", "true");
    });
  }

  if (activeView === "lab") mountLabScene(cycle);
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

function updateEvolutionSimulator() {\n  const panel = appRoot.querySelector("#evolution-simulator");\n  if (panel) panel.outerHTML = renderEvolutionSimulator(mixingState, evolutionStage);\n}\n\nfunction updateCreativeAnalysis() {
  const panel = appRoot.querySelector("#creative-analysis");
  if (panel) panel.outerHTML = renderCreativeAnalysis(mixingState, analysisDirection);
}

function updateMixStudio() {
  const panel = appRoot.querySelector("#mix-studio");
  if (panel) panel.outerHTML = renderMixStudio(mixingState);
  labController?.setComposition(mixingState.items);
  updateCreativeAnalysis();
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

appRoot.addEventListener("lab:item-selected", (event) => {
  updateLabInspector(event.detail?.id ?? null);
});

appRoot.addEventListener("input", (event) => {
  if (event.target.id === "library-search") {
    libraryState.query = event.target.value;
    updateLibrary();
  }
});

appRoot.addEventListener("change", (event) => {
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

  const evolutionTarget = event.target.closest("[data-evolution-stage]");\n  if (evolutionTarget) {\n    evolutionStage = evolutionTarget.dataset.evolutionStage;\n    updateEvolutionSimulator();\n    return;\n  }\n\n  const removeMixTarget = event.target.closest("[data-remove-mix-note]");
  if (removeMixTarget) {
    mixingState = removeMixNote(mixingState, removeMixTarget.dataset.removeMixNote);
    updateMixStudio();
    return;
  }

  const action = event.target.closest("[data-action]")?.dataset.action;
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
    labController?.resetCamera();
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
