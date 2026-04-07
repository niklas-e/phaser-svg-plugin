/**
 * Return true when a target should redraw for the provided state key.
 *
 * A target is considered dirty when:
 * - it has been explicitly marked dirty, or
 * - the state key differs from the last committed key.
 */
export declare function isDirtyForState(target: object, stateKey: string): boolean;
/**
 * Return true when the target has a previously committed draw state.
 */
export declare function hasCommittedDirtyState(target: object): boolean;
/**
 * Commit the current draw state after a successful render.
 */
export declare function commitDirtyState(target: object, stateKey: string): void;
/**
 * Force the next dirty-aware draw call to render.
 */
export declare function markDirtyState(target: object): void;
/**
 * Remove any remembered dirty state for the target.
 */
export declare function clearDirtyState(target: object): void;
//# sourceMappingURL=dirty-state.d.ts.map