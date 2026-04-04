declare module "*.svg" {
  import type { CompiledSVG } from "phaser-svg"
  const svg: CompiledSVG
  export default svg
}
