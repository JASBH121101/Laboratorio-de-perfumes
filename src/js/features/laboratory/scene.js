import * as THREE from "three";
import { LAB_PROPS, LAB_RENDER_CONFIG } from "./catalog.js";
import { resolveLaboratoryRenderProfile } from "./render-profile.js";
import { ATELIER_ARCHITECTURE } from "./architecture.js";
import { createAtelierMaterials } from "./materials.js";
import { createAtelierEnvironment } from "./environment.js";
import { createFlaconGeometry, createRoundedPlateGeometry } from "./perfume-assets.js";
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

function createMainBottle(prop, materials) {
  const group = new THREE.Group();
  const glass = materials.bottleGlass;
  const liquid = new THREE.MeshStandardMaterial({
    color: color(prop.color),
    roughness: 0.28,
    metalness: 0.03,
    transparent: true,
    opacity: 0.82
  });

  // Curved shoulders, integrated neck and beveled glass edges replace the old box silhouette.
  const body = new THREE.Mesh(createFlaconGeometry(), glass);
  group.add(body);

  const inner = new THREE.Mesh(new THREE.BoxGeometry(0.63, 0.48, 0.18), liquid);
  inner.position.set(0, 0.37, 0);
  group.add(inner);

  const dipTube = new THREE.Mesh(
    new THREE.CylinderGeometry(0.012, 0.012, 0.7, 10),
    glass
  );
  dipTube.position.set(0, 0.44, 0.1);
  group.add(dipTube);

  const collar = new THREE.Mesh(
    new THREE.CylinderGeometry(0.17, 0.17, 0.085, 32),
    materials.brass
  );
  collar.position.y = 1.235;
  group.add(collar);

  const cap = new THREE.Mesh(
    new THREE.CylinderGeometry(0.145, 0.16, 0.29, 32, 1, false),
    materials.darkWalnut
  );
  cap.position.y = 1.42;
  group.add(cap);

  const capLowerRing = new THREE.Mesh(
    new THREE.CylinderGeometry(0.165, 0.165, 0.026, 32),
    materials.brass
  );
  capLowerRing.position.y = 1.275;
  group.add(capLowerRing);

  const capTop = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.12, 0.026, 32),
    materials.brass
  );
  capTop.position.y = 1.57;
  group.add(capTop);

  for (let index = 0; index < 8; index += 1) {
    const angle = (index / 8) * Math.PI * 2;
    const groove = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.2, 0.012), materials.brass);
    groove.position.set(Math.sin(angle) * 0.15, 1.42, Math.cos(angle) * 0.15);
    groove.rotation.y = angle;
    group.add(groove);
  }

  const labelBacking = new THREE.Mesh(
    createRoundedPlateGeometry(0.72, 0.38, 0.04, 0.065),
    materials.brass
  );
  labelBacking.position.set(0, 0.58, 0.245);
  group.add(labelBacking);

  const labelInset = new THREE.Mesh(
    createRoundedPlateGeometry(0.64, 0.3, 0.018, 0.05),
    materials.darkWalnut
  );
  labelInset.position.set(0, 0.58, 0.275);
  group.add(labelInset);

  const label = labelPlane("Atelier 001", 0.56, 0.21, 0.286);
  label.position.y = 0.58;
  group.add(label);

  return group;
}

function createVial(prop, materials) {
  const group = new THREE.Group();
  const glass = materials.bottleGlass;
  const liquid = new THREE.MeshStandardMaterial({
    color: color(prop.color),
    roughness: 0.3,
    transparent: true,
    opacity: 0.8
  });
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.21, 0.57, 32), glass);
  body.position.y = 0.3;
  group.add(body);

  const contents = new THREE.Mesh(new THREE.CylinderGeometry(0.165, 0.185, 0.24, 28), liquid);
  contents.position.y = 0.16;
  group.add(contents);

  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.095, 0.12, 0.14, 20), glass);
  neck.position.y = 0.66;
  group.add(neck);

  const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.125, 0.125, 0.035, 24), materials.brass);
  collar.position.y = 0.74;
  group.add(collar);

  const cap = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.12, 0.18, 28),
    materials.darkWalnut
  );
  cap.position.y = 0.85;
  group.add(cap);

  const capAccent = new THREE.Mesh(new THREE.CylinderGeometry(0.122, 0.122, 0.018, 28), materials.brass);
  capAccent.position.y = 0.77;
  group.add(capAccent);

  const labelBacking = new THREE.Mesh(
    createRoundedPlateGeometry(0.34, 0.2, 0.022, 0.035),
    materials.brass
  );
  labelBacking.position.set(0, 0.31, 0.202);
  group.add(labelBacking);

  const labelInset = new THREE.Mesh(
    createRoundedPlateGeometry(0.31, 0.17, 0.012, 0.025),
    materials.darkWalnut
  );
  labelInset.position.set(0, 0.31, 0.22);
  group.add(labelInset);

  const label = labelPlane(prop.title.replace("Vial ", ""), 0.27, 0.13, 0.229);
  label.position.y = 0.31;
  group.add(label);
  return group;
}

function makeMeasurementTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 256;
  const context = canvas.getContext("2d");
  if (!context) return null;
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.strokeStyle = "rgba(244, 235, 218, 0.86)";
  context.fillStyle = "rgba(244, 235, 218, 0.92)";
  context.lineWidth = 3;
  context.font = "600 15px Arial";
  context.textAlign = "left";
  for (let index = 0; index < 6; index += 1) {
    const y = 24 + index * 39;
    const length = index % 2 === 0 ? 74 : 48;
    context.beginPath();
    context.moveTo(48, y);
    context.lineTo(48 + length, y);
    context.stroke();
    if (index % 2 === 0) context.fillText(String(250 - index * 50), 4, y + 5);
  }
  context.fillText("mL", 4, 250);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  return texture;
}

function createBeaker(materials) {
  const group = new THREE.Group();
  const glass = materials.vesselGlass;

  const walls = new THREE.Mesh(
    new THREE.CylinderGeometry(0.365, 0.42, 0.72, 40, 1, true),
    glass
  );
  walls.position.y = 0.38;
  group.add(walls);

  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(0.42, 0.42, 0.065, 40),
    glass
  );
  base.position.y = 0.025;
  group.add(base);

  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.365, 0.022, 10, 48), glass);
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 0.74;
  group.add(rim);

  const foot = new THREE.Mesh(new THREE.TorusGeometry(0.405, 0.012, 8, 40), materials.vesselGlass);
  foot.rotation.x = Math.PI / 2;
  foot.position.y = 0.058;
  group.add(foot);

  const measurementTexture = makeMeasurementTexture();
  if (measurementTexture) {
    const scaleLabel = new THREE.Mesh(
      new THREE.PlaneGeometry(0.3, 0.55),
      new THREE.MeshBasicMaterial({
        map: measurementTexture,
        transparent: true,
        depthWrite: false,
        toneMapped: false
      })
    );
    scaleLabel.position.set(-0.12, 0.39, 0.385);
    scaleLabel.userData.ownsTexture = true;
    group.add(scaleLabel);
  }

  const mixLiquid = new THREE.Mesh(
    new THREE.CylinderGeometry(0.32, 0.38, 0.36, 32),
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

  const markMaterial = new THREE.MeshStandardMaterial({
    color: 0xd9c6a7,
    roughness: 0.48,
    metalness: 0.08
  });
  for (let index = 0; index < 3; index += 1) {
    const mark = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.014, 0.018), markMaterial);
    mark.position.set(0.31, 0.2 + index * 0.16, 0.25);
    group.add(mark);
  }
  return group;
}

function createPipette(materials) {
  const group = new THREE.Group();
  const glass = materials.vesselGlass;

  const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.045, 0.92, 20), glass);
  tube.rotation.z = Math.PI / 2;
  group.add(tube);

  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.24, 18), glass);
  tip.rotation.z = -Math.PI / 2;
  tip.position.x = 0.57;
  group.add(tip);

  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.13, 18, 16), materials.lacquer);
  bulb.position.x = -0.58;
  group.add(bulb);

  for (const x of [-0.22, 0.02, 0.25]) {
    const band = new THREE.Mesh(
      new THREE.TorusGeometry(0.043, 0.006, 8, 20),
      materials.brass
    );
    band.rotation.y = Math.PI / 2;
    band.position.set(x, 0, 0);
    group.add(band);
  }

  const endStop = new THREE.Mesh(
    new THREE.CylinderGeometry(0.052, 0.052, 0.035, 18),
    materials.darkWalnut
  );
  endStop.rotation.z = Math.PI / 2;
  endStop.position.x = -0.42;
  group.add(endStop);

  return group;
}

