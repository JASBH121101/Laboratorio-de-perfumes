import { PERFUME_ITEMS } from "./data.js";

const ROLES = ["Salida", "Corazón", "Fondo"];
const escapeHtml = (value = "") => String(value).replace(/[&<>"']/g, (char) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
})[char]);

export function getPerfumeLibraryStats() {
  return {
    total: PERFUME_ITEMS.length,
    notes: PERFUME_ITEMS.filter((item) => item.kind === "Nota olfativa").length,
    accords: PERFUME_ITEMS.filter((item) => item.kind === "Acorde").length,
    families: new Set(PERFUME_ITEMS.map((item) => item.family)).size
  };
}

export function filterPerfumeLibrary({ query = "", family = "all", role = "all" } = {}) {
  const normalizedQuery = query.trim().toLocaleLowerCase("es");
  return PERFUME_ITEMS.filter((item) => {
    const familyMatch = family === "all" || item.family === family;
    const roleMatch = role === "all" || item.roles.includes(role);
    const searchable = [item.name, item.family, item.kind, item.profile, ...item.facets, ...item.pairings]
      .join(" ").toLocaleLowerCase("es");
    return familyMatch && roleMatch && (!normalizedQuery || searchable.includes(normalizedQuery));
  });
}

export function getPerfumeLibraryItem(id) {
  return PERFUME_ITEMS.find((item) => item.id === id) ?? null;
}

function familyOptions(selectedFamily) {
  const families = [...new Set(PERFUME_ITEMS.map((item) => item.family))].sort((a, b) => a.localeCompare(b, "es"));
  return ['<option value="all">Todas las familias</option>', ...families.map((family) =>
    `<option value="${escapeHtml(family)}" ${family === selectedFamily ? "selected" : ""}>${escapeHtml(family)}</option>`
  )].join("");
}

function roleOptions(selectedRole) {
  return ['<option value="all">Cualquier ubicación</option>', ...ROLES.map((role) =>
    `<option value="${role}" ${role === selectedRole ? "selected" : ""}>${role}</option>`
  )].join("");
}

export function renderLibraryResults(state = {}) {
  const filtered = filterPerfumeLibrary(state);
  const stats = getPerfumeLibraryStats();
  const countLabel = `${filtered.length} de ${stats.total} referencias`;
  if (!filtered.length) {
    return `
      <div class="library-results-head"><span id="library-result-count">${countLabel}</span><span>Sin coincidencias</span></div>
      <div class="library-empty"><span class="library-empty-icon">⌕</span><h3>No encontramos referencias</h3><p>Probá con otro nombre, familia o descriptor aromático.</p><button class="library-reset" type="button" data-action="clear-library">Limpiar filtros</button></div>
    `;
  }

  const cards = filtered.map((item) => `
    <button class="note-card ${state.selectedId === item.id ? "is-selected" : ""}" type="button" data-open-note="${item.id}" aria-pressed="${state.selectedId === item.id}">
      <span class="note-card-top"><span class="note-type">${item.kind === "Acorde" ? "ACORDE" : "NOTA"}</span><span class="note-family">${escapeHtml(item.family)}</span></span>
      <strong class="note-name">${escapeHtml(item.name)}</strong>
      <span class="note-profile">${escapeHtml(item.profile)}</span>
      <span class="note-card-bottom">
        <span class="note-role-tags">${item.roles.map((role) => `<span>${escapeHtml(role)}</span>`).join("")}</span>
        <span class="note-open" aria-hidden="true">↗</span>
      </span>
    </button>
  `).join("");

  return `
    <div class="library-results-head"><span id="library-result-count">${countLabel}</span><span>${stats.notes} notas · ${stats.accords} acordes</span></div>
    <div class="note-grid">${cards}</div>
  `;
}

