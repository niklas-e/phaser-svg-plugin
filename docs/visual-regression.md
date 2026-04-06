# Visual Regression Strategy

This project renders vectors, so visual correctness is a release gate.

## Current baseline

- Fixture SVG compilation coverage is validated in tests via src/fixture-coverage.test.ts.
- Representative assets live in example/svg.

## Manual visual check (alpha)

1. Run npm run dev.
2. Inspect representative assets at multiple sizes (small icon, medium, large).
3. Validate fills, strokes, joins/caps, and transformed primitives.
4. Compare runtime draw and precompiled draw outputs.

## Future automation target

- Add screenshot-based tests.
- Fail CI on pixel-diff threshold breaches.
