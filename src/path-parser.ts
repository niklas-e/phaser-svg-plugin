import { assertDefined } from "./assert.ts"
import type { PathCommand } from "./types.ts"

/**
 * Parse an SVG path `d` attribute string into an array of absolute path commands.
 *
 * Supports: M/m, L/l, H/h, V/v, C/c, S/s, Q/q, T/t, A/a, Z/z
 * All relative commands are converted to absolute.
 * Implicit repeated commands are handled per SVG spec.
 */
export function parsePath(d: string): PathCommand[] {
  const tokens = tokenize(d)
  return parseTokens(tokens)
}

// ---------------------------------------------------------------------------
// Tokenizer
// ---------------------------------------------------------------------------

type Token =
  | { type: "command"; value: string }
  | { type: "number"; value: number }

const COMMAND_RE = /^[MmLlHhVvCcSsQqTtAaZz]/
const NUMBER_RE = /^[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?/

function tokenize(d: string): Token[] {
  const tokens: Token[] = []
  let i = 0

  while (i < d.length) {
    // Skip whitespace and commas
    while (
      i < d.length &&
      (d[i] === " " ||
        d[i] === "\t" ||
        d[i] === "\n" ||
        d[i] === "\r" ||
        d[i] === ",")
    ) {
      i++
    }
    if (i >= d.length) break

    const ch = assertDefined(d[i], `Expected character at index ${i}`)

    // Command letter
    if (COMMAND_RE.test(ch)) {
      tokens.push({ type: "command", value: ch })
      i++
      continue
    }

    // Number (including sign)
    const rest = d.slice(i)
    const match = NUMBER_RE.exec(rest)
    if (match) {
      tokens.push({ type: "number", value: Number(match[0]) })
      i += match[0].length
      continue
    }

    // Unknown character — skip
    i++
  }

  return tokens
}

// ---------------------------------------------------------------------------
// Parser — tokens → absolute PathCommand[]
// ---------------------------------------------------------------------------

function parseTokens(tokens: Token[]): PathCommand[] {
  const commands: PathCommand[] = []
  let pos = 0

  // Current point
  let cx = 0
  let cy = 0
  // Start of current subpath (for Z)
  let sx = 0
  let sy = 0
  // Previous control point for smooth curves
  let lastC2x = 0
  let lastC2y = 0
  let lastQ1x = 0
  let lastQ1y = 0
  let lastCmd = ""

  function nextNumber(): number {
    const tok = tokens[pos]
    if (!tok || tok.type !== "number") {
      throw new Error(
        `Expected number at token ${pos}, got ${tok ? tok.type : "EOF"}`,
      )
    }
    pos++
    return tok.value
  }

  function nextFlag(): number {
    // Arc flags can be 0 or 1, possibly packed without separator (e.g. "00" = two flags)
    const tok = tokens[pos]
    if (!tok || tok.type !== "number") {
      throw new Error(`Expected flag at token ${pos}`)
    }
    pos++
    return tok.value
  }

  while (pos < tokens.length) {
    const tok = assertDefined(tokens[pos], `Expected token at position ${pos}`)

    let cmd: string
    if (tok.type === "command") {
      cmd = tok.value
      pos++
    } else {
      // Implicit repeat of the last command.
      // After M, implicit repeats become L; after m, implicit repeats become l.
      if (lastCmd === "M") cmd = "L"
      else if (lastCmd === "m") cmd = "l"
      else cmd = lastCmd
    }

    // Process parameters (loop for implicit repeated parameters)
    do {
      const upper = cmd.toUpperCase()
      const isRelative = cmd !== upper
      switch (upper) {
        case "M": {
          const x = nextNumber() + (isRelative ? cx : 0)
          const y = nextNumber() + (isRelative ? cy : 0)
          commands.push({ type: "M", x, y })
          cx = x
          cy = y
          sx = x
          sy = y
          lastC2x = cx
          lastC2y = cy
          lastQ1x = cx
          lastQ1y = cy
          // Per SVG spec: implicit repeats after M/m become L/l
          cmd = isRelative ? "l" : "L"
          lastCmd = cmd
          break
        }
        case "L": {
          const x = nextNumber() + (isRelative ? cx : 0)
          const y = nextNumber() + (isRelative ? cy : 0)
          commands.push({ type: "L", x, y })
          cx = x
          cy = y
          lastC2x = cx
          lastC2y = cy
          lastQ1x = cx
          lastQ1y = cy
          break
        }
        case "H": {
          const x = nextNumber() + (isRelative ? cx : 0)
          commands.push({ type: "L", x, y: cy })
          cx = x
          lastC2x = cx
          lastC2y = cy
          lastQ1x = cx
          lastQ1y = cy
          break
        }
        case "V": {
          const y = nextNumber() + (isRelative ? cy : 0)
          commands.push({ type: "L", x: cx, y })
          cy = y
          lastC2x = cx
          lastC2y = cy
          lastQ1x = cx
          lastQ1y = cy
          break
        }
        case "C": {
          const x1 = nextNumber() + (isRelative ? cx : 0)
          const y1 = nextNumber() + (isRelative ? cy : 0)
          const x2 = nextNumber() + (isRelative ? cx : 0)
          const y2 = nextNumber() + (isRelative ? cy : 0)
          const x = nextNumber() + (isRelative ? cx : 0)
          const y = nextNumber() + (isRelative ? cy : 0)
          commands.push({ type: "C", x1, y1, x2, y2, x, y })
          lastC2x = x2
          lastC2y = y2
          cx = x
          cy = y
          lastQ1x = cx
          lastQ1y = cy
          break
        }
        case "S": {
          // Smooth cubic: reflect previous C's second control point
          const rx1 =
            lastCmd === "C" ||
            lastCmd === "c" ||
            lastCmd === "S" ||
            lastCmd === "s"
              ? 2 * cx - lastC2x
              : cx
          const ry1 =
            lastCmd === "C" ||
            lastCmd === "c" ||
            lastCmd === "S" ||
            lastCmd === "s"
              ? 2 * cy - lastC2y
              : cy
          const x2 = nextNumber() + (isRelative ? cx : 0)
          const y2 = nextNumber() + (isRelative ? cy : 0)
          const x = nextNumber() + (isRelative ? cx : 0)
          const y = nextNumber() + (isRelative ? cy : 0)
          commands.push({ type: "C", x1: rx1, y1: ry1, x2, y2, x, y })
          lastC2x = x2
          lastC2y = y2
          cx = x
          cy = y
          lastQ1x = cx
          lastQ1y = cy
          break
        }
        case "Q": {
          const x1 = nextNumber() + (isRelative ? cx : 0)
          const y1 = nextNumber() + (isRelative ? cy : 0)
          const x = nextNumber() + (isRelative ? cx : 0)
          const y = nextNumber() + (isRelative ? cy : 0)
          commands.push({ type: "Q", x1, y1, x, y })
          lastQ1x = x1
          lastQ1y = y1
          cx = x
          cy = y
          lastC2x = cx
          lastC2y = cy
          break
        }
        case "T": {
          // Smooth quadratic: reflect previous Q control point
          const rx1 =
            lastCmd === "Q" ||
            lastCmd === "q" ||
            lastCmd === "T" ||
            lastCmd === "t"
              ? 2 * cx - lastQ1x
              : cx
          const ry1 =
            lastCmd === "Q" ||
            lastCmd === "q" ||
            lastCmd === "T" ||
            lastCmd === "t"
              ? 2 * cy - lastQ1y
              : cy
          const x = nextNumber() + (isRelative ? cx : 0)
          const y = nextNumber() + (isRelative ? cy : 0)
          commands.push({ type: "Q", x1: rx1, y1: ry1, x, y })
          lastQ1x = rx1
          lastQ1y = ry1
          cx = x
          cy = y
          lastC2x = cx
          lastC2y = cy
          break
        }
        case "A": {
          const rx = Math.abs(nextNumber())
          const ry = Math.abs(nextNumber())
          const xAxisRotation = nextNumber()
          const largeArc = nextFlag() !== 0
          const sweep = nextFlag() !== 0
          const x = nextNumber() + (isRelative ? cx : 0)
          const y = nextNumber() + (isRelative ? cy : 0)
          // Per spec: if rx or ry is 0, treat as straight line
          if (rx === 0 || ry === 0) {
            commands.push({ type: "L", x, y })
          } else {
            commands.push({
              type: "A",
              rx,
              ry,
              xAxisRotation,
              largeArc,
              sweep,
              x,
              y,
            })
          }
          cx = x
          cy = y
          lastC2x = cx
          lastC2y = cy
          lastQ1x = cx
          lastQ1y = cy
          break
        }
        case "Z": {
          commands.push({ type: "Z" })
          cx = sx
          cy = sy
          lastC2x = cx
          lastC2y = cy
          lastQ1x = cx
          lastQ1y = cy
          break
        }
        default:
          throw new Error(`Unknown path command: ${cmd}`)
      }

      lastCmd = cmd
    } while (
      cmd.toUpperCase() !== "Z" &&
      pos < tokens.length &&
      assertDefined(tokens[pos]).type === "number"
    )
  }

  return commands
}
