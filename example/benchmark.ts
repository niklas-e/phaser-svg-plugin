import type Phaser from "phaser"
import {
  clearSVGDirtyState,
  compileSVG,
  drawCompiledSVG,
  drawCompiledSVGIfDirty,
  drawSVG,
  drawSVGIfDirty,
  markSVGDirty,
  SVGSceneBatch,
} from "../src/index.ts"

export interface BenchmarkFixture {
  title: string
  slug: string
  svg: string
  width: number
  height: number
  pluginParentId: string
  vanillaParentId: string
}

interface DistributionStats {
  meanMs: number
  medianMs: number
  p95Ms: number
  minMs: number
  maxMs: number
}

interface CrispnessMetrics {
  mae: number
  psnrDb: number
  ssim: number
  silhouetteIou: number
  edgeAcuityRatio: number
  edgeGradientMae: number
  edgeF1: number
  edgePixels: number
}

interface DirectComparisonMetrics {
  mae: number
  psnrDb: number
  ssim: number
  silhouetteIou: number
  edgeF1: number
}

interface ReferenceComparisonResult {
  plugin: CrispnessMetrics
  vanilla: CrispnessMetrics
}

interface CrispnessFixtureResult {
  fixture: string
  pixelWidth: number
  pixelHeight: number
  nativeReference: ReferenceComparisonResult
  supersampledReference: ReferenceComparisonResult
  pluginVsVanilla: DirectComparisonMetrics
}

interface MethodSummary {
  meanMaePct: number
  meanPsnrDb: number
  meanSsim: number
  meanSilhouetteIou: number
  meanEdgeAcuityRatio: number
  meanEdgeGradientMaePct: number
  meanEdgeF1: number
}

interface ReferenceSummary {
  plugin: MethodSummary
  vanilla: MethodSummary
  pluginWinsByMaePct: number
  pluginWinsBySsimPct: number
  pluginWinsByEdgeF1Pct: number
}

interface CrispnessSummary {
  nativeReference: ReferenceSummary
  supersampledReference: ReferenceSummary
  pluginVsVanilla: {
    meanMaePct: number
    meanPsnrDb: number
    meanSsim: number
    meanSilhouetteIou: number
    meanEdgeF1: number
  }
}

interface PluginPerfFixtureResult {
  fixture: string
  runtimeDraw: DistributionStats
  compiledDraw: DistributionStats
  runtimeSkip: DistributionStats
  compiledSkip: DistributionStats
  runtimeDirtyRedraw: DistributionStats
  compiledDirtyRedraw: DistributionStats
  immediateCompiled64: DistributionStats
  sceneBatchCompiled64: DistributionStats
}

interface TexturePerfFixtureResult {
  fixture: string
  svgDecodeAndRasterize: DistributionStats
  canvasBlit: DistributionStats
}

interface BenchmarkResult {
  runAt: string
  config: {
    fixtureCount: number
    dpr: number
    referenceSupersample: number
    pluginIterations: number
    textureIterations: number
    skipBatchSize: number
  }
  crispness: {
    reference: {
      native: string
      supersampled: string
    }
    summary: CrispnessSummary
    fixtures: CrispnessFixtureResult[]
  }
  performance: {
    pluginCpu: {
      fixtures: PluginPerfFixtureResult[]
      summary: {
        runtimeDrawMedianMs: number
        compiledDrawMedianMs: number
        runtimeSkipMedianMs: number
        compiledSkipMedianMs: number
        runtimeDirtyRedrawMedianMs: number
        compiledDirtyRedrawMedianMs: number
        immediateCompiled64MedianMs: number
        sceneBatchCompiled64MedianMs: number
      }
    }
    texturePrep: {
      fixtures: TexturePerfFixtureResult[]
      summary: {
        decodeMedianMs: number
        blitMedianMs: number
      }
    }
  }
  baselineRows: Array<{ scenario: string; medianMs: number }>
}

interface BenchmarkPanelState {
  runButton: HTMLButtonElement
  copyButton: HTMLButtonElement
  status: HTMLDivElement
  output: HTMLPreElement
  dprInput: HTMLInputElement
  referenceSupersampleInput: HTMLInputElement
  pluginIterationsInput: HTMLInputElement
  textureIterationsInput: HTMLInputElement
  skipBatchInput: HTMLInputElement
}

interface PluginPerfMetrics {
  runtimeDraw: number[]
  compiledDraw: number[]
  runtimeSkip: number[]
  compiledSkip: number[]
  runtimeDirtyRedraw: number[]
  compiledDirtyRedraw: number[]
  immediateCompiled64: number[]
  sceneBatchCompiled64: number[]
}

interface TexturePrepMetrics {
  decode: number[]
  blit: number[]
}

interface BenchmarkRendererForMsaa {
  gl: WebGLRenderingContext
  width: number
  height: number
  config: {
    pathDetailThreshold: number
  }
  renderNodes: {
    finishBatch(): void
    getNode(name: string): { batch(...args: unknown[]): void }
  }
  createTextureFromSource(
    source: null,
    width: number,
    height: number,
    scaleMode: number,
  ): { webGLTexture: WebGLTexture | null } | null
  deleteTexture(texture: { webGLTexture: WebGLTexture | null }): void
}

let benchmarkRendererForMsaa: BenchmarkRendererForMsaa | null = null

function getBenchmarkRendererForMsaa(): BenchmarkRendererForMsaa {
  if (benchmarkRendererForMsaa) {
    return benchmarkRendererForMsaa
  }

  const canvas = document.createElement("canvas")
  const gl2 = assertDefined(
    canvas.getContext("webgl2") as WebGL2RenderingContext | null,
    "Benchmark runner requires WebGL2 for default x4 MSAA",
  )

  benchmarkRendererForMsaa = {
    gl: gl2 as unknown as WebGLRenderingContext,
    width: 1,
    height: 1,
    config: {
      pathDetailThreshold: 1,
    },
    renderNodes: {
      finishBatch: () => {},
      getNode: () => ({
        batch: () => {},
      }),
    },
    createTextureFromSource: () => ({ webGLTexture: null }),
    deleteTexture: () => {},
  }

  return benchmarkRendererForMsaa
}

class NoopGraphics {
  _renderSteps: ((...args: unknown[]) => void)[] = []

  scene = {
    sys: {
      game: {
        renderer: getBenchmarkRendererForMsaa(),
      },
    },
  }

  addRenderStep(fn: (...args: unknown[]) => void, index = 0): this {
    this._renderSteps.splice(index, 0, fn)
    return this
  }

  once(_event: string, _fn: (...args: unknown[]) => void): this {
    return this
  }

  clear(): this {
    return this
  }

  lineStyle(_width: number, _color: number, _alpha: number): this {
    return this
  }

  fillStyle(_color: number, _alpha: number): this {
    return this
  }

  beginPath(): this {
    return this
  }

