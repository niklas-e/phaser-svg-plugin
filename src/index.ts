export { type ParsedColor, parseColor } from "./color.ts"
export {
  compileSVG,
  type CompileSVGOptions,
  type CompiledItem,
  type CompiledSVG,
} from "./compiler.ts"
export {
  clearSVGDirtyState,
  drawCompiledSVG,
  drawCompiledSVGIfDirty,
  drawSVG,
  drawSVGIfDirty,
  drawSVGPath,
  drawSVGPathIfDirty,
  markSVGDirty,
  type SVGPathOptions,
  type SVGPluginOptions,
} from "./draw.ts"
export { parsePath } from "./path-parser.ts"
export { SVGPlugin } from "./plugin.ts"
export type { MsaaOptions, MsaaSamples } from "./render-node/types.ts"
export { type RenderOptions, renderPath } from "./renderer.ts"
export {
  SVGSceneBatch,
  type SceneBatchDrawOptions,
  type SceneBatchPathOptions,
  type SVGSceneBatchOptions,
} from "./scene-batch.ts"
export { convertShape, type ConvertedShape } from "./shape.ts"
export { resolveStyle } from "./style.ts"
export {
  DEFAULT_STYLE,
  type PathCommand,
  type SVGStyle,
  type ViewBox,
} from "./types.ts"
