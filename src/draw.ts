import type { GameObjects } from "phaser"
import {
  parseTransform,
  strokeScaleFromAffine,
  transformPathCommandsAffine,
} from "./affine-transform.ts"
import type { CompiledItem, CompiledSVG } from "./compiler.ts"
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
  hasCommittedDirtyState,
  isDirtyForState,
  markDirtyState,
} from "./dirty-state.ts"
import { applyCrispPathDetailThreshold } from "./quality.ts"
import { type RenderOptions, renderPath } from "./renderer.ts"
import { attachMsaaRenderStep } from "./render-node/svg-render-node.ts"
import type { MsaaOptions, MsaaSamples } from "./render-node/types.ts"
import { convertShape } from "./shape.ts"
import { isInsideNonRenderableContainer } from "./svg-structure.ts"
import { resolveStyle } from "./style.ts"
import { transformCommands, viewBoxTransform } from "./transform.ts"
import type { SVGStyle, ViewBox } from "./types.ts"

export interface SVGPathOptions extends RenderOptions, MsaaOptions {}

export interface SVGPluginOptions extends RenderOptions {
  /** Override fill color for all elements. */
  overrideFill?: number | undefined
  /** Override stroke color for all elements. */
  overrideStroke?: number | undefined
  /** Target width — scales the SVG viewBox to fit. */
  width?: number | undefined
  /** Target height — scales the SVG viewBox to fit. */
  height?: number | undefined
  /**
   * MSAA sample count for anti-aliasing SVG edges.
   * - `4` (default): 4x MSAA.
   * - `8`: 8x MSAA — automatically downgrades to x4 when unsupported.
   */
  msaaSamples?: MsaaSamples | undefined
}

const transformedItemCache = new WeakMap<
  CompiledSVG,
  Map<string, ReadonlyArray<CompiledItem>>
>()
const styleOverrideCache = new WeakMap<SVGStyle, Map<string, SVGStyle>>()
const compiledIdentityByRef = new WeakMap<CompiledSVG, number>()
let nextCompiledIdentity = 1

/**
 * Render an SVG `<path>` element's `d` attribute onto a Phaser Graphics object.
 */
export function drawSVGPath(
  graphics: GameObjects.Graphics,
  d: string,
  style?: Partial<SVGStyle> | undefined,
  options?: SVGPathOptions | undefined,
): void {
  drawSVGPathInternal(graphics, d, style, options)
}

/**
 * Boolean-return alias of `drawSVGPath`.
 *
 * Returns true when a draw occurred, false when skipped.
 */
export function drawSVGPathIfDirty(
  graphics: GameObjects.Graphics,
  d: string,
  style?: Partial<SVGStyle> | undefined,
  options?: SVGPathOptions | undefined,
): boolean {
  return drawSVGPathInternal(graphics, d, style, options)
}

function drawSVGPathInternal(
  graphics: GameObjects.Graphics,
  d: string,
  style?: Partial<SVGStyle> | undefined,
  options?: SVGPathOptions | undefined,
): boolean {
  const stateKey = `path|${d}|${styleStateKey(style)}|${pathOptionsStateKey(options)}`
  if (!isDirtyForState(graphics, stateKey)) {
    return false
  }

  if (hasCommittedDirtyState(graphics)) {
    graphics.clear()
  }

  applyGraphicsCrispDefaults(graphics)
  const commands = parsePath(d)
  const resolved = resolveStyleWithOverrides(style)
  renderPath(graphics, commands, resolved, options)
  applyMsaaIfNeeded(graphics, options?.msaaSamples)
  commitDirtyState(graphics, stateKey)
  return true
}

/**
 * Parse an SVG string and render all supported shape elements onto Graphics.
 */
export function drawSVG(
  graphics: GameObjects.Graphics,
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
  graphics: GameObjects.Graphics,
  svgString: string,
  options?: SVGPluginOptions | undefined,
): boolean {
  return drawSVGInternal(graphics, svgString, options)
}

