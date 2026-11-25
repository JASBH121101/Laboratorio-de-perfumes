import * as THREE from "three";

function makeCanvas(size, background) {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d", { alpha: false });
  if (!context) return null;
  context.fillStyle = background;
  context.fillRect(0, 0, size, size);
  return { canvas, context };
}

function createTexture(canvas, { anisotropy = 1, repeatX = 1, repeatY = 1, colorMap = false } = {}) {
  if (!canvas) return null;
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(repeatX, repeatY);
  texture.anisotropy = Math.max(1, anisotropy);
  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.generateMipmaps = true;
  if (colorMap) texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

function createWoodMaps(size, anisotropy) {
  const colorSource = makeCanvas(size, "#49362F");
  const bumpSource = makeCanvas(size, "#777777");
  if (!colorSource || !bumpSource) return { color: null, bump: null };

  const { context: colorContext } = colorSource;
  const { context: bumpContext } = bumpSource;
  const gradient = colorContext.createLinearGradient(0, 0, 0, size);
  gradient.addColorStop(0, "#5B4539");
  gradient.addColorStop(0.28, "#49362F");
  gradient.addColorStop(0.55, "#60483A");
  gradient.addColorStop(0.78, "#3F302B");
  gradient.addColorStop(1, "#584033");
  colorContext.fillStyle = gradient;
  colorContext.fillRect(0, 0, size, size);

  for (let index = 0; index < 42; index += 1) {
    const y = (index / 42) * size;
    const sway = 2 + (index % 5) * 1.7;
    colorContext.beginPath();
    colorContext.moveTo(0, y);
    colorContext.bezierCurveTo(size * 0.28, y + sway, size * 0.64, y - sway * 1.4, size, y + sway * 0.4);
    colorContext.strokeStyle = index % 4 === 0 ? "rgba(20,12,10,.24)" : "rgba(220,178,135,.10)";
    colorContext.lineWidth = index % 6 === 0 ? 2 : 1;
    colorContext.stroke();

    bumpContext.beginPath();
    bumpContext.moveTo(0, y);
    bumpContext.bezierCurveTo(size * 0.28, y + sway, size * 0.64, y - sway * 1.4, size, y + sway * 0.4);
    bumpContext.strokeStyle = index % 3 === 0 ? "#686868" : "#929292";
    bumpContext.lineWidth = index % 6 === 0 ? 2 : 1;
    bumpContext.stroke();
  }

  for (let index = 0; index < 5; index += 1) {
    const x = ((index * 73) % size) * 0.78 + size * 0.08;
    const y = ((index * 47) % size) * 0.8 + size * 0.06;
    colorContext.beginPath();
    colorContext.ellipse(x, y, 9 + (index % 3) * 4, 3 + (index % 2) * 2, 0.18, 0, Math.PI * 2);
    colorContext.strokeStyle = "rgba(23,14,11,.28)";
    colorContext.lineWidth = 2;
    colorContext.stroke();
    bumpContext.beginPath();
    bumpContext.ellipse(x, y, 9 + (index % 3) * 4, 3 + (index % 2) * 2, 0.18, 0, Math.PI * 2);
    bumpContext.strokeStyle = "#555555";
    bumpContext.lineWidth = 2;
    bumpContext.stroke();
  }

  return {
    color: createTexture(colorSource.canvas, { anisotropy, repeatX: 2.6, repeatY: 1, colorMap: true }),
    bump: createTexture(bumpSource.canvas, { anisotropy, repeatX: 2.6, repeatY: 1 })
  };
}

function createStoneMaps(size, anisotropy) {
  const colorSource = makeCanvas(size, "#A99A88");
  const bumpSource = makeCanvas(size, "#858585");
  if (!colorSource || !bumpSource) return { color: null, bump: null };

  const { context: colorContext } = colorSource;
  const { context: bumpContext } = bumpSource;
  const gradient = colorContext.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, "#B9AB99");
  gradient.addColorStop(0.5, "#A99A88");
  gradient.addColorStop(1, "#958777");
  colorContext.fillStyle = gradient;
  colorContext.fillRect(0, 0, size, size);

  for (let index = 0; index < 90; index += 1) {
    const x = (index * 47) % size;
    const y = (index * 83) % size;
    const radius = 1 + (index % 4);
    colorContext.beginPath();
    colorContext.ellipse(x, y, radius * 1.8, radius, (index % 7) * 0.22, 0, Math.PI * 2);
    colorContext.fillStyle = index % 3 === 0 ? "rgba(67,55,44,.10)" : "rgba(248,239,222,.16)";
    colorContext.fill();
    bumpContext.beginPath();
    bumpContext.ellipse(x, y, radius * 1.8, radius, (index % 7) * 0.22, 0, Math.PI * 2);
    bumpContext.fillStyle = index % 3 === 0 ? "#707070" : "#999999";
    bumpContext.fill();
  }

  for (let index = 0; index < 7; index += 1) {
    const y = (index * 37) % size;
    colorContext.beginPath();
    colorContext.moveTo(0, y);
    colorContext.bezierCurveTo(size * 0.3, y - 8, size * 0.7, y + 9, size, y + 2);
    colorContext.strokeStyle = "rgba(83,69,55,.10)";
    colorContext.lineWidth = 1.2;
    colorContext.stroke();
    bumpContext.beginPath();
    bumpContext.moveTo(0, y);
    bumpContext.bezierCurveTo(size * 0.3, y - 8, size * 0.7, y + 9, size, y + 2);
    bumpContext.strokeStyle = "#737373";
    bumpContext.lineWidth = 1.2;
    bumpContext.stroke();
  }

  return {
    color: createTexture(colorSource.canvas, { anisotropy, repeatX: 2.7, repeatY: 2, colorMap: true }),
    bump: createTexture(bumpSource.canvas, { anisotropy, repeatX: 2.7, repeatY: 2 })
  };
}

