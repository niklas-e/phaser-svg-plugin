# API Surface Status

This document tracks public exports and current stability expectations for alpha.

## Stable-ish (intended to be less volatile)

- compileSVG
- drawSVG
- drawCompiledSVG
- drawSVGPath
- SVGPlugin
- phaserSVG Vite plugin entrypoint

## Experimental (may change more frequently)

- drawSVGIfDirty
- drawSVGPathIfDirty
- drawCompiledSVGIfDirty
- markSVGDirty
- clearSVGDirtyState

## Advanced / lower-level exports

- renderPath
- parsePath
- convertShape
- resolveStyle
- parseColor

## Notes

- During alpha, breaking changes can still occur in minor releases.
- Any export movement or behavior changes should be reflected in changelog Breaking section.
