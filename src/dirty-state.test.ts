import assert from "node:assert/strict"
import { describe, it } from "node:test"
import {
  clearDirtyState,
  commitDirtyState,
  hasCommittedDirtyState,
  isDirtyForState,
  markDirtyState,
} from "./dirty-state.ts"

describe("dirty-state", () => {
  it("is dirty before first commit", () => {
    const target = {}
    assert.equal(isDirtyForState(target, "state:a"), true)
  })

  it("is not dirty after committing same state", () => {
    const target = {}
    commitDirtyState(target, "state:a")
    assert.equal(isDirtyForState(target, "state:a"), false)
  })

  it("is dirty when state key changes", () => {
    const target = {}
    commitDirtyState(target, "state:a")
    assert.equal(isDirtyForState(target, "state:b"), true)
  })

  it("markDirtyState forces a redraw", () => {
    const target = {}
    commitDirtyState(target, "state:a")
    markDirtyState(target)
    assert.equal(isDirtyForState(target, "state:a"), true)
  })

  it("commit clears forced dirty flag", () => {
    const target = {}
    commitDirtyState(target, "state:a")
    markDirtyState(target)
    assert.equal(isDirtyForState(target, "state:a"), true)

    commitDirtyState(target, "state:a")
    assert.equal(isDirtyForState(target, "state:a"), false)
  })

  it("clearDirtyState resets to unknown state", () => {
    const target = {}
    commitDirtyState(target, "state:a")
    clearDirtyState(target)
    assert.equal(isDirtyForState(target, "state:a"), true)
  })

  it("reports committed state presence", () => {
    const target = {}
    assert.equal(hasCommittedDirtyState(target), false)

    commitDirtyState(target, "state:a")
    assert.equal(hasCommittedDirtyState(target), true)

    clearDirtyState(target)
    assert.equal(hasCommittedDirtyState(target), false)
  })
})
