import type { GameObjects } from "phaser";
import type { SVGStyle } from "./types.ts";
export type NativeShape = {
    kind: "circle";
    cx: number;
    cy: number;
    r: number;
} | {
    kind: "ellipse";
    cx: number;
    cy: number;
    rx: number;
    ry: number;
};
export declare function parseNativeShape(tagName: string, attrs: Record<string, string>): NativeShape | undefined;
export declare function transformNativeShape(shape: NativeShape, scale: number, tx: number, ty: number): NativeShape;
export declare function drawNativeShape(graphics: GameObjects.Graphics, shape: NativeShape, style: SVGStyle): void;
//# sourceMappingURL=native-shape.d.ts.map