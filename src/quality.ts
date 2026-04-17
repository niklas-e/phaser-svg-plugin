import type { RenderOptions } from "./renderer.ts"

interface RendererConfigLike {
  pathDetailThreshold?: number | undefined
}

const DEFAULT_CURVE_TOLERANCE = 0.25

/**
 * Resolve the effective curve flattening tolerance.
 *
 * Explicit `curveTolerance` wins.
 * Otherwise, the renderer defaults to a quarter-pixel screen-space error.
 */
export function resolveCurveTolerance(
  options?: Pick<RenderOptions, "curveTolerance"> | undefined,
): number {
  return options?.curveTolerance ?? DEFAULT_CURVE_TOLERANCE
}

/**
 * Explicit fixed-segment override for curve flattening.
 *
 * When omitted, the renderer uses adaptive subdivision.
 */
export function resolveCurveResolution(
  options?: Pick<RenderOptions, "curveResolution"> | undefined,
): number | undefined {
  return options?.curveResolution
}

/**
 * Disable Phaser Graphics path simplification.
 *
 * Phaser defaults to `pathDetailThreshold = 1`, which can drop close points
 * in tiny vector paths and make icons look rough. We set it to 0 only when
 * needed.
 */
export function applyCrispPathDetailThreshold(
  config: RendererConfigLike | null | undefined,
): boolean {
  if (!config) return false

  const threshold = config.pathDetailThreshold
  if (!Number.isFinite(threshold) || threshold === undefined) {
    return false
  }
  if (threshold <= 0) {
    return false
  }

  config.pathDetailThreshold = 0
  return true
}
