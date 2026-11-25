import { PERFUME_ITEMS } from "../../perfume-library/data.js";
import { getPerfumeLibraryItem } from "../../perfume-library/library.js";

const ROLE_ORDER = ["Salida", "Corazón", "Fondo"];

const FEATURE_GROUPS = Object.freeze({
  sweetness: {
    label: "Dulzor / cremosidad",
    terms: ["dulce", "cremosa", "cremoso", "gourmand", "vainilla", "tonka", "balsámica", "almendra", "coco", "jugosa"]
  },
  freshness: {
    label: "Frescura / luminosidad",
    terms: ["cítrica", "cítrico", "fresca", "fresco", "verde", "acuática", "limpia", "mentolada", "ozónica", "aireada", "herbal"]
  },
  woods: {
    label: "Carácter amaderado / terroso",
    terms: ["amaderada", "amaderado", "madera", "terrosa", "terroso", "seca", "seco", "musgosa", "resinosa"]
  },
  floral: {
    label: "Carácter floral",
    terms: ["floral", "rosada", "floral blanco", "empolvada", "jazmín", "violeta", "rosa"]
  },
  spice: {
    label: "Carácter especiado",
    terms: ["especiada", "especiado", "pimienta", "cardamomo", "canela", "azafrán", "jengibre", "punzante"]
  },
  clean: {
    label: "Limpieza / cercanía",
    terms: ["limpia", "textil", "aireada", "piel", "almizcle blanco", "suave", "íntima"]
  }
});

const DIRECTIONS = Object.freeze({
  sweeter: {
    label: "Más dulce / cremosa",
    groups: ["sweetness"],
    families: ["Gourmand", "Ámbar y resinosa", "Frutal"],
    benefit: "Puede reforzar la impresión dulce, redonda o cremosa del concepto.",
    tradeoff: "También puede reducir el contraste fresco o seco si esa faceta ya domina."
  },
  lessSweet: {
    label: "Menos dulce",
    groups: ["freshness", "woods", "spice"],
    families: ["Cítrica", "Verde", "Aromática", "Amaderada", "Especiada", "Acuática"],
    avoid: ["sweetness"],
    benefit: "Puede introducir contraste fresco, verde, seco o especiado frente a las facetas dulces.",
    tradeoff: "La idea puede sentirse menos golosa o menos cálida."
  },
  fresher: {
    label: "Más fresca / luminosa",
    groups: ["freshness"],
    families: ["Cítrica", "Verde", "Aromática", "Acuática"],
    benefit: "Puede elevar la presencia creativa de matices frescos, verdes o aireados.",
    tradeoff: "Un exceso de referencias luminosas podría quitar espacio a las facetas cálidas o profundas."
  },
  woodier: {
    label: "Más amaderada / seca",
    groups: ["woods"],
    families: ["Amaderada", "Ámbar y resinosa"],
    benefit: "Puede aportar una dirección más seca, terrosa o amaderada.",
    tradeoff: "Podría hacer que el concepto se perciba menos ligero si ya hay poco contraste fresco."
  },
  moreFloral: {
    label: "Más floral",
    groups: ["floral"],
    families: ["Floral"],
    benefit: "Puede dar más protagonismo al corazón floral y suavizar las transiciones entre familias.",
    tradeoff: "Varias referencias florales con facetas similares pueden reducir el contraste interno."
  },
  spicier: {
    label: "Más especiada",
    groups: ["spice"],
    families: ["Especiada", "Aromática"],
    benefit: "Puede introducir una faceta especiada, aromática o cálida más reconocible.",
    tradeoff: "El carácter puede sentirse más seco o cálido y desplazar parte de la frescura."
  },
  cleaner: {
    label: "Más limpia / íntima",
    groups: ["clean", "freshness"],
    families: ["Almizclada", "Acuática", "Aromática"],
    benefit: "Puede acercar la idea a un perfil limpio, suave, textil o cercano a la piel.",
    tradeoff: "Puede disminuir el contraste con perfiles densos, dulces o resinosos."
  },
  balanced: {
    label: "Más equilibrada / contrastada",
    groups: [],
    families: [],
    benefit: "Puede sumar una familia o una parte de la pirámide que hoy tenga poca presencia.",
    tradeoff: "Añadir referencias solo por diversidad no garantiza una mejor idea; conviene conservar una intención clara."
  }
});

