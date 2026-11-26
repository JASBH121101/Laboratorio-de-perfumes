import { buildFragranceSimilarityExperience } from "./experience.js";
import { FRAGRANCE_SIMILARITY_SCOPES } from "./scope.js";
const esc = (v) => String(v ?? "").replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]));
const category = v => ({designer:"Diseñador",niche:"Nicho",arabian:"Árabe"}[v] || "Categoría no indicada");
const confidence = v => ({high:"Alta",medium:"Media",low:"Baja","very-low":"Muy baja"}[v] || "No disponible");
const band = v => ({"very-high":"Muy alta",high:"Alta",moderate:"Moderada",limited:"Limitada",low:"Baja"}[v] || "No clasificada");
const option = (v, c, label) => `<option value="${v}" ${c===v?"selected":""}>${label}</option>`;

export function renderFragranceSimilaritySuggestions(session, { activeIndex = -1, open = true } = {}) {
  const search = session.search;
  if (!search || search.status === "empty-query") return '<p class="similarity-helper">Escribí el nombre del perfume o su casa para localizar una referencia.</p>';
  if (!open) return "";
  if (search.status === "query-too-short") {
    return '<p class="similarity-helper" role="status">Escribí al menos dos caracteres para buscar.</p>';
  }
  const results = search.results || [];
  const items = results.map((item, index) => `<button class="similarity-suggestion" type="button" role="option"
    id="fragrance-similarity-option-${esc(item.id)}" aria-label="Seleccionar ${esc(item.name)} de ${esc(item.house || "casa no indicada")}"
    aria-selected="${activeIndex === index}" data-similarity-index="${index}" data-similarity-select="${esc(item.id)}">
    <span><strong>${esc(item.name)}</strong><small>${esc(item.house || "Casa no indicada")} · ${category(item.category)}</small></span>
    <span class="similarity-suggestion-score">${item.searchScore}%</span></button>`).join("");
  const message = search.status === "no-results"
    ? search.message || "No encontramos coincidencias. Probá con otro nombre o con la casa."
    : search.message || `${search.totalMatches} referencias encontradas. Elegí la correcta.`;
  return `<p class="similarity-helper" role="status">${esc(message)}</p>${items ? `<div class="similarity-suggestion-list" id="fragrance-similarity-listbox" role="listbox" aria-label="Referencias encontradas">${items}</div>` : ""}`;
}

function selectedReference(session) {
  if (!session.reference) return session.status === "reference-not-found"
    ? '<div class="similarity-empty" role="alert"><strong>Referencia no disponible</strong><p>Buscá y seleccioná otra vez.</p></div>'
    : '<div class="similarity-empty"><span aria-hidden="true">⌕</span><strong>Elegí un perfume de referencia</strong><p>La comparación inicia después de seleccionar una coincidencia.</p></div>';
  const p = session.reference;
  return `<div class="similarity-reference-card"><div><p class="similarity-kicker">PERFUME DE REFERENCIA</p>
    <h3>${esc(p.identity.name)}</h3><p>${esc(p.identity.house || "Casa no indicada")} · ${category(p.identity.category)}</p></div>
    <button type="button" class="similarity-reset" data-action="reset-fragrance-similarity">Cambiar referencia</button></div>`;
}

function evidence(rows, kind) {
  if (!rows?.length) return "";
  const items = rows.slice(0,3).map(row => {
    const values = kind === "matches"
      ? (row.matched || []).map(m => m.referenceLabel === m.candidateLabel ? m.referenceLabel : `${m.referenceLabel} / ${m.candidateLabel}`)
      : [...(row.referenceOnly || []).map(v => `Referencia: ${v}`), ...(row.candidateOnly || []).map(v => `Alternativa: ${v}`)];
    return values.length ? `<li><strong>${esc(row.label)}</strong><span>${esc(values.join(", "))}</span></li>` : "";
  }).join("");
  return items ? `<ul class="similarity-evidence similarity-evidence--${kind}">${items}</ul>` : "";
}

