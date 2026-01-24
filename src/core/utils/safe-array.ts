/**
 * Safely ensures a value is an array.
 * Returns empty array if value is null, undefined, or not an array.
 *
 * @example
 * const { data } = useFetch<Item[]>('/api/items');
 * const items = safeArray(data).filter(item => item.active);
 */
export function safeArray<T>(value: T[] | null | undefined | unknown): T[] {
    if (Array.isArray(value)) {
        return value;
    }
    return [];
}
