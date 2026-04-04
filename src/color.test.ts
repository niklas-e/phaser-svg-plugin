import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { parseColor } from "./color.ts"

describe("parseColor", () => {
  it("parses #rrggbb", () => {
    const result = parseColor("#ff8800")
    assert.deepStrictEqual(result, { color: 0xff8800, alpha: 1 })
  })

  it("parses #rgb", () => {
    const result = parseColor("#f80")
    assert.deepStrictEqual(result, { color: 0xff8800, alpha: 1 })
  })

  it("parses rgb()", () => {
    const result = parseColor("rgb(255, 128, 0)")
    assert.deepStrictEqual(result, { color: 0xff8000, alpha: 1 })
  })

  it("parses rgba()", () => {
    const result = parseColor("rgba(255, 128, 0, 0.5)")
    assert.deepStrictEqual(result, { color: 0xff8000, alpha: 0.5 })
  })

  it("parses named colors", () => {
    assert.deepStrictEqual(parseColor("red"), { color: 0xff0000, alpha: 1 })
    assert.deepStrictEqual(parseColor("blue"), { color: 0x0000ff, alpha: 1 })
    assert.deepStrictEqual(parseColor("BLACK"), { color: 0x000000, alpha: 1 })
  })

  it("returns null for 'none'", () => {
    assert.equal(parseColor("none"), null)
  })

  it("returns alpha 0 for 'transparent'", () => {
    assert.deepStrictEqual(parseColor("transparent"), {
      color: 0x000000,
      alpha: 0,
    })
  })

  it("returns null for empty string", () => {
    assert.equal(parseColor(""), null)
  })

  it("returns null for unknown color", () => {
    assert.equal(parseColor("notacolor"), null)
  })
})
