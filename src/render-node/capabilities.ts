import type { MsaaBackend, MsaaCapabilities, MsaaSamples } from "./types.ts"

/** Phaser WebGLRenderer duck-type — only the fields we read. */
interface PhaserRendererForCaps {
  gl: WebGLRenderingContext
  width: number
  height: number
}

/** Memory budget in bytes above which we negotiate down to a lower sample count. */
const MEMORY_BUDGET_BYTES = 96 * 1024 * 1024 // 96 MiB

/** Cached capabilities per renderer instance (keyed by reference). */
const capsCache = new WeakMap<PhaserRendererForCaps, MsaaCapabilities>()

/**
 * Detect the MSAA rendering backend available for the given Phaser renderer.
 *
 * Result is cached per renderer so capability detection only runs once.
 * Returns `null` when no MSAA backend is available.
 */
export function detectMsaaCapabilities(
  renderer: PhaserRendererForCaps,
): MsaaCapabilities | null {
  const cached = capsCache.get(renderer)
  if (cached !== undefined) {
    return cached
  }

  const gl = renderer.gl as WebGL2RenderingContext

  if (
    typeof WebGL2RenderingContext !== "undefined" &&
    gl instanceof WebGL2RenderingContext
  ) {
    const maxSamples = gl.getParameter(gl.MAX_SAMPLES) as number
    const caps: MsaaCapabilities = { backend: "webgl2", maxSamples }
    capsCache.set(renderer, caps)
    return caps
  }

  return null
}

/**
 * Negotiate the actual sample count to use given requested samples and capabilities.
 *
 * Negotiation rules:
 * 1. x2 request → use x2 when device and memory support it.
 * 2. x2 not available or over budget → throw with actionable message.
 * 3. x8 request → use x8 when device and memory support it.
 * 4. x8 request but unsupported or over budget → silently downgrade to x4.
 * 5. x4 request (or x8 downgraded) → use x4 when device and memory support it.
 * 6. x4 not available or over budget → throw with actionable message.
 */
export function negotiateSamples(
  requested: MsaaSamples,
  caps: MsaaCapabilities,
  rendererWidth: number,
  rendererHeight: number,
): MsaaSamples {
  if (requested === 2) {
    const canX2Hardware = caps.maxSamples >= 2
    if (!canX2Hardware) {
      throw new Error(
        `phaser-svg MSAA: device maximum sample count is ${caps.maxSamples}, ` +
          `which is less than the minimum required 2. ` +
          `To fix: run with a WebGL2 renderer on hardware that supports at least x2 multisampling.`,
      )
    }

    const memX2 = computeMsaaMemoryBytes(rendererWidth, rendererHeight, 2)
    if (memX2 > MEMORY_BUDGET_BYTES) {
      const mib = (memX2 / (1024 * 1024)).toFixed(0)
      throw new Error(
        `phaser-svg MSAA: the MSAA render target for ${rendererWidth}x${rendererHeight} ` +
          `at x2 samples would require ${mib} MiB (budget is 96 MiB). ` +
          `To fix: lower the game canvas size, or split large SVG draws into smaller Graphics objects.`,
      )
    }

    return 2
  }

  // x8 with silent downgrade to x4 when needed.
  if (requested === 8) {
    const canX8Hardware = caps.maxSamples >= 8
    const memX8 = computeMsaaMemoryBytes(rendererWidth, rendererHeight, 8)
    if (canX8Hardware && memX8 <= MEMORY_BUDGET_BYTES) {
      return 8
    }
    // Silently downgrade to x4 and fall through.
  }

  // x4 is the minimum acceptable level for x4 (and downgraded x8) requests.
  const canX4Hardware = caps.maxSamples >= 4
  if (!canX4Hardware) {
    throw new Error(
      `phaser-svg MSAA: device maximum sample count is ${caps.maxSamples}, ` +
        `which is less than the minimum required 4. ` +
        `To fix: run with a WebGL2 renderer on hardware that supports at least x4 multisampling.`,
    )
  }

  const memX4 = computeMsaaMemoryBytes(rendererWidth, rendererHeight, 4)
  if (memX4 > MEMORY_BUDGET_BYTES) {
    const mib = (memX4 / (1024 * 1024)).toFixed(0)
    throw new Error(
      `phaser-svg MSAA: the MSAA render target for ${rendererWidth}x${rendererHeight} ` +
        `at x4 samples would require ${mib} MiB (budget is 96 MiB). ` +
        `To fix: lower the game canvas size, or split large SVG draws into smaller Graphics objects.`,
    )
  }

  return 4
}

/**
 * Returns the backend key identifying a specific Phaser renderer + sample count
 * combination. Used as a WeakMap/Map cache key.
 */
export function backendKey(backend: MsaaBackend, samples: number): string {
  return `${backend}:${samples}`
}

/** Compute the approximate MSAA FBO memory in bytes for the given dimensions and sample count. */
export function computeMsaaMemoryBytes(
  width: number,
  height: number,
  samples: number,
): number {
  // RGBA8 = 4 bytes per pixel × samples.
  return width * height * 4 * samples
}
