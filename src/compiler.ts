import { parsePath } from "./path-parser.ts"
import { convertShape } from "./shape.ts"
import type { PathCommand, SVGStyle, ViewBox } from "./types.ts"

/** A pre-compiled SVG path: parsed commands with resolved style. */
export interface CompiledPath {
  commands: PathCommand[]
  style: SVGStyle
}

/** Pre-compiled SVG ready for rendering without runtime parsing. */
export interface CompiledSVG {
  viewBox: ViewBox | null
  paths: CompiledPath[]
}

/**
 * Compile an SVG string into pre-parsed path commands and styles.
 *
 * Runs without DOMParser so it works in Node.js and at build time.
 * The result can be serialised to JSON and rendered later with
 * `drawCompiledSVG()`.
 */
export function compileSVG(svgString: string): CompiledSVG {
  const viewBox = extractViewBox(svgString) ?? null
  const elements = extractShapeElements(svgString)
  const paths: CompiledPath[] = []

  for (const { tagName, attrs } of elements) {
    const converted = convertShape(tagName, attrs)
    if (!converted) continue

    const { d, style } = converted
    const commands = parsePath(d)
    paths.push({ commands, style })
  }

  return { viewBox, paths }
}

/**
 * Extract attributes from supported shape elements in an SVG string.
 * Uses regex so it works without a DOM parser.
 */
function extractShapeElements(
  svgString: string,
): { tagName: string; attrs: Record<string, string> }[] {
  const elements: { tagName: string; attrs: Record<string, string> }[] = []
  const shapeRegex = /<(path|rect)\s+([^>]*?)\s*\/?>/gi

  for (const match of svgString.matchAll(shapeRegex)) {
    const tagName = match[1]
    const attrsStr = match[2]
    if (!tagName) continue
    if (!attrsStr) continue

    const attrs: Record<string, string> = {}
    const attrRegex = /([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g

    for (const attrMatch of attrsStr.matchAll(attrRegex)) {
      const name = attrMatch[1]
      const value = attrMatch[2] ?? attrMatch[3]
      if (name !== undefined && value !== undefined) {
        attrs[name] = value
      }
    }

    elements.push({ tagName, attrs })
  }

  return elements
}

function extractViewBox(svgString: string): ViewBox | undefined {
  const match = svgString.match(/<svg\s[^>]*viewBox\s*=\s*["']([^"']*)["']/i)
  if (!match?.[1]) return undefined

  const parts = match[1].trim().split(/[\s,]+/)
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
