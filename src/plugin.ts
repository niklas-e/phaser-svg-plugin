import Phaser from "phaser"
import { assertDefined } from "./assert.ts"
import type { CompiledSVG } from "./compiler.ts"
import { parsePath } from "./path-parser.ts"
import { type RenderOptions, renderPath } from "./renderer.ts"
import { convertShape } from "./shape.ts"
import { transformCommands, viewBoxTransform } from "./transform.ts"
import type { SVGStyle, ViewBox } from "./types.ts"

export interface SVGPluginOptions extends RenderOptions {
  /** Override fill color for all elements. */
  overrideFill?: number | undefined
  /** Override stroke color for all elements. */
  overrideStroke?: number | undefined
  /** Target width — scales the SVG viewBox to fit. */
  width?: number | undefined
  /** Target height — scales the SVG viewBox to fit. */
  height?: number | undefined
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

  const svgEl = doc.documentElement
  const viewBox = parseViewBox(svgEl.getAttribute("viewBox"))
  const transform = computeTransform(viewBox, options)

  const shapes = doc.querySelectorAll(
    "path,rect,circle,ellipse,line,polyline,polygon",
  )

  for (const shapeEl of shapes) {
    const attrs: Record<string, string> = {}
    for (const attr of shapeEl.attributes) {
      attrs[attr.name] = attr.value
    }

    const converted = convertShape(shapeEl.tagName, attrs)
    if (!converted) continue

    const { d, style } = converted

    if (options?.overrideFill !== undefined) {
      style.fill = options.overrideFill
    }
    if (options?.overrideStroke !== undefined) {
      style.stroke = options.overrideStroke
    }

    let commands = parsePath(d)

    if (transform) {
      commands = transformCommands(
        commands,
        transform.scale,
        transform.tx,
        transform.ty,
      )
      style.strokeWidth *= transform.scale
    }

    renderPath(graphics, commands, style, options)
  }
}

/**
 * Render a pre-compiled SVG onto a Graphics object.
 *
 * Use with `compileSVG()` or the `phaser-svg/vite` build plugin to
 * skip runtime parsing entirely.
 */
export function drawCompiledSVG(
  graphics: Phaser.GameObjects.Graphics,
  compiled: CompiledSVG,
  options?: SVGPluginOptions | undefined,
): void {
  const transform = computeTransform(compiled.viewBox, options)

  for (const { commands: rawCmds, style: rawStyle } of compiled.paths) {
    const resolved = { ...rawStyle }

    if (options?.overrideFill !== undefined) {
      resolved.fill = options.overrideFill
    }
    if (options?.overrideStroke !== undefined) {
      resolved.stroke = options.overrideStroke
    }

    let commands = rawCmds
    if (transform) {
      commands = transformCommands(
        commands,
        transform.scale,
        transform.tx,
        transform.ty,
      )
      resolved.strokeWidth *= transform.scale
    }

    renderPath(graphics, commands, resolved, options)
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
    miterLimit: partial?.miterLimit ?? 4,
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

  /** Draw a pre-compiled SVG onto a Graphics object. */
  drawCompiled(
    graphics: Phaser.GameObjects.Graphics,
    compiled: CompiledSVG,
    options?: SVGPluginOptions | undefined,
  ): void {
    drawCompiledSVG(graphics, compiled, {
      ...this.defaultOptions,
      ...options,
    })
  }

  destroy(): void {
    super.destroy()
  }
}

function parseViewBox(raw: string | null | undefined): ViewBox | undefined {
  if (!raw) return undefined
  const parts = raw.trim().split(/[\s,]+/)
  if (parts.length !== 4) return undefined

  const minX = Number(parts[0])
  const minY = Number(parts[1])
  const width = Number(parts[2])
  const height = Number(parts[3])

  if (
    !Number.isFinite(minX) ||
    !Number.isFinite(minY) ||
    !Number.isFinite(width) ||
    !Number.isFinite(height) ||
    width <= 0 ||
    height <= 0
  ) {
    return undefined
  }

  return { minX, minY, width, height }
}

function computeTransform(
  viewBox: ViewBox | null | undefined,
  options: SVGPluginOptions | undefined,
): { scale: number; tx: number; ty: number } | undefined {
  if (!viewBox) return undefined
  if (options?.width === undefined && options?.height === undefined) {
    return undefined
  }

  const targetW = options.width ?? options.height ?? viewBox.width
  const targetH = options.height ?? options.width ?? viewBox.height

  return viewBoxTransform(viewBox, targetW, targetH)
}
