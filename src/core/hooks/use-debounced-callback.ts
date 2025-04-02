import { useCallback, useRef } from "react";

/**
 * Returns a memoized function that will only call the passed function when it hasn't been called for the wait period
 * @param func The function to be called
 * @param wait Wait period after function hasn't been called for
 * @returns A memoized function that is debounced
 */
export const useDebouncedCallback = <T extends (...args: any) => unknown>(
    func: T,
    wait?: number,
) => {
    // Use a ref to store the timeout between renders
    // and prevent changes to it from causing re-renders
    const timeout = useRef<ReturnType<typeof setTimeout> | undefined>(
        undefined,
    );

    return useCallback(
        (...args: Parameters<T>) => {
            const later = () => {
                timeout.current && clearTimeout(timeout.current);
                func(...args);
            };

            if (timeout.current) clearTimeout(timeout.current);
            timeout.current = setTimeout(later, wait || 500);
        },
        [func, wait],
    );
};