  moveTo(_x: number, _y: number): this {
    return this
  }

  lineTo(_x: number, _y: number): this {
    return this
  }

  closePath(): this {
    return this
  }

  fillPath(): this {
    return this
  }

  strokePath(): this {
    return this
  }

  fillCircle(_x: number, _y: number, _radius: number): this {
    return this
  }

  fillEllipse(
    _x: number,
    _y: number,
    _width: number,
    _height: number,
    _smoothness?: number,
  ): this {
    return this
  }

  fillTriangle(
    _x0: number,
    _y0: number,
    _x1: number,
    _y1: number,
    _x2: number,
    _y2: number,
  ): this {
    return this
  }
}

class NoopEvents {
  on(_event: string, _fn: () => void): void {}
  off(_event: string, _fn: () => void): void {}
  once(_event: string, _fn: () => void): void {}
}

function createNoopBatchScene(
  renderer: BenchmarkRendererForMsaa,
  graphics: Phaser.GameObjects.Graphics,
): Phaser.Scene {
  return {
    sys: {
      game: {
        renderer,
      },
      events: new NoopEvents(),
    },
    add: {
      graphics: () => graphics,
    },
  } as unknown as Phaser.Scene
}

function assertDefined<T>(value: T | null | undefined, message: string): T {
  if (value == null) {
    throw new Error(message)
  }
  return value
}

function createPanelState(): BenchmarkPanelState {
  const panel = document.createElement("section")
  panel.style.background = "#0f172a"
  panel.style.border = "1px solid #334155"
  panel.style.borderRadius = "10px"
  panel.style.padding = "14px"
  panel.style.marginBottom = "18px"

  const heading = document.createElement("h2")
  heading.textContent = "Benchmark Runner"
  heading.style.fontSize = "14px"
  heading.style.color = "#e2e8f0"
  heading.style.marginBottom = "8px"

  const info = document.createElement("p")
  info.textContent =
    "Measures crispness with native and supersampled SVG references, plus direct plugin-vs-vanilla image metrics and CPU performance."
  info.style.fontSize = "12px"
  info.style.color = "#94a3b8"
  info.style.marginBottom = "10px"

  const controls = document.createElement("div")
  controls.style.display = "flex"
  controls.style.flexWrap = "wrap"
  controls.style.gap = "10px"
  controls.style.alignItems = "center"
  controls.style.marginBottom = "10px"

  const dprInput = createNumberInput(
    "Texture DPR",
    String(window.devicePixelRatio || 1),
    1,
  )
  const referenceSupersampleInput = createNumberInput(
    "Ref supersample x",
    "4",
    1,
  )
  const pluginIterationsInput = createNumberInput("Plugin iterations", "30", 1)
  const textureIterationsInput = createNumberInput("Texture iterations", "8", 1)
  const skipBatchInput = createNumberInput("Skip batch", "200", 1)

  const runButton = document.createElement("button")
  runButton.textContent = "Run Benchmarks"
  styleButton(runButton)

  const copyButton = document.createElement("button")
  copyButton.textContent = "Copy JSON"
  styleButton(copyButton)
  copyButton.disabled = true

  controls.appendChild(dprInput.wrapper)
  controls.appendChild(referenceSupersampleInput.wrapper)
  controls.appendChild(pluginIterationsInput.wrapper)
  controls.appendChild(textureIterationsInput.wrapper)
  controls.appendChild(skipBatchInput.wrapper)
  controls.appendChild(runButton)
  controls.appendChild(copyButton)

  const glossary = createMetricGlossary()

  const status = document.createElement("div")
  status.style.fontSize = "12px"
  status.style.color = "#cbd5e1"
  status.style.marginBottom = "8px"
  status.textContent = "Idle"

  const output = document.createElement("pre")
  output.style.whiteSpace = "pre-wrap"
  output.style.wordBreak = "break-word"
  output.style.background = "#020617"
  output.style.color = "#cbd5e1"
  output.style.border = "1px solid #1e293b"
  output.style.borderRadius = "8px"
  output.style.padding = "10px"
  output.style.fontSize = "11px"
  output.style.maxHeight = "360px"
  output.style.overflow = "auto"
  output.textContent = "Run the benchmark to generate a report."

  panel.appendChild(heading)
  panel.appendChild(info)
  panel.appendChild(controls)
  panel.appendChild(glossary)
  panel.appendChild(status)
  panel.appendChild(output)

  const comparisons = assertDefined(
    document.getElementById("comparisons"),
    "Missing #comparisons container",
  )
  const parent = assertDefined(
    comparisons.parentElement,
    "Missing parent element",
  )
  parent.insertBefore(panel, comparisons)

  return {
    runButton,
    copyButton,
    status,
    output,
    dprInput: dprInput.input,
    referenceSupersampleInput: referenceSupersampleInput.input,
    pluginIterationsInput: pluginIterationsInput.input,
    textureIterationsInput: textureIterationsInput.input,
    skipBatchInput: skipBatchInput.input,
  }
}

function createMetricGlossary(): HTMLDivElement {
  const glossary = document.createElement("div")
  glossary.style.display = "flex"
  glossary.style.flexWrap = "wrap"
  glossary.style.gap = "6px"
  glossary.style.alignItems = "center"
  glossary.style.marginBottom = "8px"
  glossary.style.fontSize = "11px"
  glossary.style.color = "#94a3b8"

  const heading = document.createElement("span")
  heading.textContent = "Metric glossary (hover):"
  heading.style.marginRight = "4px"
  glossary.appendChild(heading)

  appendTooltipTerm(
    glossary,
    "PSNR dB",
    "Peak Signal-to-Noise Ratio in decibels. Higher is better and means closer visual match to the reference image.",
  )
  appendTooltipTerm(
    glossary,
    "MAE %",
    "Mean Absolute Error in percent of max channel value. Lower is better.",
  )
  appendTooltipTerm(
    glossary,
    "SSIM",
    "Structural Similarity Index. Closer to 1.0 is better and indicates stronger structural/detail similarity.",
  )
  appendTooltipTerm(
    glossary,
    "Silhouette IoU",
    "Intersection-over-Union of alpha masks. Closer to 1.0 means shape coverage matches better.",
  )
  appendTooltipTerm(
    glossary,
    "Edge acuity ratio",
    "Candidate edge-strength divided by reference edge-strength. Around 1.0 is best; below 1.0 is softer, above 1.0 is sharper/possibly over-sharpened.",
  )
  appendTooltipTerm(
    glossary,
    "Edge F1",
    "F1 score of edge-map overlap with small positional tolerance. Closer to 1.0 is better.",
  )
  appendTooltipTerm(
    glossary,
    "Supersampled ref",
    "Reference SVG rasterized at higher resolution and downsampled to reduce single-rasterizer aliasing bias.",
  )
  appendTooltipTerm(
    glossary,
    "median ms",
    "Median time in milliseconds per measured operation. Lower is faster.",
  )
  appendTooltipTerm(
    glossary,
    "dirty-skip",
    "Draw call returns early because input state did not change since last committed draw.",
  )
  appendTooltipTerm(
    glossary,
    "decode+blit",
    "Texture-first prep cost: SVG decode/rasterize and canvas drawImage transfer.",
  )

  return glossary
}

