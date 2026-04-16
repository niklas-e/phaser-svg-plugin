import type { MsaaBackend, MsaaCapabilities, MsaaFBOWrapper } from "./types.ts";
/** Phaser renderer duck-type — only what resource management needs. */
interface PhaserRendererForResources {
    gl: WebGLRenderingContext;
    createTextureFromSource(source: null, width: number, height: number, scaleMode: number): PhaserTextureWrapper | null;
    deleteTexture(texture: PhaserTextureWrapper): void;
}
/** Duck-typed Phaser WebGLTextureWrapper — only what we reference. */
interface PhaserTextureWrapper {
    webGLTexture: WebGLTexture | null;
}
/**
 * All GPU resources owned by a single MSAA render step.
 * One instance is created per Graphics object that uses MSAA.
 */
export declare class MsaaResources {
    readonly backend: MsaaBackend;
    /** Full-screen MSAA FBO (WebGL2 MSAA renderbuffer). */
    private msaaFBO;
    /** Thin wrapper recognised by Phaser's `glWrapper.updateBindingsFramebuffer`. */
    private _msaaFBOWrapper;
    /** Resolved (non-MSAA) texture — used by BatchHandlerQuadSingle to composite. */
    private _resolvedTexture;
    /** Separate FBO for the blit-resolve target texture. */
    private resolveFBO;
    /** Colour renderbuffer for WebGL2 path. */
    private colorRB;
    private _width;
    private _height;
    private _samples;
    constructor(backend: MsaaBackend);
    get width(): number;
    get height(): number;
    get samples(): number;
    get msaaFBOWrapper(): MsaaFBOWrapper;
    get resolvedTexture(): PhaserTextureWrapper;
    /**
     * Ensure GPU resources exist at the given size and sample count.
     * Creates resources on first call; rebuilds if size or sample count changed;
     * also rebuilds if the GL object has been invalidated (context loss recovery).
     */
    ensureResources(renderer: PhaserRendererForResources, caps: MsaaCapabilities, width: number, height: number, samples: number): void;
    /**
     * Explicitly release GL resources. Called on context loss or Graphics destroy.
     */
    destroy(renderer: PhaserRendererForResources): void;
    /**
     * Blit MSAA renderbuffer to the resolve FBO. Only called on the WebGL2 path.
     */
    blitResolve(gl2: WebGL2RenderingContext): void;
    private allocate;
    private destroyGL;
}
export {};
//# sourceMappingURL=resources.d.ts.map