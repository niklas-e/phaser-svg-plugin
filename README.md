# phaser-svg

> ⚠️ DISCLAIMER: this plugin is currently in [alpha phase](#alpha-status)

Render SVG elements as native Phaser 4 Graphics draw calls.

Paths are parsed, styled and tessellated so they can be drawn directly on a
`Phaser.GameObjects.Graphics` object - no textures, no DOM nodes at runtime.

Draw calls are also dirty-aware by default: repeated calls with unchanged
source/options on the same `Graphics` object are skipped automatically.

## Alpha status

This package is currently in alpha.

- It may contain bugs and edge-case rendering issues.
- Frequent breaking changes are expected while the API is still being refined.
- Breaking changes will be published as semver **minor** updates.
- Semver **patch** updates are intended to remain non-breaking.

## Release policy

While this project is in alpha, versioning is intentionally pragmatic:

- **Patch** (`x.y.Z`) is for bug fixes and non-breaking improvements.
- **Minor** (`x.Y.z`) may include breaking API, behavior, or output changes.
- Breaking changes are documented in [CHANGELOG.md](CHANGELOG.md).
- When possible, migration notes are included for minor releases.

Release preparation docs:

- Checklist: [docs/release/alpha-release-checklist.md](docs/release/alpha-release-checklist.md)
- Migration notes template: [docs/release/migration-notes-template.md](docs/release/migration-notes-template.md)
- Compatibility matrix: [docs/compatibility-matrix.md](docs/compatibility-matrix.md)
- API stability map: [docs/api-surface.md](docs/api-surface.md)
- Visual regression strategy: [docs/visual-regression.md](docs/visual-regression.md)
- Performance baseline log: [docs/performance-baseline.md](docs/performance-baseline.md)

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

For repeated updates, regular draw calls already skip unchanged redraws:

```ts
import { drawCompiledSVG, markSVGDirty } from "phaser-svg"
import heart from "./heart.svg"

class MyScene extends Phaser.Scene {
  private pulse = 0

  create() {
    const graphics = this.add.graphics()

    // First draw always renders.
    drawCompiledSVG(graphics, heart, { width: 96, height: 96 })

    this.events.on("update", () => {
      // Redraw only when your visual state actually changed.
      const nextPulse = Math.floor(this.time.now / 250)
      if (nextPulse !== this.pulse) {
        this.pulse = nextPulse

        graphics.clear()
        markSVGDirty(graphics) // clear() happened outside plugin; mark dirty

        drawCompiledSVG(graphics, heart, {
          width: 96,
          height: 96,
          overrideFill: this.pulse % 2 === 0 ? 0xffcc00 : 0xff7a00,
        })
      }
    })
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
| `drawSVG(graphics, svgString, options?)` | Parse and render a full SVG string (auto-skips unchanged redraws) |
| `drawSVGIfDirty(graphics, svgString, options?)` | Boolean-return alias of `drawSVG`; returns `true` if rendered |
| `drawSVGPath(graphics, d, style?, options?)` | Parse and render a single path `d` attribute (auto-skips unchanged redraws) |
| `drawSVGPathIfDirty(graphics, d, style?, options?)` | Boolean-return alias of `drawSVGPath`; returns `true` if rendered |
| `drawCompiledSVG(graphics, compiled, options?)` | Render pre-compiled SVG data (auto-skips unchanged redraws) |
| `drawCompiledSVGIfDirty(graphics, compiled, options?)` | Boolean-return alias of `drawCompiledSVG`; returns `true` if rendered |
| `markSVGDirty(graphics)` | Force the next dirty-aware draw call to render |
| `clearSVGDirtyState(graphics)` | Clear remembered dirty state for a Graphics object |

### Compilation

| Function | Description |
| --- | --- |
| `compileSVG(svgString)` | Compile an SVG string into pre-parsed draw data. Works in Node.js (no DOM required). |

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
| `overrideFill` | `number` | Force fill colour for all shapes |
| `overrideStroke` | `number` | Force stroke colour for all shapes |

For small UI icons, the plugin automatically disables Phaser Graphics path
simplification for plugin draw calls to preserve detail.

Dirty redraw skipping is enabled by default. It only skips redraws when inputs
are unchanged, and it does not detect external mutations automatically. If you call
`graphics.clear()` (or otherwise mutate the Graphics outside plugin draw calls),
call `markSVGDirty(graphics)` before your next dirty-aware draw.

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
