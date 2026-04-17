const PRESENTATION_ATTR_NAMES = new Set([
  "fill",
  "fill-opacity",
  "stroke",
  "stroke-opacity",
  "stroke-width",
  "stroke-linejoin",
  "stroke-linecap",
  "stroke-miterlimit",
])

/** Keep only inheritable SVG presentation attributes used by this renderer. */
export function filterPresentationAttrs(
  attrs: Record<string, string>,
): Record<string, string> {
  const filtered: Record<string, string> = {}
  for (const [name, value] of Object.entries(attrs)) {
    if (PRESENTATION_ATTR_NAMES.has(name)) {
      filtered[name] = value
    }
  }
  return filtered
}

/** Convert element attributes to a plain object map. */
export function attrsFromElement(el: Element): Record<string, string> {
  const attrs: Record<string, string> = {}
  for (const attr of el.attributes) {
    attrs[attr.name] = attr.value
  }
  return attrs
}

/** Parse `key="value"` / `key='value'` attributes from raw tag text. */
export function parseAttributes(attrsStr: string): Record<string, string> {
  const attrs: Record<string, string> = {}
  const attrRegex = /([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g

  for (const attrMatch of attrsStr.matchAll(attrRegex)) {
    const name = attrMatch[1]
    const value = attrMatch[2] ?? attrMatch[3]
    if (name !== undefined && value !== undefined) {
      attrs[name] = value
    }
  }

  return attrs
}
