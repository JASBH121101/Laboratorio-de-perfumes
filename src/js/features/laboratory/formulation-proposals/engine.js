import { PERFUME_ITEMS } from "../../perfume-library/data.js";
import { buildCreativeRecommendations } from "../creative-assistant/engine.js";

const normalize = (value = "") => String(value)
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, " ")
  .trim();

const FAMILY_BY_PREFERENCE = Object.freeze({
  "cítrica":"Cítrica",
  "floral":"Floral",
  "amaderada":"Amaderada",
  "dulce o cremosa":"Gourmand",
  "aromática o herbal":"Aromática",
  "verde":"Verde",
  "frutal":"Frutal",
  "especiada":"Especiada",
  "ámbar y resinosa":"Ámbar y resinosa",
  "almizclada y limpia":"Almizclada",
  "acuática":"Acuática",
  "cuero":"Cuero"
});

function getFamilyPreferences(labels = []) {
  return labels.map((label) => FAMILY_BY_PREFERENCE[label]).filter(Boolean);
}

function pairingIds(item, library) {
  const pairings = (item?.pairings || []).map(normalize);
  return library.filter((candidate) => pairings.some((name) =>
    normalize(candidate.name) === name ||
    normalize(candidate.name).includes(name) ||
    name.includes(normalize(candidate.name))
  )).map((candidate) => candidate.id);
}

function rankLibrary({ library, assistant, avoidedFamilies }) {
  const preferredFamilies = getFamilyPreferences(assistant.preferences);
  const suggestedOrder = new Map(assistant.suggestions.map((item, index) => [item.id, index]));
  const preferredIds = new Set(assistant.suggestions.map((item) => item.id));
  const pairingSet = new Set(assistant.suggestions.flatMap((suggestion) => {
    const source = library.find((item) => item.id === suggestion.id);
    return pairingIds(source, library);
  }));

  return library
    .filter((item) => !avoidedFamilies.includes(item.family))
    .map((item, index) => {
      const isPreferred = preferredFamilies.includes(item.family);
      const suggestionIndex = suggestedOrder.get(item.id);
      const isPairing = pairingSet.has(item.id);
      const score = Number.isInteger(suggestionIndex)
        ? 100 - suggestionIndex * 5
        : (isPreferred ? 48 : 0) + (isPairing ? 28 : 0);
      return { item, index, score, isPreferred, isPairing, wasSuggested:preferredIds.has(item.id) };
    })
    .sort((a, b) => b.score - a.score || a.index - b.index);
}

function selectSet(ranked, { limit = 3, excluded = [], diverse = true, preferPairing = false } = {}) {
  const selected = [];
  const usedIds = new Set(excluded);
  const familyCounts = new Map();
  const ordered = [...ranked].sort((a, b) => {
    if (preferPairing && a.isPairing !== b.isPairing) return a.isPairing ? -1 : 1;
    return b.score - a.score || a.index - b.index;
  });

  for (const entry of ordered) {
    if (selected.length >= limit) break;
    if (usedIds.has(entry.item.id)) continue;
    const familyCount = familyCounts.get(entry.item.family) || 0;
    if (diverse && familyCount >= 1) continue;
    selected.push(entry);
    usedIds.add(entry.item.id);
    familyCounts.set(entry.item.family, familyCount + 1);
  }

  if (selected.length < limit) {
    for (const entry of ordered) {
      if (selected.length >= limit) break;
      if (usedIds.has(entry.item.id)) continue;
      selected.push(entry);
      usedIds.add(entry.item.id);
    }
  }
  return selected;
}

function allocateCreativePoints(count, weights) {
  const source = weights.slice(0, count);
  if (!count) return [];
  if (count === 1) return [100];
  const sum = source.reduce((total, value) => total + value, 0);
  const raw = source.map((value) => (value / sum) * 100);
  const points = raw.map(Math.floor);
  let remainder = 100 - points.reduce((total, value) => total + value, 0);
  const order = raw.map((value, index) => ({ index, fraction:value - points[index] }))
    .sort((a, b) => b.fraction - a.fraction || a.index - b.index);
  for (let index = 0; index < remainder; index += 1) points[order[index].index] += 1;
  return points;
}

