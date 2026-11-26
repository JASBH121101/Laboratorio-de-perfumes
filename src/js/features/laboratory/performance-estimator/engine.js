import { PERFUME_ITEMS } from "../../perfume-library/data.js";
const ITEM_MAP=new Map(PERFUME_ITEMS.map(item=>[item.id,item]));
const PERSISTENCE=Object.freeze({"Cítrica":0.12,"Frutal":0.28,"Floral":0.38,"Aromática":0.35,"Verde":0.18,"Amaderada":0.78,"Ámbar y resinosa":0.88,"Especiada":0.62,"Gourmand":0.72,"Almizclada":0.72,"Acuática":0.14,"Cuero":0.9});
const PROJECTION=Object.freeze({"Cítrica":0.7,"Frutal":0.55,"Floral":0.48,"Aromática":0.68,"Verde":0.58,"Amaderada":0.34,"Ámbar y resinosa":0.42,"Especiada":0.72,"Gourmand":0.36,"Almizclada":0.22,"Acuática":0.62,"Cuero":0.38});
const persistBands=[{max:25,label:"Baja",hours:[2,4]},{max:45,label:"Baja a moderada",hours:[3,5]},{max:65,label:"Moderada",hours:[4,7]},{max:80,label:"Moderada a alta",hours:[6,9]},{max:100,label:"Alta",hours:[8,12]}];
const projectBands=[{max:20,label:"Muy cercana",initial:[0.2,0.5],later:[0.1,0.3]},{max:40,label:"Cercana",initial:[0.3,0.8],later:[0.2,0.5]},{max:60,label:"Moderada",initial:[0.5,1.2],later:[0.2,0.7]},{max:80,label:"Notable",initial:[0.8,1.8],later:[0.3,0.9]},{max:100,label:"Amplia",initial:[1.2,2.5],later:[0.5,1.2]}];
const clamp=(v,min=0,max=100)=>Math.max(min,Math.min(max,v));
function profileModifier(item,facetText){const text=(item.profile+" "+facetText).toLowerCase();let value=0;if(/intens|opulent|powerful|potent|dense|rich|bold|heavy/.test(text))value+=0.1;if(/airy|light|delicate|soft|clean|transparent|fresh/.test(text))value-=0.06;return value;}
export function estimatePerformance(items=[]){
 if(!Array.isArray(items)||!items.length)return {status:"empty",persistence:null,projection:null,confidence:"No disponible",notice:"Añadí referencias a la composición para estimar el rendimiento conceptual."};
 const clean=items.filter(entry=>entry&&ITEM_MAP.has(entry.id)&&Number.isFinite(Number(entry.points))&&Number(entry.points)>=0);
 const total=clean.reduce((sum,entry)=>sum+Number(entry.points),0);
 if(clean.length!==items.length||total!==100)return {status:"invalid",persistence:null,projection:null,confidence:"No disponible",notice:"El análisis necesita referencias válidas y 100 puntos creativos."};
 let persist=0,project=0;
 for(const entry of clean){
  const item=ITEM_MAP.get(entry.id),weight=Number(entry.points)/total,roles=item.roles||[];
  const rolePersist=roles.includes("Fondo")?0.16:roles.includes("Salida")?-0.12:0;
  const roleProject=roles.includes("Salida")?0.16:roles.includes("Fondo")?-0.13:0;
  const modifier=profileModifier(item,(item.facets||[]).join(" "));
  persist+=weight*clamp((PERSISTENCE[item.family]??0.4)+rolePersist+modifier,0,1);
  project+=weight*clamp((PROJECTION[item.family]??0.45)+roleProject+modifier,0,1);
 }
 const persistenceScore=Math.round(clamp(persist*100)),projectionScore=Math.round(clamp(project*100));
 const persistenceBand=persistBands.find(b=>persistenceScore<=b.max)||persistBands.at(-1);
 const projectionBand=projectBands.find(b=>projectionScore<=b.max)||projectBands.at(-1);
 return {status:"ready",persistence:{score:persistenceScore,label:persistenceBand.label,hours:persistenceBand.hours},projection:{score:projectionScore,label:projectionBand.label,initialMeters:projectionBand.initial,laterMeters:projectionBand.later},confidence:"Baja",notice:"Estimación heurística editorial basada en familias, facetas y roles de la biblioteca. Los 100 puntos son ponderaciones creativas, no concentración química ni dosificación. Sin concentración real, vehículo, materias específicas, condiciones de aplicación y prueba en piel, las horas y distancias son rangos muy aproximados; no son una simulación ni garantía de rendimiento."};
}