function appendTooltipTerm(
  container: HTMLElement,
  term: string,
  description: string,
): void {
  const chip = document.createElement("span")
  chip.textContent = term
  chip.title = description
  chip.style.padding = "2px 6px"
  chip.style.borderRadius = "999px"
  chip.style.border = "1px solid #334155"
  chip.style.background = "#0b1220"
  chip.style.color = "#cbd5e1"
  chip.style.textDecoration = "underline dotted"
  chip.style.textUnderlineOffset = "2px"
  chip.style.cursor = "help"
  container.appendChild(chip)
}

function styleButton(button: HTMLButtonElement): void {
  button.style.padding = "7px 10px"
  button.style.borderRadius = "8px"
  button.style.border = "1px solid #475569"
  button.style.background = "#1e293b"
  button.style.color = "#f1f5f9"
  button.style.cursor = "pointer"
}

function createNumberInput(
  labelText: string,
  value: string,
  min: number,
): {
  wrapper: HTMLLabelElement
  input: HTMLInputElement
} {
  const wrapper = document.createElement("label")
  wrapper.style.display = "flex"
  wrapper.style.flexDirection = "column"
  wrapper.style.gap = "4px"
  wrapper.style.fontSize = "11px"
  wrapper.style.color = "#94a3b8"

  const label = document.createElement("span")
  label.textContent = labelText

  const input = document.createElement("input")
  input.type = "number"
  input.min = String(min)
  input.value = value
  input.style.width = "96px"
  input.style.padding = "6px"
  input.style.borderRadius = "6px"
  input.style.border = "1px solid #334155"
  input.style.background = "#0b1220"
  input.style.color = "#e2e8f0"

  wrapper.appendChild(label)
  wrapper.appendChild(input)

  return { wrapper, input }
}

function nextFrame(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => resolve())
  })
}

function clampNumber(raw: string, fallback: number, min: number): number {
  const parsed = Number(raw)
  if (!Number.isFinite(parsed)) {
    return fallback
  }
  if (parsed < min) {
    return min
  }
  return parsed
}

function summarizeSamples(samples: number[]): DistributionStats {
  const sorted = [...samples].sort((a, b) => a - b)
  const count = sorted.length
  const sum = sorted.reduce((acc, value) => acc + value, 0)
  const meanMs = count > 0 ? sum / count : 0

  return {
    meanMs,
    medianMs: percentile(sorted, 0.5),
    p95Ms: percentile(sorted, 0.95),
    minMs: count > 0 ? (sorted[0] ?? 0) : 0,
    maxMs: count > 0 ? (sorted[count - 1] ?? 0) : 0,
  }
}

function percentile(sorted: number[], q: number): number {
  if (sorted.length === 0) {
    return 0
  }
  const idx = (sorted.length - 1) * q
  const lo = Math.floor(idx)
  const hi = Math.ceil(idx)
  const a = sorted[lo] ?? 0
  const b = sorted[hi] ?? a
  if (lo === hi) {
    return a
  }
  const t = idx - lo
  return a + (b - a) * t
}

function mean(values: number[]): number {
  if (values.length === 0) {
    return 0
  }
  const total = values.reduce((acc, value) => acc + value, 0)
  return total / values.length
}

function findCanvas(parentId: string): HTMLCanvasElement | null {
  const selector = `#${CSS.escape(parentId)} canvas`
  const element = document.querySelector(selector)
  return element instanceof HTMLCanvasElement ? element : null
}

async function waitForCanvas(
  parentId: string,
  timeoutMs = 5000,
): Promise<HTMLCanvasElement> {
  const start = performance.now()

  while (performance.now() - start < timeoutMs) {
    const canvas = findCanvas(parentId)
    if (canvas && canvas.width > 0 && canvas.height > 0) {
      return canvas
    }

    await nextFrame()
  }

  throw new Error(`Timed out waiting for canvas: ${parentId}`)
}

function toSizedSvgMarkup(
  svgString: string,
  pixelW: number,
  pixelH: number,
): string {
  const parser = new DOMParser()
  const doc = parser.parseFromString(svgString, "image/svg+xml")
  const root = doc.documentElement

  if (root.tagName.toLowerCase() !== "svg") {
    throw new Error("SVG root element missing")
  }

  root.setAttribute("width", String(pixelW))
  root.setAttribute("height", String(pixelH))

  if (!root.hasAttribute("xmlns")) {
    root.setAttribute("xmlns", "http://www.w3.org/2000/svg")
  }

  return new XMLSerializer().serializeToString(root)
}

async function rasterizeSvgToImage(
  svgString: string,
  pixelW: number,
  pixelH: number,
): Promise<HTMLImageElement> {
  const markup = toSizedSvgMarkup(svgString, pixelW, pixelH)
  const blob = new Blob([markup], { type: "image/svg+xml;charset=utf-8" })
  const url = URL.createObjectURL(blob)

  return new Promise((resolve, reject) => {
    const image = new Image()

    image.onload = () => {
      URL.revokeObjectURL(url)
      resolve(image)
    }

    image.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error("Failed to decode SVG image"))
    }

    image.src = url
  })
}

async function rasterizeSvgToImageData(
  svgString: string,
  pixelW: number,
  pixelH: number,
): Promise<ImageData> {
  const image = await rasterizeSvgToImage(svgString, pixelW, pixelH)
  const canvas = document.createElement("canvas")
  canvas.width = pixelW
  canvas.height = pixelH

  const ctx = canvas.getContext("2d", { willReadFrequently: true })
  if (!ctx) {
    throw new Error("2D context unavailable")
  }

  ctx.clearRect(0, 0, pixelW, pixelH)
  ctx.drawImage(image, 0, 0, pixelW, pixelH)

  return ctx.getImageData(0, 0, pixelW, pixelH)
}

