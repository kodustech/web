"use client";

import { Button } from "@components/ui/button";
import { Card } from "@components/ui/card";
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@components/ui/hover-card";
import { Spinner } from "@components/ui/spinner";
import { Switch } from "@components/ui/switch";
import { toast } from "@components/ui/toaster/use-toast";
import { useAsyncAction } from "@hooks/use-async-action";
import { useReactQueryInvalidateQueries } from "@hooks/use-invalidate-queries";
import { generateKodyRules } from "@services/kodyRules/fetch";
import { PARAMETERS_PATHS } from "@services/parameters";
import { createOrUpdateCodeReviewParameter } from "@services/parameters/fetch";
import {
    KodyLearningStatus,
    ParametersConfigKey,
} from "@services/parameters/types";
import { SeverityLevel } from "src/core/types";

import { useCodeReviewRouteParams } from "../_hooks";
import {
    CodeReviewSummaryOptions,
    GroupingModeSuggestions,
    LimitationType,
    type CodeReviewGlobalConfig,
} from "../_types";
import { usePlatformConfig } from "./context";

export const GenerateRulesButton = ({
    teamId,
    config,
}: {
    teamId: string;
    config: CodeReviewGlobalConfig & { id?: string };
}) => {
    const platformConfig = usePlatformConfig();
    const { repositoryId, directoryId } = useCodeReviewRouteParams();
    const { resetQueries, generateQueryKey } = useReactQueryInvalidateQueries();

    const [generateRules, isLoadingButton] = useAsyncAction(async () => {
        generateKodyRules(teamId);

        await new Promise((resolve) => setTimeout(resolve, 2000));

        await resetQueries({
            queryKey: generateQueryKey(PARAMETERS_PATHS.GET_BY_KEY, {
                params: {
                    teamId,
                    key: ParametersConfigKey.PLATFORM_CONFIGS,
                },
            }),
        });
    });

    const newConfig: CodeReviewGlobalConfig = {
        ...config,
        automatedReviewActive: config?.automatedReviewActive ?? false,
        ignorePaths: config?.ignorePaths ?? [],
        ignoredTitleKeywords: config?.ignoredTitleKeywords ?? [],
        baseBranches: config?.baseBranches ?? [],
        kodusConfigFileOverridesWebPreferences:
            config?.kodusConfigFileOverridesWebPreferences ?? false,
        pullRequestApprovalActive: config?.pullRequestApprovalActive ?? false,
        isRequestChangesActive: config?.isRequestChangesActive ?? false,
        reviewOptions: {
            code_style: config?.reviewOptions?.code_style ?? false,
            documentation_and_comments:
                config?.reviewOptions?.documentation_and_comments ?? false,
            error_handling: config?.reviewOptions?.error_handling ?? false,
            maintainability: config?.reviewOptions?.maintainability ?? false,
            performance_and_optimization:
                config?.reviewOptions?.performance_and_optimization ?? false,
            potential_issues: config?.reviewOptions?.potential_issues ?? false,
            refactoring: config?.reviewOptions?.refactoring ?? false,
            security: config?.reviewOptions?.security ?? false,
            kody_rules: config?.reviewOptions?.kody_rules ?? false,
            breaking_changes: config?.reviewOptions?.breaking_changes ?? false,
        },
        kodyRulesGeneratorEnabled: config?.kodyRulesGeneratorEnabled ?? true,
        summary: {
            behaviourForExistingDescription:
                config?.summary?.behaviourForExistingDescription ??
                CodeReviewSummaryOptions.REPLACE,
            customInstructions: config?.summary?.customInstructions ?? "",
            generatePRSummary: config?.summary?.generatePRSummary ?? false,
        },
        suggestionControl: {
            applyFiltersToKodyRules: false,
            groupingMode:
                config?.suggestionControl?.groupingMode ??
                GroupingModeSuggestions.FULL,
            limitationType:
                config?.suggestionControl?.limitationType ?? LimitationType.PR,
            maxSuggestions: config?.suggestionControl?.maxSuggestions ?? 10,
            severityLevelFilter:
                config?.suggestionControl?.severityLevelFilter ??
                SeverityLevel.HIGH,
        },
    };

    // if more settings are added to this page consider switching to using a form
    const [handleKodyRulesGeneratorToggle, isLoadingToggle] = useAsyncAction(
        async () => {
            try {
                await createOrUpdateCodeReviewParameter(
                    {
                        ...newConfig,
                        kodyRulesGeneratorEnabled:
                            !newConfig.kodyRulesGeneratorEnabled,
                    },
                    teamId,
                    repositoryId,
                    directoryId,
                );

                await resetQueries({
                    queryKey: generateQueryKey(PARAMETERS_PATHS.GET_BY_KEY, {
                        params: {
                            key: ParametersConfigKey.CODE_REVIEW_CONFIG,
                            teamId,
                        },
                    }),
                });

                toast({
                    description: "Settings saved",
                    variant: "success",
                });
            } catch (error) {
                console.error("Erro ao salvar as configurações:", error);

                toast({
                    title: "Error",
                    description:
                        "An error occurred while saving the settings. Please try again.",
                    variant: "danger",
                });
            }
        },
    );

    switch (platformConfig.kodyLearningStatus) {
        case KodyLearningStatus.ENABLED:
            return (
                <HoverCard>
                    <HoverCardTrigger>
                        <Card className="flex w-full flex-row items-center gap-4 p-3">
                            Auto-Generate
                            <Switch
                                decorative
                                disabled={isLoadingToggle.loading!}
                                onClick={handleKodyRulesGeneratorToggle}
                                checked={newConfig.kodyRulesGeneratorEnabled}
                            />
                        </Card>
                    </HoverCardTrigger>
                    <HoverCardContent className="rounded-2xl">
                        <p className="text-text-secondary text-sm">
                            Kody learns continuously and generates every week.
                        </p>
                    </HoverCardContent>
                </HoverCard>
            );

        case KodyLearningStatus.GENERATING_RULES:
            return (
                <Button
                    size="md"
                    decorative
                    variant="primary-dark"
                    leftIcon={<Spinner />}>
                    Generating Kody Rules...
                </Button>
            );

        case KodyLearningStatus.DISABLED:
        default:
            return (
                <Button
                    size="md"
                    variant="primary-dark"
                    onClick={generateRules}
                    disabled={isLoadingButton.loading}>
                    Generate Kody Rules
                </Button>
            );
    }
};
