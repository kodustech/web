"use client";

import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { cn } from "src/core/utils/components";

const Popover = PopoverPrimitive.Root;

const PopoverTrigger = PopoverPrimitive.Trigger;

const PopoverContent = React.forwardRef<
    React.ComponentRef<typeof PopoverPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = "center", sideOffset = 4, ...props }, ref) => (
    <ConditionalPortal portal={PopoverPrimitive.Portal}>
        <PopoverPrimitive.Content
            ref={ref}
            align={align}
            sideOffset={sideOffset}
            className={cn(
                "z-50 w-72 rounded-xl border bg-[#231b2e] bg-opacity-35 p-4 shadow-md backdrop-blur-3xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
                className,
            )}
            {...props}
        />
    </ConditionalPortal>
));
PopoverContent.displayName = PopoverPrimitive.Content.displayName;

export { Popover, PopoverContent, PopoverTrigger };

export interface ConditionalPortalProps {
    portal: React.FC<{ children?: React.ReactNode }>
    children: React.ReactNode
}

export const ConditionalPortal = ({
    portal: Portal,
    children
}: ConditionalPortalProps) => {
    const [hasDialog, setHasDialog] = React.useState(false)

    React.useEffect(() => {
        setHasDialog(!!document.querySelector('[role=dialog]'))
    }, [])

    if (hasDialog) {
        return children
    }

    return <Portal>{children}</Portal>
}