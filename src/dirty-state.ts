const lastStateByTarget = new WeakMap<object, string>()
const forcedDirtyTargets = new WeakSet<object>()

/**
 * Return true when a target should redraw for the provided state key.
 *
 * A target is considered dirty when:
 * - it has been explicitly marked dirty, or
 * - the state key differs from the last committed key.
 */
export function isDirtyForState(target: object, stateKey: string): boolean {
  if (forcedDirtyTargets.has(target)) {
    return true
  }

  return lastStateByTarget.get(target) !== stateKey
}

/**
 * Return true when the target has a previously committed draw state.
 */
export function hasCommittedDirtyState(target: object): boolean {
  return lastStateByTarget.has(target)
}

/**
 * Commit the current draw state after a successful render.
 */
export function commitDirtyState(target: object, stateKey: string): void {
  lastStateByTarget.set(target, stateKey)
  forcedDirtyTargets.delete(target)
}

/**
 * Force the next dirty-aware draw call to render.
 */
export function markDirtyState(target: object): void {
  forcedDirtyTargets.add(target)
}

/**
 * Remove any remembered dirty state for the target.
 */
export function clearDirtyState(target: object): void {
  lastStateByTarget.delete(target)
  forcedDirtyTargets.delete(target)
}
