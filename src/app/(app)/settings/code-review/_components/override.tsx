"use client";

import { useEffect, useState } from "react";
import { Badge } from "@components/ui/badge";
import { Button } from "@components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipPortal,
    TooltipProvider,
    TooltipTrigger,
} from "@components/ui/tooltip";
import { useEffectOnce } from "@hooks/use-effect-once";
import { Undo2 } from "lucide-react";
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

function areValuesDifferent(val1: any, val2: any): boolean {
    if (Array.isArray(val1) && Array.isArray(val2)) {
        return JSON.stringify(val1) !== JSON.stringify(val2);
    }

    if (
        typeof val1 === "object" &&
        typeof val2 === "object" &&
        val1 !== null &&
        val2 !== null
    ) {
        return JSON.stringify(val1) !== JSON.stringify(val2);
    }

    return val1 !== val2;
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
    const currentLevel = useCurrentConfigLevel();

    const initialState = getNestedProperty(config, fieldName);
    const currentValue = form.watch(`${fieldName}.value` as any);

    const isExistingOverride = initialState?.level === currentLevel;

    const handleRevert = () => {
        if (!initialState) return;

        const valueToRevert = isExistingOverride
            ? initialState.overriddenValue
            : initialState.value;

        const levelToRevert =
            (isExistingOverride
                ? initialState.overriddenLevel
                : initialState.level) ?? FormattedConfigLevel.DEFAULT;

        form.setValue(`${fieldName}.value` as any, valueToRevert, {
            shouldDirty: true,
        });
        form.setValue(`${fieldName}.level` as any, levelToRevert, {
            shouldDirty: true,
        });
        form.trigger(fieldName as any);
    };

    return (
        <OverrideIndicator
            currentValue={currentValue}
            initialState={initialState}
            handleRevert={handleRevert}
        />
    );
};

type OverrideIndicatorProps<T> = {
    currentValue: T;
    initialState: IFormattedConfigProperty<T>;
    handleRevert?: () => void;
};

export const OverrideIndicator = <T,>({
    currentValue,
    initialState,
    handleRevert,
}: OverrideIndicatorProps<T>) => {
    const currentLevel = useCurrentConfigLevel();
    const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(
        null,
    );

    useEffectOnce(() => {
        setPortalContainer(document.body);
    });

    if (
        currentLevel === FormattedConfigLevel.GLOBAL ||
        !initialState ||
        !portalContainer
    ) {
        return null;
    }

    const isExistingOverride = initialState?.level === currentLevel;

    const parentValue = isExistingOverride
        ? initialState?.overriddenValue
        : initialState?.value;

    const parentLevel =
        (isExistingOverride
            ? initialState?.overriddenLevel
            : initialState?.level) ?? FormattedConfigLevel.DEFAULT;

    const isOverridden = areValuesDifferent(currentValue, parentValue);

    if (!isOverridden) {
        return null;
    }

    return (
        <div className="flex items-center gap-2">
            <Tooltip>
                <TooltipTrigger asChild>
                    <Badge
                        onClick={(e) => e.stopPropagation()}
                        variant="primary-dark"
                        className="cursor-default px-2 py-1 text-[10px]">
                        Overridden
                    </Badge>
                </TooltipTrigger>

                {/* Prevent tooltip from being cut off in overflow hidden containers */}
                <TooltipPortal container={portalContainer}>
                    <TooltipContent>
                        <p>
                            This overrides the setting from the{" "}
                            <strong>{parentLevel}</strong> level.
                        </p>
                    </TooltipContent>
                </TooltipPortal>
            </Tooltip>
            {typeof handleRevert === "function" && (
                <div
                    onClick={(e) => {
                        e.stopPropagation();
                        handleRevert();
                    }}>
                    <Undo2 className="h-4 w-4" />
                </div>
            )}
        </div>
    );
};
