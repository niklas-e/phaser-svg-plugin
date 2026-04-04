import type { Point2D } from "./line-join.ts"

/**
 * Compute the four corners of a square line cap rectangle at a path endpoint.
 * The cap extends halfWidth beyond the endpoint, perpendicular to the segment.
 *
 * @param endpoint - The path endpoint where the cap is drawn
 * @param adjacent - The next point inward along the path
 * @param halfWidth - Half the stroke width
 * @returns Four rectangle corners [p0, p1, p2, p3] in winding order, or null if degenerate
 */
export function computeSquareCap(
  endpoint: Point2D,
  adjacent: Point2D,
  halfWidth: number,
): [Point2D, Point2D, Point2D, Point2D] | null {
  const dx = endpoint.x - adjacent.x
  const dy = endpoint.y - adjacent.y
  const len = Math.sqrt(dx * dx + dy * dy)
  if (len < 1e-10) return null

  // Unit direction away from the path interior
  const ux = dx / len
  const uy = dy / len

  // Normal perpendicular, scaled by halfWidth
  const nx = uy * halfWidth
  const ny = -ux * halfWidth

  // Extension along the outward direction
  const ex = ux * halfWidth
  const ey = uy * halfWidth

  return [
    { x: endpoint.x + nx, y: endpoint.y + ny },
    { x: endpoint.x - nx, y: endpoint.y - ny },
    { x: endpoint.x - nx + ex, y: endpoint.y - ny + ey },
    { x: endpoint.x + nx + ex, y: endpoint.y + ny + ey },
  ]
}
