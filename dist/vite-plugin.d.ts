import type { Plugin } from "vite";
export type { CompiledItem, CompiledPath, CompiledSVG } from "./compiler.ts";
/**
 * Vite plugin that compiles SVG files into pre-parsed phaser-svg-plugin
 * draw data at build time.
 *
 * ```ts
 * // vite.config.ts
 * import { phaserSVG } from "phaser-svg-plugin/vite"
 *
 * export default defineConfig({
 *   plugins: [phaserSVG()],
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
export declare function phaserSVG(): Plugin;
//# sourceMappingURL=vite-plugin.d.ts.map