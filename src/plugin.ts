import { type GameObjects, Plugins } from "phaser"
import { assertDefined } from "./assert.ts"
import type { CompiledSVG } from "./compiler.ts"
import {
  clearSVGDirtyState,
  drawCompiledSVG,
  drawCompiledSVGIfDirty,
  type SVGPathOptions,
  drawSVG,
  drawSVGIfDirty,
  drawSVGPath,
  drawSVGPathIfDirty,
  markSVGDirty,
  type SVGPluginOptions,
} from "./draw.ts"
import {
  SVGSceneBatch,
  type SceneBatchDrawOptions,
  type SceneBatchPathOptions,
} from "./scene-batch.ts"
import type { SVGStyle } from "./types.ts"

export {
  clearSVGDirtyState,
  drawCompiledSVG,
  drawCompiledSVGIfDirty,
  drawSVG,
  drawSVGIfDirty,
  drawSVGPath,
  drawSVGPathIfDirty,
  markSVGDirty,
  SVGSceneBatch,
  type SceneBatchDrawOptions,
  type SceneBatchPathOptions,
  type SVGPathOptions,
  type SVGPluginOptions,
}

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
export class SVGPlugin extends Plugins.ScenePlugin {
  private defaultOptions: SVGPluginOptions = { msaaSamples: 4 }
  private sceneBatch: SVGSceneBatch | null = null

  boot(): void {
    const events = assertDefined(
      this.systems,
      "Scene systems not available",
    ).events
    events.once("destroy", this.destroy, this)
  }

  /** Set default options for all draw calls in this scene. */
  setDefaults(options: SVGPluginOptions): this {
    this.defaultOptions = { ...options }
    return this
  }

  /** Draw an SVG string onto a Graphics object. */
  draw(
    graphics: Phaser.GameObjects.Graphics,
    svgString: string,
    options?: SVGPluginOptions | undefined,
  ): void {
    drawSVG(graphics, svgString, { ...this.defaultOptions, ...options })
  }

  /** Draw an SVG string only when it changed since the last draw. */
  drawIfDirty(
    graphics: Phaser.GameObjects.Graphics,
    svgString: string,
    options?: SVGPluginOptions | undefined,
  ): boolean {
    return drawSVGIfDirty(graphics, svgString, {
      ...this.defaultOptions,
      ...options,
    })
  }

  /** Draw a single SVG path `d` attribute onto a Graphics object. */
  drawPath(
    graphics: GameObjects.Graphics,
    d: string,
    style?: Partial<SVGStyle> | undefined,
    options?: SVGPathOptions | undefined,
  ): void {
    const pathDefaults: SVGPathOptions = {
      curveResolution: this.defaultOptions.curveResolution,
      curveTolerance: this.defaultOptions.curveTolerance,
      msaaSamples: this.defaultOptions.msaaSamples,
    }
    drawSVGPath(graphics, d, style, { ...pathDefaults, ...options })
  }

  /** Draw an SVG path only when it changed since the last draw. */
  drawPathIfDirty(
    graphics: GameObjects.Graphics,
    d: string,
    style?: Partial<SVGStyle> | undefined,
    options?: SVGPathOptions | undefined,
  ): boolean {
    const pathDefaults: SVGPathOptions = {
      curveResolution: this.defaultOptions.curveResolution,
      curveTolerance: this.defaultOptions.curveTolerance,
      msaaSamples: this.defaultOptions.msaaSamples,
    }
    return drawSVGPathIfDirty(graphics, d, style, {
      ...pathDefaults,
      ...options,
    })
  }

  /** Draw a pre-compiled SVG onto a Graphics object. */
  drawCompiled(
    graphics: GameObjects.Graphics,
    compiled: CompiledSVG,
    options?: SVGPluginOptions | undefined,
  ): void {
    drawCompiledSVG(graphics, compiled, {
      ...this.defaultOptions,
      ...options,
    })
  }

  /** Draw a compiled SVG only when it changed since the last draw. */
  drawCompiledIfDirty(
    graphics: GameObjects.Graphics,
    compiled: CompiledSVG,
    options?: SVGPluginOptions | undefined,
  ): boolean {
    return drawCompiledSVGIfDirty(graphics, compiled, {
      ...this.defaultOptions,
      ...options,
    })
  }

  /** Force the next dirty-aware draw call to render for this Graphics object. */
  markDirty(graphics: GameObjects.Graphics): this {
    markSVGDirty(graphics)
    return this
  }

  /** Clear remembered dirty state for this Graphics object. */
  clearDirtyState(graphics: GameObjects.Graphics): this {
    clearSVGDirtyState(graphics)
    return this
  }

  /** Queue an SVG string into the scene batcher for end-of-frame rendering. */
  queue(svgString: string, options?: SceneBatchDrawOptions | undefined): this {
    this.ensureSceneBatch().queueSVG(svgString, {
      ...this.defaultOptions,
      ...options,
    })
    return this
  }

  /** Queue a pre-compiled SVG into the scene batcher for end-of-frame rendering. */
  queueCompiled(
    compiled: CompiledSVG,
    options?: SceneBatchDrawOptions | undefined,
  ): this {
    this.ensureSceneBatch().queueCompiled(compiled, {
      ...this.defaultOptions,
      ...options,
    })
    return this
  }

  /** Queue a path `d` command list into the scene batcher for end-of-frame rendering. */
  queuePath(
    d: string,
    style?: Partial<SVGStyle> | undefined,
    options?: SceneBatchPathOptions | undefined,
  ): this {
    const pathDefaults: SceneBatchPathOptions = {
      curveResolution: this.defaultOptions.curveResolution,
      curveTolerance: this.defaultOptions.curveTolerance,
      msaaSamples: this.defaultOptions.msaaSamples,
    }

    this.ensureSceneBatch().queuePath(d, style, {
      ...pathDefaults,
      ...options,
    })
    return this
  }

  /** Flush queued scene batch work immediately. */
  flushQueue(): boolean {
    return this.ensureSceneBatch().flush()
  }

  /** Access the underlying scene batch queue instance. */
  getSceneBatch(): SVGSceneBatch {
    return this.ensureSceneBatch()
  }

  private ensureSceneBatch(): SVGSceneBatch {
    if (!this.sceneBatch) {
      this.sceneBatch = new SVGSceneBatch(assertDefined(this.scene))
    }

    return this.sceneBatch
  }

  destroy(): void {
    this.sceneBatch?.destroy()
    this.sceneBatch = null
    super.destroy()
  }
}
