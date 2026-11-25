import * as THREE from "three";
import { LAB_PROPS, LAB_RENDER_CONFIG } from "./catalog.js";
import { resolveLaboratoryRenderProfile } from "./render-profile.js";
import { ATELIER_ARCHITECTURE } from "./architecture.js";
import { getPerfumeLibraryItem } from "../perfume-library/library.js";

const color = (hex) => new THREE.Color(hex);

function makeLabelTexture(title, subtitle = "JB ATELIER") {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 256;
  const context = canvas.getContext("2d");
  if (!context) return null;

  context.fillStyle = "#211820";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.strokeStyle = "#d9b27c";
  context.lineWidth = 5;
  context.strokeRect(9, 9, canvas.width - 18, canvas.height - 18);
  context.textAlign = "center";
  context.fillStyle = "#d9b27c";
  context.font = "600 25px Georgia";
  context.fillText(subtitle, 256, 70);
  context.fillStyle = "#f5eee9";
  context.font = "600 39px Georgia";
  context.fillText(title.toUpperCase().slice(0, 20), 256, 145);
  context.fillStyle = "#b9a6ae";
  context.font = "500 17px Arial";
  context.fillText("PERFUMERÍA JB", 256, 194);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 1;
  return texture;
}

function labelPlane(title, width, height, z) {
  const texture = makeLabelTexture(title);
  const material = texture
    ? new THREE.MeshBasicMaterial({ map: texture, transparent: true, toneMapped: false })
    : new THREE.MeshBasicMaterial({ color: 0x30242d });
  const label = new THREE.Mesh(new THREE.PlaneGeometry(width, height), material);
  label.position.z = z;
  label.userData.ownsTexture = Boolean(texture);
  return label;
}

function createMainBottle(prop) {
  const group = new THREE.Group();
  const glass = new THREE.MeshPhysicalMaterial({
    color: 0xc7d8d5,
    roughness: 0.14,
    metalness: 0.04,
    transmission: 0.28,
    thickness: 0.36,
    transparent: true,
    opacity: 0.82,
    clearcoat: 0.75,
    clearcoatRoughness: 0.12
  });
  const liquid = new THREE.MeshStandardMaterial({
    color: color(prop.color),
    roughness: 0.28,
    metalness: 0.03,
    transparent: true,
    opacity: 0.82
  });
  const gold = new THREE.MeshStandardMaterial({ color: 0xc99a55, metalness: 0.78, roughness: 0.22 });
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.88, 1.08, 0.46), glass);
  body.position.y = 0.56;
  group.add(body);

  const inner = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.42, 0.13), liquid);
  inner.position.set(0, 0.28, 0);
  group.add(inner);

  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.2, 0.2, 24), glass);
  neck.position.y = 1.2;
  group.add(neck);

  const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.23, 0.23, 0.075, 24), gold);
  collar.position.y = 1.33;
  group.add(collar);

  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.19, 0.34, 24), gold);
  cap.position.y = 1.52;
  group.add(cap);

  const label = labelPlane("Atelier 001", 0.69, 0.34, 0.236);
  label.position.y = 0.58;
  group.add(label);

  return group;
}

function createVial(prop) {
  const group = new THREE.Group();
  const glass = new THREE.MeshPhysicalMaterial({
    color: 0xd5e0dc,
    roughness: 0.17,
    metalness: 0.02,
    transmission: 0.18,
    thickness: 0.22,
    transparent: true,
    opacity: 0.76,
    clearcoat: 0.65
  });
  const liquid = new THREE.MeshStandardMaterial({
    color: color(prop.color),
    roughness: 0.3,
    transparent: true,
    opacity: 0.8
  });
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.21, 0.57, 20), glass);
  body.position.y = 0.3;
  group.add(body);

  const contents = new THREE.Mesh(new THREE.CylinderGeometry(0.165, 0.185, 0.24, 20), liquid);
  contents.position.y = 0.16;
  group.add(contents);

  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.095, 0.12, 0.14, 16), glass);
  neck.position.y = 0.66;
  group.add(neck);

  const cap = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.12, 0.2, 20),
    new THREE.MeshStandardMaterial({ color: 0xb98b58, metalness: 0.7, roughness: 0.26 })
  );
  cap.position.y = 0.82;
  group.add(cap);

  const label = labelPlane(prop.title.replace("Vial ", ""), 0.31, 0.18, 0.205);
  label.position.y = 0.31;
  group.add(label);
  return group;
}

