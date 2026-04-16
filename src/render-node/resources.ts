import { assertDefined } from "../assert.ts"
import type { MsaaBackend, MsaaCapabilities, MsaaFBOWrapper } from "./types.ts"

/** Phaser renderer duck-type — only what resource management needs. */
interface PhaserRendererForResources {
  gl: WebGLRenderingContext
  createTextureFromSource(
    source: null,
    width: number,
    height: number,
    scaleMode: number,
  ): PhaserTextureWrapper | null
  deleteTexture(texture: PhaserTextureWrapper): void
}

/** Duck-typed Phaser WebGLTextureWrapper — only what we reference. */
interface PhaserTextureWrapper {
  webGLTexture: WebGLTexture | null
}

/**
 * All GPU resources owned by a single MSAA render step.
 * One instance is created per Graphics object that uses MSAA.
 */
export class MsaaResources {
  readonly backend: MsaaBackend

  /** Full-screen MSAA FBO (WebGL2 MSAA renderbuffer). */
  private msaaFBO: WebGLFramebuffer | null = null

  /** Thin wrapper recognised by Phaser's `glWrapper.updateBindingsFramebuffer`. */
  private _msaaFBOWrapper: MsaaFBOWrapper | null = null

  /** Resolved (non-MSAA) texture — used by BatchHandlerQuadSingle to composite. */
  private _resolvedTexture: PhaserTextureWrapper | null = null

  /** Separate FBO for the blit-resolve target texture. */
  private resolveFBO: WebGLFramebuffer | null = null

  /** Colour renderbuffer for WebGL2 path. */
  private colorRB: WebGLRenderbuffer | null = null

  private _width = 0
  private _height = 0
  private _samples = 0

  constructor(backend: MsaaBackend) {
    this.backend = backend
  }

  get width(): number {
    return this._width
  }
  get height(): number {
    return this._height
  }
  get samples(): number {
    return this._samples
  }

  get msaaFBOWrapper(): MsaaFBOWrapper {
    if (!this._msaaFBOWrapper)
      throw new Error("phaser-svg MSAA: resources not initialised")
    return this._msaaFBOWrapper
  }

  get resolvedTexture(): PhaserTextureWrapper {
    if (!this._resolvedTexture)
      throw new Error("phaser-svg MSAA: resources not initialised")
    return this._resolvedTexture
  }

  /**
   * Ensure GPU resources exist at the given size and sample count.
   * Creates resources on first call; rebuilds if size or sample count changed;
   * also rebuilds if the GL object has been invalidated (context loss recovery).
   */
  ensureResources(
    renderer: PhaserRendererForResources,
    caps: MsaaCapabilities,
    width: number,
    height: number,
    samples: number,
  ): void {
    const needsRebuild =
      this._width !== width ||
      this._height !== height ||
      this._samples !== samples ||
      this.msaaFBO === null ||
      this._resolvedTexture?.webGLTexture === null // context loss invalidates textures

    if (!needsRebuild) return

    this.destroyGL(renderer)
    this.allocate(renderer, caps, width, height, samples)
  }

  /**
   * Explicitly release GL resources. Called on context loss or Graphics destroy.
   */
  destroy(renderer: PhaserRendererForResources): void {
    this.destroyGL(renderer)
  }

  /**
   * Blit MSAA renderbuffer to the resolve FBO. Only called on the WebGL2 path.
   */
  blitResolve(gl2: WebGL2RenderingContext): void {
    if (!this.msaaFBO || !this.resolveFBO) return
    gl2.bindFramebuffer(gl2.READ_FRAMEBUFFER, this.msaaFBO)
    gl2.bindFramebuffer(gl2.DRAW_FRAMEBUFFER, this.resolveFBO)
    gl2.blitFramebuffer(
      0,
      0,
      this._width,
      this._height,
      0,
      0,
      this._width,
      this._height,
      gl2.COLOR_BUFFER_BIT,
      gl2.NEAREST,
    )
  }

  // ---------------------------------------------------------------------------

  private allocate(
    renderer: PhaserRendererForResources,
    _caps: MsaaCapabilities,
    width: number,
    height: number,
    samples: number,
  ): void {
    const gl = renderer.gl as WebGLRenderingContext | WebGL2RenderingContext

    // Create the resolved RGBA texture (owned by Phaser for safe composite use).
    const tex = assertDefined(
      renderer.createTextureFromSource(null, width, height, 0),
      `phaser-svg MSAA: could not allocate ${width}x${height} resolved texture`,
    )
    this._resolvedTexture = tex
    const rawTex = assertDefined(
      tex.webGLTexture,
      "phaser-svg MSAA: resolved texture has no webGLTexture",
    )

    const fbo = assertDefined(
      gl.createFramebuffer(),
      "phaser-svg MSAA: failed to create MSAA framebuffer",
    )
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo)

    const gl2 = gl as WebGL2RenderingContext
    allocateWebGL2FBO(gl2, samples, width, height)
    this.colorRB = gl2.getParameter(
      gl2.RENDERBUFFER_BINDING,
    ) as WebGLRenderbuffer

    // Create a second FBO for the blit-resolve target texture.
    this.resolveFBO = assertDefined(
      gl.createFramebuffer(),
      "phaser-svg MSAA: failed to create resolve framebuffer",
    )
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.resolveFBO)
    gl2.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      rawTex,
      0,
    )

    gl.bindFramebuffer(gl.FRAMEBUFFER, null)

    this.msaaFBO = fbo
    this._msaaFBOWrapper = { webGLFramebuffer: fbo }
    this._width = width
    this._height = height
    this._samples = samples
  }

  private destroyGL(renderer: PhaserRendererForResources): void {
    const gl = renderer.gl

    if (this.msaaFBO) {
      gl.deleteFramebuffer(this.msaaFBO)
      this.msaaFBO = null
      this._msaaFBOWrapper = null
    }
    if (this.resolveFBO) {
      gl.deleteFramebuffer(this.resolveFBO)
      this.resolveFBO = null
    }
    if (this.colorRB) {
      gl.deleteRenderbuffer(this.colorRB)
      this.colorRB = null
    }
    if (this._resolvedTexture) {
      renderer.deleteTexture(this._resolvedTexture)
      this._resolvedTexture = null
    }

    this._width = 0
    this._height = 0
    this._samples = 0
  }
}

// ---------------------------------------------------------------------------
// Internal GL setup helpers
// ---------------------------------------------------------------------------

function allocateWebGL2FBO(
  gl2: WebGL2RenderingContext,
  samples: number,
  width: number,
  height: number,
): void {
  const colorRB = assertDefined(
    gl2.createRenderbuffer(),
    "phaser-svg MSAA: failed to create MSAA renderbuffer",
  )
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
