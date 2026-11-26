import { PERFUME_ITEMS } from "../../perfume-library/data.js";

const normalize = (value = "") => String(value)
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, " ")
  .trim();

const containsTerm = (text, term) => (` ${normalize(text)} `).includes(` ${normalize(term)} `);

const GROUPS = Object.freeze([
  { id:"citrica", label:"cítrica", keywords:["citrico","citrica","citricos","citricas","bergamota","limon","lima","toronja","pomelo","mandarina","yuzu","naranja"], families:["citrica"], facets:["citrica","acida","amarga","luminosa","jugosa"] },
  { id:"floral", label:"floral", keywords:["floral","flores","florales","rosa","jazmin","azahar","peonia","iris","violeta","nardo"], families:["floral"], facets:["floral","floral blanco","rosada","empolvada","luminosa"] },
  { id:"amaderada", label:"amaderada", keywords:["madera","maderas","amaderado","amaderada","cedro","santalo","sandalo","vetiver","pachuli","pachouli"], families:["amaderada"], facets:["amaderada","seca","terrosa","cremosa"] },
  { id:"dulce", label:"dulce o cremosa", keywords:["dulce","dulces","dulzor","dulzura","vainilla","gourmand","caramelo","caramelizado","caramelizada","azucar","azucarado","azucarada","cremoso","cremosa","postre"], families:["gourmand"], facets:["dulce","cremosa","avainillada","aterciopelada"] },
  { id:"aromatica", label:"aromática o herbal", keywords:["aromatica","aromatico","herbal","hierbas","lavanda","romero","salvia","menta","albahaca"], families:["aromatica"], facets:["aromatica","herbal","verde","limpia"] },
  { id:"verde", label:"verde", keywords:["verde","verdes","vegetal","hojas","herbaceo","herbacea"], families:["verde"], facets:["verde","herbal","fresca"] },
  { id:"frutal", label:"frutal", keywords:["frutal","frutales","fruta","frutas","pera","manzana","durazno","melocoton","frambuesa","higo","piña","pina","grosella"], families:["frutal"], facets:["frutal","jugosa","tropical","suave"] },
  { id:"especiada", label:"especiada", keywords:["especiado","especiada","especias","pimienta","cardamomo","canela","jengibre","azafran"], families:["especiada"], facets:["especiada","calida","picante"] },
  { id:"ambarada", label:"ámbar y resinosa", keywords:["ambar","ambarada","resina","resinoso","balsamico","balsamica","incienso"], families:["ambar y resinosa"], facets:["ambarada","resinosa","calida"] },
  { id:"almizclada", label:"almizclada y limpia", keywords:["almizcle","almizclado","almizclada","musk","limpio","limpia","piel"], families:["almizclada"], facets:["limpia","suave","algodon","piel"] },
  { id:"acuática", label:"acuática", keywords:["acuatico","acuatica","marino","marina","ozonico","ozonica","agua"], families:["acuatica"], facets:["acuática","fresca","transparente"] },
  { id:"cuero", label:"cuero", keywords:["cuero","cuero","ante","leather"], families:["cuero"], facets:["cuero","seca","ahumada"] }
]);

const NEGATION = /(?:\bno\b|\bsin\b|\bevit(?:ar|ando)\b|\bmenos\b)(?:\s+\w+){0,2}\s+/;

function mentionedGroups(description) {
  const phrase = normalize(description);
  const preferred = [];
  const avoided = [];
  for (const group of GROUPS) {
    const matched = group.keywords.find((keyword) => containsTerm(phrase, keyword));
    if (!matched) continue;
    const normalizedKeyword = normalize(matched);
    const escaped = normalizedKeyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const negated = new RegExp(`(?:\\bno\\b|\\bsin\\b|\\bevit(?:ar|ando)\\b|\\bmenos\\b)(?:\\s+\\w+){0,2}\\s+${escaped}\\b`).test(phrase);
    (negated ? avoided : preferred).push(group);
  }
  return { preferred, avoided };
}

function itemMatchesGroup(item, group) {
  const family = normalize(item.family);
  const facets = (item.facets || []).map(normalize);
  const name = normalize(item.name);
  return group.families.includes(family)
    || group.facets.some((facet) => facets.includes(normalize(facet)))
    || group.keywords.some((keyword) => containsTerm(name, keyword));
}

function scoreItem(item, preferred, avoided) {
  let score = 0;
  let matchingGroups = 0;
  for (const group of preferred) {
    if (itemMatchesGroup(item, group)) {
      score += 7;
      matchingGroups += 1;
    }
    const profile = normalize(`${item.name} ${item.profile} ${(item.facets || []).join(" ")}`);
    if (group.keywords.some((keyword) => containsTerm(profile, keyword))) score += 1;
  }
  for (const group of avoided) {
    if (itemMatchesGroup(item, group)) score -= 9;
  }
  return { score, matchingGroups };
}

