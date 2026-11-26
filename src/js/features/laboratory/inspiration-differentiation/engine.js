import { PERFUME_ITEMS } from "../../perfume-library/data.js";

const normalize = (value = "") => String(value)
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, " ")
  .trim();

const containsTerm = (text, term) => (` ${normalize(text)} `).includes(` ${normalize(term)} `);

const TRAITS = Object.freeze([
  { id:"citrica", label:"cítrico", keywords:["citrico","citrica","citricos","citricas","bergamota","limon","lima","toronja","pomelo","mandarina","yuzu"], families:["Cítrica"] },
  { id:"floral", label:"floral", keywords:["floral","flores","florales","rosa","jazmin","azahar","peonia","iris","violeta","nardo"], families:["Floral"] },
  { id:"amaderada", label:"amaderado", keywords:["madera","maderas","amaderado","amaderada","cedro","santalo","sandalo","vetiver","pachuli","pachouli"], families:["Amaderada"] },
  { id:"dulce", label:"dulce o gourmand", keywords:["dulce","dulces","dulzor","dulzura","vainilla","gourmand","caramelo","azucar","postre"], families:["Gourmand"] },
  { id:"aromatica", label:"aromático o herbal", keywords:["aromatica","aromatico","herbal","hierbas","lavanda","romero","salvia","menta","albahaca"], families:["Aromática"] },
  { id:"verde", label:"verde", keywords:["verde","verdes","vegetal","hojas","herbaceo","herbacea"], families:["Verde"] },
  { id:"frutal", label:"frutal", keywords:["frutal","frutales","fruta","frutas","pera","manzana","durazno","melocoton","frambuesa","higo","pina","grosella"], families:["Frutal"] },
  { id:"especiada", label:"especiado", keywords:["especiado","especiada","especias","pimienta","cardamomo","canela","jengibre","azafran"], families:["Especiada"] },
  { id:"ambarada", label:"ámbar o resina", keywords:["ambar","ambarada","resina","resinoso","balsamico","incienso"], families:["Ámbar y resinosa"] },
  { id:"almizclada", label:"almizclado o limpio", keywords:["almizcle","almizclado","almizclada","musk"], families:["Almizclada"] },
  { id:"acuática", label:"acuático", keywords:["acuatico","acuatica","marino","marina","ozonico","agua"], families:["Acuática"] },
  { id:"cuero", label:"cuero o ante", keywords:["cuero","ante","leather"], families:["Cuero"] },
  { id:"frescura", label:"frescura", keywords:["fresco","fresca","frescura","refrescante","vibrante"], families:["Cítrica","Aromática","Verde","Acuática"] },
  { id:"limpieza", label:"limpieza", keywords:["limpio","limpia","limpieza","algodon","aireado","aireada"], families:["Almizclada","Aromática","Acuática"] },
  { id:"empolvado", label:"textura empolvada", keywords:["empolvado","empolvada","polvoso","polvosa","talco"], families:["Floral","Almizclada"] },
  { id:"cremoso", label:"textura cremosa", keywords:["cremoso","cremosa","cremosidad","aterciopelado","aterciopelada"], families:["Gourmand","Floral","Amaderada"] },
  { id:"calidez", label:"calidez", keywords:["calido","calida","calidez","envolvente","profundo","profunda"], families:["Ámbar y resinosa","Especiada","Amaderada"] }
]);

const COMPLEMENT_ORDER = Object.freeze({
  "Cítrica":["Aromática","Verde","Frutal","Floral","Amaderada","Almizclada","Acuática","Especiada"],
  "Amaderada":["Aromática","Verde","Especiada","Frutal","Floral","Ámbar y resinosa","Almizclada"],
  "Floral":["Frutal","Verde","Almizclada","Amaderada","Cítrica","Acuática","Especiada"],
  "Gourmand":["Especiada","Frutal","Amaderada","Floral","Ámbar y resinosa","Almizclada"],
  "Aromática":["Cítrica","Verde","Amaderada","Acuática","Especiada","Frutal","Floral"],
  "Verde":["Aromática","Cítrica","Frutal","Amaderada","Floral","Acuática","Almizclada"],
  "Frutal":["Floral","Cítrica","Verde","Amaderada","Almizclada","Especiada","Aromática"],
  "Especiada":["Ámbar y resinosa","Amaderada","Cítrica","Frutal","Floral","Gourmand"],
  "Ámbar y resinosa":["Especiada","Amaderada","Floral","Gourmand","Almizclada","Cítrica"],
  "Almizclada":["Floral","Acuática","Cítrica","Amaderada","Verde","Aromática"],
  "Acuática":["Cítrica","Aromática","Almizclada","Verde","Floral","Frutal"],
  "Cuero":["Amaderada","Especiada","Ámbar y resinosa","Verde","Floral","Aromática"]
});