function createTray(materials) {
  const group = new THREE.Group();
  const baseGeometry = createRoundedPlateGeometry(1.35, 0.82, 0.1, 0.1);
  baseGeometry.rotateX(Math.PI / 2);
  const base = new THREE.Mesh(baseGeometry, materials.darkWalnut);
  base.position.y = 0.05;
  group.add(base);

  const inset = new THREE.Mesh(new THREE.BoxGeometry(1.16, 0.024, 0.62), materials.lacquer);
  inset.position.y = 0.105;
  group.add(inset);

  const railMaterial = materials.brass;
  for (const [x, z, width, depth] of [
    [0, -0.37, 1.29, 0.045],
    [0, 0.37, 1.29, 0.045],
    [-0.63, 0, 0.045, 0.7],
    [0.63, 0, 0.045, 0.7]
  ]) {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(width, 0.11, depth), railMaterial);
    rail.position.set(x, 0.145, z);
    group.add(rail);
  }

  for (const x of [-0.23, 0.24]) {
    const divider = new THREE.Mesh(
      new THREE.BoxGeometry(0.028, 0.075, 0.61),
      materials.darkWalnut
    );
    divider.position.set(x, 0.16, 0);
    group.add(divider);
  }

  for (const x of [-0.56, 0.56]) {
    for (const z of [-0.3, 0.3]) {
      const rivet = new THREE.Mesh(new THREE.SphereGeometry(0.026, 12, 10), railMaterial);
      rivet.position.set(x, 0.205, z);
      group.add(rivet);
    }
  }

  return group;
}

function createContactShadowMaterial() {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const context = canvas.getContext("2d");
  if (!context) {
    return new THREE.MeshBasicMaterial({
      color: 0x171216,
      transparent: true,
      opacity: 0.12,
      depthWrite: false,
      toneMapped: false
    });
  }

  const gradient = context.createRadialGradient(64, 64, 5, 64, 64, 62);
  gradient.addColorStop(0, "rgba(17, 12, 15, 0.42)");
  gradient.addColorStop(0.42, "rgba(17, 12, 15, 0.19)");
  gradient.addColorStop(1, "rgba(17, 12, 15, 0)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, 128, 128);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  return new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    opacity: 0.72,
    depthWrite: false,
    toneMapped: false,
    side: THREE.DoubleSide,
    polygonOffset: true,
    polygonOffsetFactor: -1
  });
}

function addContactShadow(scene, material, x, z, width, depth, y) {
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(width, depth), material);
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.set(x, y, z);
  shadow.renderOrder = 2;
  shadow.userData.isContactShadow = true;
  scene.add(shadow);
  return shadow;
}

function createRoomArchitecture(scene, materials) {
  const { room, window: windowLayout, door } = ATELIER_ARCHITECTURE;
  const centerZ = (room.backZ + room.frontZ) / 2;
  const halfWidth = room.width / 2;
  const wallDepth = 0.18;
  const wallThickness = 0.18;
  const insideBackZ = room.backZ + wallDepth / 2 + 0.015;
  const leftX = -room.sideHalfWidth;
  const rightX = room.sideHalfWidth;

  const {
    wall: wallMaterial,
    walnut: walnutMaterial,
    darkWalnut: darkWalnutMaterial,
    stone: stoneMaterial,
    brass: brassMaterial,
    windowGlass: windowGlassMaterial
  } = materials;

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

function createFurniture(scene, materials) {
  const table = new THREE.Mesh(
    new THREE.BoxGeometry(9.2, 0.22, 4.2),
    materials.counterstone
  );
  table.position.set(0, 0.63, 0);
  scene.add(table);

  const trim = new THREE.Mesh(
    new THREE.BoxGeometry(9.22, 0.035, 4.23),
    materials.brass
  );
  trim.position.set(0, 0.75, 0);
  scene.add(trim);

  const legMaterial = materials.darkWalnut;
  for (const x of [-4.15, 4.15]) {
    for (const z of [-1.72, 1.72]) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.62, 0.18), legMaterial);
      leg.position.set(x, 0.3, z);
      scene.add(leg);
    }
  }

  const shelfMaterial = materials.walnut;
  for (const y of [2.55, 3.35]) {
    const shelf = new THREE.Mesh(new THREE.BoxGeometry(7.5, 0.11, 0.48), shelfMaterial);
    shelf.position.set(0, y, -2.58);
    scene.add(shelf);

    const accent = new THREE.Mesh(
      new THREE.BoxGeometry(7.5, 0.025, 0.49),
      materials.brass
    );
    accent.position.set(0, y - 0.06, -2.58);
    scene.add(accent);
  }

  const shelfBottleMaterial = materials.lacquer;
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

