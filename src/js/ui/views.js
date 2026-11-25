import { renderPerfumeLibrary } from "../features/perfume-library/library.js";

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
          <a class="button button--primary" href="#lab" data-nav="lab">Abrir mesa de trabajo <span aria-hidden="true">↗</span></a>
          <button class="button button--secondary" type="button" data-action="install">Instalar aplicación</button>
        </div>
      </div>
      <div class="hero-art" aria-label="Ilustración abstracta de un frasco de perfume" role="img">
        <div class="orb orb--one"></div><div class="orb orb--two"></div><div class="bottle-shadow"></div>
        <div class="perfume-bottle"><div class="bottle-cap"></div><div class="bottle-neck"></div><div class="bottle-glass"><div class="bottle-liquid"></div><div class="bottle-label"><small>JB</small><strong>ATELIER</strong><span>NO. 001</span></div></div></div>
        <div class="art-caption"><span>03 / 08</span><span>THE CREATIVE JOURNEY</span></div>
      </div>
    </section>
    <div class="section-heading"><div><p class="eyebrow">PUNTO DE PARTIDA</p><h2>Tu espacio creativo</h2></div><span class="section-counter">03 — PERFUME LIBRARY</span></div>
    <section class="feature-grid" aria-label="Áreas del laboratorio">
      <a class="feature-card feature-card--lab" href="#lab" data-nav="lab"><span class="card-kicker">01 · WORKSPACE</span><span class="feature-symbol">◈</span><h3>Mesa de trabajo</h3><p>El entorno donde tomarán forma tus próximos conceptos.</p><span class="card-link">Explorar espacio <b>↗</b></span></a>
      <a class="feature-card feature-card--current" href="#notes" data-nav="notes"><span class="card-kicker">02 · LIBRARY</span><span class="feature-symbol">✳</span><h3>Biblioteca olfativa</h3><p>Notas y acordes organizados por familia, ubicación y perfil sensorial.</p><span class="card-link">Abrir biblioteca <b>↗</b></span></a>
      <a class="feature-card" href="#projects" data-nav="projects"><span class="card-kicker">03 · ARCHIVE</span><span class="feature-symbol">▤</span><h3>Mis creaciones</h3><p>Un archivo para conservar ideas, versiones y decisiones.</p><span class="card-link">Ver planificación <b>↗</b></span></a>
    </section>
    <section class="roadmap-panel">
      <div class="roadmap-intro"><p class="eyebrow">CONSTRUCCIÓN POR ETAPAS</p><h2>De una idea<br>a una fragancia.</h2><p>El laboratorio se construirá por bloques, validando cada fundamento antes de avanzar.</p></div>
      <div class="roadmap-list">
        <div class="roadmap-step is-complete"><span class="step-number">01</span><div><strong>Foundation & Architecture</strong><small>Base PWA, navegación y estructura</small></div><span class="step-status">COMPLETADO</span></div>
        <div class="roadmap-step is-complete"><span class="step-number">02</span><div><strong>Design System & PWA Experience</strong><small>Diseño, instalación y actualizaciones</small></div><span class="step-status">COMPLETADO</span></div>
        <div class="roadmap-step is-current"><span class="step-number">03</span><div><strong>Perfume Library</strong><small>60 notas y acordes, filtros y fichas educativas</small></div><span class="step-status">EN CURSO</span></div>
        <div class="roadmap-step"><span class="step-number">04–08</span><div><strong>Studio, Creative Engine & MVP</strong><small>3D, composición conceptual, análisis y guardado</small></div><span class="step-status">PLANIFICADO</span></div>
      </div>
    </section>
    <p class="disclaimer">Los perfiles y mezclas del laboratorio serán representaciones creativas conceptuales; no equivalen a fórmulas químicas ni predicen el rendimiento de una fragancia real.</p>
  `;
}

function labView() {
  return `
    <section class="page-intro"><p class="eyebrow">WORKSPACE · 01</p><h1>Mesa de <em>trabajo</em></h1><p>El espacio interactivo se habilitará en los bloques de laboratorio 3D y composición conceptual.</p></section>
    <section class="coming-panel"><div class="coming-visual"><span class="coming-ring"></span><span class="coming-vessel">◈</span><span class="coming-glow"></span></div><div><span class="status-pill">EN PREPARACIÓN · BLOQUES 04–05</span><h2>Tu atelier está tomando forma.</h2><p>Estamos preparando una mesa táctil donde podrás explorar recipientes virtuales, seleccionar notas y crear combinaciones conceptuales. Todavía no hay simulación 3D ni mezclas operativas en esta versión.</p><a class="text-link" href="#notes" data-nav="notes">Explorar la biblioteca olfativa ↗</a></div></section>
  `;
}

function notesView(libraryState) {
  return renderPerfumeLibrary(libraryState);
}

function projectsView() {
  return `
    <section class="page-intro"><p class="eyebrow">PERSONAL ARCHIVE · 03</p><h1>Mis <em>creaciones</em></h1><p>El archivo para documentar ideas, conservar decisiones y comparar futuras variantes.</p></section>
    <section class="empty-state"><span class="empty-icon">▤</span><span class="status-pill">PLANIFICADO · BLOQUES 05 Y 08</span><h2>Tu archivo creativo estará aquí.</h2><p>La persistencia local, el historial, la comparación de versiones y las copias de seguridad se incorporarán antes de certificar el MVP.</p></section>
  `;
}

const viewContent = {
  home: () => homeView(),
  lab: () => labView(),
  notes: (libraryState) => notesView(libraryState),
  projects: () => projectsView()
};

export function renderPage(activeView = "home", libraryState = {}) {
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
        <aside class="sidebar"><div class="sidebar-label">WORKSPACE</div><nav aria-label="Navegación principal">${navItems.map(item => navLink(item, current)).join("")}</nav><div class="sidebar-bottom"><span class="sidebar-line"></span><small>CREADO PARA EXPLORAR<br>CONCEPTOS OLFATIVOS</small><span class="sidebar-version">PERFUME LIBRARY · V0.3</span></div></aside>
        <main class="main-content" id="main-content" tabindex="-1">${viewContent[current](libraryState)}</main>
      </div>
      <nav class="mobile-nav" aria-label="Navegación móvil">${navItems.map(item => navLink(item, current, true)).join("")}</nav>
      <footer class="app-footer"><span>JB VIRTUAL PERFUME LAB</span><span>CREATIVE CONCEPTS · NOT CHEMICAL FORMULAS</span></footer>
    </div>
  `;
}
