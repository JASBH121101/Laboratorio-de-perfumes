import { PERFUME_ITEMS } from "../../perfume-library/data.js";
import { getActiveVariant } from "../../archive/model.js";

const esc = (value = "") => String(value).replace(/[&<>"']/g, (char) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
})[char]);

const PALETTE = ["#d9b27c", "#8d687d", "#7da9b6", "#8fae92", "#c77978", "#a17a58", "#c5a06d", "#91a36e"];

function collectSavedVariants(creations) {
  return (creations || []).flatMap((creation) => (creation.variants || []).map((variant) => ({
    creation,
    variant,
    items: variant.items || []
  }))).filter((entry) => entry.items.length);
}

function summarizeFamilies(entries) {
  const totals = new Map();
  for (const entry of entries) {
    for (const item of entry.items) {
      const note = PERFUME_ITEMS.find((candidate) => candidate.id === item.id);
      if (!note) continue;
      totals.set(note.family, (totals.get(note.family) || 0) + item.points);
    }
  }
  const total = [...totals.values()].reduce((sum, value) => sum + value, 0);
  return [...totals.entries()]
    .map(([family, points]) => ({ family, points, share: total ? Math.round(points / total * 100) : 0 }))
    .sort((a, b) => b.points - a.points);
}

function renderFamilyBars(families) {
  if (!families.length) {
    return `
      <div class="dashboard-chart-empty">
        <span class="dashboard-chart-empty-mark" aria-hidden="true">◯</span>
        <div><strong>Sin datos para comparar</strong><p>Cuando archivés tu primera variante, aparecerá aquí la distribución por familias.</p>
          <a href="#lab" data-nav="lab">Crear primera composición ↗</a>
        </div>
      </div>
    `;
  }
  return families.slice(0, 6).map((family, index) => `
    <div class="dashboard-bar-row">
      <div><span>${esc(family.family)}</span><strong>${family.share}%</strong></div>
      <div class="dashboard-bar-track" role="progressbar" aria-label="Participación de ${esc(family.family)}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${family.share}">
        <span style="width:${family.share}%;--bar-color:${PALETTE[index % PALETTE.length]}"></span>
      </div>
    </div>
  `).join("");
}

function renderFamilyDonut(families) {
  if (!families.length) return "";
  const total = families.reduce((sum, family) => sum + family.points, 0);
  let offset = 0;
  const segments = families.map((family, index) => {
    const share = total ? family.points / total * 100 : 0;
    const start = offset;
    offset += share;
    return `${PALETTE[index % PALETTE.length]} ${start.toFixed(2)}% ${offset.toFixed(2)}%`;
  });
  return `<div class="dashboard-family-donut" role="img" aria-label="Distribución de ${families.length} familias olfativas en el archivo" style="--dashboard-family-gradient:conic-gradient(${segments.join(",")})"><span>${families.length}<small>familias</small></span></div>`;
}

function renderRecent(entries) {
  const recent = [...entries]
    .sort((a, b) => String(b.creation.updatedAt || "").localeCompare(String(a.creation.updatedAt || "")))
    .slice(0, 4);
  if (!recent.length) return '<p class="dashboard-empty-inline">Todavía no hay fórmulas archivadas. Tu primer experimento aparecerá aquí.</p>';
  return recent.map(({ creation, variant }) => `
    <article class="dashboard-recent-item">
      <span class="dashboard-recent-mark">${esc(variant.label || "A")}</span>
      <div><strong>${esc(creation.name)}</strong><small>${esc(variant.name || "Variante")} · ${variant.items.length} materias de referencia</small></div>
      <time datetime="${esc(creation.updatedAt || creation.createdAt || "")}">${creation.updatedAt ? new Date(creation.updatedAt).toLocaleDateString("es-NI") : "—"}</time>
    </article>
  `).join("");
}

