/** Absolute path command types produced by the parser. */
export type PathCommand = {
    type: "M";
    x: number;
    y: number;
} | {
    type: "L";
    x: number;
    y: number;
} | {
    type: "C";
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    x: number;
    y: number;
} | {
    type: "Q";
    x1: number;
    y1: number;
    x: number;
    y: number;
} | {
    type: "A";
    rx: number;
    ry: number;
    xAxisRotation: number;
    largeArc: boolean;
    sweep: boolean;
    x: number;
    y: number;
} | {
    type: "Z";
};
export interface SVGStyle {
    fill: number | null;
    fillAlpha: number;
    stroke: number | null;
    strokeAlpha: number;
    strokeWidth: number;
    lineJoin: "miter" | "round" | "bevel";
    lineCap: "butt" | "round" | "square";
    miterLimit: number;
    opacity: number;
}
export declare const DEFAULT_STYLE: SVGStyle;
export interface ViewBox {
    minX: number;
    minY: number;
    width: number;
    height: number;
}
//# sourceMappingURL=types.d.ts.map