import { forwardRef } from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "src/core/utils/components";

export const ContinuousSlider = forwardRef<
    React.ComponentRef<typeof SliderPrimitive.Root>,
    // Omit the primitive's props that we are replacing for a simpler API
    Omit<
        React.ComponentProps<typeof SliderPrimitive.Root>,
        "value" | "defaultValue" | "onValueChange"
    > & {
        /** The current value of the slider. */
        value: number;
        /** Callback invoked when the value changes. */
        onValueChange: (value: number) => void;
    }
>(({ className, value, onValueChange, ...props }, ref) => {
    return (
        <SliderPrimitive.Root
            ref={ref}
            value={[value]}
            onValueChange={(v) => onValueChange?.(v[0])}
            className={cn(
                "group relative flex h-5 w-full touch-none items-center select-none",
                "disabled:pointer-events-none disabled:opacity-50",
                className,
            )}
            {...props}>
            <SliderPrimitive.Track className="bg-primary-dark relative h-2 w-full grow overflow-hidden rounded-full">
                <SliderPrimitive.Range className="bg-primary-light absolute h-full" />
            </SliderPrimitive.Track>
            <SliderPrimitive.Thumb
                className={cn(
                    "border-primary-light bg-background ring-offset-background block h-5 w-5 rounded-full border-2 transition-colors",
                    "focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
                )}
            />
        </SliderPrimitive.Root>
    );
});

ContinuousSlider.displayName = "ContinuousSlider";
