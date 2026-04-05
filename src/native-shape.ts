import type Phaser from "phaser"
import type { SVGStyle } from "./types.ts"

export type NativeShape =
  | { kind: "circle"; cx: number; cy: number; r: number }
  | { kind: "ellipse"; cx: number; cy: number; rx: number; ry: number }

export function parseNativeShape(
  tagName: string,
  attrs: Record<string, string>,
): NativeShape | undefined {
  const kind = tagName.toLowerCase()

  if (kind === "circle") {
    const cx = parseLengthOr(attrs.cx, 0)
    const cy = parseLengthOr(attrs.cy, 0)
    const r = parseLength(attrs.r)
    if (r === undefined || r <= 0) return undefined
    return { kind: "circle", cx, cy, r }
  }

  if (kind === "ellipse") {
    const cx = parseLengthOr(attrs.cx, 0)
    const cy = parseLengthOr(attrs.cy, 0)
    const rx = parseLength(attrs.rx)
    const ry = parseLength(attrs.ry)
    if (rx === undefined || ry === undefined) return undefined
    if (rx <= 0 || ry <= 0) return undefined
    return { kind: "ellipse", cx, cy, rx, ry }
  }

  return undefined
}

export function transformNativeShape(
  shape: NativeShape,
  scale: number,
  tx: number,
  ty: number,
): NativeShape {
  if (shape.kind === "circle") {
    return {
      kind: "circle",
      cx: shape.cx * scale + tx,
      cy: shape.cy * scale + ty,
      r: shape.r * scale,
    }
  }

  return {
    kind: "ellipse",
    cx: shape.cx * scale + tx,
    cy: shape.cy * scale + ty,
    rx: shape.rx * scale,
    ry: shape.ry * scale,
  }
}

export function drawNativeShape(
  graphics: Phaser.GameObjects.Graphics,
  shape: NativeShape,
  style: SVGStyle,
): void {
  const { cx, cy, rx, ry } = getNativeRadii(shape)
  const effectiveFillAlpha =
    style.fill !== null ? style.fillAlpha * style.opacity : 0
  const effectiveStrokeAlpha =
    style.stroke !== null ? style.strokeAlpha * style.opacity : 0

  if (style.fill !== null && effectiveFillAlpha > 0) {
    graphics.fillStyle(style.fill, effectiveFillAlpha)
    const segments = computeEllipseSegments(rx, ry)
    graphics.fillEllipse(cx, cy, rx * 2, ry * 2, segments)
  }

  if (
    style.stroke !== null &&
    style.strokeWidth > 0 &&
    effectiveStrokeAlpha > 0
  ) {
    drawNativeStrokeRing(
      graphics,
      shape,
      style.stroke,
      effectiveStrokeAlpha,
      style.strokeWidth,
    )
  }
}

function getNativeRadii(shape: NativeShape): {
  cx: number
  cy: number
  rx: number
  ry: number
} {
  if (shape.kind === "circle") {
    return {
      cx: shape.cx,
      cy: shape.cy,
      rx: shape.r,
      ry: shape.r,
    }
  }

  return {
    cx: shape.cx,
    cy: shape.cy,
    rx: shape.rx,
    ry: shape.ry,
  }
}

function drawNativeStrokeRing(
  graphics: Phaser.GameObjects.Graphics,
  shape: NativeShape,
  stroke: number,
  strokeAlpha: number,
  strokeWidth: number,
): void {
  const { cx, cy, rx, ry } = getNativeRadii(shape)
  const halfWidth = strokeWidth / 2

  const outerRx = rx + halfWidth
  const outerRy = ry + halfWidth
  const innerRx = rx - halfWidth
  const innerRy = ry - halfWidth

  graphics.fillStyle(stroke, strokeAlpha)

  // If stroke covers the center, render as a filled outer ellipse.
  if (innerRx <= 0 || innerRy <= 0) {
    const segments = computeEllipseSegments(outerRx, outerRy)
    graphics.fillEllipse(cx, cy, outerRx * 2, outerRy * 2, segments)
    return
  }

  const segments = computeEllipseSegments(outerRx, outerRy)
  const outer = sampleEllipse(cx, cy, outerRx, outerRy, segments)
  const inner = sampleEllipse(cx, cy, innerRx, innerRy, segments)

  for (let i = 0; i < segments; i++) {
    const next = (i + 1) % segments
    const o0 = outer[i]
    const o1 = outer[next]
    const i0 = inner[i]
    const i1 = inner[next]
    if (!o0 || !o1 || !i0 || !i1) continue

    graphics.fillTriangle(o0.x, o0.y, o1.x, o1.y, i1.x, i1.y)
    graphics.fillTriangle(o0.x, o0.y, i1.x, i1.y, i0.x, i0.y)
  }
}

function sampleEllipse(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  segments: number,
): Array<{ x: number; y: number }> {
  const points: Array<{ x: number; y: number }> = []
  const step = (Math.PI * 2) / segments

  for (let i = 0; i < segments; i++) {
    const theta = i * step
    points.push({
      x: cx + rx * Math.cos(theta),
      y: cy + ry * Math.sin(theta),
    })
  }

  return points
}

function computeEllipseSegments(rx: number, ry: number): number {
  // Ramanujan approximation. About 2px edge length keeps curves smooth
  // without creating excessive triangles.
  const circumference =
    Math.PI * (3 * (rx + ry) - Math.sqrt((3 * rx + ry) * (rx + 3 * ry)))
  return clamp(Math.ceil(circumference / 2), 24, 256)
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

function parseLength(
  raw: string | undefined,
  fallback?: number,
): number | undefined {
  if (raw === undefined) return fallback
  const value = Number.parseFloat(raw)
  return Number.isFinite(value) ? value : fallback
}

function parseLengthOr(raw: string | undefined, fallback: number): number {
  const parsed = parseLength(raw)
  return parsed === undefined ? fallback : parsed
}
