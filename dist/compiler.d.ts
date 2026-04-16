import { type NativeShape } from "./native-shape.ts";
import type { MsaaSamples } from "./render-node/types.ts";
import type { PathCommand, SVGStyle, ViewBox } from "./types.ts";
export interface CompileSVGOptions {
    /** Default MSAA samples to embed into compiled output. */
    msaaSamples?: MsaaSamples | undefined;
}
/** A pre-compiled SVG path: parsed commands with resolved style. */
export interface CompiledPath {
    commands: PathCommand[];
    style: SVGStyle;
}
/** A pre-compiled shape item that preserves source draw order. */
export type CompiledItem = {
    kind: "path";
    commands: PathCommand[];
    style: SVGStyle;
} | {
    kind: "native";
    shape: NativeShape;
    style: SVGStyle;
};
/** Pre-compiled SVG ready for rendering without runtime parsing. */
export interface CompiledSVG {
    viewBox: ViewBox | null;
    /** Optional compile-time default MSAA samples. */
    msaaSamples?: MsaaSamples | undefined;
    /** Ordered shape list used by the renderer. */
    items: CompiledItem[];
    /** Backward-compatible path list (all shapes converted to paths). */
    paths: CompiledPath[];
}
/**
 * Compile an SVG string into pre-parsed draw data.
 *
 * Runs without DOMParser so it works in Node.js and at build time.
 * The result can be serialised to JSON and rendered later with
 * `drawCompiledSVG()`.
 */
export declare function compileSVG(svgString: string, options?: CompileSVGOptions | undefined): CompiledSVG;
//# sourceMappingURL=compiler.d.ts.map