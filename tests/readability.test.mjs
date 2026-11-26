import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const stylesheetPaths = [
  "../src/css/styles.css",
  "../src/css/design-system.css",
  "../src/css/perfume-library.css",
  "../src/css/laboratory.css",
  "../src/css/analytics.css"
];

test("all authored typography sizes meet the 14px readability floor", async () => {
  for (const path of stylesheetPaths) {
    const css = await readFile(new URL(path, import.meta.url), "utf8");
    const explicitSizes = [...css.matchAll(/font-size\s*:\s*(\d+(?:\.\d+)?)px/gi)].map((match) => Number(match[1]));
    const shorthandSizes = [...css.matchAll(/\bfont\s*:\s*([^;{}]+);/gi)]
      .flatMap((match) => [...match[1].matchAll(/(\d+(?:\.\d+)?)px/g)].map((size) => Number(size[1])));
    const sizes = [...explicitSizes, ...shorthandSizes];
    assert.ok(sizes.length > 0, "No pixel typography declarations found in " + path);
    assert.ok(sizes.every((size) => size >= 14), path + " contains a font size below 14px");
  }
});

test("the application base text size is 16px with comfortable line spacing", async () => {
  const css = await readFile(new URL("../src/css/styles.css", import.meta.url), "utf8");
  assert.match(css, /body\s*\{[^}]*font-size:\s*16px/);
  assert.match(css, /body\s*\{[^}]*line-height:\s*1\.55/);
});

test("PWA cache version advances so installed Android clients refresh the typography", async () => {
  const sw = await readFile(new URL("../sw.js", import.meta.url), "utf8");
  assert.match(sw, /shell-v50/);
  assert.doesNotMatch(sw, /shell-v47/);
});


test("mobile text controls use a 16px font size", async () => {
  const css = await readFile(new URL("../src/css/design-system.css", import.meta.url), "utf8");
  assert.ok(css.includes("font-size: 16px;"));
  assert.ok(css.includes('input:not([type="range"]):not([type="checkbox"]):not([type="radio"]):not([type="hidden"])'));
});


test("mobile text controls use a 16px font size", async () => {
  const css = await readFile(new URL("../src/css/design-system.css", import.meta.url), "utf8");
  assert.ok(css.includes("font-size: 16px;"));
  assert.ok(css.includes('input:not([type="range"]):not([type="checkbox"]):not([type="radio"]):not([type="hidden"])'));
});
