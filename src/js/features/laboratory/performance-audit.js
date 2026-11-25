export const LAB_PERFORMANCE_AUDIT_DURATION_MS = 2200;
export const LAB_PERFORMANCE_TARGETS = Object.freeze({
  "mobile-lite": 30,
  "mobile-standard": 45,
  "desktop-high": 60
});

export function getLabPerformanceTarget(profileId) {
  return LAB_PERFORMANCE_TARGETS[profileId] ?? LAB_PERFORMANCE_TARGETS["mobile-lite"];
}

export function summarizeFrameSamples(samples = []) {
  const valid = samples.filter((value) => Number.isFinite(value) && value > 0).sort((a, b) => a - b);
  if (!valid.length) {
    return {
      frameCount: 0,
      averageFrameMs: null,
      averageFps: null,
      p95FrameMs: null,
      slowFramePercent: null,
      longestFrameMs: null
    };
  }

  const total = valid.reduce((sum, value) => sum + value, 0);
  const averageFrameMs = total / valid.length;
  const p95Index = Math.min(valid.length - 1, Math.ceil(valid.length * 0.95) - 1);
  const slowFrames = valid.filter((value) => value > 33.333).length;

  return {
    frameCount: valid.length,
    averageFrameMs,
    averageFps: 1000 / averageFrameMs,
    p95FrameMs: valid[p95Index],
    slowFramePercent: (slowFrames / valid.length) * 100,
    longestFrameMs: valid[valid.length - 1]
  };
}

export function createLabPerformanceReport({
  profileId = "mobile-lite",
  frameIntervals = [],
  renderStats = {},
  device = {},
  canvas = {},
  durationMs = LAB_PERFORMANCE_AUDIT_DURATION_MS,
  status = "completed"
} = {}) {
  const summary = summarizeFrameSamples(frameIntervals);
  const targetFps = getLabPerformanceTarget(profileId);
  const evaluation = status !== "completed" || summary.frameCount < 30
    ? "incomplete"
    : summary.averageFps >= targetFps ? "target-met" : "below-target";
  const renderedFrames = summary.frameCount + (summary.frameCount ? 1 : 0);

  return {
    status,
    evaluation,
    profileId,
    targetFps,
    durationMs,
    ...summary,
    render: {
      callsPerFrame: renderedFrames ? (renderStats.calls ?? 0) / renderedFrames : null,
      trianglesPerFrame: renderedFrames ? (renderStats.triangles ?? 0) / renderedFrames : null,
      geometries: renderStats.geometries ?? null,
      textures: renderStats.textures ?? null,
      contextLost: Boolean(renderStats.contextLost)
    },
    device: {
      deviceMemoryGb: Number.isFinite(device.deviceMemoryGb) ? device.deviceMemoryGb : null,
      hardwareConcurrency: Number.isFinite(device.hardwareConcurrency) ? device.hardwareConcurrency : null,
      devicePixelRatio: Number.isFinite(device.devicePixelRatio) ? device.devicePixelRatio : null,
      maxTextureSize: Number.isFinite(device.maxTextureSize) ? device.maxTextureSize : null,
      isMobile: Boolean(device.isMobile)
    },
    canvas: {
      width: Number.isFinite(canvas.width) ? canvas.width : null,
      height: Number.isFinite(canvas.height) ? canvas.height : null,
      cssWidth: Number.isFinite(canvas.cssWidth) ? canvas.cssWidth : null,
      cssHeight: Number.isFinite(canvas.cssHeight) ? canvas.cssHeight : null
    }
  };
}

