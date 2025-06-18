import { useCallback, useEffect } from "react";

type Callback = () => void;

type Arrow = "left" | "right" | "up" | "down";

const keys = {
    up: "ArrowUp",
    down: "ArrowDown",
    left: "ArrowLeft",
    right: "ArrowRight",
} satisfies Record<Arrow, string>;

export const useArrowShortcut = (arrow: Arrow, callback: Callback) => {
    const handleKeyDown = useCallback((event: KeyboardEvent) => {
        if (event.ctrlKey || event.metaKey || event.shiftKey) return;
        if (event.key === keys[arrow]) {
            event.preventDefault();
            callback?.();
        }
    }, []);

    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [handleKeyDown]);
};
