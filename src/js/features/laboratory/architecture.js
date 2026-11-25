const room = Object.freeze({
  width: 11,
  depth: 7.8,
  height: 4,
  sideHalfWidth: 5.4,
  backZ: -2.95,
  frontZ: 4.65
});

const window = Object.freeze({
  centerZ: -0.65,
  width: 1.8,
  sillHeight: 1.12,
  headHeight: 3.15
});

const door = Object.freeze({
  centerX: 4.02,
  width: 1.56,
  headHeight: 2.78
});

export const ATELIER_ARCHITECTURE = Object.freeze({
  room,
  window,
  door,
  floor: Object.freeze({
    material: "warm-stone",
    roughness: 0.86,
    metalness: 0
  }),
  materials: Object.freeze({
    wallColor: "#302630",
    walnutColor: "#49362F",
    stoneColor: "#A99A88",
    brassColor: "#B9915F",
    glassColor: "#C6D8D4",
    accentColor: "#563541"
  })
});
