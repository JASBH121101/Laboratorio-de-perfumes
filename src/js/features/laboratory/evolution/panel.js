import { analyzeEvolutionStage, EVOLUTION_STAGES } from "./engine.js";

const esc = (value = "") => String(value).replace(/[&<>"']/g, (c) => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]));

export function renderEvolutionSimulator(state, selectedStage = "opening") {
  const result = analyzeEvolutionStage(state, selectedStage);
  const stageButtons = EVOLUTION_STAGES.map((stage) => `
    <button class="evolution-stage ${stage.id === result.stage.id ? "is-active" : ""}" type="button" data-evolution-stage="${stage.id}" aria-pressed="${stage.id === result.stage.id}">
      <span>${esc(stage.label)}</span><small>${esc(stage.time)}</small>
    </button>`).join("");
  const references = result.references.map((note) => `
    <article class="evolution-note">
      <div class="evolution-note-head"><strong>${esc(note.name)}</strong><span>${note.share}% del perfil de etapa</span></div>
      <small>${esc(note.family)} · ${note.points} pts creativos</small>
      <p>${esc(note.profile)}</p>
      <div class="evolution-track"><span style="width:${note.share}%"></span></div>
    </article>`).join("");
  let message = "";
  if (result.isEmpty) message = "Añadí referencias a tu composición para explorar la lectura por etapas.";
  else if (!result.hasStageReferences) message = "La biblioteca no asigna referencias a esta etapa en tu composición. Esto no implica que un perfume real carezca de evolución.";
  return `
    <section class="evolution-simulator" id="evolution-simulator">
      <div class="evolution-heading"><div><p class="eyebrow">BLOCK 07 · CONCEPTUAL EVOLUTION</p><h2>Evolución <em>conceptual</em></h2><p>Explorá las etapas asociadas a las referencias de tu composición.</p></div><span class="evolution-status">SIMULACIÓN EDITORIAL</span></div>
      <div class="evolution-stage-tabs" role="group" aria-label="Etapas conceptuales">${stageButtons}</div>
      <div class="evolution-stage-summary"><span class="evolution-time">${esc(result.stage.time)}</span><h3>${esc(result.stage.label)}</h3><p>${esc(result.description)}</p></div>
      <div class="evolution-reference-list">${references}</div>
      ${message ? `<div class="evolution-empty">${esc(message)}</div>` : ""}
      <p class="evolution-disclaimer">Esta vista organiza referencias por roles editoriales y sus puntos creativos. No simula volatilidad, química, duración, proyección ni el olor real a través del tiempo. Las etapas y tiempos son una guía conceptual, no predicciones de una fragancia física.</p>
    </section>
  `;
}
