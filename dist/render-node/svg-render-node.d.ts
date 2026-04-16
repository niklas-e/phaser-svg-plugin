import type { MsaaSamples } from "./types.ts";
interface PhaserRendererForStep {
    gl: WebGLRenderingContext;
    width: number;
    height: number;
    renderNodes: {
        finishBatch(): void;
        getNode(name: string): {
            batch(...args: unknown[]): void;
        };
    };
    createTextureFromSource(source: null, width: number, height: number, scaleMode: number): {
        webGLTexture: WebGLTexture | null;
    } | null;
    deleteTexture(texture: {
        webGLTexture: WebGLTexture | null;
    }): void;
}
/**
 * Attach an MSAA render step to the given Graphics object if not already attached,
 * or update the sample count if it changed.
 *
 * This is the main entry point called by the draw pipeline after every SVG draw.
 * Safe to call on every update — it is a no-op when the step is already installed
 * with the correct sample count.
 */
export declare function attachMsaaRenderStep(graphics: Phaser.GameObjects.Graphics, renderer: PhaserRendererForStep, requestedSamples: MsaaSamples): void;
export {};
//# sourceMappingURL=svg-render-node.d.ts.map