export function renderLibraryDetail(selectedId) {
  const item = getPerfumeLibraryItem(selectedId);
  if (!item) return `
    <aside class="library-detail library-detail--empty" id="library-detail" aria-live="polite">
      <span class="detail-symbol">✳</span><p class="eyebrow">FICHA DE REFERENCIA</p>
      <h3>Explorá una nota</h3>
      <p>Seleccioná una tarjeta para consultar su perfil, facetas y posibles afinidades creativas.</p>
    </aside>
  `;

  return `
    <aside class="library-detail" id="library-detail" aria-live="polite">
      <div class="detail-head"><span class="status-pill">${item.kind.toUpperCase()}</span><button class="detail-close" type="button" data-action="close-note-detail" aria-label="Cerrar ficha">×</button></div>
      <p class="eyebrow">${escapeHtml(item.family).toUpperCase()}</p>
      <h3>${escapeHtml(item.name)}</h3>
      <p class="detail-description">${escapeHtml(item.profile)}</p>
      <div class="detail-section"><span class="detail-label">UBICACIÓN ORIENTATIVA</span><div class="detail-tags">${item.roles.map((role) => `<span class="detail-tag">${escapeHtml(role)}</span>`).join("")}</div></div>
      <div class="detail-section"><span class="detail-label">FACETAS SENSORIALES</span><div class="detail-tags">${item.facets.map((facet) => `<span class="detail-tag">${escapeHtml(facet)}</span>`).join("")}</div></div>
      <div class="detail-section"><span class="detail-label">AFINIDADES PARA EXPLORAR</span><div class="pairing-list">${item.pairings.map((pair) => `<span>＋ ${escapeHtml(pair)}</span>`).join("")}</div></div>
      <p class="detail-note">La ubicación y las afinidades son referencias creativas, no reglas fijas ni instrucciones de formulación.</p>
    </aside>
  `;
}

export function renderPerfumeLibrary(state = {}) {
  const stats = getPerfumeLibraryStats();
  return `
    <section class="page-intro library-intro">
      <p class="eyebrow">REFERENCE LIBRARY · BLOCK 03</p>
      <h1>Biblioteca <em>olfativa</em></h1>
      <p>Explorá notas y acordes por familia, ubicación y perfil sensorial. Esta biblioteca es una guía editorial para diseñar conceptos.</p>
      <div class="library-stat-row">
        <span><strong>${stats.total}</strong><small>REFERENCIAS</small></span>
        <span><strong>${stats.families}</strong><small>FAMILIAS</small></span>
        <span><strong>${stats.accords}</strong><small>ACORDES</small></span>
      </div>
    </section>
    <section class="library-layout" id="perfume-library">
      <div class="library-main">
        <div class="library-toolbar">
          <label class="library-search"><span aria-hidden="true">⌕</span><input id="library-search" type="search" value="${escapeHtml(state.query || "")}" placeholder="Buscar nota, acorde o descriptor…" autocomplete="off" aria-label="Buscar en la biblioteca olfativa"></label>
          <label class="library-filter"><span>Familia</span><select id="library-family">${familyOptions(state.family || "all")}</select></label>
          <label class="library-filter"><span>Ubicación</span><select id="library-role">${roleOptions(state.role || "all")}</select></label>
          <button class="library-clear" type="button" data-action="clear-library">Limpiar</button>
        </div>
        <div id="library-results" aria-live="polite" aria-busy="false">${renderLibraryResults(state)}</div>
        <p class="library-editorial-note">Nota y acorde no son sinónimos: una nota describe una impresión olfativa; un acorde es una combinación construida para producir un efecto conjunto.</p>
      </div>
      ${renderLibraryDetail(state.selectedId)}
    </section>
    <section class="library-guide">
      <div><span class="guide-icon">↗</span><div><strong>¿Cómo leer la ubicación?</strong><p>Salida, corazón y fondo son una organización orientativa de la pirámide olfativa. Una misma referencia puede ocupar lugares distintos según el concepto.</p></div></div>
      <div><span class="guide-icon">◇</span><div><strong>¿Qué significan las facetas?</strong><p>Son descriptores sensoriales para comparar ideas. No describen una composición química ni garantizan cómo olerá una fórmula real.</p></div></div>
    </section>
  `;
}
