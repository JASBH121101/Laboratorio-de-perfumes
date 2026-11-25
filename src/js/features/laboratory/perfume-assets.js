import * as THREE from "three";

function roundedRectangle(width, height, radius) {
  const shape = new THREE.Shape();
  const halfWidth = width / 2;
  const halfHeight = height / 2;
  const r = THREE.MathUtils.clamp(radius, 0.01, Math.min(width, height) / 2);

  shape.moveTo(-halfWidth + r, -halfHeight);
  shape.lineTo(halfWidth - r, -halfHeight);
  shape.quadraticCurveTo(halfWidth, -halfHeight, halfWidth, -halfHeight + r);
  shape.lineTo(halfWidth, halfHeight - r);
  shape.quadraticCurveTo(halfWidth, halfHeight, halfWidth - r, halfHeight);
  shape.lineTo(-halfWidth + r, halfHeight);
  shape.quadraticCurveTo(-halfWidth, halfHeight, -halfWidth, halfHeight - r);
  shape.lineTo(-halfWidth, -halfHeight + r);
  shape.quadraticCurveTo(-halfWidth, -halfHeight, -halfWidth + r, -halfHeight);
  return shape;
}

/** Premium flacon silhouette with curved shoulders and an integrated neck. */
export function createFlaconGeometry() {
  const shape = new THREE.Shape();
  shape.moveTo(-0.31, 0);
  shape.lineTo(0.31, 0);
  shape.quadraticCurveTo(0.4, 0, 0.4, 0.12);
  shape.lineTo(0.4, 0.78);
  shape.quadraticCurveTo(0.4, 0.87, 0.33, 0.93);
  shape.lineTo(0.19, 1.07);
  shape.quadraticCurveTo(0.16, 1.1, 0.15, 1.12);
  shape.lineTo(0.15, 1.23);
  shape.lineTo(-0.15, 1.23);
  shape.lineTo(-0.15, 1.12);
  shape.quadraticCurveTo(-0.16, 1.1, -0.19, 1.07);
  shape.lineTo(-0.33, 0.93);
  shape.quadraticCurveTo(-0.4, 0.87, -0.4, 0.78);
  shape.lineTo(-0.4, 0.12);
  shape.quadraticCurveTo(-0.4, 0, -0.31, 0);
  shape.closePath();

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 0.42,
    steps: 1,
    bevelEnabled: true,
    bevelSegments: 4,
    bevelSize: 0.025,
    bevelThickness: 0.025,
    curveSegments: 10
  });
  geometry.translate(0, 0, -0.21);
  geometry.computeVertexNormals();
  return geometry;
}

export function createRoundedPlateGeometry(width, height, depth, radius = 0.05) {
  const geometry = new THREE.ExtrudeGeometry(roundedRectangle(width, height, radius), {
    depth,
    steps: 1,
    bevelEnabled: true,
    bevelSegments: 3,
    bevelSize: Math.min(radius * 0.28, depth * 0.45),
    bevelThickness: Math.min(depth * 0.35, 0.012),
    curveSegments: 8
  });
  geometry.translate(0, 0, -depth / 2);
  geometry.computeVertexNormals();
  return geometry;
}
