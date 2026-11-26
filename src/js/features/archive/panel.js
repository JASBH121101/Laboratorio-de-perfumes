import { getPerfumeLibraryItem } from "../perfume-library/library.js";
import {
  compareArchiveVariants, getActiveVariant, getVariant,
  MAX_VARIANTS, MAX_VERSIONS_PER_VARIANT
} from "./model.js";

const esc = (value = "") => String(value).replace(/[&<>"']/g, (c) => ({
  "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"
}[c]));

function renderCreationCard(creation, selectedId) {
  const active = getActiveVariant(creation);
  return `
    <article class="archive-card ${creation.id === selectedId ? "is-selected" : ""}">
      <button class="archive-card-main" type="button" data-open-archive="${esc(creation.id)}">
        <span class="archive-card-kicker">JB ATELIER · ${creation.variants.length} VARIANTES</span>
        <strong>${esc(creation.name)}</strong>
        <small>${esc(creation.description || "Sin descripción")}</small>
        <span class="archive-card-meta">${active?.items.length ?? 0} referencias · ${creation.updatedAt ? new Date(creation.updatedAt).toLocaleDateString("es-NI") : "—"}</span>
      </button>
      <button class="archive-card-open" type="button" data-load-archive="${esc(creation.id)}" title="Abrir en laboratorio">↗</button>
    </article>
  `;
}

function renderVariant(variant, selectedVariantId) {
  const selected = variant.id === selectedVariantId;
  const latest = variant.versions.at(-1);
  return `
    <article class="archive-variant ${selected ? "is-selected" : ""}">
      <button class="archive-variant-select" type="button" data-select-variant="${esc(variant.id)}" aria-label="Seleccionar y cargar variante ${esc(variant.label)}: ${esc(variant.name)}" aria-pressed="${selected}">
        <span class="archive-variant-label">${esc(variant.label)}</span>
        <span class="archive-variant-info"><strong>${esc(variant.name)}</strong><small>v${latest?.number ?? 1} · ${variant.items.length} referencias</small></span>
        <span class="archive-variant-arrow">${selected ? "●" : "○"}</span>
      </button>
      <div class="archive-variant-actions">
        <button type="button" data-load-variant="${esc(variant.id)}">Abrir en laboratorio</button>
      </div>
    </article>
  `;
}

function renderVersions(variant) {
  const versions = [...variant.versions].reverse();
  return versions.map((version) => `
    <article class="archive-version">
      <div><strong>Versión ${version.number}</strong><small>${esc(version.note)} · ${new Date(version.createdAt).toLocaleString("es-NI")}</small></div>
      <span>${version.items.length} refs.</span>
      <button type="button" data-restore-version="${esc(variant.id)}" data-version-number="${version.number}" aria-label="Restaurar y cargar la versión ${version.number}" ${version.number === variant.versions.at(-1).number ? "disabled" : ""}>Restaurar y cargar</button>
    </article>
  `).join("");
}

function renderComparison(creation, state) {
  const result = state.comparison;
  if (!result) return "";
  const rows = result.rows.map((row) => {
    const note = getPerfumeLibraryItem(row.id);
    return `
      <div class="archive-compare-row">
        <strong>${esc(note?.name ?? row.id)}</strong>
        <span>${row.leftPoints} pts</span><span>${row.rightPoints} pts</span>
        <b class="${row.delta > 0 ? "is-positive" : row.delta < 0 ? "is-negative" : ""}">${row.delta > 0 ? "+" : ""}${row.delta}</b>
      </div>
    `;
  }).join("");
  return `
    <section class="archive-comparison">
      <div class="archive-subheading"><h4>Comparación ${esc(result.left.label)} ↔ ${esc(result.right.label)}</h4><span>${result.rows.length} referencias</span></div>
      <div class="archive-compare-header"><span>Referencia</span><span>${esc(result.left.label)}</span><span>${esc(result.right.label)}</span><span>Δ</span></div>
      ${rows || '<p class="archive-muted">No hay referencias para comparar.</p>'}
      <p class="archive-muted">Δ positivo significa más puntos creativos en ${esc(result.right.label)}; negativo significa menos.</p>
    </section>
  `;
}

