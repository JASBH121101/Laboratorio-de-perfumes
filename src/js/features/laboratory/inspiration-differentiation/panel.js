const escapeHtml = (value = "") => String(value).replace(/[&<>"']/g, (char) => ({
  "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"
})[char]);

export function renderInspirationDifferentiation(state = {}) {
  const result = state.result || null;
  return `
    <section class="inspiration-differentiation" id="inspiration-differentiation">
      <details class="inspiration-differentiation-details" ${result ? "open" : ""}>
        <summary class="inspiration-differentiation-summary">
          <span class="inspiration-differentiation-symbol" aria-hidden="true">◇</span>
          <span><strong>Diferenciación por inspiración</strong><small>Identificá qué te gusta y explorá arquitecturas conceptuales distintas.</small></span>
          <b aria-hidden="true">⌄</b>
        </summary>
        <div class="inspiration-differentiation-body">
          <p class="inspiration-differentiation-intro">El nombre del perfume es opcional y solo sirve como etiqueta local. El motor no busca datos externos ni intenta reconstruir su composición. Trabaja únicamente con los rasgos que describís.</p>
          <label class="inspiration-differentiation-field">
            <span>Perfume de referencia · opcional</span>
            <input id="inspiration-reference-label" maxlength="96" value="${escapeHtml(state.referenceLabel || "")}" placeholder="Nombre o etiqueta para recordar la inspiración">
          </label>
          <label class="inspiration-differentiation-field">
            <span>¿Qué te gusta de ese aroma?</span>
            <textarea id="inspiration-liked" rows="3" maxlength="1200" placeholder="Ej.: Me gusta la salida cítrica, la frescura verde y el fondo amaderado.">${escapeHtml(state.liked || "")}</textarea>
          </label>
          <label class="inspiration-differentiation-field">
            <span>¿Qué querés evitar o cambiar?</span>
            <textarea id="inspiration-avoid" rows="2" maxlength="1200" placeholder="Ej.: No quiero tanto dulzor ni que el resultado sea demasiado intenso.">${escapeHtml(state.avoid || "")}</textarea>
          </label>
          <div class="inspiration-differentiation-actions">
            <button type="button" data-action="analyze-inspiration-profile">Analizar rasgos y diferenciar</button>
            <button type="button" data-action="clear-inspiration-profile">Limpiar</button>
          </div>
          ${result ? `
            <div class="inspiration-differentiation-result" aria-live="polite">
              <p class="eyebrow">PERFIL EXTRAÍDO</p>
              ${result.referenceLabel ? `<p class="inspiration-reference-name">Referencia: <strong>${escapeHtml(result.referenceLabel)}</strong></p>` : ""}
              <div class="inspiration-trait-groups">
                <div><span>RASGOS QUE TE GUSTAN</span><div>${(result.likedTraits || []).map((trait) => `<b>${escapeHtml(trait)}</b>`).join("") || "<small>No se identificaron todavía.</small>"}</div></div>
                <div><span>RASGOS A EVITAR</span><div>${(result.avoidedTraits || []).map((trait) => `<b>${escapeHtml(trait)}</b>`).join("") || "<small>No se indicaron.</small>"}</div></div>
              </div>
              ${result.directions?.length ? `
                <p class="inspiration-direction-intro">${escapeHtml(result.summary)}</p>
                <div class="inspiration-directions">
                  ${result.directions.map((direction) => `
                    <article class="inspiration-direction">
                      <div class="inspiration-direction-head"><div><span>${escapeHtml(direction.id.toUpperCase())}</span><h3>${escapeHtml(direction.title)}</h3><p>${escapeHtml(direction.subtitle)}</p></div></div>
                      <div class="inspiration-family-path">${direction.familyPattern.map((family, index) => `${index ? "<i>→</i>" : ""}<b>${escapeHtml(family)}</b>`).join("")}</div>
                      <div class="inspiration-reference-list">
                        ${direction.references.map((reference) => `
                          <div><strong>${escapeHtml(reference.name)}</strong><span>${escapeHtml(reference.family)} · ${escapeHtml(reference.roles.join(" · "))}</span><small>${escapeHtml(reference.profile)}</small></div>
                        `).join("")}
                      </div>
                      <button type="button" class="inspiration-send-brief" data-action="send-inspiration-direction" data-direction-id="${escapeHtml(direction.id)}">Usar esta dirección como brief creativo</button>
                    </article>
                  `).join("")}
                </div>
              ` : `
                <div class="inspiration-differentiation-empty"><strong>No hay suficientes rasgos para construir alternativas.</strong><small>${escapeHtml(result.followUpQuestion || result.notice || "")}</small></div>
              `}
              <p class="inspiration-differentiation-boundary">${escapeHtml(result.notice || "Estas son propuestas editoriales, no fórmulas técnicas.")}</p>
            </div>
          ` : ""}
        </div>
      </details>
    </section>
  `;
}
