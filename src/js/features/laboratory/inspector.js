import { getPerfumeLibraryItem } from "../perfume-library/library.js";
import { getLabProp } from "./catalog.js";

const escapeHtml = (value = "") => String(value).replace(/[&<>"']/g, (char) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
})[char]);

export function renderLabInspector(propId = null) {
  const prop = propId ? getLabProp(propId) : null;
  if (!prop) {
    return `
      <div class="lab-inspector-empty">
        <span class="inspector-symbol">◈</span>
        <p class="eyebrow">INSPECTOR DEL ATELIER</p>
        <h3>Seleccioná un objeto</h3>
        <p>Tocá un frasco, vial o herramienta dentro de la escena 3D para consultar su ficha.</p>
      </div>
    `;
  }

  const note = prop.noteId ? getPerfumeLibraryItem(prop.noteId) : null;
  return `
    <div class="lab-inspector-content">
      <div class="lab-inspector-top"><span class="status-pill">${escapeHtml(prop.category)}</span><button class="lab-inspector-clear" type="button" data-action="clear-lab-selection" aria-label="Quitar selección">×</button></div>
      <p class="eyebrow">OBJETO SELECCIONADO</p>
      <h3>${escapeHtml(prop.title)}</h3>
      <p class="lab-inspector-description">${escapeHtml(prop.description)}</p>
      ${note ? `
        <div class="lab-inspector-note">
          <span class="detail-label">REFERENCIA DE LA BIBLIOTECA</span>
          <strong>${escapeHtml(note.name)}</strong>
          <span>${escapeHtml(note.family)} · ${escapeHtml(note.kind)}</span>
          <p>${escapeHtml(note.profile)}</p>
          <div class="detail-tags">${note.facets.map((facet) => `<span class="detail-tag">${escapeHtml(facet)}</span>`).join("")}</div>
          <a class="lab-library-link" href="#notes" data-nav="notes">Abrir biblioteca olfativa ↗</a>
        </div>
      ` : ""}
      <p class="lab-inspector-footnote">La escena es una representación visual conceptual. No indica cantidades, concentraciones ni instrucciones de fabricación.</p>
    </div>
  `;
}
