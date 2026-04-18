import assert from "node:assert/strict"
import { describe, it } from "node:test"
import type Phaser from "phaser"
import type { CompiledSVG } from "./compiler.ts"
import { drawCompiledSVG, drawCompiledSVGIfDirty, drawSVGPath } from "./draw.ts"
import type { SVGStyle } from "./types.ts"

class GraphicsWithoutRenderer {
  clear(): this {
    return this
  }

  lineStyle(_width: number, _color: number, _alpha: number): this {
    return this
  }

  fillStyle(_color: number, _alpha: number): this {
    return this
  }

  beginPath(): this {
    return this
  }

  moveTo(_x: number, _y: number): this {
    return this
  }

  lineTo(_x: number, _y: number): this {
    return this
  }

  closePath(): this {
    return this
  }

  fillPath(): this {
    return this
  }

  strokePath(): this {
    return this
  }

  fillCircle(_x: number, _y: number, _radius: number): this {
    return this
  }

  fillEllipse(
    _x: number,
    _y: number,
    _width: number,
    _height: number,
    _smoothness?: number,
  ): this {
    return this
  }

  fillTriangle(
    _x0: number,
    _y0: number,
    _x1: number,
    _y1: number,
    _x2: number,
    _y2: number,
  ): this {
    return this
  }
}

class GraphicsWithRenderer extends GraphicsWithoutRenderer {
  _renderSteps: ((...args: unknown[]) => void)[] = []

  scene: {
    sys: {
      game: {
        renderer: unknown
      }
    }
  }

  constructor(renderer: unknown) {
    super()
    this.scene = {
      sys: {
        game: {
          renderer,
        },
      },
    }
  }

  addRenderStep(fn: (...args: unknown[]) => void, index = 0): this {
    this._renderSteps.splice(index, 0, fn)
    return this
  }

  once(_event: string, _fn: (...args: unknown[]) => void): this {
    return this
  }
}

const DEFAULT_STYLE: SVGStyle = {
  fill: 0x000000,
  fillAlpha: 1,
  stroke: null,
  strokeAlpha: 1,
  strokeWidth: 1,
  lineJoin: "miter",
  lineCap: "butt",
  miterLimit: 4,
  opacity: 1,
}

function asGraphics(
  graphics: GraphicsWithoutRenderer | GraphicsWithRenderer,
): Phaser.GameObjects.Graphics {
  return graphics as unknown as Phaser.GameObjects.Graphics
}

function withFakeWebGL2Context(testFn: () => void): void {
  const globals = globalThis as unknown as {
    WebGL2RenderingContext?: unknown
  }
  const previous = globals.WebGL2RenderingContext

  class FakeWebGL2Context {
    readonly MAX_SAMPLES = 0x8d57

    getParameter(param: number): number {
      return param === this.MAX_SAMPLES ? 8 : 0
    }
  }

  globals.WebGL2RenderingContext =
    FakeWebGL2Context as unknown as typeof WebGL2RenderingContext

  try {
    testFn()
  } finally {
    if (previous === undefined) {
      delete globals.WebGL2RenderingContext
    } else {
      globals.WebGL2RenderingContext = previous
    }
  }
}

function createRendererWithFakeWebGL2(options?: {
  withConfig?: boolean
}): unknown {
  const gl = new (
    globalThis as unknown as {
      WebGL2RenderingContext: new () => unknown
    }
  ).WebGL2RenderingContext()

  const renderer: {
    gl: unknown
    width: number
    height: number
    config?: { pathDetailThreshold: number } | undefined
    pathDetailThreshold?: number | undefined
    renderNodes: {
      finishBatch: () => void
      getNode: () => { batch: () => void }
    }
    createTextureFromSource: () => { webGLTexture: null }
    deleteTexture: () => void
  } = {
    gl,
    width: 256,
    height: 256,
    renderNodes: {
      finishBatch: () => {},
      getNode: () => ({ batch: () => {} }),
    },
    createTextureFromSource: () => ({ webGLTexture: null }),
    deleteTexture: () => {},
  }

  if (options?.withConfig === false) {
    renderer.pathDetailThreshold = 1
  } else {
    renderer.config = { pathDetailThreshold: 1 }
  }

  return renderer
}

describe("MSAA default x2 behavior", () => {
  it("drawSVGPath fails loudly when no WebGL renderer exists", () => {
    const graphics = asGraphics(new GraphicsWithoutRenderer())

    assert.throws(
      () => drawSVGPath(graphics, "M 0 0 L 10 0 L 10 10 Z"),
      /WebGL renderer is required/,
    )
  })

  it("drawCompiledSVG applies MSAA on compiled items branch", () => {
    const compiled: CompiledSVG = {
      viewBox: null,
      items: [
        {
          kind: "native",
          shape: { kind: "circle", cx: 16, cy: 16, r: 8 },
          style: DEFAULT_STYLE,
        },
      ],
    }

    const graphics = asGraphics(new GraphicsWithoutRenderer())

    assert.throws(
      () => drawCompiledSVG(graphics, compiled),
      /WebGL renderer is required/,
    )
  })

  it("uses compiled default msaaSamples and allows per-draw override", () => {
    withFakeWebGL2Context(() => {
      const renderer = createRendererWithFakeWebGL2()
      const graphics = asGraphics(new GraphicsWithRenderer(renderer))

      const compiled: CompiledSVG = {
        viewBox: null,
        msaaSamples: 8,
        items: [
          {
            kind: "path",
            commands: [{ type: "M", x: 0, y: 0 }],
            style: {
              ...DEFAULT_STYLE,
              fill: null,
            },
          },
        ],
      }

      const first = drawCompiledSVGIfDirty(graphics, compiled)
      const second = drawCompiledSVGIfDirty(graphics, compiled, {
        msaaSamples: 4,
      })
      const third = drawCompiledSVGIfDirty(graphics, compiled, {
        msaaSamples: 4,
      })

      assert.equal(first, true)
      assert.equal(second, true)
      assert.equal(third, false)
    })
  })

  it("disables simplification when renderer exposes top-level threshold", () => {
    withFakeWebGL2Context(() => {
      const renderer = createRendererWithFakeWebGL2({ withConfig: false }) as {
        pathDetailThreshold?: number
      }
      const graphics = asGraphics(new GraphicsWithRenderer(renderer))

      drawSVGPath(graphics, "M 0 0 L 10 0 L 10 10 Z")

      assert.equal(renderer.pathDetailThreshold, 0)
    })
  })
})
