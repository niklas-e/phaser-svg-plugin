import Phaser from "phaser"
import { assertDefined } from "./assert.ts"
import { parsePath } from "./path-parser.ts"
import { type RenderOptions, renderPath } from "./renderer.ts"
import { resolveStyle } from "./style.ts"
import type { SVGStyle } from "./types.ts"

export interface SVGPluginOptions extends RenderOptions {
  /** Override fill color for all elements. */
  overrideFill?: number | undefined
  /** Override stroke color for all elements. */
  overrideStroke?: number | undefined
}

/**
 * Render an SVG `<path>` element's `d` attribute onto a Phaser Graphics object.
 *
 * This is the low-level API. For a higher-level approach, use the scene plugin.
 */
export function drawSVGPath(
  graphics: Phaser.GameObjects.Graphics,
  d: string,
  style?: Partial<SVGStyle> | undefined,
  options?: RenderOptions | undefined,
): void {
  const commands = parsePath(d)
  const resolved = resolveStyleWithOverrides(style)
  renderPath(graphics, commands, resolved, options)
}

/**
 * Parse an SVG string and render all `<path>` elements onto a Graphics object.
 */
export function drawSVG(
  graphics: Phaser.GameObjects.Graphics,
  svgString: string,
  options?: SVGPluginOptions | undefined,
): void {
  const parser = new DOMParser()
  const doc = parser.parseFromString(svgString, "image/svg+xml")
  const paths = doc.querySelectorAll("path")

  for (const pathEl of paths) {
    const d = pathEl.getAttribute("d")
    if (!d) continue

    const attrs: Record<string, string> = {}
    for (const attr of pathEl.attributes) {
      attrs[attr.name] = attr.value
    }

    const style = resolveStyle(attrs)

    if (options?.overrideFill !== undefined) {
      style.fill = options.overrideFill
    }
    if (options?.overrideStroke !== undefined) {
      style.stroke = options.overrideStroke
    }

    const commands = parsePath(d)
    renderPath(graphics, commands, style, options)
  }
}

function resolveStyleWithOverrides(
  partial?: Partial<SVGStyle> | undefined,
): SVGStyle {
  return {
    fill: partial?.fill ?? 0x000000,
    fillAlpha: partial?.fillAlpha ?? 1,
    stroke: partial?.stroke ?? null,
    strokeAlpha: partial?.strokeAlpha ?? 1,
    strokeWidth: partial?.strokeWidth ?? 1,
    lineJoin: partial?.lineJoin ?? "miter",
    lineCap: partial?.lineCap ?? "butt",
    opacity: partial?.opacity ?? 1,
  }
}

/**
 * Phaser v4 Scene Plugin — adds `this.svg` to every Scene.
 *
 * Register in your game config:
 * ```ts
 * import { SVGPlugin } from "phaser-svg";
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
export class SVGPlugin extends Phaser.Plugins.ScenePlugin {
  private defaultOptions: SVGPluginOptions = {}

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

  /** Draw a single SVG path `d` attribute onto a Graphics object. */
  drawPath(
    graphics: Phaser.GameObjects.Graphics,
    d: string,
    style?: Partial<SVGStyle> | undefined,
    options?: RenderOptions | undefined,
  ): void {
    drawSVGPath(graphics, d, style, { ...this.defaultOptions, ...options })
  }

  destroy(): void {
    super.destroy()
  }
}
