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

    const inheritedLevel =
        initialState?.overriddenLevel && currentLevel === initialState?.level
            ? initialState.overriddenLevel
            : initialState?.level || initialState?.overriddenLevel;

    // Verifica se existe um override estrutural na config
    const hasStructuralOverride =
        initialState?.overriddenValue !== undefined ||
        initialState?.overriddenLevel !== undefined;

    // Verifica se o valor atual do form é diferente do valor inicial salvo
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

    // Verifica se é um override relevante para o nível atual
    const isRelevantOverride = (() => {
        if (!hasStructuralOverride) return false;

        // Se é o nível atual fazendo override, sempre mostra
        if (initialState?.level === currentLevel) return true;

        // Se não é o nível atual, só mostra se há mudança no form
        return hasFormChange;
    })();

    const showIndicator = hasFormChange || isRelevantOverride;

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
                            {inheritedLevel ?? FormattedConfigLevel.DEFAULT}{" "}
                            level.
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
