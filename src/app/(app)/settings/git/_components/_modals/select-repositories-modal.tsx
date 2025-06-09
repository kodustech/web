"use client";

import { useState } from "react";
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
import { MagicModalContext } from "@components/ui/magic-modal";
import { toast } from "@components/ui/toaster/use-toast";
import { useAsyncAction } from "@hooks/use-async-action";
import { useReactQueryInvalidateQueries } from "@hooks/use-invalidate-queries";
import { createOrUpdateRepositories } from "@services/codeManagement/fetch";
import type { Repository } from "@services/codeManagement/types";
import { INTEGRATION_CONFIG } from "@services/integrations/integrationConfig";
import { PARAMETERS_PATHS } from "@services/parameters";
import {
    createOrUpdateCodeReviewParameter,
    getParameterByKey,
    updateCodeReviewParameterRepositories,
} from "@services/parameters/fetch";
import { ParametersConfigKey } from "@services/parameters/types";
import { CodeReviewSummaryOptions } from "src/app/(app)/settings/code-review/_components/pages/types";
import { useAuth } from "src/core/providers/auth.provider";
import { useSelectedTeamId } from "src/core/providers/selected-team-context";
import { IntegrationCategory } from "src/core/types";
import { captureSegmentEvent } from "src/core/utils/segment";

export const SelectRepositoriesModal = (props: {
    platformName: string;
    segmentPlatformName: string;
    selectedRepositories: Repository[];
}) => {
    const router = useRouter();
    const { teamId } = useSelectedTeamId();
    const { userId } = useAuth();
    const { invalidateQueries, generateQueryKey } =
        useReactQueryInvalidateQueries();

    const [isLoadingRepositories, setIsLoadingRepositories] = useState(true);

    const [open, setOpen] = useState(false);
    const [selectedRepositories, setSelectedRepositories] = useState<
        Repository[]
    >(props.selectedRepositories);

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
            };
            await createOrUpdateCodeReviewParameter(
                defaultConfigs,
                teamId,
                undefined,
            );
        }

        await updateCodeReviewParameterRepositories(teamId);

        toast({
            variant: "success",
            title: "Repositories saved",
        });

        await Promise.all([
            invalidateQueries({
                type: "all",
                queryKey: generateQueryKey(PARAMETERS_PATHS.GET_BY_KEY, {
                    params: {
                        key: ParametersConfigKey.CODE_REVIEW_CONFIG,
                        teamId,
                    },
                }),
            }),

            invalidateQueries({
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
            }),
        ]);

        captureSegmentEvent({
            userId: userId!,
            event: "select_repositories_changed",
            properties: {
                platform: props.segmentPlatformName,
                newQuantityOfRepositories: selectedRepositories.length,
            },
        });

        router.push("/settings/git");
    });

    const closeable =
        props.selectedRepositories.length > 0 && !loadingSaveRepositories;

    return (
        <MagicModalContext value={{ closeable }}>
            <Dialog
                open
                onOpenChange={() => {
                    router.push("/settings/git");
                }}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {props.platformName} repositories setup
                        </DialogTitle>

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
                                onFinishLoading={() =>
                                    setIsLoadingRepositories(false)
                                }
                                onChangeSelectedRepositories={
                                    setSelectedRepositories
                                }
                            />
                        </FormControl.Input>
                    </FormControl.Root>

                    <DialogFooter>
                        {closeable && (
                            <DialogClose>
                                <Button size="md" variant="cancel">
                                    Cancel
                                </Button>
                            </DialogClose>
                        )}

                        <Button
                            size="md"
                            variant="primary"
                            loading={loadingSaveRepositories}
                            onClick={saveSelectedRepositoriesAction}
                            disabled={
                                selectedRepositories.length === 0 ||
                                isLoadingRepositories
                            }>
                            Edit repositories
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </MagicModalContext>
    );
};