function findPairingReferences(selected, library) {
  const pairingNames = selected.flatMap((item) => item.pairings || []).map(normalize);
  return library.filter((item) => pairingNames.some((pairing) =>
    normalize(item.name) === pairing || normalize(item.name).includes(pairing) || pairing.includes(normalize(item.name))
  ));
}

function followUpQuestion(description, preferred, mode) {
  const phrase = normalize(description);
  if (!preferred.length) {
    return mode === "client"
      ? "¿Qué rasgo le importa más a esa persona: frescura, dulzor, flores, maderas o algo diferente?"
      : "¿Qué rasgo querés priorizar: frescura, dulzor, floralidad, maderas o una sensación distinta?";
  }
  if (!/(suave|discret|intens|presencia|marcad|potent|liger|sutil)/.test(phrase)) {
    return "¿Preferís una presencia discreta y cercana a la piel o una impresión más marcada?";
  }
  if (!/(diario|dia|noche|oficina|trabajo|ocas|evento|calor|frio|verano|invierno)/.test(phrase)) {
    return mode === "client"
      ? "¿La persona lo usaría a diario o busca algo para ocasiones especiales?"
      : "¿Lo pensás para uso diario o para ocasiones especiales?";
  }
  return "";
}

export function buildCreativeRecommendations({
  description = "",
  mode = "personal",
  library = PERFUME_ITEMS
} = {}) {
  const text = String(description).trim();
  const normalizedMode = ["personal", "client", "inspiration"].includes(mode) ? mode : "personal";
  if (text.length < 8) {
    return {
      status:"needs-brief",
      mode:normalizedMode,
      title:"Necesito un poco más de contexto",
      summary:"Contame qué sensación querés crear, qué te gusta o qué busca la persona.",
      preferences:[],
      suggestions:[],
      followUpQuestion:"¿Qué tipo de aroma o sensación querés explorar?"
    };
  }

  const { preferred, avoided } = mentionedGroups(text);
  const ranked = library
    .map((item, index) => ({ item, index, ...scoreItem(item, preferred, avoided) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || b.matchingGroups - a.matchingGroups || a.index - b.index);

  const selected = [];
  const selectedIds = new Set();
  const familyCounts = new Map();
  const addCandidate = (entry, familyLimit = 2) => {
    if (!entry || selectedIds.has(entry.item.id)) return;
    const family = entry.item.family;
    if ((familyCounts.get(family) || 0) >= familyLimit) return;
    selected.push(entry.item);
    selectedIds.add(entry.item.id);
    familyCounts.set(family, (familyCounts.get(family) || 0) + 1);
  };

  for (const group of preferred) {
    ranked.filter((entry) => itemMatchesGroup(entry.item, group)).slice(0, 2)
      .forEach((entry) => addCandidate(entry, 2));
  }

  if (selected.length < 5 && selected.length) {
    const pairings = findPairingReferences(selected, library);
    for (const item of pairings) {
      if (selected.length >= 5) break;
      addCandidate({ item }, 2);
    }
  }

  for (const entry of ranked) {
    if (selected.length >= 5) break;
    addCandidate(entry, 2);
  }

  const suggestions = selected.map((item) => {
    const matched = preferred.filter((group) => itemMatchesGroup(item, group)).map((group) => group.label);
    const facets = (item.facets || []).slice(0, 3);
    const rationale = matched.length
      ? `Referencia de familia ${item.family.toLowerCase()} que conecta con el perfil ${matched.join(" y ")}.`
      : `Referencia complementaria de familia ${item.family.toLowerCase()} para explorar contraste y transición.`;
    return {
      id:item.id,
      name:item.name,
      family:item.family,
      roles:[...(item.roles || [])],
      facets,
      profile:item.profile,
      rationale
    };
  });

  const direction = preferred.length
    ? preferred.map((group) => group.label).join(" · ")
    : "perfil todavía abierto";
  const title = normalizedMode === "client"
    ? "Lectura del perfil de cliente"
    : normalizedMode === "inspiration"
      ? "Lectura de inspiración olfativa"
      : "Dirección creativa personal";
  const summary = preferred.length
    ? `El texto apunta hacia ${direction}. Estas referencias son puntos de partida editoriales de la biblioteca local, no una fórmula ni una reconstrucción de otro perfume.`
    : "Todavía no aparece una familia o faceta suficientemente concreta. Podemos afinar el brief antes de recomendar materias.";
  const question = followUpQuestion(text, preferred, normalizedMode);

  return {
    status:preferred.length && suggestions.length ? "ready" : "needs-direction",
    mode:normalizedMode,
    title,
    summary,
    preferences:preferred.map((group) => group.label),
    avoidedPreferences:avoided.map((group) => group.label),
    suggestions,
    followUpQuestion:question,
    notice:"Las recomendaciones describen posibilidades creativas. No calculan una fórmula química, concentraciones, seguridad de uso, duración ni similitud comercial."
  };
}
