import test from "node:test";
import assert from "node:assert/strict";
import { PERFUME_ITEMS } from "../src/js/features/perfume-library/data.js";
import { analyzeInspirationDifferentiation } from "../src/js/features/laboratory/inspiration-differentiation/engine.js";
import { renderInspirationDifferentiation } from "../src/js/features/laboratory/inspiration-differentiation/panel.js";

const liked = "Me gusta la salida cítrica, la frescura verde y el fondo amaderado.";
const avoid = "No quiero dulzor ni demasiado cuero.";

test("inspiration analyzer separates liked traits from excluded traits and returns three alternatives", () => {
  const result = analyzeInspirationDifferentiation({
    referenceLabel: "Mi perfume de referencia",
    liked,
    avoid
  });
  assert.equal(result.status, "ready");
  assert.equal(result.referenceLabel, "Mi perfume de referencia");
  assert.ok(result.likedTraits.includes("cítrico"));
  assert.ok(result.likedTraits.includes("frescura"));
  assert.ok(result.avoidedTraits.includes("dulce o gourmand"));
  assert.ok(result.avoidedTraits.includes("cuero o ante"));
  assert.equal(result.directions.length, 3);
  const signatures = result.directions.map((direction) => direction.familyPattern.join("|"));
  assert.equal(new Set(signatures).size, 3);
  const known = new Set(PERFUME_ITEMS.map((item) => item.id));
  for (const direction of result.directions) {
    assert.ok(direction.familyPattern.length >= 2);
    assert.ok(direction.references.length >= 2);
    assert.ok(direction.references.every((reference) => known.has(reference.id)));
  }
});

test("inspiration alternatives exclude families explicitly rejected in a separate field", () => {
  const result = analyzeInspirationDifferentiation({
    liked: "Me gusta la frescura cítrica y las maderas.",
    avoid: "No quiero nada dulce, gourmand ni cuero."
  });
  assert.equal(result.status, "ready");
  assert.ok(result.avoidedFamilies.includes("Gourmand"));
  assert.ok(result.avoidedFamilies.includes("Cuero"));
  assert.ok(result.directions.every((direction) =>
    direction.familyPattern.every((family) => !["Gourmand","Cuero"].includes(family))
  ));
});

test("negated preferences inside the liked text become excluded traits", () => {
  const result = analyzeInspirationDifferentiation({
    liked: "Me gusta lo floral y fresco, pero sin dulzor excesivo."
  });
  assert.equal(result.status, "ready");
  assert.ok(result.likedTraits.includes("floral"));
  assert.ok(result.avoidedTraits.includes("dulce o gourmand"));
  assert.ok(result.directions.every((direction) =>
    direction.familyPattern.every((family) => family !== "Gourmand")
  ));
});

test("a reference label alone does not trigger invented analysis", () => {
  const result = analyzeInspirationDifferentiation({ referenceLabel: "Perfume X" });
  assert.equal(result.status, "needs-traits");
  assert.equal(result.directions.length, 0);
  assert.ok(result.followUpQuestion);
});

test("unknown descriptors request more detail instead of generating unsupported alternatives", () => {
  const result = analyzeInspirationDifferentiation({
    referenceLabel: "Referencia",
    liked: "Me gusta mucho cómo se siente elegante y moderno."
  });
  assert.equal(result.status, "needs-traits");
  assert.deepEqual(result.directions, []);
});

test("family usage from the saved archive is accepted as local context", () => {
  const creation = {
    variants: [{
      items: [{ id: "bergamot", points: 50 }, { id: "rose", points: 50 }]
    }]
  };
  const result = analyzeInspirationDifferentiation({
    liked: "Me gustan los cítricos y el carácter amaderado.",
    creations: [creation]
  });
  assert.equal(result.status, "ready");
  assert.equal(result.directions.length, 3);
});

test("inspiration panel escapes all user-provided labels and renders a bridge to the creative brief", () => {
  const result = analyzeInspirationDifferentiation({
    referenceLabel: "<script>alert(1)</script>",
    liked,
    avoid
  });
  const html = renderInspirationDifferentiation({ referenceLabel: "<script>alert(1)</script>", liked, avoid, result });
  assert.match(html, /Diferenciación por inspiración/);
  assert.match(html, /Analizar rasgos y diferenciar/);
  assert.match(html, /send-inspiration-direction/);
  assert.doesNotMatch(html, /<script>alert/);
  assert.match(html, /&lt;script&gt;/);
  assert.match(html, /no se consulta ni reconstruye su composición/i);
});

test("panel renders incomplete brief without showing unsupported directions", () => {
  const result = analyzeInspirationDifferentiation({ referenceLabel: "Perfume sin rasgos" });
  const html = renderInspirationDifferentiation({ referenceLabel: "Perfume sin rasgos", result });
  assert.match(html, /No hay suficientes rasgos/);
  assert.doesNotMatch(html, /send-inspiration-direction/);
});

test("app and PWA route inspiration analysis into the creative assistant without auto-loading a mix", async () => {
  const { readFile } = await import("node:fs/promises");
  const app = await readFile(new URL("../src/js/app.js", import.meta.url), "utf8");
  const views = await readFile(new URL("../src/js/ui/views.js", import.meta.url), "utf8");
  const sw = await readFile(new URL("../sw.js", import.meta.url), "utf8");
  assert.match(app, /analyzeInspirationDifferentiation/);
  assert.match(app, /send-inspiration-direction/);
  assert.match(app, /generateFormulationProposals/);
  assert.match(app, /briefForAssistant/);
  assert.match(views, /renderInspirationDifferentiation/);
  assert.match(sw, /inspiration-differentiation\/engine\.js/);
  assert.match(sw, /inspiration-differentiation\/panel\.js/);
});
