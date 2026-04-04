import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { transformCommands, viewBoxTransform } from "./transform.ts"
import type { PathCommand } from "./types.ts"

describe("viewBoxTransform", () => {
  it("returns identity when viewBox matches target", () => {
    const t = viewBoxTransform(
      { minX: 0, minY: 0, width: 100, height: 100 },
      100,
      100,
    )
    assert.equal(t.scale, 1)
    assert.equal(t.tx, 0)
    assert.equal(t.ty, 0)
  })

  it("scales down uniformly (meet)", () => {
    const t = viewBoxTransform(
      { minX: 0, minY: 0, width: 200, height: 100 },
      100,
      50,
    )
    assert.equal(t.scale, 0.5)
    assert.equal(t.tx, 0)
    assert.equal(t.ty, 0)
  })

  it("centers vertically when width-limited", () => {
    const t = viewBoxTransform(
      { minX: 0, minY: 0, width: 200, height: 100 },
      100,
      100,
    )
    // scale = min(100/200, 100/100) = 0.5
    assert.equal(t.scale, 0.5)
    assert.equal(t.tx, 0)
    // centering: (100 - 100 * 0.5) / 2 = 25
    assert.equal(t.ty, 25)
  })

  it("centers horizontally when height-limited", () => {
    const t = viewBoxTransform(
      { minX: 0, minY: 0, width: 100, height: 200 },
      100,
      100,
    )
    // scale = min(100/100, 100/200) = 0.5
    assert.equal(t.scale, 0.5)
    assert.equal(t.tx, 25)
    assert.equal(t.ty, 0)
  })

  it("accounts for non-zero viewBox origin", () => {
    const t = viewBoxTransform(
      { minX: 10, minY: 20, width: 100, height: 100 },
      100,
      100,
    )
    assert.equal(t.scale, 1)
    assert.equal(t.tx, -10)
    assert.equal(t.ty, -20)
  })
})

describe("transformCommands", () => {
  it("scales and translates M and L commands", () => {
    const cmds: PathCommand[] = [
      { type: "M", x: 10, y: 20 },
      { type: "L", x: 30, y: 40 },
    ]
    const result = transformCommands(cmds, 2, 5, 10)
    assert.deepStrictEqual(result, [
      { type: "M", x: 25, y: 50 },
      { type: "L", x: 65, y: 90 },
    ])
  })

  it("scales cubic bezier control points", () => {
    const cmds: PathCommand[] = [
      { type: "C", x1: 1, y1: 2, x2: 3, y2: 4, x: 5, y: 6 },
    ]
    const result = transformCommands(cmds, 2, 0, 0)
    assert.deepStrictEqual(result, [
      { type: "C", x1: 2, y1: 4, x2: 6, y2: 8, x: 10, y: 12 },
    ])
  })

  it("scales arc radii", () => {
    const cmds: PathCommand[] = [
      {
        type: "A",
        rx: 10,
        ry: 20,
        xAxisRotation: 45,
        largeArc: true,
        sweep: false,
        x: 100,
        y: 200,
      },
    ]
    const result = transformCommands(cmds, 0.5, 0, 0)
    assert.deepStrictEqual(result, [
      {
        type: "A",
        rx: 5,
        ry: 10,
        xAxisRotation: 45,
        largeArc: true,
        sweep: false,
        x: 50,
        y: 100,
      },
    ])
  })

  it("passes Z through unchanged", () => {
    const cmds: PathCommand[] = [{ type: "Z" }]
    const result = transformCommands(cmds, 3, 10, 20)
    assert.deepStrictEqual(result, [{ type: "Z" }])
  })
})
