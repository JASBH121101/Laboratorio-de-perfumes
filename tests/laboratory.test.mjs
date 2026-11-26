import test from "node:test";
import assert from "node:assert/strict";
import { renderPage } from "../src/js/ui/views.js";
import { createMixState, addMixNote } from "../src/js/features/laboratory/mixing/state.js";

test("Laboratory route renders a text-first formulation workspace without 3D elements", () => {
  const state = addMixNote(createMixState(), "bergamot");
  const html = renderPage("lab", {}, state);
  assert.match(html, /Constructor de/);
  assert.match(html, /id="mix-studio"/);
  assert.match(html, /Bergamota/);
  assert.match(html, /analysis-family-donut/);
  assert.match(html, /originality-analysis/);
  assert.doesNotMatch(html, /data-lab-stage|data-lab-canvas|Three\.js|camera-preset|zoom-camera|WebGL/i);
});

test("empty Laboratory route renders empty composition and pending originality baseline", () => {
  const html = renderPage("lab", {}, createMixState());
  assert.match(html, /Constructor de/);
  assert.match(html, /La composición está vacía/);
  assert.match(html, /originality-analysis/);
  assert.match(html, /BASE EN CONSTRUCCIÓN|EN ESPERA/);
  assert.doesNotMatch(html, /data-lab-stage|laboratorio 3D|escena tridimensional/i);
});

test("home route renders analytics dashboard from supplied local archive state", () => {
  const archive = {
    creations: [{
      id: "test-1", name: "Jardín", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-02T00:00:00.000Z",
      variants: [{ id: "test-1:A", label: "A", name: "Original", items: [{ id: "bergamot", points: 50 }, { id: "rose", points: 50 }], versions: [{ number: 1, items: [{ id: "bergamot", points: 50 }, { id: "rose", points: 50 }] }] }]
    }]
  };
  const html = renderPage("home", {}, createMixState(), "balanced", "opening", archive);
  assert.match(html, /Investigación/);
  assert.match(html, /CREACIONES/);
  assert.match(html, /Jardín/);
  assert.match(html, /Uso de familias olfativas/);
  assert.match(html, /Constructor de fórmulas/);
});
