import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { renderPath } from "./renderer.ts"
import type { PathCommand, SVGStyle } from "./types.ts"

class SpyGraphics {
  calls = {
    lineStyle: 0,
    fillStyle: 0,
    beginPath: 0,
    moveTo: 0,
    lineTo: 0,
    closePath: 0,
    fillPath: 0,
    strokePath: 0,
    fillCircle: 0,
    fillEllipse: 0,
    fillTriangle: 0,
  }

  lineStyle(): this {
    this.calls.lineStyle += 1
    return this
  }

  fillStyle(): this {
    this.calls.fillStyle += 1
    return this
  }

  beginPath(): this {
    this.calls.beginPath += 1
    return this
  }

  moveTo(): this {
    this.calls.moveTo += 1
    return this
  }

  lineTo(): this {
    this.calls.lineTo += 1
    return this
  }

  closePath(): this {
    this.calls.closePath += 1
    return this
  }

  fillPath(): this {
    this.calls.fillPath += 1
    return this
  }

  strokePath(): this {
    this.calls.strokePath += 1
    return this
  }

  fillCircle(): this {
    this.calls.fillCircle += 1
    return this
  }

  fillEllipse(): this {
    this.calls.fillEllipse += 1
    return this
  }

  fillTriangle(): this {
    this.calls.fillTriangle += 1
    return this
  }
}

const OPEN_PATH: PathCommand[] = [
  { type: "M", x: 0, y: 0 },
  { type: "L", x: 10, y: 0 },
  { type: "L", x: 10, y: 10 },
]

function makeStyle(overrides: Partial<SVGStyle>): SVGStyle {
  return {
    fill: null,
    fillAlpha: 1,
    stroke: null,
    strokeAlpha: 1,
    strokeWidth: 1,
    lineJoin: "miter",
    lineCap: "butt",
    miterLimit: 4,
    opacity: 1,
    ...overrides,
  }
}

describe("renderPath fast paths", () => {
  it("skips all draw work when fill/stroke are fully invisible", () => {
    const graphics = new SpyGraphics()
    const style = makeStyle({
      fill: 0xffffff,
      fillAlpha: 0,
      stroke: 0xffffff,
      strokeAlpha: 0,
      strokeWidth: 3,
    })

    renderPath(graphics as never, OPEN_PATH, style)

    assert.equal(graphics.calls.lineStyle, 0)
    assert.equal(graphics.calls.beginPath, 0)
    assert.equal(graphics.calls.strokePath, 0)
    assert.equal(graphics.calls.fillPath, 0)
    assert.equal(graphics.calls.fillCircle, 0)
  })

  it("skips stroke work when stroke width is zero", () => {
    const graphics = new SpyGraphics()
    const style = makeStyle({
      stroke: 0xffffff,
      strokeAlpha: 1,
      strokeWidth: 0,
    })

    renderPath(graphics as never, OPEN_PATH, style)

    assert.equal(graphics.calls.lineStyle, 0)
    assert.equal(graphics.calls.strokePath, 0)
    assert.equal(graphics.calls.fillCircle, 0)
  })

  it("still renders visible strokes", () => {
    const graphics = new SpyGraphics()
    const style = makeStyle({
      stroke: 0xffffff,
      strokeAlpha: 1,
      strokeWidth: 3,
      lineJoin: "round",
    })

    renderPath(graphics as never, OPEN_PATH, style)

    assert.ok(graphics.calls.lineStyle > 0)
    assert.ok(graphics.calls.strokePath > 0)
    assert.ok(graphics.calls.fillCircle > 0)
  })
})
