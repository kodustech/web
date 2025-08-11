"use client";

import { useSuspenseGetParameterByKey } from "@services/parameters/hooks";
import { LanguageValue, ParametersConfigKey } from "@services/parameters/types";
import { FormProvider, useForm } from "react-hook-form";
import { useSelectedTeamId } from "src/core/providers/selected-team-context";
import { SeverityLevel } from "src/core/types";

import { useAutomationCodeReviewConfig } from "../_components/context";
import {
    CodeReviewSummaryOptions,
    GroupingModeSuggestions,
    LimitationType,
    ReviewCadenceType,
    type CodeReviewFormType,
} from "../_types";

export default function Layout(props: React.PropsWithChildren) {
    const { teamId } = useSelectedTeamId();
    const config = useAutomationCodeReviewConfig();
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

    const language = parameters?.configValue ?? LanguageValue.ENGLISH;

    const form = useForm<CodeReviewFormType>({
        mode: "all",
        reValidateMode: "onChange",
        criteriaMode: "firstError",
        defaultValues: {
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
            pullRequestApprovalActive:
                config?.pullRequestApprovalActive ?? false,
            isRequestChangesActive: config?.isRequestChangesActive ?? false,
            summary: {
                ...(config?.summary ?? {}),
                generatePRSummary: config?.summary?.generatePRSummary ?? false,
                customInstructions: config?.summary?.customInstructions ?? "",
                behaviourForExistingDescription:
                    config?.summary?.behaviourForExistingDescription ??
                    CodeReviewSummaryOptions.REPLACE,
            },
            suggestionControl: {
                groupingMode: GroupingModeSuggestions.FULL,
                limitationType: LimitationType.PR,
                maxSuggestions: 9,
                severityLevelFilter: SeverityLevel.MEDIUM,
                applyFiltersToKodyRules: false,
                ...config?.suggestionControl,
                severityLimits: {
                    low: 0,
                    medium: 0,
                    high: 0,
                    critical: 0,
                    ...config?.suggestionControl?.severityLimits,
                },
            },
            reviewOptions: {
                code_style: config?.reviewOptions?.code_style ?? false,
                documentation_and_comments:
                    config?.reviewOptions?.documentation_and_comments ?? false,
                error_handling: config?.reviewOptions?.error_handling ?? false,
                maintainability:
                    config?.reviewOptions?.maintainability ?? false,
                performance_and_optimization:
                    config?.reviewOptions?.performance_and_optimization ??
                    false,
                potential_issues:
                    config?.reviewOptions?.potential_issues ?? false,
                refactoring: config?.reviewOptions?.refactoring ?? false,
                security: config?.reviewOptions?.security ?? false,
                kody_rules: config?.reviewOptions?.kody_rules ?? false,
                breaking_changes:
                    config?.reviewOptions?.breaking_changes ?? false,
            },
            kodyRulesGeneratorEnabled:
                config?.kodyRulesGeneratorEnabled ?? true,
        },
    });

    return <FormProvider {...form}>{props.children}</FormProvider>;
}
