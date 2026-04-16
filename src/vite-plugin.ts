import { readFile } from "node:fs/promises"
import type { Plugin } from "vite"
import { compileSVG } from "./compiler.ts"
import type { MsaaSamples } from "./render-node/types.ts"

export type { CompiledItem, CompiledPath, CompiledSVG } from "./compiler.ts"

export interface PhaserSVGViteOptions {
  /**
   * Global default MSAA samples embedded into all compiled SVG modules.
   * Can be overridden per draw call via draw options.
   */
  msaaSamples?: MsaaSamples | undefined
}

/**
 * Vite plugin that compiles SVG files into pre-parsed phaser-svg-plugin
 * draw data at build time.
 *
 * ```ts
 * // vite.config.ts
 * import { phaserSVG } from "phaser-svg-plugin/vite"
 *
 * export default defineConfig({
 *   plugins: [phaserSVG({ msaaSamples: 8 })],
 * })
 * ```
 *
 * Then import SVGs directly — they become pre-compiled draw data:
 * ```ts
 * import heart from "./heart.svg"
 * drawCompiledSVG(graphics, heart)
 * ```
 *
 * Use `?raw` or `?url` suffixes to bypass the plugin and get the
 * default Vite behaviour.
 */
export function phaserSVG(options: PhaserSVGViteOptions = {}): Plugin {
  return {
    name: "phaser-svg",
    enforce: "pre",
    async load(id) {
      if (!id.endsWith(".svg")) return null

      const content = await readFile(id, "utf-8")
      const compiled = compileSVG(content, {
        msaaSamples: options.msaaSamples,
      })

      return `export default ${JSON.stringify(compiled)};`
    },
  }
}
