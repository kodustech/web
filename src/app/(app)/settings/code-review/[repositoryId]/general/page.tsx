"use client";

import { Button } from "@components/ui/button";
import { Page } from "@components/ui/page";
import { toast } from "@components/ui/toaster/use-toast";
import { useReactQueryInvalidateQueries } from "@hooks/use-invalidate-queries";
import { PARAMETERS_PATHS } from "@services/parameters";
import {
    createOrUpdateCodeReviewParameter,
    createOrUpdateParameter,
    getGenerateKodusConfigFile,
} from "@services/parameters/fetch";
import {
    KodyLearningStatus,
    ParametersConfigKey,
} from "@services/parameters/types";
import { DownloadIcon, SaveIcon } from "lucide-react";
import { FormProvider, useFormContext } from "react-hook-form";
import { useSelectedTeamId } from "src/core/providers/selected-team-context";

import { CodeReviewPagesBreadcrumb } from "../../_components/breadcrumb";
import { usePlatformConfig } from "../../_components/context";
import GeneratingConfig from "../../_components/generating-config";
import { useCodeReviewRouteParams } from "../../_hooks";
import { type CodeReviewFormType } from "../../_types";
import { AnalysisTypes } from "./_components/analysis-types";
import { AutomatedReviewActive } from "./_components/automated-review-active";
import { BaseBranches } from "./_components/base-branches";
import { IgnorePaths } from "./_components/ignore-paths";
import { IgnoredTitleKeywords } from "./_components/ignored-title-keywords";
import { IsRequestChangesActive } from "./_components/is-request-changes-active";
import { KodusConfigFileOverridesWebPreferences } from "./_components/kodus-config-file-overrides-web-preferences";
import { LanguageSelector } from "./_components/language-selector";
import { PullRequestApprovalActive } from "./_components/pull-request-approval-active";

export default function General() {
    const platformConfig = usePlatformConfig();
    const { repositoryId, directoryId } = useCodeReviewRouteParams();
    const form = useFormContext<CodeReviewFormType>();
    const { teamId } = useSelectedTeamId();
    const { removeQueries, generateQueryKey } =
        useReactQueryInvalidateQueries();

    const handleSubmit = form.handleSubmit(async (formData) => {
        const { language, ...config } = formData;

        // Remove reviewCadence when automation is disabled
        if (!formData.automatedReviewActive) delete config.reviewCadence;

        try {
            const [languageResult, reviewResult] = await Promise.all([
                createOrUpdateParameter(
                    ParametersConfigKey.LANGUAGE_CONFIG,
                    language,
                    teamId,
                ),
                createOrUpdateCodeReviewParameter(
                    config,
                    teamId,
                    repositoryId,
                    directoryId,
                ),
            ]);

            if (languageResult.error || reviewResult.error) {
                throw new Error(
                    `Failed to save settings: ${[
                        languageResult.error,
                        reviewResult.error,
                    ]
                        .filter(Boolean)
                        .join(", ")}`,
                );
            }

            await removeQueries({
                type: "all",
                queryKey: generateQueryKey(PARAMETERS_PATHS.GET_BY_KEY, {
                    params: {
                        key: ParametersConfigKey.CODE_REVIEW_CONFIG,
                        teamId,
                    },
                }),
            });

            form.reset({ ...config, language });

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

    const handleFileDownload = async () => {
        try {
            const downloadFile = await getGenerateKodusConfigFile(
                teamId,
                repositoryId,
            );

            const blob = new Blob([downloadFile], { type: "text/yaml" });
            const url = window.URL.createObjectURL(blob);

            const a = document.createElement("a");
            a.href = url;

            a.download = "kodus-config.yml";

            document.body.appendChild(a);
            a.click();

            a.remove();
            window.URL.revokeObjectURL(url);

            toast({
                description: "File downloaded",
                variant: "success",
            });
        } catch (error) {
            console.error("Erro ao salvar as configurações:", error);

            toast({
                title: "Error",
                description:
                    "An error occurred while generating the yml file. Please try again.",
                variant: "danger",
            });
        }
    };

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
                <CodeReviewPagesBreadcrumb pageName="General" />
            </Page.Header>

            <Page.Header>
                <Page.Title>General settings</Page.Title>
                <Page.HeaderActions>
                    <Button
                        size="md"
                        leftIcon={<DownloadIcon />}
                        onClick={async () => await handleFileDownload()}
                        variant="secondary"
                        loading={formIsSubmitting}>
                        Download{" "}
                        {repositoryId === "global" ? "Default" : "repository"}{" "}
                        YML configuration file
                    </Button>

                    <Button
                        size="md"
                        variant="primary"
                        leftIcon={<SaveIcon />}
                        onClick={handleSubmit}
                        disabled={!formIsDirty || !formIsValid}
                        loading={formIsSubmitting}>
                        Save settings
                    </Button>
                </Page.HeaderActions>
            </Page.Header>

            <Page.Content>
                <AutomatedReviewActive />
                <KodusConfigFileOverridesWebPreferences />
                <PullRequestApprovalActive />
                <IsRequestChangesActive />
                <AnalysisTypes />
                <IgnorePaths />
                <IgnoredTitleKeywords />
                <BaseBranches />

                {repositoryId === "global" && (
                    <FormProvider {...form}>
                        <LanguageSelector />
                    </FormProvider>
                )}
            </Page.Content>
        </Page.Root>
    );
}