async function rasterizeSvgToImageDataSupersampled(
  svgString: string,
  pixelW: number,
  pixelH: number,
  supersampleScale: number,
): Promise<ImageData> {
  const scale = Math.max(1, Math.round(supersampleScale))
  if (scale === 1) {
    return rasterizeSvgToImageData(svgString, pixelW, pixelH)
  }

  const sourceW = pixelW * scale
  const sourceH = pixelH * scale
  const sourceImage = await rasterizeSvgToImage(svgString, sourceW, sourceH)

  const sourceCanvas = document.createElement("canvas")
  sourceCanvas.width = sourceW
  sourceCanvas.height = sourceH
  const sourceCtx = sourceCanvas.getContext("2d")
  if (!sourceCtx) {
    throw new Error("2D context unavailable")
  }
  sourceCtx.clearRect(0, 0, sourceW, sourceH)
  sourceCtx.drawImage(sourceImage, 0, 0, sourceW, sourceH)

  const downsampledCanvas = document.createElement("canvas")
  downsampledCanvas.width = pixelW
  downsampledCanvas.height = pixelH
  const downsampledCtx = downsampledCanvas.getContext("2d", {
    willReadFrequently: true,
  })
  if (!downsampledCtx) {
    throw new Error("2D context unavailable")
  }

  downsampledCtx.imageSmoothingEnabled = true
  downsampledCtx.imageSmoothingQuality = "high"
  downsampledCtx.clearRect(0, 0, pixelW, pixelH)
  downsampledCtx.drawImage(
    sourceCanvas,
    0,
    0,
    sourceW,
    sourceH,
    0,
    0,
    pixelW,
    pixelH,
  )

  return downsampledCtx.getImageData(0, 0, pixelW, pixelH)
}

function captureCanvasImageData(
  canvas: HTMLCanvasElement,
  pixelW: number,
  pixelH: number,
): ImageData {
  const probe = document.createElement("canvas")
  probe.width = pixelW
  probe.height = pixelH

  const ctx = probe.getContext("2d", { willReadFrequently: true })
  if (!ctx) {
    throw new Error("2D context unavailable")
  }

  ctx.clearRect(0, 0, pixelW, pixelH)
  ctx.drawImage(canvas, 0, 0, pixelW, pixelH)

  return ctx.getImageData(0, 0, pixelW, pixelH)
}

const EDGE_GRADIENT_THRESHOLD = 6
const EDGE_MATCH_RADIUS_PX = 1
const SILHOUETTE_ALPHA_THRESHOLD = 16

function computeSsim(reference: ImageData, candidate: ImageData): number {
  const ref = reference.data
  const cand = candidate.data

  const n = reference.width * reference.height
  if (n <= 1) {
    return 1
  }

  let sumRef = 0
  let sumCand = 0

  for (let i = 0; i < ref.length; i += 4) {
    const yRef = 0.2126 * ref[i] + 0.7152 * ref[i + 1] + 0.0722 * ref[i + 2]
    const yCand = 0.2126 * cand[i] + 0.7152 * cand[i + 1] + 0.0722 * cand[i + 2]
    sumRef += yRef
    sumCand += yCand
  }

  const meanRef = sumRef / n
  const meanCand = sumCand / n

  let varRef = 0
  let varCand = 0
  let cov = 0

  for (let i = 0; i < ref.length; i += 4) {
    const yRef = 0.2126 * ref[i] + 0.7152 * ref[i + 1] + 0.0722 * ref[i + 2]
    const yCand = 0.2126 * cand[i] + 0.7152 * cand[i + 1] + 0.0722 * cand[i + 2]

    const dr = yRef - meanRef
    const dc = yCand - meanCand

    varRef += dr * dr
    varCand += dc * dc
    cov += dr * dc
  }

  const denom = n - 1
  if (denom <= 0) {
    return 1
  }

  varRef /= denom
  varCand /= denom
  cov /= denom

  const c1 = (0.01 * 255) ** 2
  const c2 = (0.03 * 255) ** 2

  const numerator = (2 * meanRef * meanCand + c1) * (2 * cov + c2)
  const denominator =
    (meanRef * meanRef + meanCand * meanCand + c1) * (varRef + varCand + c2)

  if (denominator === 0) {
    return 1
  }

  return Math.max(0, Math.min(1, numerator / denominator))
}

function computeSilhouetteIou(
  reference: ImageData,
  candidate: ImageData,
  alphaThreshold: number,
): number {
  const ref = reference.data
  const cand = candidate.data

  let intersection = 0
  let union = 0

  for (let i = 3; i < ref.length; i += 4) {
    const refOn = ref[i] > alphaThreshold
    const candOn = cand[i] > alphaThreshold

    if (refOn && candOn) {
      intersection += 1
    }
    if (refOn || candOn) {
      union += 1
    }
  }

  if (union === 0) {
    return 1
  }

  return intersection / union
}

function buildEdgeMask(
  image: ImageData,
  gradientThreshold: number,
): { mask: Uint8Array; count: number } {
  const width = image.width
  const height = image.height
  const data = image.data
  const mask = new Uint8Array(width * height)

  let count = 0

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const alphaIndex = (y * width + x) * 4 + 3
      const left = alphaIndex - 4
      const right = alphaIndex + 4
      const up = alphaIndex - width * 4
      const down = alphaIndex + width * 4

      const grad = Math.hypot(data[right] - data[left], data[down] - data[up])
      if (grad < gradientThreshold) {
        continue
      }

      const idx = y * width + x
      mask[idx] = 1
      count += 1
    }
  }

  return { mask, count }
}

function countMatchesWithinRadius(
  sourceMask: Uint8Array,
  targetMask: Uint8Array,
  width: number,
  height: number,
  radius: number,
): number {
  let matches = 0

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x
      if (sourceMask[idx] === 0) {
        continue
      }

      let found = false

      for (
        let ny = Math.max(0, y - radius);
        ny <= Math.min(height - 1, y + radius);
        ny++
      ) {
        for (
          let nx = Math.max(0, x - radius);
          nx <= Math.min(width - 1, x + radius);
          nx++
        ) {
          if (targetMask[ny * width + nx] !== 0) {
            found = true
            break
          }
        }

        if (found) {
          break
        }
      }

      if (found) {
        matches += 1
      }
    }
  }

  return matches
}

function computeEdgeF1(
  referenceMask: Uint8Array,
  candidateMask: Uint8Array,
  width: number,
  height: number,
  referenceCount: number,
  candidateCount: number,
  radiusPx: number,
): number {
  if (referenceCount === 0 && candidateCount === 0) {
    return 1
  }
  if (referenceCount === 0 || candidateCount === 0) {
    return 0
  }

  const matchedCandidate = countMatchesWithinRadius(
    candidateMask,
    referenceMask,
    width,
    height,
    radiusPx,
  )
  const matchedReference = countMatchesWithinRadius(
    referenceMask,
    candidateMask,
    width,
    height,
    radiusPx,
  )

  const precision = matchedCandidate / candidateCount
  const recall = matchedReference / referenceCount

  if (precision + recall === 0) {
    return 0
  }

  return (2 * precision * recall) / (precision + recall)
}