function createBrushedBrassMaps(size, anisotropy) {
  const colorSource = makeCanvas(size, "#D0B07A");
  const roughnessSource = makeCanvas(size, "#8A8A8A");
  if (!colorSource || !roughnessSource) return { color: null, roughness: null };

  const { context: colorContext } = colorSource;
  const { context: roughnessContext } = roughnessSource;
  const gradient = colorContext.createLinearGradient(0, 0, size, 0);
  gradient.addColorStop(0, "#A87C4D");
  gradient.addColorStop(0.32, "#D3B27C");
  gradient.addColorStop(0.68, "#B48C5B");
  gradient.addColorStop(1, "#E0C18C");
  colorContext.fillStyle = gradient;
  colorContext.fillRect(0, 0, size, size);

  for (let y = 0; y < size; y += 3) {
    const variation = y % 9 === 0 ? 0.2 : 0.08;
    colorContext.fillStyle = `rgba(255,244,219,${variation})`;
    colorContext.fillRect(0, y, size, 1);
    roughnessContext.fillStyle = y % 6 === 0 ? "#666666" : "#999999";
    roughnessContext.fillRect(0, y, size, 1);
  }

  return {
    color: createTexture(colorSource.canvas, { anisotropy, repeatX: 2, repeatY: 1, colorMap: true }),
    roughness: createTexture(roughnessSource.canvas, { anisotropy, repeatX: 2, repeatY: 1 })
  };
}

export function createAtelierMaterials({ maxAnisotropy = 1, textureSize = 256 } = {}) {
  const anisotropy = THREE.MathUtils.clamp(Math.floor(maxAnisotropy) || 1, 1, 8);
  const size = textureSize >= 512 ? 512 : 256;
  const woodMaps = createWoodMaps(size, anisotropy);
  const stoneMaps = createStoneMaps(size, anisotropy);
  const brassMaps = createBrushedBrassMaps(size, anisotropy);

  const walnut = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: woodMaps.color || null,
    bumpMap: woodMaps.bump || null,
    bumpScale: 0.018,
    roughness: 0.7,
    metalness: 0.02
  });
  const darkWalnut = new THREE.MeshStandardMaterial({
    color: 0x756056,
    map: woodMaps.color || null,
    bumpMap: woodMaps.bump || null,
    bumpScale: 0.014,
    roughness: 0.64,
    metalness: 0.025
  });
  const stone = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: stoneMaps.color || null,
    bumpMap: stoneMaps.bump || null,
    bumpScale: 0.026,
    roughness: 0.91,
    metalness: 0
  });
  const counterstone = new THREE.MeshStandardMaterial({
    color: 0x8f8177,
    map: stoneMaps.color || null,
    bumpMap: stoneMaps.bump || null,
    bumpScale: 0.018,
    roughness: 0.78,
    metalness: 0.015
  });
  const brass = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: brassMaps.color || null,
    roughnessMap: brassMaps.roughness || null,
    metalness: 0.78,
    roughness: 0.34
  });
  const wall = new THREE.MeshStandardMaterial({
    color: 0x302630,
    roughness: 0.88,
    metalness: 0.01
  });
  const lacquer = new THREE.MeshPhysicalMaterial({
    color: 0x563541,
    roughness: 0.31,
    metalness: 0.08,
    clearcoat: 0.38,
    clearcoatRoughness: 0.26
  });
  const bottleGlass = new THREE.MeshPhysicalMaterial({
    color: 0xc6d8d4,
    roughness: 0.14,
    metalness: 0.015,
    transmission: 0.28,
    thickness: 0.22,
    transparent: true,
    opacity: 0.76,
    clearcoat: 0.82,
    clearcoatRoughness: 0.11
  });
  const windowGlass = new THREE.MeshPhysicalMaterial({
    color: 0xc6d8d4,
    roughness: 0.16,
    metalness: 0,
    transmission: 0.16,
    thickness: 0.08,
    transparent: true,
    opacity: 0.3,
    side: THREE.DoubleSide
  });

  return Object.freeze({
    walnut,
    darkWalnut,
    stone,
    counterstone,
    brass,
    wall,
    lacquer,
    bottleGlass,
    windowGlass
  });
}
