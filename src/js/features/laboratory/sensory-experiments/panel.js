import {
  SENSORY_CONTEXTS, SENSORY_RATINGS, SENSORY_TAGS
} from "./model.js";

const esc = (value = "") => String(value).replace(/[&<>"']/g, (char) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
})[char]);

const ratingOptions = (selected = null) => `<option value="">Sin valorar</option>${[1,2,3,4,5].map((value) =>
  `<option value="${value}" ${Number(selected) === value ? "selected" : ""}>${value} / 5</option>`
).join("")}`;

function variantOptions(creations = [], selectedKey = "") {
  return creations.flatMap((creation) => (creation.variants ?? []).map((variant) => {
    const key = JSON.stringify({ creationId: creation.id, variantId: variant.id });
    const label = `${creation.name} · ${variant.label} — ${variant.name}`;
    return `<option value="${esc(key)}" ${key === selectedKey ? "selected" : ""}>${esc(label)}</option>`;
  })).join("");
}

function renderRecord(record) {
  const ratings = Object.entries(SENSORY_RATINGS)
    .filter(([key]) => record.ratings?.[key] !== null && record.ratings?.[key] !== undefined)
    .map(([key,label]) => `<span>${esc(label)} <strong>${record.ratings[key]}/5</strong></span>`)
    .join("");
  const tags = (record.tags ?? []).map((tag) => `<span class="sensory-tag">${esc(tag)}</span>`).join("");
  const time = new Date(record.observedAt);
  const date = Number.isFinite(time.getTime()) ? new Intl.DateTimeFormat("es-NI",{dateStyle:"medium",timeStyle:"short"}).format(time) : "Fecha inválida";
  return `
    <article class="sensory-record">
      <div class="sensory-record-head">
        <div><p class="eyebrow">${esc(record.creationName)} · ${esc(record.variantLabel)} · v${record.versionNumber}</p><h4>${esc(record.title)}</h4><small>${esc(date)} · ${esc(SENSORY_CONTEXTS[record.context] ?? "Otro")}${record.observer ? " · " + esc(record.observer) : ""}${record.elapsedMinutes !== null ? " · " + record.elapsedMinutes + " min" : ""}</small></div>
        <button type="button" class="sensory-delete" data-action="delete-sensory-experiment" data-experiment-id="${esc(record.id)}" aria-label="Eliminar registro sensorial">×</button>
      </div>
      <p class="sensory-impression">${esc(record.impression)}</p>
      ${tags ? `<div class="sensory-tags">${tags}</div>` : ""}
      ${ratings ? `<div class="sensory-ratings">${ratings}</div>` : ""}
      <small class="sensory-snapshot-note">Instantánea asociada: ${record.composition.length} referencias guardadas en esa versión. Las valoraciones son subjetivas.</small>
    </article>
  `;
}