const normalize = (value) => String(value ?? "")
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLowerCase();

function itemText(item) {
  return normalize([
    item.name, item.family, item.kind, item.profile,
    ...(item.facets || []), ...(item.roles || [])
  ].join(" "));
}

function matchesTerms(item, terms = []) {
  const haystack = itemText(item);
  return terms.some((term) => haystack.includes(normalize(term)));
}

function clampPoints(value) {
  const parsed = Number.isFinite(Number(value)) ? Math.round(Number(value)) : 0;
  return Math.max(0, Math.min(100, parsed));
}

function resolveEntries(state) {
  return (state?.items || [])
    .map((entry) => {
      const item = getPerfumeLibraryItem(entry.id);
      return item ? { item, points: clampPoints(entry.points) } : null;
    })
    .filter((entry) => entry && entry.points > 0);
}

function sortedShares(map, total) {
  return [...map.entries()]
    .map(([label, points]) => ({
      label,
      points,
      share: total > 0 ? Math.round((points / total) * 100) : 0
    }))
    .sort((a, b) => b.points - a.points || a.label.localeCompare(b.label, "es"));
}

export function analyzeComposition(state) {
  const entries = resolveEntries(state);
  const totalPoints = entries.reduce((sum, entry) => sum + entry.points, 0);
  const familyPoints = new Map();
  const rolePoints = new Map(ROLE_ORDER.map((role) => [role, 0]));
  const facetReferences = new Map();

  for (const { item, points } of entries) {
    familyPoints.set(item.family, (familyPoints.get(item.family) || 0) + points);
    for (const role of item.roles || []) {
      if (rolePoints.has(role)) rolePoints.set(role, rolePoints.get(role) + points);
    }
    for (const facet of item.facets || []) {
      const key = normalize(facet);
      const record = facetReferences.get(key) || { label: facet, count: 0, points: 0 };
      record.count += 1;
      record.points += points;
      facetReferences.set(key, record);
    }
  }

  const families = sortedShares(familyPoints, totalPoints);
  const roleCoverage = ROLE_ORDER.map((role) => ({
    role,
    points: rolePoints.get(role) || 0,
    share: totalPoints > 0 ? Math.round(((rolePoints.get(role) || 0) / totalPoints) * 100) : 0
  }));
  const profileSignals = Object.entries(FEATURE_GROUPS).map(([key, group]) => {
    const points = entries.reduce((sum, entry) =>
      sum + (matchesTerms(entry.item, group.terms) ? entry.points : 0), 0);
    return { key, label: group.label, points, share: totalPoints > 0 ? Math.round((points / totalPoints) * 100) : 0 };
  }).sort((a, b) => b.share - a.share);

  const repeatedFacets = [...facetReferences.values()]
    .filter((facet) => facet.count >= 2)
    .sort((a, b) => b.points - a.points || b.count - a.count)
    .slice(0, 4);

  const missingRoles = roleCoverage.filter((role) => role.points === 0).map((role) => role.role);
  const dominantFamily = families[0] && families[0].share >= 60 ? families[0] : null;
  const observations = [];

  if (!entries.length) {
    observations.push("Añadí al menos una referencia para obtener una lectura de la composición.");
  } else {
    if (entries.length === 1) {
      observations.push("Boceto inicial: una sola referencia define casi todo el carácter actual. Probá un contrapunto antes de juzgar el conjunto.");
    } else if (families.length === 1) {
      observations.push("La composición se mantiene dentro de una sola familia. Es una dirección clara, aunque todavía ofrece poco contraste entre familias.");
    } else if (dominantFamily) {
      observations.push(`${dominantFamily.label} concentra ${dominantFamily.share}% de los puntos creativos. Puede ser la identidad principal; sumá otra familia solo si buscás más contraste.`);
    } else {
      observations.push(`La composición combina ${families.length} familias sin que una supere el 60% de los puntos creativos.`);
    }

    if (missingRoles.length) {
      observations.push(`La pirámide no tiene referencias asociadas a: ${missingRoles.join(", ").toLowerCase()}. La ubicación es orientativa, pero puede ayudarte a revisar la estructura.`);
    } else {
      observations.push("Hay referencias asociadas a salida, corazón y fondo. Una misma nota puede relacionarse con más de una zona.");
    }

    if (repeatedFacets.length) {
      const names = repeatedFacets.slice(0, 3).map((facet) => facet.label);
      observations.push(`Se repiten facetas como ${names.join(", ")}. Puede dar continuidad al perfil; revisá si querés conservar esa unidad o añadir contraste.`);
    }
  }

  return {
    isEmpty: entries.length === 0,
    referenceCount: entries.length,
    totalPoints,
    familyCount: families.length,
    families,
    dominantFamily,
    roleCoverage,
    missingRoles,
    profileSignals,
    repeatedFacets,
    observations
  };
}

