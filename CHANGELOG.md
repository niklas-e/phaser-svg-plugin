# Changelog

All notable changes to this project will be documented in this file.

This project is currently in alpha. During alpha, semver patch releases are intended to be non-breaking, while semver minor releases may include breaking changes.

## [Unreleased]

### Added

### Changed
- Default `msaaSamples` for draw/plugin/scene-batch flows is now `2` (was `4`).
- `MsaaSamples` now accepts `2 | 4 | 8`, and capability negotiation now supports explicit `x2` requests.

### Fixed

### Deprecated

### Removed

### Breaking

## [0.1.0] - 2026-04-06

### Added
- Initial alpha release.
- Runtime and precompiled SVG drawing support.
- Vite plugin for build-time SVG compilation.

### Breaking
- Alpha baseline; future minor releases may contain breaking changes.