function createBeaker() {
  const group = new THREE.Group();
  const glass = new THREE.MeshPhysicalMaterial({
    color: 0xa8c9c7,
    roughness: 0.12,
    metalness: 0.02,
    transmission: 0.48,
    thickness: 0.3,
    transparent: true,
    opacity: 0.42,
    side: THREE.DoubleSide
  });
  const walls = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.43, 0.72, 32, 1, true), glass);
  walls.position.y = 0.37;
  group.add(walls);

  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.055, 32), glass);
  base.position.y = 0.02;
  group.add(base);

  const rim = new THREE.Mesh(
    new THREE.TorusGeometry(0.36, 0.025, 8, 32),
    new THREE.MeshStandardMaterial({ color: 0xc6d8d2, metalness: 0.28, roughness: 0.2 })
  );
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 0.74;
  group.add(rim);

  const mixLiquid = new THREE.Mesh(
    new THREE.CylinderGeometry(0.32, 0.38, 0.36, 24),
    new THREE.MeshStandardMaterial({
      color: 0xc8a46c,
      roughness: 0.26,
      metalness: 0.02,
      transparent: true,
      opacity: 0.78
    })
  );
  mixLiquid.position.y = 0.2;
  mixLiquid.visible = false;
  group.add(mixLiquid);
  group.userData.mixLiquid = mixLiquid;

  const markMaterial = new THREE.MeshBasicMaterial({ color: 0xd9b27c });
  for (let index = 0; index < 3; index += 1) {
    const mark = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.012, 0.012), markMaterial);
    mark.position.set(0.31, 0.2 + index * 0.16, 0.19);
    group.add(mark);
  }
  return group;
}

function createPipette() {
  const group = new THREE.Group();
  const glass = new THREE.MeshPhysicalMaterial({
    color: 0xd2e2df,
    roughness: 0.12,
    transmission: 0.3,
    transparent: true,
    opacity: 0.68
  });
  const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 1.05, 12), glass);
  tube.rotation.z = Math.PI / 2;
  group.add(tube);

  const tip = new THREE.Mesh(
    new THREE.ConeGeometry(0.07, 0.2, 12),
    glass
  );
  tip.rotation.z = -Math.PI / 2;
  tip.position.x = 0.6;
  group.add(tip);

  const bulb = new THREE.Mesh(
    new THREE.SphereGeometry(0.11, 14, 12),
    new THREE.MeshStandardMaterial({ color: 0x6c4d5d, roughness: 0.3 })
  );
  bulb.position.x = -0.58;
  group.add(bulb);
  return group;
}

function createTray() {
  const group = new THREE.Group();
  const wood = new THREE.MeshStandardMaterial({ color: 0x5c4140, roughness: 0.45, metalness: 0.05 });
  const gold = new THREE.MeshStandardMaterial({ color: 0xba905b, metalness: 0.65, roughness: 0.25 });

  const base = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.1, 0.72), wood);
  group.add(base);

  for (const [x, z, sx, sz] of [
    [0, -0.34, 1.25, 0.04],
    [0, 0.34, 1.25, 0.04],
    [-0.61, 0, 0.04, 0.64],
    [0.61, 0, 0.04, 0.64]
  ]) {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(sx, 0.13, sz), gold);
    rail.position.set(x, 0.07, z);
    group.add(rail);
  }
  return group;
}

