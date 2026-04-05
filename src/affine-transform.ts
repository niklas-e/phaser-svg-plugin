import type { PathCommand } from "./types.ts"

export interface Affine2D {
  a: number
  b: number
  c: number
  d: number
  e: number
  f: number
}

const IDENTITY: Affine2D = {
  a: 1,
  b: 0,
  c: 0,
  d: 1,
  e: 0,
  f: 0,
}

export function parseTransform(raw: string | undefined): Affine2D | undefined {
  if (!raw) return undefined

  const tokenRegex = /([a-zA-Z]+)\s*\(([^)]*)\)/g
  let matrix = IDENTITY
  let matched = false

  for (const token of raw.matchAll(tokenRegex)) {
    const kindRaw = token[1]
    const argsRaw = token[2]
    if (!kindRaw || !argsRaw) continue

    const kind = kindRaw.toLowerCase()
    const values = parseTransformNumbers(argsRaw)
    const op = buildTransformMatrix(kind, values)
    if (!op) continue

    matched = true
    // SVG applies transforms in listed order.
    matrix = multiplyAffine(op, matrix)
  }

  if (!matched) return undefined
  return matrix
}

export function transformPathCommandsAffine(
  commands: ReadonlyArray<PathCommand>,
  matrix: Affine2D,
): PathCommand[] {
  const result: PathCommand[] = []
  const { sx, sy, isSkewed, det, rotationDeg } = decomposeLinear(matrix)

  for (const cmd of commands) {
    switch (cmd.type) {
      case "M": {
        const p = transformPoint(matrix, cmd.x, cmd.y)
        result.push({ type: "M", x: p.x, y: p.y })
        break
      }
      case "L": {
        const p = transformPoint(matrix, cmd.x, cmd.y)
        result.push({ type: "L", x: p.x, y: p.y })
        break
      }
      case "C": {
        const p1 = transformPoint(matrix, cmd.x1, cmd.y1)
        const p2 = transformPoint(matrix, cmd.x2, cmd.y2)
        const p = transformPoint(matrix, cmd.x, cmd.y)
        result.push({
          type: "C",
          x1: p1.x,
          y1: p1.y,
          x2: p2.x,
          y2: p2.y,
          x: p.x,
          y: p.y,
        })
        break
      }
      case "Q": {
        const p1 = transformPoint(matrix, cmd.x1, cmd.y1)
        const p = transformPoint(matrix, cmd.x, cmd.y)
        result.push({
          type: "Q",
          x1: p1.x,
          y1: p1.y,
          x: p.x,
          y: p.y,
        })
        break
      }
      case "A": {
        const p = transformPoint(matrix, cmd.x, cmd.y)
        let xAxisRotation = cmd.xAxisRotation
        let sweep = cmd.sweep

        // Exact for translate/rotate/uniform scale/reflection; stable fallback
        // for mild non-uniform scales. Skewed transforms cannot be represented
        // exactly in SVG arc endpoint parameterization.
        const rx = cmd.rx * sx
        const ry = cmd.ry * sy
        if (!isSkewed) {
          xAxisRotation += rotationDeg
          if (det < 0) {
            sweep = !sweep
          }
        }

        result.push({
          type: "A",
          rx,
          ry,
          xAxisRotation,
          largeArc: cmd.largeArc,
          sweep,
          x: p.x,
          y: p.y,
        })
        break
      }
      case "Z":
        result.push(cmd)
        break
    }
  }

  return result
}

/** Approximate scalar to apply to stroke width under affine transform. */
export function strokeScaleFromAffine(matrix: Affine2D): number {
  const { sx, sy } = decomposeLinear(matrix)
  return (sx + sy) / 2
}

function buildTransformMatrix(kind: string, values: number[]): Affine2D | null {
  switch (kind) {
    case "matrix": {
      if (values.length !== 6) return null
      const [a, b, c, d, e, f] = values
      if (
        a === undefined ||
        b === undefined ||
        c === undefined ||
        d === undefined ||
        e === undefined ||
        f === undefined
      ) {
        return null
      }
      return { a, b, c, d, e, f }
    }
    case "translate": {
      if (values.length < 1) return null
      const tx = values[0]
      const ty = values[1] ?? 0
      if (tx === undefined) return null
      return { ...IDENTITY, e: tx, f: ty }
    }
    case "scale": {
      if (values.length < 1) return null
      const sx = values[0]
      const sy = values[1] ?? sx
      if (sx === undefined || sy === undefined) return null
      return { a: sx, b: 0, c: 0, d: sy, e: 0, f: 0 }
    }
    case "rotate": {
      if (values.length < 1) return null
      const angle = values[0]
      if (angle === undefined) return null
      const theta = (angle * Math.PI) / 180
      const cos = Math.cos(theta)
      const sin = Math.sin(theta)

      if (values.length >= 3) {
        const cx = values[1]
        const cy = values[2]
        if (cx === undefined || cy === undefined) return null

        const t1 = { ...IDENTITY, e: cx, f: cy }
        const r = { a: cos, b: sin, c: -sin, d: cos, e: 0, f: 0 }
        const t0 = { ...IDENTITY, e: -cx, f: -cy }
        return multiplyAffine(t1, multiplyAffine(r, t0))
      }

      return { a: cos, b: sin, c: -sin, d: cos, e: 0, f: 0 }
    }
    case "skewx": {
      if (values.length < 1) return null
      const angle = values[0]
      if (angle === undefined) return null
      const t = Math.tan((angle * Math.PI) / 180)
      return { a: 1, b: 0, c: t, d: 1, e: 0, f: 0 }
    }
    case "skewy": {
      if (values.length < 1) return null
      const angle = values[0]
      if (angle === undefined) return null
      const t = Math.tan((angle * Math.PI) / 180)
      return { a: 1, b: t, c: 0, d: 1, e: 0, f: 0 }
    }
    default:
      return null
  }
}

function parseTransformNumbers(raw: string): number[] {
  return Array.from(
    raw.matchAll(/[-+]?(?:\d*\.\d+|\d+)(?:[eE][-+]?\d+)?/g),
    (m) => Number(m[0]),
  ).filter((n) => Number.isFinite(n))
}

function transformPoint(
  m: Affine2D,
  x: number,
  y: number,
): { x: number; y: number } {
  return {
    x: m.a * x + m.c * y + m.e,
    y: m.b * x + m.d * y + m.f,
  }
}

function multiplyAffine(left: Affine2D, right: Affine2D): Affine2D {
  return {
    a: left.a * right.a + left.c * right.b,
    b: left.b * right.a + left.d * right.b,
    c: left.a * right.c + left.c * right.d,
    d: left.b * right.c + left.d * right.d,
    e: left.a * right.e + left.c * right.f + left.e,
    f: left.b * right.e + left.d * right.f + left.f,
  }
}

function decomposeLinear(matrix: Affine2D): {
  sx: number
  sy: number
  det: number
  isSkewed: boolean
  rotationDeg: number
} {
  const sx = Math.hypot(matrix.a, matrix.b)
  const sy = Math.hypot(matrix.c, matrix.d)
  const det = matrix.a * matrix.d - matrix.b * matrix.c
  const dot = matrix.a * matrix.c + matrix.b * matrix.d
  const isSkewed = Math.abs(dot) > 1e-6
  const rotationDeg = (Math.atan2(matrix.b, matrix.a) * 180) / Math.PI

  return { sx, sy, det, isSkewed, rotationDeg }
}
