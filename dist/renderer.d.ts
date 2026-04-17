import type { GameObjects } from "phaser";
import type { PathCommand, SVGStyle } from "./types.ts";
export interface RenderOptions {
    /** Points per curve segment for tessellation. */
    curveResolution?: number | undefined;
}
/**
 * Render parsed SVG path commands onto a Phaser Graphics object.
 */
export declare function renderPath(graphics: GameObjects.Graphics, commands: PathCommand[], style: SVGStyle, options?: RenderOptions | undefined): void;
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