import { access, readFile } from "node:fs/promises";
import { resolve } from "node:path";

const requiredFiles = [
  "index.html", "manifest.webmanifest", "sw.js", "assets/icon.svg", "assets/brand-logo.svg",
  "assets/icon-192.png", "assets/icon-512.png",
  "src/css/styles.css", "src/css/design-system.css", "src/css/perfume-library.css", "src/css/laboratory.css",
  "src/js/app.js", "src/js/core/navigation.js", "src/js/core/pwa.js",
  "src/js/features/perfume-library/data.js", "src/js/features/perfume-library/library.js",
  "src/js/features/laboratory/catalog.js", "src/js/features/laboratory/inspector.js", "src/js/features/laboratory/scene.js",
  "src/js/ui/views.js"
];

const failures = [];
for (const file of requiredFiles) {
  try { await access(resolve(file)); }
  catch { failures.push(`Missing required file: ${file}`); }
}

const packageJson = JSON.parse(await readFile("package.json", "utf8"));
const manifest = JSON.parse(await readFile("manifest.webmanifest", "utf8"));
const html = await readFile("index.html", "utf8");
const sw = await readFile("sw.js", "utf8");
const app = await readFile("src/js/app.js", "utf8");
const scene = await readFile("src/js/features/laboratory/scene.js", "utf8");
const catalog = await readFile("src/js/features/laboratory/catalog.js", "utf8");

if (!packageJson.scripts?.test || !packageJson.scripts?.validate) failures.push("Missing test or validate npm script.");
if (manifest.start_url !== "./" || manifest.scope !== "./") failures.push("PWA paths must be relative for GitHub Pages project sites.");
if (manifest.display !== "standalone") failures.push("PWA must request standalone display mode.");
for (const size of ["192x192", "512x512"]) {
  if (!manifest.icons?.some((icon) => icon.sizes === size && icon.type === "image/png")) failures.push(`PWA manifest is missing a ${size} PNG icon.`);
}
if (!html.includes('rel="manifest"') || !html.includes("apple-touch-icon")) failures.push("PWA manifest or Apple touch icon link is missing.");
if (!manifest.icons?.some((icon) => icon.src === "./assets/brand-logo.svg")) failures.push("Official Perfumería JB logo is missing from PWA icon metadata.");
if (!html.includes('id="app-notice"')) failures.push("Persistent PWA notice container is missing.");
if (!html.includes("./src/js/app.js") || !html.includes("./src/css/design-system.css")) failures.push("Application or design-system entrypoint is missing.");
if (!/shell-v[0-9]+/.test(sw) || !sw.includes("SKIP_WAITING")) failures.push("Versioned service-worker update lifecycle is missing.");
if (!app.includes("createPwaManager") || !app.includes("check-updates")) failures.push("PWA install/update controls are not wired.");
if (!app.includes("renderLibraryResults") || !app.includes("library-family")) failures.push("Perfume Library filters are not wired.");
if (!html.includes("three@0.187.0") || !html.includes('type="importmap"')) failures.push("Pinned Three.js import map is missing.");
if (!sw.includes("THREE_MODULE_URL") || !sw.includes("THREE_CORE_URL") || !sw.includes("three@0.187.0")) failures.push("Three.js module and core are not handled by the PWA cache.");
if (sw.includes("cache.add(new Request(THREE_MODULE_URL")) failures.push("Three.js CDN files should be cached on first 3D use, not during PWA installation.");
if (!sw.includes("src/js/features/laboratory/scene.js") || !sw.includes("src/css/laboratory.css")) failures.push("3D application modules are missing from the offline shell.");
if (!app.includes('import("./features/laboratory/scene.js")') || !app.includes("[data-lab-stage]")) failures.push("The 3D scene must be lazy-loaded only in the laboratory view.");
if (!scene.includes("WebGLRenderer") || !scene.includes("Raycaster") || !scene.includes("pointerdown")) failures.push("Interactive 3D renderer or object selection is missing.");
if (!scene.includes("clearSelection") || !scene.includes("resetCamera")) failures.push("3D selection or camera reset controls are missing.");
if (catalog.split('"id":').length - 1 !== 8) failures.push("The 3D scene should expose eight selectable props.");

if (failures.length) {
  console.error("Foundation validation failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log(`Foundation validation passed: ${requiredFiles.length} files, branded PWA, perfume library and lazy-loaded 3D scene verified.`);
}
