import type Phaser from "phaser"
import { assertDefined } from "./assert.ts"
import { computeSquareCap } from "./line-cap.ts"
import {
  computeBevelJoin,
  computeMiterJoin,
  type Point2D,
} from "./line-join.ts"
import { resolveCurveResolution } from "./quality.ts"
import type { PathCommand, SVGStyle } from "./types.ts"

export interface RenderOptions {
  /** Points per curve segment for tessellation. */
  curveResolution?: number | undefined
}

interface SimpleSubpath {
  points: Point2D[]
  closed: boolean
}

interface TessellatedSubpath {
  points: Point2D[]
  closed: boolean
}

const SIMPLE_PATH_KIND_CACHE = new WeakMap<PathCommand[], boolean>()
const SIMPLE_SUBPATH_CACHE = new WeakMap<
  PathCommand[],
  ReadonlyArray<SimpleSubpath>
>()
const TESSELLATED_SUBPATH_CACHE = new WeakMap<
  PathCommand[],
  Map<number, ReadonlyArray<TessellatedSubpath>>
>()
type CompoundFillGroup = {
  ring: ReadonlyArray<{ x: number; y: number }>
  bridges?: ReadonlyArray<{
    a: { x: number; y: number }
    b: { x: number; y: number }
  }>
}
const COMPOUND_FILL_CACHE = new WeakMap<
  ReadonlyArray<{
    points: ReadonlyArray<{ x: number; y: number }>
    closed: boolean
  }>,
  ReadonlyArray<CompoundFillGroup>
>()
type JoinDecorationOp =
  | { kind: "circle"; x: number; y: number; radius: number }
  | { kind: "polygon"; points: ReadonlyArray<Point2D> }
const LINE_JOIN_DECORATION_CACHE = new WeakMap<
  ReadonlyArray<Point2D>,
  Map<string, ReadonlyArray<JoinDecorationOp>>
>()

/**
 * Return true if the command list contains only simple commands
 * (M, L, Z) that can be drawn directly on Graphics without curves.
 */
