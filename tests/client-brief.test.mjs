import test from "node:test";
import assert from "node:assert/strict";
import { buildClientBrief } from "../src/js/features/laboratory/client-brief/engine.js";
import { renderClientBriefPanel } from "../src/js/features/laboratory/client-brief/panel.js";
test("client brief builds assistant-ready text from occasion, style, presence and preferences", () => {
  const result = buildClientBrief({ occasion:"diario", style:"fresco", presence:"discreta", liked:"cítrico y limpio", avoid:"demasiado dulce" });
  assert.equal(result.status, "ready");
  assert.match(result.description, /Ocasión de uso: diario/);
  assert.match(result.description, /Presencia deseada: discreta/);
  assert.match(result.description, /Evitar o moderar: demasiado dulce/);
});
test("client brief asks for direction instead of inventing a profile", () => {
  const result = buildClientBrief({ occasion:"noche", style:"sin preferencia" });
  assert.equal(result.status, "needs-direction");
  assert.equal(result.description, "");
  assert.ok(result.followUpQuestion);
});
test("client brief clamps options, removes markup and bounds free text", () => {
  const result = buildClientBrief({ occasion:"anything", style:"impossible", liked:"<script>alert(1)</script> fresco   y limpio" });
  assert.equal(result.fields.occasion, "sin definir");
  assert.equal(result.fields.style, "sin preferencia");
  assert.doesNotMatch(result.description, /<script>/);
  assert.match(result.description, /fresco y limpio/);
  assert.ok(result.fields.liked.length <= 280);
});
test("client brief preview escapes user text and exposes an explicit handoff", () => {
  const value = "<img src=x onerror=alert(1)>";
  const html = renderClientBriefPanel({ fields:{liked:value}, result:buildClientBrief({style:"elegante",liked:value}) });
  assert.match(html, /send-client-brief-to-assistant/);
  assert.doesNotMatch(html, /<img src=x/);
  assert.match(html, /&lt;img/);
});
