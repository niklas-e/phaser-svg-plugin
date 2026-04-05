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
    assert.equal(converted.d, "M 10 20 H 40 V 60 H 10 V 20 Z")
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

  it("returns undefined for unsupported element", () => {
    assert.equal(
      convertShape("circle", { cx: "10", cy: "10", r: "10" }),
      undefined,
    )
  })
})
