import type { PathCommand, ViewBox } from "./types.ts";
/**
 * Compute a uniform scale + translate that maps a viewBox into a
 * target rectangle (xMidYMid meet — the SVG default).
 */
export declare function viewBoxTransform(viewBox: ViewBox, targetW: number, targetH: number): {
    scale: number;
    tx: number;
    ty: number;
};
/** Apply uniform scale + translate to path commands. */
export declare function transformCommands(commands: PathCommand[], scale: number, tx: number, ty: number): PathCommand[];
//# sourceMappingURL=transform.d.ts.map