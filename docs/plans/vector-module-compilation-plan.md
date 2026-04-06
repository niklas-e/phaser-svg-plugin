# Phaser Vector Module Compilation Plan

Status: Future plan
Date: 2026-04-06

## Goal
Add an optional build-time output mode that compiles SVG assets into Phaser-native vector draw modules.

This mode should preserve the plugin's crisp vector rendering focus while reducing runtime interpretation overhead.

## Motivation
Current build-time compilation already outputs pre-parsed data and removes SVG parsing at runtime.

A generated module mode could go further by exporting executable draw logic and precomputed vector topology, so repeated draws spend less CPU and allocate less memory.

## Scope
1. Keep current data mode unchanged and backward compatible.
2. Add a new opt-in module output mode in the Vite plugin.
3. Generate vector draw modules, not raster textures.
4. Preserve current rendering fidelity and crisp defaults.

## Non-Goals
1. Replacing the current compileSVG data mode.
2. Introducing raster-first rendering paths.
3. Supporting every possible SVG feature in v1 of module mode.

## Proposed Design
### 1. Vite Plugin API
Add an output selection API to phaserSVG.

Possible options:
- mode: "data" | "module"
- moduleQuery: "?phaser-module"

Both import styles can coexist so teams can choose per asset.

### 2. Generated Module Shape
Each compiled SVG module should export:
1. draw(graphics, options): void
2. viewBox metadata
3. optional static metadata such as complexity or source hash

The draw function should call shared runtime helpers where useful and avoid unnecessary object churn.

### 3. Build-Time Precomputation
Perform more work during compilation:
1. Shape conversion and style resolution.
2. Transform flattening where possible.
3. Fill grouping and hole bridge planning for complex paths.
4. Optional precomputed tessellation tiers keyed by quality level.

### 4. Runtime Behavior
1. Keep width and height scaling behavior aligned with drawCompiledSVG.
2. Keep overrideFill and overrideStroke support.
3. Keep crisp path settings behavior consistent with existing plugin calls.
4. Reuse cache-aware renderer internals where possible.

## Implementation Phases
### Phase 1: RFC and API contract
1. Finalize mode naming and import style.
2. Decide generated module export contract.
3. Define compatibility guarantees.

### Phase 2: Code generation MVP
1. Add module generation pipeline to vite-plugin.
2. Generate draw functions for common primitives and path items.
3. Keep fallback to current data mode for unsupported cases.

### Phase 3: Topology and quality optimization
1. Emit precomputed fill topology artifacts.
2. Add optional tessellation tiers for scale-aware quality.
3. Benchmark CPU and allocation improvements on repeated draws.

### Phase 4: Validation and rollout
1. Add visual parity tests against current pipeline.
2. Add build snapshots for generated module stability.
3. Document migration and usage examples.

## Risks and Mitigations
1. Risk: Larger JS bundles for very complex SVGs.
Mitigation: Keep data mode default and make module mode opt-in.

2. Risk: Hard-to-debug generated code.
Mitigation: Emit readable modules in dev and compact output in build.

3. Risk: Fidelity regressions.
Mitigation: Add golden-image style regression tests across representative SVG assets.

## Open Questions
1. Should module mode be enabled via plugin option, import query, or both?
2. Should tessellation be fully precomputed, partially precomputed, or runtime adaptive?
3. Should generated modules expose low-level draw ops for custom pipelines?
4. Should unsupported SVG constructs fail hard or auto-fallback to data mode?

## Acceptance Criteria
1. Module mode is opt-in and does not break existing imports.
2. Visual output parity is maintained on existing example and test SVG assets.
3. Repeated draw performance is measurably better than current compiled-data path for static assets.
4. Documentation includes setup, caveats, and migration guidance.
