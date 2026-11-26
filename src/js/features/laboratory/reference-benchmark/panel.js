import { benchmarkFormulaAgainstCatalog } from "./engine.js";
const esc=value=>String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const CATEGORY_LABELS={arabian:"Árabe",niche:"Nicho",designer:"Diseñador"};
function card(match){
 const matched=match.matchedNotes.length ? "<p class=\"reference-benchmark-match\">Notas coincidentes: "+match.matchedNotes.map(esc).join(", ")+"</p>" : "";
 return "<article class=\"reference-benchmark-card\"><div class=\"reference-benchmark-score\"><strong>"+match.score+"%</strong><span>"+esc(match.confidence)+" confianza</span></div><h4>"+esc(match.name)+"</h4><p class=\"reference-benchmark-house\">"+esc(match.house)+" · "+esc(match.family)+"</p><div class=\"reference-benchmark-track\"><i style=\"width:"+match.score+"%\"></i></div>"+matched+"<small>Coincidencia de notas "+match.directNoteMatch+"% · perfil de familias "+match.familyMatch+"%</small><a href=\""+esc(match.url)+"\" target=\"_blank\" rel=\"noopener noreferrer\">Consultar ficha de referencia ↗</a></article>";
}
export function renderCatalogBenchmark(items=[]){
 const result=benchmarkFormulaAgainstCatalog(items);
 if(result.status==="empty")return "";
 if(result.status!=="ready")return "<section class=\"reference-benchmark\"><h3>Comparación con catálogo</h3><p>La composición no se pudo validar para comparación.</p></section>";
 const sections=Object.entries(result.matchesByCategory).map(([category,matches])=>"<section class=\"reference-benchmark-category\"><div class=\"reference-benchmark-category-head\"><h4>"+CATEGORY_LABELS[category]+"</h4><span>"+result.categoryCounts[category]+" referencias</span></div>"+(matches.length?matches.map(card).join(""):"<p class=\"reference-benchmark-empty\">Sin coincidencias disponibles.</p>")+"</section>").join("");
 return "<section class=\"reference-benchmark\" id=\"reference-benchmark\"><div class=\"reference-benchmark-heading\"><p class=\"eyebrow\">COMMERCIAL REFERENCE BENCHMARK</p><h3>¿A qué perfumes del catálogo se parece?</h3><p>Compara tu fórmula con perfiles publicados en el catálogo local. No afirma que sea una copia ni que comparta una fórmula química.</p></div><div class=\"reference-benchmark-sections\">"+sections+"</div><p class=\"reference-benchmark-disclaimer\">"+esc(result.summary)+" Los porcentajes son una similitud editorial estimada, no una probabilidad de copia, originalidad legal ni identidad olfativa. <a href=\""+esc(result.source.url)+"\" target=\"_blank\" rel=\"noopener noreferrer\">"+esc(result.source.attribution)+" · fuente y licencia "+esc(result.source.license)+"</a></p></section>";
}
