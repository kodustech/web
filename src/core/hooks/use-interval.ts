import { useEffect, useLayoutEffect, useRef } from "react";

export function useInterval(
    callback: () => void,
    delay: number | undefined,
    deps: unknown[] = [],
) {
    const savedCallback = useRef(callback);

    // Remember the latest callback if it changes.
    useLayoutEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    // Set up the interval.
    useEffect(() => {
        const id = setInterval(() => savedCallback.current(), delay ?? 0);
        return () => clearInterval(id);
    }, [delay, ...deps]);
}