function computeDirectComparisonMetrics(
  imageA: ImageData,
  imageB: ImageData,
): DirectComparisonMetrics {
  if (imageA.width !== imageB.width || imageA.height !== imageB.height) {
    throw new Error(
      "Image size mismatch while computing direct comparison metrics",
    )
  }

  const a = imageA.data
  const b = imageB.data

  let absError = 0
  let squaredError = 0

  const pixelCount = imageA.width * imageA.height

  for (let i = 0; i < a.length; i += 4) {
    const dr = b[i] - a[i]
    const dg = b[i + 1] - a[i + 1]
    const db = b[i + 2] - a[i + 2]

    absError += Math.abs(dr) + Math.abs(dg) + Math.abs(db)
    squaredError += dr * dr + dg * dg + db * db
  }

  const channels = pixelCount * 3
  const mae = channels > 0 ? absError / (channels * 255) : 0
  const mse = channels > 0 ? squaredError / channels : 0
  const psnrDb = mse === 0 ? 99 : 10 * Math.log10((255 * 255) / mse)

  const ssim = computeSsim(imageA, imageB)
  const silhouetteIou = computeSilhouetteIou(
    imageA,
    imageB,
    SILHOUETTE_ALPHA_THRESHOLD,
  )
  const edgesA = buildEdgeMask(imageA, EDGE_GRADIENT_THRESHOLD)
  const edgesB = buildEdgeMask(imageB, EDGE_GRADIENT_THRESHOLD)
  const edgeF1 = computeEdgeF1(
    edgesA.mask,
    edgesB.mask,
    imageA.width,
    imageA.height,
    edgesA.count,
    edgesB.count,
    EDGE_MATCH_RADIUS_PX,
  )

  return {
    mae,
    psnrDb,
    ssim,
    silhouetteIou,
    edgeF1,
  }
}

function computeCrispnessMetrics(
  reference: ImageData,
  candidate: ImageData,
): CrispnessMetrics {
  if (
    reference.width !== candidate.width ||
    reference.height !== candidate.height
  ) {
    throw new Error("Image size mismatch while computing crispness metrics")
  }

  const ref = reference.data
  const cand = candidate.data

  let absError = 0
  let squaredError = 0

  const pixelCount = reference.width * reference.height

  for (let i = 0; i < ref.length; i += 4) {
    const dr = cand[i] - ref[i]
    const dg = cand[i + 1] - ref[i + 1]
    const db = cand[i + 2] - ref[i + 2]

    absError += Math.abs(dr) + Math.abs(dg) + Math.abs(db)
    squaredError += dr * dr + dg * dg + db * db
  }

  const channels = pixelCount * 3
  const mae = channels > 0 ? absError / (channels * 255) : 0
  const mse = channels > 0 ? squaredError / channels : 0
  const psnrDb = mse === 0 ? 99 : 10 * Math.log10((255 * 255) / mse)
  const ssim = computeSsim(reference, candidate)
  const silhouetteIou = computeSilhouetteIou(
    reference,
    candidate,
    SILHOUETTE_ALPHA_THRESHOLD,
  )

  const width = reference.width
  const height = reference.height
  let edgePixels = 0
  let edgeRefEnergy = 0
  let edgeCandEnergy = 0
  let edgeDiff = 0

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const alphaIndex = (y * width + x) * 4 + 3
      const left = alphaIndex - 4
      const right = alphaIndex + 4
      const up = alphaIndex - width * 4
      const down = alphaIndex + width * 4

      const refGrad = Math.hypot(ref[right] - ref[left], ref[down] - ref[up])
      if (refGrad < EDGE_GRADIENT_THRESHOLD) {
        continue
      }

      const candGrad = Math.hypot(
        cand[right] - cand[left],
        cand[down] - cand[up],
      )

      edgePixels += 1
      edgeRefEnergy += refGrad
      edgeCandEnergy += candGrad
      edgeDiff += Math.abs(candGrad - refGrad)
    }
  }

  const edgeAcuityRatio = edgeRefEnergy > 0 ? edgeCandEnergy / edgeRefEnergy : 1
  const edgeGradientMae = edgePixels > 0 ? edgeDiff / (edgePixels * 255) : 0
  const referenceEdges = buildEdgeMask(reference, EDGE_GRADIENT_THRESHOLD)
  const candidateEdges = buildEdgeMask(candidate, EDGE_GRADIENT_THRESHOLD)
  const edgeF1 = computeEdgeF1(
    referenceEdges.mask,
    candidateEdges.mask,
    width,
    height,
    referenceEdges.count,
    candidateEdges.count,
    EDGE_MATCH_RADIUS_PX,
  )

  return {
    mae,
    psnrDb,
    ssim,
    silhouetteIou,
    edgeAcuityRatio,
    edgeGradientMae,
    edgeF1,
    edgePixels,
  }
}

function summarizeMethodMetrics(metrics: CrispnessMetrics[]): MethodSummary {
  return {
    meanMaePct: mean(metrics.map((entry) => entry.mae * 100)),
    meanPsnrDb: mean(metrics.map((entry) => entry.psnrDb)),
    meanSsim: mean(metrics.map((entry) => entry.ssim)),
    meanSilhouetteIou: mean(metrics.map((entry) => entry.silhouetteIou)),
    meanEdgeAcuityRatio: mean(metrics.map((entry) => entry.edgeAcuityRatio)),
    meanEdgeGradientMaePct: mean(
      metrics.map((entry) => entry.edgeGradientMae * 100),
    ),
    meanEdgeF1: mean(metrics.map((entry) => entry.edgeF1)),
  }
}

function computePluginWinRate(
  fixtures: CrispnessFixtureResult[],
  pickPlugin: (entry: CrispnessFixtureResult) => number,
  pickVanilla: (entry: CrispnessFixtureResult) => number,
  mode: "lower" | "higher",
): number {
  if (fixtures.length === 0) {
    return 0
  }

  let wins = 0

  for (const entry of fixtures) {
    const pluginValue = pickPlugin(entry)
    const vanillaValue = pickVanilla(entry)

    if (mode === "lower") {
      if (pluginValue < vanillaValue) {
        wins += 1
      }
      continue
    }

    if (pluginValue > vanillaValue) {
      wins += 1
    }
  }

  return (wins / fixtures.length) * 100
}