function scoreCandidate(item, rule, currentFamilies, missingRoles, direction) {
  let score = 0;
  const matchingGroups = rule.groups.filter((key) => matchesTerms(item, FEATURE_GROUPS[key].terms));
  const matchingFamily = rule.families.includes(item.family);
  const avoided = (rule.avoid || []).some((key) => matchesTerms(item, FEATURE_GROUPS[key].terms));

  score += matchingGroups.length * 4;
  if (matchingFamily) score += 3;
  if (!currentFamilies.has(item.family)) score += direction === "balanced" ? 7 : 1.5;
  if ((item.roles || []).some((role) => missingRoles.includes(role))) score += direction === "balanced" ? 5 : 1.5;
  if (avoided) score -= 5;

  return { score, matchingGroups, matchingFamily, avoided };
}

export function suggestAdjustments(state, direction = "balanced", limit = 3) {
  const rule = DIRECTIONS[direction] || DIRECTIONS.balanced;
  const analysis = analyzeComposition(state);
  if (analysis.isEmpty) return [];

  const currentIds = new Set((state?.items || []).map((entry) => entry.id));
  const currentFamilies = new Set(analysis.families.map((family) => family.label));
  const candidates = PERFUME_ITEMS
    .filter((item) => !currentIds.has(item.id))
    .map((item) => ({
      item,
      ...scoreCandidate(item, rule, currentFamilies, analysis.missingRoles, direction)
    }))
    .filter((candidate) => candidate.score > 0)
    .sort((a, b) => b.score - a.score || a.item.name.localeCompare(b.item.name, "es"))
    .slice(0, Math.max(1, Math.min(5, limit)));

  return candidates.map(({ item, matchingGroups, matchingFamily, avoided }) => {
    let reason;
    if (direction === "balanced") {
      const missing = (item.roles || []).filter((role) => analysis.missingRoles.includes(role));
      if (missing.length) reason = `Puede cubrir una zona actualmente ausente: ${missing.join(", ").toLowerCase()}.`;
      else reason = currentFamilies.has(item.family)
        ? `Aporta otra faceta dentro de ${item.family.toLowerCase()}.`
        : `Introduce la familia ${item.family.toLowerCase()}, que todavía no aparece en la composición.`;
    } else {
      const groupLabels = matchingGroups.map((key) => FEATURE_GROUPS[key].label.toLowerCase());
      reason = groupLabels.length
        ? `Su perfil se relaciona con ${groupLabels.join(" y ")}.`
        : `Pertenece a la familia ${item.family.toLowerCase()}, asociada con la dirección elegida.`;
    }

    return {
      id: item.id,
      name: item.name,
      family: item.family,
      kind: item.kind,
      profile: item.profile,
      reason,
      benefit: rule.benefit,
      tradeoff: avoided
        ? "Se eligió como contrapunto a facetas dulces ya presentes; el cambio puede reducir la redondez gourmand."
        : rule.tradeoff,
      relevance: matchingFamily ? "Afinidad de familia" : "Afinidad de facetas"
    };
  });
}

export function getAnalysisDirections() {
  return Object.entries(DIRECTIONS).map(([id, rule]) => ({ id, label: rule.label }));
}

export function getFeatureGroups() {
  return Object.entries(FEATURE_GROUPS).map(([id, group]) => ({ id, label: group.label }));
}