export function renderArchiveView(state = {}) {
  const creations = state.creations ?? [];
  const selected = creations.find((creation) => creation.id === state.selectedCreationId) ?? null;
  const selectedVariant = selected
    ? getVariant(selected, state.selectedVariantId) ?? getActiveVariant(selected)
    : null;
  const hasCurrentComposition = state.hasCurrentComposition !== false;
  const fallback = state.storageMode === "localStorage"
    ? '<span class="archive-storage-warning">Almacenamiento local alternativo: evitá borrar los datos del navegador sin exportar un respaldo.</span>'
    : "";
  const createForm = `
    <section class="archive-create-panel">
      <div><p class="eyebrow">NEW CREATION · LOCAL ARCHIVE</p><h3>Guardar una idea nueva</h3><p>${hasCurrentComposition ? "Se guardará una copia independiente de la composición actual." : "Primero añadí una referencia en el Laboratorio 3D para iniciar una creación."}</p></div>
      <label for="archive-new-name">Nombre de la creación</label>
      <input id="archive-new-name" maxlength="60" placeholder="Ej. Jardín después de la lluvia" value="${esc(state.newName ?? "")}">
      <label for="archive-new-description">Descripción breve (opcional)</label>
      <textarea id="archive-new-description" maxlength="1200" rows="2" placeholder="Intención, atmósfera y carácter buscado…">${esc(state.newDescription ?? "")}</textarea>
      <button class="archive-primary-button" type="button" data-action="create-archive" ${hasCurrentComposition ? "" : "disabled"}>＋ Crear desde composición actual</button>
    </section>
  `;
  const archiveList = creations.length
    ? creations.map((creation) => renderCreationCard(creation, selected?.id)).join("")
    : '<div class="archive-empty"><span>▤</span><strong>Tu archivo todavía está vacío.</strong><p>Creá una composición en el laboratorio y guardala aquí para conservarla en este dispositivo.</p></div>';
  let detail = '<section class="archive-empty archive-empty--detail"><strong>Seleccioná una creación</strong><p>Podrás revisar variantes, versiones, comparar cambios y recuperar estados anteriores.</p></section>';
  if (selected && selectedVariant) {
    const variants = selected.variants.map((variant) => renderVariant(variant, selectedVariant.id)).join("");
    const history = renderVersions(selectedVariant);
    const remainingVariants = MAX_VARIANTS - selected.variants.length;
    const otherVariants = selected.variants.filter((variant) => variant.id !== selectedVariant.id);
    const options = selected.variants.map((variant) => `<option value="${esc(variant.id)}">${esc(variant.label)} · ${esc(variant.name)}</option>`).join("");
    detail = `
      <section class="archive-detail">
        <div class="archive-detail-head"><div><p class="eyebrow">CREATIVE ARCHIVE · DETAIL</p><h3>${esc(selected.name)}</h3><p>${esc(selected.description || "Sin descripción")}</p></div><button class="archive-delete-button" type="button" data-action="delete-archive" data-archive-id="${esc(selected.id)}">Eliminar</button></div>
        <div class="archive-rename-row"><label for="archive-rename-name">Renombrar creación</label><input id="archive-rename-name" maxlength="60" value="${esc(selected.name)}"><button type="button" data-action="rename-archive">Guardar nombre</button></div>
        <div class="archive-subheading"><h4>Variantes</h4><span>${selected.variants.length}/${MAX_VARIANTS}</span></div>
        <div class="archive-variant-list">${variants}</div>
        <div class="archive-rename-row"><label for="archive-variant-name">Nombre de variante ${esc(selectedVariant.label)}</label><input id="archive-variant-name" maxlength="60" value="${esc(selectedVariant.name)}"><button type="button" data-action="rename-archive-variant">Renombrar</button></div>
        <div class="archive-action-row">
          <button type="button" data-action="save-archive-version">Guardar composición actual como nueva versión</button>
          <button type="button" data-action="create-archive-variant" ${remainingVariants ? "" : "disabled"}>${remainingVariants ? `＋ Crear variante ${["A","B","C"].find((label) => !selected.variants.some((item) => item.label === label))}` : "Límite de variantes alcanzado"}</button>
        </div>
        <div class="archive-subheading"><h4>Historial de ${esc(selectedVariant.label)}</h4><span>${selectedVariant.versions.length}/${MAX_VERSIONS_PER_VARIANT} versiones</span></div>
        <div class="archive-version-list">${history}</div>
        ${otherVariants.length ? `
          <div class="archive-subheading"><h4>Comparar variantes</h4><span>Pesos creativos</span></div>
          <div class="archive-compare-controls">
            <label for="archive-compare-left">Base</label><select id="archive-compare-left">${options}</select>
            <label for="archive-compare-right">Comparar con</label><select id="archive-compare-right">${options.replace(`value="${esc(selectedVariant.id)}"`, `value="${esc(selectedVariant.id)}" selected`).replace(`value="${esc(otherVariants[0].id)}"`, `value="${esc(otherVariants[0].id)}" selected`)}</select>
            <button type="button" data-action="compare-archive-variants">Comparar</button>
          </div>
          ${renderComparison(selected, state)}
        ` : ""}
        <div class="archive-export-row"><button type="button" data-action="export-single-archive">Exportar esta creación (.json)</button></div>
      </section>
    `;
  }
  return `
    <div id="archive-root">
    <section class="page-intro archive-page-intro"><p class="eyebrow">BLOCK 08 · PERSISTENCE & CREATIVE ARCHIVE</p><h1>Mis <em>creaciones</em></h1><p>Un archivo privado en este dispositivo para conservar composiciones, versiones y variantes de tus conceptos.</p></section>
    <div class="archive-summary"><strong>${creations.length}</strong><span>CREACIONES GUARDADAS</span><span>LOCAL-FIRST · SIN CUENTA</span></div>
    ${fallback}
    ${state.error ? `<p class="archive-error">${esc(state.error)}</p>` : ""}
    <div class="archive-layout">
      <div class="archive-list-column">
        ${createForm}
        <div class="archive-list-heading"><h3>Tu archivo</h3><span>${creations.length} guardadas</span></div>
        <div class="archive-list">${archiveList}</div>
      </div>
      <div class="archive-detail-column">${detail}</div>
    </div>
    <section class="archive-backup-panel">
      <div><p class="eyebrow">BACKUP & RESTORE</p><h3>Respaldo de tus creaciones</h3><p>Descargá un JSON para conservarlo fuera del navegador o restauralo en otro dispositivo. El archivo incluye variantes e historial.</p></div>
      <div class="archive-backup-actions">
        <button type="button" data-action="export-archive-backup" ${creations.length ? "" : "disabled"}>↓ Exportar todo (.json)</button>
        <label class="archive-import-label" for="archive-import-file">↑ Importar respaldo JSON</label>
        <input id="archive-import-file" type="file" accept="application/json,.json" hidden>
      </div>
    </section>
    <p class="archive-privacy-note">Las creaciones se guardan únicamente en el almacenamiento de este navegador/dispositivo. No se suben a GitHub ni a un servidor. Exportá respaldos periódicos: borrar los datos del navegador o cambiar de teléfono puede eliminar este archivo local.</p>
    </div>
  `;
}

