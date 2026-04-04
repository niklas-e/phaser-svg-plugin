/** Absolute path command types produced by the parser. */
export type PathCommand =
  | { type: "M"; x: number; y: number }
  | { type: "L"; x: number; y: number }
  | {
      type: "C"
      x1: number
      y1: number
      x2: number
      y2: number
      x: number
      y: number
    }
  | { type: "Q"; x1: number; y1: number; x: number; y: number }
  | {
      type: "A"
      rx: number
      ry: number
      xAxisRotation: number
      largeArc: boolean
      sweep: boolean
      x: number
      y: number
    }
  | { type: "Z" }

export interface SVGStyle {
  fill: number | null // null = no fill ("none")
  fillAlpha: number
  stroke: number | null // null = no stroke ("none")
  strokeAlpha: number
  strokeWidth: number
  lineJoin: "miter" | "round" | "bevel"
  lineCap: "butt" | "round" | "square"
  opacity: number
}

export const DEFAULT_STYLE: SVGStyle = {
  fill: 0x000000,
  fillAlpha: 1,
  stroke: null,
  strokeAlpha: 1,
  strokeWidth: 1,
  lineJoin: "miter",
  lineCap: "butt",
  opacity: 1,
}
