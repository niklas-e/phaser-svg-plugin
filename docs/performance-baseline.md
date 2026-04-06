# Performance Baseline

Track changes over time to detect regressions.

## What to measure

- First draw cost for runtime SVG parsing path.
- First draw cost for precompiled path.
- Repeated draw cost with unchanged state (dirty-skip path).
- Repeated draw cost with changed state (clear+redraw path).

## Suggested protocol

1. Use the same SVG fixtures for each run.
2. Measure on the same machine and browser when possible.
3. Record median across at least 30 iterations per case.
4. Include frame-time impact and memory trend if available.

## Baseline table

| Date | Version | Scenario | Median ms | Notes |
| --- | --- | --- | --- | --- |
| 2026-04-06 | 0.1.0 | runtime first draw | TBD | |
| 2026-04-06 | 0.1.0 | precompiled first draw | TBD | |
| 2026-04-06 | 0.1.0 | unchanged redraw skip | TBD | |
| 2026-04-06 | 0.1.0 | dirty redraw clear+draw | TBD | |
