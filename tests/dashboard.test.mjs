import test from "node:test";
import assert from "node:assert/strict";
import { renderAnalyticsDashboard } from "../src/js/features/laboratory/analytics/dashboard.js";
import { createMixState, addMixNote } from "../src/js/features/laboratory/mixing/state.js";

test("dashboard displays honest zero-state values when the archive is empty", () => {
  const html = renderAnalyticsDashboard({ creations: [] }, createMixState());
  assert.match(html, /CREACIONES/);
  assert.match(html, /<strong>0<\/strong>/);
  assert.match(html, /Sin datos/);
  assert.match(html, /Todavía no hay fórmulas archivadas/);
});

test("dashboard derives saved metrics and family distribution from archive data", () => {
  const creation = {
    id: "c1", name: "Lluvia", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-02T00:00:00.000Z",
    variants: [{ id: "c1:A", label: "A", name: "Original", items: [{ id: "bergamot", points: 60 }, { id: "rose", points: 40 }], versions: [{ number: 1, items: [{ id: "bergamot", points: 60 }, { id: "rose", points: 40 }] }] }]
  };
  const html = renderAnalyticsDashboard({ creations: [creation] }, addMixNote(createMixState(), "vanilla"));
  assert.match(html, /Lluvia/);
  assert.match(html, /Cítrica/);
  assert.match(html, /Floral/);
  assert.match(html, /1<small> referencias/);
});


test("dashboard renders a data-derived family donut and accessible bar tracks", () => {
  const creation = {
    id: "chart-1", name: "Brisa", createdAt: "2026-02-01T00:00:00.000Z", updatedAt: "2026-02-02T00:00:00.000Z",
    variants: [{ id: "chart-1:A", label: "A", name: "Original", items: [{ id: "bergamot", points: 60 }, { id: "rose", points: 40 }], versions: [] }]
  };
  const html = renderAnalyticsDashboard({ creations: [creation] }, createMixState());
  assert.match(html, /dashboard-family-donut/);
  assert.match(html, /conic-gradient/);
  assert.match(html, /role="progressbar"/);
  assert.match(html, /aria-valuenow=/);
});

test("dashboard empty chart provides an action instead of an empty visualization", () => {
  const html = renderAnalyticsDashboard({ creations: [] }, createMixState());
  assert.match(html, /dashboard-chart-empty/);
  assert.match(html, /Sin datos para comparar/);
  assert.match(html, /Crear primera composición/);
  assert.doesNotMatch(html, /dashboard-family-donut/);
});
