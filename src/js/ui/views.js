import { renderPerfumeLibrary } from "../features/perfume-library/library.js";
import { renderMixStudio } from "../features/laboratory/mixing/panel.js";
import { renderCreativeAnalysis } from "../features/laboratory/analysis/panel.js";
import { renderEvolutionSimulator } from "../features/laboratory/evolution/panel.js";
import { renderPerformanceEstimate } from "../features/laboratory/performance-estimator/panel.js";
import { renderPerformanceCalibration } from "../features/laboratory/performance-estimator/calibration-panel.js";
import { renderAnalyticsDashboard } from "../features/laboratory/analytics/dashboard.js";
import { renderOriginalityAnalysis } from "../features/laboratory/originality/panel.js";
import { renderArchiveView, renderArchiveQuickSave } from "../features/archive/panel.js";
import { renderAnalyticalComparison } from "../features/laboratory/comparison/panel.js";
import { renderPersonalSignatureHistory } from "../features/laboratory/signature-history/panel.js";
import { renderSensoryExperiments } from "../features/laboratory/sensory-experiments/panel.js";
import { renderProfessionalReports } from "../features/laboratory/professional-reports/panel.js";
import { renderCreativeAssistant } from "../features/laboratory/creative-assistant/panel.js";
import { renderFormulationProposals } from "../features/laboratory/formulation-proposals/panel.js";
import { renderInspirationDifferentiation } from "../features/laboratory/inspiration-differentiation/panel.js";
import { renderClientBriefPanel } from "../features/laboratory/client-brief/panel.js";
import { renderAudienceFit } from "../features/laboratory/audience-fit/panel.js";
import { renderProfileHistory } from "../features/laboratory/profile-history/panel.js";

const navItems = [
  { id: "home", label: "Inicio", icon: "⌂" },
  { id: "lab", label: "Laboratorio", icon: "◈" },
  { id: "notes", label: "Notas", icon: "✳" },
  { id: "projects", label: "Creaciones", icon: "▤" }
];

function navLink(item, activeView, compact = false) {
  const active = item.id === activeView;
  return `<a class="nav-link ${active ? "is-active" : ""} ${compact ? "nav-link--compact" : ""}" href="#${item.id}" data-nav="${item.id}" ${active ? 'aria-current="page"' : ""}>
    <span class="nav-icon" aria-hidden="true">${item.icon}</span><span>${item.label}</span>
  </a>`;
}

function homeView(archiveState = {}, mixingState = { items: [] }) {
  return `
    ${renderAnalyticsDashboard(archiveState, mixingState)}
    ${renderPersonalSignatureHistory(archiveState)}
    <section class="dashboard-shortcuts" aria-label="Áreas de trabajo">
      <a class="dashboard-shortcut" href="#lab" data-nav="lab"><span>01</span><div><strong>Constructor de fórmulas</strong><small>Combiná referencias y distribuí los puntos creativos.</small></div><b>↗</b></a>
      <a class="dashboard-shortcut" href="#notes" data-nav="notes"><span>02</span><div><strong>Biblioteca olfativa</strong><small>Consultá familias, perfiles y roles orientativos.</small></div><b>↗</b></a>
      <a class="dashboard-shortcut" href="#projects" data-nav="projects"><span>03</span><div><strong>Archivo de creaciones</strong><small>Guardá variantes, versiones y evolución del trabajo.</small></div><b>↗</b></a>
    </section>
  `;
}