function isSimplePath(commands: PathCommand[]): boolean {
  const cached = SIMPLE_PATH_KIND_CACHE.get(commands)
  if (cached !== undefined) {
    return cached
  }

  const isSimple = commands.every(
    (c) => c.type === "M" || c.type === "L" || c.type === "Z",
  )
  SIMPLE_PATH_KIND_CACHE.set(commands, isSimple)

  return isSimple
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
  const canFill = style.fill !== null && effectiveFillAlpha > 0
  const canStroke =
    style.stroke !== null && style.strokeWidth > 0 && effectiveStrokeAlpha > 0

  // Fully invisible paths do not need tessellation, stroke, or join work.
  if (!canFill && !canStroke) {
    return
  }

  if (isSimplePath(commands)) {
    renderSimplePath(
      graphics,
      commands,
      style,
      effectiveFillAlpha,
      effectiveStrokeAlpha,
      canFill,
      canStroke,
    )
  } else {
    renderComplexPath(
      graphics,
      commands,
      style,
      effectiveFillAlpha,
      effectiveStrokeAlpha,
      canFill,
      canStroke,
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
  canFill: boolean,
  canStroke: boolean,
): void {
  const tessellated = getSimpleSubpaths(commands)

  if (tessellated.length === 0) return

  // Fill using bridged polygons so compound paths with holes
  // render correctly under WebGL.
  if (canFill && tessellated.some((s) => s.closed)) {
    fillCompoundPath(graphics, tessellated, style, fillAlpha)
  }

  // Stroke each subpath
  if (canStroke) {
    const strokeColor = assertDefined(style.stroke)
    graphics.lineStyle(style.strokeWidth, strokeColor, strokeAlpha)

    for (const { points, closed } of tessellated) {
      graphics.beginPath()
      const start = assertDefined(points[0])
      graphics.moveTo(start.x, start.y)
      for (let j = 1; j < points.length; j++) {
        const pt = assertDefined(points[j])
        graphics.lineTo(pt.x, pt.y)
      }
      if (closed) {
        graphics.closePath()
      }
      graphics.strokePath()
    }
  }

  // Line joins / caps
  if (canStroke) {
    for (const { points, closed } of tessellated) {
      drawLineJoins(graphics, points, closed, style, strokeAlpha)
    }
  }
}

// ---------------------------------------------------------------------------
// Complex path renderer — manual curve tessellation for accurate output
// ---------------------------------------------------------------------------

function renderComplexPath(
  graphics: Phaser.GameObjects.Graphics,
  commands: PathCommand[],
  style: SVGStyle,
  fillAlpha: number,
  strokeAlpha: number,
  canFill: boolean,
  canStroke: boolean,
  options?: RenderOptions | undefined,
): void {
  const resolution = resolveCurveResolution(options)
  const tessellated = getTessellatedSubpaths(commands, resolution)

  if (tessellated.length === 0) return

  // Fill using bridged polygons so compound paths with holes render
  // correctly (Phaser's WebGL pipeline doesn't honour winding rules).
  if (canFill && tessellated.some((s) => s.closed)) {
    fillCompoundPath(graphics, tessellated, style, fillAlpha)
  }

  // Stroke: draw each subpath outline individually
  if (canStroke) {
    const strokeColor = assertDefined(style.stroke)
    graphics.lineStyle(style.strokeWidth, strokeColor, strokeAlpha)

    for (const { points, closed } of tessellated) {
      graphics.beginPath()
      const start = assertDefined(points[0])
      graphics.moveTo(start.x, start.y)
      for (let j = 1; j < points.length; j++) {
        const pt = assertDefined(points[j])
        graphics.lineTo(pt.x, pt.y)
      }
      if (closed) {
        graphics.closePath()
      }
      graphics.strokePath()
    }
  }

  // Line joins / caps per subpath
  if (canStroke) {
    for (const { points, closed } of tessellated) {
      drawLineJoins(graphics, points, closed, style, strokeAlpha)
    }
  }
}

function getSimpleSubpaths(
  commands: PathCommand[],
): ReadonlyArray<SimpleSubpath> {
  const cached = SIMPLE_SUBPATH_CACHE.get(commands)
  if (cached) {
    return cached
  }

  // Split into subpaths for compound fill (handles holes via bridged polygons)
  const subpaths = splitSubpaths(commands)
  const tessellated: SimpleSubpath[] = []

  for (const subpath of subpaths) {
    const points: Point2D[] = []
    let closed = false
    for (const cmd of subpath) {
      if (cmd.type === "Z") {
        closed = true
      } else if ("x" in cmd && "y" in cmd) {
        points.push(cmd)
      }
    }
    if (points.length > 0) {
      tessellated.push({ points, closed })
    }
  }

  SIMPLE_SUBPATH_CACHE.set(commands, tessellated)
  return tessellated
}

function getTessellatedSubpaths(
  commands: PathCommand[],
  resolution: number,
): ReadonlyArray<TessellatedSubpath> {
  let byResolution = TESSELLATED_SUBPATH_CACHE.get(commands)
  if (!byResolution) {
    byResolution = new Map<number, ReadonlyArray<TessellatedSubpath>>()
    TESSELLATED_SUBPATH_CACHE.set(commands, byResolution)
  }

  const cached = byResolution.get(resolution)
  if (cached) {
    return cached
  }

  const subpathCmds = splitSubpaths(commands)
  const tessellated: TessellatedSubpath[] = []

  for (const subpath of subpathCmds) {
    if (subpath.length === 0) continue

    const first = assertDefined(subpath[0], "Subpath must start with a command")
    if (first.type !== "M") continue

    const points: Point2D[] = [{ x: first.x, y: first.y }]
    let cx = first.x
    let cy = first.y
    let closed = false

    for (let i = 1; i < subpath.length; i++) {
      const cmd = assertDefined(subpath[i], `Expected command at index ${i}`)
      switch (cmd.type) {
        case "M":
          cx = cmd.x
          cy = cmd.y
          points.push({ x: cx, y: cy })
          break
        case "L":
          cx = cmd.x
          cy = cmd.y
          points.push({ x: cx, y: cy })
          break
        case "C":
          tessellateCubic(
            cx,
            cy,
            cmd.x1,
            cmd.y1,
            cmd.x2,
            cmd.y2,
            cmd.x,
            cmd.y,
            resolution,
            points,
          )
          cx = cmd.x
          cy = cmd.y
          break
        case "Q":
          tessellateQuadratic(
            cx,
            cy,
            cmd.x1,
            cmd.y1,
            cmd.x,
            cmd.y,
            resolution,
            points,
          )
          cx = cmd.x
          cy = cmd.y
          break
        case "A": {
          tessellateArc(cx, cy, cmd, resolution, points)
          cx = cmd.x
          cy = cmd.y
          break
        }
        case "Z":
          closed = true
          break
      }
    }

    const deduped = deduplicatePoints(points)
    if (deduped.length > 1) {
      tessellated.push({ points: deduped, closed })
    }
  }

  byResolution.set(resolution, tessellated)
  return tessellated
}

// ---------------------------------------------------------------------------
// Manual curve tessellation — gives resolution points PER curve segment
// ---------------------------------------------------------------------------

function tessellateCubic(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  x3: number,
  y3: number,
  steps: number,
  out: Point2D[],
): void {
  for (let i = 1; i <= steps; i++) {
    const t = i / steps
    const mt = 1 - t
    const mt2 = mt * mt
    const t2 = t * t
    const x = mt2 * mt * x0 + 3 * mt2 * t * x1 + 3 * mt * t2 * x2 + t2 * t * x3
    const y = mt2 * mt * y0 + 3 * mt2 * t * y1 + 3 * mt * t2 * y2 + t2 * t * y3
    out.push({ x, y })
  }
}

function tessellateQuadratic(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  steps: number,
  out: Point2D[],
): void {
  for (let i = 1; i <= steps; i++) {
    const t = i / steps
    const mt = 1 - t
    const x = mt * mt * x0 + 2 * mt * t * x1 + t * t * x2
    const y = mt * mt * y0 + 2 * mt * t * y1 + t * t * y2
    out.push({ x, y })
  }
}

function tessellateArc(
  cx: number,
  cy: number,
  cmd: Extract<PathCommand, { type: "A" }>,
  steps: number,
  out: Point2D[],
): void {
  const {
    startAngle,
    endAngle,
    rx,
    ry,
    cx: arcCx,
    cy: arcCy,
  } = endpointToCenter(
    cx,
    cy,
    cmd.rx,
    cmd.ry,
    cmd.xAxisRotation,
    cmd.largeArc,
    cmd.sweep,
    cmd.x,
    cmd.y,
  )

  const phiRad = (cmd.xAxisRotation * Math.PI) / 180
  const cosPhi = Math.cos(phiRad)
  const sinPhi = Math.sin(phiRad)
  const dTheta = endAngle - startAngle

  for (let i = 1; i <= steps; i++) {
    const t = i / steps
    const theta = startAngle + dTheta * t
    const cosT = Math.cos(theta)
    const sinT = Math.sin(theta)
    const px = cosPhi * rx * cosT - sinPhi * ry * sinT + arcCx
    const py = sinPhi * rx * cosT + cosPhi * ry * sinT + arcCy
    out.push({ x: px, y: py })
  }
}

/**
 * Fill compound paths (with holes) by constructing bridged polygons.
 *
 * Phaser's WebGL FillPath renders each subpath independently through
 * earcut without hole support. To produce correct fills for paths with
 * holes we merge each outer ring with its holes into a single simple
 * polygon by inserting bridge edges. The result is a single ring that
 * Phaser can fill natively, eliminating triangulation seams entirely.
 *
 * A 1px stroke patch is drawn over each bridge slit to cover hairline
 * rasterization cracks.
 */
function fillCompoundPath(
  graphics: Phaser.GameObjects.Graphics,
  subpaths: ReadonlyArray<{
    points: ReadonlyArray<{ x: number; y: number }>
    closed: boolean
  }>,
  style: SVGStyle,
  fillAlpha: number,
): void {
  const groups = getCompoundFillGroups(subpaths)
  if (groups.length === 0) return

  graphics.fillStyle(assertDefined(style.fill), fillAlpha)

  for (const group of groups) {
    graphics.beginPath()
    const start = assertDefined(group.ring[0])
    graphics.moveTo(start.x, start.y)
    for (let j = 1; j < group.ring.length; j++) {
      const pt = assertDefined(group.ring[j])
      graphics.lineTo(pt.x, pt.y)
    }
    graphics.closePath()
    graphics.fillPath()

    if (!group.bridges || group.bridges.length === 0) {
      continue
    }

    // Patch hairline cracks along bridge slits by stroking a 1px line
    // over each bridge edge. Unlike filled quads, strokes render with
    // consistent sub-pixel coverage at every zoom level.
    const fillColor = assertDefined(style.fill)
    graphics.lineStyle(1, fillColor, fillAlpha)
    for (const bridge of group.bridges) {
      graphics.beginPath()
      graphics.moveTo(bridge.a.x, bridge.a.y)
      graphics.lineTo(bridge.b.x, bridge.b.y)
      graphics.strokePath()
    }
  }
}

function getCompoundFillGroups(
  subpaths: ReadonlyArray<{
    points: ReadonlyArray<{ x: number; y: number }>
    closed: boolean
  }>,
): ReadonlyArray<CompoundFillGroup> {
  const cached = COMPOUND_FILL_CACHE.get(subpaths)
  if (cached) {
    return cached
  }

  const closed = subpaths.filter((s) => s.closed)
  if (closed.length === 0) {
    COMPOUND_FILL_CACHE.set(subpaths, [])
    return []
  }

  const grouped = groupSubpathsForFill(closed)
  const prepared: CompoundFillGroup[] = grouped.map((group) => {
    if (group.holes.length === 0) {
      return { ring: group.outer }
    }

    const bridged = buildBridgedPolygon(group.outer, group.holes)
    return {
      ring: bridged.ring,
      bridges: bridged.bridges,
    }
  })

  COMPOUND_FILL_CACHE.set(subpaths, prepared)
  return prepared
}

interface BridgeEdge {
  a: { x: number; y: number }
  b: { x: number; y: number }
}

/**
 * Merge an outer ring with one or more hole rings into a single simple
 * polygon by inserting bridge edges.
 *
 * For each hole the algorithm finds the pair of vertices (one on the
 * current merged ring, one on the hole) with the smallest Euclidean
 * distance and splices the hole into the ring at that point:
 *
 *   …outer[i] → hole[j] → hole[j-1] → … → hole[j+1] → hole[j] → outer[i] → …
 *
 * The two bridge edges (outer[i]↔hole[j]) are nearly coincident, so the
 * visual result is an invisible slit connecting the boundaries.
 *
 * Returns both the merged ring and the bridge edge locations so the
 * caller can patch hairline rasterization cracks.
 */
export function buildBridgedPolygon(
  outer: ReadonlyArray<{ x: number; y: number }>,
  holes: ReadonlyArray<ReadonlyArray<{ x: number; y: number }>>,
): { ring: Array<{ x: number; y: number }>; bridges: BridgeEdge[] } {
  // Start with a mutable copy of the outer ring
  let ring: Array<{ x: number; y: number }> = Array.from(outer)
  const bridges: BridgeEdge[] = []

  for (const hole of holes) {
    // Find closest vertex pair between current ring and hole
    let bestDist = Infinity
    let bestRingIdx = 0
    let bestHoleIdx = 0

    for (let ri = 0; ri < ring.length; ri++) {
      const rp = assertDefined(ring[ri])
      for (let hi = 0; hi < hole.length; hi++) {
        const hp = assertDefined(hole[hi])
        const dx = rp.x - hp.x
        const dy = rp.y - hp.y
        const dist = dx * dx + dy * dy
        if (dist < bestDist) {
          bestDist = dist
          bestRingIdx = ri
          bestHoleIdx = hi
        }
      }
    }

    // Splice the hole into the ring at the bridge point.
    // The hole is traversed starting from bestHoleIdx, wrapping around,
    // and ending back at bestHoleIdx. Then we return to the ring vertex.
    const bridgeOuter = assertDefined(ring[bestRingIdx])
    const bridgeHole = assertDefined(hole[bestHoleIdx])
    const holeLen = hole.length

    bridges.push({ a: bridgeOuter, b: bridgeHole })

    const spliced: Array<{ x: number; y: number }> = []

    // Outer ring up to and including the bridge point
    for (let i = 0; i <= bestRingIdx; i++) {
      spliced.push(assertDefined(ring[i]))
    }

    // Traverse hole starting from bridge point, full loop back
    for (let i = 0; i <= holeLen; i++) {
      spliced.push(assertDefined(hole[(bestHoleIdx + i) % holeLen]))
    }

    // Bridge back: duplicate the outer bridge vertex
    spliced.push(bridgeOuter)

    // Rest of outer ring after bridge point
    for (let i = bestRingIdx + 1; i < ring.length; i++) {
      spliced.push(assertDefined(ring[i]))
    }

    ring = spliced
  }

  return { ring, bridges }
}

// ---------------------------------------------------------------------------
// Winding-direction subpath grouping for earcut
// ---------------------------------------------------------------------------

interface FillGroup {
  outer: ReadonlyArray<{ x: number; y: number }>
  holes: ReadonlyArray<{ x: number; y: number }>[]
}

interface BBox {
  minX: number
  minY: number
  maxX: number
  maxY: number
}

/**
 * Group closed subpaths into outer rings + holes using winding direction
 * and bounding-box containment.
 *
 * SVG nonzero fill rule: outer contours wind one direction, holes wind
 * the opposite. We use signed area to classify each subpath, then assign
 * holes to the smallest enclosing outer via bounding box.
 */
export function groupSubpathsForFill(
  closed: ReadonlyArray<{
    points: ReadonlyArray<{ x: number; y: number }>
  }>,
): FillGroup[] {
  const n = closed.length
  if (n === 1) {
    return [{ outer: assertDefined(closed[0]).points, holes: [] }]
  }

  // Classify each subpath by winding direction and compute bounding box
  interface SubpathInfo {
    points: ReadonlyArray<{ x: number; y: number }>
    area: number
    bbox: BBox
  }

  const infos: SubpathInfo[] = []
  for (let i = 0; i < n; i++) {
    const pts = assertDefined(closed[i]).points
    infos.push({
      points: pts,
      area: signedArea2(pts),
      bbox: computeBBox(pts),
    })
  }

  // Determine majority winding direction — outers are the majority
  // (there are usually more outer shapes than holes)
  let positiveArea = 0
  let negativeArea = 0
  for (const info of infos) {
    if (info.area > 0) positiveArea += info.area
    else negativeArea -= info.area
  }
  const outerIsPositive = positiveArea >= negativeArea

  // Separate outers from holes
  const outers: SubpathInfo[] = []
  const holes: SubpathInfo[] = []

  for (const info of infos) {
    if (info.area > 0 === outerIsPositive) {
      outers.push(info)
    } else {
      holes.push(info)
    }
  }

  // If no outers detected, treat everything as outer
  if (outers.length === 0) {
    return infos.map((info) => ({ outer: info.points, holes: [] }))
  }

  // Build groups, sorted by area descending (smallest outer first for assignment)
  const groups: FillGroup[] = outers.map((o) => ({
    outer: o.points,
    holes: [],
  }))

  // Assign each hole to the smallest outer whose bbox fully contains it
  for (const hole of holes) {
    let bestIdx = -1
    let bestArea = Infinity

    for (let g = 0; g < outers.length; g++) {
      const outer = assertDefined(outers[g])
      if (
        bboxContains(outer.bbox, hole.bbox) &&
        Math.abs(outer.area) < bestArea
      ) {
        bestArea = Math.abs(outer.area)
        bestIdx = g
      }
    }

    if (bestIdx >= 0) {
      assertDefined(groups[bestIdx]).holes.push(hole.points)
    }
    // Holes with no enclosing outer are dropped (not rendered)
  }

  return groups
}

function computeBBox(points: ReadonlyArray<{ x: number; y: number }>): BBox {
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (const p of points) {
    if (p.x < minX) minX = p.x
    if (p.y < minY) minY = p.y
    if (p.x > maxX) maxX = p.x
    if (p.y > maxY) maxY = p.y
  }
  return { minX, minY, maxX, maxY }
}

function bboxContains(outer: BBox, inner: BBox): boolean {
  return (
    inner.minX >= outer.minX &&
    inner.minY >= outer.minY &&
    inner.maxX <= outer.maxX &&
    inner.maxY <= outer.maxY
  )
}

/** Signed area × 2 of a polygon (positive = CW in screen coords). */
export function signedArea2(
  points: ReadonlyArray<{ x: number; y: number }>,
): number {
  let sum = 0
  for (let i = 0, len = points.length; i < len; i++) {
    const a = assertDefined(points[i])
    const b = assertDefined(points[(i + 1) % len])
    sum += (b.x - a.x) * (b.y + a.y)
  }
  return sum
}

// ---------------------------------------------------------------------------
// Arc conversion: SVG endpoint → center parameterization
// ---------------------------------------------------------------------------

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

const EPSILON_SQ = 0.01 // squared distance threshold for deduplication

/**
 * Remove consecutive near-duplicate points that confuse earcut.
 * Also strips a duplicate closing vertex (last ≈ first).
 */
export function deduplicatePoints<T extends { x: number; y: number }>(
  points: T[],
): T[] {
  if (points.length < 2) return points

  const result: T[] = [assertDefined(points[0])]

  for (let i = 1; i < points.length; i++) {
    const prev = assertDefined(result[result.length - 1])
    const curr = assertDefined(points[i])
    const dx = curr.x - prev.x
    const dy = curr.y - prev.y
    if (dx * dx + dy * dy > EPSILON_SQ) {
      result.push(curr)
    }
  }

  // Remove closing duplicate (last ≈ first)
  if (result.length > 2) {
    const first = assertDefined(result[0])
    const last = assertDefined(result[result.length - 1])
    const dx = last.x - first.x
    const dy = last.y - first.y
    if (dx * dx + dy * dy <= EPSILON_SQ) {
      result.pop()
    }
  }

  return result
}

export function splitSubpaths(commands: PathCommand[]): PathCommand[][] {
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

/**
 * Draw line join decorations at vertices.
 * Handles round (circles) and bevel (triangles) joins.
 */
function drawLineJoins(
  graphics: Phaser.GameObjects.Graphics,
  points: ReadonlyArray<Point2D>,
  closed: boolean,
  style: SVGStyle,
  strokeAlpha: number,
): void {
  if (style.stroke === null || style.strokeWidth < 2) return

  const decorations = getLineJoinDecorations(points, closed, style)
  if (decorations.length === 0) return

  graphics.fillStyle(style.stroke, strokeAlpha)

  for (const op of decorations) {
    if (op.kind === "circle") {
      graphics.fillCircle(op.x, op.y, op.radius)
      continue
    }

    fillPolygon(graphics, op.points)
  }
}

function getLineJoinDecorations(
  points: ReadonlyArray<Point2D>,
  closed: boolean,
  style: SVGStyle,
): ReadonlyArray<JoinDecorationOp> {
  let byStyle = LINE_JOIN_DECORATION_CACHE.get(points)
  if (!byStyle) {
    byStyle = new Map<string, ReadonlyArray<JoinDecorationOp>>()
    LINE_JOIN_DECORATION_CACHE.set(points, byStyle)
  }

  const key = lineJoinDecorationKey(closed, style)
  const cached = byStyle.get(key)
  if (cached) {
    return cached
  }

  const n = points.length
  const hw = style.strokeWidth / 2
  const ops: JoinDecorationOp[] = []

  // Join decorations at interior vertices (all vertices for closed paths).
  if (n >= 3) {
    const start = closed ? 0 : 1
    const end = closed ? n : n - 1

    for (let i = start; i < end; i++) {
      const prev = assertDefined(points[(i - 1 + n) % n])
      const curr = assertDefined(points[i])
      const next = assertDefined(points[(i + 1) % n])

      if (style.lineJoin === "round") {
        ops.push({ kind: "circle", x: curr.x, y: curr.y, radius: hw })
      } else if (style.lineJoin === "bevel") {
        const bevel = computeBevelJoin(prev, curr, next, hw)
        if (bevel) {
          ops.push({
            kind: "polygon",
            points: [curr, bevel[0], bevel[1]],
          })
        }
      } else {
        const result = computeMiterJoin(prev, curr, next, hw, style.miterLimit)
        if (result) {
          const pointsForOp = result.miter
            ? [curr, result.bevel[0], result.miter, result.bevel[1]]
            : [curr, result.bevel[0], result.bevel[1]]
          ops.push({ kind: "polygon", points: pointsForOp })
        }
      }
    }
  }

  // Caps at endpoints (open paths only).
  if (!closed && n >= 2) {
    if (style.lineCap === "round") {
      const first = assertDefined(points[0])
      const last = assertDefined(points[n - 1])
      ops.push({ kind: "circle", x: first.x, y: first.y, radius: hw })
      ops.push({ kind: "circle", x: last.x, y: last.y, radius: hw })
    } else if (style.lineCap === "square") {
      const first = assertDefined(points[0])
      const second = assertDefined(points[1])
      const startCap = computeSquareCap(first, second, hw)
      if (startCap) {
        ops.push({ kind: "polygon", points: startCap })
      }

      const last = assertDefined(points[n - 1])
      const secondLast = assertDefined(points[n - 2])
      const endCap = computeSquareCap(last, secondLast, hw)
      if (endCap) {
        ops.push({ kind: "polygon", points: endCap })
      }
    }
  }

  byStyle.set(key, ops)
  return ops
}

function lineJoinDecorationKey(closed: boolean, style: SVGStyle): string {
  return [
    closed ? 1 : 0,
    style.strokeWidth,
    style.lineJoin,
    style.lineCap,
    style.miterLimit,
  ].join("|")
}

function fillPolygon(
  graphics: Phaser.GameObjects.Graphics,
  points: ReadonlyArray<Point2D>,
): void {
  if (points.length < 3) return

  graphics.beginPath()
  const start = assertDefined(points[0])
  graphics.moveTo(start.x, start.y)

  for (let i = 1; i < points.length; i++) {
    const point = assertDefined(points[i])
    graphics.lineTo(point.x, point.y)
  }

  graphics.closePath()
  graphics.fillPath()
}
