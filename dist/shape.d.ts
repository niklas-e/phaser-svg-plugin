import type { SVGStyle } from "./types.ts";
export interface ConvertedShape {
    d: string;
    style: SVGStyle;
}
/**
 * Convert a supported SVG shape element to path data + resolved style.
 *
 * Supported now: path, rect, circle, ellipse, line, polyline, polygon
 */
export declare function convertShape(tagName: string, attrs: Record<string, string>): ConvertedShape | undefined;
//# sourceMappingURL=shape.d.ts.map