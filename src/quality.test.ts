import assert from "node:assert/strict"
import { describe, it } from "node:test"
import {
  applyCrispPathDetailThreshold,
  resolveCurveResolution,
} from "./quality.ts"

describe("resolveCurveResolution", () => {
  it("uses default resolution when not provided", () => {
    assert.equal(resolveCurveResolution(undefined), 32)
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
