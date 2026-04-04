import Phaser from "phaser"
import { assertDefined } from "./assert.ts"
import type { PathCommand, SVGStyle } from "./types.ts"

export interface RenderOptions {
  /** Points per curve segment for tessellation (default 32). */
  curveResolution?: number | undefined
}

/**
 * Return true if the command list contains only simple commands
 * (M, L, Z) that can be drawn directly on Graphics without curves.
 */
function isSimplePath(commands: PathCommand[]): boolean {
  return commands.every(
    (c) => c.type === "M" || c.type === "L" || c.type === "Z",
  )
}

/**
 * Render parsed SVG path commands onto a Phaser Graphics object.
 */
export function renderPath(
  graphics: Phaser.GameObjects.Graphics,
  commands: PathCommand[],
  style: SVGStyle,
  options?: RenderOptions | undefined,
): void {
  const effectiveFillAlpha =
    style.fill !== null ? style.fillAlpha * style.opacity : 0
  const effectiveStrokeAlpha =
    style.stroke !== null ? style.strokeAlpha * style.opacity : 0

  if (isSimplePath(commands)) {
    renderSimplePath(
      graphics,
      commands,
      style,
      effectiveFillAlpha,
      effectiveStrokeAlpha,
    )
  } else {
    renderComplexPath(
      graphics,
      commands,
      style,
      effectiveFillAlpha,
      effectiveStrokeAlpha,
      options,
    )
  }
}

// ---------------------------------------------------------------------------
// Simple path renderer — direct Graphics calls, no tessellation
// ---------------------------------------------------------------------------

function renderSimplePath(
  graphics: Phaser.GameObjects.Graphics,
  commands: PathCommand[],
  style: SVGStyle,
  fillAlpha: number,
  strokeAlpha: number,
): void {
  applyStyles(graphics, style, fillAlpha, strokeAlpha)
  graphics.beginPath()

  for (const cmd of commands) {
    switch (cmd.type) {
      case "M":
        graphics.moveTo(cmd.x, cmd.y)
        break
      case "L":
        graphics.lineTo(cmd.x, cmd.y)
        break
      case "Z":
        graphics.closePath()
        break
    }
  }

  applyFillAndStroke(graphics, style, fillAlpha, strokeAlpha)
  coverLineJoins(graphics, commands, style, strokeAlpha)
}

// ---------------------------------------------------------------------------
// Complex path renderer — uses Phaser.Curves.Path for curves
// ---------------------------------------------------------------------------

function renderComplexPath(
  graphics: Phaser.GameObjects.Graphics,
  commands: PathCommand[],
  style: SVGStyle,
  fillAlpha: number,
  strokeAlpha: number,
  options?: RenderOptions | undefined,
): void {
  const resolution = options?.curveResolution ?? 32

  // We need to split into subpaths (each starting with M) and render each.
  // Phaser.Curves.Path draws open/closed polylines from its curves.
  const subpaths = splitSubpaths(commands)

  for (const subpath of subpaths) {
    if (subpath.length === 0) continue

    const first = assertDefined(subpath[0], "Subpath must start with a command")
    if (first.type !== "M") continue

    const phaserPath = new Phaser.Curves.Path(first.x, first.y)
    let closed = false

    for (let i = 1; i < subpath.length; i++) {
      const cmd = assertDefined(subpath[i], `Expected command at index ${i}`)
      switch (cmd.type) {
        case "M":
          // Shouldn't happen inside a subpath, but move the path
          phaserPath.moveTo(cmd.x, cmd.y)
          break
        case "L":
          phaserPath.lineTo(cmd.x, cmd.y)
          break
        case "C":
          phaserPath.cubicBezierTo(cmd.x, cmd.y, cmd.x1, cmd.y1, cmd.x2, cmd.y2)
          break
        case "Q":
          phaserPath.quadraticBezierTo(cmd.x, cmd.y, cmd.x1, cmd.y1)
          break
        case "A":
          addArcToPath(phaserPath, subpath, i)
          break
        case "Z":
          phaserPath.closePath()
          closed = true
          break
      }
    }

    // Draw the Phaser path as a polyline on the Graphics object
    const points = phaserPath.getPoints(resolution)
    if (closed && points.length > 0) {
      points.push(assertDefined(points[0]))
    }

    if (points.length > 1) {
      applyStyles(graphics, style, fillAlpha, strokeAlpha)
      const start = assertDefined(points[0])
      graphics.beginPath()
      graphics.moveTo(start.x, start.y)
      for (let j = 1; j < points.length; j++) {
        const pt = assertDefined(points[j])
        graphics.lineTo(pt.x, pt.y)
      }
      if (closed) {
        graphics.closePath()
      }
      applyFillAndStroke(graphics, style, fillAlpha, strokeAlpha)
      coverLineJoinPoints(graphics, points, style, strokeAlpha)
    }
  }
}

