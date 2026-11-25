import { getPerfumeLibraryItem } from "../perfume-library/library.js";
import { getMixTotal } from "./state.js";

const escapeHtml = (value = "") => String(value).replace(/[&<>"']/g, (char) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
})[char]);

export function renderMixStudio(state) {
  const total = getMixTotal(state);
  const hasItems = state.items.length > 0;
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
          <output class="mix-item-points" for="mix-${escapeHtml(entry.id)}">${entry.points} pts</output>
          <button class="mix-remove" type="button" data-remove-mix-note="${escapeHtml(entry.id)}" aria-label="Quitar ${escapeHtml(note.name)}">×</button>
        </div>
        <label class="mix-range-label" for="mix-${escapeHtml(entry.id)}">
          <span>Peso creativo</span><span>0–100 puntos</span>
        </label>
        <input class="mix-range" id="mix-${escapeHtml(entry.id)}" data-mix-weight="${escapeHtml(entry.id)}" type="range" min="0" max="100" step="1" value="${entry.points}" aria-label="Peso creativo de ${escapeHtml(note.name)}">
      </article>
    `;
  }).join("");

  return `
    <section class="mix-studio" id="mix-studio">
      <div class="mix-studio-header">
        <div>
          <p class="eyebrow">BLOCK 05 · CONCEPT COMPOSITION</p>
          <h2>Recipiente <em>conceptual</em></h2>
          <p>Organizá notas y acordes y ajustá su peso creativo para explorar el perfil general.</p>
        </div>
        <span class="mix-total-badge">${hasItems ? total : 0}<small>/ 100 PTS</small></span>
      </div>
      <div class="mix-drop-zone ${hasItems ? "has-items" : ""}" data-mix-dropzone aria-label="Zona para añadir notas al recipiente conceptual">
        <span class="mix-drop-symbol">${hasItems ? "◈" : "＋"}</span>
        <div><strong>${hasItems ? `${state.items.length} referencias en el recipiente` : "Tu recipiente está vacío"}</strong><small>Arrastrá una referencia desde la biblioteca en escritorio o usá «Añadir a composición» desde cualquier ficha. En Android, usá el botón táctil.</small></div>
      </div>
      <div class="mix-item-list">${rows || '<div class="mix-empty-list">Todavía no hay notas en esta composición.</div>'}</div>
      <div class="mix-studio-actions">
        <button class="mix-action mix-action--undo" type="button" data-action="undo-mix" ${state.history.length ? "" : "disabled"}>↶ Deshacer</button>
        <button class="mix-action" type="button" data-action="reset-mix" ${hasItems ? "" : "disabled"}>Reiniciar recipiente</button>
      </div>
      <p class="mix-disclaimer">Los puntos son ponderaciones creativas normalizadas para comparar ideas dentro de esta interfaz. No son porcentajes, concentraciones, proporciones de ingredientes, dosificaciones ni una fórmula de fabricación. La visualización no predice el olor ni el rendimiento de un producto real.</p>
    </section>
  `;
}
