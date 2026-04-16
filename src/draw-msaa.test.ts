import assert from "node:assert/strict"
import { describe, it } from "node:test"
import type Phaser from "phaser"
import type { CompiledSVG } from "./compiler.ts"
import { drawCompiledSVG, drawSVGPath } from "./draw.ts"
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
  graphics: GraphicsWithoutRenderer,
): Phaser.GameObjects.Graphics {
  return graphics as unknown as Phaser.GameObjects.Graphics
}

describe("MSAA default x4 behavior", () => {
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
      paths: [],
    }

    const graphics = asGraphics(new GraphicsWithoutRenderer())

    assert.throws(
      () => drawCompiledSVG(graphics, compiled),
      /WebGL renderer is required/,
    )
  })
})