function createProposal(id, title, subtitle, entries, weights, familyFocus, description) {
  const points = allocateCreativePoints(entries.length, weights);
  return {
    id,
    title,
    subtitle,
    familyFocus,
    description,
    items:entries.map(({ item }, index) => ({
      id:item.id,
      name:item.name,
      family:item.family,
      kind:item.kind,
      roles:[...(item.roles || [])],
      facets:[...(item.facets || [])],
      profile:item.profile,
      points:points[index],
      rationale:familyFocus.includes(item.family)
        ? `Mantiene afinidad con la dirección ${item.family.toLowerCase()} detectada en el brief.`
        : `Introduce un contraste de la familia ${item.family.toLowerCase()} para ampliar la dirección creativa.`
    })),
    totalCreativePoints:points.reduce((total, value) => total + value, 0)
  };
}

export function generateFormulationProposals({
  description = "",
  mode = "personal",
  library = PERFUME_ITEMS
} = {}) {
  const assistant = buildCreativeRecommendations({ description, mode, library });
  if (assistant.status !== "ready" || !assistant.suggestions.length) {
    return {
      status:"needs-direction",
      summary:assistant.summary,
      followUpQuestion:assistant.followUpQuestion,
      preferences:assistant.preferences || [],
      avoidedPreferences:assistant.avoidedPreferences || [],
      proposals:[]
    };
  }

  const preferredFamilies = getFamilyPreferences(assistant.preferences);
  const avoidedFamilies = getFamilyPreferences(assistant.avoidedPreferences);
  const ranked = rankLibrary({ library, assistant, avoidedFamilies });
  if (ranked.length < 2) {
    return {
      status:"insufficient-library",
      summary:"No hay suficientes referencias disponibles después de aplicar los rasgos que querés evitar.",
      followUpQuestion:"¿Querés flexibilizar algún rasgo para explorar más alternativas?",
      preferences:assistant.preferences,
      avoidedPreferences:assistant.avoidedPreferences,
      proposals:[]
    };
  }

  const proposalA = selectSet(ranked, { limit:3, diverse:true });
  const anchor = ranked.find((entry) => assistant.suggestions.some((item) => item.id === entry.item.id)) || ranked[0];
  const proposalB = [anchor, ...selectSet(ranked.filter((entry) => entry.item.id !== anchor.item.id), {
    limit:2, diverse:true, preferPairing:true, excluded:[anchor.item.id]
  })];

  const excludedForC = [...new Set([...proposalA, ...proposalB].map((entry) => entry.item.id))];
  let proposalC = selectSet(ranked, { limit:3, diverse:true, excluded:excludedForC });
  if (proposalC.length < 2) {
    proposalC = selectSet(ranked, { limit:3, diverse:true, excluded:[anchor.item.id] });
  }

  const proposals = [
    createProposal("proposal-a","A · Afinidad principal","Prioriza las familias y facetas que el brief expresó con mayor claridad.",proposalA,[50,30,20],preferredFamilies,"Una ruta cercana a las preferencias declaradas."),
    createProposal("proposal-b","B · Contraste equilibrado","Mantiene una referencia central y abre espacio a familias complementarias.",proposalB,[40,35,25],preferredFamilies,"Una ruta que combina reconocimiento y contraste."),
    createProposal("proposal-c","C · Exploración alternativa","Reduce la repetición de referencias iniciales y explora otros caminos de la biblioteca.",proposalC,[40,30,30],preferredFamilies,"Una ruta de exploración que se aleja del núcleo inicial.")
  ].filter((proposal) => proposal.items.length >= 2);

  return {
    status:proposals.length ? "ready" : "insufficient-library",
    summary:"Se generaron alternativas desde referencias reales de la biblioteca. Los puntos son ponderaciones creativas comparativas, no porcentajes de ingredientes.",
    followUpQuestion:assistant.followUpQuestion,
    preferences:assistant.preferences,
    avoidedPreferences:assistant.avoidedPreferences,
    proposals
  };
}