function createRoomArchitecture(scene) {
  const { room, window: windowLayout, door } = ATELIER_ARCHITECTURE;
  const centerZ = (room.backZ + room.frontZ) / 2;
  const halfWidth = room.width / 2;
  const wallDepth = 0.18;
  const wallThickness = 0.18;
  const insideBackZ = room.backZ + wallDepth / 2 + 0.015;
  const leftX = -room.sideHalfWidth;
  const rightX = room.sideHalfWidth;

  const wallMaterial = new THREE.MeshStandardMaterial({
    color: ATELIER_ARCHITECTURE.materials.wallColor,
    roughness: 0.84,
    metalness: 0.02
  });
  const walnutMaterial = new THREE.MeshStandardMaterial({
    color: ATELIER_ARCHITECTURE.materials.walnutColor,
    roughness: 0.68,
    metalness: 0.04
  });
  const darkWalnutMaterial = new THREE.MeshStandardMaterial({
    color: 0x33252b,
    roughness: 0.62,
    metalness: 0.04
  });
  const stoneMaterial = new THREE.MeshStandardMaterial({
    color: ATELIER_ARCHITECTURE.materials.stoneColor,
    roughness: ATELIER_ARCHITECTURE.floor.roughness,
    metalness: ATELIER_ARCHITECTURE.floor.metalness
  });
  const brassMaterial = new THREE.MeshStandardMaterial({
    color: ATELIER_ARCHITECTURE.materials.brassColor,
    metalness: 0.72,
    roughness: 0.32
  });
  const windowGlassMaterial = new THREE.MeshPhysicalMaterial({
    color: ATELIER_ARCHITECTURE.materials.glassColor,
    roughness: 0.16,
    metalness: 0,
    transmission: 0.16,
    thickness: 0.08,
    transparent: true,
    opacity: 0.3,
    side: THREE.DoubleSide
  });

  function addBox(width, height, depth, material, x, y, z) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material);
    mesh.position.set(x, y, z);
    scene.add(mesh);
    return mesh;
  }

  // A bounded stone floor replaces the old infinite plane.
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(room.width, room.depth),
    stoneMaterial
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, -0.035, centerZ);
  scene.add(floor);

  // Rear wall: leave a real opening for the atelier door.
  const doorLeft = door.centerX - door.width / 2;
  const doorRight = door.centerX + door.width / 2;
  const rearLeftWidth = doorLeft + halfWidth;
  const rearRightWidth = halfWidth - doorRight;
  addBox(rearLeftWidth, room.height, wallDepth, wallMaterial, -halfWidth + rearLeftWidth / 2, room.height / 2, room.backZ);
  addBox(rearRightWidth, room.height, wallDepth, wallMaterial, doorRight + rearRightWidth / 2, room.height / 2, room.backZ);
  addBox(door.width, room.height - door.headHeight, wallDepth, wallMaterial, door.centerX, door.headHeight + (room.height - door.headHeight) / 2, room.backZ);

  // Left wall is split around an actual window opening.
  const windowStart = windowLayout.centerZ - windowLayout.width / 2;
  const windowEnd = windowLayout.centerZ + windowLayout.width / 2;
  const rearSideDepth = windowStart - room.backZ;
  const frontSideDepth = room.frontZ - windowEnd;
  addBox(wallThickness, room.height, rearSideDepth, wallMaterial, leftX, room.height / 2, room.backZ + rearSideDepth / 2);
  addBox(wallThickness, room.height, frontSideDepth, wallMaterial, leftX, room.height / 2, windowEnd + frontSideDepth / 2);
  addBox(wallThickness, windowLayout.sillHeight, windowLayout.width, wallMaterial, leftX, windowLayout.sillHeight / 2, windowLayout.centerZ);
  const upperWallHeight = room.height - windowLayout.headHeight;
  addBox(wallThickness, upperWallHeight, windowLayout.width, wallMaterial, leftX, windowLayout.headHeight + upperWallHeight / 2, windowLayout.centerZ);

  // Right wall remains solid but gains framed inset panels for depth.
  addBox(wallThickness, room.height, room.depth, wallMaterial, rightX, room.height / 2, centerZ);

  // Walnut skirting ties the floor and room shell together.
  const trimHeight = 0.14;
  const trimY = trimHeight / 2 + 0.015;
  addBox(rearLeftWidth, trimHeight, 0.055, walnutMaterial, -halfWidth + rearLeftWidth / 2, trimY, insideBackZ);
  addBox(rearRightWidth, trimHeight, 0.055, walnutMaterial, doorRight + rearRightWidth / 2, trimY, insideBackZ);
  addBox(0.055, trimHeight, rearSideDepth, walnutMaterial, leftX + 0.11, trimY, room.backZ + rearSideDepth / 2);
  addBox(0.055, trimHeight, frontSideDepth, walnutMaterial, leftX + 0.11, trimY, windowEnd + frontSideDepth / 2);
  addBox(0.055, trimHeight, room.depth, walnutMaterial, rightX - 0.11, trimY, centerZ);

  // Window surround, stone sill, divided glass and a soft exterior light panel.
  const windowX = leftX + 0.115;
  const windowHeight = windowLayout.headHeight - windowLayout.sillHeight;
  const windowMidY = windowLayout.sillHeight + windowHeight / 2;
  addBox(0.12, 0.12, windowLayout.width + 0.22, stoneMaterial, windowX, windowLayout.sillHeight + 0.015, windowLayout.centerZ);
  addBox(0.12, 0.12, windowLayout.width + 0.22, walnutMaterial, windowX, windowLayout.headHeight, windowLayout.centerZ);
  for (const z of [windowStart - 0.015, windowEnd + 0.015]) {
    addBox(0.12, windowHeight + 0.12, 0.12, walnutMaterial, windowX, windowMidY, z);
  }
  addBox(0.035, windowHeight - 0.1, windowLayout.width - 0.12, windowGlassMaterial, leftX + 0.02, windowMidY, windowLayout.centerZ);
  addBox(0.045, windowHeight - 0.12, 0.045, brassMaterial, leftX + 0.125, windowMidY, windowLayout.centerZ);
  addBox(0.05, 0.045, windowLayout.width - 0.14, brassMaterial, leftX + 0.125, windowMidY, windowLayout.centerZ);
  const exteriorGlow = new THREE.MeshBasicMaterial({ color: 0xb9c8c4, toneMapped: false });
  addBox(0.035, windowHeight - 0.16, windowLayout.width - 0.2, exteriorGlow, leftX - 0.12, windowMidY, windowLayout.centerZ);

  // Door leaf and casing sit inside the rear-wall opening.
  const doorFaceZ = room.backZ + 0.13;
  const doorHeight = door.headHeight - 0.08;
  addBox(door.width - 0.16, doorHeight, 0.09, darkWalnutMaterial, door.centerX, doorHeight / 2 + 0.02, doorFaceZ);
  for (const x of [doorLeft + 0.015, doorRight - 0.015]) {
    addBox(0.13, door.headHeight + 0.12, 0.15, walnutMaterial, x, (door.headHeight + 0.12) / 2, doorFaceZ + 0.06);
    addBox(0.045, door.headHeight - 0.25, 0.035, brassMaterial, x + (x < door.centerX ? 0.045 : -0.045), door.headHeight / 2, doorFaceZ + 0.14);
  }
  addBox(door.width + 0.16, 0.14, 0.15, walnutMaterial, door.centerX, door.headHeight + 0.035, doorFaceZ + 0.06);
  addBox(door.width - 0.38, 0.055, 0.035, walnutMaterial, door.centerX, 1.95, doorFaceZ + 0.07);
  addBox(door.width - 0.38, 0.055, 0.035, walnutMaterial, door.centerX, 0.72, doorFaceZ + 0.07);
  const handleX = doorRight - 0.34;
  addBox(0.09, 0.22, 0.035, brassMaterial, handleX, 1.35, doorFaceZ + 0.09);
  const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.11, 12), brassMaterial);
  handle.rotation.x = Math.PI / 2;
  handle.position.set(handleX, 1.35, doorFaceZ + 0.17);
  scene.add(handle);

  // Quiet vertical timber rhythm behind the display shelves.
  for (let index = 0; index < 15; index += 1) {
    const x = -4.65 + index * 0.5;
    addBox(0.045, 2.72, 0.045, walnutMaterial, x, 2.38, room.backZ + 0.105);
  }
  // Horizontal wall trim frames the shelving zone.
  addBox(7.85, 0.045, 0.055, brassMaterial, -0.45, 3.84, room.backZ + 0.1);
  addBox(7.85, 0.045, 0.055, walnutMaterial, -0.45, 1.02, room.backZ + 0.1);

  // Shallow architectural panels on the right-hand wall.
  const panelX = rightX - 0.15;
  for (const z of [-1.75, 0.35, 2.45]) {
    addBox(0.045, 2.05, 1.35, darkWalnutMaterial, panelX, 1.98, z);
    for (const y of [0.95, 3.01]) {
      addBox(0.055, 0.045, 1.42, brassMaterial, panelX - 0.035, y, z);
    }
    for (const panelZ of [z - 0.71, z + 0.71]) {
      addBox(0.055, 2.1, 0.045, walnutMaterial, panelX - 0.035, 1.98, panelZ);
    }
  }

  // Exposed dark-walnut ceiling beams frame the open-front atelier.
  for (const z of [room.backZ + 0.14, -0.25, room.frontZ - 0.12]) {
    addBox(room.width, 0.16, 0.2, darkWalnutMaterial, 0, room.height - 0.07, z);
    addBox(room.width, 0.025, 0.035, brassMaterial, 0, room.height - 0.155, z + 0.06);
  }
  for (const x of [leftX, rightX]) {
    addBox(0.2, 0.16, room.depth, darkWalnutMaterial, x, room.height - 0.07, centerZ);
  }
  // Short ceiling slats over the back work zone hint at an overhead canopy.
  for (let index = 0; index < 9; index += 1) {
    const z = -2.1 + index * 0.22;
    addBox(room.width - 0.55, 0.045, 0.055, walnutMaterial, 0, room.height - 0.22, z);
  }

  // Front threshold makes the open side read as a deliberate entrance.
  addBox(room.width, 0.045, 0.12, brassMaterial, 0, 0.015, room.frontZ - 0.04);
}

