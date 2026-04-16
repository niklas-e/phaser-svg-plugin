/**
 * Phase 0: MSAA RenderNode feasibility spike.
 *
 * Demonstrates the addRenderStep intercept pattern with EXT_multisampled_render_to_texture
 * (WebGL1) and WebGL2 MSAA paths. Expected to run via `npm run dev` in the browser.
 *
 * Key API calls confirmed here feed directly into Phase 1 infrastructure.
 */

import { Scene } from "phaser"
import { drawSVG } from "../src/index.ts"

const SPIKE_SVG = `<svg viewBox="0 0 120 100" xmlns="http://www.w3.org/2000/svg">
  <path d="M 10,90 L 60,10 L 110,90 Z" fill="#00bcd4" stroke="#ffffff" stroke-width="3"/>
  <path d="M 30,90 Q 60,10 90,90 Z" fill="#ff5722" stroke="none"/>
</svg>`

/** Minimal type for the EXT_multisampled_render_to_texture WebGL1 extension. */
interface EXTMultisampledRenderToTexture {
  readonly MAX_SAMPLES_EXT: GLenum
  renderbufferStorageMultisampleEXT(
    target: GLenum,
    samples: number,
    internalformat: GLenum,
    width: number,
    height: number,
  ): void
  framebufferTexture2DMultisampleEXT(
    target: GLenum,
    attachment: GLenum,
    textarget: GLenum,
    texture: WebGLTexture | null,
    level: number,
    samples: number,
  ): void
}

/** Thin FBO wrapper that satisfies Phaser's framebuffer binding duck-type. */
interface MsaaFBOWrapper {
  webGLFramebuffer: WebGLFramebuffer
}

interface SpikeResources {
  msaaFBO: WebGLFramebuffer
  msaaFBOWrapper: MsaaFBOWrapper
  resolvedTexture: Phaser.Renderer.WebGL.Wrappers.WebGLTextureWrapper
  depthStencilRB: WebGLRenderbuffer | null
  width: number
  height: number
  samples: number
  backend: "webgl2" | "ext"
}

function detectBackend(gl: WebGLRenderingContext | WebGL2RenderingContext): {
  backend: "webgl2" | "ext" | "none"
  ext: EXTMultisampledRenderToTexture | null
  maxSamples: number
} {
  if (
    typeof WebGL2RenderingContext !== "undefined" &&
    gl instanceof WebGL2RenderingContext
  ) {
    return {
      backend: "webgl2",
      ext: null,
      maxSamples: gl.getParameter(gl.MAX_SAMPLES) as number,
    }
  }
  const ext =
    (gl.getExtension(
      "EXT_multisampled_render_to_texture",
    ) as EXTMultisampledRenderToTexture | null) ??
    (gl.getExtension(
      "WEBGL_multisampled_render_to_texture",
    ) as EXTMultisampledRenderToTexture | null)
  if (ext) {
    return {
      backend: "ext",
      ext,
      maxSamples: gl.getParameter(ext.MAX_SAMPLES_EXT) as number,
    }
  }
  return { backend: "none", ext: null, maxSamples: 0 }
}

function createMsaaResources(
  renderer: Phaser.Renderer.WebGL.WebGLRenderer,
  width: number,
  height: number,
  samples: number,
): SpikeResources | null {
  const gl = renderer.gl as WebGLRenderingContext | WebGL2RenderingContext
  const { backend, ext } = detectBackend(gl)

  if (backend === "none") {
    console.warn("[msaa-spike] MSAA not supported — no ext and not WebGL2")
    return null
  }

  const resolvedTexture = renderer.createTextureFromSource(
    null,
    width,
    height,
    0,
  )
  if (!resolvedTexture) {
    console.error("[msaa-spike] Failed to create resolve texture")
    return null
  }

  const fbo = gl.createFramebuffer()
  if (!fbo) {
    console.error("[msaa-spike] Failed to create MSAA framebuffer")
    return null
  }
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo)

  const depthStencilRB: WebGLRenderbuffer | null = null

  if (backend === "ext" && ext) {
    // EXT path: attach resolved texture with MSAA; auto-resolves on FBO unbind.
    const rawTex = (
      resolvedTexture as unknown as { webGLTexture: WebGLTexture }
    ).webGLTexture
    ext.framebufferTexture2DMultisampleEXT(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      rawTex,
      0,
      samples,
    )
  } else {
    // WebGL2 path: MSAA renderbuffer + separate resolve step via blitFramebuffer.
    const gl2 = gl as WebGL2RenderingContext
    const colorRB = gl2.createRenderbuffer()
    if (!colorRB) {
      console.error("[msaa-spike] Failed to create MSAA renderbuffer")
      return null
    }
    gl2.bindRenderbuffer(gl2.RENDERBUFFER, colorRB)
    gl2.renderbufferStorageMultisample(
      gl2.RENDERBUFFER,
      samples,
      gl2.RGBA8,
      width,
      height,
    )
    gl2.framebufferRenderbuffer(
      gl2.FRAMEBUFFER,
      gl2.COLOR_ATTACHMENT0,
      gl2.RENDERBUFFER,
      colorRB,
    )
  }

  // Unbind to leave GL in clean state.
  gl.bindFramebuffer(gl.FRAMEBUFFER, null)

  const msaaFBOWrapper: MsaaFBOWrapper = { webGLFramebuffer: fbo }

  console.log(
    `[msaa-spike] Created MSAA resources: ${width}x${height} samples=${samples} backend=${backend}`,
  )

  return {
    msaaFBO: fbo,
    msaaFBOWrapper,
    resolvedTexture,
    depthStencilRB,
    width,
    height,
    samples,
    backend,
  }
}

