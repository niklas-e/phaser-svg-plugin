import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { resolveStyle } from "./style.ts"

describe("resolveStyle", () => {
  it("returns defaults for empty attrs", () => {
    const style = resolveStyle({})
    assert.equal(style.fill, 0x000000)
    assert.equal(style.fillAlpha, 1)
    assert.equal(style.stroke, null)
    assert.equal(style.strokeAlpha, 1)
    assert.equal(style.strokeWidth, 1)
    assert.equal(style.opacity, 1)
  })

  it("parses fill color", () => {
    const style = resolveStyle({ fill: "#ff0000" })
    assert.equal(style.fill, 0xff0000)
  })

  it("sets fill to null for 'none'", () => {
    const style = resolveStyle({ fill: "none" })
    assert.equal(style.fill, null)
  })

  it("parses stroke with width", () => {
    const style = resolveStyle({ stroke: "blue", "stroke-width": "3" })
    assert.equal(style.stroke, 0x0000ff)
    assert.equal(style.strokeWidth, 3)
  })

  it("respects opacity", () => {
    const style = resolveStyle({ fill: "red", opacity: "0.5" })
    assert.equal(style.fill, 0xff0000)
    assert.equal(style.opacity, 0.5)
  })

  it("respects fill-opacity", () => {
    const style = resolveStyle({ fill: "red", "fill-opacity": "0.3" })
    assert.equal(style.fillAlpha, 0.3)
  })

  it("respects stroke-opacity", () => {
    const style = resolveStyle({ stroke: "red", "stroke-opacity": "0.7" })
    assert.equal(style.strokeAlpha, 0.7)
  })
})
