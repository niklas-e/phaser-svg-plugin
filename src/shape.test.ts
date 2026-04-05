import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { convertShape } from "./shape.ts"

describe("convertShape", () => {
  it("converts path elements", () => {
    const converted = convertShape("path", {
      d: "M 0 0 L 10 10",
      fill: "red",
    })

    assert.ok(converted)
    assert.equal(converted.d, "M 0 0 L 10 10")
    assert.equal(converted.style.fill, 0xff0000)
  })

  it("converts simple rect to line path", () => {
    const converted = convertShape("rect", {
      x: "10",
      y: "20",
      width: "30",
      height: "40",
    })

    assert.ok(converted)
    assert.equal(converted.d, "M 10 20 H 40 V 60 H 10 Z")
  })

  it("converts rounded rect to arc path", () => {
    const converted = convertShape("rect", {
      x: "0",
      y: "0",
      width: "20",
      height: "10",
      rx: "4",
      ry: "2",
    })

    assert.ok(converted)
    assert.equal(
      converted.d,
      "M 4 0 H 16 A 4 2 0 0 1 20 2 V 8 A 4 2 0 0 1 16 10 H 4 A 4 2 0 0 1 0 8 V 2 A 4 2 0 0 1 4 0 Z",
    )
  })

  it("inherits missing ry from rx", () => {
    const converted = convertShape("rect", {
      width: "20",
      height: "10",
      rx: "4",
    })

    assert.ok(converted)
    assert.match(converted.d, /A 4 4 0 0 1/)
  })

  it("returns undefined for invalid rect", () => {
    assert.equal(
      convertShape("rect", {
        width: "-1",
        height: "10",
      }),
      undefined,
    )

    assert.equal(
      convertShape("rect", {
        height: "10",
      }),
      undefined,
    )
  })

  it("converts circle to two arc commands", () => {
    const converted = convertShape("circle", {
      cx: "12",
      cy: "18",
      r: "6",
    })

    assert.ok(converted)
    assert.equal(converted.d, "M 18 18 A 6 6 0 1 0 6 18 A 6 6 0 1 0 18 18 Z")
  })

  it("returns undefined for invalid circle", () => {
    assert.equal(
      convertShape("circle", {
        cx: "10",
        cy: "10",
      }),
      undefined,
    )

    assert.equal(
      convertShape("circle", {
        cx: "10",
        cy: "10",
        r: "0",
      }),
      undefined,
    )
  })

  it("converts ellipse to two arc commands", () => {
    const converted = convertShape("ellipse", {
      cx: "20",
      cy: "14",
      rx: "8",
      ry: "4",
    })

    assert.ok(converted)
    assert.equal(converted.d, "M 28 14 A 8 4 0 1 0 12 14 A 8 4 0 1 0 28 14 Z")
  })

  it("returns undefined for invalid ellipse", () => {
    assert.equal(
      convertShape("ellipse", {
        cx: "10",
        cy: "10",
        ry: "5",
      }),
      undefined,
    )

    assert.equal(
      convertShape("ellipse", {
        cx: "10",
        cy: "10",
        rx: "5",
        ry: "0",
      }),
      undefined,
    )
  })

  it("converts line to M+L path", () => {
    const converted = convertShape("line", {
      x1: "2",
      y1: "4",
      x2: "12",
      y2: "18",
    })

    assert.ok(converted)
    assert.equal(converted.d, "M 2 4 L 12 18")
  })

  it("converts polyline to M+L path", () => {
    const converted = convertShape("polyline", {
      points: "0,0 10,5 20,0 30,10",
    })

    assert.ok(converted)
    assert.equal(converted.d, "M 0 0 L 10 5 L 20 0 L 30 10")
  })

  it("converts polygon to closed M+L path", () => {
    const converted = convertShape("polygon", {
      points: "5,5 15,5 15,15 5,15",
    })

    assert.ok(converted)
    assert.equal(converted.d, "M 5 5 L 15 5 L 15 15 L 5 15 Z")
  })

  it("returns undefined for invalid polyline and polygon points", () => {
    assert.equal(
      convertShape("polyline", {
        points: "10,10",
      }),
      undefined,
    )

    assert.equal(
      convertShape("polygon", {
        points: "1,2,3",
      }),
      undefined,
    )
  })

  it("returns undefined for unsupported element", () => {
    assert.equal(
      convertShape("g", { transform: "translate(10,10)" }),
      undefined,
    )
  })
})
