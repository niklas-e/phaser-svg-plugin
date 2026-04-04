import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { assertDefined } from "./assert.ts"
import { parsePath } from "./path-parser.ts"

describe("parsePath", () => {
  describe("M (moveTo)", () => {
    it("parses absolute M", () => {
      const result = parsePath("M 10 20")
      assert.deepStrictEqual(result, [{ type: "M", x: 10, y: 20 }])
    })

    it("parses relative m", () => {
      const result = parsePath("M 5 5 m 10 20")
      assert.deepStrictEqual(result, [
        { type: "M", x: 5, y: 5 },
        { type: "M", x: 15, y: 25 },
      ])
    })

    it("treats implicit params after M as L", () => {
      const result = parsePath("M 0 0 10 20 30 40")
      assert.deepStrictEqual(result, [
        { type: "M", x: 0, y: 0 },
        { type: "L", x: 10, y: 20 },
        { type: "L", x: 30, y: 40 },
      ])
    })

    it("treats implicit params after m as l (relative)", () => {
      const result = parsePath("m 0 0 10 20 30 40")
      assert.deepStrictEqual(result, [
        { type: "M", x: 0, y: 0 },
        { type: "L", x: 10, y: 20 },
        { type: "L", x: 40, y: 60 },
      ])
    })
  })

  describe("L (lineTo)", () => {
    it("parses absolute L", () => {
      const result = parsePath("M 0 0 L 100 200")
      assert.equal(result.length, 2)
      assert.deepStrictEqual(result[1], { type: "L", x: 100, y: 200 })
    })

    it("parses relative l", () => {
      const result = parsePath("M 10 10 l 5 5")
      assert.deepStrictEqual(result[1], { type: "L", x: 15, y: 15 })
    })

    it("parses repeated L params", () => {
      const result = parsePath("M 0 0 L 10 10 20 20")
      assert.equal(result.length, 3)
      assert.deepStrictEqual(result[2], { type: "L", x: 20, y: 20 })
    })
  })

  describe("H (horizontal lineTo)", () => {
    it("parses absolute H", () => {
      const result = parsePath("M 0 10 H 50")
      assert.deepStrictEqual(result[1], { type: "L", x: 50, y: 10 })
    })

    it("parses relative h", () => {
      const result = parsePath("M 10 20 h 30")
      assert.deepStrictEqual(result[1], { type: "L", x: 40, y: 20 })
    })
  })

  describe("V (vertical lineTo)", () => {
    it("parses absolute V", () => {
      const result = parsePath("M 10 0 V 50")
      assert.deepStrictEqual(result[1], { type: "L", x: 10, y: 50 })
    })

    it("parses relative v", () => {
      const result = parsePath("M 10 20 v 30")
      assert.deepStrictEqual(result[1], { type: "L", x: 10, y: 50 })
    })
  })

  describe("C (cubic Bézier)", () => {
    it("parses absolute C", () => {
      const result = parsePath("M 0 0 C 10 20 30 40 50 60")
      assert.deepStrictEqual(result[1], {
        type: "C",
        x1: 10,
        y1: 20,
        x2: 30,
        y2: 40,
        x: 50,
        y: 60,
      })
    })

    it("parses relative c", () => {
      const result = parsePath("M 10 10 c 10 20 30 40 50 60")
      assert.deepStrictEqual(result[1], {
        type: "C",
        x1: 20,
        y1: 30,
        x2: 40,
        y2: 50,
        x: 60,
        y: 70,
      })
    })
  })

  describe("S (smooth cubic Bézier)", () => {
    it("reflects control point from previous C", () => {
      const result = parsePath("M 0 0 C 10 20 30 40 50 60 S 70 80 90 100")
      // Previous C had cp2 at (30,40), endpoint at (50,60)
      // Reflected cp1 = 2*(50,60) - (30,40) = (70, 80)
      assert.deepStrictEqual(result[2], {
        type: "C",
        x1: 70,
        y1: 80,
        x2: 70,
        y2: 80,
        x: 90,
        y: 100,
      })
    })

    it("uses current point as cp1 when no previous C", () => {
      const result = parsePath("M 50 60 S 70 80 90 100")
      assert.deepStrictEqual(result[1], {
        type: "C",
        x1: 50,
        y1: 60,
        x2: 70,
        y2: 80,
        x: 90,
        y: 100,
      })
    })
  })

  describe("Q (quadratic Bézier)", () => {
    it("parses absolute Q", () => {
      const result = parsePath("M 0 0 Q 10 20 30 40")
      assert.deepStrictEqual(result[1], {
        type: "Q",
        x1: 10,
        y1: 20,
        x: 30,
        y: 40,
      })
    })

    it("parses relative q", () => {
      const result = parsePath("M 5 5 q 10 20 30 40")
      assert.deepStrictEqual(result[1], {
        type: "Q",
        x1: 15,
        y1: 25,
        x: 35,
        y: 45,
      })
    })
  })

  describe("T (smooth quadratic Bézier)", () => {
    it("reflects control point from previous Q", () => {
      const result = parsePath("M 0 0 Q 10 20 30 40 T 50 60")
      // Previous Q had cp at (10,20), endpoint at (30,40)
      // Reflected cp = 2*(30,40) - (10,20) = (50, 60)
      assert.deepStrictEqual(result[2], {
        type: "Q",
        x1: 50,
        y1: 60,
        x: 50,
        y: 60,
      })
    })
  })

  describe("A (arc)", () => {
    it("parses absolute A", () => {
      const result = parsePath("M 0 0 A 25 26 -30 0 1 50 25")
      assert.deepStrictEqual(result[1], {
        type: "A",
        rx: 25,
        ry: 26,
        xAxisRotation: -30,
        largeArc: false,
        sweep: true,
        x: 50,
        y: 25,
      })
    })

    it("converts zero-radius arc to line", () => {
      const result = parsePath("M 0 0 A 0 10 0 0 1 50 25")
      assert.deepStrictEqual(result[1], { type: "L", x: 50, y: 25 })
    })

    it("parses relative a", () => {
      const result = parsePath("M 10 20 a 5 5 0 1 0 10 0")
      assert.deepStrictEqual(result[1], {
        type: "A",
        rx: 5,
        ry: 5,
        xAxisRotation: 0,
        largeArc: true,
        sweep: false,
        x: 20,
        y: 20,
      })
    })
  })

  describe("Z (close path)", () => {
    it("parses Z and resets cursor", () => {
      const result = parsePath("M 10 20 L 30 40 Z L 0 0")
      assert.deepStrictEqual(result[2], { type: "Z" })
      // After Z, cursor resets to subpath start (10, 20)
      // So absolute L 0 0 goes to (0, 0)
      assert.deepStrictEqual(result[3], { type: "L", x: 0, y: 0 })
    })
  })

  describe("edge cases", () => {
    it("handles no spaces between commands", () => {
      const result = parsePath("M0,0L10,20")
      assert.deepStrictEqual(result, [
        { type: "M", x: 0, y: 0 },
        { type: "L", x: 10, y: 20 },
      ])
    })

    it("handles negative numbers as separators", () => {
      const result = parsePath("M10-20L30-40")
      assert.deepStrictEqual(result, [
        { type: "M", x: 10, y: -20 },
        { type: "L", x: 30, y: -40 },
      ])
    })

    it("handles empty string", () => {
      const result = parsePath("")
      assert.deepStrictEqual(result, [])
    })

    it("handles complex real-world path", () => {
      // A heart shape
      const d =
        "M 10,30 A 20,20 0,0,1 50,30 A 20,20 0,0,1 90,30 Q 90,60 50,90 Q 10,60 10,30 Z"
      const result = parsePath(d)
      assert.equal(assertDefined(result[0]).type, "M")
      assert.equal(assertDefined(result[1]).type, "A")
      assert.equal(assertDefined(result[2]).type, "A")
      assert.equal(assertDefined(result[3]).type, "Q")
      assert.equal(assertDefined(result[4]).type, "Q")
      assert.equal(assertDefined(result[5]).type, "Z")
      assert.equal(result.length, 6)
    })
  })
})