function candidateCard(item) {
  const confidenceIndex = Number.isFinite(item.confidence?.index) ? `${item.confidence.index}/100` : "No disponible";
  const dimensions = Number.isInteger(item.coverage?.comparableDimensionCount)
    ? `${item.coverage.comparableDimensionCount}/6` : "No disponible";
  const availableWeight = Number.isFinite(item.coverage?.availableWeight)
    ? `${item.coverage.availableWeight}%` : "No disponible";
  const reasons = (item.confidence?.reasons || []).slice(0, 2);
  return `<article class="similarity-result-card"><div class="similarity-result-main">
    <div class="similarity-result-title"><span class="similarity-rank">#${item.rank}</span><div>
      <h4>${esc(item.name)}</h4><p>${esc(item.house || "Casa no indicada")} · ${category(item.category)}</p></div></div>
    <div class="similarity-score"><strong>${item.score}%</strong><span>similitud<br>editorial</span></div></div>
    <div class="similarity-result-meta"><span class="similarity-chip">Confianza ${confidence(item.confidence?.level)}</span>
      <span class="similarity-chip">${band(item.similarityBand?.key)}</span><span class="similarity-chip">Stock: no verificado</span></div>
    <div class="similarity-confidence-detail" aria-label="Calidad de la evidencia">
      <span>Índice de confianza <strong>${confidenceIndex}</strong></span>
      <span>Dimensiones comparables <strong>${dimensions}</strong></span>
      <span>Peso de datos disponible <strong>${availableWeight}</strong></span>
    </div>
    ${reasons.length ? `<ul class="similarity-confidence-reasons">${reasons.map(reason => `<li>${esc(reason)}</li>`).join("")}</ul>` : ""}
    ${evidence(item.explanation?.similarities,"matches")}${evidence(item.explanation?.differences,"differences")}
    <p class="similarity-source-note">${esc(item.source?.label || "Referencia del catálogo global")}</p></article>`;
}

export function renderFragranceSimilarityResults(session) {
  if (!session.reference) return selectedReference(session);
  if (session.scopeSelection.status === "inventory-empty") return `${selectedReference(session)}
    <div class="similarity-empty" role="status"><strong>Inventario propio sin conectar</strong>
    <p>${esc(session.scopeSelection.message)} Esta pantalla no consultará el catálogo global en este modo.</p></div>`;
  if (!session.filtered?.results?.length) {
    const filteredOut = session.filtered?.status === "no-filtered-results";
    return `${selectedReference(session)}
      <div class="similarity-empty" role="status"><strong>${filteredOut ? "Sin resultados con estos filtros" : "No hay alternativas suficientes"}</strong>
      <p>${filteredOut ? "Ninguna alternativa coincide con los filtros actuales. Podés restablecerlos para volver a ver el ranking completo." : "No hay alternativas con datos suficientes para mostrar una similitud editorial."}</p>
      ${filteredOut ? '<button class="similarity-reset-filters" type="button" data-action="reset-fragrance-similarity-filters">Restablecer filtros</button>' : ""}</div>`;
  }
  const count = session.filtered.totalVisibleResults;
  return `${selectedReference(session)}<div class="similarity-results-heading"><div>
    <p class="similarity-kicker">ALTERNATIVAS ENCONTRADAS</p><h3>Coincidencias olfativas</h3></div>
    <span>${count} ${count===1?"alternativa":"alternativas"} · ${session.filtered.removedByFilters} ocultas por filtros</span></div>
    ${session.filtered.results.map(candidateCard).join("")}
    <p class="similarity-disclaimer">El porcentaje es una estimación editorial basada en descriptores olfativos públicos; no expresa probabilidad, equivalencia química ni identidad sensorial. La confianza indica la solidez de los datos y se calcula por separado.</p>`;
}