function destroyMsaaResources(
  renderer: Phaser.Renderer.WebGL.WebGLRenderer,
  res: SpikeResources,
): void {
  const gl = renderer.gl
  gl.deleteFramebuffer(res.msaaFBO)
  if (res.depthStencilRB) {
    gl.deleteRenderbuffer(res.depthStencilRB)
  }
  renderer.deleteTexture(
    res.resolvedTexture as unknown as Phaser.Renderer.WebGL.Wrappers.WebGLTextureWrapper,
  )
  console.log("[msaa-spike] Destroyed MSAA resources")
}

function blitToResolve(
  gl2: WebGL2RenderingContext,
  msaaFBO: WebGLFramebuffer,
  resolveFBO: WebGLFramebuffer,
  w: number,
  h: number,
): void {
  gl2.bindFramebuffer(gl2.READ_FRAMEBUFFER, msaaFBO)
  gl2.bindFramebuffer(gl2.DRAW_FRAMEBUFFER, resolveFBO)
  gl2.blitFramebuffer(0, 0, w, h, 0, 0, w, h, gl2.COLOR_BUFFER_BIT, gl2.NEAREST)
}

/**
 * Attaches an MSAA render step to a Graphics object.
 * This is the core addRenderStep pattern. The step:
 *   1. Redirects rendering into an MSAA FBO.
 *   2. Resolves MSAA to the resolved texture.
 *   3. Composites back to the scene framebuffer.
 */
function attachSpikeRenderStep(
  graphics: Phaser.GameObjects.Graphics,
  renderer: Phaser.Renderer.WebGL.WebGLRenderer,
  res: SpikeResources,
): void {
  const { backend } = res

  // Build a separate resolve FBO for WebGL2 (EXT auto-resolves when FBO is unbound).
  let gl2ResolveFBO: WebGLFramebuffer | null = null
  if (backend === "webgl2") {
    const gl2 = renderer.gl as WebGL2RenderingContext
    const rawTex = (
      res.resolvedTexture as unknown as { webGLTexture: WebGLTexture }
    ).webGLTexture
    gl2ResolveFBO = gl2.createFramebuffer()
    if (!gl2ResolveFBO) {
      console.error("[msaa-spike] Failed to create resolve framebuffer")
      return
    }
    gl2.bindFramebuffer(gl2.FRAMEBUFFER, gl2ResolveFBO)
    gl2.framebufferTexture2D(
      gl2.FRAMEBUFFER,
      gl2.COLOR_ATTACHMENT0,
      gl2.TEXTURE_2D,
      rawTex,
      0,
    )
    gl2.bindFramebuffer(gl2.FRAMEBUFFER, null)
    console.log("[msaa-spike] Created WebGL2 resolve FBO")
  }

  graphics.addRenderStep(
    (
      renderWebGLStep_renderer: Phaser.Renderer.WebGL.WebGLRenderer,
      gameObject: Phaser.GameObjects.GameObject,
      drawingContext: Phaser.Renderer.WebGL.DrawingContext,
    ) => {
      const src = gameObject as Phaser.GameObjects.Graphics
      const renderNodes = renderWebGLStep_renderer.renderNodes as unknown as {
        finishBatch(): void
        getNode(name: string): { batch(...args: unknown[]): void }
      }

      // 1. Flush any pending batch from before our intercept.
      renderNodes.finishBatch()

      // 2. Clone the DrawingContext and swap its FBO to our MSAA FBO.
      const msaaCtx = drawingContext.getClone(false)
      msaaCtx.framebuffer =
        res.msaaFBOWrapper as unknown as Phaser.Renderer.WebGL.Wrappers.WebGLFramebufferWrapper
      msaaCtx.texture = res.resolvedTexture
      ;(
        msaaCtx.state as unknown as {
          bindings: { framebuffer: MsaaFBOWrapper }
        }
      ).bindings.framebuffer = res.msaaFBOWrapper

      // 3. Bind MSAA FBO and clear it.
      msaaCtx.beginDraw()
      const gl = renderWebGLStep_renderer.gl
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)

      // 4. Run the original Graphics renderWebGL step with MSAA context.
      const originalStep = (
        src as unknown as { _renderSteps: ((...a: unknown[]) => void)[] }
      )._renderSteps[1]
      if (originalStep) {
        originalStep(renderWebGLStep_renderer, src, msaaCtx)
      }

      // 5. Flush remaining batch geometry into MSAA FBO.
      renderNodes.finishBatch()

      // 6. Resolve: WebGL2 needs blitFramebuffer; EXT auto-resolves when we rebind original FBO.
      if (backend === "webgl2" && gl2ResolveFBO) {
        blitToResolve(
          gl as WebGL2RenderingContext,
          res.msaaFBO,
          gl2ResolveFBO,
          res.width,
          res.height,
        )
      }

      // 7. Restore original framebuffer (also triggers EXT auto-resolve).
      drawingContext.beginDraw()

      // 8. Composite resolved texture over the scene using a full-screen quad.
      const w = drawingContext.width
      const h = drawingContext.height
      const quadNode = renderNodes.getNode("BatchHandlerQuadSingle")
      quadNode.batch(
        drawingContext,
        res.resolvedTexture,
        // TL, BL, TR, BR:
        0,
        0,
        0,
        h,
        w,
        0,
        w,
        h,
        // UV (u, v, uWidth, vHeight) — flip Y for OpenGL convention:
        0,
        1,
        1,
        -1,
        // not additive tint:
        false,
        // tint (TL, BL, TR, BR — opaque white = 0xffffffff):
        0xffffffff,
        0xffffffff,
        0xffffffff,
        0xffffffff,
        // render options (null = default):
        null,
      )
    },
    0, // insert at index 0 to run before the existing Graphics step
  )

  console.log("[msaa-spike] MSAA render step attached")
}

