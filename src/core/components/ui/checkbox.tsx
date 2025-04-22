"use client";

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { CheckIcon } from "lucide-react";
import { cn } from "src/core/utils/components";

import { Button } from "./button";

const Checkbox = React.forwardRef<
    React.ElementRef<typeof CheckboxPrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> & {
        decorative?: boolean;
    }
>(({ className, ...props }, ref) => (
    <CheckboxPrimitive.Root
        ref={ref}
        className={cn(
            "peer size-6 shrink-0 rounded-full border",
            "data-[state=unchecked]:bg-transparent",
            className,
        )}
        {...props}
        asChild>
        <Button variant="primary" size="icon-sm">
            <CheckboxPrimitive.Indicator asChild>
                <CheckIcon />
            </CheckboxPrimitive.Indicator>
        </Button>
    </CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
