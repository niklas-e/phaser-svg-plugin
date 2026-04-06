import Phaser from "phaser"
import { assertDefined } from "./assert.ts"
import {
  parseTransform,
  strokeScaleFromAffine,
  transformPathCommandsAffine,
} from "./affine-transform.ts"
import type { CompiledItem, CompiledPath, CompiledSVG } from "./compiler.ts"
import {
  drawNativeShape,
  parseNativeShape,
  transformNativeShape,
} from "./native-shape.ts"
import { parsePath } from "./path-parser.ts"
import {
  attrsFromElement,
  filterPresentationAttrs,
} from "./presentation-attrs.ts"
import {
  clearDirtyState,
  commitDirtyState,
  isDirtyForState,
  markDirtyState,
} from "./dirty-state.ts"
import { applyCrispPathDetailThreshold } from "./quality.ts"
import { type RenderOptions, renderPath } from "./renderer.ts"
import { convertShape } from "./shape.ts"
import { isInsideNonRenderableContainer } from "./svg-structure.ts"
import { resolveStyle } from "./style.ts"
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

const transformedItemCache = new WeakMap<
  CompiledSVG,
  Map<string, ReadonlyArray<CompiledItem>>
>()
const transformedPathCache = new WeakMap<
  CompiledSVG,
  Map<string, ReadonlyArray<CompiledPath>>
>()
const compiledIdentityByRef = new WeakMap<CompiledSVG, number>()
let nextCompiledIdentity = 1

/**
 * Render an SVG `<path>` element's `d` attribute onto a Phaser Graphics object.
 */
export function drawSVGPath(
  graphics: Phaser.GameObjects.Graphics,
  d: string,
  style?: Partial<SVGStyle> | undefined,
  options?: RenderOptions | undefined,
): void {
  drawSVGPathInternal(graphics, d, style, options)
}

/**
 * Boolean-return alias of `drawSVGPath`.
 *
 * Returns true when a draw occurred, false when skipped.
 */
export function drawSVGPathIfDirty(
  graphics: Phaser.GameObjects.Graphics,
  d: string,
  style?: Partial<SVGStyle> | undefined,
  options?: RenderOptions | undefined,
): boolean {
  return drawSVGPathInternal(graphics, d, style, options)
}

function drawSVGPathInternal(
  graphics: Phaser.GameObjects.Graphics,
  d: string,
  style?: Partial<SVGStyle> | undefined,
  options?: RenderOptions | undefined,
): boolean {
  const stateKey = `path|${d}|${styleStateKey(style)}|${renderOptionsStateKey(options)}`
  if (!isDirtyForState(graphics, stateKey)) {
    return false
  }

  applyGraphicsCrispDefaults(graphics)
  const commands = parsePath(d)
  const resolved = resolveStyleWithOverrides(style)
  renderPath(graphics, commands, resolved, options)
  commitDirtyState(graphics, stateKey)
  return true
}

/**
 * Parse an SVG string and render all supported shape elements onto Graphics.
 */
export function drawSVG(
  graphics: Phaser.GameObjects.Graphics,
  svgString: string,
  options?: SVGPluginOptions | undefined,
): void {
  drawSVGInternal(graphics, svgString, options)
}

/**
 * Boolean-return alias of `drawSVG`.
 *
 * Returns true when a draw occurred, false when skipped.
 */
export function drawSVGIfDirty(
  graphics: Phaser.GameObjects.Graphics,
  svgString: string,
  options?: SVGPluginOptions | undefined,
): boolean {
  return drawSVGInternal(graphics, svgString, options)
}