async function runCrispnessBench(
  fixtures: BenchmarkFixture[],
  referenceSupersample: number,
  setStatus: (text: string) => void,
): Promise<{
  fixtures: CrispnessFixtureResult[]
  summary: CrispnessSummary
}> {
  const results: CrispnessFixtureResult[] = []

  for (let i = 0; i < fixtures.length; i++) {
    const fixture = assertDefined(fixtures[i], "Missing benchmark fixture")
    setStatus(`Crispness ${i + 1}/${fixtures.length}: ${fixture.title}`)

    const pluginCanvas = await waitForCanvas(fixture.pluginParentId)
    const vanillaCanvas = await waitForCanvas(fixture.vanillaParentId)

    const pixelW = Math.max(
      1,
      Math.min(pluginCanvas.width, vanillaCanvas.width),
    )
    const pixelH = Math.max(
      1,
      Math.min(pluginCanvas.height, vanillaCanvas.height),
    )

    const nativeReference = await rasterizeSvgToImageData(
      fixture.svg,
      pixelW,
      pixelH,
    )
    const supersampledReference = await rasterizeSvgToImageDataSupersampled(
      fixture.svg,
      pixelW,
      pixelH,
      referenceSupersample,
    )

    const plugin = captureCanvasImageData(pluginCanvas, pixelW, pixelH)
    const vanilla = captureCanvasImageData(vanillaCanvas, pixelW, pixelH)

    results.push({
      fixture: fixture.title,
      pixelWidth: pixelW,
      pixelHeight: pixelH,
      nativeReference: {
        plugin: computeCrispnessMetrics(nativeReference, plugin),
        vanilla: computeCrispnessMetrics(nativeReference, vanilla),
      },
      supersampledReference: {
        plugin: computeCrispnessMetrics(supersampledReference, plugin),
        vanilla: computeCrispnessMetrics(supersampledReference, vanilla),
      },
      pluginVsVanilla: computeDirectComparisonMetrics(plugin, vanilla),
    })

    await nextFrame()
  }

  const nativePluginMetrics = results.map(
    (entry) => entry.nativeReference.plugin,
  )
  const nativeVanillaMetrics = results.map(
    (entry) => entry.nativeReference.vanilla,
  )
  const supersampledPluginMetrics = results.map(
    (entry) => entry.supersampledReference.plugin,
  )
  const supersampledVanillaMetrics = results.map(
    (entry) => entry.supersampledReference.vanilla,
  )

  const summary: CrispnessSummary = {
    nativeReference: {
      plugin: summarizeMethodMetrics(nativePluginMetrics),
      vanilla: summarizeMethodMetrics(nativeVanillaMetrics),
      pluginWinsByMaePct: computePluginWinRate(
        results,
        (entry) => entry.nativeReference.plugin.mae,
        (entry) => entry.nativeReference.vanilla.mae,
        "lower",
      ),
      pluginWinsBySsimPct: computePluginWinRate(
        results,
        (entry) => entry.nativeReference.plugin.ssim,
        (entry) => entry.nativeReference.vanilla.ssim,
        "higher",
      ),
      pluginWinsByEdgeF1Pct: computePluginWinRate(
        results,
        (entry) => entry.nativeReference.plugin.edgeF1,
        (entry) => entry.nativeReference.vanilla.edgeF1,
        "higher",
      ),
    },
    supersampledReference: {
      plugin: summarizeMethodMetrics(supersampledPluginMetrics),
      vanilla: summarizeMethodMetrics(supersampledVanillaMetrics),
      pluginWinsByMaePct: computePluginWinRate(
        results,
        (entry) => entry.supersampledReference.plugin.mae,
        (entry) => entry.supersampledReference.vanilla.mae,
        "lower",
      ),
      pluginWinsBySsimPct: computePluginWinRate(
        results,
        (entry) => entry.supersampledReference.plugin.ssim,
        (entry) => entry.supersampledReference.vanilla.ssim,
        "higher",
      ),
      pluginWinsByEdgeF1Pct: computePluginWinRate(
        results,
        (entry) => entry.supersampledReference.plugin.edgeF1,
        (entry) => entry.supersampledReference.vanilla.edgeF1,
        "higher",
      ),
    },
    pluginVsVanilla: {
      meanMaePct: mean(results.map((entry) => entry.pluginVsVanilla.mae * 100)),
      meanPsnrDb: mean(results.map((entry) => entry.pluginVsVanilla.psnrDb)),
      meanSsim: mean(results.map((entry) => entry.pluginVsVanilla.ssim)),
      meanSilhouetteIou: mean(
        results.map((entry) => entry.pluginVsVanilla.silhouetteIou),
      ),
      meanEdgeF1: mean(results.map((entry) => entry.pluginVsVanilla.edgeF1)),
    },
  }

  return {
    fixtures: results,
    summary,
  }
}

function measureBatchedSeries(
  iterations: number,
  batchSize: number,
  fn: () => void,
): number[] {
  const samples: number[] = []

  for (let i = 0; i < iterations; i++) {
    const t0 = performance.now()
    for (let j = 0; j < batchSize; j++) {
      fn()
    }
    const elapsed = performance.now() - t0
    samples.push(elapsed / batchSize)
  }

  return samples
}

function runPluginPerfFixture(
  fixture: BenchmarkFixture,
  iterations: number,
  skipBatchSize: number,
): PluginPerfMetrics {
  const graphics = new NoopGraphics() as unknown as Phaser.GameObjects.Graphics
  const options = {
    width: fixture.width,
    height: fixture.height,
  }

  const compiled = compileSVG(fixture.svg)

  // Warm-up to reduce JIT noise.
  drawSVG(graphics, fixture.svg, options)
  drawCompiledSVG(graphics, compiled, options)
  clearSVGDirtyState(graphics)
  const runtimeFirstDrawSources = Array.from(
    { length: iterations },
    (_, index) => withBenchmarkCacheBuster(fixture.svg, index),
  )
  let runtimeFirstDrawIndex = 0

  const runtimeDraw = measureBatchedSeries(iterations, 1, () => {
    markSVGDirty(graphics)
    drawSVG(
      graphics,
      runtimeFirstDrawSources[runtimeFirstDrawIndex++] ?? fixture.svg,
      options,
    )
  })

  clearSVGDirtyState(graphics)

  const compiledDraw = measureBatchedSeries(iterations, 1, () => {
    markSVGDirty(graphics)
    drawCompiledSVG(graphics, compiled, options)
  })

  clearSVGDirtyState(graphics)
  drawSVG(graphics, fixture.svg, options)

  const runtimeSkip = measureBatchedSeries(iterations, skipBatchSize, () => {
    drawSVGIfDirty(graphics, fixture.svg, options)
  })

  clearSVGDirtyState(graphics)
  drawCompiledSVG(graphics, compiled, options)

  const compiledSkip = measureBatchedSeries(iterations, skipBatchSize, () => {
    drawCompiledSVGIfDirty(graphics, compiled, options)
  })

  clearSVGDirtyState(graphics)
  drawSVG(graphics, fixture.svg, options)

  const runtimeDirtyRedraw = measureBatchedSeries(iterations, 1, () => {
    graphics.clear()
    markSVGDirty(graphics)
    drawSVGIfDirty(graphics, fixture.svg, options)
  })

  clearSVGDirtyState(graphics)
  drawCompiledSVG(graphics, compiled, options)

  const compiledDirtyRedraw = measureBatchedSeries(iterations, 1, () => {
    graphics.clear()
    markSVGDirty(graphics)
    drawCompiledSVGIfDirty(graphics, compiled, options)
  })

  const objectCount = 64
  const immediateGraphics = Array.from(
    { length: objectCount },
    () => new NoopGraphics() as unknown as Phaser.GameObjects.Graphics,
  )

  const immediateCompiled64 = measureBatchedSeries(iterations, 1, () => {
    for (const objectGraphics of immediateGraphics) {
      markSVGDirty(objectGraphics)
      drawCompiledSVG(objectGraphics, compiled, options)
    }
  })

  const batchGraphics =
    new NoopGraphics() as unknown as Phaser.GameObjects.Graphics
  const batchScene = createNoopBatchScene(
    getBenchmarkRendererForMsaa(),
    batchGraphics,
  )
  const sceneBatch = new SVGSceneBatch(batchScene, {
    graphics: batchGraphics,
    autoFlush: false,
  })

  const sceneBatchCompiled64 = measureBatchedSeries(iterations, 1, () => {
    for (let i = 0; i < objectCount; i++) {
      const tx = (i % 8) * (fixture.width + 2)
      const ty = Math.floor(i / 8) * (fixture.height + 2)
      sceneBatch.queueCompiled(compiled, {
        ...options,
        x: tx,
        y: ty,
      })
    }
    sceneBatch.flush()
  })

  return {
    runtimeDraw,
    compiledDraw,
    runtimeSkip,
    compiledSkip,
    runtimeDirtyRedraw,
    compiledDirtyRedraw,
    immediateCompiled64,
    sceneBatchCompiled64,
  }
}

