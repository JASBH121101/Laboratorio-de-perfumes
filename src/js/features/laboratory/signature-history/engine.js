import { PERFUME_ITEMS } from "../../perfume-library/data.js";

const LIBRARY = new Map(PERFUME_ITEMS.map((item) => [item.id, item]));

function normalizeSnapshotItems(items) {
  if (!Array.isArray(items) || !items.length) return null;
  const seen = new Set();
  const normalized = [];
  for (const entry of items) {
    const id = String(entry?.id ?? "");
    const points = Number(entry?.points);
    if (!LIBRARY.has(id) || seen.has(id) || !Number.isInteger(points) || points < 0 || points > 100) return null;
    seen.add(id);
    normalized.push({ id, points });
  }
  const total = normalized.reduce((sum, item) => sum + item.points, 0);
  return total === 100 ? normalized : null;
}

function dateValue(value) {
  const timestamp = Date.parse(value || "");
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function summarizeSnapshot(creation, variant, version, ordinal) {
  const items = normalizeSnapshotItems(version?.items);
  if (!items) return null;

  const familyPoints = new Map();
  for (const item of items) {
    const reference = LIBRARY.get(item.id);
    familyPoints.set(reference.family, (familyPoints.get(reference.family) ?? 0) + item.points);
  }
  const familyProfile = [...familyPoints.entries()]
    .map(([family, points]) => ({ family, points, share: points }))
    .sort((a, b) => b.share - a.share || a.family.localeCompare(b.family, "es"));
  const dominantFamily = familyProfile[0]?.family ?? "Sin clasificar";

  return {
    id: `${creation.id}::${variant.id}::${version?.number ?? ordinal}`,
    createdAt: version?.createdAt || variant.updatedAt || creation.updatedAt || creation.createdAt || "",
    timestamp: dateValue(version?.createdAt || variant.updatedAt || creation.updatedAt || creation.createdAt),
    creationName: String(creation.name || "Creación sin nombre"),
    variantLabel: String(variant.label || "—"),
    variantName: String(variant.name || "Variante"),
    versionNumber: version?.number !== null && version?.number !== undefined && Number.isInteger(Number(version.number)) ? Number(version.number) : null,
    note: String(version?.note || ""),
    referenceCount: items.length,
    items,
    familyProfile,
    dominantFamily
  };
}

export function collectSignatureSnapshots(creations = []) {
  const snapshots = [];
  let skippedCount = 0;
  if (!Array.isArray(creations)) return { snapshots, skippedCount: 0 };

  for (const creation of creations) {
    for (const variant of creation?.variants ?? []) {
      const versions = Array.isArray(variant?.versions) && variant.versions.length
        ? variant.versions
        : variant?.items?.length
          ? [{ number: null, createdAt: variant.updatedAt || creation.updatedAt || creation.createdAt, note: "Estado actual", items: variant.items }]
          : [];
      versions.forEach((version, index) => {
        const snapshot = summarizeSnapshot(creation, variant, version, index + 1);
        if (snapshot) snapshots.push(snapshot);
        else skippedCount += 1;
      });
    }
  }

  snapshots.sort((a, b) => a.timestamp - b.timestamp
    || a.creationName.localeCompare(b.creationName, "es")
    || a.variantLabel.localeCompare(b.variantLabel, "es")
    || (a.versionNumber ?? 0) - (b.versionNumber ?? 0));
  return { snapshots, skippedCount };
}

function familyShare(snapshot, family) {
  return snapshot.familyProfile.find((row) => row.family === family)?.share ?? 0;
}

export function analyzePersonalSignature(creations = []) {
  const { snapshots, skippedCount } = collectSignatureSnapshots(creations);
  if (!snapshots.length) {
    return {
      status: "empty",
      snapshotCount: 0,
      skippedCount,
      distinctReferenceCount: 0,
      familyCount: 0,
      dominantFamily: null,
      recurringDominantFamily: null,
      familyProfile: [],
      familyEvolution: [],
      topReferences: [],
      timeline: []
    };
  }

  const allReferenceIds = new Set();
  const referenceUsage = new Map();
  const familyTotals = new Map();
  const dominantCounts = new Map();

  for (const snapshot of snapshots) {
    for (const item of snapshot.items) {
      allReferenceIds.add(item.id);
      const current = referenceUsage.get(item.id) ?? { snapshots: 0, points: 0 };
      current.snapshots += 1;
      current.points += item.points;
      referenceUsage.set(item.id, current);
    }
    for (const row of snapshot.familyProfile) {
      familyTotals.set(row.family, (familyTotals.get(row.family) ?? 0) + row.share);
    }
    dominantCounts.set(snapshot.dominantFamily, (dominantCounts.get(snapshot.dominantFamily) ?? 0) + 1);
  }

  const familyProfile = [...familyTotals.entries()]
    .map(([family, total]) => ({ family, averageShare: Math.round(total / snapshots.length) }))
    .sort((a, b) => b.averageShare - a.averageShare || a.family.localeCompare(b.family, "es"));
  const first = snapshots[0];
  const latest = snapshots[snapshots.length - 1];
  const familyEvolution = [...new Set([
    ...first.familyProfile.map((row) => row.family),
    ...latest.familyProfile.map((row) => row.family)
  ])].map((family) => ({
    family,
    firstShare: familyShare(first, family),
    latestShare: familyShare(latest, family),
    delta: familyShare(latest, family) - familyShare(first, family)
  })).sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta) || a.family.localeCompare(b.family, "es"));

  const topReferences = [...referenceUsage.entries()]
    .map(([id, usage]) => {
      const reference = LIBRARY.get(id);
      return {
        id,
        name: reference?.name ?? id,
        family: reference?.family ?? "Sin clasificar",
        appearances: usage.snapshots,
        appearanceShare: Math.round(usage.snapshots / snapshots.length * 100),
        averagePoints: Math.round(usage.points / usage.snapshots)
      };
    })
    .sort((a, b) => b.appearances - a.appearances || b.averagePoints - a.averagePoints || a.name.localeCompare(b.name, "es"))
    .slice(0, 6);

  const recurringDominantFamily = [...dominantCounts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "es"))[0];
  const distinctFormulaCount = new Set(snapshots.map((snapshot) => snapshot.items
    .map((item) => `${item.id}:${item.points}`).sort().join("|"))).size;

  return {
    status: "ready",
    snapshotCount: snapshots.length,
    distinctFormulaCount,
    skippedCount,
    distinctReferenceCount: allReferenceIds.size,
    familyCount: familyTotals.size,
    dominantFamily: latest.dominantFamily,
    recurringDominantFamily: recurringDominantFamily?.[0] ?? latest.dominantFamily,
    recurringDominantShare: Math.round((recurringDominantFamily?.[1] ?? 0) / snapshots.length * 100),
    firstAt: first.createdAt,
    latestAt: latest.createdAt,
    familyProfile,
    familyEvolution,
    topReferences,
    timeline: snapshots.slice(-8).reverse().map((snapshot) => ({
      ...snapshot,
      familyProfile: snapshot.familyProfile.map((row) => ({ ...row }))
    }))
  };
}
