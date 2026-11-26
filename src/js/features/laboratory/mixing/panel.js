import { getPerfumeLibraryItem, filterPerfumeLibrary } from "../../perfume-library/library.js";
import { getMixTotal, hasMixNote } from "./state.js";
import { PERFUME_ITEMS } from "../../perfume-library/data.js";

const escapeHtml = (value = "") => String(value).replace(/[&<>"']/g, (char) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
})[char]);

const ROLES = ["Salida", "Corazón", "Fondo"];
const KINDS = ["Nota olfativa", "Acorde"];
const PICKER_LIMIT = 6;

function familyOptions(selectedFamily) {
  const families = [...new Set(PERFUME_ITEMS.map((item) => item.family))]
    .sort((a, b) => a.localeCompare(b, "es"));
  return ['<option value="all">Todas las familias</option>', ...families.map((family) =>
    `<option value="${escapeHtml(family)}" ${family === selectedFamily ? "selected" : ""}>${escapeHtml(family)}</option>`
  )].join("");
}

function roleOptions(selectedRole) {
  return ['<option value="all">Cualquier ubicación</option>', ...ROLES.map((role) =>
    `<option value="${role}" ${role === selectedRole ? "selected" : ""}>${role}</option>`
  )].join("");
}

function kindOptions(selectedKind) {
  return ['<option value="all">Notas y acordes</option>', ...KINDS.map((kind) =>
    `<option value="${kind}" ${kind === selectedKind ? "selected" : ""}>${kind === "Acorde" ? "Acordes" : "Notas olfativas"}</option>`
  )].join("");
}

export function renderMixPickerResults(mixingState, pickerState = {}) {
  const filtered = filterPerfumeLibrary(pickerState);
  const visible = pickerState.expanded ? filtered : filtered.slice(0, PICKER_LIMIT);
  const rows = visible.map((item) => {
    const selected = hasMixNote(mixingState, item.id);
    return `
      <article class="mix-picker-result ${selected ? "is-added" : ""}">
        <div class="mix-picker-result-copy">
          <strong>${escapeHtml(item.name)}</strong>
          <span>${escapeHtml(item.family)} · ${item.kind === "Acorde" ? "ACORDE" : "NOTA"}</span>
          <small>${escapeHtml(item.roles.join(" · "))}</small>
        </div>
        <button type="button" class="mix-picker-add" data-add-to-mix="${escapeHtml(item.id)}" ${selected ? "disabled aria-label=\"Ya añadida\"" : `aria-label="Añadir ${escapeHtml(item.name)}"`}>
          ${selected ? "✓ Añadida" : "＋ Añadir"}
        </button>
      </article>
    `;
  }).join("");

  if (!filtered.length) {
    return `
      <div class="mix-picker-results-head"><span>0 coincidencias</span><span>de ${PERFUME_ITEMS.length} referencias</span></div>
      <div class="mix-picker-empty"><strong>No hay referencias con esos filtros</strong><small>Probá otro término o limpiá la búsqueda.</small><button type="button" data-action="clear-mix-picker">Limpiar filtros</button></div>
    `;
  }

  const remaining = filtered.length - visible.length;
  return `
    <div class="mix-picker-results-head"><span>${filtered.length} coincidencias</span><span>${mixingState.items.length} seleccionadas</span></div>
    <div class="mix-picker-results-list">${rows}</div>
    ${filtered.length > PICKER_LIMIT ? `
      <button type="button" class="mix-picker-expand" data-action="toggle-mix-picker">
        ${pickerState.expanded ? "Mostrar menos" : `Mostrar ${remaining} más referencias`}
      </button>
    ` : ""}
  `;
}

