import * as THREE from "three";

function drawLightCard(context, x, y, width, height, color) {
  const glow = context.createRadialGradient(
    x + width / 2,
    y + height / 2,
    width * 0.06,
    x + width / 2,
    y + height / 2,
    width * 0.9
  );
  glow.addColorStop(0, color);
  glow.addColorStop(1, "rgba(255, 220, 180, 0)");
  context.fillStyle = glow;
  context.fillRect(x - width * 0.6, y - height, width * 2.2, height * 3);
  const card = context.createLinearGradient(x, y, x + width, y);
  card.addColorStop(0, "rgba(255, 225, 190, 0.02)");
  card.addColorStop(0.5, color);
  card.addColorStop(1, "rgba(255, 225, 190, 0.04)");
  context.fillStyle = card;
  context.fillRect(x, y, width, height);
}

function createPanoramaCanvas(size) {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size / 2;
  const context = canvas.getContext("2d", { alpha: false });
  if (!context) return null;

  const width = canvas.width;
  const height = canvas.height;
  const horizon = context.createLinearGradient(0, 0, 0, height);
  horizon.addColorStop(0, "#17141c");
  horizon.addColorStop(0.28, "#30242c");
  horizon.addColorStop(0.54, "#66574e");
  horizon.addColorStop(0.78, "#40333a");
  horizon.addColorStop(1, "#1e1921");
  context.fillStyle = horizon;
  context.fillRect(0, 0, width, height);

  // Broad, soft light cards become subtle reflections on glass and brass.
  drawLightCard(context, width * 0.15, height * 0.22, width * 0.115, height * 0.42, "rgba(255, 224, 190, 0.82)");
  drawLightCard(context, width * 0.57, height * 0.13, width * 0.21, height * 0.12, "rgba(245, 218, 185, 0.5)");
  drawLightCard(context, width * 0.82, height * 0.34, width * 0.055, height * 0.31, "rgba(194, 214, 222, 0.48)");

  const lowBounce = context.createLinearGradient(0, height * 0.55, 0, height);
  lowBounce.addColorStop(0, "rgba(202, 160, 115, 0)");
  lowBounce.addColorStop(1, "rgba(190, 146, 112, 0.18)");
  context.fillStyle = lowBounce;
  context.fillRect(0, height * 0.55, width, height * 0.45);

  // Low-contrast vertical bands suggest distant walls without becoming geometry.
  for (let index = 0; index < 10; index += 1) {
    const x = (index / 10) * width;
    const band = context.createLinearGradient(x, 0, x + width * 0.025, 0);
    band.addColorStop(0, "rgba(15, 12, 17, 0)");
    band.addColorStop(0.5, index % 2 === 0 ? "rgba(20, 15, 21, 0.11)" : "rgba(224, 183, 140, 0.045)");
    band.addColorStop(1, "rgba(15, 12, 17, 0)");
    context.fillStyle = band;
    context.fillRect(x, 0, width * 0.025, height);
  }

  return canvas;
}

/**
 * Builds one local equirectangular panorama and a PMREM reflection map.
 * No HDRI is fetched and no remote rendering service is required.
 */
export function createAtelierEnvironment(renderer, scene, { textureSize = 256 } = {}) {
  const size = textureSize >= 512 ? 512 : 256;
  const canvas = createPanoramaCanvas(size);
  if (!canvas) return { dispose() {} };

  const texture = new THREE.CanvasTexture(canvas);
  texture.mapping = THREE.EquirectangularReflectionMapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;
  texture.needsUpdate = true;

  let reflectionTarget = null;
  let generator = null;
  try {
    generator = new THREE.PMREMGenerator(renderer);
    generator.compileEquirectangularShader();
    reflectionTarget = generator.fromEquirectangular(texture);
    scene.environment = reflectionTarget.texture;
  } catch (error) {
    // The panorama remains a usable, inexpensive environment fallback.
    scene.environment = texture;
    console.warn("No se pudo generar PMREM; se usa el panorama local:", error);
  } finally {
    generator?.dispose();
  }

  scene.background = texture;
  scene.environmentIntensity = 0.62;
  scene.backgroundIntensity = 0.78;
  scene.fog = new THREE.Fog(0x241d25, 13, 25);

  let disposed = false;
  return {
    dispose() {
      if (disposed) return;
      disposed = true;
      if (scene.environment === reflectionTarget?.texture || scene.environment === texture) {
        scene.environment = null;
      }
      if (scene.background === texture) scene.background = null;
      reflectionTarget?.dispose();
      texture.dispose();
    }
  };
}
