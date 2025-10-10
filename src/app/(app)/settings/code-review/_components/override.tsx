"use client";

import { Badge } from "@components/ui/badge";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@components/ui/tooltip";
import { useFormContext } from "react-hook-form";

import {
    CodeReviewFormType,
    FormattedConfigLevel,
    IFormattedConfigProperty,
} from "../_types";
import { useCodeReviewConfig } from "../../_components/context";
import { useCurrentConfigLevel } from "../../_hooks";

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
    const currentLevel = useCurrentConfigLevel();

    if (currentLevel === FormattedConfigLevel.GLOBAL) {
        return null;
    }

    const isExistingOverride = initialState?.level === currentLevel;

    const hasFormChange = (() => {
        const initialValue = initialState?.value;

        if (Array.isArray(currentValue) && Array.isArray(initialValue)) {
            return (
                JSON.stringify(currentValue) !== JSON.stringify(initialValue)
            );
        }

        if (
            typeof currentValue === "object" &&
            typeof initialValue === "object" &&
            currentValue !== null &&
            initialValue !== null
        ) {
            return (
                JSON.stringify(currentValue) !== JSON.stringify(initialValue)
            );
        }

        return currentValue !== initialValue;
    })();

    const overriddenLevelText =
        (() => {
            if (isExistingOverride) {
                // If viewing an override saved AT this level, it overrides the 'overriddenLevel' from the initial state.
                return initialState?.overriddenLevel;
            } else {
                // If creating a NEW override, you're overriding the level you inherited FROM.
                return initialState?.level;
            }
        })() || FormattedConfigLevel.DEFAULT;

    const showIndicator = isExistingOverride || hasFormChange;

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
                        <Badge
                            variant="primary-dark"
                            className="cursor-default px-2 py-1 text-[10px]">
                            Overridden
                        </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>
                            This overrides the setting from the{" "}
                            {overriddenLevelText} level.
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
