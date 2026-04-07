import type { PathCommand } from "./types.ts";
/**
 * Parse an SVG path `d` attribute string into an array of absolute path commands.
 *
 * Supports: M/m, L/l, H/h, V/v, C/c, S/s, Q/q, T/t, A/a, Z/z
 * All relative commands are converted to absolute.
 * Implicit repeated commands are handled per SVG spec.
 */
export declare function parsePath(d: string): PathCommand[];
//# sourceMappingURL=path-parser.d.ts.map