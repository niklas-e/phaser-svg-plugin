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
    const svg = `<svg><g><defs /></g></svg>`
    const result = compileSVG(svg)

    assert.equal(result.paths.length, 0)
    assert.equal(result.items.length, 0)
  })

  it("compiles line elements", () => {
    const svg = `<svg><line x1="2" y1="4" x2="12" y2="18" stroke="#ffffff" /></svg>`
    const result = compileSVG(svg)

    assert.equal(result.paths.length, 1)
    const commands = assertDefined(result.paths[0]).commands
    assert.deepStrictEqual(commands, [
      { type: "M", x: 2, y: 4 },
      { type: "L", x: 12, y: 18 },
    ])
  })

  it("compiles polyline elements", () => {
    const svg = `<svg><polyline points="0,0 10,5 20,0" stroke="#ffffff" /></svg>`
    const result = compileSVG(svg)

    assert.equal(result.paths.length, 1)
    const commands = assertDefined(result.paths[0]).commands
    assert.deepStrictEqual(commands, [
      { type: "M", x: 0, y: 0 },
      { type: "L", x: 10, y: 5 },
      { type: "L", x: 20, y: 0 },
    ])
  })

  it("compiles polygon elements", () => {
    const svg = `<svg><polygon points="5,5 15,5 15,15 5,15" fill="#ffaa00" /></svg>`
    const result = compileSVG(svg)

    assert.equal(result.paths.length, 1)
    const commands = assertDefined(result.paths[0]).commands
    assert.deepStrictEqual(commands, [
      { type: "M", x: 5, y: 5 },
      { type: "L", x: 15, y: 5 },
      { type: "L", x: 15, y: 15 },
      { type: "L", x: 5, y: 15 },
      { type: "Z" },
    ])
    assert.equal(assertDefined(result.paths[0]).style.fill, 0xffaa00)
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

    assert.equal(result.items.length, 1)
    const item = assertDefined(result.items[0])
    assert.equal(item.kind, "native")
    if (item.kind === "native") {
      assert.deepStrictEqual(item.shape, {
        kind: "circle",
        cx: 12,
        cy: 18,
        r: 6,
      })
    }
  })

  it("compiles ellipse elements", () => {
    const svg = `<svg><ellipse cx="20" cy="14" rx="8" ry="4" fill="#00ffff" /></svg>`
    const result = compileSVG(svg)

    assert.equal(result.paths.length, 1)
    const commands = assertDefined(result.paths[0]).commands
    assert.equal(assertDefined(commands[0]).type, "M")
    assert.equal(assertDefined(commands[1]).type, "A")
    assert.equal(assertDefined(commands[2]).type, "A")
    assert.equal(assertDefined(commands[3]).type, "Z")
    assert.equal(assertDefined(result.paths[0]).style.fill, 0x00ffff)

    assert.equal(result.items.length, 1)
    const item = assertDefined(result.items[0])
    assert.equal(item.kind, "native")
    if (item.kind === "native") {
      assert.deepStrictEqual(item.shape, {
        kind: "ellipse",
        cx: 20,
        cy: 14,
        rx: 8,
        ry: 4,
      })
    }
  })

  it("applies element transform to circle geometry", () => {
    const svg = `<svg>
      <circle cx="10" cy="10" r="4" transform="translate(5 7)" fill="#ff00ff" />
    </svg>`

    const result = compileSVG(svg)
    assert.equal(result.paths.length, 1)
    assert.equal(result.items.length, 1)

    const path = assertDefined(result.paths[0])
    const move = assertDefined(path.commands[0])
    assert.equal(move.type, "M")
    assert.ok(Math.abs(move.x - 19) < 0.001)
    assert.ok(Math.abs(move.y - 17) < 0.001)

    const item = assertDefined(result.items[0])
    assert.equal(item.kind, "path")
  })

  it("inherits root fill='none' for stroke-only circle", () => {
    const svg = `<svg fill="none"><circle cx="33.5" cy="33.5" r="26" stroke="#3E2400" stroke-width="15" /></svg>`
    const result = compileSVG(svg)

    assert.equal(result.paths.length, 1)
    const path = assertDefined(result.paths[0])
    assert.equal(path.style.fill, null)
    assert.equal(path.style.stroke, 0x3e2400)
    assert.equal(path.style.strokeWidth, 15)

    assert.equal(result.items.length, 1)
    const item = assertDefined(result.items[0])
    assert.equal(item.style.fill, null)
    assert.equal(item.style.stroke, 0x3e2400)
  })

  it("ignores helper geometry from defs/clipPath", () => {
    const svg = `<svg>
      <g clip-path="url(#clip0)">
        <circle cx="10" cy="12" r="3" fill="#ff0000" />
      </g>
      <defs>
        <clipPath id="clip0">
          <rect width="100" height="100" fill="white" />
        </clipPath>
      </defs>
    </svg>`

    const result = compileSVG(svg)

    // Only the visible circle should be compiled.
    assert.equal(result.paths.length, 1)
    assert.equal(result.items.length, 1)

    const item = assertDefined(result.items[0])
    assert.equal(item.kind, "native")
    assert.equal(item.style.fill, 0xff0000)
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

  it("applies element rotate transform to rect geometry", () => {
    const svg = `<svg>
      <rect
        x="255.285"
        y="71.6028"
        width="260.574"
        height="259.766"
        rx="30"
        transform="rotate(45 255.285 71.6028)"
        stroke="#3E2400"
        stroke-width="10"
        fill="none"
      />
    </svg>`

    const result = compileSVG(svg)
    const commands = assertDefined(result.paths[0]).commands
    const move = assertDefined(commands[0])

    assert.equal(move.type, "M")
    assert.ok(Math.abs(move.x - 276.498) < 0.02)
    assert.ok(Math.abs(move.y - 92.816) < 0.02)
  })

  it("returns empty paths for empty string", () => {
    const result = compileSVG("")
    assert.equal(result.paths.length, 0)
    assert.equal(result.items.length, 0)
  })

  it("preserves source draw order in compiled items", () => {
    const svg = `<svg>
      <rect x="0" y="0" width="8" height="4" fill="#00ff00" />
      <circle cx="10" cy="10" r="3" fill="#ff0000" />
      <path d="M 0 0 L 1 1" stroke="#ffffff" />
      <ellipse cx="20" cy="20" rx="6" ry="2" fill="#0000ff" />
    </svg>`

    const result = compileSVG(svg)

    assert.equal(result.items.length, 4)
    assert.deepStrictEqual(
      result.items.map((item) => item.kind),
      ["path", "native", "path", "native"],
    )

    const second = assertDefined(result.items[1])
    assert.equal(second.kind, "native")
    if (second.kind === "native") {
      assert.equal(second.shape.kind, "circle")
    }

    const fourth = assertDefined(result.items[3])
    assert.equal(fourth.kind, "native")
    if (fourth.kind === "native") {
      assert.equal(fourth.shape.kind, "ellipse")
    }
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
