import { forwardRef, useState } from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "src/core/utils/components";

const SliderWithMarkers = forwardRef<
    React.ComponentRef<typeof SliderPrimitive.Root>,
    Omit<
        React.ComponentProps<typeof SliderPrimitive.Root>,
        "value" | "defaultValue" | "onValueChange"
    > & {
        value: number | undefined;
        onValueChange: (value: number) => void;
        labels?: string[];
    }
>(({ className, labels, value = 0, onValueChange, ...props }, ref) => {
    const [innerInterval] = useState(props.step ?? 25);
    const numberOfMarks = Math.floor(props.max ?? 100 / innerInterval) + 1;
    const marks = Array.from(
        { length: numberOfMarks },
        (_, i) => i * innerInterval,
    );

    function tickIndex(value: number): number {
        // Calculate the index based on the value
        return Math.floor(value / innerInterval);
    }

    function calculateTickPercent(index: number): number {
        // Calculate the percentage from left of the slider's width
        const percent = ((index * innerInterval) / (props.max ?? 100)) * 100;
        return percent;
    }

    return (
        <SliderPrimitive.Root
            ref={ref}
            {...props}
            value={[value]}
            onValueChange={(v) => onValueChange?.(v.at(0)!)}
            className={cn(
                "group relative my-4 flex w-full flex-col items-center transition",
                "[--slider-marker-background-active:var(--color-primary-light)]",
                "slider-disabled:opacity-30",
                className,
            )}>
            <SliderPrimitive.Track
                className={cn(
                    "relative flex h-3 w-full items-center overflow-hidden rounded-full transition",
                    "bg-card-lv1",
                )}>
                <SliderPrimitive.Range
                    className={cn(
                        "absolute h-full transition",
                        "bg-(--slider-marker-background-active)",
                    )}
                />
            </SliderPrimitive.Track>

            <div className="absolute inset-x-2 top-1.5 flex items-center">
                {marks.map((mark, i) => {
                    const selectedValueIndex = tickIndex(value);
                    const leftPositionPercentage = calculateTickPercent(i);

                    return (
                        <div
                            key={mark}
                            role="presentation"
                            className={cn(
                                "absolute size-1.5 rounded-full shadow-sm",
                                {
                                    "bg-text-placeholder/20":
                                        i >= selectedValueIndex,
                                    "bg-card-lv2": i < selectedValueIndex,
                                },
                            )}
                            style={{
                                left: `${leftPositionPercentage}%`,
                                translate: `-${leftPositionPercentage}%`,
                            }}
                        />
                    );
                })}
            </div>

            <SliderPrimitive.Thumb
                className={cn(
                    "-mt-1.5 block size-6 rounded-full outline-hidden transition",

                    "shadow-[0px_4px_16px_rgba(17,17,26,0.75),_0px_8px_24px_rgba(17,17,26,0.75),_0px_16px_56px_rgba(17,17,26,0.75)]",

                    "bg-(--slider-marker-background-active)",
                    "slider-focused:ring-3 slider-focused:ring-(--slider-marker-background-active)/20",
                )}
            />

            {labels?.length && (
                <div className="mt-5 flex items-center">
                    {marks.map((mark, i) => {
                        const leftPositionPercentage = calculateTickPercent(i);

                        return (
                            <div
                                key={labels?.[i] || `label-${i}`}
                                className="absolute cursor-default text-xs"
                                style={{
                                    left: `${leftPositionPercentage}%`,
                                    translate: `-${leftPositionPercentage}%`,
                                }}>
                                {labels?.[i]}
                            </div>
                        );
                    })}
                </div>
            )}
        </SliderPrimitive.Root>
    );
});

SliderWithMarkers.displayName = "SliderWithMarkers";

export { SliderWithMarkers };
