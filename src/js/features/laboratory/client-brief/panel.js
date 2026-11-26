const escapeHtml = (value = "") => String(value).replace(/[&<>"']/g, (char) => ({
  "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"
})[char]);
const select = (id, label, options, value) => `
  <label class="client-brief-field"><span>${label}</span><select id="${id}">
    ${options.map(([optionValue, optionLabel]) => `<option value="${optionValue}" ${value === optionValue ? "selected" : ""}>${optionLabel}</option>`).join("")}
  </select></label>`;
const styles = [["sin preferencia","Sin preferencia"],["fresco","Fresco"],["floral","Floral"],["amaderado","Amaderado"],["dulce","Dulce"],["limpio","Limpio"],["elegante","Elegante"],["moderno","Moderno"],["cálido","Cálido"]];
const occasions = [["sin definir","Sin definir"],["diario","Uso diario"],["trabajo","Trabajo"],["casual","Casual"],["evento especial","Evento especial"],["noche","Noche"],["regalo","Regalo"]];
const presences = [["sin definir","Sin definir"],["discreta","Discreta"],["equilibrada","Equilibrada"],["marcada","Marcada"]];
export function renderClientBriefPanel(state = {}) {
  const fields = state.fields || {};
  const result = state.result || null;
  return `
    <section class="client-brief-panel" id="client-brief-panel">
      <details class="client-brief-details" ${result ? "open" : ""}>
        <summary class="client-brief-summary">
          <span class="client-brief-symbol" aria-hidden="true">◎</span>
          <span><strong>Brief guiado de cliente</strong><small>Convertí gustos y contexto en una dirección de diseño</small></span><b aria-hidden="true">⌄</b>
        </summary>
        <div class="client-brief-body">
          <p class="client-brief-intro">Recopilá solo preferencias olfativas y contexto de uso. No hace falta escribir el nombre ni datos personales del cliente.</p>
          <div class="client-brief-grid">
            ${select("client-brief-occasion","Ocasión",occasions,fields.occasion || "sin definir")}
            ${select("client-brief-style","Estilo buscado",styles,fields.style || "sin preferencia")}
            ${select("client-brief-presence","Presencia deseada",presences,fields.presence || "sin definir")}
          </div>
          <label class="client-brief-field"><span>Qué le gusta o busca</span><textarea id="client-brief-liked" rows="2" maxlength="280" placeholder="Ej.: fresco, limpio, cítrico, floral, elegante...">${escapeHtml(fields.liked || "")}</textarea></label>
          <label class="client-brief-field"><span>Qué desea evitar o moderar</span><textarea id="client-brief-avoid" rows="2" maxlength="280" placeholder="Ej.: demasiado dulce, cuero intenso, notas pesadas...">${escapeHtml(fields.avoid || "")}</textarea></label>
          <label class="client-brief-field"><span>Contexto adicional (opcional)</span><textarea id="client-brief-additional" rows="2" maxlength="280" placeholder="Clima, estilo personal, ocasión concreta...">${escapeHtml(fields.additional || "")}</textarea></label>
          <label class="client-brief-field"><span>Nombre corto para el historial (opcional)</span><input id="client-brief-profile-label" maxlength="70" value="${escapeHtml(state.label || "")}" placeholder="Ej. Fresco y discreto · uso diario"></label>
          <div class="client-brief-actions"><button type="button" data-action="prepare-client-brief">Preparar brief</button><button type="button" data-action="clear-client-brief">Limpiar</button></div>
          ${result ? `<div class="client-brief-preview" aria-live="polite"><p class="eyebrow">VISTA PREVIA DEL BRIEF</p>${result.status === "ready" ? `<p>${escapeHtml(result.description)}</p><div class="client-brief-preview-actions"><button type="button" class="client-brief-send" data-action="send-client-brief-to-assistant">Analizar con el asistente creativo</button><button type="button" class="client-brief-save-profile" data-action="save-client-profile">Guardar perfil y alternativas</button></div>` : `<p>${escapeHtml(result.followUpQuestion)}</p>`}</div>` : ""}
          <p class="client-brief-privacy">El brief se procesa en este dispositivo. La transferencia al asistente requiere pulsar el botón; no se guarda ni se envía automáticamente.</p>
        </div>
      </details>
    </section>`;
}
