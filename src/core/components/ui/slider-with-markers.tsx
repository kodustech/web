import { forwardRef, useState } from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "src/core/utils/components";

type SliderWithMarkersProps = React.ComponentPropsWithoutRef<
    typeof SliderPrimitive.Root
> & {
    labels?: string[];
};

export const SliderWithMarkers = forwardRef<
    React.ComponentRef<typeof SliderPrimitive.Root>,
    SliderWithMarkersProps
>(({ className, labels, onValueChange, ...props }, ref) => {
    const [value, setValue] = useState<number[]>(
        props.defaultValue ?? props.value ?? [0],
    );
    const [innerInterval] = useState<number>(props.step ?? 25);
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

    function handleValueChange(v: number[]) {
        setValue(v);
        onValueChange?.(v);
    }

    return (
        <SliderPrimitive.Root
            ref={ref}
            className={cn(
                "relative my-4 flex w-full touch-none select-none flex-col items-center [--slider-marker-background-active:var(--secondary)]",
                className,
            )}
            {...props}
            onValueChange={handleValueChange}>
            <SliderPrimitive.Track className="relative flex h-1 w-full items-center rounded-full bg-primary/20">
                <SliderPrimitive.Range className="absolute h-full rounded-full bg-[hsl(var(--slider-marker-background-active))]" />
                <div className="absolute inset-x-1 flex items-center">
                    {marks.map((_, i) => (
                        <div
                            key={`${i}`}
                            role="presentation"
                            className={cn("absolute h-3 w-3 rounded-full", {
                                "bg-primary": i > tickIndex(value[0]!),
                                "bg-[hsl(var(--slider-marker-background-active))]":
                                    i <= tickIndex(value[0]!),
                            })}
                            style={{
                                left: `${calculateTickPercent(i)}%`,
                                translate: `-${calculateTickPercent(i)}%`,
                            }}
                        />
                    ))}
                </div>

                <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border-2 border-primary bg-[hsl(var(--slider-marker-background-active))] shadow-sm transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50" />
            </SliderPrimitive.Track>

            {labels?.length && (
                <div className="mt-5 flex items-center">
                    {marks.map((_, i) => (
                        <div
                            key={`${i}`}
                            className="absolute text-xs"
                            style={{
                                left: `${calculateTickPercent(i)}%`,
                                translate: `-${calculateTickPercent(i)}%`,
                            }}>
                            {labels?.[i]}
                        </div>
                    ))}
                </div>
            )}
        </SliderPrimitive.Root>
    );
});
