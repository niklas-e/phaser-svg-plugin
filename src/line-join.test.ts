import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { computeBevelJoin } from "./line-join.ts"

function assertClose(actual: number, expected: number, tolerance = 0.001) {
  assert.ok(
    Math.abs(actual - expected) < tolerance,
    `Expected ${actual} to be close to ${expected}`,
  )
}

describe("computeBevelJoin", () => {
  it("computes bevel for CW turn (right then down)", () => {
    const result = computeBevelJoin(
      { x: 0, y: 100 },
      { x: 100, y: 100 },
      { x: 100, y: 200 },
      5,
    )
    assert.ok(result)
    // Outer offsets: top of incoming, right of outgoing
    assertClose(result[0].x, 100)
    assertClose(result[0].y, 95)
    assertClose(result[1].x, 105)
    assertClose(result[1].y, 100)
  })

  it("computes bevel for CCW turn (right then up)", () => {
    const result = computeBevelJoin(
      { x: 0, y: 100 },
      { x: 100, y: 100 },
      { x: 100, y: 0 },
      5,
    )
    assert.ok(result)
    // Outer offsets: bottom of incoming, right of outgoing
    assertClose(result[0].x, 100)
    assertClose(result[0].y, 105)
    assertClose(result[1].x, 105)
    assertClose(result[1].y, 100)
  })

  it("scales offset with halfWidth", () => {
    const r5 = computeBevelJoin(
      { x: 0, y: 100 },
      { x: 100, y: 100 },
      { x: 100, y: 200 },
      5,
    )
    const r10 = computeBevelJoin(
      { x: 0, y: 100 },
      { x: 100, y: 100 },
      { x: 100, y: 200 },
      10,
    )
    assert.ok(r5)
    assert.ok(r10)
    assertClose(r5[0].y, 95)
    assertClose(r10[0].y, 90)
    assertClose(r5[1].x, 105)
    assertClose(r10[1].x, 110)
  })

  it("returns null for collinear points", () => {
    assert.equal(
      computeBevelJoin({ x: 0, y: 0 }, { x: 50, y: 0 }, { x: 100, y: 0 }, 5),
      null,
    )
  })

  it("returns null for coincident prev and vertex", () => {
    assert.equal(
      computeBevelJoin(
        { x: 50, y: 50 },
        { x: 50, y: 50 },
        { x: 100, y: 50 },
        5,
      ),
      null,
    )
  })

  it("returns null for coincident vertex and next", () => {
    assert.equal(
      computeBevelJoin({ x: 0, y: 50 }, { x: 50, y: 50 }, { x: 50, y: 50 }, 5),
      null,
    )
  })

  it("returns null for anti-parallel segments (U-turn)", () => {
    assert.equal(
      computeBevelJoin({ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 0, y: 0 }, 5),
      null,
    )
  })

  it("handles 45-degree turn", () => {
    const result = computeBevelJoin(
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 200, y: -100 },
      10,
    )
    assert.ok(result)
    // Offsets should be on the bottom side (outer of a left turn in screen coords)
    assertClose(result[0].x, 100)
    assertClose(result[0].y, 10)
    assertClose(result[1].x, 100 + 10 / Math.SQRT2)
    assertClose(result[1].y, 10 / Math.SQRT2)
  })
})
