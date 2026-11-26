import test from "node:test";
import assert from "node:assert/strict";
import {
  analyzePersonalSignature, collectSignatureSnapshots
} from "../src/js/features/laboratory/signature-history/engine.js";
import { renderPersonalSignatureHistory } from "../src/js/features/laboratory/signature-history/panel.js";

function version(number, createdAt, items, note = "") {
  return { number, createdAt, items, note };
}

function archive() {
  return [
    {
      id: "creation-a",
      name: "Jardín de Granada",
      createdAt: "2026-01-01T10:00:00.000Z",
      updatedAt: "2026-01-03T10:00:00.000Z",
      variants: [
        {
          id: "creation-a:A", label: "A", name: "Original",
          versions: [
            version(1, "2026-01-01T10:00:00.000Z", [{ id: "bergamot", points: 50 }, { id: "rose", points: 50 }], "Inicio"),
            version(2, "2026-01-03T10:00:00.000Z", [{ id: "bergamot", points: 25 }, { id: "vanilla", points: 75 }], "Más dulce")
          ],
          items: [{ id: "bergamot", points: 25 }, { id: "vanilla", points: 75 }]
        }
      ]
    }
  ];
}

test("signature history starts empty without saved snapshots", () => {
  const result = analyzePersonalSignature([]);
  assert.equal(result.status, "empty");
  assert.equal(result.snapshotCount, 0);
  assert.equal(renderPersonalSignatureHistory({ creations: [] }).includes("Aún no hay registros"), true);
});

test("signature history reads each saved version chronologically without duplicating the current snapshot", () => {
  const result = analyzePersonalSignature(archive());
  assert.equal(result.status, "ready");
  assert.equal(result.snapshotCount, 2);
  assert.equal(result.distinctFormulaCount, 2);
  assert.equal(result.distinctReferenceCount, 3);
  assert.equal(result.familyCount, 3);
  assert.equal(result.timeline.length, 2);
  assert.equal(result.timeline[0].versionNumber, 2);
  assert.equal(result.timeline[1].versionNumber, 1);
  assert.equal(result.dominantFamily, "Vanilla");
});

test("family evolution compares the first and most recent snapshots", () => {
  const result = analyzePersonalSignature(archive());
  const citrus = result.familyEvolution.find((row) => row.family === "Cítrica");
  const floral = result.familyEvolution.find((row) => row.family === "Floral");
  const vanilla = result.familyEvolution.find((row) => row.family === "Gourmand");
  assert.equal(citrus.firstShare, 50);
  assert.equal(citrus.latestShare, 25);
  assert.equal(citrus.delta, -25);
  assert.equal(floral.firstShare, 50);
  assert.equal(floral.latestShare, 0);
  assert.equal(vanilla.latestShare, 75);
});

test("frequent references count presence per saved snapshot and report current dominant family", () => {
  const result = analyzePersonalSignature(archive());
  assert.equal(result.topReferences[0].name, "Bergamota");
  assert.equal(result.topReferences[0].appearances, 2);
  assert.equal(result.topReferences[0].appearanceShare, 100);
  assert.equal(result.recurringDominantFamily, "Vanilla");
  assert.equal(result.recurringDominantShare, 50);
});

test("legacy saved variants without version arrays use their current saved composition once", () => {
  const legacy = [{
    id: "legacy", name: "Legacy", variants: [{
      id: "legacy:A", label: "A", name: "Original",
      items: [{ id: "bergamot", points: 100 }]
    }]
  }];
  const collected = collectSignatureSnapshots(legacy);
  assert.equal(collected.snapshots.length, 1);
  assert.equal(collected.snapshots[0].versionNumber, null);
});

test("invalid snapshots are excluded and counted instead of inventing trends", () => {
  const malformed = [{
    id: "bad", name: "Corrupt", variants: [{
      id: "bad:A", label: "A", versions: [
        version(1, "2026-01-01T10:00:00.000Z", [{ id: "unknown", points: 100 }]),
        version(2, "2026-01-02T10:00:00.000Z", [{ id: "bergamot", points: 30 }])
      ]
    }]
  }];
  const result = analyzePersonalSignature(malformed);
  assert.equal(result.status, "empty");
  assert.equal(result.skippedCount, 2);
});

test("panel escapes names and renders timeline, family movement and recurring references", () => {
  const creations = archive();
  creations[0].name = '<script>alert("x")</script>';
  const html = renderPersonalSignatureHistory({ creations });
  assert.equal(html.includes("<script>alert"), false);
  assert.ok(html.includes("Historial de evolución"));
  assert.ok(html.includes("Movimiento de tu firma"));
  assert.ok(html.includes("Referencias recurrentes"));
  assert.ok(html.includes("BLOCK 08"));
});

test("timeline is limited to the eight most recent versions for compact rendering", () => {
  const versions = Array.from({ length: 12 }, (_, index) => version(
    index + 1,
    new Date(Date.UTC(2026, 0, index + 1)).toISOString(),
    [{ id: "bergamot", points: 100 }]
  ));
  const creations = [{ id: "many", name: "Many", variants: [{ id: "many:A", label: "A", name: "Original", versions }] }];
  const result = analyzePersonalSignature(creations);
  assert.equal(result.snapshotCount, 12);
  assert.equal(result.timeline.length, 8);
  assert.equal(result.timeline[0].versionNumber, 12);
});
