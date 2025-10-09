"use client";

import { Badge } from "@components/ui/badge";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@components/ui/tooltip";
import { useFormContext } from "react-hook-form";

import { CodeReviewFormType, IFormattedConfigProperty } from "../_types";
import { useCodeReviewConfig } from "../../_components/context";

function getNestedProperty<T>(
    obj: T,
    path: string,
): IFormattedConfigProperty<any> {
    return path.split(".").reduce((acc: any, key) => acc?.[key], obj);
}

type OverrideIndicatorFormProps = {
    fieldName: string;
    className?: string;
};

export const OverrideIndicatorForm = ({
    fieldName,
}: OverrideIndicatorFormProps) => {
    const form = useFormContext<CodeReviewFormType>();
    const config = useCodeReviewConfig();

    const initialState = getNestedProperty(config, fieldName);
    const currentValue = form.watch(`${fieldName}.value` as any);

    return (
        <OverrideIndicator
            currentValue={currentValue}
            initialState={initialState}
        />
    );
};

type OverrideIndicatorProps<T> = {
    currentValue: T;
    initialState: IFormattedConfigProperty<T>;
};

export const OverrideIndicator = <T,>({
    currentValue,
    initialState,
}: OverrideIndicatorProps<T>) => {
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

    if (!showIndicator) {
        return null;
    }

    // const handleRevert = () => {
    //     form.setValue(`${fieldName}.value` as any, inheritedValue, {
    //         shouldDirty: true,
    //     });
    //     form.setValue(`${fieldName}.level` as any, inheritedLevel, {
    //         shouldDirty: true,
    //     });
    //     form.trigger(fieldName as any);
    // };

    // TODO: fix below, button cannot contain button error
    return (
        <div className="flex items-center gap-2">
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Badge variant="primary-dark" className="cursor-default text-[10px] px-2 py-1">
                            Overridden
                        </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>
                            This overrides the setting from the{" "}
                            {inheritedLevel ?? "default"} level.
                        </p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
            {/* <Button size="xs" variant="primary" onClick={handleRevert}>
                <Undo2 className="h-4 w-4" />
            </Button> */}
        </div>
    );
};
