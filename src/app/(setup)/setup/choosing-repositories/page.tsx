"use client";

import { useState } from "react";
import { redirect, useRouter } from "next/navigation";
import { SelectRepositories } from "@components/system/select-repositories";
import { Alert, AlertDescription, AlertTitle } from "@components/ui/alert";
import { Avatar, AvatarImage } from "@components/ui/avatar";
import { Button } from "@components/ui/button";
import { FormControl } from "@components/ui/form-control";
import { Heading } from "@components/ui/heading";
import { SvgKodus } from "@components/ui/icons/SvgKodus";
import { Page } from "@components/ui/page";
import { useAsyncAction } from "@hooks/use-async-action";
import { createOrUpdateRepositories } from "@services/codeManagement/fetch";
import type { Repository } from "@services/codeManagement/types";
import { fastSyncIDERules } from "@services/kodyRules/fetch";
import {
    createOrUpdateCodeReviewParameter,
    getParameterByKey,
    updateCodeReviewParameterRepositories,
} from "@services/parameters/fetch";
import { useSuspenseGetCodeReviewParameter } from "@services/parameters/hooks";
import { ParametersConfigKey } from "@services/parameters/types";
import { useSuspenseGetConnections } from "@services/setup/hooks";
import { InfoIcon, PowerIcon } from "lucide-react";
import {
    CodeReviewSummaryOptions,
    type CodeReviewGlobalConfig,
} from "src/app/(app)/settings/code-review/_types";
import { useAuth } from "src/core/providers/auth.provider";
import { useSelectedTeamId } from "src/core/providers/selected-team-context";
import { captureSegmentEvent } from "src/core/utils/segment";

import { StepIndicators } from "../_components/step-indicators";

