/** True when element is inside a non-renderable SVG definition container. */
export declare function isInsideNonRenderableContainer(el: Element): boolean;
/**
 * Remove non-renderable definition containers from SVG markup so regex-based
 * shape extraction does not pick up helper geometry (clip paths, defs, etc.).
 */
export declare function stripNonRenderableSections(svgString: string): string;
//# sourceMappingURL=svg-structure.d.ts.map