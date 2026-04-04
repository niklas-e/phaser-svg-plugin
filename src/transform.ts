import type { PathCommand, ViewBox } from "./types.ts"

/**
 * Compute a uniform scale + translate that maps a viewBox into a
 * target rectangle (xMidYMid meet — the SVG default).
 */
export function viewBoxTransform(
  viewBox: ViewBox,
  targetW: number,
  targetH: number,
): { scale: number; tx: number; ty: number } {
  const sx = targetW / viewBox.width
  const sy = targetH / viewBox.height
  const scale = Math.min(sx, sy)

  const tx = (targetW - viewBox.width * scale) / 2 - viewBox.minX * scale
  const ty = (targetH - viewBox.height * scale) / 2 - viewBox.minY * scale

  return { scale, tx, ty }
}

/** Apply uniform scale + translate to path commands. */
export function transformCommands(
  commands: PathCommand[],
  scale: number,
  tx: number,
  ty: number,
): PathCommand[] {
  const result: PathCommand[] = []

  for (const cmd of commands) {
    switch (cmd.type) {
      case "M":
        result.push({
          type: "M",
          x: cmd.x * scale + tx,
          y: cmd.y * scale + ty,
        })
        break
      case "L":
        result.push({
          type: "L",
          x: cmd.x * scale + tx,
          y: cmd.y * scale + ty,
        })
        break
      case "C":
        result.push({
          type: "C",
          x1: cmd.x1 * scale + tx,
          y1: cmd.y1 * scale + ty,
          x2: cmd.x2 * scale + tx,
          y2: cmd.y2 * scale + ty,
          x: cmd.x * scale + tx,
          y: cmd.y * scale + ty,
        })
        break
      case "Q":
        result.push({
          type: "Q",
          x1: cmd.x1 * scale + tx,
          y1: cmd.y1 * scale + ty,
          x: cmd.x * scale + tx,
          y: cmd.y * scale + ty,
        })
        break
      case "A":
        result.push({
          type: "A",
          rx: cmd.rx * scale,
          ry: cmd.ry * scale,
          xAxisRotation: cmd.xAxisRotation,
          largeArc: cmd.largeArc,
          sweep: cmd.sweep,
          x: cmd.x * scale + tx,
          y: cmd.y * scale + ty,
        })
        break
      case "Z":
        result.push(cmd)
        break
    }
  }

  return result
}
