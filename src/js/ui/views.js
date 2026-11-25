import { renderPerfumeLibrary } from "../features/perfume-library/library.js";
import { renderLabInspector } from "../features/laboratory/inspector.js";
import { renderMixStudio } from "../features/laboratory/mixing/panel.js";
import { renderCreativeAnalysis } from "../features/laboratory/analysis/panel.js";
import { renderEvolutionSimulator } from "../features/laboratory/evolution/panel.js";
import { renderArchiveView, renderArchiveQuickSave } from "../features/archive/panel.js";

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

function homeView() {
  return `
    <section class="hero-panel">
      <div class="hero-copy">
        <p class="eyebrow"><span class="eyebrow-dot"></span> ATELIER DIGITAL · NICARAGUA</p>
        <h1>Las ideas también<br><em>tienen aroma.</em></h1>
        <p class="hero-description">Un espacio para investigar, combinar y dar forma a conceptos de fragancias. Tu proceso creativo empieza aquí.</p>
        <div class="hero-actions">
          <a class="button button--primary" href="#lab" data-nav="lab">Abrir laboratorio 3D <span aria-hidden="true">↗</span></a>
          <button class="button button--secondary" type="button" data-action="install">Instalar aplicación</button>
        </div>
      </div>
      <div class="hero-art" aria-label="Ilustración abstracta de un frasco de perfume" role="img">
        <div class="orb orb--one"></div><div class="orb orb--two"></div><div class="bottle-shadow"></div>
        <div class="perfume-bottle"><div class="bottle-cap"></div><div class="bottle-neck"></div><div class="bottle-glass"><div class="bottle-liquid"></div><div class="bottle-label"><small>JB</small><strong>ATELIER</strong><span>NO. 001</span></div></div></div>
        <div class="art-caption"><span>04 / 08</span><span>THE CREATIVE JOURNEY</span></div>
      </div>
    </section>
    <div class="section-heading"><div><p class="eyebrow">PUNTO DE PARTIDA</p><h2>Tu espacio creativo</h2></div><span class="section-counter">04 — 3D LABORATORY</span></div>
    <section class="feature-grid" aria-label="Áreas del laboratorio">
      <a class="feature-card feature-card--current" href="#lab" data-nav="lab"><span class="card-kicker">01 · 3D WORKSPACE</span><span class="feature-symbol">◈</span><h3>Laboratorio 3D</h3><p>Inspeccioná frascos, viales y herramientas en una escena tridimensional interactiva.</p><span class="card-link">Entrar al laboratorio <b>↗</b></span></a>
      <a class="feature-card" href="#notes" data-nav="notes"><span class="card-kicker">02 · LIBRARY</span><span class="feature-symbol">✳</span><h3>Biblioteca olfativa</h3><p>Notas y acordes organizados por familia, ubicación y perfil sensorial.</p><span class="card-link">Abrir biblioteca <b>↗</b></span></a>
      <a class="feature-card" href="#projects" data-nav="projects"><span class="card-kicker">03 · ARCHIVE</span><span class="feature-symbol">▤</span><h3>Mis creaciones</h3><p>Un archivo para conservar ideas, versiones y decisiones.</p><span class="card-link">Ver planificación <b>↗</b></span></a>
    </section>
    <section class="roadmap-panel">
      <div class="roadmap-intro"><p class="eyebrow">CONSTRUCCIÓN POR ETAPAS</p><h2>De una idea<br>a una fragancia.</h2><p>El laboratorio se construirá por bloques, validando cada fundamento antes de avanzar.</p></div>
      <div class="roadmap-list">
        <div class="roadmap-step is-complete"><span class="step-number">01</span><div><strong>Foundation & Architecture</strong><small>Base PWA, navegación y estructura</small></div><span class="step-status">COMPLETADO</span></div>
        <div class="roadmap-step is-complete"><span class="step-number">02</span><div><strong>Design System & PWA Experience</strong><small>Diseño, instalación y actualizaciones</small></div><span class="step-status">COMPLETADO</span></div>
        <div class="roadmap-step is-complete"><span class="step-number">03</span><div><strong>Perfume Library</strong><small>60 notas y acordes con fichas educativas</small></div><span class="step-status">COMPLETADO</span></div>
        <div class="roadmap-step is-current"><span class="step-number">04</span><div><strong>3D Laboratory Core</strong><small>Escena 3D, cámara táctil e inspección</small></div><span class="step-status">EN CURSO</span></div>
      </div>
    </section>
    <p class="disclaimer">Los perfiles y mezclas del laboratorio serán representaciones creativas conceptuales; no equivalen a fórmulas químicas ni predicen el rendimiento de una fragancia real.</p>
  `;
}

