"use client";

import {
    createContext,
    Fragment,
    use,
    useCallback,
    useEffect,
    useState,
} from "react";

type Props<T extends Record<string, React.FC>> = {
    steps: T;
    initialStep: keyof T;
    onBackwardImpossible?: () => void;
    onChangeStep?: (step: keyof T) => void;
    onFinish?: (props: {
        back: () => void;
        navigateTo: (step: keyof T) => void;
    }) => void;
};

export const MultiStep = <T extends Record<string, React.FC>>(
    props: Props<T>,
) => {
    const [history, setHistory] = useState<(keyof T)[]>([props.initialStep]);

    useEffect(() => {
        const lastStep = history.at(-1);
        if (!lastStep) return;
        props.onChangeStep?.(lastStep as keyof T);
    }, [history]);

    const navigateTo = useCallback(
        (step: keyof T) => {
            const steps = props.steps;

            if (!step || !steps[step]) {
                console.warn(`Step "${String(step)}" not found`);
                return;
            }

            setHistory((history) => [...history, step]);
        },
        [props.steps],
    );

    const back = useCallback(() => {
        if (history.length === 1) return props.onBackwardImpossible?.();
        setHistory((history) => history.slice(0, -1));
    }, [history, props.onBackwardImpossible]);

    const finish = useCallback(() => {
        props.onFinish?.({
            back,
            navigateTo,
        });
    }, [props.onFinish, navigateTo, back]);

    const lastHistoryItem = history.at(-1);
    const LastHistoryItemComponent = lastHistoryItem
        ? props.steps[lastHistoryItem]
        : () => null;
    const Component = !lastHistoryItem ? (
        <Fragment />
    ) : (
        <LastHistoryItemComponent />
    );

    return (
        <MultiStepContext.Provider value={{ finish, navigateTo, back }}>
            {Component}
        </MultiStepContext.Provider>
    );
};

export const useMultiStep = <T extends string>() => {
    const { navigateTo, ...props } = use(MultiStepContext);

    return {
        ...props,
        navigateTo: navigateTo as (step: T) => void,
    };
};

const MultiStepContext = createContext<{
    back: () => void;
    finish: () => void;
    navigateTo: (step: string) => void;
}>({
    back: () => {},
    finish: () => {},
    navigateTo: () => {},
});
