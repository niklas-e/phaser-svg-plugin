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

  return [
    {
      x: vertex.x + (sign * dInY * halfWidth) / lenIn,
      y: vertex.y - (sign * dInX * halfWidth) / lenIn,
    },
    {
      x: vertex.x + (sign * dOutY * halfWidth) / lenOut,
      y: vertex.y - (sign * dOutX * halfWidth) / lenOut,
    },
  ]
}
