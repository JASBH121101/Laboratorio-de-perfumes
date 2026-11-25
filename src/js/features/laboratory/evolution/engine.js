import { getPerfumeLibraryItem } from "../../perfume-library/library.js";

export const EVOLUTION_STAGES = Object.freeze([
  { id: "opening", label: "Apertura", time: "0–15 min", roles: ["Salida"], description: "Una lectura conceptual de las referencias asociadas a la salida." },
  { id: "heart", label: "Corazón", time: "15 min–2 h", roles: ["Corazón"], description: "Una lectura conceptual de las referencias asociadas al corazón." },
  { id: "drydown", label: "Secado", time: "2 h en adelante", roles: ["Fondo"], description: "Una lectura conceptual de las referencias asociadas al fondo." }
]);

export function getEvolutionStage(stageId = "opening") {
  return EVOLUTION_STAGES.find((stage) => stage.id === stageId) ?? EVOLUTION_STAGES[0];
}

export function analyzeEvolutionStage(mixState, stageId = "opening") {
  const stage = getEvolutionStage(stageId);
  const allItems = (mixState?.items ?? []).map((entry) => {
    const reference = getPerfumeLibraryItem(entry.id);
    return reference ? { ...entry, reference, inStage: reference.roles?.some((role) => stage.roles.includes(role)) ?? false } : null;
  }).filter(Boolean);
  const matching = allItems.filter((item) => item.inStage);
  const points = matching.reduce((sum, item) => sum + item.points, 0);
  const rawShares = matching.length
    ? (points > 0 ? matching.map((item) => item.points / points * 100) : matching.map(() => 100 / matching.length))
    : [];
  const shares = rawShares.map(Math.floor);
  const remainder = 100 - shares.reduce((sum, value) => sum + value, 0);
  const order = rawShares.map((value, index) => ({ index, fraction: value - shares[index] }))
    .sort((a, b) => b.fraction - a.fraction || a.index - b.index);
  for (let index = 0; index < remainder; index += 1) shares[order[index].index] += 1;
  const normalized = matching.map((item, index) => ({ ...item, share: shares[index] }));
  return {
    stage,
    totalCompositionPoints: mixState?.items?.reduce((sum, item) => sum + item.points, 0) ?? 0,
    references: normalized.map(({ id, reference, points, share }) => ({
      id, name: reference.name, family: reference.family, profile: reference.profile, points, share
    })),
    referenceCount: matching.length,
    isEmpty: (mixState?.items?.length ?? 0) === 0,
    hasStageReferences: matching.length > 0,
    excludedReferences: allItems.filter((item) => !item.inStage).map((item) => item.reference.name),
    description: stage.description
  };
}