export default function App() {
    const router = useRouter();
    const { userId } = useAuth();
    const { teamId } = useSelectedTeamId();

    const { configValue } = useSuspenseGetCodeReviewParameter(teamId);
    if (configValue?.repositories?.length) redirect("/setup/review-mode");

    const [open, setOpen] = useState(false);
    const [selectedRepositories, setSelectedRepositories] = useState<
        Repository[]
    >([]);

    const connections = useSuspenseGetConnections(teamId);

    const codeManagementConnections = connections.filter(
        (c) => c.category === "CODE_MANAGEMENT" && c.hasConnection,
    );

    const [
        saveSelectedRepositoriesAction,
        { loading: loadingSaveRepositories },
    ] = useAsyncAction(async () => {
        const reposToSave = selectedRepositories.map((repo) => ({
            ...repo,
            selected: true,
        }));

        await createOrUpdateRepositories(reposToSave, teamId);

        const codeReview: {
            configKey: string;
            configValue: any;
        } = await getParameterByKey(
            ParametersConfigKey.CODE_REVIEW_CONFIG,
            teamId,
        );

        if (!codeReview.configValue) {
            const defaultConfigs: Partial<CodeReviewGlobalConfig> = {
                automatedReviewActive: true,
                reviewOptions: {
                    bug: true,
                    security: true,
                    code_style: false,
                    cross_file: true,
                    kody_rules: true,
                    performance: true,
                    refactoring: false,
                    error_handling: false,
                    maintainability: false,
                    breaking_changes: true,
                    potential_issues: true,
                    documentation_and_comments: false,
                    performance_and_optimization: false,
                },
                summary: {
                    generatePRSummary: true,
                    customInstructions: "",
                    behaviourForExistingDescription:
                        CodeReviewSummaryOptions.CONCATENATE,
                },
                pullRequestApprovalActive: false,
                isRequestChangesActive: false,
                kodyRulesGeneratorEnabled: true,
                runOnDraft: true,
                codeReviewVersion: "v2",
            };

            await createOrUpdateCodeReviewParameter(
                defaultConfigs,
                teamId,
                undefined,
            );
        }

        await updateCodeReviewParameterRepositories(teamId);

        if (teamId) {
            const fastSyncPromises = selectedRepositories.map((repo) =>
                fastSyncIDERules({ teamId, repositoryId: repo.id }).catch(
                    (error) => {
                        console.error(
                            "Error fast syncing IDE rules for repo",
                            repo.id,
                            error,
                        );
                    },
                ),
            );

            void Promise.allSettled(fastSyncPromises);
        }

        await captureSegmentEvent({
            userId: userId!,
            event: "setup_select_repositories",
            properties: {
                platform: codeManagementConnections
                    .at(0)
                    ?.platformName.toLowerCase(),
                quantityOfRepositories: selectedRepositories.length,
            },
        });

        router.replace("/setup/review-mode");
    });

    return (
        <Page.Root className="mx-auto flex h-full min-h-[calc(100vh-4rem)] w-full flex-row overflow-hidden p-6">
            <div className="bg-card-lv1 flex flex-10 flex-col justify-center gap-10 rounded-3xl p-12">
                <div className="text-text-secondary flex flex-1 flex-col justify-center gap-8 text-[15px]">
                    <div className="flex flex-col gap-4">
                        <svg
                            width="34"
                            height="30"
                            viewBox="0 0 34 30"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg">
                            <path
                                fill="#6A57A4"
                                fillOpacity="0.2"
                                d="M23.2503 29.5833C22.1453 29.5833 21.0855 29.1443 20.3041 28.3629C19.5226 27.5815 19.0837 26.5217 19.0837 25.4166V12.9166C19.0837 6.39575 22.5212 2.09784 28.9941 0.479084C29.2602 0.410395 29.5373 0.395037 29.8093 0.433901C30.0814 0.472763 30.3431 0.565081 30.5794 0.705526C30.8156 0.845974 31.0217 1.03178 31.1859 1.25223C31.35 1.47269 31.4689 1.72344 31.5356 1.99004C31.6024 2.25664 31.6158 2.53382 31.575 2.80561C31.5342 3.07741 31.44 3.33844 31.2979 3.57368C31.1558 3.80891 30.9685 4.0137 30.7469 4.17624C30.5252 4.33879 30.2736 4.45587 30.0066 4.52075C25.367 5.68117 23.2503 8.327 23.2503 12.9166V14.9999H29.5003C30.5515 14.9996 31.564 15.3966 32.3348 16.1114C33.1056 16.8261 33.5777 17.8058 33.6566 18.8541L33.667 19.1666V25.4166C33.667 26.5217 33.228 27.5815 32.4466 28.3629C31.6652 29.1443 30.6054 29.5833 29.5003 29.5833H23.2503ZM4.50033 29.5833C3.39526 29.5833 2.33545 29.1443 1.55405 28.3629C0.772652 27.5815 0.333664 26.5217 0.333664 25.4166V12.9166C0.333664 6.39575 3.77116 2.09784 10.2441 0.479084C10.5102 0.410395 10.7873 0.395037 11.0594 0.433901C11.3314 0.472763 11.5931 0.565081 11.8294 0.705526C12.0656 0.845974 12.2717 1.03178 12.4359 1.25223C12.6 1.47269 12.7189 1.72344 12.7856 1.99004C12.8524 2.25664 12.8658 2.53382 12.825 2.80561C12.7842 3.07741 12.69 3.33844 12.5479 3.57368C12.4058 3.80891 12.2185 4.0137 11.9969 4.17624C11.7752 4.33879 11.5236 4.45587 11.2566 4.52075C6.617 5.68117 4.50033 8.327 4.50033 12.9166V14.9999H10.7503C11.8015 14.9996 12.814 15.3966 13.5848 16.1114C14.3556 16.8261 14.8277 17.8058 14.9066 18.8541L14.917 19.1666V25.4166C14.917 26.5217 14.478 27.5815 13.6966 28.3629C12.9152 29.1443 11.8554 29.5833 10.7503 29.5833H4.50033Z"
                            />
                        </svg>

                        <p>
                            Kodus has had a huge impact on our workflow by
                            saving us valuable time during PR reviews. It
                            consistently catches the small details that are easy
                            to miss, and the ability to set up custom rules
                            means we can align automated reviews with our own
                            standards.
                        </p>
                        <p className="text-success">
                            This has helped us maintain higher quality while
                            reducing the manual burden on the team.
                        </p>
                    </div>

                    <div className="flex flex-row gap-4">
                        <Avatar>
                            <AvatarImage src="https://t5y4w6q9.rocketcdn.me/wp-content/uploads/2025/04/Jonathan-Georgeu-1-1.jpeg" />
                        </Avatar>

                        <div>
                            <strong>Jonathan Georgeu</strong>
                            <p>Origen</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-14 flex-col items-center justify-center gap-10 p-10">
                <div className="flex max-w-96 flex-1 flex-col justify-center gap-10">
                    <StepIndicators.Auto />

                    <div className="flex flex-col gap-2">
                        <Heading variant="h2">
                            You're one click away from smarter reviews
                        </Heading>

                        <p className="text-text-secondary text-sm">
                            Select the repositories where Kody will help your
                            team streamline reviews and boost quality.
                        </p>
                    </div>

                    <div className="flex flex-col gap-4">
                        <FormControl.Root>
                            <FormControl.Label htmlFor="select-repositories">
                                Select repositories
                            </FormControl.Label>

                            <FormControl.Input>
                                <SelectRepositories
                                    open={open}
                                    onOpenChange={setOpen}
                                    selectedRepositories={selectedRepositories}
                                    onChangeSelectedRepositories={
                                        setSelectedRepositories
                                    }
                                    teamId={teamId}
                                />
                            </FormControl.Input>
                        </FormControl.Root>

                        <Button
                            size="lg"
                            variant="primary"
                            className="w-full"
                            rightIcon={<PowerIcon />}
                            loading={loadingSaveRepositories}
                            onClick={saveSelectedRepositoriesAction}
                            disabled={selectedRepositories.length === 0}>
                            Turn on automation
                        </Button>
                    </div>
                </div>

                <Alert variant="success" className="max-w-96">
                    <InfoIcon />
                    <AlertTitle>You’re in control</AlertTitle>
                    <AlertDescription className="mt-2 -ml-8">
                        Kody only acts when you ask — no changes or reviews
                        happen without your approval.
                    </AlertDescription>
                </Alert>
            </div>
        </Page.Root>
    );
}