function createFurniture(scene) {
  const table = new THREE.Mesh(
    new THREE.BoxGeometry(9.2, 0.22, 4.2),
    new THREE.MeshStandardMaterial({ color: 0x3b2d33, roughness: 0.38, metalness: 0.12 })
  );
  table.position.set(0, 0.63, 0);
  scene.add(table);

  const trim = new THREE.Mesh(
    new THREE.BoxGeometry(9.22, 0.035, 4.23),
    new THREE.MeshStandardMaterial({ color: 0xb88b54, metalness: 0.72, roughness: 0.24 })
  );
  trim.position.set(0, 0.75, 0);
  scene.add(trim);

  const legMaterial = new THREE.MeshStandardMaterial({ color: 0x292027, roughness: 0.4, metalness: 0.3 });
  for (const x of [-4.15, 4.15]) {
    for (const z of [-1.72, 1.72]) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.62, 0.18), legMaterial);
      leg.position.set(x, 0.3, z);
      scene.add(leg);
    }
  }

  const shelfMaterial = new THREE.MeshStandardMaterial({ color: 0x4a3740, roughness: 0.48, metalness: 0.08 });
  for (const y of [2.55, 3.35]) {
    const shelf = new THREE.Mesh(new THREE.BoxGeometry(7.5, 0.11, 0.48), shelfMaterial);
    shelf.position.set(0, y, -2.58);
    scene.add(shelf);

    const accent = new THREE.Mesh(
      new THREE.BoxGeometry(7.5, 0.025, 0.49),
      new THREE.MeshStandardMaterial({ color: 0xb98c57, metalness: 0.62, roughness: 0.3 })
    );
    accent.position.set(0, y - 0.06, -2.58);
    scene.add(accent);
  }

  const shelfBottleMaterial = new THREE.MeshStandardMaterial({ color: 0x926f7f, roughness: 0.2, metalness: 0.18 });
  for (let i = 0; i < 7; i += 1) {
    const x = -3 + i;
    const height = 0.3 + (i % 3) * 0.07;
    const decorativeBottle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.11, 0.14, height, 16),
      shelfBottleMaterial
    );
    decorativeBottle.position.set(x, 2.55 + 0.055 + height / 2, -2.58);
    scene.add(decorativeBottle);
  }
}

