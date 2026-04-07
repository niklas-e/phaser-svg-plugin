export interface Point2D {
    readonly x: number;
    readonly y: number;
}
/**
 * Compute the two outer offset points forming a bevel triangle at a join vertex.
 * The bevel triangle vertices are (vertex, result[0], result[1]).
 * Returns null if segments are collinear or degenerate.
 */
export declare function computeBevelJoin(prev: Point2D, vertex: Point2D, next: Point2D, halfWidth: number): [Point2D, Point2D] | null;
export interface MiterJoinResult {
    /** The two bevel offset points at the join */
    bevel: [Point2D, Point2D];
    /** The miter tip point, or null if miter limit exceeded (fall back to bevel) */
    miter: Point2D | null;
}
/**
 * Compute a miter join at a vertex. Returns the bevel offset points and the
 * miter tip where the outer stroke edges intersect. If the miter ratio exceeds
 * miterLimit, the miter field is null (caller should fall back to bevel).
 * Returns null if segments are collinear or degenerate.
 */
export declare function computeMiterJoin(prev: Point2D, vertex: Point2D, next: Point2D, halfWidth: number, miterLimit: number): MiterJoinResult | null;
//# sourceMappingURL=line-join.d.ts.map