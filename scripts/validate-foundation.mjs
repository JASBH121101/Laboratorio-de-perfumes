import { access, readFile } from "node:fs/promises";
import { resolve } from "node:path";

const requiredFiles = [
  "index.html", "manifest.webmanifest", "sw.js", "assets/icon.svg",
  "src/css/styles.css", "src/js/app.js", "src/js/core/navigation.js", "src/js/ui/views.js"
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

if (!packageJson.scripts?.test || !packageJson.scripts?.validate) failures.push("Missing test or validate npm script.");
if (manifest.start_url !== "./" || manifest.scope !== "./") failures.push("PWA paths must be relative for GitHub Pages project sites.");
if (!manifest.icons?.some((icon) => icon.src === "./assets/icon.svg")) failures.push("PWA manifest does not reference the app icon.");
if (!html.includes('type="module"') || !html.includes("./src/js/app.js")) failures.push("HTML application module entrypoint is missing.");
if (!sw.includes("./src/js/ui/views.js") || !sw.includes('self.addEventListener("fetch"')) failures.push("Service worker cache or fetch handler is missing.");

if (failures.length) {
  console.error("Foundation validation failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log(`Foundation validation passed: ${requiredFiles.length} required files and PWA entrypoints verified.`);
}
