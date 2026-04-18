import { type GameObjects, Plugins } from "phaser";
import type { CompiledSVG } from "./compiler.ts";
import { clearSVGDirtyState, drawCompiledSVG, drawCompiledSVGIfDirty, type SVGPathOptions, drawSVG, drawSVGIfDirty, drawSVGPath, drawSVGPathIfDirty, markSVGDirty, type SVGPluginOptions } from "./draw.ts";
import { SVGSceneBatch, type SceneBatchDrawOptions, type SceneBatchPathOptions, type SVGSceneBatchOptions } from "./scene-batch.ts";
import type { SVGStyle } from "./types.ts";
export { clearSVGDirtyState, drawCompiledSVG, drawCompiledSVGIfDirty, drawSVG, drawSVGIfDirty, drawSVGPath, drawSVGPathIfDirty, markSVGDirty, SVGSceneBatch, type SceneBatchDrawOptions, type SceneBatchPathOptions, type SVGSceneBatchOptions, type SVGPathOptions, type SVGPluginOptions, };
/**
 * Phaser v4 Scene Plugin — adds `this.svg` to every Scene.
 *
 * Register in your game config:
 * ```ts
 * import { SVGPlugin } from "phaser-svg-plugin";
 *
 * const config = {
 *   plugins: {
 *     scene: [
 *       { key: "SVGPlugin", plugin: SVGPlugin, mapping: "svg" },
 *     ],
 *   },
 * };
 * ```
 *
 * Then use in any scene:
 * ```ts
 * const graphics = this.add.graphics();
 * this.svg.draw(graphics, svgString);
 * ```
 */
export declare class SVGPlugin extends Plugins.ScenePlugin {
    private defaultOptions;
    private sceneBatch;
    boot(): void;
    /** Set default options for all draw calls in this scene. */
    setDefaults(options: SVGPluginOptions): this;
    /** Draw an SVG string onto a Graphics object. */
    draw(graphics: Phaser.GameObjects.Graphics, svgString: string, options?: SVGPluginOptions | undefined): void;
    /** Draw an SVG string only when it changed since the last draw. */
    drawIfDirty(graphics: Phaser.GameObjects.Graphics, svgString: string, options?: SVGPluginOptions | undefined): boolean;
    /** Draw a single SVG path `d` attribute onto a Graphics object. */
    drawPath(graphics: GameObjects.Graphics, d: string, style?: Partial<SVGStyle> | undefined, options?: SVGPathOptions | undefined): void;
    /** Draw an SVG path only when it changed since the last draw. */
    drawPathIfDirty(graphics: GameObjects.Graphics, d: string, style?: Partial<SVGStyle> | undefined, options?: SVGPathOptions | undefined): boolean;
    /** Draw a pre-compiled SVG onto a Graphics object. */
    drawCompiled(graphics: GameObjects.Graphics, compiled: CompiledSVG, options?: SVGPluginOptions | undefined): void;
    /** Draw a compiled SVG only when it changed since the last draw. */
    drawCompiledIfDirty(graphics: GameObjects.Graphics, compiled: CompiledSVG, options?: SVGPluginOptions | undefined): boolean;
    /** Force the next dirty-aware draw call to render for this Graphics object. */
    markDirty(graphics: GameObjects.Graphics): this;
    /** Clear remembered dirty state for this Graphics object. */
    clearDirtyState(graphics: GameObjects.Graphics): this;
    /** Queue an SVG string into the scene batcher for end-of-frame rendering. */
    queue(svgString: string, options?: SceneBatchDrawOptions | undefined): this;
    /** Queue a pre-compiled SVG into the scene batcher for end-of-frame rendering. */
    queueCompiled(compiled: CompiledSVG, options?: SceneBatchDrawOptions | undefined): this;
    /** Queue a path `d` command list into the scene batcher for end-of-frame rendering. */
    queuePath(d: string, style?: Partial<SVGStyle> | undefined, options?: SceneBatchPathOptions | undefined): this;
    /** Flush queued scene batch work immediately. */
    flushQueue(): boolean;
    /** Access the underlying scene batch queue instance. */
    getSceneBatch(): SVGSceneBatch;
    private ensureSceneBatch;
    destroy(): void;
}
//# sourceMappingURL=plugin.d.ts.map