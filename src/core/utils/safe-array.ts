/**
 * Safely ensures a value is an array.
 * Returns empty array if value is null, undefined, or not an array.
 *
 * @example
 * // Type is inferred from input
 * const items = safeArray(maybeItems).filter(item => item.active);
 *
 * // Explicit type when input is unknown
 * const items = safeArray<Item>(unknownValue);
 */
export function safeArray<T = unknown>(
    value: T[] | readonly T[] | null | undefined,
): T[] {
    if (Array.isArray(value)) {
        return value as T[];
    }
    return [];
}