function withBenchmarkCacheBuster(svgString: string, index: number): string {
  const marker = `<!--benchmark-cache-buster:${index}-->`
  if (svgString.includes("</svg>")) {
    return svgString.replace(/<\/svg>/i, `${marker}</svg>`)
  }

  return `${svgString}${marker}`
}

async function runPluginPerfBench(
  fixtures: BenchmarkFixture[],
  iterations: number,
  skipBatchSize: number,
  setStatus: (text: string) => void,
): Promise<{
  fixtures: PluginPerfFixtureResult[]
  summary: {
    runtimeDrawMedianMs: number
    compiledDrawMedianMs: number
    runtimeSkipMedianMs: number
    compiledSkipMedianMs: number
    runtimeDirtyRedrawMedianMs: number
    compiledDirtyRedrawMedianMs: number
    immediateCompiled64MedianMs: number
    sceneBatchCompiled64MedianMs: number
  }
}> {
  const results: PluginPerfFixtureResult[] = []

  for (let i = 0; i < fixtures.length; i++) {
    const fixture = assertDefined(fixtures[i], "Missing benchmark fixture")
    setStatus(`Plugin perf ${i + 1}/${fixtures.length}: ${fixture.title}`)

    const metrics = runPluginPerfFixture(fixture, iterations, skipBatchSize)

    results.push({
      fixture: fixture.title,
      runtimeDraw: summarizeSamples(metrics.runtimeDraw),
      compiledDraw: summarizeSamples(metrics.compiledDraw),
      runtimeSkip: summarizeSamples(metrics.runtimeSkip),
      compiledSkip: summarizeSamples(metrics.compiledSkip),
      runtimeDirtyRedraw: summarizeSamples(metrics.runtimeDirtyRedraw),
      compiledDirtyRedraw: summarizeSamples(metrics.compiledDirtyRedraw),
      immediateCompiled64: summarizeSamples(metrics.immediateCompiled64),
      sceneBatchCompiled64: summarizeSamples(metrics.sceneBatchCompiled64),
    })

    await nextFrame()
  }

  return {
    fixtures: results,
    summary: {
      runtimeDrawMedianMs: mean(
        results.map((entry) => entry.runtimeDraw.medianMs),
      ),
      compiledDrawMedianMs: mean(
        results.map((entry) => entry.compiledDraw.medianMs),
      ),
      runtimeSkipMedianMs: mean(
        results.map((entry) => entry.runtimeSkip.medianMs),
      ),
      compiledSkipMedianMs: mean(
        results.map((entry) => entry.compiledSkip.medianMs),
      ),
      runtimeDirtyRedrawMedianMs: mean(
        results.map((entry) => entry.runtimeDirtyRedraw.medianMs),
      ),
      compiledDirtyRedrawMedianMs: mean(
        results.map((entry) => entry.compiledDirtyRedraw.medianMs),
      ),
      immediateCompiled64MedianMs: mean(
        results.map((entry) => entry.immediateCompiled64.medianMs),
      ),
      sceneBatchCompiled64MedianMs: mean(
        results.map((entry) => entry.sceneBatchCompiled64.medianMs),
      ),
    },
  }
}

async function runTexturePrepPerfFixture(
  fixture: BenchmarkFixture,
  dpr: number,
  iterations: number,
): Promise<TexturePrepMetrics> {
  const decode: number[] = []
  const blit: number[] = []

  const pixelW = Math.max(1, Math.round(fixture.width * dpr))
  const pixelH = Math.max(1, Math.round(fixture.height * dpr))

  for (let i = 0; i < iterations; i++) {
    const decodeStart = performance.now()
    const image = await rasterizeSvgToImage(fixture.svg, pixelW, pixelH)
    decode.push(performance.now() - decodeStart)

    const canvas = document.createElement("canvas")
    canvas.width = pixelW
    canvas.height = pixelH

    const ctx = canvas.getContext("2d")
    if (!ctx) {
      throw new Error("2D context unavailable")
    }

    const blitStart = performance.now()
    ctx.drawImage(image, 0, 0, pixelW, pixelH)
    blit.push(performance.now() - blitStart)
  }

  return { decode, blit }
}

async function runTexturePrepBench(
  fixtures: BenchmarkFixture[],
  dpr: number,
  iterations: number,
  setStatus: (text: string) => void,
): Promise<{
  fixtures: TexturePerfFixtureResult[]
  summary: { decodeMedianMs: number; blitMedianMs: number }
}> {
  const results: TexturePerfFixtureResult[] = []

  for (let i = 0; i < fixtures.length; i++) {
    const fixture = assertDefined(fixtures[i], "Missing benchmark fixture")
    setStatus(`Texture perf ${i + 1}/${fixtures.length}: ${fixture.title}`)

    const metrics = await runTexturePrepPerfFixture(fixture, dpr, iterations)

    results.push({
      fixture: fixture.title,
      svgDecodeAndRasterize: summarizeSamples(metrics.decode),
      canvasBlit: summarizeSamples(metrics.blit),
    })

    await nextFrame()
  }

  return {
    fixtures: results,
    summary: {
      decodeMedianMs: mean(
        results.map((entry) => entry.svgDecodeAndRasterize.medianMs),
      ),
      blitMedianMs: mean(results.map((entry) => entry.canvasBlit.medianMs)),
    },
  }
}

