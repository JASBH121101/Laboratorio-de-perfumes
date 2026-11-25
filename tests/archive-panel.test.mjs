import test from "node:test";
import assert from "node:assert/strict";
import { createArchiveCreation, createArchiveVariant, saveArchiveVersion } from "../src/js/features/archive/model.js";
import { renderArchiveQuickSave, renderArchiveView } from "../src/js/features/archive/panel.js";

const original = createArchiveCreation({ name: "Jardín nocturno", items: [{ id: "bergamot", points: 100 }], id: "ui-project" });

test("archive view offers local creation, backup and restore controls", () => {
  const html = renderArchiveView({ creations: [original] });
  assert.match(html, /Crear desde composición actual/);
  assert.match(html, /Exportar todo/);
  assert.match(html, /Importar respaldo JSON/);
  assert.match(html, /local-first/i);
});

test("archive detail exposes variant, version, rename and delete controls", () => {
  const html = renderArchiveView({ creations: [original], selectedCreationId: original.id, selectedVariantId: original.activeVariantId });
  assert.match(html, /data-select-variant=/);
  assert.match(html, /data-restore-version=/);
  assert.match(html, /data-action="rename-archive"/);
  assert.match(html, /data-action="delete-archive"/);
  assert.match(html, /Guardar composición actual como nueva versión/);
});

test("archive detail renders a variant comparison view", () => {
  const withB = createArchiveVariant(original, { items: [{ id: "rose", points: 100 }], id: "ui-project:B" });
  const html = renderArchiveView({
    creations: [withB],
    selectedCreationId: withB.id,
    selectedVariantId: withB.activeVariantId,
    comparison: {
      left: { id: "ui-project:A", label: "A", name: "Original" },
      right: { id: "ui-project:B", label: "B", name: "Variante B" },
      rows: [{ id: "bergamot", leftPoints: 100, rightPoints: 0, delta: -100 }]
    }
  });
  assert.match(html, /Comparar variantes/);
  assert.match(html, /data-action="compare-archive-variants"/);
});

test("quick save panel offers create or version action based on selection", () => {
  const blank = renderArchiveQuickSave({ creations: [] });
  assert.match(blank, /data-action="save-current-as-creation"/);
  const selected = renderArchiveQuickSave({
    creations: [original],
    selectedCreationId: original.id,
    selectedVariantId: original.activeVariantId
  });
  assert.match(selected, /data-action="save-archive-version"/);
});