function labView(mixingState, analysisDirection = "balanced", evolutionStage = "opening", archiveState = {}, mixPickerState = {}, creativeAssistantState = {}, inspirationDifferentiationState = {}, clientBriefState = {}) {
  return `
    <section class="page-intro lab-page-intro">
      <p class="eyebrow">FORMULATION WORKSPACE · JB PERFUME LAB</p>
      <h1>Constructor de <em>fórmulas</em></h1>
      <p>Desarrollá composiciones conceptuales, estudiá su estructura y documentá cómo evoluciona tu identidad creativa.</p>
    </section>
    <nav class="lab-section-nav" aria-label="Secciones del laboratorio">
      <a href="#mix-studio">Composición</a>
      <a href="#creative-assistant">Asistente</a>
      <a href="#creative-analysis">Análisis</a>
      <a href="#originality-analysis">Originalidad</a>
      <a href="#evolution-simulator">Evolución</a>
      <a href="#performance-estimate">Rendimiento</a>
    </nav>
    ${renderMixStudio(mixingState, mixPickerState)}
    <div id="audience-fit-root">${renderAudienceFit(mixingState.items)}</div>
    ${renderClientBriefPanel(clientBriefState)}
    ${renderCreativeAssistant(creativeAssistantState)}
    ${renderFormulationProposals({ result: creativeAssistantState.proposals })}
    ${renderInspirationDifferentiation(inspirationDifferentiationState)}
    ${renderArchiveQuickSave(archiveState)}
    ${renderCreativeAnalysis(mixingState, analysisDirection)}
    ${renderOriginalityAnalysis(mixingState, archiveState.creations || [])}
    ${renderEvolutionSimulator(mixingState, evolutionStage)}
    ${renderPerformanceEstimate(mixingState.items, {}, archiveState.experiments || [])}
    <p class="lab-boundary-note">Los puntos son ponderaciones creativas normalizadas para explorar conceptos. No equivalen a porcentajes de ingredientes, concentraciones, dosificaciones ni fórmulas de fabricación.</p>
  `;
}

function notesView(libraryState) {
  return renderPerfumeLibrary(libraryState);
}

function projectsView(archiveState = {}) {
  return `${renderArchiveView(archiveState)}${renderAnalyticalComparison(archiveState)}${renderProfileHistory(archiveState)}${renderSensoryExperiments(archiveState)}${renderPerformanceCalibration(archiveState.experiments)}${renderProfessionalReports(archiveState)}`;
}

export function renderPage(activeView = "home", libraryState = {}, mixingState = { items: [], history: [] }, analysisDirection = "balanced", evolutionStage = "opening", archiveState = {}, mixPickerState = {}, creativeAssistantState = {}, inspirationDifferentiationState = {}, clientBriefState = {}) {
  const current = ["home", "lab", "notes", "projects"].includes(activeView) ? activeView : "home";
  const content = current === "home"
    ? homeView(archiveState, mixingState)
    : current === "lab"
      ? labView(mixingState, analysisDirection, evolutionStage, archiveState, mixPickerState, creativeAssistantState, inspirationDifferentiationState, clientBriefState)
      : current === "notes"
        ? notesView(libraryState)
        : projectsView(archiveState);
  return `
    <div class="app-shell">
      <header class="topbar">
        <a class="brand" href="#home" data-nav="home" aria-label="JB Perfume Lab, inicio">
          <img class="brand-logo" src="./assets/brand-logo.svg" alt="Perfumería JB">
          <span class="brand-type"><strong>JB</strong><small>PERFUME LAB</small></span>
        </a>
        <div class="topbar-right">
          <span class="topbar-label">FORMULATION · ANALYTICS · CREATIVE IDENTITY</span>
          <button class="topbar-action" type="button" data-action="check-updates" aria-label="Buscar actualizaciones" title="Buscar actualizaciones"><span aria-hidden="true">↻</span><span class="topbar-action-label">Buscar versión</span></button>
          <button class="topbar-action topbar-action--install" type="button" data-action="install"><span aria-hidden="true">↓</span><span class="topbar-action-label">Instalar</span></button>
          <button class="icon-button" type="button" data-action="theme" aria-label="Cambiar tema" title="Cambiar tema"><span aria-hidden="true">◐</span></button>
        </div>
      </header>
      <div class="layout">
        <aside class="sidebar"><div class="sidebar-label">WORKSPACE</div><nav aria-label="Navegación principal">${navItems.map(item => navLink(item, current)).join("")}</nav><div class="sidebar-bottom"><span class="sidebar-line"></span><small>FORMULACIÓN CONCEPTUAL<br>Y DESARROLLO CREATIVO</small><span class="sidebar-version">JB PERFUME LAB · V1.0</span></div></aside>
        <main class="main-content" id="main-content" tabindex="-1">${content}</main>
      </div>
      <nav class="mobile-nav" aria-label="Navegación móvil">${navItems.map(item => navLink(item, current, true)).join("")}</nav>
      <footer class="app-footer"><span>JB PERFUME LAB</span><span>ANÁLISIS CONCEPTUAL · NO QUÍMICO</span></footer>
    </div>
  `;
}
