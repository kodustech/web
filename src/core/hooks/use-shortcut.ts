import { useCallback, useEffect } from "react";

export const useShortcut = (
    key: string,
    callback: () => void,
    options?: {
        ctrl?: boolean;
        shift?: boolean;
    },
) => {
    const handleKeyDown = useCallback(
        (event: KeyboardEvent) => {
            if (event.metaKey) return;
            if (options?.ctrl && !event.ctrlKey) return;
            if (options?.shift && !event.shiftKey) return;
            if (event.key.toLowerCase() !== key.toLowerCase()) return;

            event.preventDefault();
            event.stopPropagation();
            callback?.();
        },
        [key, callback, options?.ctrl, options?.shift],
    );

    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [handleKeyDown]);
};
