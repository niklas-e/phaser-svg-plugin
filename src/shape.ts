import { resolveStyle } from "./style.ts"
import type { SVGStyle } from "./types.ts"

export interface ConvertedShape {
  d: string
  style: SVGStyle
}

/**
 * Convert a supported SVG shape element to path data + resolved style.
 *
 * Supported now: path, rect, circle, ellipse
 */
export function convertShape(
  tagName: string,
  attrs: Record<string, string>,
): ConvertedShape | undefined {
  const normalisedTag = tagName.toLowerCase()

  let d: string | undefined
  if (normalisedTag === "path") {
    d = attrs.d
  } else if (normalisedTag === "rect") {
    d = rectToPathData(attrs)
  } else if (normalisedTag === "circle") {
    d = circleToPathData(attrs)
  } else if (normalisedTag === "ellipse") {
    d = ellipseToPathData(attrs)
  }

  if (!d) return undefined

  return {
    d,
    style: resolveStyle(attrs),
  }
}

function rectToPathData(attrs: Record<string, string>): string | undefined {
  const x = parseLengthOr(attrs.x, 0)
  const y = parseLengthOr(attrs.y, 0)
  const width = parseLength(attrs.width)
  const height = parseLength(attrs.height)

  if (width === undefined || height === undefined) return undefined
  if (width <= 0 || height <= 0) return undefined

  const { rx, ry } = normaliseRectRadii(attrs, width, height)

  const x2 = x + width
  const y2 = y + height

  if (rx <= 0 || ry <= 0) {
    return `M ${x} ${y} H ${x2} V ${y2} H ${x} V ${y} Z`
  }

  // Rounded rectangle using four elliptical arc corners.
  return [
    `M ${x + rx} ${y}`,
    `H ${x2 - rx}`,
    `A ${rx} ${ry} 0 0 1 ${x2} ${y + ry}`,
    `V ${y2 - ry}`,
    `A ${rx} ${ry} 0 0 1 ${x2 - rx} ${y2}`,
    `H ${x + rx}`,
    `A ${rx} ${ry} 0 0 1 ${x} ${y2 - ry}`,
    `V ${y + ry}`,
    `A ${rx} ${ry} 0 0 1 ${x + rx} ${y}`,
    "Z",
  ].join(" ")
}

function circleToPathData(attrs: Record<string, string>): string | undefined {
  const cx = parseLengthOr(attrs.cx, 0)
  const cy = parseLengthOr(attrs.cy, 0)
  const r = parseLength(attrs.r)

  if (r === undefined || r <= 0) return undefined

  const leftX = cx - r
  const rightX = cx + r

  // Circle as two half-arcs to keep command parity with SVG primitive conversion.
  return [
    `M ${rightX} ${cy}`,
    `A ${r} ${r} 0 1 0 ${leftX} ${cy}`,
    `A ${r} ${r} 0 1 0 ${rightX} ${cy}`,
    "Z",
  ].join(" ")
}

function ellipseToPathData(attrs: Record<string, string>): string | undefined {
  const cx = parseLengthOr(attrs.cx, 0)
  const cy = parseLengthOr(attrs.cy, 0)
  const rx = parseLength(attrs.rx)
  const ry = parseLength(attrs.ry)

  if (rx === undefined || ry === undefined) return undefined
  if (rx <= 0 || ry <= 0) return undefined

  const leftX = cx - rx
  const rightX = cx + rx

  // Ellipse as two half-arcs.
  return [
    `M ${rightX} ${cy}`,
    `A ${rx} ${ry} 0 1 0 ${leftX} ${cy}`,
    `A ${rx} ${ry} 0 1 0 ${rightX} ${cy}`,
    "Z",
  ].join(" ")
}

function normaliseRectRadii(
  attrs: Record<string, string>,
  width: number,
  height: number,
): { rx: number; ry: number } {
  const rawRx = parseLength(attrs.rx)
  const rawRy = parseLength(attrs.ry)

  if (rawRx === undefined && rawRy === undefined) {
    return { rx: 0, ry: 0 }
  }

  let rx = rawRx
  let ry = rawRy

  if (rx === undefined) {
    rx = ry
  }
  if (ry === undefined) {
    ry = rx
  }

  const clampedRx = Math.min(Math.max(rx ?? 0, 0), width / 2)
  const clampedRy = Math.min(Math.max(ry ?? 0, 0), height / 2)

  return { rx: clampedRx, ry: clampedRy }
}

function parseLength(
  raw: string | undefined,
  fallback?: number,
): number | undefined {
  if (raw === undefined) {
    return fallback
  }

  const value = Number.parseFloat(raw)
  if (!Number.isFinite(value)) {
    return fallback
  }

  return value
}

function parseLengthOr(raw: string | undefined, fallback: number): number {
  const parsed = parseLength(raw)
  return parsed === undefined ? fallback : parsed
}
