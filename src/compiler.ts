import { XMLParser } from "fast-xml-parser"
import {
  type Affine2D,
  multiplyAffine,
  parseTransform,
  strokeScaleFromAffine,
  transformPathCommandsAffine,
} from "./affine-transform.ts"
import { parseNativeShape, type NativeShape } from "./native-shape.ts"
import { parsePath } from "./path-parser.ts"
import { filterPresentationAttrs } from "./presentation-attrs.ts"
import type { MsaaSamples } from "./render-node/types.ts"
import { convertShape } from "./shape.ts"
import { isNonRenderableContainerTag } from "./svg-structure.ts"
import type { PathCommand, SVGStyle, ViewBox } from "./types.ts"

export interface CompileSVGOptions {
  /** Default MSAA samples to embed into compiled output. */
  msaaSamples?: MsaaSamples | undefined
}

/** A pre-compiled shape item that preserves source draw order. */
export type CompiledItem =
  | { kind: "path"; commands: PathCommand[]; style: SVGStyle }
  | { kind: "native"; shape: NativeShape; style: SVGStyle }

/** Pre-compiled SVG ready for rendering without runtime parsing. */
export interface CompiledSVG {
  viewBox: ViewBox | null
  /** Optional compile-time default MSAA samples. */
  msaaSamples?: MsaaSamples | undefined
  /** Ordered shape list used by the renderer. */
  items: CompiledItem[]
}

type OrderedNode = {
  ":@"?: Record<string, string>
  [name: string]: OrderedNode[] | Record<string, string> | undefined
}

interface ParsedElement {
  tagName: string
  attrs: Record<string, string>
  children: ParsedElement[]
}

interface TraversalContext {
  inheritedStyleAttrs: Record<string, string>
  opacityMultiplier: number
  transform?: Affine2D | undefined
}

const SUPPORTED_SHAPE_TAGS = new Set([
  "path",
  "rect",
  "circle",
  "ellipse",
  "line",
  "polyline",
  "polygon",
])

const xmlParser = new XMLParser({
  preserveOrder: true,
  ignoreAttributes: false,
  attributeNamePrefix: "",
  textNodeName: "#text",
  trimValues: false,
})

/**
 * Compile an SVG string into pre-parsed draw data.
 *
 * Runs without DOMParser so it works in Node.js and at build time.
 * The result can be serialised to JSON and rendered later with
 * `drawCompiledSVG()`.
 */
export function compileSVG(
  svgString: string,
  options?: CompileSVGOptions | undefined,
): CompiledSVG {
  const root = parseRootSVG(svgString)
  if (!root) {
    return { viewBox: null, msaaSamples: options?.msaaSamples, items: [] }
  }

  const viewBox = extractViewBox(root.attrs) ?? null
  const items: CompiledItem[] = []
  const rootContext: TraversalContext = {
    inheritedStyleAttrs: filterPresentationAttrs(root.attrs),
    opacityMultiplier: parseOpacityFactor(root.attrs.opacity),
    transform: parseTransform(root.attrs.transform),
  }

  for (const child of root.children) {
    traverseElement(child, rootContext, items)
  }

  return { viewBox, msaaSamples: options?.msaaSamples, items }
}

function traverseElement(
  element: ParsedElement,
  context: TraversalContext,
  items: CompiledItem[],
): void {
  const tagName = normaliseTagName(element.tagName)
  if (isNonRenderableContainerTag(tagName)) {
    return
  }

  const nextContext: TraversalContext = {
    inheritedStyleAttrs: mergePresentationAttrs(
      context.inheritedStyleAttrs,
      element.attrs,
    ),
    opacityMultiplier:
      context.opacityMultiplier * parseOpacityFactor(element.attrs.opacity),
    transform: combineTransforms(
      context.transform,
      parseTransform(element.attrs.transform),
    ),
  }

  if (SUPPORTED_SHAPE_TAGS.has(tagName)) {
    const item = compileShape(tagName, element.attrs, nextContext)
    if (item) {
      items.push(item)
    }
    return
  }

  for (const child of element.children) {
    traverseElement(child, nextContext, items)
  }
}

