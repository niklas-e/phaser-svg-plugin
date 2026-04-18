import type { GameObjects } from "phaser"
import type { CompiledSVG } from "./compiler.ts"
import { compileSVG } from "./compiler.ts"
import { drawNativeShape, transformNativeShape } from "./native-shape.ts"
import { parsePath } from "./path-parser.ts"
import { applyCrispPathDetailThreshold } from "./quality.ts"
import { attachMsaaRenderStep } from "./render-node/svg-render-node.ts"
import type { MsaaSamples } from "./render-node/types.ts"
import { type RenderOptions, renderPath } from "./renderer.ts"
import { transformCommands, viewBoxTransform } from "./transform.ts"
import type { SVGStyle, ViewBox } from "./types.ts"

const SCENE_BATCH_COMPILED_CACHE_MAX_ENTRIES = 128
const SCENE_BATCH_PATH_CACHE_MAX_ENTRIES = 256
type ParsedPathCommands = ReturnType<typeof parsePath>

const COMPILED_IDENTITY = new WeakMap<CompiledSVG, number>()
const PATH_COMMANDS_IDENTITY = new WeakMap<ParsedPathCommands, number>()
let nextIdentity = 1

export interface SceneBatchDrawOptions extends RenderOptions {
  overrideFill?: number | undefined
  overrideStroke?: number | undefined
  width?: number | undefined
  height?: number | undefined
  msaaSamples?: MsaaSamples | undefined
  x?: number | undefined
  y?: number | undefined
}

export interface SceneBatchPathOptions extends RenderOptions {
  msaaSamples?: MsaaSamples | undefined
  x?: number | undefined
  y?: number | undefined
}

export interface SVGSceneBatchOptions {
  graphics?: GameObjects.Graphics | undefined
  autoFlush?: boolean | undefined
  /**
   * Reuse the previously drawn frame when the queued scene-batch state
   * is unchanged between flushes.
   */
  retained?: boolean | undefined
}

interface QueuedCompiledEntry {
  kind: "compiled"
  compiled: CompiledSVG
  options?: SceneBatchDrawOptions | undefined
}

interface QueuedPathEntry {
  kind: "path"
  commands: ParsedPathCommands
  style: SVGStyle
  options?: SceneBatchPathOptions | undefined
}

type QueueEntry = QueuedCompiledEntry | QueuedPathEntry

interface SceneLike {
  sys: {
    game: {
      renderer: {
        gl?: WebGLRenderingContext | null
        width: number
        height: number
        pathDetailThreshold?: number | undefined
        config?: { pathDetailThreshold?: number | undefined } | undefined
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
    }
    events: {
      on(event: string, fn: () => void): void
      off(event: string, fn: () => void): void
      once(event: string, fn: () => void): void
    }
  }
  add: {
    graphics(): GameObjects.Graphics
  }
}

export class SVGSceneBatch {
  private readonly scene: SceneLike
  private readonly graphics: GameObjects.Graphics
  private readonly autoFlush: boolean
  private readonly retained: boolean
  private readonly queue: QueueEntry[] = []
  private readonly compiledSvgCache = new Map<string, CompiledSVG>()
  private readonly parsedPathCache = new Map<string, ParsedPathCommands>()
  private retainedStateKey: string | null = null

  constructor(scene: Phaser.Scene, options?: SVGSceneBatchOptions | undefined) {
    this.scene = scene as unknown as SceneLike
    this.graphics = options?.graphics ?? this.scene.add.graphics()
    this.autoFlush = options?.autoFlush ?? true
    this.retained = options?.retained ?? false

    if (this.autoFlush) {
      this.scene.sys.events.on("postupdate", this.flush)
    }

    this.scene.sys.events.once("destroy", this.destroy)
  }

  get targetGraphics(): GameObjects.Graphics {
    return this.graphics
  }

  queueCompiled(
    compiled: CompiledSVG,
    options?: SceneBatchDrawOptions | undefined,
  ): this {
    this.queue.push({ kind: "compiled", compiled, options })
    return this
  }

  queueSVG(
    svgString: string,
    options?: SceneBatchDrawOptions | undefined,
  ): this {
    return this.queueCompiled(this.getCachedCompiledSVG(svgString), options)
  }

