"use client";

import * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import type { VariantProps } from "class-variance-authority";
import { CheckIcon } from "lucide-react";
import { cn } from "src/core/utils/components";

import { Button, type buttonVariants } from "./button";

const RadioGroupRoot = ({
    className,
    ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root>) => {
    return (
        <RadioGroupPrimitive.Root
            data-slot="radio-group"
            className={cn("grid gap-3", className)}
            {...props}
        />
    );
};

const RadioGroupItem = ({
    className,
    ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item> &
    VariantProps<typeof buttonVariants> & { decorative?: boolean }) => {
    return (
        <RadioGroupPrimitive.Item
            data-slot="radio-group-item"
            className={cn(
                "peer size-4 shrink-0 rounded-full border",
                "data-[state=checked]:border-transparent",
                "data-[state=unchecked]:bg-transparent",
                className,
            )}
            {...props}
            asChild>
            <Button
                size={props.size ?? "icon-sm"}
                variant={props.variant ?? "primary"}>
                <RadioGroupPrimitive.Indicator data-slot="radio-group-indicator">
                    <CheckIcon className="size-3.5!" />
                </RadioGroupPrimitive.Indicator>
            </Button>
        </RadioGroupPrimitive.Item>
    );
};

export const RadioGroup = {
    Root: RadioGroupRoot,
    Item: RadioGroupItem,
};
