import libtessImport from "libtess"
import type { Point2D } from "./line-join.ts"

type TessVertex = [number, number, number]

interface LibtessModule {
  GluTesselator: new () => {
    gluTessProperty(which: number, value: number): void
    gluTessCallback(
      which: number,
      callback: (...args: unknown[]) => unknown,
    ): void
    gluTessBeginPolygon(data: number[]): void
    gluTessBeginContour(): void
    gluTessVertex(coords: TessVertex, data: TessVertex): void
    gluTessEndContour(): void
    gluTessEndPolygon(): void
  }
  windingRule: {
    GLU_TESS_WINDING_NONZERO: number
  }
  primitiveType: {
    GL_TRIANGLES: number
  }
  gluEnum: {
    GLU_TESS_BEGIN: number
    GLU_TESS_VERTEX_DATA: number
    GLU_TESS_COMBINE: number
    GLU_TESS_ERROR: number
    GLU_TESS_WINDING_RULE: number
  }
}

const libtess = libtessImport as LibtessModule

export function triangulateContours(
  contours: ReadonlyArray<ReadonlyArray<Point2D>>,
): number[] {
  if (contours.length === 0) {
    return []
  }

  const triangles: number[] = []
  let primitiveType = libtess.primitiveType.GL_TRIANGLES
  const tessellator = new libtess.GluTesselator()

  tessellator.gluTessCallback(
    libtess.gluEnum.GLU_TESS_BEGIN,
    (...args: unknown[]) => {
      const type = args[0] as number
      primitiveType = type
    },
  )
  tessellator.gluTessCallback(
    libtess.gluEnum.GLU_TESS_VERTEX_DATA,
    (...args: unknown[]) => {
      const vertex = args[0] as TessVertex
      const output = args[1] as number[]
      if (primitiveType !== libtess.primitiveType.GL_TRIANGLES) {
        throw new Error(
          `phaser-svg fill tessellation emitted unsupported primitive ${primitiveType}`,
        )
      }

      output.push(vertex[0], vertex[1])
    },
  )
  tessellator.gluTessCallback(
    libtess.gluEnum.GLU_TESS_COMBINE,
    (...args: unknown[]) => {
      const coords = args[0] as ReadonlyArray<number>
      return [coords[0] ?? 0, coords[1] ?? 0, coords[2] ?? 0] as TessVertex
    },
  )
  tessellator.gluTessCallback(
    libtess.gluEnum.GLU_TESS_ERROR,
    (...args: unknown[]) => {
      const errorCode = args[0] as number
      throw new Error(
        `phaser-svg fill tessellation failed with GLU error ${errorCode}`,
      )
    },
  )
  tessellator.gluTessProperty(
    libtess.gluEnum.GLU_TESS_WINDING_RULE,
    libtess.windingRule.GLU_TESS_WINDING_NONZERO,
  )

  tessellator.gluTessBeginPolygon(triangles)

  for (const contour of contours) {
    if (contour.length < 3) {
      continue
    }

    tessellator.gluTessBeginContour()
    for (const point of contour) {
      const vertex: TessVertex = [point.x, point.y, 0]
      tessellator.gluTessVertex(vertex, vertex)
    }
    tessellator.gluTessEndContour()
  }

  tessellator.gluTessEndPolygon()
  return triangles
}
