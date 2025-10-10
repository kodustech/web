"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SelectRepositories } from "@components/system/select-repositories";
import { Button } from "@components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@components/ui/dialog";
import { FormControl } from "@components/ui/form-control";
import { toast } from "@components/ui/toaster/use-toast";
import { useAsyncAction } from "@hooks/use-async-action";
import { useReactQueryInvalidateQueries } from "@hooks/use-invalidate-queries";
import { createOrUpdateRepositories } from "@services/codeManagement/fetch";
import type { Repository } from "@services/codeManagement/types";
import { INTEGRATION_CONFIG } from "@services/integrations/integrationConfig";
import { getIntegrationConfigsByCategory } from "@services/integrations/integrationConfig/hooks";
import {
    createOrUpdateCodeReviewParameter,
    getParameterByKey,
    updateCodeReviewParameterRepositories,
} from "@services/parameters/fetch";
import { ParametersConfigKey } from "@services/parameters/types";
import { CodeReviewSummaryOptions } from "src/app/(app)/settings/code-review/_types";
import { useAuth } from "src/core/providers/auth.provider";
import { useSelectedTeamId } from "src/core/providers/selected-team-context";
import { IntegrationCategory } from "src/core/types";
import { captureSegmentEvent } from "src/core/utils/segment";
import { PARAMETERS_PATHS } from "@services/parameters";

export default function Github() {
    const router = useRouter();
    const { teamId } = useSelectedTeamId();
    const { userId } = useAuth();

    const [open, setOpen] = useState(false);
    const [selectedRepositories, setSelectedRepositories] = useState<
        Repository[]
    >([]);

    const { data: integrationConfigs } = getIntegrationConfigsByCategory(
        teamId,
        IntegrationCategory.CODE_MANAGEMENT,
    );

    useEffect(() => {
        if (integrationConfigs) {
            const repoConfig = integrationConfigs.find(
                (config) => config.configKey === "repositories",
            );

            const repos =
                repoConfig &&
                Array.isArray(repoConfig?.configValue) &&
                repoConfig.configValue.every(
                    (repo) => typeof repo === "object" && repo !== null,
                )
                    ? (repoConfig.configValue as Repository[])
                    : [];

            if (repos && repos.length > 0) {
                setSelectedRepositories(repos);
            }
        }
    }, [integrationConfigs]);

    const { invalidateQueries, generateQueryKey } =
        useReactQueryInvalidateQueries();

    const [
        saveSelectedRepositoriesAction,
        { loading: loadingSaveRepositories },
    ] = useAsyncAction(async () => {
        await createOrUpdateRepositories(selectedRepositories, teamId);

        const codeReview: {
            configKey: string;
            configValue: any;
        } = await getParameterByKey(
            ParametersConfigKey.CODE_REVIEW_CONFIG,
            teamId,
        );

        if (!codeReview.configValue) {
            const defaultConfigs = {
                reviewOptions: {
                    code_style: true,
                    documentation_and_comments: true,
                    error_handling: true,
                    maintainability: true,
                    performance_and_optimization: true,
                    potential_issues: true,
                    refactoring: true,
                    security: true,
                    kody_rules: true,
                    breaking_changes: true,
                },
                summary: {
                    generatePRSummary: true,
                    customInstructions: "",
                    behaviourForExistingDescription:
                        CodeReviewSummaryOptions.CONCATENATE,
                },
                pullRequestApprovalActive: false,
                automatedReviewActive: false,
                kodusConfigFileOverridesWebPreferences: true,
                isRequestChangesActive: false,
                kodyRulesGeneratorEnabled: true,
                runOnDraft: true,
            };
            await createOrUpdateCodeReviewParameter(
                defaultConfigs,
                teamId,
                undefined,
            );
        }

        await updateCodeReviewParameterRepositories(teamId);

        await Promise.all([
            invalidateQueries({
                queryKey: generateQueryKey(PARAMETERS_PATHS.GET_BY_KEY, {
                    params: {
                        key: ParametersConfigKey.CODE_REVIEW_CONFIG,
                        teamId,
                    },
                }),
            }),
            invalidateQueries({
                queryKey: generateQueryKey(
                    PARAMETERS_PATHS.GET_CODE_REVIEW_PARAMETER,
                    {
                        params: {
                            teamId,
                        },
                    },
                ),
            }),
        ]);

        toast({
            variant: "success",
            title: "Repositories saved",
        });

        await captureSegmentEvent({
            userId: userId!,
            event: "select_repositories_changed",
            properties: {
                platform: "github",
                newQuantityOfRepositories: selectedRepositories.length,
            },
        });

        await invalidateQueries({
            type: "all",
            queryKey: generateQueryKey(
                INTEGRATION_CONFIG.GET_INTEGRATION_CONFIG_BY_CATEGORY,
                {
                    params: {
                        teamId,
                        integrationCategory:
                            IntegrationCategory.CODE_MANAGEMENT,
                    },
                },
            ),
        });

        router.push(`/settings/integrations`);
    });

    return (
        <Dialog
            open
            onOpenChange={() => {
                router.push(`/settings/integrations`);
            }}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Github repositories setup</DialogTitle>

                    <DialogDescription>
                        Select the repositories you want to use Kody
                    </DialogDescription>
                </DialogHeader>

                <FormControl.Root className="w-full">
                    <FormControl.Input>
                        <SelectRepositories
                            open={open}
                            teamId={teamId}
                            onOpenChange={setOpen}
                            selectedRepositories={selectedRepositories}
                            onChangeSelectedRepositories={
                                setSelectedRepositories
                            }
                        />
                    </FormControl.Input>
                </FormControl.Root>

                <DialogFooter>
                    <DialogClose>
                        <Button size="md" variant="cancel">
                            Cancel
                        </Button>
                    </DialogClose>

                    <Button
                        size="md"
                        variant="primary"
                        disabled={selectedRepositories.length === 0}
                        onClick={saveSelectedRepositoriesAction}
                        loading={loadingSaveRepositories}>
                        Edit repositories
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
