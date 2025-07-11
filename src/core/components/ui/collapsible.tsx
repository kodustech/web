"use client";

import * as React from "react";
import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";
import { ChevronDownIcon } from "lucide-react";
import { cn } from "src/core/utils/components";

const Collapsible = React.forwardRef<
    React.ComponentRef<typeof CollapsiblePrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.Root>
>(({ className, ...props }, ref) => (
    <CollapsiblePrimitive.Root
        ref={ref}
        {...props}
        className={cn(className, "group/collapsible")}
    />
));
Collapsible.displayName = ChevronDownIcon.displayName;

const CollapsibleIndicator = React.forwardRef<
    React.ComponentRef<typeof ChevronDownIcon>,
    React.ComponentPropsWithoutRef<typeof ChevronDownIcon>
>(({ className, ...props }, ref) => (
    <ChevronDownIcon
        ref={ref}
        {...props}
        className={cn(
            "text-text-secondary size-4! shrink-0 transition duration-200",
            "group-data-[state=closed]/collapsible:rotate-0 group-data-[state=open]/collapsible:rotate-180",
            className,
        )}
    />
));
CollapsibleIndicator.displayName = ChevronDownIcon.displayName;

const CollapsibleTrigger = React.forwardRef<
    React.ComponentRef<typeof CollapsiblePrimitive.Trigger>,
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
    React.ComponentRef<typeof CollapsiblePrimitive.Content>,
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