function createPropMesh(prop) {
  let group;
  if (prop.id === "author-bottle") group = createMainBottle(prop);
  else if (prop.id.endsWith("-vial")) group = createVial(prop);
  else if (prop.id === "glass-beaker") group = createBeaker();
  else if (prop.id === "glass-pipette") group = createPipette();
  else if (prop.id === "note-tray") group = createTray();
  else group = new THREE.Group();

  group.position.set(...prop.position);
  group.scale.setScalar(prop.scale);
  group.userData.propId = prop.id;

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.55, 0.024, 7, 36),
    new THREE.MeshBasicMaterial({ color: 0xd9b27c, transparent: true, opacity: 0.85 })
  );
  ring.rotation.x = Math.PI / 2;
  ring.position.set(0, -prop.position[1] + 0.82, 0);
  ring.visible = false;
  ring.userData.isSelectionRing = true;
  group.add(ring);

  return group;
}

function findPropRoot(object) {
  let current = object;
  while (current) {
    if (current.userData?.propId) return current;
    current = current.parent;
  }
  return null;
}

export function mountLaboratory(stage) {
  const canvasHost = stage?.querySelector("[data-lab-canvas]");
  if (!canvasHost) return { dispose() {}, resetCamera() {}, clearSelection() {}, setComposition() {} };

  const isMobile = window.matchMedia("(max-width: 700px)").matches;
  const deviceMemory = typeof navigator !== "undefined" && Number.isFinite(navigator.deviceMemory)
    ? navigator.deviceMemory
    : null;
  const hardwareConcurrency = typeof navigator !== "undefined" && Number.isFinite(navigator.hardwareConcurrency)
    ? navigator.hardwareConcurrency
    : null;
  const initialProfile = resolveLaboratoryRenderProfile({
    isMobile,
    deviceMemory,
    hardwareConcurrency,
    maxTextureSize: isMobile ? 4096 : 8192
  });
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      alpha: false,
      antialias: initialProfile.antialias,
      powerPreference: initialProfile.powerPreference,
      preserveDrawingBuffer: false
    });
  } catch (error) {
    canvasHost.innerHTML = '<div class="lab-webgl-fallback"><strong>Vista 3D no disponible</strong><span>Este navegador o dispositivo no pudo iniciar WebGL. Podés volver a intentar desde otro navegador compatible.</span></div>';
    console.warn("No se pudo inicializar WebGL para el laboratorio:", error);
    return { dispose() {}, resetCamera() {}, clearSelection() {}, setComposition() {} };
  }

  const renderProfile = resolveLaboratoryRenderProfile({
    isMobile,
    deviceMemory,
    hardwareConcurrency,
    maxTextureSize: renderer.capabilities.maxTextureSize
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, renderProfile.pixelRatioCap));
  renderer.setSize(Math.max(canvasHost.clientWidth, 1), Math.max(canvasHost.clientHeight, 1), false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = renderProfile.shadowsEnabled;
  renderer.info.autoReset = true;
  canvasHost.replaceChildren(renderer.domElement);

  const canvas = renderer.domElement;
  canvas.className = "lab-three-canvas";
  canvas.dataset.qualityTier = renderProfile.id;
  canvas.setAttribute("aria-label", "Escena tridimensional interactiva del laboratorio de perfumería");
  canvas.setAttribute("role", "application");
  canvas.setAttribute("tabindex", "0");

  const scene = new THREE.Scene();
  scene.background = color("#211a21");
  scene.fog = new THREE.Fog(0x211a21, 15, 28);

  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 80);
  const target = new THREE.Vector3(0, 1.12, 0);
  let theta = 0.74;
  let phi = 1.05;
  let radius = LAB_RENDER_CONFIG.initialCameraRadius;

  const updateCamera = () => {
    const sinPhi = Math.sin(phi);
    camera.position.set(
      target.x + radius * sinPhi * Math.sin(theta),
      target.y + radius * Math.cos(phi),
      target.z + radius * sinPhi * Math.cos(theta)
    );
    camera.lookAt(target);
    renderer.render(scene, camera);
  };

  scene.add(new THREE.HemisphereLight(0xe8d9ce, 0x382b37, 2.0));

  const keyLight = new THREE.DirectionalLight(0xffe0b8, 2.5);
  keyLight.position.set(-4, 8, 6);
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0xb0c5d7, 1.25);
  fillLight.position.set(5, 5, -3);
  scene.add(fillLight);

  const accentLight = new THREE.PointLight(0xd5a66d, 14, 11);
  accentLight.position.set(0, 4.2, 1.4);
  scene.add(accentLight);

  createRoomArchitecture(scene);
  createFurniture(scene);

  const selectable = [];
  const rings = new Map();
  const propRoots = new Map();

  for (const prop of LAB_PROPS) {
    const group = createPropMesh(prop);
    scene.add(group);
    selectable.push(group);
    propRoots.set(prop.id, group);
    const ring = group.children.find((child) => child.userData?.isSelectionRing);
    if (ring) rings.set(prop.id, ring);
  }

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let selectedId = null;
  let pointerStart = null;
  let didMove = false;
  let lastPinch = null;
  const activePointers = new Map();
  let disposed = false;

  function selectAt(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObjects(selectable, true)
      .map((result) => findPropRoot(result.object))
      .find(Boolean);

    selectedId = hit?.userData.propId ?? null;
    for (const [id, ring] of rings) ring.visible = id === selectedId;
    renderer.render(scene, camera);
    stage.dispatchEvent(new CustomEvent("lab:item-selected", {
      bubbles: true,
      detail: { id: selectedId }
    }));
  }

  function pointerDistance() {
    const points = [...activePointers.values()];
    if (points.length < 2) return null;
    return Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);
  }

  function onPointerDown(event) {
    if (disposed) return;
    event.preventDefault();
    canvas.setPointerCapture?.(event.pointerId);
    activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (activePointers.size === 1) {
      pointerStart = { x: event.clientX, y: event.clientY };
      didMove = false;
    } else {
      didMove = true;
      lastPinch = pointerDistance();
    }
  }

  function onPointerMove(event) {
    if (!activePointers.has(event.pointerId)) return;
    event.preventDefault();

    const previous = activePointers.get(event.pointerId);
    const dx = event.clientX - previous.x;
    const dy = event.clientY - previous.y;
    activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

    if (activePointers.size >= 2) {
      const distance = pointerDistance();
      if (lastPinch !== null && distance !== null) {
        radius = THREE.MathUtils.clamp(radius + (lastPinch - distance) * 0.018, LAB_RENDER_CONFIG.minCameraRadius, LAB_RENDER_CONFIG.maxCameraRadius);
      }
      lastPinch = distance;
      didMove = true;
      updateCamera();
      return;
    }

    if (!pointerStart) return;
    if (Math.abs(event.clientX - pointerStart.x) + Math.abs(event.clientY - pointerStart.y) > 3) didMove = true;
    if (didMove) {
      theta -= dx * 0.008;
      phi = THREE.MathUtils.clamp(phi + dy * 0.006, 0.62, 1.42);
      updateCamera();
    }
  }

  function onPointerUp(event) {
    if (!activePointers.has(event.pointerId)) return;
    if (activePointers.size === 1 && !didMove) selectAt(event.clientX, event.clientY);
    activePointers.delete(event.pointerId);
    if (activePointers.size < 2) lastPinch = null;
    if (activePointers.size === 0) pointerStart = null;
    if (activePointers.size === 1) didMove = true;
  }

  function onWheel(event) {
    event.preventDefault();
    radius = THREE.MathUtils.clamp(radius + event.deltaY * 0.004, LAB_RENDER_CONFIG.minCameraRadius, LAB_RENDER_CONFIG.maxCameraRadius);
    updateCamera();
  }

  function clearSelection() {
    selectedId = null;
    for (const ring of rings.values()) ring.visible = false;
    renderer.render(scene, camera);
    stage.dispatchEvent(new CustomEvent("lab:item-selected", { bubbles: true, detail: { id: null } }));
  }

  function onKeyDown(event) {
    const step = 0.08;
    if (event.key === "Escape") {
      clearSelection();
    } else if (event.key === "ArrowLeft") {
      theta -= step;
      updateCamera();
    } else if (event.key === "ArrowRight") {
      theta += step;
      updateCamera();
    } else if (event.key === "ArrowUp") {
      phi = THREE.MathUtils.clamp(phi - step, 0.62, 1.42);
      updateCamera();
    } else if (event.key === "ArrowDown") {
      phi = THREE.MathUtils.clamp(phi + step, 0.62, 1.42);
      updateCamera();
    } else if (event.key === "+" || event.key === "=") {
      radius = Math.max(LAB_RENDER_CONFIG.minCameraRadius, radius - 0.45);
      updateCamera();
    } else if (event.key === "-") {
      radius = Math.min(LAB_RENDER_CONFIG.maxCameraRadius, radius + 0.45);
      updateCamera();
    }
  }

  function onContextMenu(event) {
    event.preventDefault();
  }

  canvas.addEventListener("pointerdown", onPointerDown);
  canvas.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("pointerup", onPointerUp);
  canvas.addEventListener("pointercancel", onPointerUp);
  canvas.addEventListener("wheel", onWheel, { passive: false });
  canvas.addEventListener("keydown", onKeyDown);
  canvas.addEventListener("contextmenu", onContextMenu);

  const resizeHandler = () => {
    if (disposed) return;
    const width = Math.max(canvasHost.clientWidth, 1);
    const height = Math.max(canvasHost.clientHeight, 1);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    renderer.render(scene, camera);
  };
  const resizeObserver = typeof ResizeObserver === "function" ? new ResizeObserver(resizeHandler) : null;
  if (resizeObserver) resizeObserver.observe(canvasHost);
  else window.addEventListener("resize", resizeHandler);

  const familyColors = {
    "Cítrica": "#d9bd61",
    "Frutal": "#bd6a76",
    "Floral": "#c7869c",
    "Aromática": "#81a78a",
    "Verde": "#81986b",
    "Amaderada": "#987454",
    "Ámbar y resinosa": "#bb8453",
    "Especiada": "#c87948",
    "Gourmand": "#c19a62",
    "Almizclada": "#a6abb7",
    "Acuática": "#6f9fae",
    "Cuero": "#795c58"
  };

  function setComposition(entries = []) {
    const beaker = propRoots.get("glass-beaker");
    const liquid = beaker?.userData.mixLiquid;
    if (!liquid) return;
    if (!entries.length) {
      liquid.visible = false;
      renderer.render(scene, camera);
      return;
    }

    const total = entries.reduce((sum, entry) => sum + Math.max(0, entry.points), 0);
    if (!total) {
      liquid.visible = false;
      renderer.render(scene, camera);
      return;
    }

    const blended = new THREE.Color(0x000000);
    for (const entry of entries) {
      const note = getPerfumeLibraryItem(entry.id);
      if (!note || entry.points <= 0) continue;
      const noteColor = new THREE.Color(familyColors[note.family] || "#c5a16a");
      blended.add(noteColor.multiplyScalar(entry.points / total));
    }

    const level = 0.12 + Math.min(entries.length, 6) * 0.035;
    liquid.material.color.copy(blended);
    liquid.scale.y = level / 0.36;
    liquid.position.y = 0.025 + level / 2;
    liquid.visible = true;
    renderer.render(scene, camera);
  }

  function resetCamera() {
    theta = 0.74;
    phi = 1.05;
    radius = LAB_RENDER_CONFIG.initialCameraRadius;
    updateCamera();
  }

  updateCamera();

  return {
    resetCamera,
    clearSelection,
    setComposition,
    dispose() {
      if (disposed) return;
      disposed = true;
      if (resizeObserver) resizeObserver.disconnect();
      else window.removeEventListener("resize", resizeHandler);
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointercancel", onPointerUp);
      canvas.removeEventListener("wheel", onWheel);
      canvas.removeEventListener("keydown", onKeyDown);
      canvas.removeEventListener("contextmenu", onContextMenu);
      scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          for (const material of materials) {
            if (material.map) material.map.dispose();
            material.dispose();
          }
        }
      });
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
    }
  };
}