function compileShape(
  tagName: string,
  attrs: Record<string, string>,
  context: TraversalContext,
): CompiledItem | undefined {
  const resolvedAttrs = { ...context.inheritedStyleAttrs, ...attrs }
  delete resolvedAttrs.transform
  delete resolvedAttrs.opacity

  const geometryAttrs = { ...attrs }
  delete geometryAttrs.transform
  delete geometryAttrs.opacity

  const nativeShape = parseNativeShape(tagName, geometryAttrs)
  const converted = convertShape(tagName, resolvedAttrs)
  if (!converted) {
    return undefined
  }

  const style = converted.style
  style.opacity *= context.opacityMultiplier

  if (nativeShape && context.transform === undefined) {
    return { kind: "native", shape: nativeShape, style }
  }

  let commands = parsePath(converted.d)
  if (context.transform) {
    commands = transformPathCommandsAffine(commands, context.transform)
    style.strokeWidth *= strokeScaleFromAffine(context.transform)
  }

  return { kind: "path", commands, style }
}

function parseRootSVG(svgString: string): ParsedElement | undefined {
  const ordered = xmlParser.parse(svgString) as OrderedNode[] | undefined
  if (!Array.isArray(ordered)) {
    return undefined
  }

  for (const entry of ordered) {
    const parsed = buildParsedElement(entry)
    if (parsed && normaliseTagName(parsed.tagName) === "svg") {
      return parsed
    }
  }

  return undefined
}

function buildParsedElement(entry: OrderedNode): ParsedElement | undefined {
  const attrs = readAttrs(entry)

  for (const [rawTagName, value] of Object.entries(entry)) {
    if (rawTagName === ":@" || rawTagName.startsWith("#")) {
      continue
    }
    if (!Array.isArray(value)) {
      continue
    }

    const children: ParsedElement[] = []
    for (const childEntry of value) {
      const child = buildParsedElement(childEntry)
      if (child) {
        children.push(child)
      }
    }

    return {
      tagName: rawTagName,
      attrs,
      children,
    }
  }

  return undefined
}

function readAttrs(entry: OrderedNode): Record<string, string> {
  const attrs = entry[":@"]
  if (!attrs) {
    return {}
  }

  return { ...attrs }
}

function mergePresentationAttrs(
  parent: Record<string, string>,
  attrs: Record<string, string>,
): Record<string, string> {
  const local = filterPresentationAttrs(attrs)
  if (Object.keys(local).length === 0) {
    return parent
  }

  return { ...parent, ...local }
}

function combineTransforms(
  parent: Affine2D | undefined,
  child: Affine2D | undefined,
): Affine2D | undefined {
  const combined =
    parent && child ? multiplyAffine(parent, child) : (parent ?? child)

  if (!combined || isIdentityTransform(combined)) {
    return undefined
  }

  return combined
}

function isIdentityTransform(matrix: Affine2D): boolean {
  return (
    Math.abs(matrix.a - 1) < 1e-12 &&
    Math.abs(matrix.b) < 1e-12 &&
    Math.abs(matrix.c) < 1e-12 &&
    Math.abs(matrix.d - 1) < 1e-12 &&
    Math.abs(matrix.e) < 1e-12 &&
    Math.abs(matrix.f) < 1e-12
  )
}

function parseOpacityFactor(raw: string | undefined): number {
  if (raw === undefined) {
    return 1
  }

  const parsed = Number(raw)
  if (!Number.isFinite(parsed)) {
    return 1
  }

  return clamp(parsed, 0, 1)
}

function extractViewBox(attrs: Record<string, string>): ViewBox | undefined {
  const raw = attrs.viewBox
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

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

function normaliseTagName(tagName: string): string {
  const separator = tagName.indexOf(":")
  return (separator >= 0 ? tagName.slice(separator + 1) : tagName).toLowerCase()
}