// ---------------------------------------------------------------------------
// Arc conversion: SVG endpoint → Phaser.Curves.EllipseCurve
// ---------------------------------------------------------------------------

function addArcToPath(
  path: Phaser.Curves.Path,
  commands: PathCommand[],
  index: number,
): void {
  const cmd = assertDefined(
    commands[index],
    `Expected command at index ${index}`,
  )
  if (cmd.type !== "A") return

  // Find the previous endpoint (current point)
  let px = 0
  let py = 0
  for (let j = index - 1; j >= 0; j--) {
    const prev = assertDefined(commands[j])
    if ("x" in prev && "y" in prev) {
      px = prev.x
      py = prev.y
      break
    }
  }

  const { startAngle, endAngle, rx, ry, clockwise } = endpointToCenter(
    px,
    py,
    cmd.rx,
    cmd.ry,
    cmd.xAxisRotation,
    cmd.largeArc,
    cmd.sweep,
    cmd.x,
    cmd.y,
  )

  // Phaser.Curves.EllipseCurve expects degrees
  path.ellipseTo(
    rx,
    ry,
    startAngle * (180 / Math.PI),
    endAngle * (180 / Math.PI),
    clockwise,
    cmd.xAxisRotation,
  )
}

/**
 * SVG endpoint parameterization → center parameterization.
 * Based on SVG spec Appendix F.6.5.
 */
function endpointToCenter(
  x1: number,
  y1: number,
  rxRaw: number,
  ryRaw: number,
  phi: number,
  fA: boolean,
  fS: boolean,
  x2: number,
  y2: number,
): {
  cx: number
  cy: number
  rx: number
  ry: number
  startAngle: number
  endAngle: number
  clockwise: boolean
} {
  const phiRad = (phi * Math.PI) / 180
  const cosPhi = Math.cos(phiRad)
  const sinPhi = Math.sin(phiRad)

  // Step 1: compute (x1', y1')
  const dx2 = (x1 - x2) / 2
  const dy2 = (y1 - y2) / 2
  const x1p = cosPhi * dx2 + sinPhi * dy2
  const y1p = -sinPhi * dx2 + cosPhi * dy2

  // Step 2: compute (cx', cy')
  let rx = Math.abs(rxRaw)
  let ry = Math.abs(ryRaw)

  // Ensure radii are large enough
  const x1p2 = x1p * x1p
  const y1p2 = y1p * y1p
  let rx2 = rx * rx
  let ry2 = ry * ry

  const lambda = x1p2 / rx2 + y1p2 / ry2
  if (lambda > 1) {
    const sqrtLambda = Math.sqrt(lambda)
    rx *= sqrtLambda
    ry *= sqrtLambda
    rx2 = rx * rx
    ry2 = ry * ry
  }

  const num = Math.max(0, rx2 * ry2 - rx2 * y1p2 - ry2 * x1p2)
  const den = rx2 * y1p2 + ry2 * x1p2
  const sq = Math.sqrt(num / den)
  const sign = fA === fS ? -1 : 1

  const cxp = sign * sq * ((rx * y1p) / ry)
  const cyp = sign * sq * (-(ry * x1p) / rx)

  // Step 3: compute (cx, cy)
  const cx = cosPhi * cxp - sinPhi * cyp + (x1 + x2) / 2
  const cy = sinPhi * cxp + cosPhi * cyp + (y1 + y2) / 2

  // Step 4: compute angles
  const startAngle = vectorAngle(1, 0, (x1p - cxp) / rx, (y1p - cyp) / ry)
  let dTheta = vectorAngle(
    (x1p - cxp) / rx,
    (y1p - cyp) / ry,
    (-x1p - cxp) / rx,
    (-y1p - cyp) / ry,
  )

  if (!fS && dTheta > 0) dTheta -= 2 * Math.PI
  if (fS && dTheta < 0) dTheta += 2 * Math.PI

  return {
    cx,
    cy,
    rx,
    ry,
    startAngle,
    endAngle: startAngle + dTheta,
    clockwise: !fS,
  }
}

