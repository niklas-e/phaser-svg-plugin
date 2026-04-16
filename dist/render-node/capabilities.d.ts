import type { MsaaBackend, MsaaCapabilities, MsaaSamples } from "./types.ts";
/** Phaser WebGLRenderer duck-type — only the fields we read. */
interface PhaserRendererForCaps {
    gl: WebGLRenderingContext;
    width: number;
    height: number;
}
/**
 * Detect the MSAA rendering backend available for the given Phaser renderer.
 *
 * Result is cached per renderer so capability detection only runs once.
 * Returns `null` when no MSAA backend is available.
 */
export declare function detectMsaaCapabilities(renderer: PhaserRendererForCaps): MsaaCapabilities | null;
/**
 * Negotiate the actual sample count to use given requested samples and capabilities.
 *
 * Negotiation rules (from the fixed plan decisions):
 * 1. x8 request → use x8 when device and memory support it.
 * 2. x8 request but unsupported or over budget → silently downgrade to x4.
 * 3. x4 request → use x4 when device and memory support it.
 * 4. x4 not available hardware-wise → throw with actionable message.
 * 5. x4 memory budget exceeded → throw with actionable message.
 */
export declare function negotiateSamples(requested: MsaaSamples, caps: MsaaCapabilities, rendererWidth: number, rendererHeight: number): MsaaSamples;
/**
 * Returns the backend key identifying a specific Phaser renderer + sample count
 * combination. Used as a WeakMap/Map cache key.
 */
export declare function backendKey(backend: MsaaBackend, samples: number): string;
/** Compute the approximate MSAA FBO memory in bytes for the given dimensions and sample count. */
export declare function computeMsaaMemoryBytes(width: number, height: number, samples: number): number;
export {};
//# sourceMappingURL=capabilities.d.ts.map