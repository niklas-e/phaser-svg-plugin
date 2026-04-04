export interface Point2D {
  readonly x: number
  readonly y: number
}

/**
 * Compute the two outer offset points forming a bevel triangle at a join vertex.
 * The bevel triangle vertices are (vertex, result[0], result[1]).
 * Returns null if segments are collinear or degenerate.
 */
export function computeBevelJoin(
  prev: Point2D,
  vertex: Point2D,
  next: Point2D,
  halfWidth: number,
): [Point2D, Point2D] | null {
  const result = computeJoinVectors(prev, vertex, next, halfWidth)
  if (result === null) return null
  return result.bevel
}

export interface MiterJoinResult {
  /** The two bevel offset points at the join */
  bevel: [Point2D, Point2D]
  /** The miter tip point, or null if miter limit exceeded (fall back to bevel) */
  miter: Point2D | null
}

/**
 * Compute a miter join at a vertex. Returns the bevel offset points and the
 * miter tip where the outer stroke edges intersect. If the miter ratio exceeds
 * miterLimit, the miter field is null (caller should fall back to bevel).
 * Returns null if segments are collinear or degenerate.
 */
export function computeMiterJoin(
  prev: Point2D,
  vertex: Point2D,
  next: Point2D,
  halfWidth: number,
  miterLimit: number,
): MiterJoinResult | null {
  const result = computeJoinVectors(prev, vertex, next, halfWidth)
  if (result === null) return null

  const { bevel, dInX, dInY, dOutX, dOutY, lenIn, lenOut } = result

  // Miter ratio check using: miterRatio² = 2 / (1 - cosAngle)
  // cosAngle = -(d_in · d_out) / (lenIn * lenOut)
  const dot = dInX * dOutX + dInY * dOutY
  const cosAngle = -dot / (lenIn * lenOut)
  const oneMinusCos = 1 - cosAngle

  if (oneMinusCos < 1e-10) {
    // Nearly straight line — no visible gap
    return null
  }

  const miterRatioSq = 2 / oneMinusCos
  if (miterRatioSq > miterLimit * miterLimit) {
    return { bevel, miter: null }
  }

  // Miter point via line intersection of the two offset edges
  const uInX = dInX / lenIn
  const uInY = dInY / lenIn
  const uOutX = dOutX / lenOut
  const uOutY = dOutY / lenOut

  const det = -(uInX * uOutY - uInY * uOutX)
  if (Math.abs(det) < 1e-10) return null

  const dx = bevel[1].x - bevel[0].x
  const dy = bevel[1].y - bevel[0].y
  const t = (-dx * uOutY + dy * uOutX) / det

  return {
    bevel,
    miter: {
      x: bevel[0].x + t * uInX,
      y: bevel[0].y + t * uInY,
    },
  }
}

/** Shared computation for bevel/miter join geometry */
function computeJoinVectors(
  prev: Point2D,
  vertex: Point2D,
  next: Point2D,
  halfWidth: number,
): {
  bevel: [Point2D, Point2D]
  dInX: number
  dInY: number
  dOutX: number
  dOutY: number
  lenIn: number
  lenOut: number
} | null {
  const dInX = vertex.x - prev.x
  const dInY = vertex.y - prev.y
  const dOutX = next.x - vertex.x
  const dOutY = next.y - vertex.y

  const lenIn = Math.sqrt(dInX * dInX + dInY * dInY)
  const lenOut = Math.sqrt(dOutX * dOutX + dOutY * dOutY)
  if (lenIn < 1e-10 || lenOut < 1e-10) return null

  const cross = dInX * dOutY - dInY * dOutX
  if (Math.abs(cross) < 1e-10) return null

  const sign = cross > 0 ? 1 : -1

  return {
    bevel: [
      {
        x: vertex.x + (sign * dInY * halfWidth) / lenIn,
        y: vertex.y - (sign * dInX * halfWidth) / lenIn,
      },
      {
        x: vertex.x + (sign * dOutY * halfWidth) / lenOut,
        y: vertex.y - (sign * dOutX * halfWidth) / lenOut,
      },
    ],
    dInX,
    dInY,
    dOutX,
    dOutY,
    lenIn,
    lenOut,
  }
}
