import { compareProfileSnapshots } from "./engine.js";

const esc = (value = "") => String(value).replace(/[&<>"']/g, (char) => ({
  "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"
})[char]);

function profileOptions(profiles, selectedId, excludedId = "") {
  return profiles.filter((item) => item.id !== excludedId).map((profile) =>
    `<option value="${esc(profile.id)}" ${profile.id === selectedId ? "selected" : ""}>${esc(profile.label)}</option>`
  ).join("");
}

function renderProfileCard(profile) {
  const date = new Date(profile.createdAt);
  const formattedDate = Number.isFinite(date.getTime())
    ? new Intl.DateTimeFormat("es-NI", { dateStyle: "medium" }).format(date)
    : "Fecha no disponible";
  const prefs = [
    profile.fields?.occasion,
    profile.fields?.style,
    profile.fields?.presence
  ].filter(Boolean).join(" · ");
  return `
    <article class="profile-history-record">
      <div class="profile-history-record-head">
        <div><small>${esc(formattedDate)} · ${profile.alternatives.length} alternativas</small><h4>${esc(profile.label)}</h4></div>
        <button type="button" class="profile-history-delete" data-action="delete-creative-profile" data-profile-id="${esc(profile.id)}" aria-label="Eliminar perfil ${esc(profile.label)}">×</button>
      </div>
      ${prefs ? `<p class="profile-history-tags">${esc(prefs)}</p>` : ""}
      <p>${esc(profile.description)}</p>
      <div class="profile-history-preferences">
        ${profile.fields?.liked ? `<span><b>Busca:</b> ${esc(profile.fields.liked)}</span>` : ""}
        ${profile.fields?.avoid ? `<span><b>Evitar:</b> ${esc(profile.fields.avoid)}</span>` : ""}
      </div>
    </article>
  `;
}

function renderMatch(label, match) {
  if (!match) return `<div class="profile-metric-match"><small>${label}</small><strong>Sin coincidencia</strong></div>`;
  return `<div class="profile-metric-match"><small>${label}</small><strong>${esc(match.name)}</strong><span>${esc(match.house)} · ${match.score}% · confianza ${esc(match.confidence)}</span></div>`;
}

function renderAlternative(alternative, index, sideLabel) {
  const { audience, benchmark, performance } = alternative.metrics;
  const hours = performance.persistence?.hours?.join("–") || "—";
  const initial = performance.projection?.initialMeters?.join("–") || "—";
  const later = performance.projection?.laterMeters?.join("–") || "—";
  return `
    <article class="profile-comparison-alternative">
      <header><span>${esc(sideLabel)} · ALTERNATIVA ${String.fromCharCode(65 + index)}</span><h4>${esc(alternative.title)}</h4><p>${esc(alternative.subtitle)}</p></header>
      <div class="profile-comparison-metrics">
        <section><small>PÚBLICO ORIENTATIVO</small><strong>${esc(audience.positioning || "Sin lectura")}</strong><span>${esc(audience.agePosition || "Sin lectura")} · confianza ${esc(audience.confidence)}</span></section>
        <section><small>RENDIMIENTO ESTIMADO</small><strong>${performance.status === "ready" ? `${hours} h` : "Sin estimación"}</strong><span>Persistencia · proyección ${initial} m inicial / ${later} m tras 1–2 h</span></section>
      </div>
      <div class="profile-comparison-benchmarks">
        ${renderMatch("Árabe / Ninja", benchmark.topMatches.arabian)}
        ${renderMatch("Nicho", benchmark.topMatches.niche)}
        ${renderMatch("Diseñador", benchmark.topMatches.designer)}
      </div>
      <small class="profile-comparison-reference-count">${alternative.items.length} materias · ${alternative.items.reduce((sum,item)=>sum+item.points,0)} puntos creativos</small>
    </article>
  `;
}

