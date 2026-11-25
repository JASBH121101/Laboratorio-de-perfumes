export function isPwaInstalled(displayMode = "", legacyStandalone = false) {
  return displayMode === "standalone" || displayMode === "fullscreen" || legacyStandalone === true;
}

export function createPwaManager({ onInstallState = () => {}, onUpdateAvailable = () => {}, onNotice = () => {} } = {}) {
  let deferredInstallPrompt = null;
  let registration = null;
  let updateRequested = false;
  let updateAnnounced = false;
  let lastUpdateCheck = 0;

  function isInstalled() {
    const standalone = window.matchMedia?.("(display-mode: standalone)").matches ?? false;
    const fullscreen = window.matchMedia?.("(display-mode: fullscreen)").matches ?? false;
    return isPwaInstalled(standalone ? "standalone" : fullscreen ? "fullscreen" : "", navigator.standalone === true);
  }

  function announceUpdate() {
    if (updateAnnounced) return;
    updateAnnounced = true;
    onUpdateAvailable();
  }

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    onInstallState({ available: true, installed: false });
  });

  window.addEventListener("appinstalled", () => {
    deferredInstallPrompt = null;
    onInstallState({ available: false, installed: true });
    onNotice({ title: "Aplicación instalada", message: "JB Virtual Perfume Lab ya está en tu pantalla de aplicaciones." });
  });

  window.matchMedia?.("(display-mode: standalone)").addEventListener?.("change", () => {
    onInstallState({ available: Boolean(deferredInstallPrompt), installed: isInstalled() });
  });

  navigator.serviceWorker?.addEventListener("controllerchange", () => {
    if (!updateRequested) return;
    updateRequested = false;
    window.location.reload();
  });

  async function init() {
    if (!("serviceWorker" in navigator) || window.location.protocol === "file:") {
      onInstallState({ available: false, installed: isInstalled() });
      return;
    }

    try {
      registration = await navigator.serviceWorker.register("./sw.js", { updateViaCache: "none" });
      registration.addEventListener("updatefound", () => {
        const installing = registration.installing;
        installing?.addEventListener("statechange", () => {
          if (installing.state === "installed" && navigator.serviceWorker.controller) announceUpdate();
        });
      });

      if (registration.waiting && navigator.serviceWorker.controller) announceUpdate();
      onInstallState({ available: Boolean(deferredInstallPrompt), installed: isInstalled() });
      await checkForUpdates({ silent: true });
    } catch (error) {
      console.warn("No se pudo registrar el service worker:", error);
      onInstallState({ available: false, installed: isInstalled() });
    }

    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") checkForUpdates({ silent: true });
    });
    window.addEventListener("focus", () => checkForUpdates({ silent: true }));
  }

  async function install() {
    if (isInstalled()) {
      onNotice({ title: "Ya está instalada", message: "Abriste JB Virtual Perfume Lab desde su aplicación instalada." });
      return;
    }

    if (!deferredInstallPrompt) {
      onNotice({
        title: "Instalar JB Atelier en Android",
        message: "En Chrome, abre el menú ⋮ y selecciona «Instalar aplicación» o «Añadir a pantalla principal». La opción aparece cuando el navegador considera que el sitio cumple los requisitos de instalación."
      });
      return;
    }

    const promptEvent = deferredInstallPrompt;
    deferredInstallPrompt = null;
    onInstallState({ available: false, installed: false });
    try {
      await promptEvent.prompt();
      const choice = await promptEvent.userChoice;
      if (choice?.outcome === "accepted") {
        onNotice({ title: "Instalación iniciada", message: "Completa la confirmación de Android para agregar la aplicación." });
      } else {
        onNotice({ title: "Instalación cancelada", message: "Podés instalarla más adelante desde este mismo botón." });
      }
    } catch (error) {
      console.warn("No se pudo abrir el diálogo de instalación:", error);
      onNotice({ title: "Instalación manual", message: "Abre el menú ⋮ de Chrome y selecciona «Instalar aplicación» o «Añadir a pantalla principal»." });
    }
  }

  async function checkForUpdates({ silent = false } = {}) {
    if (!registration) return;
    const now = Date.now();
    if (silent && now - lastUpdateCheck < 120000) return;
    lastUpdateCheck = now;
    try {
      await registration.update();
      if (registration.waiting && navigator.serviceWorker.controller) {
        announceUpdate();
      } else if (!silent && !registration.installing) {
        onNotice({ title: "Está todo actualizado", message: "Estás usando la versión más reciente disponible." });
      } else if (!silent && registration.installing) {
        onNotice({ title: "Buscando actualización", message: "Se está descargando una versión nueva. Te avisaremos cuando esté lista." });
      }
    } catch (error) {
      if (!silent) onNotice({ title: "No se pudo comprobar", message: "Revisa tu conexión e inténtalo nuevamente." });
      console.warn("Falló la comprobación de actualizaciones:", error);
    }
  }

  async function applyUpdate() {
    if (!registration) return;
    const waitingWorker = registration.waiting;
    if (!waitingWorker) {
      updateAnnounced = false;
      await checkForUpdates();
      return;
    }
    updateRequested = true;
    waitingWorker.postMessage({ type: "SKIP_WAITING" });
  }

  return { init, install, checkForUpdates, applyUpdate, isInstalled };
}
