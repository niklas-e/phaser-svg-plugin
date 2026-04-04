/**
 * Assert that a value is neither `null` nor `undefined`.
 * Throws a descriptive error if the assertion fails.
 */
export function assertDefined<T>(
  value: T | null | undefined,
  message = "Expected value to be defined",
): T {
  if (value == null) {
    throw new Error(message)
  }
  return value
}
