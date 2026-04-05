import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { assertDefined } from "./assert.ts"
import { compileSVG } from "./compiler.ts"

describe("compileSVG", () => {
  it("compiles a single path element", () => {
    const svg = `<svg><path d="M 0 0 L 100 100" fill="red" stroke="blue" stroke-width="2" /></svg>`
    const result = compileSVG(svg)

    assert.equal(result.paths.length, 1)
    const path = assertDefined(result.paths[0])
    assert.equal(path.commands.length, 2)
    assert.deepStrictEqual(path.commands[0], { type: "M", x: 0, y: 0 })
    assert.deepStrictEqual(path.commands[1], { type: "L", x: 100, y: 100 })
    assert.equal(path.style.fill, 0xff0000)
    assert.equal(path.style.stroke, 0x0000ff)
    assert.equal(path.style.strokeWidth, 2)
  })

  it("compiles multiple path elements", () => {
    const svg = `<svg>
      <path d="M 0 0 L 10 10 Z" fill="#00bcd4" />
      <path d="M 5 5 L 20 20" fill="none" stroke="white" />
    </svg>`
    const result = compileSVG(svg)

    assert.equal(result.paths.length, 2)
    assert.equal(assertDefined(result.paths[0]).commands.length, 3)
    assert.equal(assertDefined(result.paths[1]).commands.length, 2)
    assert.equal(assertDefined(result.paths[0]).style.fill, 0x00bcd4)
    assert.equal(assertDefined(result.paths[1]).style.fill, null)
    assert.equal(assertDefined(result.paths[1]).style.stroke, 0xffffff)
  })

  it("skips path elements without a d attribute", () => {
    const svg = `<svg><path fill="red" /><path d="M 0 0 L 1 1" /></svg>`
    const result = compileSVG(svg)

    assert.equal(result.paths.length, 1)
  })

  it("handles single-quoted attributes", () => {
    const svg = `<svg><path d='M 0 0 L 50 50' fill='#ff0000' /></svg>`
    const result = compileSVG(svg)

    assert.equal(result.paths.length, 1)
    assert.equal(assertDefined(result.paths[0]).style.fill, 0xff0000)
  })

  it("handles multi-line path elements", () => {
    const svg = `<svg>
      <path
        d="M 10,30 A 20,20 0,0,1 50,30"
        fill="#e91e63"
        fill-opacity="0.9"
        stroke="white"
        stroke-width="1"
      />
    </svg>`
    const result = compileSVG(svg)

    assert.equal(result.paths.length, 1)
    assert.equal(assertDefined(result.paths[0]).style.fill, 0xe91e63)
    assert.equal(assertDefined(result.paths[0]).style.fillAlpha, 0.9)
    assert.equal(assertDefined(result.paths[0]).style.stroke, 0xffffff)
  })

  it("resolves all style properties", () => {
    const svg = `<svg><path d="M 0 0 L 1 1"
      fill="black" fill-opacity="0.5"
      stroke="white" stroke-opacity="0.8"
      stroke-width="3" stroke-linejoin="round"
      stroke-linecap="square" stroke-miterlimit="8"
      opacity="0.9"
    /></svg>`
    const result = compileSVG(svg)

    const style = assertDefined(result.paths[0]).style
    assert.equal(style.fill, 0x000000)
    assert.equal(style.fillAlpha, 0.5)
    assert.equal(style.stroke, 0xffffff)
    assert.equal(style.strokeAlpha, 0.8)
    assert.equal(style.strokeWidth, 3)
    assert.equal(style.lineJoin, "round")
    assert.equal(style.lineCap, "square")
    assert.equal(style.miterLimit, 8)
    assert.equal(style.opacity, 0.9)
  })

  it("returns empty paths for SVG with no supported shapes", () => {
    const svg = `<svg><ellipse cx="10" cy="10" rx="10" ry="8" /></svg>`
    const result = compileSVG(svg)

    assert.equal(result.paths.length, 0)
  })

  it("compiles circle elements", () => {
    const svg = `<svg><circle cx="12" cy="18" r="6" fill="#ff00ff" /></svg>`
    const result = compileSVG(svg)

    assert.equal(result.paths.length, 1)
    const commands = assertDefined(result.paths[0]).commands
    assert.equal(assertDefined(commands[0]).type, "M")
    assert.equal(assertDefined(commands[1]).type, "A")
    assert.equal(assertDefined(commands[2]).type, "A")
    assert.equal(assertDefined(commands[3]).type, "Z")
    assert.equal(assertDefined(result.paths[0]).style.fill, 0xff00ff)
  })

  it("compiles rect elements", () => {
    const svg = `<svg><rect x="10" y="20" width="30" height="40" fill="#00ff00" /></svg>`
    const result = compileSVG(svg)

    assert.equal(result.paths.length, 1)
    const path = assertDefined(result.paths[0])
    assert.deepStrictEqual(path.commands, [
      { type: "M", x: 10, y: 20 },
      { type: "L", x: 40, y: 20 },
      { type: "L", x: 40, y: 60 },
      { type: "L", x: 10, y: 60 },
      { type: "L", x: 10, y: 20 },
      { type: "Z" },
    ])
    assert.equal(path.style.fill, 0x00ff00)
  })

  it("compiles rounded rect elements", () => {
    const svg = `<svg><rect width="20" height="10" rx="4" ry="2" /></svg>`
    const result = compileSVG(svg)

    assert.equal(result.paths.length, 1)
    const commands = assertDefined(result.paths[0]).commands
    assert.equal(assertDefined(commands[0]).type, "M")
    assert.equal(assertDefined(commands[2]).type, "A")
    assert.equal(assertDefined(commands[4]).type, "A")
    assert.equal(assertDefined(commands[6]).type, "A")
    assert.equal(assertDefined(commands[8]).type, "A")
    assert.equal(assertDefined(commands[9]).type, "Z")
  })

  it("returns empty paths for empty string", () => {
    const result = compileSVG("")
    assert.equal(result.paths.length, 0)
  })

  it("result is JSON-serialisable", () => {
    const svg = `<svg><path d="M 0 0 C 10 20 30 40 50 60" fill="red" /></svg>`
    const compiled = compileSVG(svg)

    const json = JSON.stringify(compiled)
    const restored = JSON.parse(json)

    assert.deepStrictEqual(restored, compiled)
  })

  it("extracts viewBox", () => {
    const svg = `<svg viewBox="0 0 620 260"><path d="M 0 0 L 1 1" /></svg>`
    const result = compileSVG(svg)

    assert.deepStrictEqual(result.viewBox, {
      minX: 0,
      minY: 0,
      width: 620,
      height: 260,
    })
  })

  it("extracts viewBox with non-zero origin", () => {
    const svg = `<svg viewBox="10 20 100 200"><path d="M 0 0 L 1 1" /></svg>`
    const result = compileSVG(svg)

    assert.deepStrictEqual(result.viewBox, {
      minX: 10,
      minY: 20,
      width: 100,
      height: 200,
    })
  })

  it("sets viewBox to null when absent", () => {
    const svg = `<svg><path d="M 0 0 L 1 1" /></svg>`
    const result = compileSVG(svg)

    assert.equal(result.viewBox, null)
  })
})
