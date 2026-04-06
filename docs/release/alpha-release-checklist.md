# Alpha Release Checklist

Use this checklist for every alpha release.

## 1. Versioning and changelog

- [ ] Bump version in package.json.
- [ ] Update [CHANGELOG.md](../../CHANGELOG.md) in Unreleased and release sections.
- [ ] Add a Breaking section for any minor release with behavior/API/output changes.

## 2. Quality gates

- [ ] Run typecheck: npm run typecheck
- [ ] Run tests: npm test
- [ ] Run build: npm run build
- [ ] Run lint/format check: npm run check

## 3. Package audit

- [ ] Run package check: npm run pack:check
- [ ] Confirm tarball only includes intended files.

## 4. Compatibility and docs

- [ ] Confirm matrix in [docs/compatibility-matrix.md](../compatibility-matrix.md) is still accurate.
- [ ] Update API stability map in [docs/api-surface.md](../api-surface.md) if exports changed.
- [ ] Add migration notes when releasing a minor version.

## 5. Regression and performance checks

- [ ] Run fixture coverage tests (included in npm test).
- [ ] Review vector rendering outputs for representative assets.
- [ ] Record baseline metrics in [docs/performance-baseline.md](../performance-baseline.md).

## 6. Publish

- [ ] Create git tag for version.
- [ ] Publish package.
- [ ] Announce release notes and migration highlights.
