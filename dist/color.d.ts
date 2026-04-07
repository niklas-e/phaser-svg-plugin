export interface ParsedColor {
    color: number;
    alpha: number;
}
/**
 * Parse a CSS/SVG color string into a Phaser `0xRRGGBB` integer + alpha.
 * Supports: `#rgb`, `#rrggbb`, `rgb()`, `rgba()`, named colors.
 * Returns `null` for `"none"` or unrecognised values.
 */
export declare function parseColor(raw: string): ParsedColor | null;
//# sourceMappingURL=color.d.ts.map