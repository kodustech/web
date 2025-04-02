import { useEffect, useLayoutEffect, useRef } from "react";

export function useTimeout(
    callback: () => void,
    delay: number | undefined,
    deps: unknown[] = [],
) {
    const savedCallback = useRef(callback);

    // Remember the latest callback if it changes.
    useLayoutEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    // Set up the timeout.
    useEffect(() => {
        const id = setTimeout(() => savedCallback.current(), delay ?? 0);
        return () => clearTimeout(id);
    }, [delay, ...deps]);
}
