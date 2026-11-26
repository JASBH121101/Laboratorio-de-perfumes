import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PERFUME_ITEMS } from "../src/js/features/perfume-library/data.js";
import { buildCreativeRecommendations } from "../src/js/features/laboratory/creative-assistant/engine.js";
import { renderCreativeAssistant } from "../src/js/features/laboratory/creative-assistant/panel.js";

test("local assistant recommends real library references for a personal brief", () => {
  const result = buildCreativeRecommendations({
    description: "Quiero una fragancia cítrica y amaderada, fresca, discreta para uso diario.",
    mode: "personal"
  });
  assert.equal(result.status, "ready");
  assert.equal(result.mode, "personal");
  assert.ok(result.preferences.includes("cítrica"));
  assert.ok(result.preferences.includes("amaderada"));
  assert.ok(result.suggestions.length > 0);
  const libraryIds = new Set(PERFUME_ITEMS.map((item) => item.id));
  assert.ok(result.suggestions.every((item) => libraryIds.has(item.id)));
  assert.ok(result.suggestions.some((item) => item.family === "Cítrica"));
  assert.ok(result.suggestions.some((item) => item.family === "Amaderada"));
});

test("assistant identifies a stated dislike and does not recommend the avoided family", () => {
  const result = buildCreativeRecommendations({
    description: "Busco un aroma cítrico, no muy dulce, con presencia para la noche.",
    mode: "personal"
  });
  assert.ok(result.avoidedPreferences.includes("dulce o cremosa"));
  assert.ok(result.suggestions.every((item) => item.family !== "Gourmand"));
});

test("client mode produces a guided question when the brief is incomplete", () => {
  const result = buildCreativeRecommendations({
    description: "Mi amiga quiere algo floral y elegante.",
    mode: "client"
  });
  assert.equal(result.mode, "client");
  assert.equal(result.title, "Lectura del perfil de cliente");
  assert.ok(result.followUpQuestion.length > 0);
});

test("inspiration mode turns liked perfume characteristics into a creative direction, not a copy", () => {
  const result = buildCreativeRecommendations({
    description: "Me gusta de este perfume la salida cítrica y el fondo amaderado; quiero una identidad propia.",
    mode: "inspiration"
  });
  assert.equal(result.mode, "inspiration");
  assert.equal(result.title, "Lectura de inspiración olfativa");
  assert.match(result.summary, /no una fórmula ni una reconstrucción/);
});

test("short briefs request more context without inventing suggestions", () => {
  const result = buildCreativeRecommendations({ description: "algo" });
  assert.equal(result.status, "needs-brief");
  assert.equal(result.suggestions.length, 0);
  assert.ok(result.followUpQuestion);
});

test("briefs without recognized fragrance direction ask a targeted question", () => {
  const result = buildCreativeRecommendations({
    description: "Quiero algo elegante y moderno para regalar.",
    mode: "client"
  });
  assert.equal(result.status, "needs-direction");
  assert.ok(result.followUpQuestion);
  assert.equal(result.suggestions.length, 0);
  assert.deepEqual(result.avoidedPreferences, []);
});

test("assistant panel exposes local modes and explicit transfer action, and escapes user text", () => {
  const html = renderCreativeAssistant({
    mode: "personal",
    description: "<script>alert(1)</script>",
    result: {
      title: "Lectura segura",
      summary: "Propuesta de prueba.",
      preferences: ["cítrica"],
      avoidedPreferences: [],
      followUpQuestion: "",
      suggestions: [{
        id: "bergamot",
        name: "<img src=x onerror=alert(1)>",
        family: "Cítrica",
        roles: ["Salida"],
        facets: ["cítrica"],
        rationale: "Referencia existente."
      }],
      notice: "Orientativo."
    }
  });
  assert.match(html, /Mi propia creación/);
  assert.match(html, /Perfil de un cliente o amistad/);
  assert.match(html, /Perfume de referencia que me gusta/);
  assert.match(html, /sin API externa/);
  assert.match(html, /apply-creative-assistant-suggestions/);
  assert.doesNotMatch(html, /<script>alert/);
  assert.doesNotMatch(html, /<img src=x/);
  assert.match(html, /&lt;script&gt;/);
});

test("assistant is wired into the laboratory and its modules are included in the offline shell", async () => {
  const app = await readFile(new URL("../src/js/app.js", import.meta.url), "utf8");
  const views = await readFile(new URL("../src/js/ui/views.js", import.meta.url), "utf8");
  const sw = await readFile(new URL("../sw.js", import.meta.url), "utf8");
  assert.match(app, /buildCreativeRecommendations/);
  assert.match(app, /run-creative-assistant/);
  assert.match(app, /apply-creative-assistant-suggestions/);
  assert.match(app, /addMixNote\(mixingState, suggestion\.id\)/);
  assert.match(views, /renderCreativeAssistant/);
  assert.match(sw, /creative-assistant\/engine\.js/);
  assert.match(sw, /creative-assistant\/panel\.js/);
});

test("assistant recommendations are not treated as technical or safety certification", () => {
  const result = buildCreativeRecommendations({
    description: "Quiero algo fresco, cítrico y discreto para diario."
  });
  assert.match(result.notice, /No calculan una fórmula química/);
  assert.match(result.notice, /seguridad de uso/);
});


test("assistant blocks recommendations when the same family is both preferred and avoided", () => {
  const result = buildCreativeRecommendations({
    description: "Me gustan las notas dulces, pero no quiero nada dulce en la composición.",
    mode: "personal"
  });
  assert.equal(result.status, "needs-clarification");
  assert.ok(result.conflicts.includes("dulce o cremosa"));
  assert.equal(result.suggestions.length, 0);
  assert.match(result.followUpQuestion, /incluir|dejarlo fuera/);
});

test("assistant distinguishes positive and negative family mentions", () => {
  const result = buildCreativeRecommendations({
    description: "Quiero algo cítrico y amaderado, sin dulzor marcado.",
    mode: "personal"
  });
  assert.equal(result.status, "ready");
  assert.ok(result.preferences.includes("cítrica"));
  assert.ok(result.preferences.includes("amaderada"));
  assert.ok(result.avoidedPreferences.includes("dulce o cremosa"));
});

test("assistant renders guided prompts and an explicit conflict state", () => {
  const html = renderCreativeAssistant({ open: true, mode: "personal" });
  assert.match(html, /data-creative-prompt=/);
  assert.match(html, /Fresco y limpio/);
  assert.match(html, /Cálido y envolvente/);
  const conflictHtml = renderCreativeAssistant({
    open: true,
    result: {
      title: "Aclaración", summary: "Hay señales opuestas.", preferences: [],
      avoidedPreferences: [], conflicts: ["dulce o cremosa"],
      followUpQuestion: "¿Querés incluirlo?", suggestions: [], notice: "Pendiente."
    }
  });
  assert.match(conflictHtml, /Brief pendiente de aclaración/);
});
