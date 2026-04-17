import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { drawNativeShape, parseNativeShape } from "./native-shape.ts"
import type { SVGStyle } from "./types.ts"

class SpyGraphics {
  fillTriangleCalls = 0

  fillStyle(): this {
    return this
  }

  fillEllipse(): this {
    return this
  }

  fillTriangle(): this {
    this.fillTriangleCalls += 1
    return this
  }
}

const STROKE_ONLY_STYLE: SVGStyle = {
  fill: null,
  fillAlpha: 1,
  stroke: 0xffffff,
  strokeAlpha: 1,
  strokeWidth: 4,
  lineJoin: "miter",
  lineCap: "butt",
  miterLimit: 4,
  opacity: 1,
}

describe("parseNativeShape transform support", () => {
  it("applies matrix transform to circle center", () => {
    const shape = parseNativeShape("circle", {
      cx: "33.5",
      cy: "33.5",
      r: "26",
      transform: "matrix(-1 0 0 1 245 249)",
    })

    assert.ok(shape)
    assert.equal(shape.kind, "circle")
    if (shape.kind === "circle") {
      assert.equal(shape.cx, 211.5)
      assert.equal(shape.cy, 282.5)
      assert.equal(shape.r, 26)
    }
  })

  it("applies matrix scale + translate to ellipse", () => {
    const shape = parseNativeShape("ellipse", {
      cx: "20",
      cy: "14",
      rx: "8",
      ry: "4",
      transform: "matrix(2 0 0 0.5 10 20)",
    })

    assert.ok(shape)
    assert.equal(shape.kind, "ellipse")
    if (shape.kind === "ellipse") {
      assert.equal(shape.cx, 50)
      assert.equal(shape.cy, 27)
      assert.equal(shape.rx, 16)
      assert.equal(shape.ry, 2)
    }
  })

  it("ignores unsupported transform syntax", () => {
    const shape = parseNativeShape("circle", {
      cx: "10",
      cy: "12",
      r: "3",
      transform: "translate(40 50)",
    })

    assert.ok(shape)
    assert.equal(shape.kind, "circle")
    if (shape.kind === "circle") {
      assert.equal(shape.cx, 10)
      assert.equal(shape.cy, 12)
      assert.equal(shape.r, 3)
    }
  })

  it("uses curveTolerance when sampling native stroke rings", () => {
    const shape = parseNativeShape("ellipse", {
      cx: "20",
      cy: "14",
      rx: "64",
      ry: "32",
    })

    assert.ok(shape)

    const coarseGraphics = new SpyGraphics()
    drawNativeShape(coarseGraphics as never, shape, STROKE_ONLY_STYLE, {
      curveTolerance: 0.5,
    })

    const fineGraphics = new SpyGraphics()
    drawNativeShape(fineGraphics as never, shape, STROKE_ONLY_STYLE, {
      curveTolerance: 0.05,
    })

    assert.ok(fineGraphics.fillTriangleCalls > coarseGraphics.fillTriangleCalls)
  })
})
