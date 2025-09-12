"use client";

import { useEffect } from "react";
import { useSuspenseGetParameterByKey } from "@services/parameters/hooks";
import { LanguageValue, ParametersConfigKey } from "@services/parameters/types";
import { usePermission } from "@services/permissions/hooks";
import { Action, ResourceType } from "@services/permissions/types";
import { FormProvider, useForm } from "react-hook-form";
import { useSelectedTeamId } from "src/core/providers/selected-team-context";
import { SeverityLevel } from "src/core/types";

import {
    CodeReviewSummaryOptions,
    GroupingModeSuggestions,
    LimitationType,
    ReviewCadenceType,
    type CodeReviewFormType,
} from "../_types";
import { useCodeReviewConfig } from "../../_components/context";

const getDefaultValues = (
    config: ReturnType<typeof useCodeReviewConfig>,
    language: LanguageValue,
) => ({
    ...config,
    language,
    automatedReviewActive: config?.automatedReviewActive ?? false,
    reviewCadence:
        config?.reviewCadence ??
        (config?.automatedReviewActive
            ? {
                  type: ReviewCadenceType.AUTOMATIC,
                  timeWindow: 15,
                  pushesToTrigger: 3,
              }
            : undefined),
    ignorePaths: config?.ignorePaths ?? [],
    ignoredTitleKeywords: config?.ignoredTitleKeywords ?? [],
    baseBranches: config?.baseBranches ?? [],
    kodusConfigFileOverridesWebPreferences:
        config?.kodusConfigFileOverridesWebPreferences ?? false,
    pullRequestApprovalActive: config?.pullRequestApprovalActive ?? false,
    isRequestChangesActive: config?.isRequestChangesActive ?? false,
    summary: {
        ...config?.summary,
        generatePRSummary: config?.summary?.generatePRSummary ?? false,
        customInstructions: config?.summary?.customInstructions ?? "",
        behaviourForExistingDescription:
            config?.summary?.behaviourForExistingDescription ??
            CodeReviewSummaryOptions.REPLACE,
    },
    suggestionControl: {
        ...config?.suggestionControl,
        groupingMode:
            config?.suggestionControl?.groupingMode ??
            GroupingModeSuggestions.FULL,
        limitationType:
            config?.suggestionControl?.limitationType ?? LimitationType.PR,
        maxSuggestions: config?.suggestionControl?.maxSuggestions ?? 9,
        severityLevelFilter:
            config?.suggestionControl?.severityLevelFilter ??
            SeverityLevel.MEDIUM,
        applyFiltersToKodyRules:
            config?.suggestionControl?.applyFiltersToKodyRules ?? false,
        severityLimits: {
            low: config?.suggestionControl?.severityLimits?.low ?? 0,
            medium: config?.suggestionControl?.severityLimits?.medium ?? 0,
            high: config?.suggestionControl?.severityLimits?.high ?? 0,
            critical: config?.suggestionControl?.severityLimits?.critical ?? 0,
        },
    },
    reviewOptions: (() => {
        const options = config?.reviewOptions ?? {};
        const booleanOptions: Record<string, boolean> = {};
        Object.entries(options).forEach(([key, value]) => {
            booleanOptions[key] = Boolean(value);
        });
        return booleanOptions;
    })(),
    codeReviewVersion: config?.codeReviewVersion ?? "v2",
    kodyRulesGeneratorEnabled: config?.kodyRulesGeneratorEnabled ?? true,
});

export default function Layout(props: React.PropsWithChildren) {
    const { teamId } = useSelectedTeamId();
    const config = useCodeReviewConfig();
    const parameters = useSuspenseGetParameterByKey<LanguageValue>(
        ParametersConfigKey.LANGUAGE_CONFIG,
        teamId,
        {
            fallbackData: {
                uuid: "",
                configKey: "",
                configValue: LanguageValue.ENGLISH,
            },
        },
    );
    const canEdit = usePermission(
        Action.Update,
        ResourceType.CodeReviewSettings,
    );

    const form = useForm<CodeReviewFormType>({
        mode: "all",
        criteriaMode: "firstError",
        reValidateMode: "onChange",
        defaultValues: getDefaultValues(
            config,
            parameters?.configValue ?? LanguageValue.ENGLISH,
        ),
        disabled: !canEdit,
    });

    useEffect(() => {
        form.reset(
            getDefaultValues(
                config,
                parameters?.configValue ?? LanguageValue.ENGLISH,
            ),
        );
    }, [config?.id]);

    return <FormProvider {...form}>{props.children}</FormProvider>;
}
