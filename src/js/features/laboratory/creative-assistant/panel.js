const escapeHtml = (value = "") => String(value).replace(/[&<>"']/g, (char) => ({
  "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"
})[char]);

function renderSuggestions(suggestions = []) {
  if (!suggestions.length) return "";
  return `
    <div class="creative-assistant-suggestions">
      <div class="creative-assistant-result-heading">
        <div><p class="eyebrow">REFERENCIAS DISPONIBLES</p><h4>Materias para explorar</h4></div>
        <span>${suggestions.length} ideas</span>
      </div>
      <div class="creative-assistant-suggestion-list">
        ${suggestions.map((item) => `
          <article class="creative-assistant-suggestion">
            <div class="creative-assistant-suggestion-main">
              <strong>${escapeHtml(item.name)}</strong>
              <span>${escapeHtml(item.family)} · ${escapeHtml(item.roles.join(" · "))}</span>
              <small>${escapeHtml(item.facets.join(" · "))}</small>
              <p>${escapeHtml(item.rationale)}</p>
            </div>
            <span class="creative-assistant-reference-tag">Biblioteca</span>
          </article>
        `).join("")}
      </div>
    </div>
  `;
}

export function renderCreativeAssistant(state = {}) {
  const result = state.result || null;
  const mode = ["personal", "client", "inspiration"].includes(state.mode) ? state.mode : "personal";
  return `
    <section class="creative-assistant" id="creative-assistant">
      <details class="creative-assistant-details" ${result ? "open" : ""}>
        <summary class="creative-assistant-summary">
          <span class="creative-assistant-symbol" aria-hidden="true">✳</span>
          <span class="creative-assistant-summary-copy">
            <strong>Asistente creativo</strong>
            <small>Ideas olfativas con la biblioteca local · sin API externa</small>
          </span>
          <span class="creative-assistant-chevron" aria-hidden="true">⌄</span>
        </summary>
        <div class="creative-assistant-body">
          <p class="creative-assistant-intro">Describí lo que te gusta, lo que querés evitar o el perfil de otra persona. El asistente interpreta el brief y propone materias que ya existen en JB Perfume Lab.</p>
          <label class="creative-assistant-field">
            <span>Tipo de consulta</span>
            <select id="creative-assistant-mode">
              <option value="personal" ${mode === "personal" ? "selected" : ""}>Mi propia creación</option>
              <option value="client" ${mode === "client" ? "selected" : ""}>Perfil de un cliente o amistad</option>
              <option value="inspiration" ${mode === "inspiration" ? "selected" : ""}>Perfume de referencia que me gusta</option>
            </select>
          </label>
          <label class="creative-assistant-field">
            <span>Contame qué estás buscando</span>
            <textarea id="creative-assistant-brief" rows="4" maxlength="1200" placeholder="Ej.: Me gusta la frescura cítrica y el fondo amaderado. Quiero algo elegante, no muy dulce, para uso diario.">${escapeHtml(state.description || "")}</textarea>
          </label>
          <div class="creative-assistant-actions">
            <button type="button" class="creative-assistant-run" data-action="run-creative-assistant">Analizar y proponer ideas</button>
            <button type="button" class="creative-assistant-clear" data-action="clear-creative-assistant">Limpiar</button>
          </div>
          <p class="creative-assistant-local-note">Procesamiento local y determinista. No se envía el brief a Internet ni se consulta una IA de pago.</p>
          ${result ? `
            <div class="creative-assistant-result" aria-live="polite">
              <p class="eyebrow">LECTURA DEL LABORATORIO</p>
              <h3>${escapeHtml(result.title)}</h3>
              <p>${escapeHtml(result.summary)}</p>
              ${result.preferences?.length ? `<div class="creative-assistant-chips">${result.preferences.map((item) => `<span>${escapeHtml(item)}</span>`).join("")}</div>` : ""}
              ${result.avoidedPreferences?.length ? `<p class="creative-assistant-avoided">Preferencias a moderar: ${escapeHtml(result.avoidedPreferences.join(" · "))}</p>` : ""}
              ${result.followUpQuestion ? `<div class="creative-assistant-question"><strong>Para afinar la propuesta</strong><p>${escapeHtml(result.followUpQuestion)}</p></div>` : ""}
              ${renderSuggestions(result.suggestions)}
              ${result.suggestions?.length ? `<button class="creative-assistant-apply" type="button" data-action="apply-creative-assistant-suggestions">Agregar estas materias al formulador</button>` : ""}
              <p class="creative-assistant-boundary">${escapeHtml(result.notice || "Las ideas son orientativas y deben evaluarse mediante experimentación.")}</p>
            </div>
          ` : ""}
        </div>
      </details>
    </section>
  `;
}
