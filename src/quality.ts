import type { RenderOptions } from "./renderer.ts"

interface RendererConfigLike {
  pathDetailThreshold?: number | undefined
}

/**
 * Resolve the effective curve tessellation resolution.
 *
 * Explicit `curveResolution` always wins.
 * Otherwise, the renderer defaults to 32 points per curve segment.
 */
export function resolveCurveResolution(
  options?: Pick<RenderOptions, "curveResolution"> | undefined,
): number {
  return options?.curveResolution ?? 32
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
