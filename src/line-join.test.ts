import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { computeBevelJoin, computeMiterJoin } from "./line-join.ts"

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

describe("computeMiterJoin", () => {
  it("computes miter point for 90-degree CW turn", () => {
    const result = computeMiterJoin(
      { x: 0, y: 100 },
      { x: 100, y: 100 },
      { x: 100, y: 200 },
      5,
      4,
    )
    assert.ok(result)
    assert.ok(result.miter)
    // Bevel points same as bevel test
    assertClose(result.bevel[0].x, 100)
    assertClose(result.bevel[0].y, 95)
    assertClose(result.bevel[1].x, 105)
    assertClose(result.bevel[1].y, 100)
    // Miter point at intersection of outer edges
    assertClose(result.miter.x, 105)
    assertClose(result.miter.y, 95)
  })

  it("computes miter point for 90-degree CCW turn", () => {
    const result = computeMiterJoin(
      { x: 0, y: 100 },
      { x: 100, y: 100 },
      { x: 100, y: 0 },
      5,
      4,
    )
    assert.ok(result)
    assert.ok(result.miter)
    assertClose(result.miter.x, 105)
    assertClose(result.miter.y, 105)
  })

  it("falls back to bevel when miter limit exceeded", () => {
    // Very sharp turn: almost a U-turn
    // d_in = (100, 0), d_out = (-95, 10)
    // cosAngle = -(100*(-95) + 0*10)/(100*sqrt(9025+100)) ≈ 0.994
    const result = computeMiterJoin(
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 5, y: 10 },
      5,
      4,
    )
    assert.ok(result)
    assert.equal(result.miter, null)
    // Bevel points should still be present
    assert.ok(result.bevel[0])
    assert.ok(result.bevel[1])
  })

  it("returns null for collinear points", () => {
    assert.equal(
      computeMiterJoin({ x: 0, y: 0 }, { x: 50, y: 0 }, { x: 100, y: 0 }, 5, 4),
      null,
    )
  })

  it("respects custom miter limit", () => {
    // 90° turn: miterRatio = √2 ≈ 1.414
    // With miterLimit = 1, this should exceed the limit
    const result = computeMiterJoin(
      { x: 0, y: 100 },
      { x: 100, y: 100 },
      { x: 100, y: 200 },
      5,
      1,
    )
    assert.ok(result)
    assert.equal(result.miter, null)
  })

  it("miter ratio of 90-degree turn is sqrt(2)", () => {
    // With miterLimit just above √2, should produce a miter point
    const result = computeMiterJoin(
      { x: 0, y: 100 },
      { x: 100, y: 100 },
      { x: 100, y: 200 },
      5,
      1.42,
    )
    assert.ok(result)
    assert.ok(result.miter)
    // With miterLimit just below √2, should fall back to bevel
    const result2 = computeMiterJoin(
      { x: 0, y: 100 },
      { x: 100, y: 100 },
      { x: 100, y: 200 },
      5,
      1.41,
    )
    assert.ok(result2)
    assert.equal(result2.miter, null)
  })
})
