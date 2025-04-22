"use client";

import * as React from "react";
import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";
import { ChevronDownIcon } from "lucide-react";
import { cn } from "src/core/utils/components";

const Collapsible = CollapsiblePrimitive.Root;

const CollapsibleIndicator = React.forwardRef<
    React.ElementRef<typeof ChevronDownIcon>,
    React.ComponentPropsWithoutRef<typeof ChevronDownIcon>
>(({ className, ...props }, ref) => (
    <ChevronDownIcon
        ref={ref}
        {...props}
        className={cn(
            className,
            "text-muted-foreground size-4! shrink-0 transition duration-200",
        )}
    />
));
CollapsibleIndicator.displayName = ChevronDownIcon.displayName;

const CollapsibleTrigger = React.forwardRef<
    React.ElementRef<typeof CollapsiblePrimitive.Trigger>,
    React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
    <CollapsiblePrimitive.Trigger
        ref={ref}
        className={cn(
            "flex flex-1 items-center justify-between py-4 text-sm font-medium transition [&[data-state=open]>svg]:rotate-180",
            className,
        )}
        {...props}>
        {children}
    </CollapsiblePrimitive.Trigger>
));
CollapsibleTrigger.displayName = CollapsiblePrimitive.Trigger.displayName;

const CollapsibleContent = React.forwardRef<
    React.ElementRef<typeof CollapsiblePrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.Content>
>(({ className, children, ...props }, ref) => (
    <CollapsiblePrimitive.Content
        ref={ref}
        className="data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down overflow-hidden text-sm"
        {...props}>
        <div className={cn("pt-0 pb-4", className)}>{children}</div>
    </CollapsiblePrimitive.Content>
));
CollapsibleContent.displayName = CollapsiblePrimitive.Content.displayName;

export {
    Collapsible,
    CollapsibleContent,
    CollapsibleIndicator,
    CollapsibleTrigger,
};
