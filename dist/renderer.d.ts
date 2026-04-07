import type Phaser from "phaser";
import type { PathCommand, SVGStyle } from "./types.ts";
export interface RenderOptions {
    /** Points per curve segment for tessellation. */
    curveResolution?: number | undefined;
}
/**
 * Render parsed SVG path commands onto a Phaser Graphics object.
 */
export declare function renderPath(graphics: Phaser.GameObjects.Graphics, commands: PathCommand[], style: SVGStyle, options?: RenderOptions | undefined): void;
interface BridgeEdge {
    a: {
        x: number;
        y: number;
    };
    b: {
        x: number;
        y: number;
    };
}
/**
 * Merge an outer ring with one or more hole rings into a single simple
 * polygon by inserting bridge edges.
 *
 * For each hole the algorithm finds the pair of vertices (one on the
 * current merged ring, one on the hole) with the smallest Euclidean
 * distance and splices the hole into the ring at that point:
 *
 *   …outer[i] → hole[j] → hole[j-1] → … → hole[j+1] → hole[j] → outer[i] → …
 *
 * The two bridge edges (outer[i]↔hole[j]) are nearly coincident, so the
 * visual result is an invisible slit connecting the boundaries.
 *
 * Returns both the merged ring and the bridge edge locations so the
 * caller can patch hairline rasterization cracks.
 */
export declare function buildBridgedPolygon(outer: ReadonlyArray<{
    x: number;
    y: number;
}>, holes: ReadonlyArray<ReadonlyArray<{
    x: number;
    y: number;
}>>): {
    ring: Array<{
        x: number;
        y: number;
    }>;
    bridges: BridgeEdge[];
};
interface FillGroup {
    outer: ReadonlyArray<{
        x: number;
        y: number;
    }>;
    holes: ReadonlyArray<{
        x: number;
        y: number;
    }>[];
}
/**
 * Group closed subpaths into outer rings + holes using winding direction
 * and bounding-box containment.
 *
 * SVG nonzero fill rule: outer contours wind one direction, holes wind
 * the opposite. We use signed area to classify each subpath, then assign
 * holes to the smallest enclosing outer via bounding box.
 */
export declare function groupSubpathsForFill(closed: ReadonlyArray<{
    points: ReadonlyArray<{
        x: number;
        y: number;
    }>;
}>): FillGroup[];
/** Signed area × 2 of a polygon (positive = CW in screen coords). */
export declare function signedArea2(points: ReadonlyArray<{
    x: number;
    y: number;
}>): number;
/**
 * Remove consecutive near-duplicate points that confuse earcut.
 * Also strips a duplicate closing vertex (last ≈ first).
 */
export declare function deduplicatePoints<T extends {
    x: number;
    y: number;
}>(points: T[]): T[];
export declare function splitSubpaths(commands: PathCommand[]): PathCommand[][];
export {};
//# sourceMappingURL=renderer.d.ts.map