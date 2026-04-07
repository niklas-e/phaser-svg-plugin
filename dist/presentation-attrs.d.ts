/** Keep only SVG presentation attributes that affect paint/style inheritance. */
export declare function filterPresentationAttrs(attrs: Record<string, string>): Record<string, string>;
/** Convert element attributes to a plain object map. */
export declare function attrsFromElement(el: Element): Record<string, string>;
/** Parse `key="value"` / `key='value'` attributes from raw tag text. */
export declare function parseAttributes(attrsStr: string): Record<string, string>;
//# sourceMappingURL=presentation-attrs.d.ts.map