  queuePath(
    d: string,
    style?: Partial<SVGStyle> | undefined,
    options?: SceneBatchPathOptions | undefined,
  ): this {
    this.queue.push({
      kind: "path",
      commands: this.getCachedPathCommands(d),
      style: resolveStyleWithOverrides(style),
      options,
    })
    return this
  }

  flush = (): boolean => {
    if (this.queue.length === 0) {
      return false
    }

    const nextStateKey = this.retained
      ? this.computeQueueStateKey(this.queue)
      : null
    if (this.retained && nextStateKey === this.retainedStateKey) {
      this.queue.length = 0
      return false
    }

    this.graphics.clear()

    const renderer = this.scene.sys.game.renderer
    const changedConfig = applyCrispPathDetailThreshold(renderer.config)
    if (!changedConfig) {
      applyCrispPathDetailThreshold(renderer)
    }

    let requestedSamples: MsaaSamples = 2

    for (const entry of this.queue) {
      if (entry.kind === "path") {
        const tx = entry.options?.x ?? 0
        const ty = entry.options?.y ?? 0
        const commands =
          tx === 0 && ty === 0
            ? entry.commands
            : transformCommands(entry.commands, 1, tx, ty)

        renderPath(this.graphics, commands, entry.style, entry.options)
        const samples = entry.options?.msaaSamples ?? 2
        requestedSamples = Math.max(requestedSamples, samples) as MsaaSamples
        continue
      }

      const options = entry.options
      const transform = computeTransform(entry.compiled.viewBox, options)
      const tx = (options?.x ?? 0) + (transform?.tx ?? 0)
      const ty = (options?.y ?? 0) + (transform?.ty ?? 0)
      const scale = transform?.scale ?? 1

      const hasOverrides =
        options?.overrideFill !== undefined ||
        options?.overrideStroke !== undefined

      for (const item of entry.compiled.items) {
        const baseStyle =
          scale === 1
            ? item.style
            : { ...item.style, strokeWidth: item.style.strokeWidth * scale }

        const style = hasOverrides
          ? applyStyleOverrides(
              baseStyle,
              options?.overrideFill,
              options?.overrideStroke,
            )
          : baseStyle

        if (item.kind === "native") {
          const shape =
            scale === 1 && tx === 0 && ty === 0
              ? item.shape
              : transformNativeShape(item.shape, scale, tx, ty)
          drawNativeShape(this.graphics, shape, style, {
            curveTolerance: options?.curveTolerance,
          })
        } else {
          const commands =
            scale === 1 && tx === 0 && ty === 0
              ? item.commands
              : transformCommands(item.commands, scale, tx, ty)
          renderPath(this.graphics, commands, style, options)
        }
      }

      const samples = resolveCompiledMsaaSamples(entry.compiled, options)
      requestedSamples = Math.max(requestedSamples, samples) as MsaaSamples
    }

    this.queue.length = 0

    const glRenderer = renderer
    if (!glRenderer?.gl) {
      throw new Error(
        "phaser-svg scene batch: a WebGL renderer is required. " +
          "Create the game with WebGL + WebGL2 context.",
      )
    }

    attachMsaaRenderStep(
      this.graphics,
      glRenderer as unknown as Parameters<typeof attachMsaaRenderStep>[1],
      requestedSamples,
    )

    if (this.retained) {
      this.retainedStateKey = nextStateKey
    }

    return true
  }

  /** Force the next retained-mode flush to redraw queued content. */
  markDirty(): this {
    this.retainedStateKey = null
    return this
  }

  destroy = (): void => {
    if (this.autoFlush) {
      this.scene.sys.events.off("postupdate", this.flush)
    }
    this.queue.length = 0
    this.retainedStateKey = null
    this.compiledSvgCache.clear()
    this.parsedPathCache.clear()
  }

