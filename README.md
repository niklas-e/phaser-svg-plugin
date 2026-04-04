# phaser-svg

Render SVG `<path>` elements as native Phaser 4 Graphics draw calls.

Paths are parsed, styled and tessellated so they can be drawn directly on a
`Phaser.GameObjects.Graphics` object - no textures, no DOM nodes at runtime.

## Install

```bash
npm install phaser-svg phaser
```

## Usage

There are three ways to use phaser-svg, depending on when you want the SVG
parsing to happen.

### 1. Runtime parsing (simplest)

Parse and render an SVG string at runtime with `drawSVG()`:

```ts
import { drawSVG } from "phaser-svg"

class MyScene extends Phaser.Scene {
  create() {
    const graphics = this.add.graphics()
    drawSVG(graphics, `
      <svg viewBox="0 0 120 100">
        <path d="M 20,90 L 60,10 L 100,90 Z"
              fill="#00bcd4" stroke="white" stroke-width="2" />
      </svg>
    `)
  }
}
```

Or render a single path `d` attribute with `drawSVGPath()`:

```ts
import { drawSVGPath } from "phaser-svg"

drawSVGPath(graphics, "M 0 0 L 100 100", {
  fill: 0xff0000,
  stroke: 0xffffff,
  strokeWidth: 2,
})
```

### 2. Build-time compilation (recommended for production)

Pre-compile SVGs at build time so the browser only runs the renderer, skipping
all parsing and style resolution. This requires the Vite plugin.

**vite.config.ts**

```ts
import { defineConfig } from "vite"
import { phaserSVG } from "phaser-svg/vite"

export default defineConfig({
  plugins: [phaserSVG()],
})
```

**scene.ts**

```ts
import { drawCompiledSVG } from "phaser-svg"
import heart from "./heart.svg" // compiled at build time

class MyScene extends Phaser.Scene {
  create() {
    const graphics = this.add.graphics()
    drawCompiledSVG(graphics, heart)
  }
}
```

To get TypeScript types for `.svg` imports, add a reference in any `.d.ts` file
in your project (or in `tsconfig.json` types):

```ts
/// <reference types="phaser-svg/svg" />
```

You can still use Vite's `?raw` suffix to get the raw SVG string when needed:

```ts
import heartRaw from "./heart.svg?raw" // plain string
```

### 3. Scene plugin

Register the plugin in your game config to get `this.svg` on every scene:

```ts
import { SVGPlugin } from "phaser-svg"

const config: Phaser.Types.Core.GameConfig = {
  plugins: {
    scene: [
      { key: "SVGPlugin", plugin: SVGPlugin, mapping: "svg" },
    ],
  },
}
```

Then draw SVGs from any scene:

```ts
class MyScene extends Phaser.Scene {
  // Type declaration for the plugin mapping
  declare svg: SVGPlugin

  create() {
    const g = this.add.graphics()

    // Runtime parsing
    this.svg.draw(g, svgString)

    // Or pre-compiled
    this.svg.drawCompiled(g, compiledSvg)

    // Or a single path
    this.svg.drawPath(g, "M 0 0 L 100 100", { fill: 0xff0000 })
  }
}
```

Set default options for all draw calls in a scene:

```ts
this.svg.setDefaults({
  overrideFill: 0x00ff00,
  curveResolution: 64,
})
```

## API

### Drawing functions

| Function | Description |
| --- | --- |
| `drawSVG(graphics, svgString, options?)` | Parse and render a full SVG string |
| `drawSVGPath(graphics, d, style?, options?)` | Parse and render a single path `d` attribute |
| `drawCompiledSVG(graphics, compiled, options?)` | Render pre-compiled SVG data (no parsing) |

### Compilation

| Function | Description |
| --- | --- |
| `compileSVG(svgString)` | Compile an SVG string into pre-parsed path data. Works in Node.js (no DOM required). |

### Lower-level utilities

| Function | Description |
| --- | --- |
| `parsePath(d)` | Parse an SVG path `d` string into `PathCommand[]` |
| `renderPath(graphics, commands, style, options?)` | Render parsed commands onto a Graphics object |
| `resolveStyle(attrs)` | Convert SVG attribute map to `SVGStyle` |
| `parseColor(raw)` | Parse a CSS/SVG colour string to `{ color, alpha }` |

### Options

**`SVGPluginOptions`** extends `RenderOptions`:

| Property | Type | Description |
| --- | --- | --- |
| `curveResolution` | `number` | Points per curve for tessellation (default `32`) |
| `overrideFill` | `number` | Force fill colour for all paths |
| `overrideStroke` | `number` | Force stroke colour for all paths |

**`SVGStyle`** - resolved style for a single path:

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `fill` | `number \| null` | `0x000000` | Fill colour (`null` = none) |
| `fillAlpha` | `number` | `1` | Fill opacity |
| `stroke` | `number \| null` | `null` | Stroke colour (`null` = none) |
| `strokeAlpha` | `number` | `1` | Stroke opacity |
| `strokeWidth` | `number` | `1` | Stroke width in pixels |
| `lineJoin` | `"miter" \| "round" \| "bevel"` | `"miter"` | Line join style |
| `lineCap` | `"butt" \| "round" \| "square"` | `"butt"` | Line cap style |
| `miterLimit` | `number` | `4` | Miter limit ratio |
| `opacity` | `number` | `1` | Master opacity multiplier |

## Supported SVG features

### Path commands

`M` `L` `H` `V` `C` `S` `Q` `T` `A` `Z` - all absolute and relative variants.

### Presentation attributes

`fill` `fill-opacity` `stroke` `stroke-opacity` `stroke-width`
`stroke-linejoin` `stroke-linecap` `stroke-miterlimit` `opacity`

### Colour formats

`#rrggbb` `#rgb` `rgb(r,g,b)` `rgba(r,g,b,a)` named colours (`red`, `blue`, etc.) `none` `transparent`

## License

MIT