export function renderFragranceSimilarityPanel(state = {}) {
  const filters = state.filters || {};
  const session = buildFragranceSimilarityExperience(state);
  const suggestionsOpen = state.suggestionsOpen !== false;
  const activeIndex = Number.isInteger(state.activeSuggestionIndex) ? state.activeSuggestionIndex : -1;
  const activeSuggestion = suggestionsOpen ? session.search.results?.[activeIndex] : null;
  const hasActiveSuggestion = Boolean(activeSuggestion);
  const hasSuggestions = suggestionsOpen && Boolean(session.search.results?.length);
  return `<section class="fragrance-similarity-panel" id="fragrance-similarity" aria-labelledby="fragrance-similarity-title">
    <div class="similarity-panel-heading"><div><p class="eyebrow">FRAGRANCE DISCOVERY · LOCAL CATALOG</p>
      <h2 id="fragrance-similarity-title">Buscador de <em>equivalencias olfativas</em></h2>
      <p>Encontrá referencias parecidas a un perfume conocido y revisá sus coincidencias y diferencias.</p></div><span class="similarity-local-tag">Catálogo local</span></div>
    <div class="similarity-search-block"><label for="fragrance-similarity-search">¿Qué perfume querés comparar?</label>
      <input id="fragrance-similarity-search" type="search" role="combobox" aria-autocomplete="list" aria-haspopup="listbox"
        aria-expanded="${hasSuggestions}" inputmode="search" autocomplete="off" placeholder="Ej. Oud Wood, Sauvage, Tom Ford…"
        value="${esc(state.query)}" aria-describedby="fragrance-similarity-hint" aria-controls="fragrance-similarity-listbox"
        ${hasActiveSuggestion ? `aria-activedescendant="fragrance-similarity-option-${esc(activeSuggestion.id)}"` : ""}>
      <small id="fragrance-similarity-hint">Buscá por nombre o casa. Usá ↑ y ↓ para recorrer sugerencias, Enter para seleccionar y Esc para cerrar.</small>
      <div id="fragrance-similarity-suggestions" aria-live="polite">${renderFragranceSimilaritySuggestions(session,{activeIndex,open:suggestionsOpen})}</div></div>
    <div class="similarity-controls">
      <div class="similarity-scope-control"><label for="fragrance-similarity-scope">Buscar alternativas en</label><select id="fragrance-similarity-scope">
        ${option(FRAGRANCE_SIMILARITY_SCOPES.GLOBAL_CATALOG,state.scope || FRAGRANCE_SIMILARITY_SCOPES.GLOBAL_CATALOG,"Catálogo global")}
        ${option(FRAGRANCE_SIMILARITY_SCOPES.OWN_INVENTORY,state.scope,"Mi inventario")}</select>
        <small>El catálogo global no confirma disponibilidad comercial.</small></div>
      <div class="similarity-filter"><label for="similarity-filter-category">Categoría</label><select id="similarity-filter-category">
        ${option("all",filters.category || "all","Todas")}${option("designer",filters.category,"Diseñador")}${option("niche",filters.category,"Nicho")}${option("arabian",filters.category,"Árabe")}</select></div>
      <div class="similarity-filter"><label for="similarity-filter-band">Similitud</label><select id="similarity-filter-band">
        ${option("all",filters.band || "all","Todas")}${option("very-high",filters.band,"Muy alta")}${option("high",filters.band,"Alta")}${option("moderate",filters.band,"Moderada")}${option("limited",filters.band,"Limitada")}${option("low",filters.band,"Baja")}</select></div>
      <div class="similarity-filter"><label for="similarity-filter-confidence">Confianza</label><select id="similarity-filter-confidence">
        ${option("all",filters.confidence || "all","Todas")}${option("high",filters.confidence,"Alta")}${option("medium",filters.confidence,"Media")}${option("low",filters.confidence,"Baja")}${option("very-low",filters.confidence,"Muy baja")}</select></div>
      <div class="similarity-filter"><label for="similarity-filter-minimum">Similitud mínima (%)</label>
        <input id="similarity-filter-minimum" type="number" min="0" max="100" step="1" inputmode="numeric" value="${filters.minimumScore ?? 0}"></div>
      <div class="similarity-filter similarity-filter--house"><label for="similarity-filter-house">Filtrar por casa</label>
        <input id="similarity-filter-house" type="search" placeholder="Nombre de la casa" value="${esc(filters.houseQuery)}"></div>
      <button class="similarity-reset-filters" type="button" data-action="reset-fragrance-similarity-filters">Restablecer filtros</button>
    </div>
    <div class="similarity-output" id="fragrance-similarity-output" aria-live="polite">${renderFragranceSimilarityResults(session)}</div>
  </section>`;
}