function isNegated(text, keyword) {
  const words = normalize(text).split(" ").filter(Boolean);
  const target = normalize(keyword).split(" ").filter(Boolean);
  const negators = new Set(["no","sin","evita","evitar","evitando","menos"]);
  for (let index = 0; index <= words.length - target.length; index += 1) {
    if (target.every((word, offset) => words[index + offset] === word)) {
      const prefix = words.slice(Math.max(0, index - 3), index);
      return prefix.some((word) => negators.has(word));
    }
  }
  return false;
}

function extractTraits(text, forceAvoid = false) {
  const positive = [];
  const avoided = [];
  const normalized = normalize(text);
  for (const trait of TRAITS) {
    const keyword = trait.keywords.find((candidate) => containsTerm(normalized, candidate));
    if (!keyword) continue;
    const target = forceAvoid || isNegated(normalized, keyword) ? avoided : positive;
    target.push(trait);
  }
  return { positive, avoided };
}

function familyUsage(creations = [], library = PERFUME_ITEMS) {
  const usage = new Map();
  const familyById = new Map(library.map((item) => [item.id, item.family]));
  for (const creation of creations) {
    for (const variant of creation.variants || []) {
      for (const item of variant.items || []) {
        const family = familyById.get(item.id);
        if (family) usage.set(family, (usage.get(family) || 0) + 1);
      }
    }
  }
  return usage;
}

function chooseFamilies(preferredFamilies, avoidedFamilies, usage, library) {
  const available = [...new Set(library.map((item) => item.family))]
    .filter((family) => !avoidedFamilies.includes(family));
  const primary = preferredFamilies.find((family) => available.includes(family));
  if (!primary) return { primary:null, secondary:null, complements:[] };
  const secondary = preferredFamilies.find((family) => family !== primary && available.includes(family)) || null;
  const order = COMPLEMENT_ORDER[primary] || [];
  const complements = available
    .filter((family) => family !== primary && family !== secondary && !preferredFamilies.includes(family))
    .sort((a, b) => {
      const usageDifference = (usage.get(a) || 0) - (usage.get(b) || 0);
      if (usageDifference !== 0) return usageDifference;
      const rankA = order.indexOf(a) < 0 ? Number.MAX_SAFE_INTEGER : order.indexOf(a);
      const rankB = order.indexOf(b) < 0 ? Number.MAX_SAFE_INTEGER : order.indexOf(b);
      return rankA - rankB;
    });
  return { primary, secondary, complements };
}

function makePattern(values, availableFamilies, avoidedFamilies) {
  const result = [];
  for (const family of values) {
    if (availableFamilies.includes(family) && !avoidedFamilies.includes(family) && !result.includes(family)) result.push(family);
  }
  for (const family of availableFamilies) {
    if (result.length >= 3) break;
    if (!avoidedFamilies.includes(family) && !result.includes(family)) result.push(family);
  }
  return result.slice(0, 3);
}

function selectReference(family, targetRole, preferredFacets, library, usedIds) {
  const candidates = library.filter((item) => item.family === family && !usedIds.has(item.id));
  const ranked = candidates.map((item, index) => ({
    item,
    index,
    score:(item.roles?.includes(targetRole) ? 3 : 0)
      + (item.facets || []).filter((facet) => preferredFacets.includes(normalize(facet))).length * 2
  })).sort((a, b) => b.score - a.score || a.index - b.index);
  return ranked[0]?.item || null;
}

function createDirection(id, title, subtitle, familyPattern, preferredFacets, library) {
  const usedIds = new Set();
  const roles = ["Salida","Corazón","Fondo"];
  const references = familyPattern.map((family, index) => {
    const item = selectReference(family, roles[index], preferredFacets, library, usedIds);
    if (!item) return null;
    usedIds.add(item.id);
    return {
      id:item.id,
      name:item.name,
      family:item.family,
      roles:[...(item.roles || [])],
      facets:[...(item.facets || [])],
      profile:item.profile,
      rationale:`Ejemplo de la familia ${family.toLowerCase()} para cambiar la arquitectura conceptual sin reproducir una fórmula comercial.`
    };
  }).filter(Boolean);
  return {
    id,
    title,
    subtitle,
    familyPattern:references.map((item) => item.family),
    references,
    briefForAssistant:`Explorar un concepto con familias ${references.map((item) => item.family).join(", ")}.`
  };
}