function drawSVGInternal(
  graphics: Phaser.GameObjects.Graphics,
  svgString: string,
  options?: SVGPluginOptions | undefined,
): boolean {
  const stateKey = `svg|${svgString}|${pluginOptionsStateKey(options)}`
  if (!isDirtyForState(graphics, stateKey)) {
    return false
  }

  applyGraphicsCrispDefaults(graphics)

  const parser = new DOMParser()
  const doc = parser.parseFromString(svgString, "image/svg+xml")

  const svgEl = doc.documentElement
  const inheritedStyleAttrs = filterPresentationAttrs(attrsFromElement(svgEl))
  const viewBox = parseViewBox(svgEl.getAttribute("viewBox"))
  const transform = computeTransform(viewBox, options)

  const shapes = doc.querySelectorAll(
    "path,rect,circle,ellipse,line,polyline,polygon",
  )

  for (const shapeEl of shapes) {
    if (isInsideNonRenderableContainer(shapeEl)) {
      continue
    }

    const attrs = attrsFromElement(shapeEl)
    const elementTransform = parseTransform(attrs.transform)

    const styleAttrs = { ...inheritedStyleAttrs, ...attrs }

    const nativeShape = parseNativeShape(shapeEl.tagName, attrs)
    if (nativeShape && !elementTransform) {
      const style = resolveStyle(styleAttrs)

      if (options?.overrideFill !== undefined) {
        style.fill = options.overrideFill
      }
      if (options?.overrideStroke !== undefined) {
        style.stroke = options.overrideStroke
      }

      const transformedShape =
        transform === undefined
          ? nativeShape
          : transformNativeShape(
              nativeShape,
              transform.scale,
              transform.tx,
              transform.ty,
            )

      if (transform) {
        style.strokeWidth *= transform.scale
      }

      drawNativeShape(graphics, transformedShape, style)
      continue
    }

    const converted = convertShape(shapeEl.tagName, styleAttrs)
    if (!converted) continue

    const { d, style } = converted

    if (options?.overrideFill !== undefined) {
      style.fill = options.overrideFill
    }
    if (options?.overrideStroke !== undefined) {
      style.stroke = options.overrideStroke
    }

    let commands = parsePath(d)
    if (elementTransform) {
      commands = transformPathCommandsAffine(commands, elementTransform)
      style.strokeWidth *= strokeScaleFromAffine(elementTransform)
    }

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

  commitDirtyState(graphics, stateKey)
  return true
}

/**
 * Render a pre-compiled SVG onto a Graphics object.
 */
export function drawCompiledSVG(
  graphics: Phaser.GameObjects.Graphics,
  compiled: CompiledSVG,
  options?: SVGPluginOptions | undefined,
): void {
  drawCompiledSVGInternal(graphics, compiled, options)
}

/**
 * Boolean-return alias of `drawCompiledSVG`.
 *
 * Returns true when a draw occurred, false when skipped.
 */
export function drawCompiledSVGIfDirty(
  graphics: Phaser.GameObjects.Graphics,
  compiled: CompiledSVG,
  options?: SVGPluginOptions | undefined,
): boolean {
  return drawCompiledSVGInternal(graphics, compiled, options)
}

function drawCompiledSVGInternal(
  graphics: Phaser.GameObjects.Graphics,
  compiled: CompiledSVG,
  options?: SVGPluginOptions | undefined,
): boolean {
  const stateKey = `compiled|${compiledIdentity(compiled)}|${pluginOptionsStateKey(options)}`
  if (!isDirtyForState(graphics, stateKey)) {
    return false
  }

  applyGraphicsCrispDefaults(graphics)

  const transform = computeTransform(compiled.viewBox, options)
  const overrideFill = options?.overrideFill
  const overrideStroke = options?.overrideStroke
  const hasOverrides =
    overrideFill !== undefined || overrideStroke !== undefined

  const items = compiled.items
  if (Array.isArray(items) && items.length > 0) {
    const sourceItems = transform
      ? getTransformedItems(compiled, transform)
      : items

    for (const item of sourceItems) {
      const style = hasOverrides
        ? applyStyleOverrides(item.style, overrideFill, overrideStroke)
        : item.style

      if (item.kind === "native") {
        drawNativeShape(graphics, item.shape, style)
      } else {
        renderPath(graphics, item.commands, style, options)
      }
    }

    commitDirtyState(graphics, stateKey)
    return true
  }

  const sourcePaths = transform
    ? getTransformedPaths(compiled, transform)
    : compiled.paths

  for (const path of sourcePaths) {
    const style = hasOverrides
      ? applyStyleOverrides(path.style, overrideFill, overrideStroke)
      : path.style

    renderPath(graphics, path.commands, style, options)
  }

  commitDirtyState(graphics, stateKey)
  return true
}

/**
 * Force the next dirty-aware draw call for this Graphics object to render.
 */
export function markSVGDirty(graphics: Phaser.GameObjects.Graphics): void {
  markDirtyState(graphics)
}

/**
 * Clear remembered dirty state for this Graphics object.
 */
export function clearSVGDirtyState(graphics: Phaser.GameObjects.Graphics): void {
  clearDirtyState(graphics)
}

function applyStyleOverrides(
  style: SVGStyle,
  overrideFill: number | undefined,
  overrideStroke: number | undefined,
): SVGStyle {
  if (overrideFill === undefined && overrideStroke === undefined) {
    return style
  }

  const resolved = { ...style }

  if (overrideFill !== undefined) {
    resolved.fill = overrideFill
  }

  if (overrideStroke !== undefined) {
    resolved.stroke = overrideStroke
  }

  return resolved
}

function getTransformedItems(
  compiled: CompiledSVG,
  transform: { scale: number; tx: number; ty: number },
): ReadonlyArray<CompiledItem> {
  let byTransform = transformedItemCache.get(compiled)
  if (!byTransform) {
    byTransform = new Map<string, ReadonlyArray<CompiledItem>>()
    transformedItemCache.set(compiled, byTransform)
  }

  const key = transformKey(transform)
  const cached = byTransform.get(key)
  if (cached) {
    return cached
  }

  const scaledItems = compiled.items.map((item) => {
    if (item.kind === "native") {
      return {
        kind: "native" as const,
        shape: transformNativeShape(
          item.shape,
          transform.scale,
          transform.tx,
          transform.ty,
        ),
        style: scaleStyleStroke(item.style, transform.scale),
      }
    }

    return {
      kind: "path" as const,
      commands: transformCommands(
        item.commands,
        transform.scale,
        transform.tx,
        transform.ty,
      ),
      style: scaleStyleStroke(item.style, transform.scale),
    }
  })

  byTransform.set(key, scaledItems)
  return scaledItems
}

function getTransformedPaths(
  compiled: CompiledSVG,
  transform: { scale: number; tx: number; ty: number },
): ReadonlyArray<CompiledPath> {
  let byTransform = transformedPathCache.get(compiled)
  if (!byTransform) {
    byTransform = new Map<string, ReadonlyArray<CompiledPath>>()
    transformedPathCache.set(compiled, byTransform)
  }

  const key = transformKey(transform)
  const cached = byTransform.get(key)
  if (cached) {
    return cached
  }

  const scaledPaths = compiled.paths.map((path) => ({
    commands: transformCommands(
      path.commands,
      transform.scale,
      transform.tx,
      transform.ty,
    ),
    style: scaleStyleStroke(path.style, transform.scale),
  }))

  byTransform.set(key, scaledPaths)
  return scaledPaths
}

function scaleStyleStroke(style: SVGStyle, scale: number): SVGStyle {
  if (scale === 1) {
    return style
  }

  return {
    ...style,
    strokeWidth: style.strokeWidth * scale,
  }
}

function transformKey(transform: {
  scale: number
  tx: number
  ty: number
}): string {
  return `${transform.scale}|${transform.tx}|${transform.ty}`
}

interface PhaserRendererLike {
  config?: { pathDetailThreshold?: number | undefined } | undefined
}

function applyGraphicsCrispDefaults(
  graphics: Phaser.GameObjects.Graphics,
): void {
  const renderer = graphics.scene?.sys?.game?.renderer as
    | PhaserRendererLike
    | undefined
  applyCrispPathDetailThreshold(renderer?.config)
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

function compiledIdentity(compiled: CompiledSVG): number {
  const existing = compiledIdentityByRef.get(compiled)
  if (existing !== undefined) {
    return existing
  }

  const created = nextCompiledIdentity
  nextCompiledIdentity += 1
  compiledIdentityByRef.set(compiled, created)
  return created
}

function pluginOptionsStateKey(
  options: SVGPluginOptions | undefined,
): string {
  return [
    options?.curveResolution,
    options?.overrideFill,
    options?.overrideStroke,
    options?.width,
    options?.height,
  ].join("|")
}

function renderOptionsStateKey(
  options: RenderOptions | undefined,
): string {
  return String(options?.curveResolution)
}

function styleStateKey(style: Partial<SVGStyle> | undefined): string {
  if (!style) {
    return ""
  }

  return [
    style.fill,
    style.fillAlpha,
    style.stroke,
    style.strokeAlpha,
    style.strokeWidth,
    style.lineJoin,
    style.lineCap,
    style.miterLimit,
    style.opacity,
  ].join("|")
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
    graphics: Phaser.GameObjects.Graphics,
    d: string,
    style?: Partial<SVGStyle> | undefined,
    options?: RenderOptions | undefined,
  ): void {
    drawSVGPath(graphics, d, style, { ...this.defaultOptions, ...options })
  }

  /** Draw an SVG path only when it changed since the last draw. */
  drawPathIfDirty(
    graphics: Phaser.GameObjects.Graphics,
    d: string,
    style?: Partial<SVGStyle> | undefined,
    options?: RenderOptions | undefined,
  ): boolean {
    return drawSVGPathIfDirty(graphics, d, style, {
      ...this.defaultOptions,
      ...options,
    })
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

  /** Draw a compiled SVG only when it changed since the last draw. */
  drawCompiledIfDirty(
    graphics: Phaser.GameObjects.Graphics,
    compiled: CompiledSVG,
    options?: SVGPluginOptions | undefined,
  ): boolean {
    return drawCompiledSVGIfDirty(graphics, compiled, {
      ...this.defaultOptions,
      ...options,
    })
  }

  /** Force the next dirty-aware draw call to render for this Graphics object. */
  markDirty(graphics: Phaser.GameObjects.Graphics): this {
    markSVGDirty(graphics)
    return this
  }

  /** Clear remembered dirty state for this Graphics object. */
  clearDirtyState(graphics: Phaser.GameObjects.Graphics): this {
    clearSVGDirtyState(graphics)
    return this
  }

  destroy(): void {
    super.destroy()
  }
}
