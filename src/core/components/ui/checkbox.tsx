"use client";

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import type { VariantProps } from "class-variance-authority";
import { CheckIcon, MinusIcon } from "lucide-react";
import { cn } from "src/core/utils/components";

import { Button, type buttonVariants } from "./button";

const Checkbox = React.forwardRef<
    React.ComponentRef<typeof CheckboxPrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> &
        VariantProps<typeof buttonVariants> & {
            decorative?: boolean;
        }
>(({ className, ...props }, ref) => (
    <CheckboxPrimitive.Root
        ref={ref}
        className={cn(
            "peer size-6 shrink-0 rounded-full border",
            "data-[state=checked]:border-transparent",
            "data-[state=indeterminate]:border-transparent",
            "data-[state=unchecked]:bg-transparent",
            className,
        )}
        {...props}
        asChild>
        <Button
            size={props.size ?? "icon-sm"}
            variant={props.variant ?? "primary"}>
            <CheckboxPrimitive.Indicator>
                {props.checked === "indeterminate" && <MinusIcon />}
                {props.checked === true && <CheckIcon />}
            </CheckboxPrimitive.Indicator>
        </Button>
    </CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
