const DISMISSED_UPDATE_KEY = "jb-vpl-dismissed-waiting-update-v1";

export function isPwaInstalled(displayMode = "", legacyStandalone = false) {
  return displayMode === "standalone" || displayMode === "fullscreen" || legacyStandalone === true;
}

export function shouldAnnounceUpdate({
  waiting = false,
  controlled = false,
  silent = true,
  alreadyAnnounced = false,
  dismissed = false
} = {}) {
  if (!waiting || !controlled) return false;
  return silent ? !alreadyAnnounced && !dismissed : true;
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

  function isDismissedUpdate() {
    try { return localStorage.getItem(DISMISSED_UPDATE_KEY) === "waiting"; }
    catch { return false; }
  }

  function clearDismissedUpdate() {
    try { localStorage.removeItem(DISMISSED_UPDATE_KEY); }
    catch { /* Update lifecycle still works for this tab. */ }
  }

  function announceWaitingUpdate({ force = false } = {}) {
    const waiting = Boolean(registration?.waiting);
    const controlled = Boolean(navigator.serviceWorker?.controller);
    const dismissed = !force && isDismissedUpdate();
    if (!shouldAnnounceUpdate({ waiting, controlled, silent: true, alreadyAnnounced: updateAnnounced, dismissed })) return false;
    updateAnnounced = true;
    onUpdateAvailable();
    return true;
  }

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    onInstallState({ available: true, installed: false });
  });

  window.addEventListener("appinstalled", () => {
    deferredInstallPrompt = null;
    onInstallState({ available: false, installed: true });
    onNotice({ title: "Aplicación instalada", message: "JB Perfume Lab ya está en tu pantalla de aplicaciones." });
  });

  window.matchMedia?.("(display-mode: standalone)").addEventListener?.("change", () => {
    onInstallState({ available: Boolean(deferredInstallPrompt), installed: isInstalled() });
  });

  navigator.serviceWorker?.addEventListener("controllerchange", () => {
    if (!updateRequested) return;
    updateRequested = false;
    clearDismissedUpdate();
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
        // A new installing worker represents a new release cycle, so a prior
        // dismissal must not hide this genuinely new update.
        updateAnnounced = false;
        clearDismissedUpdate();
        const installing = registration.installing;
        installing?.addEventListener("statechange", () => {
          if (installing.state === "installed" && navigator.serviceWorker.controller) {
            announceWaitingUpdate({ force: true });
          }
        });
      });

      if (registration.waiting && navigator.serviceWorker.controller) announceWaitingUpdate();
      else if (!registration.waiting) clearDismissedUpdate();

      onInstallState({ available: Boolean(deferredInstallPrompt), installed: isInstalled() });
      await checkForUpdates({ silent: true });
    } catch (error) {
      console.warn("No se pudo registrar el service worker:", error);
      onInstallState({ available: false, installed: isInstalled() });
    }
  }

  async function install() {
    if (isInstalled()) {
      onNotice({ title: "Ya está instalada", message: "Abriste JB Perfume Lab desde su aplicación instalada." });
      return;
    }

    if (!deferredInstallPrompt) {
      onNotice({
        title: "Instalar JB Perfume Lab en Android",
        message: "En Chrome, abre el menú ⋮ y selecciona «Instalar aplicación» o «Añadir a pantalla principal». La opción aparece cuando el navegador considera que el sitio cumple los requisitos."
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
      const waiting = Boolean(registration.waiting);
      const controlled = Boolean(navigator.serviceWorker.controller);
      if (waiting && controlled) {
        if (silent) announceWaitingUpdate();
        else {
          updateAnnounced = true;
          onUpdateAvailable();
        }
      } else if (!waiting) {
        updateAnnounced = false;
        clearDismissedUpdate();
        if (!silent) onNotice({ title: "Está todo actualizado", message: "Estás usando la versión más reciente disponible." });
      } else if (!silent && registration.installing) {
        onNotice({ title: "Buscando actualización", message: "Se está descargando una versión nueva. Te avisaremos cuando esté lista." });
      }
    } catch (error) {
      if (!silent) onNotice({ title: "No se pudo comprobar", message: "Revisa tu conexión e inténtalo nuevamente." });
      console.warn("Falló la comprobación de actualizaciones:", error);
    }
  }

  function dismissUpdateNotice() {
    if (!registration?.waiting) return;
    updateAnnounced = true;
    try { localStorage.setItem(DISMISSED_UPDATE_KEY, "waiting"); }
    catch { /* In-memory suppression remains active until this page closes. */ }
  }

  async function applyUpdate() {
    if (!registration) return;
    const waitingWorker = registration.waiting;
    if (!waitingWorker) {
      updateAnnounced = false;
      clearDismissedUpdate();
      await checkForUpdates({ silent: false });
      return;
    }
    updateRequested = true;
    waitingWorker.postMessage({ type: "SKIP_WAITING" });
  }

  return { init, install, checkForUpdates, applyUpdate, dismissUpdateNotice, isInstalled };
}
