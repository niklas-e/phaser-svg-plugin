import type { Point2D } from "./line-join.ts";
/**
 * Compute the four corners of a square line cap rectangle at a path endpoint.
 * The cap extends halfWidth beyond the endpoint, perpendicular to the segment.
 *
 * @param endpoint - The path endpoint where the cap is drawn
 * @param adjacent - The next point inward along the path
 * @param halfWidth - Half the stroke width
 * @returns Four rectangle corners [p0, p1, p2, p3] in winding order, or null if degenerate
 */
export declare function computeSquareCap(endpoint: Point2D, adjacent: Point2D, halfWidth: number): [Point2D, Point2D, Point2D, Point2D] | null;
//# sourceMappingURL=line-cap.d.ts.map