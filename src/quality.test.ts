import assert from "node:assert/strict"
import { describe, it } from "node:test"
import {
  applyCrispPathDetailThreshold,
  resolveCurveResolution,
  resolveCurveTolerance,
} from "./quality.ts"

describe("resolveCurveTolerance", () => {
  it("uses adaptive default tolerance when not provided", () => {
    assert.equal(resolveCurveTolerance(undefined), 0.125)
  })

  it("prefers explicit curveTolerance", () => {
    assert.equal(resolveCurveTolerance({ curveTolerance: 0.1 }), 0.1)
    assert.equal(resolveCurveTolerance({ curveTolerance: 0.5 }), 0.5)
  })
})

describe("resolveCurveResolution", () => {
  it("returns undefined when adaptive tessellation is active", () => {
    assert.equal(resolveCurveResolution(undefined), undefined)
  })

  it("prefers explicit curveResolution", () => {
    assert.equal(resolveCurveResolution({ curveResolution: 48 }), 48)
    assert.equal(resolveCurveResolution({ curveResolution: 12 }), 12)
  })
})

describe("applyCrispPathDetailThreshold", () => {
  it("sets pathDetailThreshold to 0 when simplification is enabled", () => {
    const config = { pathDetailThreshold: 1 }
    const changed = applyCrispPathDetailThreshold(config)

    assert.equal(changed, true)
    assert.equal(config.pathDetailThreshold, 0)
  })

  it("does not change threshold when already disabled", () => {
    const config = { pathDetailThreshold: 0 }
    const changed = applyCrispPathDetailThreshold(config)

    assert.equal(changed, false)
    assert.equal(config.pathDetailThreshold, 0)
  })

  it("handles missing or non-finite thresholds", () => {
    assert.equal(applyCrispPathDetailThreshold(undefined), false)
    assert.equal(applyCrispPathDetailThreshold({}), false)

    const config = { pathDetailThreshold: Number.NaN }
    const changed = applyCrispPathDetailThreshold(config)
    assert.equal(changed, false)
    assert.ok(Number.isNaN(config.pathDetailThreshold))
  })
})