function vectorAngle(ux: number, uy: number, vx: number, vy: number): number {
  const dot = ux * vx + uy * vy
  const len = Math.sqrt((ux * ux + uy * uy) * (vx * vx + vy * vy))
  let ang = Math.acos(Math.max(-1, Math.min(1, dot / len)))
  if (ux * vy - uy * vx < 0) ang = -ang
  return ang
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function splitSubpaths(commands: PathCommand[]): PathCommand[][] {
  const subpaths: PathCommand[][] = []
  let current: PathCommand[] = []

  for (const cmd of commands) {
    if (cmd.type === "M" && current.length > 0) {
      subpaths.push(current)
      current = []
    }
    current.push(cmd)
  }
  if (current.length > 0) {
    subpaths.push(current)
  }

  return subpaths
}

function applyStyles(
  graphics: Phaser.GameObjects.Graphics,
  style: SVGStyle,
  fillAlpha: number,
  strokeAlpha: number,
): void {
  if (style.fill !== null) {
    graphics.fillStyle(style.fill, fillAlpha)
  }
  if (style.stroke !== null) {
    graphics.lineStyle(style.strokeWidth, style.stroke, strokeAlpha)
  }
}

function applyFillAndStroke(
  graphics: Phaser.GameObjects.Graphics,
  style: SVGStyle,
  _fillAlpha: number,
  _strokeAlpha: number,
): void {
  if (style.fill !== null) {
    graphics.fillPath()
  }
  if (style.stroke !== null) {
    graphics.strokePath()
  }
}

/**
 * Draw filled circles at path vertices to cover WebGL line join gaps.
 * Only activates for round line joins/caps.
 */
function coverLineJoins(
  graphics: Phaser.GameObjects.Graphics,
  commands: PathCommand[],
  style: SVGStyle,
  strokeAlpha: number,
): void {
  if (style.stroke === null || style.strokeWidth < 2) return
  if (style.lineJoin !== "round" && style.lineCap !== "round") return

  const r = style.strokeWidth / 2
  graphics.fillStyle(style.stroke, strokeAlpha)

  for (const cmd of commands) {
    if ("x" in cmd && "y" in cmd) {
      graphics.fillCircle(cmd.x, cmd.y, r)
    }
  }
}

/**
 * Cover line join gaps for a tessellated point array.
 * Only activates for round line joins/caps.
 */
function coverLineJoinPoints(
  graphics: Phaser.GameObjects.Graphics,
  points: Phaser.Math.Vector2[],
  style: SVGStyle,
  strokeAlpha: number,
): void {
  if (style.stroke === null || style.strokeWidth < 2) return
  if (style.lineJoin !== "round" && style.lineCap !== "round") return

  const r = style.strokeWidth / 2
  graphics.fillStyle(style.stroke, strokeAlpha)

  for (const pt of points) {
    graphics.fillCircle(pt.x, pt.y, r)
  }
}
