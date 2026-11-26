import { PERFUME_ITEMS } from "../../perfume-library/data.js";
import { REFERENCE_PERFUMES, REFERENCE_CATALOG_SOURCE } from "./data.js";
const norm = (value="") => String(value).normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
const ALIASES = {
 "white musk":["musk"],"almizcle blanco":["musk"],"orange blossom":["orange blossom","neroli"],"flor de azahar":["orange blossom","neroli"],
 "pink pepper":["pink pepper","pepper"],"cedarwood":["cedar","cedarwood"],"cedro":["cedar","cedarwood"],"patchouli":["patchouli"],"pachuli":["patchouli"],
 "oud":["oud","agarwood"],"agarwood":["oud","agarwood"],"agar":["oud","agarwood"],"vanilla":["vanilla"],"vainilla":["vanilla"],"tonka bean":["tonka","tonka bean"],"tonka":["tonka","tonka bean"],
 "leather":["leather"],"cuero":["leather"],"rose":["rose"],"rosa":["rose"],"jasmine":["jasmine"],"jazmin":["jasmine"],"bergamot":["bergamot"],"bergamota":["bergamot"],
 "lavender":["lavender"],"lavanda":["lavender"],"sandalwood":["sandalwood"],"sandalo":["sandalwood"],"amber":["amber"],"moss":["moss"],"oakmoss":["oakmoss","moss"],
 "vetiver":["vetiver"],"iris":["iris"],"cardamom":["cardamom"],"cardamomo":["cardamom"],"cinnamon":["cinnamon"],"canela":["cinnamon"],"saffron":["saffron"],"azafran":["saffron"],
 "lemon":["lemon"],"limon":["lemon"],"grapefruit":["grapefruit"],"apple":["apple"],"manzana":["apple"],"pear":["pear"],"pera":["pear"],"peach":["peach"],"durazno":["peach"],
 "raspberry":["raspberry"],"frambuesa":["raspberry"],"fig":["fig"],"higo":["fig"],"pineapple":["pineapple"],"pina":["pineapple"],"coconut":["coconut"],"coco":["coconut"],
 "tobacco":["tobacco"],"tabaco":["tobacco"],"incense":["incense"],"olibanum":["incense"],"frankincense":["incense"],"myrrh":["myrrh"],"mirra":["myrrh"],
 "mint":["mint"],"menta":["mint"],"green tea":["green tea"],"tea":["tea"],"plum":["plum"],"ciruela":["plum"],"cherry":["cherry"],"cereza":["cherry"],
 "benzoin":["benzoin"],"amberwood":["amberwood"],"ambroxan":["ambroxan"],"cashmeran":["cashmeran"],"cacao":["cacao"],"chocolate":["chocolate"],"coffee":["coffee"],"cafe":["coffee"],
 "almond":["almond"],"almendra":["almond"],"praline":["praline"],"geranium":["geranium"],"geranio":["geranium"],"tuberose":["tuberose"],"nardo":["tuberose"],
 "ylang ylang":["ylang ylang"],"peony":["peony"],"peonia":["peony"],"lily":["lily"],"lirio":["lily"],"orange":["orange"],"naranja":["orange"],
 "basil":["basil"],"albahaca":["basil"],"rosemary":["rosemary"],"romero":["rosemary"],"sage":["sage"],"salvia":["sage"],"juniper":["juniper"],"eucalyptus":["eucalyptus"],
 "aquatic":["aquatic"],"marine":["marine"],"sea notes":["marine"],"ozonic":["ozonic"]
};
const FAMILY_KEYWORDS = {
 "Cítrica":["citrus","bergamot","lemon","lime","mandarin","orange","grapefruit","yuzu"],
 "Frutal":["apple","pear","peach","raspberry","fig","pineapple","plum","cherry","berry","fruit"],
 "Floral":["rose","jasmine","orange blossom","iris","violet","peony","lily","tuberose","ylang","floral"],
 "Aromática":["lavender","sage","rosemary","basil","mint","aromatic","herbal"],
 "Verde":["green","leaf","galbanum","fig leaf"],"Amaderada":["cedar","sandalwood","vetiver","wood","patchouli","oak","cashmeran"],
 "Ámbar y resinosa":["amber","benzoin","labdanum","incense","myrrh","opoponax","resin"],
 "Especiada":["pepper","cardamom","cinnamon","saffron","ginger","spice"],
 "Gourmand":["vanilla","tonka","cacao","chocolate","coffee","almond","praline","caramel"],
 "Almizclada":["musk","ambrette"],"Acuática":["aquatic","marine","ozonic","sea"],"Cuero":["leather","suede","tobacco"]
};
const itemMap = new Map(PERFUME_ITEMS.map(item=>[item.id,item]));
function itemAliases(item){const base=[item.name,...(item.facets||[])].map(norm).filter(Boolean);const out=new Set(base);for(const value of base)for(const alias of ALIASES[value]||[])out.add(norm(alias));return [...out];}
function familiesForNotes(notes=[]){const found=new Set();for(const note of notes){const text=norm(note);for(const [family,keys] of Object.entries(FAMILY_KEYWORDS))if(keys.some(key=>text.includes(norm(key))))found.add(family);}return found;}
function formulaFamilyProfile(items){const map=new Map();for(const entry of items){const item=itemMap.get(entry.id);if(item)map.set(item.family,(map.get(item.family)||0)+Number(entry.points));}const total=[...map.values()].reduce((a,b)=>a+b,0);return new Map([...map].map(([family,value])=>[family,total?value/total:0]));}
function cosine(a,b){const keys=new Set([...a.keys(),...b.keys()]);let dot=0,aa=0,bb=0;for(const key of keys){const x=a.get(key)||0,y=b.get(key)||0;dot+=x*y;aa+=x*x;bb+=y*y;}return aa&&bb?dot/(Math.sqrt(aa)*Math.sqrt(bb)):0;}
function directOverlap(items,notes){const normalized=new Set((notes||[]).map(norm).filter(Boolean));let weighted=0,total=0,matches=[];for(const entry of items){const item=itemMap.get(entry.id);if(!item)continue;const aliases=itemAliases(item);total+=Number(entry.points);const matched=[...normalized].filter(note=>aliases.some(alias=>note===alias||(alias.length>4&&note.includes(alias))||(note.length>4&&alias.includes(note))));if(matched.length){weighted+=Number(entry.points);matches.push({name:item.name,matched:matched.slice(0,2)});}}return {score:total?weighted/total:0,matches};}
function profileFromNotes(notes){const families=familiesForNotes(notes);return new Map([...families].map(family=>[family,1/families.size]));}
export function benchmarkFormulaAgainstCatalog(items=[],catalog=REFERENCE_PERFUMES){
 if(!Array.isArray(items)||!items.length)return {status:"empty",matchesByCategory:{},source:REFERENCE_CATALOG_SOURCE,totalCatalog:catalog.length};
 const clean=items.filter(entry=>entry&&itemMap.has(entry.id)&&Number.isFinite(Number(entry.points))&&Number(entry.points)>0);
 const total=clean.reduce((sum,item)=>sum+Number(item.points),0);
 if(clean.length!==items.length||total<=0)return {status:"invalid",matchesByCategory:{},source:REFERENCE_CATALOG_SOURCE,totalCatalog:catalog.length};
 const formulaProfile=formulaFamilyProfile(clean);
 const ranked=catalog.map(perfume=>{
  const direct=directOverlap(clean,perfume.notes||[]),familyScore=cosine(formulaProfile,profileFromNotes(perfume.notes||[]));
  const score=direct.score>0?direct.score*0.72+familyScore*0.28:familyScore*0.5;
  return {id:perfume.id,name:perfume.name,house:perfume.house,category:perfume.category,score:Math.round(score*100),directNoteMatch:Math.round(direct.score*100),familyMatch:Math.round(familyScore*100),matchedNotes:direct.matches.map(x=>x.name),matchedCatalogNotes:direct.matches.flatMap(x=>x.matched),family:perfume.family,character:perfume.character||[],url:perfume.url,confidence:direct.matches.length>=3?"Media":direct.matches.length>=1?"Baja":"Muy baja",evidenceCount:direct.matches.length};
 }).sort((a,b)=>b.score-a.score||b.directNoteMatch-a.directNoteMatch);
 const categories=["arabian","niche","designer"],matchesByCategory=Object.fromEntries(categories.map(category=>[category,ranked.filter(row=>row.category===category).slice(0,3)]));
 const categoryCounts=Object.fromEntries(categories.map(category=>[category,catalog.filter(row=>row.category===category).length]));
 return {status:"ready",matchesByCategory,categoryCounts,totalCatalog:catalog.length,source:REFERENCE_CATALOG_SOURCE,summary:"Comparación por notas públicas, descriptores y familias. No compara ingredientes químicos, fórmulas propietarias ni proporciones de fabricación."};
}
