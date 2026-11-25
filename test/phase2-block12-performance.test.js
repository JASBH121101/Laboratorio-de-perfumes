import test from "node:test";
import assert from "node:assert/strict";
import {
  createLabPerformanceReport,
  formatLabPerformanceReport,
  getLabPerformanceTarget,
  runLaboratoryPerformanceAudit,
  summarizeFrameSamples
} from "../src/js/features/laboratory/performance-audit.js";

test("frame summary ignores invalid samples and reports mean, P95 and slow-frame ratio", () => {
  const summary = summarizeFrameSamples([16, 17, 40, 0, NaN, -5]);
  assert.equal(summary.frameCount, 3);
  assert.ok(Math.abs(summary.averageFrameMs - (73 / 3)) < 0.001);
  assert.ok(Math.abs(summary.averageFps - (1000 / (73 / 3))) < 0.01);
  assert.equal(summary.p95FrameMs, 40);
  assert.ok(Math.abs(summary.slowFramePercent - (100 / 3)) < 0.01);
  assert.equal(summary.longestFrameMs, 40);
});

test("quality tier targets match the documented Lite, Standard and Desktop targets", () => {
  assert.equal(getLabPerformanceTarget("mobile-lite"), 30);
  assert.equal(getLabPerformanceTarget("mobile-standard"), 45);
  assert.equal(getLabPerformanceTarget("desktop-high"), 60);
  assert.equal(getLabPerformanceTarget("unknown-tier"), 30);
});

test("report differentiates a short-run target result from a physical certification", () => {
  const report = createLabPerformanceReport({
    profileId: "mobile-standard",
    frameIntervals: Array.from({ length: 40 }, () => 16.7),
    renderStats: { calls: 80, triangles: 40000, geometries: 25, textures: 12 },
    device: { isMobile: true, deviceMemoryGb: 8, hardwareConcurrency: 8, devicePixelRatio: 2, maxTextureSize: 4096 },
    canvas: { width: 1080, height: 1920, cssWidth: 540, cssHeight: 960 }
  });
  assert.equal(report.evaluation, "target-met");
  assert.equal(report.render.callsPerFrame, 2);
  assert.equal(report.render.trianglesPerFrame, 1000);
  assert.equal(report.render.geometries, 25);
  assert.equal(report.canvas.width, 1080);
  const output = formatLabPerformanceReport(report);
  assert.match(output, /FPS observados/);
  assert.match(output, /P95/);
  assert.match(output, /No mide temperatura/);
  assert.match(output, /batería/);
});

test("short or interrupted samples are not marked as meeting the target", () => {
  const report = createLabPerformanceReport({
    profileId: "mobile-lite",
    frameIntervals: [16, 16, 17],
    status: "interrupted"
  });
  assert.equal(report.evaluation, "incomplete");
  assert.match(formatLabPerformanceReport(report), /interrumpida/);
});

test("active audit restores renderer counters and stops when aborted", async () => {
  let currentTime = 0;
  let nextFrameId = 0;
  const pending = [];
  const removedListeners = [];
  const renderer = {
    info: {
      autoReset: true,
      render: { calls: 0, triangles: 0 },
      memory: { geometries: 3, textures: 2 },
      reset() {}
    },
    capabilities: { maxTextureSize: 4096 },
    domElement: { width: 640, height: 480, clientWidth: 320, clientHeight: 240 },
    render() { this.info.render.calls += 1; this.info.render.triangles += 300; },
    getContext() { return { isContextLost: () => false }; }
  };
  const controller = new AbortController();
  const resultPromise = runLaboratoryPerformanceAudit({
    renderer,
    scene: {},
    camera: {},
    profile: { id: "mobile-lite" },
    durationMs: 48,
    signal: controller.signal,
    now: () => currentTime,
    requestFrame(callback) { pending.push(callback); return ++nextFrameId; },
    cancelFrame() {},
    isHidden: () => false,
    onVisibilityChange() {},
    removeVisibilityChange(listener) { removedListeners.push(listener); }
  });
  while (pending.length) {
    const callback = pending.shift();
    currentTime += 16;
    callback(currentTime);
    if (currentTime >= 48) break;
  }
  const report = await resultPromise;
  assert.equal(report.status, "completed");
  assert.equal(renderer.info.autoReset, true);
  assert.equal(report.render.geometries, 3);
  assert.ok(renderer.info.render.calls >= 0);
  assert.equal(removedListeners.length, 1);
});

test("audit rejects incomplete renderer inputs", async () => {
  await assert.rejects(
    runLaboratoryPerformanceAudit({ renderer: null, scene: {}, camera: {} }),
    TypeError
  );
});
