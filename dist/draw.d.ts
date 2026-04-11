import type { GameObjects } from "phaser";
import type { CompiledSVG } from "./compiler.ts";
import { type RenderOptions } from "./renderer.ts";
import type { SVGStyle } from "./types.ts";
export interface SVGPluginOptions extends RenderOptions {
    /** Override fill color for all elements. */
    overrideFill?: number | undefined;
    /** Override stroke color for all elements. */
    overrideStroke?: number | undefined;
    /** Target width — scales the SVG viewBox to fit. */
    width?: number | undefined;
    /** Target height — scales the SVG viewBox to fit. */
    height?: number | undefined;
}
/**
 * Render an SVG `<path>` element's `d` attribute onto a Phaser Graphics object.
 */
export declare function drawSVGPath(graphics: GameObjects.Graphics, d: string, style?: Partial<SVGStyle> | undefined, options?: RenderOptions | undefined): void;
/**
 * Boolean-return alias of `drawSVGPath`.
 *
 * Returns true when a draw occurred, false when skipped.
 */
export declare function drawSVGPathIfDirty(graphics: GameObjects.Graphics, d: string, style?: Partial<SVGStyle> | undefined, options?: RenderOptions | undefined): boolean;
/**
 * Parse an SVG string and render all supported shape elements onto Graphics.
 */
export declare function drawSVG(graphics: GameObjects.Graphics, svgString: string, options?: SVGPluginOptions | undefined): void;
/**
 * Boolean-return alias of `drawSVG`.
 *
 * Returns true when a draw occurred, false when skipped.
 */
export declare function drawSVGIfDirty(graphics: GameObjects.Graphics, svgString: string, options?: SVGPluginOptions | undefined): boolean;
/**
 * Render a pre-compiled SVG onto a Graphics object.
 */
export declare function drawCompiledSVG(graphics: GameObjects.Graphics, compiled: CompiledSVG, options?: SVGPluginOptions | undefined): void;
/**
 * Boolean-return alias of `drawCompiledSVG`.
 *
 * Returns true when a draw occurred, false when skipped.
 */
export declare function drawCompiledSVGIfDirty(graphics: GameObjects.Graphics, compiled: CompiledSVG, options?: SVGPluginOptions | undefined): boolean;
/**
 * Force the next dirty-aware draw call for this Graphics object to render.
 */
export declare function markSVGDirty(graphics: GameObjects.Graphics): void;
/**
 * Clear remembered dirty state for this Graphics object.
 */
export declare function clearSVGDirtyState(graphics: GameObjects.Graphics): void;
//# sourceMappingURL=draw.d.ts.map