export function renderSensoryExperiments(state = {}) {
  const creations = state.creations ?? [];
  const experiments = [...(state.experiments ?? [])].sort((a,b) => String(b.observedAt).localeCompare(String(a.observedAt)));
  const variants = creations.flatMap((creation) => (creation.variants ?? []).map((variant) => ({ creation, variant })));
  const defaultKey = variants[0]
    ? JSON.stringify({ creationId: variants[0].creation.id, variantId: variants[0].variant.id }) : "";
  const selectedKey = variants.some(({creation,variant}) =>
    JSON.stringify({creationId:creation.id,variantId:variant.id}) === state.sensorySelection)
    ? state.sensorySelection : defaultKey;
  const list = experiments.length
    ? experiments.map(renderRecord).join("")
    : '<div class="sensory-empty"><strong>Sin observaciones todavía.</strong><p>Registrá la primera evaluación y comenzá a documentar cambios percibidos a lo largo del tiempo.</p></div>';
  const disabled = variants.length === 0;
  const ratingFields = Object.entries(SENSORY_RATINGS).map(([key,label]) => `
    <label class="sensory-field"><span>${esc(label)}</span><select name="rating_${key}">${ratingOptions()}</select></label>
  `).join("");
  const tagFields = SENSORY_TAGS.map((tag) => `
    <label class="sensory-tag-choice"><input type="checkbox" name="tags" value="${esc(tag)}"><span>${esc(tag)}</span></label>
  `).join("");
  const now = new Date().toISOString().slice(0,16);
  return `
    <section class="sensory-experiments" id="sensory-experiments-root">
      <div class="sensory-heading"><div><p class="eyebrow">BLOCK 09 · SENSORY EXPERIMENT RECORDS</p><h2>Registro de <em>observaciones</em></h2><p>Documentá impresiones propias vinculadas a la versión exacta que evaluaste. Estas notas permanecen separadas de los cálculos analíticos.</p></div><span class="sensory-state">${experiments.length} REGISTROS</span></div>
      <div class="sensory-form-card">
        <div class="sensory-form-intro"><h3>Nuevo experimento sensorial</h3><p>El registro conserva una instantánea de la composición y el número de versión seleccionado.</p></div>
        ${disabled ? '<div class="sensory-empty"><strong>Primero guardá una creación.</strong><p>Los experimentos se asocian a una variante y versión del archivo local.</p></div>' : `
          <form id="sensory-experiment-form" class="sensory-form">
            <label class="sensory-field sensory-field--wide"><span>Creación / variante</span><select name="variantKey" required>${variantOptions(creations,selectedKey)}</select></label>
            <label class="sensory-field"><span>Nombre del ensayo</span><input name="title" maxlength="80" required placeholder="Ej. Evaluación inicial en papel"></label>
            <label class="sensory-field"><span>Fecha y hora</span><input name="observedAt" type="datetime-local" value="${now}" required></label>
            <label class="sensory-field"><span>Evaluador (opcional)</span><input name="observer" maxlength="60" placeholder="Iniciales o alias"></label>
            <label class="sensory-field"><span>Contexto</span><select name="context">${Object.entries(SENSORY_CONTEXTS).map(([key,value]) => `<option value="${key}">${esc(value)}</option>`).join("")}</select></label>
            <label class="sensory-field"><span>Tiempo transcurrido (min, opcional)</span><input name="elapsedMinutes" type="number" min="0" max="10080" step="1" placeholder="Ej. 30"></label>
            <fieldset class="sensory-fieldset sensory-fieldset--wide"><legend>Facetas percibidas</legend><p>Marcá únicamente lo que observaste durante esta evaluación.</p><div class="sensory-tag-choices">${tagFields}</div></fieldset>
            <fieldset class="sensory-fieldset sensory-fieldset--wide"><legend>Valoraciones subjetivas</legend><p>Escala personal de 1 a 5. “Sin valorar” es válido; no son mediciones instrumentales.</p><div class="sensory-rating-grid">${ratingFields}</div></fieldset>
            <label class="sensory-field sensory-field--wide"><span>Observación / evolución percibida</span><textarea name="impression" rows="3" maxlength="1600" required placeholder="Describí qué percibiste, qué cambió y en qué condiciones…"></textarea></label>
            <div class="sensory-form-actions"><button type="button" data-action="save-sensory-experiment">Guardar observación</button></div>
          </form>
        `}
      </div>
      <div class="sensory-records-heading"><h3>Historial sensorial</h3><span>${experiments.length} guardados</span></div>
      <div class="sensory-record-list">${list}</div>
      <div class="sensory-backup-row"><div><strong>Respaldo independiente</strong><small>Exportá o importá tus observaciones sin alterar el archivo de fórmulas.</small></div><div><button type="button" data-action="export-sensory-backup" ${experiments.length ? "" : "disabled"}>Exportar JSON</button><label for="sensory-import-file" class="sensory-import-label">Importar JSON</label><input id="sensory-import-file" type="file" accept="application/json,.json" hidden></div></div>
      <p class="sensory-disclaimer">Las valoraciones y descripciones son observaciones personales, no resultados de laboratorio, mediciones de concentración ni predicciones de duración o rendimiento. Los datos se guardan en este dispositivo.</p>
    </section>
  `;
}
