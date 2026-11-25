export const LAB_RENDER_PROFILES = Object.freeze({
  mobileLite: Object.freeze({
    id: "mobile-lite",
    label: "Mobile Lite",
    pixelRatioCap: 1,
    antialias: false,
    powerPreference: "low-power",
    shadowsEnabled: false,
    postProcessingEnabled: false,
    maxAnisotropy: 1,
    exposure: 1.01,
    environmentIntensity: 0.48,
    backgroundIntensity: 0.68
  }),
  mobileStandard: Object.freeze({
    id: "mobile-standard",
    label: "Mobile Standard",
    pixelRatioCap: 1.25,
    antialias: false,
    powerPreference: "low-power",
    shadowsEnabled: false,
    postProcessingEnabled: false,
    maxAnisotropy: 2,
    exposure: 1.04,
    environmentIntensity: 0.58,
    backgroundIntensity: 0.75
  }),
  desktopHigh: Object.freeze({
    id: "desktop-high",
    label: "Desktop High",
    pixelRatioCap: 1.5,
    antialias: true,
    powerPreference: "default",
    shadowsEnabled: true,
    postProcessingEnabled: false,
    maxAnisotropy: 4,
    exposure: 1.07,
    environmentIntensity: 0.68,
    backgroundIntensity: 0.82
  })
});

/**
 * Select a conservative render profile from browser/device capabilities.
 * Unknown mobile capability data deliberately falls back to Mobile Lite.
 */
export function resolveLaboratoryRenderProfile({
  isMobile = false,
  deviceMemory = null,
  hardwareConcurrency = null,
  maxTextureSize = null
} = {}) {
  const memory = Number.isFinite(deviceMemory) ? deviceMemory : null;
  const cores = Number.isFinite(hardwareConcurrency) ? hardwareConcurrency : null;
  const textureLimit = Number.isFinite(maxTextureSize) ? maxTextureSize : null;

  if (isMobile) {
    const mobileCanUseStandard = memory !== null
      && memory >= 6
      && cores !== null
      && cores >= 6
      && textureLimit !== null
      && textureLimit >= 4096;

    return mobileCanUseStandard
      ? LAB_RENDER_PROFILES.mobileStandard
      : LAB_RENDER_PROFILES.mobileLite;
  }

  const desktopCanUseHigh = memory !== null
    && memory >= 8
    && cores !== null
    && cores >= 8
    && textureLimit !== null
    && textureLimit >= 8192;

  return desktopCanUseHigh
    ? LAB_RENDER_PROFILES.desktopHigh
    : LAB_RENDER_PROFILES.mobileStandard;
}
