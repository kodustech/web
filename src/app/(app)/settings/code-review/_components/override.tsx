"use client";

import { Badge } from "@components/ui/badge";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@components/ui/tooltip";
import { useFormContext } from "react-hook-form";

import { CodeReviewFormType, FormattedConfigLevel, IFormattedConfigProperty } from "../_types";
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
    const currentLevel = useCurrentConfigLevel();

    const initialState = getNestedProperty(config, fieldName);
    const currentValue = form.watch(`${fieldName}.value` as any);

    // Debug para detectar o problema
    if (fieldName === "pullRequestApprovalActive") {
        console.log("🚨 OverrideIndicatorForm Debug:", {
            fieldName,
            currentLevel,
            isBlocked: currentLevel === FormattedConfigLevel.GLOBAL,
            FormattedConfigLevel_GLOBAL: FormattedConfigLevel.GLOBAL,
            currentValue,
            initialState,
            willCallOverrideIndicator: currentLevel !== FormattedConfigLevel.GLOBAL
        });
    }

    if (currentLevel === FormattedConfigLevel.GLOBAL) {
        console.log("❌ BLOCKED: Current level is GLOBAL, not showing badge");
        return null;
    }

    return (
        <OverrideIndicator
            currentValue={currentValue}
            initialState={initialState}
            currentLevel={currentLevel}
        />
    );
};

type OverrideIndicatorProps<T> = {
    currentValue: T;
    initialState: IFormattedConfigProperty<T>;
    currentLevel?: FormattedConfigLevel;
};

export const OverrideIndicator = <T,>({
    currentValue,
    initialState,
    currentLevel,
}: OverrideIndicatorProps<T>) => {
    const inheritedLevel = initialState?.overriddenLevel ?? initialState?.level;

    // Verifica se existe um override estrutural na config
    const hasStructuralOverride = initialState?.overriddenValue !== undefined || initialState?.overriddenLevel !== undefined;

    // Verifica se o valor atual do form é diferente do valor inicial salvo
    const hasFormChange = (() => {
        const initialValue = initialState?.value;
        
        if (Array.isArray(currentValue) && Array.isArray(initialValue)) {
            return JSON.stringify(currentValue) !== JSON.stringify(initialValue);
        }
        if (
            typeof currentValue === "object" &&
            typeof initialValue === "object" &&
            currentValue !== null &&
            initialValue !== null
        ) {
            return JSON.stringify(currentValue) !== JSON.stringify(initialValue);
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

    // Debug SEMPRE (sem condições)
    console.log("🎯 OverrideIndicator RUNNING:", {
        currentValue,
        initialValue: initialState?.value,
        hasStructuralOverride,
        hasFormChange,
        isRelevantOverride,
        showIndicator,
        willRenderBadge: showIndicator ? "✅ YES" : "❌ NO"
    });

    if (!showIndicator) {
        return null;
    }

    // Debug final - SEMPRE
    console.log("🏆 RENDERING BADGE! Badge should be visible now!");

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
