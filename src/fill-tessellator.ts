import {
  type CombineCallback,
  GL_TRIANGLES,
  GLU_TESS,
  GluTesselator,
  WINDING,
} from "libtess-ts"
import type { Point2D } from "./line-join.ts"

type TessVertex = [number, number]

export function triangulateContours(
  contours: ReadonlyArray<ReadonlyArray<Point2D>>,
): number[] {
  if (contours.length === 0) {
    return []
  }

  const triangles: number[] = []
  let primitiveType = GL_TRIANGLES
  const tessellator = new GluTesselator()
  const combineCallback: CombineCallback = (
    coords: [number, number, number],
  ) => [coords[0], coords[1]]

  tessellator.gluTessNormal(0, 0, 1)

  tessellator.gluTessCallback(GLU_TESS.BEGIN, (type: number) => {
    primitiveType = type
  })
  tessellator.gluTessCallback(GLU_TESS.VERTEX, (data: unknown) => {
    const vertex = data as TessVertex
    if (primitiveType !== GL_TRIANGLES) {
      throw new Error(
        `phaser-svg fill tessellation emitted unsupported primitive ${primitiveType}`,
      )
    }

    triangles.push(vertex[0], vertex[1])
  })
  tessellator.gluTessCallback(GLU_TESS.COMBINE, combineCallback)
  tessellator.gluTessCallback(GLU_TESS.ERROR, (errorCode: number) => {
    throw new Error(
      `phaser-svg fill tessellation failed with GLU error ${errorCode}`,
    )
  })
  tessellator.gluTessProperty(GLU_TESS.WINDING_RULE, WINDING.NONZERO)

  tessellator.gluTessBeginPolygon()

  for (const contour of contours) {
    if (contour.length < 3) {
      continue
    }

    tessellator.gluTessBeginContour()
    for (const point of contour) {
      const vertex: TessVertex = [point.x, point.y]
      tessellator.gluTessVertex(vertex, vertex)
    }
    tessellator.gluTessEndContour()
  }

  tessellator.gluTessEndPolygon()
  return triangles
}