export function analyzeInspirationDifferentiation({
  referenceLabel = "",
  liked = "",
  avoid = "",
  creations = [],
  library = PERFUME_ITEMS
} = {}) {
  const safeLabel = String(referenceLabel).trim().slice(0, 96);
  const likedText = String(liked).trim().slice(0, 1200);
  const avoidText = String(avoid).trim().slice(0, 1200);
  const positive = extractTraits(likedText);
  const negativeFromLiked = positive.avoided;
  const negativeFromAvoid = extractTraits(avoidText, true).avoided;
  const avoided = [...negativeFromLiked, ...negativeFromAvoid];
  const preferred = positive.positive.filter((trait) =>
    !avoided.some((item) => item.id === trait.id)
  );
  const preferredFamilies = [...new Set(preferred.flatMap((trait) => trait.families))];
  const avoidedFamilies = [...new Set(avoided.flatMap((trait) => trait.families))];
  const preferredFacets = preferred.map((trait) => normalize(trait.label));
  if (!likedText || !preferred.length) {
    return {
      status:"needs-traits",
      referenceLabel:safeLabel,
      likedTraits:[],
      avoidedTraits:avoided.map((trait) => trait.label),
      preferredFamilies:[],
      avoidedFamilies,
      directions:[],
      followUpQuestion:"¿Qué rasgos concretos te gustan: cítricos, maderas, flores, dulzor, frescura, notas verdes u otros?"
    };
  }

  const availableFamilies = [...new Set(library.map((item) => item.family))];
  const usage = familyUsage(creations, library);
  const { primary, secondary, complements } = chooseFamilies(preferredFamilies, avoidedFamilies, usage, library);
  if (!primary || complements.length < 3) {
    return {
      status:"insufficient-options",
      referenceLabel:safeLabel,
      likedTraits:preferred.map((trait) => trait.label),
      avoidedTraits:avoided.map((trait) => trait.label),
      preferredFamilies,
      avoidedFamilies,
      directions:[],
      followUpQuestion:"Hay pocos caminos disponibles con esos límites. ¿Qué rasgo podríamos flexibilizar?"
    };
  }

  const patterns = [
    makePattern([primary, secondary || complements[0], complements[1]], availableFamilies, avoidedFamilies),
    makePattern([complements[0], primary, complements[2]], availableFamilies, avoidedFamilies),
    makePattern([complements[2], complements[3], secondary || primary], availableFamilies, avoidedFamilies)
  ];
  const uniquePatterns = [];
  const signatures = new Set();
  for (const pattern of patterns) {
    const signature = pattern.join("|");
    if (pattern.length >= 2 && !signatures.has(signature)) {
      signatures.add(signature);
      uniquePatterns.push(pattern);
    }
  }
  const labels = [
    ["direction-a","Conservar el gesto, cambiar la arquitectura","Mantiene un rasgo principal y desplaza las familias de apoyo."],
    ["direction-b","Mover el centro olfativo","Cambia el peso del recorrido conceptual sin abandonar la característica que te gustó."],
    ["direction-c","Explorar una firma alternativa","Se aleja de la combinación más obvia y abre un camino distinto."]
  ];
  const directions = uniquePatterns.map((pattern, index) =>
    createDirection(labels[index][0],labels[index][1],labels[index][2],pattern,preferredFacets,library)
  );

  return {
    status:directions.length === 3 ? "ready" : "limited",
    referenceLabel:safeLabel,
    likedTraits:preferred.map((trait) => trait.label),
    avoidedTraits:avoided.map((trait) => trait.label),
    preferredFamilies,
    avoidedFamilies,
    directions,
    summary:"Se interpretan solo los rasgos que describiste. El nombre de referencia es una etiqueta; no se consulta ni reconstruye su fórmula.",
    notice:"Las familias y materias mostradas son rutas editoriales alternativas. No prueban originalidad mundial, no replican fórmulas comerciales y no predicen química, seguridad, duración o rendimiento.",
    briefForAssistant:[likedText,avoidText ? `Evitar: ${avoidText}` : "",directions[0]?.briefForAssistant || ""].filter(Boolean).join(". ")
  };
}
