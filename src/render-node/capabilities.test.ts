import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { computeMsaaMemoryBytes, negotiateSamples } from "./capabilities.ts"
import type { MsaaCapabilities } from "./types.ts"

// ---------------------------------------------------------------------------
// computeMsaaMemoryBytes
// ---------------------------------------------------------------------------

describe("computeMsaaMemoryBytes", () => {
  it("returns correct byte count for 1920x1080 x2", () => {
    assert.equal(computeMsaaMemoryBytes(1920, 1080, 2), 1920 * 1080 * 4 * 2)
  })

  it("returns correct byte count for 1920x1080 x4", () => {
    assert.equal(computeMsaaMemoryBytes(1920, 1080, 4), 1920 * 1080 * 4 * 4)
  })

  it("returns correct byte count for 1920x1080 x8", () => {
    assert.equal(computeMsaaMemoryBytes(1920, 1080, 8), 1920 * 1080 * 4 * 8)
  })

  it("scales with resolution", () => {
    assert.equal(computeMsaaMemoryBytes(100, 100, 4), 100 * 100 * 4 * 4)
  })
})

// ---------------------------------------------------------------------------
// negotiateSamples
// ---------------------------------------------------------------------------

function makeCaps(maxSamples: number): MsaaCapabilities {
  return { backend: "webgl2", maxSamples }
}

describe("negotiateSamples — x8 path", () => {
  it("returns 8 when x8 is supported and under budget", () => {
    // 100x100 x8 = 320000 bytes — well under 96 MiB
    const result = negotiateSamples(8, makeCaps(8), 100, 100)
    assert.equal(result, 8)
  })

  it("silently downgrades to 4 when hardware max is 4", () => {
    const result = negotiateSamples(8, makeCaps(4), 100, 100)
    assert.equal(result, 4)
  })

  it("silently downgrades to 4 when x8 exceeds memory budget", () => {
    // 7000x7000 x8 = 7000*7000*4*8 = 1568000000 bytes ≫ 96 MiB
    // x4 = 784000000 bytes > 96 MiB → should throw on x4 check
    assert.throws(() => negotiateSamples(8, makeCaps(8), 7000, 7000), /96 MiB/)
  })
})

describe("negotiateSamples — x2 path", () => {
  it("returns 2 when x2 is supported and under budget", () => {
    const result = negotiateSamples(2, makeCaps(8), 100, 100)
    assert.equal(result, 2)
  })

  it("throws a descriptive error when hardware max is below 2", () => {
    assert.throws(
      () => negotiateSamples(2, makeCaps(0), 100, 100),
      /less than the minimum required 2/,
    )
  })

  it("throws a descriptive error when x2 FBO exceeds 96 MiB memory budget", () => {
    assert.throws(() => negotiateSamples(2, makeCaps(8), 5000, 5000), /96 MiB/)
  })
})

describe("negotiateSamples — x4 path", () => {
  it("returns 4 when x4 is supported and under budget", () => {
    const result = negotiateSamples(4, makeCaps(4), 100, 100)
    assert.equal(result, 4)
  })

  it("throws a descriptive error when hardware max is below 4", () => {
    assert.throws(
      () => negotiateSamples(4, makeCaps(2), 100, 100),
      /less than the minimum required 4/,
    )
  })

  it("throws a descriptive error when x4 FBO exceeds 96 MiB memory budget", () => {
    // 5000x5000 x4 = 5000*5000*4*4 = 400000000 bytes ≈ 381 MiB > 96 MiB
    assert.throws(() => negotiateSamples(4, makeCaps(8), 5000, 5000), /96 MiB/)
  })

  it("error message includes actionable next steps", () => {
    let msg = ""
    try {
      negotiateSamples(4, makeCaps(8), 5000, 5000)
    } catch (e) {
      msg = (e as Error).message
    }
    assert.match(msg, /lower the game canvas size/)
  })
})

describe("negotiateSamples — deterministic for all combos", () => {
  const targets: [number, number][] = [
    [100, 100],
    [200, 200],
    [800, 600],
  ]
  for (const [w, h] of targets) {
    it(`x2 with caps(8) at ${w}x${h} always returns 2`, () => {
      assert.equal(negotiateSamples(2, makeCaps(8), w, h), 2)
    })
    it(`x4 with caps(4) at ${w}x${h} always returns 4`, () => {
      assert.equal(negotiateSamples(4, makeCaps(4), w, h), 4)
    })
    it(`x8 with caps(8) at ${w}x${h} always returns 8`, () => {
      assert.equal(negotiateSamples(8, makeCaps(8), w, h), 8)
    })
    it(`x8 with caps(4) at ${w}x${h} always returns 4`, () => {
      assert.equal(negotiateSamples(8, makeCaps(4), w, h), 4)
    })
  }

  describe("negotiateSamples — x2 unavailable error message", () => {
    it("includes WebGL2 and x2 guidance", () => {
      let msg = ""
      try {
        negotiateSamples(2, makeCaps(0), 100, 100)
      } catch (e) {
        msg = (e as Error).message
      }
      assert.match(msg, /WebGL2/)
      assert.match(msg, /x2/)
    })
  })
})

// ---------------------------------------------------------------------------
// Phase 3 — resilience: error message quality
// ---------------------------------------------------------------------------

describe("negotiateSamples — x4 unavailable error message", () => {
  it("includes device max samples in message", () => {
    let msg = ""
    try {
      negotiateSamples(4, makeCaps(2), 100, 100)
    } catch (e) {
      msg = (e as Error).message
    }
    assert.match(msg, /2/)
  })

  it("includes WebGL2 and x4 guidance", () => {
    let msg = ""
    try {
      negotiateSamples(4, makeCaps(0), 100, 100)
    } catch (e) {
      msg = (e as Error).message
    }
    assert.match(msg, /WebGL2/)
    assert.match(msg, /x4/)
  })
})

describe("negotiateSamples — memory budget error message", () => {
  it("includes the MiB estimate", () => {
    let msg = ""
    try {
      negotiateSamples(4, makeCaps(8), 5000, 5000)
    } catch (e) {
      msg = (e as Error).message
    }
    // Should mention something about 381 MiB (5000*5000*4*4 / 1024^2 ≈ 381)
    assert.match(msg, /MiB/)
  })

  it("includes target size in message", () => {
    let msg = ""
    try {
      negotiateSamples(4, makeCaps(8), 5000, 5000)
    } catch (e) {
      msg = (e as Error).message
    }
    assert.match(msg, /5000x5000/)
  })

  it("includes at least one actionable fix", () => {
    let msg = ""
    try {
      negotiateSamples(4, makeCaps(8), 5000, 5000)
    } catch (e) {
      msg = (e as Error).message
    }
    assert.ok(
      msg.includes("lower the game canvas size") || msg.includes("split"),
    )
  })
})
