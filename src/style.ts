import { parseColor } from "./color.ts"
import { DEFAULT_STYLE, type SVGStyle } from "./types.ts"

/**
 * Resolve SVG presentation attributes into a normalised SVGStyle.
 * Accepts a plain object (attribute name → value string).
 */
export function resolveStyle(attrs: Record<string, string>): SVGStyle {
  const style: SVGStyle = { ...DEFAULT_STYLE }

  const fillRaw = attrs.fill
  if (fillRaw !== undefined) {
    const parsed = parseColor(fillRaw)
    if (parsed === null) {
      style.fill = null
    } else {
      style.fill = parsed.color
      style.fillAlpha = parsed.alpha
    }
  }

  const fillOpacity = attrs["fill-opacity"]
  if (fillOpacity !== undefined) {
    style.fillAlpha = Number(fillOpacity)
  }

  const strokeRaw = attrs.stroke
  if (strokeRaw !== undefined) {
    const parsed = parseColor(strokeRaw)
    if (parsed === null) {
      style.stroke = null
    } else {
      style.stroke = parsed.color
      style.strokeAlpha = parsed.alpha
    }
  }

  const strokeOpacity = attrs["stroke-opacity"]
  if (strokeOpacity !== undefined) {
    style.strokeAlpha = Number(strokeOpacity)
  }

  const strokeWidth = attrs["stroke-width"]
  if (strokeWidth !== undefined) {
    style.strokeWidth = Number(strokeWidth)
  }

  const lineJoin = attrs["stroke-linejoin"]
  if (lineJoin === "round" || lineJoin === "bevel" || lineJoin === "miter") {
    style.lineJoin = lineJoin
  }

  const lineCap = attrs["stroke-linecap"]
  if (lineCap === "round" || lineCap === "square" || lineCap === "butt") {
    style.lineCap = lineCap
  }

  const opacity = attrs.opacity
  if (opacity !== undefined) {
    style.opacity = Number(opacity)
  }

  return style
}