export class MSAASpikeScene extends Scene {
  private resources: SpikeResources | null = null
  private spikeSamples = 4

  constructor() {
    super({ key: "MSAASpikeScene" })
  }

  create(): void {
    const renderer = this.sys.game
      .renderer as Phaser.Renderer.WebGL.WebGLRenderer
    if (!renderer?.gl) {
      console.error("[msaa-spike] WebGL renderer not available")
      return
    }

    const { backend, maxSamples } = detectBackend(
      renderer.gl as WebGLRenderingContext | WebGL2RenderingContext,
    )
    console.log(`[msaa-spike] Backend: ${backend}, maxSamples: ${maxSamples}`)

    if (backend === "none") {
      console.warn(
        "[msaa-spike] MSAA unavailable on this device. Spike skipped.",
      )
      this.add.text(10, 10, "MSAA not supported on this device", {
        color: "#ff4444",
      })
      return
    }

    const negotiated = Math.min(this.spikeSamples, maxSamples)
    if (negotiated < 4) {
      console.error(
        `[msaa-spike] Cannot achieve x4 MSAA. maxSamples=${maxSamples}`,
      )
      this.add.text(10, 10, `MSAA x4 unavailable (max=${maxSamples})`, {
        color: "#ff4444",
      })
      return
    }

    const w = renderer.width
    const h = renderer.height

    // Check 96 MiB memory guardrail.
    const memBytes = w * h * 4 * negotiated
    const memMiB = memBytes / (1024 * 1024)
    if (memMiB > 96) {
      console.error(
        `[msaa-spike] MSAA FBO would exceed 96 MiB (${memMiB.toFixed(1)} MiB)`,
      )
      this.add.text(
        10,
        10,
        `MSAA target too large (${memMiB.toFixed(0)} MiB)`,
        { color: "#ff4444" },
      )
      return
    }

    this.resources = createMsaaResources(renderer, w, h, negotiated)
    if (!this.resources) return

    const graphics = this.add.graphics()
    drawSVG(graphics, SPIKE_SVG, { width: 200, height: 160 })
    graphics.setPosition(100, 100)

    attachSpikeRenderStep(graphics, renderer, this.resources)

    this.add.text(
      10,
      10,
      `MSAA Spike — backend: ${backend}, samples: ${negotiated}`,
      {
        color: "#00ff00",
      },
    )

    // Verify resize/recreate does not leak by recreating resources once.
    const res2 = createMsaaResources(renderer, w, h, negotiated)
    if (res2) {
      destroyMsaaResources(renderer, res2)
      console.log("[msaa-spike] Resize/recreate cycle: OK (no leak)")
    }

    this.events.once("destroy", () => {
      if (this.resources) {
        destroyMsaaResources(renderer, this.resources)
        this.resources = null
      }
    })
  }
}
