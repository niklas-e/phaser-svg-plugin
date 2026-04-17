import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { assertDefined } from "./assert.ts"
import type { PathCommand } from "./types.ts"
import {
  deduplicatePoints,
  groupSubpathsForFill,
  signedArea2,
  splitSubpaths,
} from "./renderer.ts"

// ---------------------------------------------------------------------------
// signedArea2
// ---------------------------------------------------------------------------

describe("signedArea2", () => {
  it("returns positive for a CW square (screen coords)", () => {
    // In screen coords (Y-down), going right→down→left→up is CW
    const cw = [
      { x: 0, y: 0 },
      { x: 0, y: 10 },
      { x: 10, y: 10 },
      { x: 10, y: 0 },
    ]
    assert.ok(signedArea2(cw) > 0)
  })

  it("returns negative for a CCW square (screen coords)", () => {
    const ccw = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
      { x: 0, y: 10 },
    ]
    assert.ok(signedArea2(ccw) < 0)
  })

  it("returns zero for a degenerate line", () => {
    const line = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
    ]
    assert.equal(signedArea2(line), 0)
  })
})

// ---------------------------------------------------------------------------
// deduplicatePoints
// ---------------------------------------------------------------------------

describe("deduplicatePoints", () => {
  it("removes consecutive near-duplicate points", () => {
    const points = [
      { x: 0, y: 0 },
      { x: 0.00005, y: 0.00005 },
      { x: 10, y: 10 },
    ]
    const result = deduplicatePoints(points)
    assert.equal(result.length, 2)
    assert.deepStrictEqual(result[0], { x: 0, y: 0 })
    assert.deepStrictEqual(result[1], { x: 10, y: 10 })
  })

  it("removes closing duplicate (last ≈ first)", () => {
    const points = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
      { x: 0.00005, y: 0.00005 },
    ]
    const result = deduplicatePoints(points)
    assert.equal(result.length, 3)
  })

  it("preserves points that are far enough apart", () => {
    const points = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
    ]
    const result = deduplicatePoints(points)
    assert.equal(result.length, 3)
  })

  it("handles single-point input", () => {
    const points = [{ x: 5, y: 5 }]
    const result = deduplicatePoints(points)
    assert.equal(result.length, 1)
  })

  it("handles empty input", () => {
    const result = deduplicatePoints([])
    assert.equal(result.length, 0)
  })
})

// ---------------------------------------------------------------------------
// splitSubpaths
// ---------------------------------------------------------------------------

describe("splitSubpaths", () => {
  it("splits at M commands", () => {
    const commands: PathCommand[] = [
      { type: "M", x: 0, y: 0 },
      { type: "L", x: 10, y: 0 },
      { type: "Z" },
      { type: "M", x: 20, y: 20 },
      { type: "L", x: 30, y: 20 },
      { type: "Z" },
    ]
    const result = splitSubpaths(commands)
    assert.equal(result.length, 2)
    assert.equal(assertDefined(result[0]).length, 3)
    assert.equal(assertDefined(result[1]).length, 3)
  })

  it("returns single subpath when no second M", () => {
    const commands: PathCommand[] = [
      { type: "M", x: 0, y: 0 },
      { type: "L", x: 10, y: 10 },
    ]
    const result = splitSubpaths(commands)
    assert.equal(result.length, 1)
  })

  it("handles empty input", () => {
    const result = splitSubpaths([])
    assert.equal(result.length, 0)
  })
})

// ---------------------------------------------------------------------------
// groupSubpathsForFill
// ---------------------------------------------------------------------------

describe("groupSubpathsForFill", () => {
  // CW outer square (positive signedArea2 in screen coords)
  const outerCW = [
    { x: 0, y: 0 },
    { x: 0, y: 100 },
    { x: 100, y: 100 },
    { x: 100, y: 0 },
  ]

  // CCW inner square (hole — negative signedArea2)
  const innerCCW = [
    { x: 20, y: 20 },
    { x: 80, y: 20 },
    { x: 80, y: 80 },
    { x: 20, y: 80 },
  ]

  it("groups a single subpath as outer with no holes", () => {
    const groups = groupSubpathsForFill([{ points: outerCW }])
    assert.equal(groups.length, 1)
    assert.equal(assertDefined(groups[0]).holes.length, 0)
  })

  it("detects an inner ring as a hole of the outer", () => {
    const groups = groupSubpathsForFill([
      { points: outerCW },
      { points: innerCCW },
    ])
    assert.equal(groups.length, 1)
    assert.equal(assertDefined(groups[0]).holes.length, 1)
  })

  it("handles two independent outers", () => {
    const outer2 = [
      { x: 200, y: 0 },
      { x: 200, y: 100 },
      { x: 300, y: 100 },
      { x: 300, y: 0 },
    ]
    const groups = groupSubpathsForFill([
      { points: outerCW },
      { points: outer2 },
    ])
    assert.equal(groups.length, 2)
    assert.equal(assertDefined(groups[0]).holes.length, 0)
    assert.equal(assertDefined(groups[1]).holes.length, 0)
  })

  it("assigns hole to the smallest enclosing outer", () => {
    // Large outer (CW)
    const largeOuter = [
      { x: 0, y: 0 },
      { x: 0, y: 200 },
      { x: 200, y: 200 },
      { x: 200, y: 0 },
    ]
    // Smaller outer inside large outer (CW)
    const smallOuter = [
      { x: 10, y: 10 },
      { x: 10, y: 100 },
      { x: 100, y: 100 },
      { x: 100, y: 10 },
    ]
    // Hole inside the small outer (CCW)
    const hole = [
      { x: 30, y: 30 },
      { x: 70, y: 30 },
      { x: 70, y: 70 },
      { x: 30, y: 70 },
    ]
    const groups = groupSubpathsForFill([
      { points: largeOuter },
      { points: smallOuter },
      { points: hole },
    ])
    // Both large and small are CW (outers), hole is CCW
    // Hole should be assigned to smallOuter (smallest enclosing)
    const groupWithHole = groups.find((g) => g.holes.length > 0)
    assert.ok(groupWithHole)
    assert.equal(groupWithHole.outer, smallOuter)
  })
})