function renderComparison(comparison) {
  if (!comparison) return "";
  return `
    <div class="profile-comparison-results" aria-live="polite">
      <div class="profile-comparison-result-heading"><div><p class="eyebrow">COMPARACIÓN DE ALTERNATIVAS</p><h3>${esc(comparison.left.label)} <span>vs.</span> ${esc(comparison.right.label)}</h3></div><span>Escenario ${esc(comparison.scenario.concentration.toUpperCase())} · ${esc(comparison.scenario.environment)}</span></div>
      <div class="profile-comparison-columns">
        <section><h4>${esc(comparison.left.label)}</h4><div class="profile-comparison-list">${comparison.leftAlternatives.map((item,index)=>renderAlternative(item,index,"Perfil A")).join("")}</div></section>
        <section><h4>${esc(comparison.right.label)}</h4><div class="profile-comparison-list">${comparison.rightAlternatives.map((item,index)=>renderAlternative(item,index,"Perfil B")).join("")}</div></section>
      </div>
      <p class="profile-comparison-note">${esc(comparison.note)}</p>
    </div>
  `;
}

export function renderProfileHistory(state = {}) {
  const profiles = [...(state.profiles || [])].sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt)));
  const leftId = profiles.some((item)=>item.id===state.profileLeftId) ? state.profileLeftId : profiles[0]?.id || "";
  const rightId = profiles.some((item)=>item.id===state.profileRightId && item.id!==leftId)
    ? state.profileRightId : profiles.find((item)=>item.id!==leftId)?.id || "";
  const comparison = state.profileComparison?.left?.id===leftId && state.profileComparison?.right?.id===rightId
    ? state.profileComparison : null;
  const disabled = profiles.length < 2;
  return `
    <section class="profile-history-panel" id="profile-history-root">
      <div class="profile-history-heading"><div><p class="eyebrow">BLOCK 22 · CREATIVE PROFILE ARCHIVE</p><h2>Historial y comparación de <em>perfiles</em></h2><p>Guardá briefs sin datos personales y compará sus rutas A/B/C, público orientativo, benchmark comercial y escenarios de rendimiento.</p></div><span>${profiles.length} PERFILES</span></div>
      <div class="profile-history-list">${profiles.length ? profiles.map(renderProfileCard).join("") : '<div class="profile-history-empty"><strong>El historial está vacío.</strong><p>Prepará un brief en el laboratorio y guardalo para conservar sus alternativas.</p><a href="#lab" data-nav="lab">Preparar un perfil ↗</a></div>'}</div>
      <div class="profile-comparison-controls">
        <div><p class="eyebrow">COMPARADOR</p><h3>Dos briefs, seis posibles rutas</h3></div>
        <label><span>Perfil A</span><select id="profile-compare-left" ${disabled ? "disabled" : ""}>${profileOptions(profiles,leftId)}</select></label>
        <label><span>Perfil B</span><select id="profile-compare-right" ${disabled ? "disabled" : ""}>${profileOptions(profiles,rightId,leftId)}</select></label>
        <label><span>Concentración asumida</span><select id="profile-compare-concentration"><option value="edt" ${state.profileComparisonOptions?.concentration==="edt"?"selected":""}>EDT</option><option value="edp" ${!state.profileComparisonOptions?.concentration||state.profileComparisonOptions?.concentration==="edp"?"selected":""}>EDP</option><option value="parfum" ${state.profileComparisonOptions?.concentration==="parfum"?"selected":""}>Parfum</option></select></label>
        <label><span>Ambiente supuesto</span><select id="profile-compare-environment"><option value="neutral" ${!state.profileComparisonOptions?.environment||state.profileComparisonOptions?.environment==="neutral"?"selected":""}>Neutro</option><option value="warm" ${state.profileComparisonOptions?.environment==="warm"?"selected":""}>Cálido</option><option value="cool" ${state.profileComparisonOptions?.environment==="cool"?"selected":""}>Fresco</option><option value="outdoor" ${state.profileComparisonOptions?.environment==="outdoor"?"selected":""}>Exterior / ventilado</option><option value="indoor" ${state.profileComparisonOptions?.environment==="indoor"?"selected":""}>Interior</option></select></label>
        <button type="button" data-action="compare-creative-profiles" ${disabled?"disabled":""}>Comparar perfiles</button>
        ${disabled ? '<small>Guardá al menos dos perfiles para habilitar la comparación.</small>' : ""}
      </div>
      ${renderComparison(comparison)}
      <p class="profile-history-privacy">Los perfiles, briefs y alternativas se almacenan localmente en este dispositivo. No incluyás nombres, teléfonos ni datos que identifiquen a clientes.</p>
    </section>
  `;
}