export function renderMixStudio(state, pickerState = {}) {
  const total = getMixTotal(state);
  const hasItems = state.items.length > 0;
  const quickNotes = ["bergamot", "rose", "sandalwood", "vanilla", "vetiver", "cardamom"]
    .map((id) => PERFUME_ITEMS.find((item) => item.id === id))
    .filter((item) => item && !hasMixNote(state, item.id));
  const rows = state.items.map((entry) => {
    const note = getPerfumeLibraryItem(entry.id);
    if (!note) return "";
    return `
      <article class="mix-item">
        <div class="mix-item-heading">
          <div class="mix-item-name">
            <strong>${escapeHtml(note.name)}</strong>
            <small>${escapeHtml(note.family)} · ${note.kind === "Acorde" ? "ACORDE" : "NOTA"}</small>
          </div>
          <output class="mix-item-points" for="mix-${escapeHtml(entry.id)}-range mix-${escapeHtml(entry.id)}-number">${entry.points}<small> pts</small></output>
          <button class="mix-remove" type="button" data-remove-mix-note="${escapeHtml(entry.id)}" aria-label="Quitar ${escapeHtml(note.name)}">×</button>
        </div>
        <div class="mix-weight-editor">
          <label class="mix-range-label" for="mix-${escapeHtml(entry.id)}-range">
            <span>Peso creativo</span><span>0–100 puntos</span>
          </label>
          <div class="mix-weight-controls">
            <input class="mix-range" id="mix-${escapeHtml(entry.id)}-range" data-mix-weight="${escapeHtml(entry.id)}" type="range" min="0" max="100" step="1" value="${entry.points}" aria-label="Peso creativo de ${escapeHtml(note.name)}" ${state.items.length === 1 ? "disabled" : ""}>
            <label class="mix-weight-number-label" for="mix-${escapeHtml(entry.id)}-number">
              <span class="sr-only">Puntos de ${escapeHtml(note.name)}</span>
              <input class="mix-weight-number" id="mix-${escapeHtml(entry.id)}-number" data-mix-weight="${escapeHtml(entry.id)}" type="number" inputmode="numeric" min="0" max="100" step="1" value="${entry.points}" aria-label="Puntos creativos de ${escapeHtml(note.name)}" ${state.items.length === 1 ? "disabled" : ""}>
            </label>
          </div>
        </div>
      </article>
    `;
  }).join("");

  return `
    <section class="mix-studio" id="mix-studio">
      <div class="mix-studio-header">
        <div>
          <p class="eyebrow">BLOCK 06 · FORMULATION WORKSPACE</p>
          <h2>Composición <em>conceptual</em></h2>
          <p>Buscá materias por nombre, familia o perfil; añadilas y ajustá cada peso creativo con precisión.</p>
          <span class="mix-draft-status" role="status">Borrador automático local · se recupera al volver</span>
        </div>
        <span class="mix-total-badge">${hasItems ? total : 0}<small>/ 100 PTS</small></span>
      </div>
      <section class="mix-note-picker" id="mix-note-picker-panel" aria-label="Añadir materias primas">
        <div class="mix-picker-title-row">
          <div><p class="eyebrow">MATERIAS DE REFERENCIA</p><h3>Buscar y añadir</h3><small>Filtrá la biblioteca sin salir del constructor.</small></div>
          <span class="mix-picker-library-count">${PERFUME_ITEMS.length} REFERENCIAS</span>
        </div>
        <label class="mix-picker-search" for="mix-picker-search">
          <span aria-hidden="true">⌕</span>
          <input id="mix-picker-search" type="search" value="${escapeHtml(pickerState.query || "")}" placeholder="Buscar nombre, familia o descriptor…" autocomplete="off" aria-label="Buscar materias para la composición">
          <kbd>60</kbd>
        </label>
        <div class="mix-picker-filters">
          <label><span>Familia</span><select id="mix-picker-family">${familyOptions(pickerState.family || "all")}</select></label>
          <label><span>Tipo</span><select id="mix-picker-kind">${kindOptions(pickerState.kind || "all")}</select></label>
          <label><span>Ubicación</span><select id="mix-picker-role">${roleOptions(pickerState.role || "all")}</select></label>
          <button type="button" class="mix-picker-clear" data-action="clear-mix-picker" ${(pickerState.query || pickerState.family !== "all" && pickerState.family || pickerState.kind !== "all" && pickerState.kind || pickerState.role !== "all" && pickerState.role) ? "" : "disabled"}>Limpiar</button>
        </div>
        <div id="mix-picker-results" aria-live="polite" aria-busy="false">${renderMixPickerResults(state, pickerState)}</div>
        <div class="mix-quick-block">
          <span>ACCESOS RÁPIDOS</span>
          <div class="mix-quick-notes" aria-label="Referencias rápidas">
            ${quickNotes.map((item) => `<button type="button" data-add-to-mix="${escapeHtml(item.id)}">${escapeHtml(item.name)}</button>`).join("")}
          </div>
        </div>
      </section>
      <div class="mix-composition-summary">
        <div class="mix-drop-zone ${hasItems ? "has-items" : ""}" data-mix-dropzone aria-label="Zona para añadir notas a la composición conceptual">
          <span class="mix-drop-symbol">${hasItems ? "◈" : "＋"}</span>
          <div><strong>${hasItems ? `${state.items.length} referencias en la composición` : "La composición está vacía"}</strong><small>${hasItems ? "Los pesos se redistribuyen automáticamente para conservar 100 puntos." : "Elegí materias en el buscador de arriba para iniciar tu composición."}</small></div>
        </div>
        <div class="mix-total-inline"><span>TOTAL DE LA COMPOSICIÓN</span><strong>${hasItems ? total : 0}<small> / 100 PTS</small></strong><i><b style="width:${hasItems ? total : 0}%"></b></i></div>
      </div>
      <div class="mix-item-list">${rows || '<div class="mix-empty-list">Añadí una o más referencias para empezar a ajustar su peso creativo.</div>'}</div>
      <p class="mix-weight-hint">Al editar el peso de una materia, los puntos restantes se distribuyen entre las demás referencias. El total siempre se mantiene en 100 cuando hay materias seleccionadas.</p>
      <div class="mix-studio-actions">
        <button class="mix-action mix-action--undo" type="button" data-action="undo-mix" ${state.history.length ? "" : "disabled"}>↶ Deshacer</button>
        <button class="mix-action" type="button" data-action="reset-mix" ${hasItems ? "" : "disabled"}>Vaciar composición</button>
      </div>
      <p class="mix-disclaimer">Los puntos son ponderaciones creativas normalizadas para comparar ideas dentro de esta interfaz. No son porcentajes, concentraciones, proporciones de ingredientes, dosificaciones ni una fórmula de fabricación. La visualización no predice el olor ni el rendimiento de un producto real.</p>
    </section>
  `;
}
