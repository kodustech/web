"use client";

import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";
import { cn } from "src/core/utils/components";

import { Icons } from "./icons";

const Switch = React.forwardRef<
    React.ComponentRef<typeof SwitchPrimitives.Root>,
    React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> & {
        loading?: boolean;
    }
>(({ className, loading, disabled, ...props }, ref) => (
    <SwitchPrimitives.Root
        className={cn(
            "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center overflow-hidden rounded-full border-2 border-transparent bg-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background data-[state=checked]:bg-brand-orange data-[state=unchecked]:bg-opacity-20 disabled:cursor-not-allowed disabled:opacity-50",
            className,
        )}
        {...props}
        disabled={disabled || loading}
        ref={ref}>
        <SwitchPrimitives.Thumb
            className={cn(
                "pointer-events-none relative block h-5 w-5 rounded-full bg-brand-orange-foreground opacity-100 shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0",
            )}>
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <Icons.spinner className="size-5 animate-spin" />
                </div>
            )}
        </SwitchPrimitives.Thumb>
    </SwitchPrimitives.Root>
));
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };
