import type { GameObjects } from "phaser"
import type { SVGStyle } from "./types.ts"

export type NativeShape =
  | { kind: "circle"; cx: number; cy: number; r: number }
  | { kind: "ellipse"; cx: number; cy: number; rx: number; ry: number }

type EllipsePoint = { x: number; y: number }

const ELLIPSE_SAMPLE_CACHE_MAX_ENTRIES = 512
const ELLIPSE_SAMPLE_CACHE = new Map<string, ReadonlyArray<EllipsePoint>>()

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
    return applyShapeTransform({ kind: "circle", cx, cy, r }, attrs.transform)
  }

  if (kind === "ellipse") {
    const cx = parseLengthOr(attrs.cx, 0)
    const cy = parseLengthOr(attrs.cy, 0)
    const rx = parseLength(attrs.rx)
    const ry = parseLength(attrs.ry)
    if (rx === undefined || ry === undefined) return undefined
    if (rx <= 0 || ry <= 0) return undefined
    return applyShapeTransform(
      { kind: "ellipse", cx, cy, rx, ry },
      attrs.transform,
    )
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
  graphics: GameObjects.Graphics,
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
  graphics: GameObjects.Graphics,
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
  const outer = getSampledEllipse(outerRx, outerRy, segments)
  const inner = getSampledEllipse(innerRx, innerRy, segments)

  for (let i = 0; i < segments; i++) {
    const next = (i + 1) % segments
    const o0 = outer[i]
    const o1 = outer[next]
    const i0 = inner[i]
    const i1 = inner[next]
    if (!o0 || !o1 || !i0 || !i1) continue

    graphics.fillTriangle(
      o0.x + cx,
      o0.y + cy,
      o1.x + cx,
      o1.y + cy,
      i1.x + cx,
      i1.y + cy,
    )
    graphics.fillTriangle(
      o0.x + cx,
      o0.y + cy,
      i1.x + cx,
      i1.y + cy,
      i0.x + cx,
      i0.y + cy,
    )
  }
}

function getSampledEllipse(
  rx: number,
  ry: number,
  segments: number,
): ReadonlyArray<EllipsePoint> {
  const key = `${segments}|${rx}|${ry}`
  const cached = ELLIPSE_SAMPLE_CACHE.get(key)
  if (cached) {
    return cached
  }

  const points: EllipsePoint[] = []
  const step = (Math.PI * 2) / segments

  for (let i = 0; i < segments; i++) {
    const theta = i * step
    points.push({
      x: rx * Math.cos(theta),
      y: ry * Math.sin(theta),
    })
  }

  if (ELLIPSE_SAMPLE_CACHE.size >= ELLIPSE_SAMPLE_CACHE_MAX_ENTRIES) {
    const oldestKey = ELLIPSE_SAMPLE_CACHE.keys().next().value
    if (oldestKey !== undefined) {
      ELLIPSE_SAMPLE_CACHE.delete(oldestKey)
    }
  }

  ELLIPSE_SAMPLE_CACHE.set(key, points)

  return points
}

function computeEllipseSegments(rx: number, ry: number): number {
  const maxRadius = Math.max(Math.abs(rx), Math.abs(ry))
  if (maxRadius <= 0) {
    return 24
  }

  const tolerance = clamp(0.25, 1e-4, maxRadius)
  const ratio = clamp(1 - tolerance / maxRadius, -1, 1)
  const maxAngle = 2 * Math.acos(ratio)
  const safeAngle =
    Number.isFinite(maxAngle) && maxAngle > 0 ? maxAngle : Math.PI / 16

  return clamp(Math.ceil((Math.PI * 2) / safeAngle), 24, 512)
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

interface Affine2D {
  a: number
  b: number
  c: number
  d: number
  e: number
  f: number
}

function applyShapeTransform(
  shape: NativeShape,
  rawTransform: string | undefined,
): NativeShape {
  const matrix = parseMatrixTransform(rawTransform)
  if (!matrix) return shape

  const cx = matrix.a * shape.cx + matrix.c * shape.cy + matrix.e
  const cy = matrix.b * shape.cx + matrix.d * shape.cy + matrix.f

  // Approximate transformed radii from transformed unit axes. This handles
  // translation, scale and reflection exactly, and gives a stable fallback
  // for more complex matrices.
  const sx = Math.hypot(matrix.a, matrix.b)
  const sy = Math.hypot(matrix.c, matrix.d)

  if (shape.kind === "circle") {
    const rx = shape.r * sx
    const ry = shape.r * sy
    if (Math.abs(rx - ry) < 1e-9) {
      return { kind: "circle", cx, cy, r: (rx + ry) / 2 }
    }
    return { kind: "ellipse", cx, cy, rx, ry }
  }

  return {
    kind: "ellipse",
    cx,
    cy,
    rx: shape.rx * sx,
    ry: shape.ry * sy,
  }
}

function parseMatrixTransform(raw: string | undefined): Affine2D | undefined {
  if (!raw) return undefined

  const match = raw.match(/matrix\s*\(([^)]*)\)/i)
  if (!match?.[1]) return undefined

  const values = Array.from(
    match[1].matchAll(/[-+]?(?:\d*\.\d+|\d+)(?:[eE][-+]?\d+)?/g),
    (m) => Number(m[0]),
  )
  if (values.length !== 6) return undefined

  const [a, b, c, d, e, f] = values
  if (
    a === undefined ||
    b === undefined ||
    c === undefined ||
    d === undefined ||
    e === undefined ||
    f === undefined
  ) {
    return undefined
  }

  return { a, b, c, d, e, f }
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