export function renderArchiveQuickSave(state = {}) {
  const hasCurrentComposition = state.hasCurrentComposition !== false;
  const selected = state.creations?.find((creation) => creation.id === state.selectedCreationId);
  const variant = selected
    ? getVariant(selected, state.selectedVariantId) ?? getActiveVariant(selected)
    : null;
  if (selected && variant) {
    return `
      <section class="archive-quick-save" id="archive-quick-save">
        <div><p class="eyebrow">LOCAL ARCHIVE · ${esc(selected.name)}</p><strong>Guardar cambios de la composición</strong><small>${hasCurrentComposition ? "Variante " + esc(variant.label) + " · v" + (variant.versions.at(-1)?.number ?? 1) : "Añadí al menos una referencia para guardar una versión."}</small></div>
        <div class="archive-quick-actions"><button type="button" data-action="save-archive-version" ${hasCurrentComposition ? "" : "disabled"}>Guardar nueva versión</button><button type="button" data-nav="projects">Administrar archivo ↗</button></div>
      </section>
    `;
  }
  return `
    <section class="archive-quick-save" id="archive-quick-save">
      <div><p class="eyebrow">BLOCK 08 · SAVE YOUR IDEA</p><strong>Conservá esta composición</strong><small>${hasCurrentComposition ? "Guardala como una creación nueva para recuperarla después." : "Añadí una referencia en el recipiente para habilitar el guardado."}</small></div>
      <div class="archive-quick-actions"><input id="archive-quick-name" maxlength="60" placeholder="Nombre de la fragancia" ${hasCurrentComposition ? "" : "disabled"}><button type="button" data-action="save-current-as-creation" ${hasCurrentComposition ? "" : "disabled"}>Guardar creación</button><button type="button" data-nav="projects">Abrir archivo ↗</button></div>
    </section>
  `;
}