function labView(mixingState, analysisDirection = "balanced", evolutionStage = "opening", archiveState = {}) {
  return `
    <section class="page-intro lab-page-intro">
      <p class="eyebrow">BLOCK 04 · INTERACTIVE WORKSPACE</p>
      <h1>Laboratorio <em>3D</em></h1>
      <p>Explorá objetos 3D y comenzá una composición creativa con notas de la biblioteca. Ajustá su peso visual sin crear una fórmula química.</p>
    </section>
    <div class="lab-overview-strip">
      <span><strong>08</strong><small>OBJETOS INTERACTIVOS</small></span>
      <span><strong>01</strong><small>ESCENA 3D</small></span>
      <span><strong>TOUCH</strong><small>CONTROLES ANDROID</small></span>
      <span class="lab-engine-version">THREE.JS · R187</span>
    </div>
    <section class="lab-workspace">
      <div class="lab-stage" data-lab-stage>
        <div class="lab-stage-top">
          <span class="status-pill">JB ATELIER · 3D VIEW</span>
          <span class="lab-stage-live"><span></span> SCENE READY</span>
        </div>
        <div class="lab-canvas" data-lab-canvas>
          <div class="lab-loading"><span class="lab-loading-mark">JB</span><strong>Preparando el laboratorio</strong><small>Cargando escena tridimensional…</small></div>
        </div>
        <div class="lab-stage-bottom">
          <span>ARRASTRÁ PARA GIRAR · PELLIZCÁ PARA ZOOM</span>
          <button type="button" class="lab-reset-button" data-action="reset-lab-camera">Recentrar cámara ↺</button>
        </div>
      </div>
      <aside class="lab-inspector" id="lab-inspector" aria-live="polite">
        ${renderLabInspector(null, mixingState)}
      </aside>
    </section>
    <section class="lab-gesture-guide" aria-label="Controles del laboratorio 3D">
      <div><span class="gesture-icon">↔</span><div><strong>Girar la escena</strong><small>Arrastrá con un dedo o mouse</small></div></div>
      <div><span class="gesture-icon">⊕</span><div><strong>Acercar o alejar</strong><small>Pellizcá con dos dedos o usá la rueda</small></div></div>
      <div><span class="gesture-icon">◎</span><div><strong>Inspeccionar</strong><small>Tocá un objeto para abrir su ficha</small></div></div>
    </section>
    ${renderMixStudio(mixingState)}
    ${renderArchiveQuickSave(archiveState)}
    ${renderCreativeAnalysis(mixingState, analysisDirection)}
    ${renderEvolutionSimulator(mixingState, evolutionStage)}
    <p class="lab-boundary-note">Los puntos de composición son ponderaciones creativas abstractas. No representan porcentajes, concentraciones ni dosificaciones reales.</p>
  `;
}

function notesView(libraryState) {
  return renderPerfumeLibrary(libraryState);
}

function projectsView(archiveState = {}) {
  return renderArchiveView(archiveState);
}

const viewContent = {
  home: () => homeView(),
  lab: (mixingState, analysisDirection, evolutionStage, archiveState) => labView(mixingState, analysisDirection, evolutionStage, archiveState),
  notes: (libraryState) => notesView(libraryState),
  projects: (_libraryState, _analysisDirection, _evolutionStage, archiveState) => projectsView(archiveState)
};

export function renderPage(activeView = "home", libraryState = {}, mixingState = { items: [], history: [] }, analysisDirection = "balanced", evolutionStage = "opening", archiveState = {}) {
  const current = viewContent[activeView] ? activeView : "home";
  return `
    <div class="app-shell">
      <header class="topbar">
        <a class="brand" href="#home" data-nav="home" aria-label="Perfumería JB, inicio">
          <img class="brand-logo" src="./assets/brand-logo.svg" alt="Perfumería JB">
          <span class="brand-type"><strong>JB</strong><small>VIRTUAL PERFUME LAB</small></span>
        </a>
        <div class="topbar-right">
          <span class="topbar-label">PERSONAL CREATIVE SPACE</span>
          <button class="topbar-action" type="button" data-action="check-updates" aria-label="Buscar actualizaciones" title="Buscar actualizaciones"><span aria-hidden="true">↻</span><span class="topbar-action-label">Actualizar</span></button>
          <button class="topbar-action topbar-action--install" type="button" data-action="install"><span aria-hidden="true">↓</span><span class="topbar-action-label">Instalar</span></button>
          <button class="icon-button" type="button" data-action="theme" aria-label="Cambiar tema" title="Cambiar tema"><span aria-hidden="true">◐</span></button>
        </div>
      </header>
      <div class="layout">
        <aside class="sidebar"><div class="sidebar-label">WORKSPACE</div><nav aria-label="Navegación principal">${navItems.map(item => navLink(item, current)).join("")}</nav><div class="sidebar-bottom"><span class="sidebar-line"></span><small>CREADO PARA EXPLORAR<br>CONCEPTOS OLFATIVOS</small><span class="sidebar-version">3D LABORATORY · V0.4</span></div></aside>
        <main class="main-content" id="main-content" tabindex="-1">${viewContent[current](current === "lab" ? mixingState : libraryState, analysisDirection, evolutionStage, archiveState)}</main>
      </div>
      <nav class="mobile-nav" aria-label="Navegación móvil">${navItems.map(item => navLink(item, current, true)).join("")}</nav>
      <footer class="app-footer"><span>JB VIRTUAL PERFUME LAB</span><span>CREATIVE CONCEPTS · NOT CHEMICAL FORMULAS</span></footer>
    </div>
  `;
}
