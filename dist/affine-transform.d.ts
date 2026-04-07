import type { PathCommand } from "./types.ts";
export interface Affine2D {
    a: number;
    b: number;
    c: number;
    d: number;
    e: number;
    f: number;
}
export declare function parseTransform(raw: string | undefined): Affine2D | undefined;
export declare function transformPathCommandsAffine(commands: ReadonlyArray<PathCommand>, matrix: Affine2D): PathCommand[];
/** Approximate scalar to apply to stroke width under affine transform. */
export declare function strokeScaleFromAffine(matrix: Affine2D): number;
//# sourceMappingURL=affine-transform.d.ts.map