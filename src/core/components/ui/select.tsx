"use client";

import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "src/core/utils/components";

import { Button } from "./button";

const Select = SelectPrimitive.Root;

const SelectGroup = SelectPrimitive.Group;

const SelectValue = SelectPrimitive.Value;

const SelectTrigger = React.forwardRef<
    React.ElementRef<typeof SelectPrimitive.Trigger>,
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> & {
        loading?: boolean;
    }
>(({ className, children, ...props }, ref) => (
    <SelectPrimitive.Trigger
        ref={ref}
        className={cn(
            "text-foreground ring-offset-background placeholder:text-muted-foreground relative flex h-11 w-full items-center justify-between rounded-xl border bg-[#231b2e]/35 py-3 pr-4 pl-5 text-sm transition-colors select-none open:bg-[#231b2e] hover:bg-[#231b2e] focus-visible:ring-2 focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50",
            className,
        )}
        {...props}>
        <div className="flex flex-1 items-center justify-between gap-2">
            {children}

            <SelectPrimitive.Icon asChild>
                <ChevronDown className="size-4 opacity-50" />
            </SelectPrimitive.Icon>
        </div>
    </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const SelectContent = React.forwardRef<
    React.ElementRef<typeof SelectPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
    <SelectPrimitive.Portal>
        <SelectPrimitive.Content
            ref={ref}
            position={position}
            {...props}
            className={cn(
                "text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 min-h-10 min-w-[8rem] overflow-hidden rounded-xl border bg-[#231b2e]/35 shadow-md backdrop-blur-2xl",
                position === "popper" &&
                    "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
                className,
            )}>
            <SelectPrimitive.Viewport
                className={cn(
                    "space-y-0.5 p-1",
                    position === "popper" &&
                        "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]",
                )}>
                {children}
            </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
));
SelectContent.displayName = SelectPrimitive.Content.displayName;

const SelectLabel = React.forwardRef<
    React.ElementRef<typeof SelectPrimitive.Label>,
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
    <SelectPrimitive.Label
        ref={ref}
        className={cn("py-1.5 pr-2 pl-8 text-sm font-semibold", className)}
        {...props}
    />
));
SelectLabel.displayName = SelectPrimitive.Label.displayName;

const SelectItem = React.forwardRef<
    React.ElementRef<typeof SelectPrimitive.Item>,
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
    <SelectPrimitive.Item
        ref={ref}
        className={cn(
            "text-foreground focus-visible:text-accent-foreground selected:bg-[#231b2e] relative flex w-full cursor-default items-center justify-between rounded-xl pr-2 pl-9 text-sm outline-hidden select-none hover:bg-[#231b2e] disabled:opacity-50 data-disabled:pointer-events-none",
            className,
        )}
        {...props}
        asChild>
        <Button variant="ghost" size="sm">
            <span className="absolute left-3 flex size-4 items-center justify-center">
                <SelectPrimitive.ItemIndicator>
                    <Check className="text-brand-orange size-4" />
                </SelectPrimitive.ItemIndicator>
            </span>

            <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
        </Button>
    </SelectPrimitive.Item>
));
SelectItem.displayName = SelectPrimitive.Item.displayName;

const SelectSeparator = React.forwardRef<
    React.ElementRef<typeof SelectPrimitive.Separator>,
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
    <SelectPrimitive.Separator
        ref={ref}
        className={cn("bg-muted -mx-1 my-1 h-px", className)}
        {...props}
    />
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

export {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectSeparator,
    SelectTrigger,
    SelectValue,
};
