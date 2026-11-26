import { PERFUME_ITEMS } from "../../perfume-library/data.js";
import { SENSORY_CONTEXTS, SENSORY_RATINGS } from "../sensory-experiments/model.js";
import { normalizeArchiveItems } from "../../archive/model.js";

const LIBRARY = new Map(PERFUME_ITEMS.map((item) => [item.id, item]));

function aggregate(items, selector) {
  const totals = new Map();
  for (const item of items) {
    const reference = LIBRARY.get(item.id);
    const labels = selector(reference) ?? [];
    for (const label of (Array.isArray(labels) ? labels : [labels])) {
      if (!label) continue;
      totals.set(label, (totals.get(label) ?? 0) + item.points);
    }
  }
  return [...totals.entries()]
    .map(([label, points]) => ({ label, points }))
    .sort((a, b) => b.points - a.points || a.label.localeCompare(b.label, "es"));
}

function normalizeExperiments(experiments, creationId, variantId) {
  return (Array.isArray(experiments) ? experiments : [])
    .filter((item) => item.creationId === creationId && item.variantId === variantId
      && Number.isFinite(Date.parse(item.observedAt)))
    .map((item) => ({
      id: String(item.id ?? ""),
      title: String(item.title ?? ""),
      observedAt: new Date(item.observedAt).toISOString(),
      observer: String(item.observer ?? ""),
      context: SENSORY_CONTEXTS[item.context] ? item.context : "other",
      contextLabel: SENSORY_CONTEXTS[item.context] ?? SENSORY_CONTEXTS.other,
      elapsedMinutes: Number.isInteger(item.elapsedMinutes) ? item.elapsedMinutes : null,
      versionNumber: Number.isInteger(item.versionNumber) ? item.versionNumber : 1,
      impression: String(item.impression ?? ""),
      tags: Array.isArray(item.tags) ? item.tags.map(String) : [],
      ratings: Object.fromEntries(Object.keys(SENSORY_RATINGS).map((key) => [
        key,
        Number.isInteger(item.ratings?.[key]) && item.ratings[key] >= 1 && item.ratings[key] <= 5
          ? item.ratings[key] : null
      ])),
      composition: Array.isArray(item.composition) ? item.composition.map((entry) => ({ id: entry.id, points: entry.points })) : []
    }))
    .filter((item) => item.title && Number.isFinite(Date.parse(item.observedAt)) && item.impression)
    .sort((a, b) => a.observedAt.localeCompare(b.observedAt));
}

function summarizeRatings(experiments) {
  return Object.entries(SENSORY_RATINGS).map(([key, label]) => {
    const values = experiments.map((item) => item.ratings[key]).filter(Number.isInteger);
    return {
      key,
      label,
      average: values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length * 10) / 10 : null,
      count: values.length
    };
  });
}

