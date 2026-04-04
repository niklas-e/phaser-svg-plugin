import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { computeSquareCap } from "./line-cap.ts"

function assertClose(actual: number, expected: number, tolerance = 0.001) {
  assert.ok(
    Math.abs(actual - expected) < tolerance,
    `Expected ${actual} to be close to ${expected}`,
  )
}

describe("computeSquareCap", () => {
  it("extends start cap backward for horizontal segment", () => {
    // Path goes right: (0,0) → (100,0). Start cap at (0,0).
    const result = computeSquareCap({ x: 0, y: 0 }, { x: 100, y: 0 }, 5)
    assert.ok(result)
    // Cap extends left (x=-5), spanning y=-5 to y=5
    assertClose(result[0].x, 0)
    assertClose(result[0].y, 5)
    assertClose(result[1].x, 0)
    assertClose(result[1].y, -5)
    assertClose(result[2].x, -5)
    assertClose(result[2].y, -5)
    assertClose(result[3].x, -5)
    assertClose(result[3].y, 5)
  })

  it("extends end cap forward for horizontal segment", () => {
    // Path goes right: (0,0) → (100,0). End cap at (100,0).
    const result = computeSquareCap({ x: 100, y: 0 }, { x: 0, y: 0 }, 5)
    assert.ok(result)
    // Cap extends right (x=105), spanning y=-5 to y=5
    assertClose(result[0].x, 100)
    assertClose(result[0].y, -5)
    assertClose(result[1].x, 100)
    assertClose(result[1].y, 5)
    assertClose(result[2].x, 105)
    assertClose(result[2].y, 5)
    assertClose(result[3].x, 105)
    assertClose(result[3].y, -5)
  })

  it("extends cap for vertical segment", () => {
    // Path goes down: (50,0) → (50,100). Start cap at (50,0).
    const result = computeSquareCap({ x: 50, y: 0 }, { x: 50, y: 100 }, 5)
    assert.ok(result)
    // Cap extends upward (y=-5), spanning x=45 to x=55
    assertClose(result[0].x, 45)
    assertClose(result[0].y, 0)
    assertClose(result[1].x, 55)
    assertClose(result[1].y, 0)
    assertClose(result[2].x, 55)
    assertClose(result[2].y, -5)
    assertClose(result[3].x, 45)
    assertClose(result[3].y, -5)
  })

  it("scales with halfWidth", () => {
    const r5 = computeSquareCap({ x: 0, y: 0 }, { x: 100, y: 0 }, 5)
    const r10 = computeSquareCap({ x: 0, y: 0 }, { x: 100, y: 0 }, 10)
    assert.ok(r5)
    assert.ok(r10)
    // Extension doubles
    assertClose(r5[3].x, -5)
    assertClose(r10[3].x, -10)
    // Width doubles
    assertClose(r5[0].y, 5)
    assertClose(r10[0].y, 10)
  })

  it("handles diagonal segment", () => {
    // Path goes at 45°: (0,0) → (100,100). Start cap at (0,0).
    const hw = 5
    const result = computeSquareCap({ x: 0, y: 0 }, { x: 100, y: 100 }, hw)
    assert.ok(result)
    // Direction away is (-1,-1)/√2
    // Normal (uy,-ux)*hw = (-1/√2, 1/√2)*hw
    const s = hw / Math.SQRT2
    assertClose(result[0].x, -s)
    assertClose(result[0].y, s)
    assertClose(result[1].x, s)
    assertClose(result[1].y, -s)
    assertClose(result[2].x, 0)
    assertClose(result[2].y, -2 * s)
    assertClose(result[3].x, -2 * s)
    assertClose(result[3].y, 0)
  })

  it("returns null for coincident points", () => {
    assert.equal(computeSquareCap({ x: 50, y: 50 }, { x: 50, y: 50 }, 5), null)
  })
})