  private getCachedCompiledSVG(svgString: string): CompiledSVG {
    const cached = this.compiledSvgCache.get(svgString)
    if (cached) {
      this.compiledSvgCache.delete(svgString)
      this.compiledSvgCache.set(svgString, cached)
      return cached
    }

    const compiled = compileSVG(svgString)
    if (this.compiledSvgCache.size >= SCENE_BATCH_COMPILED_CACHE_MAX_ENTRIES) {
      const oldestKey = this.compiledSvgCache.keys().next().value
      if (oldestKey !== undefined) {
        this.compiledSvgCache.delete(oldestKey)
      }
    }

    this.compiledSvgCache.set(svgString, compiled)
    return compiled
  }

  private getCachedPathCommands(d: string): ParsedPathCommands {
    const cached = this.parsedPathCache.get(d)
    if (cached) {
      this.parsedPathCache.delete(d)
      this.parsedPathCache.set(d, cached)
      return cached
    }

    const commands = parsePath(d)
    if (this.parsedPathCache.size >= SCENE_BATCH_PATH_CACHE_MAX_ENTRIES) {
      const oldestKey = this.parsedPathCache.keys().next().value
      if (oldestKey !== undefined) {
        this.parsedPathCache.delete(oldestKey)
      }
    }

    this.parsedPathCache.set(d, commands)
    return commands
  }

  private computeQueueStateKey(entries: ReadonlyArray<QueueEntry>): string {
    const parts: string[] = []

    for (const entry of entries) {
      if (entry.kind === "path") {
        parts.push(this.pathEntryStateKey(entry))
      } else {
        parts.push(this.compiledEntryStateKey(entry))
      }
    }

    return parts.join("||")
  }

  private pathEntryStateKey(entry: QueuedPathEntry): string {
    return [
      "path",
      getIdentity(entry.commands, PATH_COMMANDS_IDENTITY),
      styleStateKey(entry.style),
      pathOptionsStateKey(entry.options),
    ].join("|")
  }

  private compiledEntryStateKey(entry: QueuedCompiledEntry): string {
    return [
      "compiled",
      getIdentity(entry.compiled, COMPILED_IDENTITY),
      compiledOptionsStateKey(entry.compiled, entry.options),
    ].join("|")
  }
}

function resolveCompiledMsaaSamples(
  compiled: CompiledSVG,
  options: { msaaSamples?: MsaaSamples | undefined } | undefined,
): MsaaSamples {
  if (options?.msaaSamples !== undefined) {
    return options.msaaSamples
  }

  return compiled.msaaSamples ?? 2
}

function compiledOptionsStateKey(
  compiled: CompiledSVG,
  options: SceneBatchDrawOptions | undefined,
): string {
  return [
    options?.x ?? 0,
    options?.y ?? 0,
    options?.width ?? "_",
    options?.height ?? "_",
    options?.curveResolution ?? "_",
    options?.curveTolerance ?? "_",
    resolveCompiledMsaaSamples(compiled, options),
    options?.overrideFill ?? "_",
    options?.overrideStroke ?? "_",
  ].join("|")
}

function pathOptionsStateKey(
  options: SceneBatchPathOptions | undefined,
): string {
  return [
    options?.x ?? 0,
    options?.y ?? 0,
    options?.curveResolution ?? "_",
    options?.curveTolerance ?? "_",
    options?.msaaSamples ?? 2,
  ].join("|")
}

function styleStateKey(style: SVGStyle): string {
  return [
    style.fill ?? "_",
    style.fillAlpha,
    style.stroke ?? "_",
    style.strokeAlpha,
    style.strokeWidth,
    style.lineJoin,
    style.lineCap,
    style.miterLimit,
    style.opacity,
  ].join("|")
}

function getIdentity<T extends object>(
  target: T,
  map: WeakMap<T, number>,
): number {
  const existing = map.get(target)
  if (existing !== undefined) {
    return existing
  }

  const assigned = nextIdentity
  nextIdentity += 1
  map.set(target, assigned)
  return assigned
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

function computeTransform(
  viewBox: ViewBox | null,
  options:
    | { width?: number | undefined; height?: number | undefined }
    | undefined,
): { scale: number; tx: number; ty: number } | undefined {
  if (
    !viewBox ||
    options?.width === undefined ||
    options?.height === undefined
  ) {
    return undefined
  }

  return viewBoxTransform(viewBox, options.width, options.height)
}
