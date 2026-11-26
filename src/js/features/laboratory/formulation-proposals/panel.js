const escapeHtml = (value = "") => String(value).replace(/[&<>"']/g, (char) => ({
  "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"
})[char]);

export function renderFormulationProposals(state = {}) {
  const result = state.result || null;
  return `
    <section class="formulation-proposals" id="formulation-proposals">
      <div class="formulation-proposals-heading">
        <div>
          <p class="eyebrow">BLOCK 13 · PROPOSAL ENGINE</p>
          <h2>Alternativas de <em>formulación</em></h2>
          <p>Tres rutas conceptuales para comparar antes de cargar una en tu espacio de trabajo.</p>
        </div>
        <span class="formulation-proposals-status">${result?.proposals?.length || 0} rutas</span>
      </div>
      ${!result ? `
        <div class="formulation-proposals-empty"><strong>Primero definí una dirección creativa</strong><small>Usá el asistente de arriba para crear un brief. Las propuestas se generan desde sus preferencias.</small></div>
      ` : result.proposals?.length ? `
        <p class="formulation-proposals-summary">${escapeHtml(result.summary)}</p>
        ${result.proposals.map((proposal) => `
          <article class="formulation-proposal" data-proposal-card="${escapeHtml(proposal.id)}">
            <div class="formulation-proposal-head">
              <div><span class="formulation-proposal-kicker">${escapeHtml(proposal.id.toUpperCase())}</span><h3>${escapeHtml(proposal.title)}</h3><p>${escapeHtml(proposal.subtitle)}</p></div>
              <span class="formulation-proposal-total">${proposal.totalCreativePoints}<small> / 100 pts</small></span>
            </div>
            <div class="formulation-proposal-items">
              ${proposal.items.map((item) => `
                <div class="formulation-proposal-item">
                  <div><strong>${escapeHtml(item.name)}</strong><span>${escapeHtml(item.family)} · ${escapeHtml(item.roles.join(" · "))}</span><small>${escapeHtml(item.rationale)}</small></div>
                  <b>${item.points}<small> pts</small></b>
                </div>
              `).join("")}
            </div>
            <p class="formulation-proposal-description">${escapeHtml(proposal.description)}</p>
            <button type="button" class="formulation-proposal-load" data-action="load-formulation-proposal" data-proposal-id="${escapeHtml(proposal.id)}">Cargar esta propuesta</button>
          </article>
        `).join("")}
        <p class="formulation-proposals-boundary">Los puntos son una distribución editorial normalizada a 100 para comparar alternativas. No representan concentraciones, dosificaciones, proporciones físicas ni instrucciones de fabricación. Cargar una propuesta sustituye la composición activa después de confirmarlo; el cambio puede deshacerse desde el formulador.</p>
      ` : `
        <div class="formulation-proposals-empty"><strong>No se pudieron generar tres rutas todavía</strong><small>${escapeHtml(result.summary || "Afiná el brief y volvé a intentarlo.")}</small>${result.followUpQuestion ? `<p>${escapeHtml(result.followUpQuestion)}</p>` : ""}</div>
      `}
    </section>
  `;
}
