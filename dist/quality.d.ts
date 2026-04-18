import type { RenderOptions } from "./renderer.ts";
interface RendererConfigLike {
    pathDetailThreshold?: number | undefined;
}
export declare const DEFAULT_CURVE_TOLERANCE = 0.125;
/**
 * Resolve the effective curve flattening tolerance.
 *
 * Explicit `curveTolerance` wins.
 * Otherwise, the renderer defaults to an eighth-pixel screen-space error.
 */
export declare function resolveCurveTolerance(options?: Pick<RenderOptions, "curveTolerance"> | undefined): number;
/**
 * Explicit fixed-segment override for curve flattening.
 *
 * When omitted, the renderer uses adaptive subdivision.
 */
export declare function resolveCurveResolution(options?: Pick<RenderOptions, "curveResolution"> | undefined): number | undefined;
/**
 * Disable Phaser Graphics path simplification.
 *
 * Phaser defaults to `pathDetailThreshold = 1`, which can drop close points
 * in tiny vector paths and make icons look rough. We set it to 0 only when
 * needed.
 */
export declare function applyCrispPathDetailThreshold(config: RendererConfigLike | null | undefined): boolean;
export {};
//# sourceMappingURL=quality.d.ts.map