async function runBenchmark(
  fixtures: BenchmarkFixture[],
  config: {
    dpr: number
    referenceSupersample: number
    pluginIterations: number
    textureIterations: number
    skipBatchSize: number
  },
  setStatus: (text: string) => void,
): Promise<BenchmarkResult> {
  const crispness = await runCrispnessBench(
    fixtures,
    config.referenceSupersample,
    setStatus,
  )
  const pluginPerf = await runPluginPerfBench(
    fixtures,
    config.pluginIterations,
    config.skipBatchSize,
    setStatus,
  )
  const texturePerf = await runTexturePrepBench(
    fixtures,
    config.dpr,
    config.textureIterations,
    setStatus,
  )

  const result: BenchmarkResult = {
    runAt: new Date().toISOString(),
    config: {
      fixtureCount: fixtures.length,
      dpr: config.dpr,
      referenceSupersample: config.referenceSupersample,
      pluginIterations: config.pluginIterations,
      textureIterations: config.textureIterations,
      skipBatchSize: config.skipBatchSize,
    },
    crispness: {
      reference: {
        native: "Browser SVG rasterized at target pixel size",
        supersampled: `Browser SVG rasterized at ${config.referenceSupersample}x and downsampled`,
      },
      fixtures: crispness.fixtures,
      summary: crispness.summary,
    },
    performance: {
      pluginCpu: pluginPerf,
      texturePrep: texturePerf,
    },
    baselineRows: [
      {
        scenario: "runtime first draw",
        medianMs: pluginPerf.summary.runtimeDrawMedianMs,
      },
      {
        scenario: "precompiled first draw",
        medianMs: pluginPerf.summary.compiledDrawMedianMs,
      },
      {
        scenario: "unchanged redraw skip",
        medianMs: pluginPerf.summary.runtimeSkipMedianMs,
      },
      {
        scenario: "dirty redraw clear+draw",
        medianMs: pluginPerf.summary.runtimeDirtyRedrawMedianMs,
      },
      {
        scenario: "multi-object immediate compiled (64)",
        medianMs: pluginPerf.summary.immediateCompiled64MedianMs,
      },
      {
        scenario: "multi-object scene batch compiled (64)",
        medianMs: pluginPerf.summary.sceneBatchCompiled64MedianMs,
      },
    ],
  }

  return result
}

function buildCompactSummary(result: BenchmarkResult): string {
  const native = result.crispness.summary.nativeReference
  const supersampled = result.crispness.summary.supersampledReference
  const direct = result.crispness.summary.pluginVsVanilla
  const perf = result.performance

  const lines: string[] = []
  lines.push("Summary")
  lines.push(
    `Native ref PSNR dB: plugin ${native.plugin.meanPsnrDb.toFixed(2)}, vanilla ${native.vanilla.meanPsnrDb.toFixed(2)}`,
  )
  lines.push(
    `Native ref MAE %: plugin ${native.plugin.meanMaePct.toFixed(3)}, vanilla ${native.vanilla.meanMaePct.toFixed(3)}`,
  )
  lines.push(
    `Supersampled ref (${result.config.referenceSupersample}x) SSIM: plugin ${supersampled.plugin.meanSsim.toFixed(4)}, vanilla ${supersampled.vanilla.meanSsim.toFixed(4)}`,
  )
  lines.push(
    `Supersampled ref Edge F1: plugin ${supersampled.plugin.meanEdgeF1.toFixed(4)}, vanilla ${supersampled.vanilla.meanEdgeF1.toFixed(4)}`,
  )
  lines.push(
    `Plugin win rate vs vanilla (supersampled ref): MAE ${supersampled.pluginWinsByMaePct.toFixed(1)}%, SSIM ${supersampled.pluginWinsBySsimPct.toFixed(1)}%, Edge F1 ${supersampled.pluginWinsByEdgeF1Pct.toFixed(1)}%`,
  )
  lines.push(
    `Direct plugin-vs-vanilla: MAE ${direct.meanMaePct.toFixed(3)}%, SSIM ${direct.meanSsim.toFixed(4)}, IoU ${direct.meanSilhouetteIou.toFixed(4)}, Edge F1 ${direct.meanEdgeF1.toFixed(4)}`,
  )
  lines.push(
    `Plugin CPU runtime draw median ms: ${perf.pluginCpu.summary.runtimeDrawMedianMs.toFixed(3)}`,
  )
  lines.push(
    `Plugin CPU precompiled draw median ms: ${perf.pluginCpu.summary.compiledDrawMedianMs.toFixed(3)}`,
  )
  lines.push(
    `Plugin CPU unchanged skip median ms: ${perf.pluginCpu.summary.runtimeSkipMedianMs.toFixed(5)}`,
  )
  lines.push(
    `Plugin CPU multi-object immediate compiled (64) median ms: ${perf.pluginCpu.summary.immediateCompiled64MedianMs.toFixed(3)}`,
  )
  lines.push(
    `Plugin CPU multi-object scene batch compiled (64) median ms: ${perf.pluginCpu.summary.sceneBatchCompiled64MedianMs.toFixed(3)}`,
  )
  lines.push(
    `Texture prep decode median ms: ${perf.texturePrep.summary.decodeMedianMs.toFixed(3)}`,
  )
  lines.push(
    `Texture prep blit median ms: ${perf.texturePrep.summary.blitMedianMs.toFixed(3)}`,
  )

  return lines.join("\n")
}

export function installBenchmarkPanel(fixtures: BenchmarkFixture[]): void {
  if (fixtures.length === 0) {
    return
  }

  const panel = createPanelState()
  let lastResult: BenchmarkResult | null = null

  panel.runButton.addEventListener("click", async () => {
    panel.runButton.disabled = true
    panel.copyButton.disabled = true

    const dpr = clampNumber(
      panel.dprInput.value,
      window.devicePixelRatio || 1,
      0.25,
    )
    const referenceSupersample = clampNumber(
      panel.referenceSupersampleInput.value,
      4,
      1,
    )
    const pluginIterations = clampNumber(
      panel.pluginIterationsInput.value,
      30,
      1,
    )
    const textureIterations = clampNumber(
      panel.textureIterationsInput.value,
      8,
      1,
    )
    const skipBatchSize = clampNumber(panel.skipBatchInput.value, 200, 1)

    panel.status.textContent = "Running benchmark..."

    try {
      const result = await runBenchmark(
        fixtures,
        {
          dpr,
          referenceSupersample,
          pluginIterations,
          textureIterations,
          skipBatchSize,
        },
        (text) => {
          panel.status.textContent = text
        },
      )

      lastResult = result
      panel.output.textContent = `${buildCompactSummary(result)}\n\n${JSON.stringify(result, null, 2)}`
      panel.status.textContent = "Benchmark complete"
      panel.copyButton.disabled = false
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      panel.output.textContent = `Benchmark failed: ${message}`
      panel.status.textContent = "Benchmark failed"
    } finally {
      panel.runButton.disabled = false
    }
  })

  panel.copyButton.addEventListener("click", async () => {
    if (!lastResult) {
      return
    }

    const payload = JSON.stringify(lastResult, null, 2)
    try {
      await navigator.clipboard.writeText(payload)
      panel.status.textContent = "JSON copied to clipboard"
    } catch {
      panel.status.textContent = "Clipboard write failed"
    }
  })
}
