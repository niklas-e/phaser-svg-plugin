import { assertDefined } from "./assert.ts"

/** Named CSS colors → 0xRRGGBB. Only the most common subset; extend as needed. */
const NAMED_COLORS: Record<string, number> = {
  black: 0x000000,
  white: 0xffffff,
  red: 0xff0000,
  green: 0x008000,
  blue: 0x0000ff,
  yellow: 0xffff00,
  cyan: 0x00ffff,
  magenta: 0xff00ff,
  orange: 0xffa500,
  purple: 0x800080,
  lime: 0x00ff00,
  pink: 0xffc0cb,
  gray: 0x808080,
  grey: 0x808080,
  silver: 0xc0c0c0,
  maroon: 0x800000,
  olive: 0x808000,
  navy: 0x000080,
  teal: 0x008080,
  aqua: 0x00ffff,
  fuchsia: 0xff00ff,
  transparent: 0x000000,
}

export interface ParsedColor {
  color: number
  alpha: number
}

/**
 * Parse a CSS/SVG color string into a Phaser `0xRRGGBB` integer + alpha.
 * Supports: `#rgb`, `#rrggbb`, `rgb()`, `rgba()`, named colors.
 * Returns `null` for `"none"` or unrecognised values.
 */
export function parseColor(raw: string): ParsedColor | null {
  const s = raw.trim().toLowerCase()

  if (s === "none" || s === "") return null
  if (s === "transparent") return { color: 0x000000, alpha: 0 }

  // #rrggbb
  if (s.length === 7 && s[0] === "#") {
    const v = Number.parseInt(s.slice(1), 16)
    if (!Number.isNaN(v)) return { color: v, alpha: 1 }
  }

  // #rgb
  if (s.length === 4 && s[0] === "#") {
    const r = Number.parseInt(assertDefined(s[1]) + assertDefined(s[1]), 16)
    const g = Number.parseInt(assertDefined(s[2]) + assertDefined(s[2]), 16)
    const b = Number.parseInt(assertDefined(s[3]) + assertDefined(s[3]), 16)
    if (!Number.isNaN(r) && !Number.isNaN(g) && !Number.isNaN(b)) {
      return { color: (r << 16) | (g << 8) | b, alpha: 1 }
    }
  }

  // rgb(r, g, b) or rgba(r, g, b, a)
  const rgbaMatch =
    /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+)\s*)?\)$/.exec(s)
  if (rgbaMatch) {
    const r = Math.min(255, Number(rgbaMatch[1]))
    const g = Math.min(255, Number(rgbaMatch[2]))
    const b = Math.min(255, Number(rgbaMatch[3]))
    const a = rgbaMatch[4] !== undefined ? Number(rgbaMatch[4]) : 1
    return { color: (r << 16) | (g << 8) | b, alpha: a }
  }

  // Named color
  const named = NAMED_COLORS[s]
  if (named !== undefined) return { color: named, alpha: 1 }

  return null
}