export function renderAnalyticsDashboard(archiveState = {}, mixingState = { items: [] }) {
  const creations = archiveState.creations || [];
  const variants = collectSavedVariants(creations);
  const versionCount = creations.reduce((sum, creation) => sum + (creation.variants || []).reduce((variantSum, variant) => variantSum + (variant.versions || []).length, 0), 0);
  const uniqueNotes = new Set(variants.flatMap((entry) => entry.items.map((item) => item.id)));
  const families = summarizeFamilies(variants);
  const active = creations.filter((creation) => getActiveVariant(creation)?.items?.length).length;
  const draftCount = mixingState?.items?.length || 0;
  const dominant = families[0]?.family || "Sin datos";
  const totalSaved = variants.length;
  return `
    <section class="dashboard-welcome">
      <div><p class="eyebrow">JB PERFUME LAB · WORKSPACE</p><h1>Investigación <em>olfativa</em></h1><p>Un espacio de formulación conceptual, análisis de datos y desarrollo de una identidad creativa propia.</p></div>
      <div class="dashboard-live-status"><span></span> DATOS LOCALES · ${totalSaved ? "ACTUALIZADOS" : "LISTO PARA INICIAR"}</div>
    </section>
    <section class="dashboard-kpis" aria-label="Resumen del laboratorio">
      <article class="dashboard-kpi"><span>CREACIONES</span><strong>${creations.length}</strong><small>Proyectos guardados</small></article>
      <article class="dashboard-kpi"><span>VARIANTES</span><strong>${totalSaved}</strong><small>Composiciones archivadas</small></article>
      <article class="dashboard-kpi"><span>VERSIONES</span><strong>${versionCount}</strong><small>Registros en el historial</small></article>
      <article class="dashboard-kpi"><span>REFERENCIAS</span><strong>${uniqueNotes.size}</strong><small>Materias exploradas</small></article>
    </section>
    <section class="dashboard-grid">
      <article class="dashboard-card dashboard-card--wide">
        <div class="dashboard-card-heading"><div><p class="eyebrow">PORTAFOLIO CREATIVO</p><h2>Uso de familias olfativas</h2></div><span class="dashboard-card-meta">${families.length} familias presentes</span></div>
        <p class="dashboard-help">Distribución agregada de los puntos creativos en las variantes guardadas. No representa cantidades físicas.</p>
        <div class="dashboard-family-layout ${families.length ? "has-family-data" : "is-empty"}">
          <div class="dashboard-family-bars">${renderFamilyBars(families)}</div>
          ${families.length ? `<div class="dashboard-family-summary">
            ${renderFamilyDonut(families)}
            <div class="dashboard-family-summary-copy"><strong>${esc(dominant)}</strong><small>Familia con mayor participación en el archivo</small><span>${families[0]?.share ?? 0}%</span></div>
          </div>` : ""}
        </div>
      </article>
      <article class="dashboard-card">
        <div class="dashboard-card-heading"><div><p class="eyebrow">ACTIVIDAD RECIENTE</p><h2>Últimos trabajos</h2></div></div>
        <div class="dashboard-recent-list">${renderRecent(variants)}</div>
      </article>
      <article class="dashboard-card dashboard-current-draft">
        <p class="eyebrow">ESPACIO DE TRABAJO</p><h2>${draftCount ? "Borrador en curso" : "Sin borrador activo"}</h2>
        <strong>${draftCount}<small> referencias</small></strong>
        <p>${draftCount ? "Tu composición local está lista para continuar en el laboratorio." : "Abrí el constructor para comenzar una nueva exploración conceptual."}</p>
        <a class="button button--primary" href="#lab" data-nav="lab">${draftCount ? "Continuar formulación" : "Abrir laboratorio"} <span aria-hidden="true">↗</span></a>
      </article>
    </section>
    <p class="dashboard-footnote">Los indicadores se calculan exclusivamente a partir de las variantes y versiones guardadas en este dispositivo. No son estimaciones de calidad, compatibilidad química ni rendimiento de una fragancia.</p>
  `;
}
