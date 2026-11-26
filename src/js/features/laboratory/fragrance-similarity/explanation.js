const DIMENSION_LABELS = Object.freeze({
  notes: "Notas declaradas",
  families: "Familias olfativas",
  subfamilies: "Subfamilias",
  accords: "Acordes",
  character: "Carácter olfativo",
  "pyramid.top": "Salida",
  "pyramid.heart": "Corazón",
  "pyramid.base": "Fondo"
});

const asLabels = (values = []) => values.map((item) => item.label ?? item.referenceLabel ?? item.candidateLabel ?? item.key);

function explanationRow(dimension, result) {
  if (!result || result.status !== "comparable") return null;
  const matched = (result.matched ?? []).map((item) => Object.freeze({
    key: item.key,
    referenceLabel: item.referenceLabel ?? item.label ?? item.key,
    candidateLabel: item.candidateLabel ?? item.label ?? item.key
  }));
  const referenceOnly = asLabels(result.referenceOnly ?? []);
  const candidateOnly = asLabels(result.candidateOnly ?? []);

  return Object.freeze({
    dimension,
    label: DIMENSION_LABELS[dimension] ?? dimension,
    overlapIndex: result.overlapIndex,
    matched: Object.freeze(matched),
    referenceOnly: Object.freeze(referenceOnly),
    candidateOnly: Object.freeze(candidateOnly)
  });
}

export function explainFragranceSimilarity(comparison, scoreResult) {
  if (!comparison || typeof comparison !== "object" || !comparison.components) {
    throw new TypeError("A fragrance comparison result is required for explanation.");
  }
  if (!scoreResult || typeof scoreResult !== "object" || !scoreResult.confidence) {
    throw new TypeError("A fragrance similarity score result is required for explanation.");
  }

  const rows = [];
  const standardDimensions = ["notes", "families", "subfamilies", "accords", "character"];
  for (const dimension of standardDimensions) {
    const result = dimension === "notes"
      ? comparison.components.notes?.all
      : comparison.components[dimension];
    const row = explanationRow(dimension, result);
    if (row) rows.push(row);
  }

  for (const stage of ["top", "heart", "base"]) {
    const row = explanationRow(`pyramid.${stage}`, comparison.components.pyramid?.stages?.[stage]);
    if (row) rows.push(row);
  }

  const similarities = rows
    .filter((row) => row.matched.length > 0)
    .map((row) => Object.freeze({
      dimension: row.dimension,
      label: row.label,
      overlapIndex: row.overlapIndex,
      matched: row.matched
    }));

  const differences = rows
    .filter((row) => row.referenceOnly.length > 0 || row.candidateOnly.length > 0)
    .map((row) => Object.freeze({
      dimension: row.dimension,
      label: row.label,
      referenceOnly: row.referenceOnly,
      candidateOnly: row.candidateOnly
    }));

  const skippedDimensions = (comparison.coverage?.skippedDimensions ?? []).map((dimension) => ({
    key: dimension,
    label: DIMENSION_LABELS[dimension] ?? DIMENSION_LABELS[`pyramid.${dimension.split(".").at(-1)}`] ?? dimension
  }));

  const limitations = [
    ...scoreResult.limitations ?? [],
    "Una nota listada solo en una ficha es una diferencia entre fuentes públicas; no confirma que esté ausente del olor real del otro perfume.",
    "La información pública puede ser incompleta, variable entre versiones o distinta según la fuente.",
    "La similitud describe coincidencias de descriptores y no certifica fórmula, autenticidad, rendimiento ni equivalencia sensorial."
  ];

  if (skippedDimensions.length) {
    limitations.unshift(
      `No se pudieron comparar estas dimensiones por falta de datos: ${skippedDimensions.map((item) => item.label).join(", ")}.`
    );
  }
  if (scoreResult.confidence.level === "low" || scoreResult.confidence.level === "very-low") {
    limitations.unshift("La confianza es limitada: interpretá el porcentaje con cautela y revisá la evidencia disponible.");
  }

  const summary = scoreResult.status === "ready"
    ? `${comparison.reference.name} y ${comparison.candidate.name}: ${scoreResult.score}% de similitud editorial estimada, con confianza ${scoreResult.confidence.label.toLowerCase()}.`
    : `No hay suficientes datos comparables para calcular una similitud global confiable entre ${comparison.reference.name} y ${comparison.candidate.name}.`;

  return Object.freeze({
    status: scoreResult.status,
    summary,
    reference: comparison.reference,
    candidate: comparison.candidate,
    score: scoreResult.score,
    scoreLabel: scoreResult.scoreLabel,
    confidence: scoreResult.confidence,
    similarities: Object.freeze(similarities),
    differences: Object.freeze(differences),
    skippedDimensions: Object.freeze(skippedDimensions.map((item) => Object.freeze(item))),
    limitations: Object.freeze([...new Set(limitations)]),
    interpretation: "Comparación editorial de datos olfativos públicos. No representa una probabilidad ni una equivalencia química o sensorial."
  });
}
