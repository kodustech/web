import React from "react";

type Params = {
    onClick?: React.MouseEventHandler;
    onHold?: (event: React.MouseEvent<Element>, target: EventTarget) => void;
    onRelease?: () => void;
    ms: number;
};

export const useClickHold = (params: Params) => {
    // Event chain is as follows:
    // 1. onTouchStart
    // 2. onTouchEnd
    // 3. onMouseDown
    // 4. onMouseUp
    // 5. onClick
    // Since the event reaches to the onClick handler every time,
    // it is necessary to prevent the event to be handled for the
    // second time inside the onClick handler, after the long press
    // is handled. (An exception is, though, onTouchStart cuts the
    // chain --preventing the event to reach to the onClick
    // handler-- when it is triggered by long press.)
    const timer = React.useRef<number>(0);
    const handled = React.useRef(false);
    const lastCall = React.useRef<string | null>(null);
    const eventRef = React.useRef<React.MouseEvent | null>(null);
    const eventTargetRef = React.useRef<EventTarget | null>(null);

    function endure(event: any) {
        eventRef.current = event;
        eventTargetRef.current = event.currentTarget;
        timer.current = window.setTimeout(() => {
            if (lastCall.current !== "onTouchStart") handled.current = true;
            if (eventRef.current && eventTargetRef.current)
                params.onHold?.(eventRef.current, eventTargetRef.current);
        }, params.ms);
    }

    function surrender() {
        clearTimeout(timer.current);
        window.setTimeout(() => (handled.current = false), 100);
    }

    function onClick(event: any) {
        if (handled.current) {
            handled.current = false;
            event.preventDefault();
        } else {
            params.onClick?.(event);
        }
    }

    function onMouseDown(event: any) {
        lastCall.current = "onMouseDown";
        endure(event);
    }

    function onMouseUp() {
        lastCall.current = "onMouseUp";
        surrender();
        params.onRelease?.();
    }

    function onTouchStart(event: any) {
        lastCall.current = "onTouchStart";
        endure(event);
    }

    function onTouchEnd() {
        lastCall.current = "onTouchEnd";
        surrender();
    }

    return {
        onClick,
        onMouseDown,
        onMouseUp,
        onTouchStart,
        onTouchEnd,
    };
};
