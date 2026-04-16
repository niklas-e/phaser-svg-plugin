import { detectMsaaCapabilities, negotiateSamples } from "./capabilities.ts"
import { MsaaResources } from "./resources.ts"
import type { MsaaCapabilities, MsaaSamples } from "./types.ts"

// ---------------------------------------------------------------------------
// Duck-typed Phaser interfaces (only the members we access).
// ---------------------------------------------------------------------------

interface PhaserRendererForStep {
  gl: WebGLRenderingContext
  width: number
  height: number
  renderNodes: {
    finishBatch(): void
    getNode(name: string): { batch(...args: unknown[]): void }
  }
  createTextureFromSource(
    source: null,
    width: number,
    height: number,
    scaleMode: number,
  ): { webGLTexture: WebGLTexture | null } | null
  deleteTexture(texture: { webGLTexture: WebGLTexture | null }): void
}

interface PhaserDrawingContext {
  width: number
  height: number
  texture: unknown
  framebuffer: unknown
  state: unknown
  beginDraw(): void
  getClone(preserveAutoClear?: boolean): PhaserDrawingContext
}

interface PhaserGraphics {
  _renderSteps: ((...args: unknown[]) => void)[]
  addRenderStep(fn: (...args: unknown[]) => void, index?: number): void
  once(event: string, fn: (...args: unknown[]) => void): void
}

// ---------------------------------------------------------------------------
// State tracked per Graphics object.
// ---------------------------------------------------------------------------

interface MsaaStepState {
  resources: MsaaResources
  caps: MsaaCapabilities
  samples: MsaaSamples
  detachContextLost: (() => void) | null
}

const msaaStateMap = new WeakMap<object, MsaaStepState>()

/**
 * Attach an MSAA render step to the given Graphics object if not already attached,
 * or update the sample count if it changed.
 *
 * This is the main entry point called by the draw pipeline after every SVG draw.
 * Safe to call on every update — it is a no-op when the step is already installed
 * with the correct sample count.
 */
export function attachMsaaRenderStep(
  graphics: Phaser.GameObjects.Graphics,
  renderer: PhaserRendererForStep,
  requestedSamples: MsaaSamples,
): void {
  const caps = detectMsaaCapabilities(
    renderer as unknown as Parameters<typeof detectMsaaCapabilities>[0],
  )
  if (!caps) {
    throw new Error(
      "phaser-svg MSAA: WebGL2 is required but not available on this renderer. " +
        "Create the game with a WebGL2-backed canvas (and explicit WEBGL render type), " +
        "or remove the msaaSamples option.",
    )
  }

  const samples = negotiateSamples(
    requestedSamples,
    caps,
    renderer.width,
    renderer.height,
  )

  const existing = msaaStateMap.get(graphics)

  if (existing) {
    // Update sample count if changed; resources will rebuild on next draw.
    existing.samples = samples
    return
  }

  const resources = new MsaaResources(caps.backend)
  const state: MsaaStepState = {
    resources,
    caps,
    samples,
    detachContextLost: null,
  }
  msaaStateMap.set(graphics, state)

  // Install the MSAA step at index 0 so the original Graphics render is at index 1.
  ;(graphics as unknown as PhaserGraphics).addRenderStep(
    buildRenderStepFn(state),
    0,
  )

  // Clean up resources when the Graphics object is destroyed.
  graphics.once("destroy", () => {
    const s = msaaStateMap.get(graphics)
    if (s) {
      s.resources.destroy(
        renderer as unknown as Parameters<MsaaResources["destroy"]>[0],
      )
      s.detachContextLost?.()
      msaaStateMap.delete(graphics)
    }
  })

  // On WebGL context loss, invalidate resources so they are rebuilt on the next draw.
  // The context-restored event on the renderer re-creates the GL context; our
  // ensureResources guard (webGLTexture === null check) triggers a full rebuild.
  const rendererEvents = renderer as unknown as {
    on?: ((event: string, fn: () => void) => void) | undefined
    off?: ((event: string, fn: () => void) => void) | undefined
  }
  if (typeof rendererEvents.on === "function") {
    const onContextLost = () => {
      // Resources become invalid; ensureResources will rebuild on next draw.
      state.resources.destroy(
        renderer as unknown as Parameters<MsaaResources["destroy"]>[0],
      )
    }
    rendererEvents.on("contextlost", onContextLost)
    state.detachContextLost =
      typeof rendererEvents.off === "function"
        ? () => {
            rendererEvents.off?.("contextlost", onContextLost)
          }
        : null
  }
}

// ---------------------------------------------------------------------------
// Render step implementation
// ---------------------------------------------------------------------------

function buildRenderStepFn(state: MsaaStepState): (...args: unknown[]) => void {
  return function msaaRenderStep(
    renderer: unknown,
    gameObject: unknown,
    drawingContext: unknown,
  ): void {
    const r = renderer as PhaserRendererForStep
    const g = gameObject as PhaserGraphics
    const ctx = drawingContext as PhaserDrawingContext

    // Ensure MSAA GPU resources exist at the current renderer size and sample count.
    state.resources.ensureResources(
      r as unknown as Parameters<MsaaResources["ensureResources"]>[0],
      state.caps,
      r.width,
      r.height,
      state.samples,
    )

    const renderNodes = r.renderNodes
    const { msaaFBOWrapper, resolvedTexture } = state.resources

    // 1. Flush any batch accumulated before this render step.
    renderNodes.finishBatch()

    // 2. Clone the DrawingContext and redirect it to the MSAA FBO.
    const msaaCtx = ctx.getClone(false)
    msaaCtx.framebuffer = msaaFBOWrapper
    msaaCtx.texture = resolvedTexture
    ;(
      msaaCtx.state as { bindings: { framebuffer: typeof msaaFBOWrapper } }
    ).bindings.framebuffer = msaaFBOWrapper

    // 3. Bind the MSAA FBO and clear it.
    msaaCtx.beginDraw()
    const gl = r.gl
    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)

    // 4. Execute the original Graphics renderWebGL step with the MSAA context.
    const originalStep = g._renderSteps[1]
    if (originalStep) {
      originalStep(r, gameObject, msaaCtx)
    }

    // 5. Flush remaining batched geometry into the MSAA FBO.
    renderNodes.finishBatch()

    // 6. Resolve MSAA to the resolved texture.
    state.resources.blitResolve(gl as WebGL2RenderingContext)

    // 7. Restore the original scene framebuffer.
    ctx.beginDraw()

    // 8. Composite the resolved texture over the scene with a full-screen quad.
    const w = ctx.width
    const h = ctx.height
    renderNodes.getNode("BatchHandlerQuadSingle").batch(
      ctx,
      resolvedTexture,
      // TL:
      0,
      0,
      // BL:
      0,
      h,
      // TR:
      w,
      0,
      // BR:
      w,
      h,
      // UV (u, v, uWidth, vHeight) with Y-flip for OpenGL/Phaser convention:
      0,
      1,
      1,
      -1,
      // not additive tint:
      false,
      // tint colours TL, BL, TR, BR (opaque white = 0xffffffff):
      0xffffffff,
      0xffffffff,
      0xffffffff,
      0xffffffff,
      // Render options are required by Phaser's batch handler internals.
      // Passing null causes updateRenderOptions() to dereference null.
      {},
    )
  }
}
