"use client";

import * as React from "react";
import * as SeparatorPrimitive from "@radix-ui/react-separator";
import { cn } from "src/core/utils/components";

const Separator = React.forwardRef<
    React.ComponentRef<typeof SeparatorPrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>
>(
    (
        { className, orientation = "horizontal", decorative = true, ...props },
        ref,
    ) => (
        <SeparatorPrimitive.Root
            ref={ref}
            decorative={decorative}
            orientation={orientation}
            className={cn(
                "bg-card-lv3 pointer-events-none shrink-0",
                orientation === "horizontal"
                    ? "h-px w-full"
                    : "h-auto min-h-full w-px",
                className,
            )}
            {...props}
        />
    ),
);
Separator.displayName = SeparatorPrimitive.Root.displayName;

export { Separator };
