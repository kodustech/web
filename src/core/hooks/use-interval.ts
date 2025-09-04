import { useEffect, useLayoutEffect, useRef } from "react";

export function useInterval(
    callback: () => void,
    ms: number | undefined,
    deps: unknown[] = [],
) {
    const savedCallback = useRef(callback);

    // Remember the latest callback if it changes.
    useLayoutEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    // Set up the interval.
    useEffect(() => {
        const id = setInterval(() => savedCallback.current(), ms ?? 0);
        return () => clearInterval(id);
    }, [ms, ...deps]);
}
