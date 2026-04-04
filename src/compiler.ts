import { parsePath } from "./path-parser.ts"
import { resolveStyle } from "./style.ts"
import type { PathCommand, SVGStyle } from "./types.ts"

/** A pre-compiled SVG path: parsed commands with resolved style. */
export interface CompiledPath {
  commands: PathCommand[]
  style: SVGStyle
}

/** Pre-compiled SVG ready for rendering without runtime parsing. */
export type CompiledSVG = CompiledPath[]

/**
 * Compile an SVG string into pre-parsed path commands and styles.
 *
 * Runs without DOMParser so it works in Node.js and at build time.
 * The result can be serialised to JSON and rendered later with
 * `drawCompiledSVG()`.
 */
export function compileSVG(svgString: string): CompiledSVG {
  const pathElements = extractPathElements(svgString)
  const result: CompiledSVG = []

  for (const attrs of pathElements) {
    const d = attrs.d
    if (!d) continue

    const style = resolveStyle(attrs)
    const commands = parsePath(d)
    result.push({ commands, style })
  }

  return result
}

/**
 * Extract attributes from all `<path>` elements in an SVG string.
 * Uses regex so it works without a DOM parser.
 */
function extractPathElements(svgString: string): Record<string, string>[] {
  const paths: Record<string, string>[] = []
  const pathRegex = /<path\s+([^>]*?)\s*\/?>/gi

  for (const match of svgString.matchAll(pathRegex)) {
    const attrsStr = match[1]
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

    paths.push(attrs)
  }

  return paths
}
