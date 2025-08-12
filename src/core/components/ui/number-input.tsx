import { createContext, use, useRef } from "react";
import { useClickHold } from "@hooks/use-click-hold";
import { useControlled } from "@hooks/use-controlled";
import { useInterval } from "@hooks/use-interval";
import { MinusIcon, PlusIcon } from "lucide-react";
import { cn } from "src/core/utils/components";
import { clamp } from "src/core/utils/number";

import { Button } from "./button";
import { Input } from "./input";

const NumberInputContext = createContext<{
    min: number;
    max: number;
    value: number;
    step: number;
    size: "md" | "lg";
    readOnly?: boolean;
    defaultValue?: number;
    disabled?: boolean;
    onValueChange?: (value: number) => void;
}>({} as any);

const NumberInputRoot = ({
    children,
    disabled,
    max = Number.MAX_SAFE_INTEGER,
    min = Number.MIN_SAFE_INTEGER,
    onValueChange,
    readOnly,
    defaultValue,
    size = "lg",
    step = 1,
    value: _value,
    ...divProps
}: React.PropsWithChildren &
    Partial<React.ContextType<typeof NumberInputContext>> &
    React.ComponentProps<"div">) => {
    const [value, setValue] = useControlled({
        controlled: _value,
        default: defaultValue,
    });

    return (
        <div
            {...divProps}
            className={cn("flex items-center gap-2", divProps.className)}>
            <NumberInputContext
                value={{
                    step,
                    size,
                    min,
                    max,
                    value,
                    readOnly,
                    disabled,
                    onValueChange: (value) => {
                        const newValue = clamp(value, {
                            min,
                            max,
                        });

                        setValue(newValue);
                        onValueChange?.(newValue);
                    },
                }}>
                {children}
            </NumberInputContext>
        </div>
    );
};

const NumberInputDecrement = (props: React.PropsWithChildren) => {
    const context = use(NumberInputContext);
    const isHolding = useRef(false);
    const nextValue = context.value - context.step;
    const disabledByMinValue = nextValue < context.min;

    useInterval(() => {
        if (!isHolding.current) return;

        if (disabledByMinValue || context.disabled) {
            isHolding.current = false;
            return;
        }

        context.onValueChange?.(nextValue);
    }, 100);

    const clickHoldProps = useClickHold({
        ms: 400,
        onClick: () => context.onValueChange?.(nextValue),
        onHold: () => {
            isHolding.current = true;
        },
        onRelease: () => {
            isHolding.current = false;
        },
    });

    return (
        <Button
            variant="secondary"
            size={`icon-${context.size}`}
            disabled={context.disabled || disabledByMinValue}
            {...clickHoldProps}>
            {props.children ?? <MinusIcon />}
        </Button>
    );
};

const NumberInputInput = (
    props: Omit<React.ComponentProps<typeof Input>, "value" | "defaultValue">,
) => {
    const context = use(NumberInputContext);

    return (
        <Input
            maxLength={10}
            {...props}
            type="text"
            size={context.size}
            value={context.value}
            readOnly={context.readOnly}
            disabled={context.disabled}
            onFocus={(e) => {
                if (context.readOnly || context.disabled) return;

                // Browsers set selection at the start of the input field by default.
                // We want to set it at the end for the first focus.
                const target = e.currentTarget;
                const length = target.value.length;
                target.setSelectionRange(length, length);
                props.onFocus?.(e);
            }}
            onChange={(e) => {
                const numValue = parseInt(e.target.value.replace(/^0+/, ""));

                context.onValueChange?.(isNaN(numValue) ? 0 : numValue);
                props.onChange?.(e);
            }}
            className={cn(
                "min-w-32 flex-1 text-center",
                "[&::-webkit-inner-spin-button]:appearance-none",
                "[&::-webkit-outer-spin-button]:appearance-none",
                props.className,
            )}
        />
    );
};

const NumberInputIncrement = (props: React.PropsWithChildren) => {
    const context = use(NumberInputContext);
    const isHolding = useRef(false);
    const nextValue = context.value + context.step;
    const disabledByMaxValue = nextValue > context.max;

    useInterval(() => {
        if (!isHolding.current) return;

        if (disabledByMaxValue || context.disabled) {
            isHolding.current = false;
            return;
        }

        context.onValueChange?.(nextValue);
    }, 100);

    const clickHoldProps = useClickHold({
        ms: 400,
        onClick: () => context.onValueChange?.(nextValue),
        onHold: () => {
            isHolding.current = true;
        },
        onRelease: () => {
            isHolding.current = false;
        },
    });

    return (
        <Button
            variant="secondary"
            size={`icon-${context.size}`}
            disabled={context.disabled || disabledByMaxValue}
            {...clickHoldProps}>
            {props.children ?? <PlusIcon />}
        </Button>
    );
};

export const NumberInput = {
    Root: NumberInputRoot,
    Decrement: NumberInputDecrement,
    Input: NumberInputInput,
    Increment: NumberInputIncrement,
};
