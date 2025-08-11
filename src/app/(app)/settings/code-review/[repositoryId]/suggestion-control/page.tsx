"use client";

import { Button } from "@components/ui/button";
import { Heading } from "@components/ui/heading";
import { Page } from "@components/ui/page";
import { toast } from "@components/ui/toaster/use-toast";
import { useReactQueryInvalidateQueries } from "@hooks/use-invalidate-queries";
import { PARAMETERS_PATHS } from "@services/parameters";
import { createOrUpdateCodeReviewParameter } from "@services/parameters/fetch";
import {
    KodyLearningStatus,
    ParametersConfigKey,
} from "@services/parameters/types";
import { Save } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { useSelectedTeamId } from "src/core/providers/selected-team-context";
import { SeverityLevel } from "src/core/types";

import { CodeReviewPagesBreadcrumb } from "../../_components/breadcrumb";
import { usePlatformConfig } from "../../_components/context";
import GeneratingConfig from "../../_components/generating-config";
import { useCodeReviewRouteParams } from "../../_hooks";
import {
    GroupingModeSuggestions,
    LimitationType,
    type AutomationCodeReviewConfigPageProps,
    type CodeReviewFormType,
} from "../../_types";
import { ApplyFiltersToKodyRules } from "./_components/apply-filters-to-kody-rules";
import { LimitationTypeField } from "./_components/limitation-type";
import { MaxSuggestions } from "./_components/max-suggestions";
import { MinimumSeverityLevel } from "./_components/minimum-severity-level";
import { SuggestionGroupingMode } from "./_components/suggestion-grouping-mode";
import { SuggestionsPerSeverityLevel } from "./_components/suggestions-per-severity-level";

export default function SuggestionControl(
    props: AutomationCodeReviewConfigPageProps,
) {
    const form = useFormContext<CodeReviewFormType>();
    const { teamId } = useSelectedTeamId();
    const platformConfig = usePlatformConfig();
    const { repositoryId, directoryId } = useCodeReviewRouteParams();
    const limitationType = form.watch("suggestionControl.limitationType");

    const { invalidateQueries, generateQueryKey } =
        useReactQueryInvalidateQueries();

    const handleSubmit = form.handleSubmit(async (config) => {
        try {
            // lidando com configs legadas
            const {
                limitationType: legacyLimitationType,
                maxSuggestions: legacyMaxSuggestions,
                severityLevelFilter: legacySeverityLevelFilter,
                suggestionControl,
                ...rest
            } = config as any;

            // Se já existir suggestionControl, usamos ele; se não, usamos os valores legados
            const normalizedSuggestionControl = suggestionControl || {
                groupingMode: GroupingModeSuggestions.FULL, // ou outro valor padrão
                limitationType: legacyLimitationType || LimitationType.PR,
                maxSuggestions: legacyMaxSuggestions || 9,
                severityLevelFilter:
                    legacySeverityLevelFilter || SeverityLevel.MEDIUM,
                applyFiltersToKodyRules: false,
                severityLimits: {
                    low: 0,
                    medium: 0,
                    high: 0,
                    critical: 0,
                },
            };

            const finalConfig = {
                ...rest,
                suggestionControl: normalizedSuggestionControl,
            };

            await createOrUpdateCodeReviewParameter(
                finalConfig,
                teamId,
                repositoryId,
                directoryId,
            );

            await invalidateQueries({
                type: "all",
                queryKey: generateQueryKey(PARAMETERS_PATHS.GET_BY_KEY, {
                    params: {
                        key: ParametersConfigKey.CODE_REVIEW_CONFIG,
                        teamId,
                    },
                }),
            });

            form.reset(finalConfig);

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
    });

    const {
        isDirty: formIsDirty,
        isValid: formIsValid,
        isSubmitting: formIsSubmitting,
    } = form.formState;

    if (
        platformConfig.kodyLearningStatus ===
        KodyLearningStatus.GENERATING_CONFIG
    ) {
        return <GeneratingConfig />;
    }

    return (
        <Page.Root>
            <Page.Header>
                <CodeReviewPagesBreadcrumb pageName="Suggestion control" />
            </Page.Header>

            <Page.Header>
                <Page.Title>Suggestion control</Page.Title>
                <hr />

                <Page.HeaderActions>
                    <Button
                        size="md"
                        variant="primary"
                        leftIcon={<Save />}
                        onClick={handleSubmit}
                        disabled={!formIsDirty || !formIsValid}
                        loading={formIsSubmitting}>
                        Save settings
                    </Button>
                </Page.HeaderActions>
            </Page.Header>

            <Page.Content className="mt-10 flex-none">
                <SuggestionGroupingMode />

                <div className="mt-10 flex flex-col gap-8">
                    <div>
                        <Heading variant="h2">Suggestion limit</Heading>
                        <span className="text-text-secondary text-sm">
                            Configure the number of comments Kody can leave
                            during code reviews
                        </span>
                    </div>

                    <ApplyFiltersToKodyRules />
                    <LimitationTypeField />

                    {limitationType === LimitationType.SEVERITY ? (
                        <>
                            <SuggestionsPerSeverityLevel />
                        </>
                    ) : (
                        <>
                            <MaxSuggestions />
                            <MinimumSeverityLevel />
                        </>
                    )}
                </div>
            </Page.Content>
        </Page.Root>
    );
}
