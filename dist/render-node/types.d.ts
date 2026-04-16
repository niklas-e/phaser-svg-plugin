/** Number of multisample MSAA samples. x4 is the default; x8 is opt-in. */
export type MsaaSamples = 4 | 8;
/** MSAA options accepted by all SVG draw and plugin APIs. */
export interface MsaaOptions {
    /**
     * Number of MSAA samples to use for anti-aliasing SVG rendering.
     * - `4` (default): 4x MSAA — good quality with moderate GPU cost.
     * - `8`: 8x MSAA — higher quality; automatically downgrades to x4 when
     *   the device or memory budget does not support x8.
     */
    msaaSamples?: MsaaSamples | undefined;
}
/** Active MSAA rendering backend. WebGL2 is the only supported backend. */
export type MsaaBackend = "webgl2";
/**
 * Duck-typed wrapper that satisfies Phaser's framebuffer binding mechanism.
 * Phaser reads `wrapper.webGLFramebuffer` when binding a framebuffer via the
 * `WebGLGlobalWrapper.updateBindingsFramebuffer` path.
 */
export interface MsaaFBOWrapper {
    webGLFramebuffer: WebGLFramebuffer;
}
/**
 * Resolved capabilities for the active MSAA backend.
 * Returned by `detectMsaaCapabilities` and stored per-renderer.
 */
export interface MsaaCapabilities {
    backend: MsaaBackend;
    maxSamples: number;
}
//# sourceMappingURL=types.d.ts.map