export function buildProfessionalReport({
  creation,
  variant,
  experiments = [],
  generatedAt = new Date().toISOString()
} = {}) {
  if (!creation?.id || !Array.isArray(creation.variants)) {
    throw new Error("Seleccioná una creación guardada para generar el informe.");
  }
  const savedVariant = creation.variants.find((item) => item.id === variant?.id);
  if (!savedVariant) throw new Error("La variante seleccionada no pertenece a esta creación.");
  const latestVersion = [...(savedVariant.versions ?? [])].sort((a, b) => b.number - a.number)[0] ?? null;
  const snapshotItems = normalizeArchiveItems(latestVersion?.items ?? savedVariant.items);
  if (!snapshotItems.length) throw new Error("La variante no contiene una composición guardada para informar.");
  const timestamp = Date.parse(generatedAt);
  if (!Number.isFinite(timestamp)) throw new Error("La fecha de generación del informe no es válida.");

  const composition = snapshotItems.map((item) => {
    const reference = LIBRARY.get(item.id);
    if (!reference) throw new Error(`La referencia «${item.id}» ya no está disponible en la biblioteca.`);
    return {
      id: item.id,
      name: reference.name,
      family: reference.family,
      kind: reference.kind,
      roles: [...(reference.roles ?? [])],
      facets: [...(reference.facets ?? [])],
      profile: reference.profile,
      points: item.points
    };
  });
  const familyBreakdown = aggregate(snapshotItems, (reference) => reference.family);
  const facetBreakdown = aggregate(snapshotItems, (reference) => reference.facets);
  const roleBreakdown = aggregate(snapshotItems, (reference) => reference.roles);
  const sensoryExperiments = normalizeExperiments(experiments, creation.id, savedVariant.id);

  return {
    schemaVersion: 1,
    reportType: "professional-formulation-dossier",
    generatedAt: new Date(timestamp).toISOString(),
    creation: {
      id: creation.id,
      name: String(creation.name ?? "Creación sin nombre"),
      description: String(creation.description ?? ""),
      createdAt: creation.createdAt ?? null,
      updatedAt: creation.updatedAt ?? null
    },
    variant: {
      id: savedVariant.id,
      label: String(savedVariant.label ?? "—"),
      name: String(savedVariant.name ?? "Variante"),
      createdAt: savedVariant.createdAt ?? null,
      updatedAt: savedVariant.updatedAt ?? null,
      versionNumber: Number.isInteger(latestVersion?.number) ? latestVersion.number : 1,
      versionNote: String(latestVersion?.note ?? "")
    },
    summary: {
      referenceCount: composition.length,
      totalCreativePoints: composition.reduce((sum, item) => sum + item.points, 0),
      familyCount: familyBreakdown.length,
      dominantFamily: familyBreakdown[0]?.label ?? "Sin clasificar",
      experimentCount: sensoryExperiments.length
    },
    composition,
    familyBreakdown,
    facetBreakdown,
    roleBreakdown,
    sensoryExperiments,
    subjectiveRatingSummary: summarizeRatings(sensoryExperiments),
    scopeNote: "Los puntos creativos y las etiquetas editoriales describen el archivo conceptual. Las observaciones sensoriales son subjetivas y no constituyen mediciones instrumentales, fórmulas químicas ni predicciones de rendimiento."
  };
}

function csvCell(value) {
  let text = String(value ?? "");
  if (/^[=+@-]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

export function toProfessionalReportCsv(report) {
  if (!report || report.reportType !== "professional-formulation-dossier") {
    throw new Error("Generá un informe válido antes de exportar CSV.");
  }
  const rows = [
    ["SECTION", "FIELD", "VALUE", "DETAIL"],
    ["REPORT", "Generated at", report.generatedAt, ""],
    ["CREATION", "Name", report.creation.name, report.creation.description],
    ["VARIANT", "Variant", report.variant.label, report.variant.name],
    ["VARIANT", "Version", report.variant.versionNumber, report.variant.versionNote],
    ["SUMMARY", "References", report.summary.referenceCount, ""],
    ["SUMMARY", "Creative points", report.summary.totalCreativePoints, ""],
    ["SUMMARY", "Dominant family", report.summary.dominantFamily, ""],
    ...report.composition.map((item) => ["REFERENCE", item.name, item.points, `${item.family} · ${item.roles.join(", ")} · ${item.facets.join(", ")}`]),
    ...report.familyBreakdown.map((item) => ["FAMILY", item.label, item.points, "Puntos creativos"]),
    ...report.facetBreakdown.map((item) => ["FACET", item.label, item.points, "Clasificación editorial solapable"]),
    ...report.roleBreakdown.map((item) => ["ROLE", item.label, item.points, "Clasificación editorial orientativa"]),
    ...report.sensoryExperiments.map((item) => ["SENSORY", item.title, item.observedAt, `${item.contextLabel} · v${item.versionNumber} · ${item.tags.join(", ")} · ${item.impression}`])
  ];
  return `\uFEFF${rows.map((row) => row.map(csvCell).join(",")).join("\r\n")}`;
}
