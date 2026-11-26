import { analyzeAudienceFit } from "./engine.js";
const escapeHtml=(value="")=>String(value).replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
export function renderAudienceFit(items=[],library){
  if(!Array.isArray(items)||!items.length)return "";
  const result=analyzeAudienceFit(items,library);
  if(result.status!=="ready")return \`
    <section class="audience-fit-card" id="audience-fit-analysis"><div class="audience-fit-heading"><div><p class="eyebrow">LECTURA DE MERCADO</p><h2>Público potencial</h2></div><span>Revisión necesaria</span></div><p class="audience-fit-summary">${escapeHtml(result.summary)}</p></section>\`;
  return \`
    <section class="audience-fit-card" id="audience-fit-analysis">
      <div class="audience-fit-heading"><div><p class="eyebrow">LECTURA DE MERCADO</p><h2>Público potencial</h2></div><span>Confianza ${escapeHtml(result.confidence)}</span></div>
      <div class="audience-fit-grid">
        <article class="audience-fit-result"><small>POSICIONAMIENTO DE GÉNERO</small><strong>${escapeHtml(result.positioning)}</strong><p>${escapeHtml(result.summary)}</p></article>
        <article class="audience-fit-result"><small>ESTÉTICA DE EDAD</small><strong>${escapeHtml(result.agePosition)}</strong><p>Orientación comercial amplia, no un rango de edad ni una limitación de uso.</p></article>
      </div>
      <div class="audience-fit-families"><span>Familias que más influyen</span><div>${result.families.map(family=>\`<b>${escapeHtml(family.name)} · ${family.share} pts</b>\`).join("")}</div></div>
      <p class="audience-fit-boundary">${escapeHtml(result.notice)}</p>
    </section>\`;
}
