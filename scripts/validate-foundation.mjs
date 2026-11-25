import { access, readFile } from "node:fs/promises";
import { resolve } from "node:path";

const requiredFiles = [
  "index.html", "manifest.webmanifest", "sw.js", "assets/icon.svg",
  "assets/icon-192.png", "assets/icon-512.png",
  "src/css/styles.css", "src/css/design-system.css",
  "src/js/app.js", "src/js/core/navigation.js", "src/js/core/pwa.js", "src/js/ui/views.js"
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

if (!packageJson.scripts?.test || !packageJson.scripts?.validate) failures.push("Missing test or validate npm script.");
if (manifest.start_url !== "./" || manifest.scope !== "./") failures.push("PWA paths must be relative for GitHub Pages project sites.");
if (manifest.display !== "standalone") failures.push("PWA must request standalone display mode.");
for (const size of ["192x192", "512x512"]) {
  if (!manifest.icons?.some((icon) => icon.sizes === size && icon.type === "image/png")) failures.push(`PWA manifest is missing a ${size} PNG icon.`);
}
if (!html.includes('rel="manifest"') || !html.includes("apple-touch-icon")) failures.push("PWA manifest or Apple touch icon link is missing.");
if (!html.includes('id="app-notice"')) failures.push("Persistent PWA notice container is missing.");
if (!html.includes("./src/js/app.js") || !html.includes("./src/css/design-system.css")) failures.push("Application or design-system entrypoint is missing.");
if (!sw.includes("SKIP_WAITING") || !/shell-v[0-9]+/.test(sw)) failures.push("Versioned service-worker update lifecycle is missing.");
if (!app.includes("createPwaManager") || !app.includes("check-updates")) failures.push("PWA install/update controls are not wired.");

if (failures.length) {
  console.error("Foundation validation failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log(`Foundation validation passed: ${requiredFiles.length} files, install icons, manifest and update lifecycle verified.`);
}