function drawSVGInternal(
  graphics: GameObjects.Graphics,
  svgString: string,
  options?: SVGPluginOptions | undefined,
): boolean {
  const stateKey = `svg|${svgString}|${pluginOptionsStateKey(options)}`
  if (!isDirtyForState(graphics, stateKey)) {
    return false
  }

  if (hasCommittedDirtyState(graphics)) {
    graphics.clear()
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

  applyMsaaIfNeeded(graphics, options?.msaaSamples)
  commitDirtyState(graphics, stateKey)
  return true
}

/**
 * Render a pre-compiled SVG onto a Graphics object.
 */
export function drawCompiledSVG(
  graphics: GameObjects.Graphics,
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
  graphics: GameObjects.Graphics,
  compiled: CompiledSVG,
  options?: SVGPluginOptions | undefined,
): boolean {
  return drawCompiledSVGInternal(graphics, compiled, options)
}

function drawCompiledSVGInternal(
  graphics: GameObjects.Graphics,
  compiled: CompiledSVG,
  options?: SVGPluginOptions | undefined,
): boolean {
  const compiledMsaaSamples = resolveCompiledMsaaSamples(compiled, options)
  const stateKey = `compiled|${compiledIdentity(compiled)}|${compiledOptionsStateKey(options, compiledMsaaSamples)}`
  if (!isDirtyForState(graphics, stateKey)) {
    return false
  }

  if (hasCommittedDirtyState(graphics)) {
    graphics.clear()
  }

  applyGraphicsCrispDefaults(graphics)

  const transform = computeTransform(compiled.viewBox, options)
  const overrideFill = options?.overrideFill
  const overrideStroke = options?.overrideStroke
  const hasOverrides =
    overrideFill !== undefined || overrideStroke !== undefined

  const items = compiled.items
  const sourceItems = transform ? getTransformedItems(compiled, transform) : items

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

  applyMsaaIfNeeded(graphics, compiledMsaaSamples)
  commitDirtyState(graphics, stateKey)
  return true
}

/**
 * Force the next dirty-aware draw call for this Graphics object to render.
 */
export function markSVGDirty(graphics: GameObjects.Graphics): void {
  markDirtyState(graphics)
}

/**
 * Clear remembered dirty state for this Graphics object.
 */
export function clearSVGDirtyState(graphics: GameObjects.Graphics): void {
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

  let byOverride = styleOverrideCache.get(style)
  if (!byOverride) {
    byOverride = new Map<string, SVGStyle>()
    styleOverrideCache.set(style, byOverride)
  }

  const cacheKey = `${overrideFill ?? "_"}|${overrideStroke ?? "_"}`
  const cached = byOverride.get(cacheKey)
  if (cached) {
    return cached
  }

  const resolved = { ...style }

  if (overrideFill !== undefined) {
    resolved.fill = overrideFill
  }

  if (overrideStroke !== undefined) {
    resolved.stroke = overrideStroke
  }

  byOverride.set(cacheKey, resolved)

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

interface PhaserRendererForMsaa {
  gl?: WebGLRenderingContext | null
  width: number
  height: number
  renderNodes: {
    finishBatch(): void
    getNode(name: string): unknown
  }
  createTextureFromSource(
    source: null,
    width: number,
    height: number,
    scaleMode: number,
  ): { webGLTexture: WebGLTexture | null } | null
  deleteTexture(texture: { webGLTexture: WebGLTexture | null }): void
}

function applyGraphicsCrispDefaults(graphics: GameObjects.Graphics): void {
  const renderer = graphics.scene?.sys?.game?.renderer as
    | PhaserRendererLike
    | undefined
  applyCrispPathDetailThreshold(renderer?.config)
}

/**
 * Attach the MSAA render step if msaaSamples is requested and a WebGL renderer is available.
 * Safe to call every frame — the step is only installed once and updated if sample count changes.
 */
function applyMsaaIfNeeded(
  graphics: GameObjects.Graphics,
  msaaSamples: MsaaSamples | undefined,
): void {
  const resolvedSamples: MsaaSamples = msaaSamples ?? 4
  const renderer = graphics.scene?.sys?.game?.renderer as unknown as
    | PhaserRendererForMsaa
    | null
    | undefined
  if (!renderer?.gl) {
    throw new Error(
      "phaser-svg MSAA: a WebGL renderer is required. " +
        "Create the game with WebGL + WebGL2 context, or do not use this plugin in non-WebGL environments.",
    )
  }
  attachMsaaRenderStep(
    graphics,
    renderer as unknown as Parameters<typeof attachMsaaRenderStep>[1],
    resolvedSamples,
  )
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

function pluginOptionsStateKey(options: SVGPluginOptions | undefined): string {
  return [
    options?.curveResolution,
    options?.overrideFill,
    options?.overrideStroke,
    options?.width,
    options?.height,
    options?.msaaSamples ?? 4,
  ].join("|")
}

function compiledOptionsStateKey(
  options: SVGPluginOptions | undefined,
  resolvedMsaaSamples: MsaaSamples,
): string {
  return [
    options?.curveResolution,
    options?.overrideFill,
    options?.overrideStroke,
    options?.width,
    options?.height,
    resolvedMsaaSamples,
  ].join("|")
}

function resolveCompiledMsaaSamples(
  compiled: CompiledSVG,
  options: SVGPluginOptions | undefined,
): MsaaSamples {
  return options?.msaaSamples ?? compiled.msaaSamples ?? 4
}

function pathOptionsStateKey(options: SVGPathOptions | undefined): string {
  return [options?.curveResolution, options?.msaaSamples ?? 4].join("|")
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