function createPropMesh(prop, materials) {
  let group;
  if (prop.id === "author-bottle") group = createMainBottle(prop, materials);
  else if (prop.id.endsWith("-vial")) group = createVial(prop, materials);
  else if (prop.id === "glass-beaker") group = createBeaker(materials);
  else if (prop.id === "glass-pipette") group = createPipette(materials);
  else if (prop.id === "note-tray") group = createTray(materials);
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
  renderer.toneMappingExposure = renderProfile.exposure;
  renderer.shadowMap.enabled = renderProfile.shadowsEnabled;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.info.autoReset = true;
  const hardwareAnisotropy = typeof renderer.capabilities.getMaxAnisotropy === "function"
    ? renderer.capabilities.getMaxAnisotropy()
    : 1;
  const materials = createAtelierMaterials({
    maxAnisotropy: Math.min(renderProfile.maxAnisotropy, hardwareAnisotropy),
    textureSize: isMobile ? 256 : 512
  });
  canvasHost.replaceChildren(renderer.domElement);

  const canvas = renderer.domElement;
  canvas.className = "lab-three-canvas";
  canvas.dataset.qualityTier = renderProfile.id;
  stage.dataset.visualTier = renderProfile.id;
  canvas.setAttribute("aria-label", "Escena tridimensional interactiva del laboratorio de perfumería");
  canvas.setAttribute("role", "application");
  canvas.setAttribute("tabindex", "0");

  const scene = new THREE.Scene();
  const environmentResources = createAtelierEnvironment(renderer, scene, {
    textureSize: isMobile ? 256 : 512
  });
  scene.environmentIntensity = renderProfile.environmentIntensity;
  scene.backgroundIntensity = renderProfile.backgroundIntensity;

  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 80);
  const target = new THREE.Vector3(0, 1.12, 0);
  let theta = 0.74;
  let phi = 1.05;
  let radius = LAB_RENDER_CONFIG.initialCameraRadius;
  let cameraTransition = null;
  let cameraTransitionFrame = 0;

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

  const ambientLight = new THREE.HemisphereLight(0xe8d9ce, 0x382b37, 1.35);
  scene.add(ambientLight);

  // Warm daylight is aligned with the atelier's left-side window.
  const keyLight = new THREE.DirectionalLight(0xffe2c4, 3.0);
  keyLight.position.set(-5.15, 5.2, -0.65);
  keyLight.target.position.set(0, 1.0, 0);
  keyLight.castShadow = renderProfile.shadowsEnabled;
  if (keyLight.castShadow) {
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.near = 0.2;
    keyLight.shadow.camera.far = 22;
    keyLight.shadow.camera.left = -7.5;
    keyLight.shadow.camera.right = 7.5;
    keyLight.shadow.camera.top = 6;
    keyLight.shadow.camera.bottom = -4.5;
    keyLight.shadow.bias = -0.00018;
    keyLight.shadow.normalBias = 0.025;
  }
  scene.add(keyLight, keyLight.target);

  const fillLight = new THREE.DirectionalLight(0xb7cbd8, 0.85);
  fillLight.position.set(4.8, 4.2, 3.4);
  scene.add(fillLight);

  const rearRimLight = new THREE.DirectionalLight(0xffd7ad, 0.75);
  rearRimLight.position.set(1.5, 3.8, -4.5);
  scene.add(rearRimLight);

  // Restrained warm practicals give the shelving and bench a local light source.
  const shelfPractical = new THREE.PointLight(0xffc98e, 5.5, 6.2);
  shelfPractical.position.set(-0.5, 3.45, -2.15);
  scene.add(shelfPractical);

  const benchPractical = new THREE.PointLight(0xd9ad79, 2.6, 4.8);
  benchPractical.position.set(3.3, 2.3, 0.25);
  scene.add(benchPractical);

  createRoomArchitecture(scene, materials);
  createFurniture(scene, materials);

  const contactShadowMaterial = createContactShadowMaterial();
  const contactShadowSizes = {
    "author-bottle": [1.65, 1.08],
    "bergamot-vial": [0.72, 0.56],
    "rose-vial": [0.72, 0.56],
    "sandalwood-vial": [0.72, 0.56],
    "vanilla-vial": [0.72, 0.56],
    "glass-beaker": [1.18, 0.92],
    "glass-pipette": [1.35, 0.44],
    "note-tray": [1.52, 0.92]
  };
  for (const prop of LAB_PROPS) {
    const [shadowWidth, shadowDepth] = contactShadowSizes[prop.id] || [0.9, 0.7];
    addContactShadow(scene, contactShadowMaterial, prop.position[0], prop.position[2], shadowWidth, shadowDepth, 0.746);
  }
  for (const x of [-4.15, 4.15]) {
    for (const z of [-1.72, 1.72]) {
      addContactShadow(scene, contactShadowMaterial, x, z, 0.78, 0.62, -0.029);
    }
  }

  const selectable = [];
  const rings = new Map();
  const propRoots = new Map();
  const propBaseScales = new Map();

  for (const prop of LAB_PROPS) {
    const group = createPropMesh(prop, materials);
    scene.add(group);
    selectable.push(group);
    propRoots.set(prop.id, group);
    propBaseScales.set(prop.id, prop.scale);
    const ring = group.children.find((child) => child.userData?.isSelectionRing);
    if (ring) rings.set(prop.id, ring);
  }

  if (renderProfile.shadowsEnabled) {
    scene.traverse((object) => {
      if (!object.isMesh) return;
      object.receiveShadow = true;
      const objectMaterials = Array.isArray(object.material) ? object.material : [object.material];
      object.castShadow = objectMaterials.every((material) => !material.transparent);
    });
  }

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let selectedId = null;
  let hoveredId = null;
  let pointerStart = null;
  let didMove = false;
  let lastPinch = null;
  let objectFocusFrame = 0;
  const activePointers = new Map();
  let disposed = false;

  function findPropAt(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return null;
    pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    return raycaster.intersectObjects(selectable, true)
      .map((result) => findPropRoot(result.object))
      .find(Boolean) || null;
  }

  function syncSelectionVisuals() {
    for (const [id, ring] of rings) {
      const isSelected = id === selectedId;
      const isHovered = id === hoveredId && !isSelected;
      ring.visible = isSelected || isHovered;
      ring.material.opacity = isSelected ? 0.9 : 0.38;
      ring.scale.setScalar(isSelected ? 1.1 : 1.045);
    }
    renderer.render(scene, camera);
  }

  function stopObjectFocusAnimation() {
    if (objectFocusFrame) cancelAnimationFrame(objectFocusFrame);
    objectFocusFrame = 0;
  }

  function animateSelectedProp(previousId, nextId) {
    stopObjectFocusAnimation();
    const affectedIds = [...new Set([previousId, nextId].filter(Boolean))];
    const changes = affectedIds
      .map((id) => {
        const root = propRoots.get(id);
        const baseScale = propBaseScales.get(id);
        return root && Number.isFinite(baseScale)
          ? { root, from: root.scale.x, to: baseScale * (id === nextId ? 1.028 : 1) }
          : null;
      })
      .filter(Boolean);
    if (!changes.length) return;

    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
    if (reduceMotion) {
      for (const change of changes) change.root.scale.setScalar(change.to);
      return;
    }

    const start = performance.now();
    const duration = 170;
    const frame = (now) => {
      if (disposed) {
        objectFocusFrame = 0;
        return;
      }
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - progress) * (1 - progress);
      for (const change of changes) {
        change.root.scale.setScalar(THREE.MathUtils.lerp(change.from, change.to, eased));
      }
      if (progress < 1) objectFocusFrame = requestAnimationFrame(frame);
      else objectFocusFrame = 0;
      renderer.render(scene, camera);
    };
    objectFocusFrame = requestAnimationFrame(frame);
  }

  function updateHoverAt(clientX, clientY) {
    const hit = findPropAt(clientX, clientY);
    const nextHoveredId = hit?.userData.propId ?? null;
    if (nextHoveredId === hoveredId) return;
    hoveredId = nextHoveredId;
    canvas.style.cursor = hoveredId ? "pointer" : "grab";
    syncSelectionVisuals();
  }

  function clearHover() {
    if (!hoveredId) return;
    hoveredId = null;
    canvas.style.cursor = "grab";
    syncSelectionVisuals();
  }

  function selectAt(clientX, clientY) {
    const hit = findPropAt(clientX, clientY);
    const nextSelectedId = hit?.userData.propId ?? null;
    const previousId = selectedId;
    selectedId = nextSelectedId;
    animateSelectedProp(previousId, selectedId);
    syncSelectionVisuals();
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

  function stopCameraTransition() {
    if (cameraTransitionFrame) cancelAnimationFrame(cameraTransitionFrame);
    cameraTransitionFrame = 0;
    cameraTransition = null;
  }

  function animateCameraPreset(preset) {
    const presets = {
      overview: { theta: 0.74, phi: 1.05, radius: LAB_RENDER_CONFIG.initialCameraRadius, target: [0, 1.12, 0] },
      workbench: { theta: 0.18, phi: 1.18, radius: 8.5, target: [0, 0.94, 0.08] },
      bottle: { theta: 0.52, phi: 1.22, radius: 6.35, target: [0, 1.38, 0.12] }
    };
    const destination = presets[preset] || presets.overview;
    stopCameraTransition();
    const from = { theta, phi, radius, target: target.clone() };
    const to = { theta: destination.theta, phi: destination.phi, radius: destination.radius, target: new THREE.Vector3(...destination.target) };
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
    if (reduceMotion) {
      theta = to.theta; phi = to.phi; radius = to.radius; target.copy(to.target); updateCamera(); return;
    }
    const start = performance.now();
    const duration = 460;
    const ease = (t) => t * t * (3 - 2 * t);
    const frame = (now) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = ease(progress);
      theta = THREE.MathUtils.lerp(from.theta, to.theta, eased);
      phi = THREE.MathUtils.lerp(from.phi, to.phi, eased);
      radius = THREE.MathUtils.lerp(from.radius, to.radius, eased);
      target.copy(from.target).lerp(to.target, eased);
      updateCamera();
      if (progress < 1) cameraTransitionFrame = requestAnimationFrame(frame);
      else { cameraTransitionFrame = 0; cameraTransition = null; }
    };
    cameraTransition = preset;
    cameraTransitionFrame = requestAnimationFrame(frame);
  }

  function onPointerDown(event) {
    if (disposed) return;
    stopCameraTransition();
    clearHover();
    canvas.style.cursor = "grabbing";
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
    if (!activePointers.has(event.pointerId)) {
      if (event.pointerType === "mouse" || event.pointerType === "pen") {
        updateHoverAt(event.clientX, event.clientY);
      }
      return;
    }
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
    if (activePointers.size === 0) {
      pointerStart = null;
      canvas.style.cursor = hoveredId ? "pointer" : "grab";
    }
    if (activePointers.size === 1) didMove = true;
  }

  function onPointerLeave() {
    if (activePointers.size === 0) clearHover();
  }

  function onWheel(event) {
    stopCameraTransition();
    event.preventDefault();
    radius = THREE.MathUtils.clamp(radius + event.deltaY * 0.004, LAB_RENDER_CONFIG.minCameraRadius, LAB_RENDER_CONFIG.maxCameraRadius);
    updateCamera();
  }

  function clearSelection() {
    const previousId = selectedId;
    selectedId = null;
    animateSelectedProp(previousId, null);
    syncSelectionVisuals();
    stage.dispatchEvent(new CustomEvent("lab:item-selected", { bubbles: true, detail: { id: null } }));
  }

  function onKeyDown(event) {
    stopCameraTransition();
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
  canvas.addEventListener("pointerleave", onPointerLeave);
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
    animateCameraPreset("overview");
  }

  updateCamera();

  return {
    resetCamera,
    setCameraPreset: animateCameraPreset,
    clearSelection,
    setComposition,
    dispose() {
      if (disposed) return;
      disposed = true;
      stopCameraTransition();
      stopObjectFocusAnimation();
      if (resizeObserver) resizeObserver.disconnect();
      else window.removeEventListener("resize", resizeHandler);
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointercancel", onPointerUp);
      canvas.removeEventListener("pointerleave", onPointerLeave);
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
      environmentResources.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
    }
  };
}
