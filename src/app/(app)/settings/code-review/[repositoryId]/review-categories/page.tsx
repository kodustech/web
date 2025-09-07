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
import { SaveIcon } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { useSelectedTeamId } from "src/core/providers/selected-team-context";

import { CodeReviewPagesBreadcrumb } from "../../_components/breadcrumb";
import GeneratingConfig from "../../_components/generating-config";
import { type CodeReviewFormType } from "../../_types";
import { usePlatformConfig } from "../../../_components/context";
import { useCodeReviewRouteParams } from "../../../_hooks";
import { AnalysisTypes } from "../general/_components/analysis-types";
import { CodeReviewVersionSelector } from "../general/_components/code-review-version-selector";

export default function ReviewCategories() {
    const platformConfig = usePlatformConfig();
    const form = useFormContext<CodeReviewFormType>();
    const { teamId } = useSelectedTeamId();
    const { repositoryId, directoryId } = useCodeReviewRouteParams();
    const { resetQueries, generateQueryKey } = useReactQueryInvalidateQueries();

    const handleSubmit = form.handleSubmit(async (formData) => {
        try {
            console.log("🔍 Form data being sent:", formData);
            console.log("🔍 reviewOptions specifically:", formData.reviewOptions);
            console.log("🔍 codeReviewVersion:", formData.codeReviewVersion);
            console.log(
                "🔍 reviewOptions types:",
                Object.entries(formData.reviewOptions || {}).map(
                    ([key, value]) => `${key}: ${typeof value} (${value})`,
                ),
            );
            console.log("🔍 Total reviewOptions count:", Object.keys(formData.reviewOptions || {}).length);

            const result = await createOrUpdateCodeReviewParameter(
                formData,
                teamId,
                repositoryId,
                directoryId,
            );

            if (result.error) {
                throw new Error(`Failed to save settings: ${result.error}`);
            }

            await resetQueries({
                queryKey: generateQueryKey(PARAMETERS_PATHS.GET_BY_KEY, {
                    params: {
                        key: ParametersConfigKey.CODE_REVIEW_CONFIG,
                        teamId,
                    },
                }),
            });

            form.reset(formData);

            toast({
                description: "Settings saved",
                variant: "success",
            });
        } catch (error) {
            console.error("Error saving settings:", error);

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
                <CodeReviewPagesBreadcrumb pageName="Review Categories" />
            </Page.Header>

            <Page.Header>
                <Page.Title>Review Categories</Page.Title>

                <Page.HeaderActions>
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
                <CodeReviewVersionSelector />
                <AnalysisTypes />
            </Page.Content>
        </Page.Root>
    );
}
