import { resolveView } from "./core/navigation.js";
import { renderPage } from "./ui/views.js";

const appRoot = document.querySelector("#app");

function render() {
  const activeView = resolveView(window.location.hash);
  appRoot.innerHTML = renderPage(activeView);
}

appRoot.addEventListener("click", (event) => {
  const navTarget = event.target.closest("[data-nav]");
  if (navTarget) {
    event.preventDefault();
    const target = navTarget.getAttribute("data-nav");
    window.location.hash = target === "home" ? "#home" : `#${target}`;
    return;
  }

  const action = event.target.closest("[data-action='theme']");
  if (action) {
    const nextTheme = document.documentElement.dataset.theme === "light" ? "dark" : "light";
    document.documentElement.dataset.theme = nextTheme;
    try {
      localStorage.setItem("jb-vpl-theme", nextTheme);
    } catch {
      // Theme remains usable when browser storage is unavailable.
    }
  }
});

window.addEventListener("hashchange", render);

try {
  const savedTheme = localStorage.getItem("jb-vpl-theme");
  if (savedTheme === "light" || savedTheme === "dark") {
    document.documentElement.dataset.theme = savedTheme;
  }
} catch {
  // Use the default theme when browser storage is unavailable.
}

render();

if ("serviceWorker" in navigator && window.location.protocol !== "file:") {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch((error) => {
      console.warn("PWA service worker registration failed:", error);
    });
  });
}