export function formatLabPerformanceReport(report) {
  const number = (value, digits = 1) => Number.isFinite(value) ? value.toFixed(digits) : "No disponible";
  const statusText = report.status === "completed"
    ? report.evaluation === "target-met" ? "Objetivo de FPS alcanzado en esta medición" : report.evaluation === "below-target" ? "Por debajo del objetivo de FPS" : "Medición incompleta"
    : report.status === "interrupted" ? "Medición interrumpida" : "Medición incompleta";
  const lines = [
    "DIAGNÓSTICO LOCAL DEL LABORATORIO 3D",
    `Estado: ${statusText}`,
    `Perfil gráfico: ${report.profileId}`,
    `FPS observados (promedio): ${number(report.averageFps)} · objetivo orientativo: ${report.targetFps}`,
    `Tiempo de cuadro promedio: ${number(report.averageFrameMs)} ms`,
    `Tiempo de cuadro P95: ${number(report.p95FrameMs)} ms`,
    `Cuadros superiores a 33.3 ms: ${number(report.slowFramePercent)}%`,
    `Cuadros registrados: ${report.frameCount}`,
    `Draw calls por cuadro: ${number(report.render.callsPerFrame, 2)}`,
    `Triángulos por cuadro: ${number(report.render.trianglesPerFrame, 0)}`,
    `Geometrías / texturas activas: ${report.render.geometries ?? "N/D"} / ${report.render.textures ?? "N/D"}`,
    `Canvas (buffer): ${report.canvas.width ?? "N/D"} × ${report.canvas.height ?? "N/D"} px`,
    `DPR / límite de textura GPU: ${number(report.device.devicePixelRatio, 2)} / ${report.device.maxTextureSize ?? "N/D"}`,
    `Memoria reportada / núcleos lógicos: ${report.device.deviceMemoryGb ?? "N/D"} GB / ${report.device.hardwareConcurrency ?? "N/D"}`,
    `Contexto WebGL perdido: ${report.render.contextLost ? "Sí" : "No"}`,
    "",
    "LÍMITES: es una prueba corta y voluntaria de cadencia requestAnimationFrame con renderizado activo. No mide temperatura, consumo de batería, memoria GPU en bytes ni degradación térmica sostenida. Repetí la prueba en el dispositivo real y revisá visualmente la escena."
  ];
  return lines.join("\n");
}

export function runLaboratoryPerformanceAudit({
  renderer,
  scene,
  camera,
  profile,
  device = {},
  durationMs = LAB_PERFORMANCE_AUDIT_DURATION_MS,
  signal,
  requestFrame = (callback) => globalThis.requestAnimationFrame(callback),
  cancelFrame = (id) => globalThis.cancelAnimationFrame(id),
  now = () => globalThis.performance.now(),
  isHidden = () => globalThis.document?.hidden === true,
  onVisibilityChange = (handler) => globalThis.document?.addEventListener("visibilitychange", handler),
  removeVisibilityChange = (handler) => globalThis.document?.removeEventListener("visibilitychange", handler)
} = {}) {
  if (!renderer || !scene || !camera || typeof renderer.render !== "function") {
    return Promise.reject(new TypeError("Faltan recursos del renderizador para medir el laboratorio."));
  }

  const originalAutoReset = renderer.info.autoReset;
  const intervals = [];
  let previousTimestamp = null;
  let startedAt = now();
  let frameId = 0;
  let settled = false;

  return new Promise((resolve) => {
    const cleanup = () => {
      if (frameId) cancelFrame(frameId);
      removeVisibilityChange(handleVisibilityChange);
      signal?.removeEventListener("abort", handleAbort);
      renderer.info.autoReset = originalAutoReset;
      renderer.info.reset?.();
    };

    const finish = (status) => {
      if (settled) return;
      settled = true;
      const elapsed = Math.max(0, now() - startedAt);
      const stats = renderer.info;
      const contextLost = renderer.getContext?.().isContextLost?.() ?? false;
      const report = createLabPerformanceReport({
        profileId: profile?.id ?? "mobile-lite",
        frameIntervals: intervals,
        renderStats: {
          calls: stats.render?.calls ?? 0,
          triangles: stats.render?.triangles ?? 0,
          geometries: stats.memory?.geometries ?? 0,
          textures: stats.memory?.textures ?? 0,
          contextLost
        },
        device: {
          ...device,
          devicePixelRatio: device.devicePixelRatio,
          maxTextureSize: renderer.capabilities?.maxTextureSize ?? device.maxTextureSize
        },
        canvas: {
          width: renderer.domElement?.width,
          height: renderer.domElement?.height,
          cssWidth: renderer.domElement?.clientWidth,
          cssHeight: renderer.domElement?.clientHeight
        },
        durationMs: elapsed || durationMs,
        status: contextLost ? "context-lost" : status
      });
      cleanup();
      resolve(report);
    };

    const handleVisibilityChange = () => {
      if (isHidden()) finish("interrupted");
    };
    const handleAbort = () => finish("interrupted");

    if (signal?.aborted || isHidden()) {
      finish("interrupted");
      return;
    }

    renderer.info.reset?.();
    renderer.info.autoReset = false;
    onVisibilityChange(handleVisibilityChange);
    signal?.addEventListener("abort", handleAbort, { once: true });

    const frame = (timestamp) => {
      if (settled) return;
      if (signal?.aborted || isHidden()) {
        finish("interrupted");
        return;
      }
      if (previousTimestamp !== null) intervals.push(timestamp - previousTimestamp);
      previousTimestamp = timestamp;
      renderer.render(scene, camera);
      if (timestamp - startedAt >= durationMs) finish("completed");
      else frameId = requestFrame(frame);
    };

    startedAt = now();
    frameId = requestFrame(frame);
  });
}
