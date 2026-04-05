const NON_RENDERABLE_CONTAINER_TAGS = [
  "defs",
  "clipPath",
  "mask",
  "pattern",
  "symbol",
  "marker",
  "linearGradient",
  "radialGradient",
]

const NON_RENDERABLE_CONTAINER_SELECTOR =
  NON_RENDERABLE_CONTAINER_TAGS.join(",")

/** True when element is inside a non-renderable SVG definition container. */
export function isInsideNonRenderableContainer(el: Element): boolean {
  return el.closest(NON_RENDERABLE_CONTAINER_SELECTOR) !== null
}

/**
 * Remove non-renderable definition containers from SVG markup so regex-based
 * shape extraction does not pick up helper geometry (clip paths, defs, etc.).
 */
export function stripNonRenderableSections(svgString: string): string {
  let output = svgString

  for (const tagName of NON_RENDERABLE_CONTAINER_TAGS) {
    const sectionRegex = new RegExp(
      `<${tagName}\\b[\\s\\S]*?<\\/${tagName}>`,
      "gi",
    )

    // Re-run until stable to cope with nested same-tag sections.
    let prev = ""
    while (prev !== output) {
      prev = output
      output = output.replace(sectionRegex, "")
    }
  }

  return output
}
