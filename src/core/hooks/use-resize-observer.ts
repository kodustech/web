import { useEffect, useRef, useState } from "react";

type ObserverRect = Omit<DOMRectReadOnly, "toJSON">;

export default function useResizeObserver() {
    const ref = useRef<any>(null);
    const [rect, setRect] = useState<ObserverRect>({
        x: 0,
        y: 0,
        top: 0,
        left: 0,
        width: 0,
        right: 0,
        bottom: 0,
        height: 0,
    });

    useEffect(() => {
        const observer = new ResizeObserver(() => {
            if (ref.current) {
                const boundingRect = ref.current.getBoundingClientRect();
                setRect(boundingRect);
            }
        });

        observer.observe(ref.current);

        return () => observer.disconnect();
    }, [ref]);

    return [ref, rect] as const;
}
