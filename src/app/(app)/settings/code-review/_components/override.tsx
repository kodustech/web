"use client";

import { useState } from "react";
import { Badge } from "@components/ui/badge";
import { Button } from "@components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@components/ui/tooltip";
import { Undo2 } from "lucide-react";
import { useFormContext } from "react-hook-form";

import { CodeReviewFormType, IFormattedConfigProperty } from "../_types";
import { useCodeReviewConfig } from "../../_components/context";
import { useCurrentConfigLevel } from "../../_hooks";

function getNestedProperty<T>(
    obj: T,
    path: string,
): IFormattedConfigProperty<any> {
    return path.split(".").reduce((acc: any, key) => acc?.[key], obj);
}

type OverrideIndicatorProps = {
    fieldName: string;
};

export const OverrideIndicator = ({ fieldName }: OverrideIndicatorProps) => {
    const form = useFormContext<CodeReviewFormType>();
    const config = useCodeReviewConfig();

    const initialState = getNestedProperty(config, fieldName);

    const currentValue = form.watch(`${fieldName}.value` as any);

    const inheritedValue = initialState?.overriddenValue ?? initialState?.value;
    const inheritedLevel = initialState?.overriddenLevel ?? initialState?.level;

    const showIndicator = (() => {
        if (Array.isArray(currentValue) && Array.isArray(inheritedValue)) {
            return (
                JSON.stringify(currentValue) !== JSON.stringify(inheritedValue)
            );
        }
        if (
            typeof currentValue === "object" &&
            typeof inheritedValue === "object" &&
            currentValue !== null &&
            inheritedValue !== null
        ) {
            return (
                JSON.stringify(currentValue) !== JSON.stringify(inheritedValue)
            );
        }
        return currentValue !== inheritedValue;
    })();

    console.log(fieldName, { inheritedValue, currentValue });

    if (!showIndicator) {
        return null;
    }

    const handleRevert = () => {
        form.setValue(`${fieldName}.value` as any, inheritedValue, {
            shouldDirty: true,
        });
        form.setValue(`${fieldName}.level` as any, inheritedLevel, {
            shouldDirty: true,
        });
        form.trigger(fieldName as any);
    };

    // TODO: fix below, button cannot contain button error
    return (
        <div className="flex items-center gap-2">
            {/* <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild> */}
            <Badge variant="primary" className="cursor-default">
                Overridden
            </Badge>
            {/* </TooltipTrigger>
                    <TooltipContent>
                        <p>
                            This overrides the setting from the{" "}
                            {inheritedLevel ?? "default"} level.
                        </p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider> */}
            {/* <Button size="xs" variant="primary" onClick={handleRevert}>
                <Undo2 className="h-4 w-4" />
            </Button> */}
        </div>
    );
};
