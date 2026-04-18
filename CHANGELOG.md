# Changelog

All notable changes to this project will be documented in this file.

This project is currently in alpha. During alpha, semver patch releases are intended to be non-breaking, while semver minor releases may include breaking changes.

## [Unreleased]

### Added

### Changed

### Fixed

### Deprecated

### Removed

### Breaking

## [0.2.0] - 2026-04-18

### Added
- `SVGSceneBatch` now caches repeated `queueSVG` compilation and `queuePath`
	parsing inputs to reduce per-frame queue overhead.
- `SVGSceneBatch` now supports optional retained-mode dirty skipping via
	`{ retained: true }`, and exposes `markDirty()` to force the next redraw.

### Changed
- Default `msaaSamples` for draw/plugin/scene-batch flows is now `2` (was `4`).
- `MsaaSamples` now accepts `2 | 4 | 8`, and capability negotiation now supports explicit `x2` requests.
- Renderer triangle submission now coalesces repeated triangle writes for
	lower JS overhead on heavy fill/stroke workloads.
- Performance baseline guidance now includes 64-object immediate vs
	scene-batch scenarios for batching regression tracking.

## [0.1.0] - 2026-04-06

### Added
- Initial alpha release.
- Runtime and precompiled SVG drawing support.
- Vite plugin for build-time SVG compilation.

### Breaking
- Alpha baseline; future minor releases may contain breaking changes.
