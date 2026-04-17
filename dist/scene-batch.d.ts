import type { GameObjects } from "phaser";
import type { CompiledSVG } from "./compiler.ts";
import type { MsaaSamples } from "./render-node/types.ts";
import { type RenderOptions } from "./renderer.ts";
import type { SVGStyle } from "./types.ts";
export interface SceneBatchDrawOptions extends RenderOptions {
    overrideFill?: number | undefined;
    overrideStroke?: number | undefined;
    width?: number | undefined;
    height?: number | undefined;
    msaaSamples?: MsaaSamples | undefined;
    x?: number | undefined;
    y?: number | undefined;
}
export interface SceneBatchPathOptions extends RenderOptions {
    msaaSamples?: MsaaSamples | undefined;
    x?: number | undefined;
    y?: number | undefined;
}
export declare class SVGSceneBatch {
    private readonly scene;
    private readonly graphics;
    private readonly autoFlush;
    private readonly queue;
    constructor(scene: Phaser.Scene, options?: {
        graphics?: GameObjects.Graphics | undefined;
        autoFlush?: boolean | undefined;
    });
    get targetGraphics(): GameObjects.Graphics;
    queueCompiled(compiled: CompiledSVG, options?: SceneBatchDrawOptions | undefined): this;
    queueSVG(svgString: string, options?: SceneBatchDrawOptions | undefined): this;
    queuePath(d: string, style?: Partial<SVGStyle> | undefined, options?: SceneBatchPathOptions | undefined): this;
    flush: () => boolean;
    destroy: () => void;
}
//# sourceMappingURL=scene-batch.d.ts.map