import { PERFUME_ITEMS } from "../../perfume-library/data.js";
const FAMILY_SIGNALS = Object.freeze({
  "Cítrica":{unisex:1.25,youth:1.15},"Acuática":{unisex:1.35,youth:1.2},
  "Verde":{unisex:1.15,youth:1.05},"Aromática":{unisex:0.95,masculine:0.15,adult:0.55},
  "Almizclada":{unisex:1.05,adult:0.35},"Amaderada":{masculine:1.2,adult:1.1,unisex:0.1},
  "Especiada":{masculine:1.05,adult:1.05},"Ámbar y resinosa":{masculine:1,adult:1.15},
  "Cuero":{masculine:1.3,adult:1.2},"Floral":{feminine:1.15,adult:0.55,youth:0.35},
  "Frutal":{feminine:0.85,unisex:0.2,youth:1},"Gourmand":{feminine:0.8,masculine:0.1,adult:0.7,youth:0.3}
});
const empty = (status,message)=>({status,positioning:"Sin lectura suficiente",agePosition:"Sin lectura suficiente",confidence:"No disponible",families:[],summary:message,notice:"La clasificación es una hipótesis editorial de posicionamiento, no una regla de uso."});
export function analyzeAudienceFit(items=[],library=PERFUME_ITEMS){
  if(!Array.isArray(items)||!items.length)return empty("empty","Agregá referencias al formulador para evaluar el posicionamiento de la composición.");
  const refs=new Map(library.map(item=>[item.id,item])),seen=new Set(),resolved=[];
  for(const entry of items){
    if(!entry||typeof entry.id!=="string"||seen.has(entry.id))return empty("invalid","La composición contiene una referencia repetida o inválida.");
    const reference=refs.get(entry.id),points=Number(entry.points);
    if(!reference)return empty("invalid","La composición contiene una referencia que no existe en la biblioteca local.");
    if(!Number.isInteger(points)||points<0)return empty("invalid","Los puntos creativos deben ser números enteros no negativos.");
    seen.add(entry.id);resolved.push({reference,points});
  }
  const total=resolved.reduce((sum,entry)=>sum+entry.points,0);
  if(total!==100)return empty("invalid","La composición necesita sumar exactamente 100 puntos creativos para evaluarse.");
  const gender={masculine:0,feminine:0,unisex:0},age={youth:0,adult:0},familyPoints=new Map();
  for(const {reference,points} of resolved){
    const weight=points/total,signal=FAMILY_SIGNALS[reference.family]||{};
    gender.masculine+=weight*(signal.masculine||0);
    gender.feminine+=weight*(signal.feminine||0);
    gender.unisex+=weight*(signal.unisex||0);
    age.youth+=weight*(signal.youth||0);age.adult+=weight*(signal.adult||0);
    familyPoints.set(reference.family,(familyPoints.get(reference.family)||0)+points);
  }
  const gap=Math.abs(gender.masculine-gender.feminine);
  const positioning=gender.unisex>=Math.max(gender.masculine,gender.feminine)*0.72||gap<0.14
    ?"Unisex / versátil":gender.masculine>gender.feminine?"Tendencia masculina":"Tendencia femenina";
  const ageGap=age.youth-age.adult;
  const agePosition=ageGap>0.16?"Juvenil / contemporáneo":ageGap< -0.16?"Adulto / sofisticado":"Transversal: juvenil a adulto";
  const families=[...familyPoints.entries()].sort((a,b)=>b[1]-a[1]).slice(0,4).map(([name,share])=>({name,share}));
  const confidence=resolved.length>=3&&familyPoints.size>=2?"Media":"Baja";
  const lead=families[0]?.name||"la estructura actual";
  const summary=positioning==="Unisex / versátil"
    ?"La mezcla se inclina hacia una lectura equilibrada o versátil; "+lead.toLowerCase()+" aporta parte importante del carácter."
    :"La combinación de familias sugiere una presentación comercial con tendencia "+(positioning==="Tendencia masculina"?"masculina":"femenina")+", influida especialmente por "+lead.toLowerCase()+".";
  return {status:"ready",positioning,agePosition,confidence,families,summary,referenceCount:resolved.length,familyCount:familyPoints.size,
    notice:"Lectura editorial basada en convenciones de mercado asociadas a familias y facetas. No determina quién puede usar la fragancia, no predice preferencias individuales y no limita el público real. La edad es una estética de posicionamiento, no una restricción."};
}
