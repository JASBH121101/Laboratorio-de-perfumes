import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");
const [app, scene, views, archivePanel, inspector, mixPanel] = await Promise.all([
  read("src/js/app.js"),
  read("src/js/features/laboratory/scene.js"),
  read("src/js/ui/views.js"),
  read("src/js/features/archive/panel.js"),
  read("src/js/features/laboratory/inspector.js"),
  read("src/js/features/laboratory/mixing/panel.js")
]);

test("3D prop selection reaches the inspector and clear-selection returns to its empty state", () => {
  assert.match(scene, /stage\.dispatchEvent\(new CustomEvent\("lab:item-selected"/);
  assert.match(app, /appRoot\.addEventListener\("lab:item-selected", \(event\) => updateLabInspector/);
  assert.match(inspector, /data-action="clear-lab-selection"/);\n  assert.match(app, /action === "clear-lab-selection"/);
  assert.match(app, /labController\?\.clearSelection\(\)/);
});

test("notes can be added from the inspector, library and mixing picker", () => {
  assert.match(app, /const addMixTarget = event\.target\.closest\("\[data-add-to-mix\]"\)/);
  assert.match(app, /addNoteToMix\(addMixTarget\.dataset\.addToMix\)/);
  assert.match(app, /const noteTarget = event\.target\.closest\("\[data-open-note\]"\)/);
  assert.match(mixPanel, /data-action="add-picked-note"/);\n  assert.match(app, /action === "add-picked-note"/);
  assert.match(app, /addNoteToMix\(appRoot\.querySelector\("#mix-note-picker"\)\?\.value\)/);
  assert.match(app, /appRoot\.addEventListener\("change", async \(event\) => \{[\s\S]*?setMixNotePoints/);
  assert.match(views, /data-mix-dropzone/);
});

test("selecting a variant loads its exact composition into the editor and autosaves it", () => {
  const selectHandler = app.match(/const selectVariant = event\.target\.closest\("\[data-select-variant\]"\);([\s\S]*?)const restoreTarget/);
  assert.ok(selectHandler, "Variant selection handler is present");
  assert.match(selectHandler[1], /getVariant\(creation, selectVariant\.dataset\.selectVariant\)/);
  assert.match(selectHandler[1], /mixingState = \{ items: variant\.items\.map\(\(item\) => \(\{ \.\.\.item \}\)\), history: \[\] \}/);
  assert.match(selectHandler[1], /saveMixDraft\(mixingState\.items\)/);
  assert.match(selectHandler[1], /updateMixStudio\(\)/);
  assert.match(selectHandler[1], /persistCreation\(updated/);
});

test("restoring an archive version also refreshes the working draft", () => {
  const restoreHandler = app.match(/const restoreTarget = event\.target\.closest\("\[data-restore-version\]"\);([\s\S]*?)const cameraPreset/);
  assert.ok(restoreHandler, "Version restore handler is present");
  assert.match(restoreHandler[1], /restoreArchiveVersion\(/);
  assert.match(restoreHandler[1], /saveMixDraft\(mixingState\.items\)/);
  assert.match(restoreHandler[1], /updateMixStudio\(\)/);
});

test("empty compositions cannot be saved or forked into archive versions", () => {
  assert.match(app, /function requireWorkingComposition\(\) \{[\s\S]*?if \(!mixingState\.items\.length\)/);
  for (const name of ["saveNewCreation", "saveCurrentAsVersion", "createVariantFromCurrent"]) {
    const start = app.indexOf(`function ${name}`);
    assert.ok(start >= 0, `Missing ${name}`);
    assert.match(app.slice(start, start + 350), /requireWorkingComposition\(\)/);
  }
  assert.match(archivePanel, /hasCurrentComposition = state\.hasCurrentComposition !== false/);
  assert.match(archivePanel, /data-action="create-archive" \\?\$\{hasCurrentComposition/);
});

test("quick-save status is refreshed after every composition update and each edit is autosaved", () => {
  assert.match(app, /function updateMixStudio\(\) \{\s*saveMixDraft\(mixingState\.items\)/);
  assert.match(app, /renderArchiveQuickSave\(getArchiveViewState\(\)\)/);
  assert.match(app, /function getArchiveViewState\(\) \{[\s\S]*?hasCurrentComposition: mixingState\.items\.length > 0/);
});
