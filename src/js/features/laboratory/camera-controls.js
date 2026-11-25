export const LAB_CAMERA_LIMITS = Object.freeze({
  minTheta: -0.82,
  maxTheta: 0.82,
  minPhi: 0.88,
  maxPhi: 1.3,
  minRadius: 5.25,
  maxRadius: 12.5
});

export const LAB_CAMERA_PRESETS = Object.freeze({
  overview: Object.freeze({
    theta: 0,
    phi: 1.08,
    radius: 12.1,
    target: Object.freeze([0, 1.55, 0])
  }),
  workbench: Object.freeze({
    theta: 0,
    phi: 1.13,
    radius: 8.8,
    target: Object.freeze([0, 1.16, 0.05])
  }),
  bottle: Object.freeze({
    theta: 0.08,
    phi: 1.2,
    radius: 5.45,
    target: Object.freeze([0, 1.28, 0.12])
  })
});

const clamp = (value, min, max, fallback) => (
  Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback
);

export function clampLaboratoryOrbit({ theta = 0, phi = 1.13, radius = 8.8 } = {}) {
  return {
    theta: clamp(theta, LAB_CAMERA_LIMITS.minTheta, LAB_CAMERA_LIMITS.maxTheta, 0),
    phi: clamp(phi, LAB_CAMERA_LIMITS.minPhi, LAB_CAMERA_LIMITS.maxPhi, 1.13),
    radius: clamp(radius, LAB_CAMERA_LIMITS.minRadius, LAB_CAMERA_LIMITS.maxRadius, 8.8)
  };
}
