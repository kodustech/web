"use client";

import { Suspense, useState } from "react";
import { Button } from "@components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@components/ui/dialog";
import { FormControl } from "@components/ui/form-control";
import { magicModal } from "@components/ui/magic-modal";
import { Skeleton } from "@components/ui/skeleton";
import { Spinner } from "@components/ui/spinner";
import { useSuspenseGetOnboardingPullRequests } from "@services/codeManagement/hooks";
import { PARAMETERS_PATHS } from "@services/parameters";
import { Eye } from "lucide-react";
import { useSelectedTeamId } from "src/core/providers/selected-team-context";
import type { LiteralUnion } from "src/core/types";
import { axiosAuthorized } from "src/core/utils/axios";
import { useOrganizationContext } from "src/features/organization/_providers/organization-context";

import { PRSummaryPreviewLoading } from "./_components/loading";
import { PRSummaryPreviewResult } from "./_components/result";
import { PRSummaryPreviewSelectRepositories } from "./_components/select-pull-request";

export interface PRSummaryPreviewModalProps {
    repositoryId: LiteralUnion<"global">;
    repositoryName: string;
    behaviourForExistingDescription: string;
    customInstructions: string;
}

type PullRequest = Awaited<
    ReturnType<typeof useSuspenseGetOnboardingPullRequests>
>[number];

interface PreviewResponse {
    data: string;
    statusCode: number;
    type: string;
}

export const PRSummaryPreviewModal = ({
    behaviourForExistingDescription,
    customInstructions,
    repositoryId,
    repositoryName,
}: PRSummaryPreviewModalProps) => {
    const [selectedPR, setSelectedPR] = useState<PullRequest | undefined>();
    const [isLoading, setIsLoading] = useState(false);
    const [previewResult, setPreviewResult] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const { teamId } = useSelectedTeamId();
    const { organizationId } = useOrganizationContext();

    // Determinar se estamos em configuração global ou de repositório específico
    const isGlobalConfig = repositoryId === "global";

    const handleGeneratePreview = async () => {
        if (!selectedPR) {
            setError("Please select a PR");
            return;
        }

        setIsLoading(true);
        setError(null);
        setPreviewResult(null);

        try {
            const response = await axiosAuthorized.post<PreviewResponse>(
                PARAMETERS_PATHS.PREVIEW_PR_SUMMARY,
                {
                    organizationId,
                    teamId,
                    prNumber: selectedPR.pull_number.toString(),
                    behaviourForExistingDescription,
                    customInstructions,
                    repository: isGlobalConfig
                        ? {
                              id: selectedPR.repository,
                              name: selectedPR.repository,
                          }
                        : {
                              id: repositoryId,
                              name: repositoryName,
                          },
                },
            );

            setPreviewResult(response.data || "No summary generated");
        } catch (err) {
            console.error("Error generating preview:", err);
            setError("Failed to generate preview. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open onOpenChange={magicModal.hide}>
            <DialogContent className="max-h-[90vh] max-w-4xl">
                <DialogHeader>
                    <DialogTitle>PR Summary Preview</DialogTitle>
                </DialogHeader>

                <div className="flex min-h-0 flex-1 flex-col gap-4">
                    {isLoading ? (
                        <PRSummaryPreviewLoading />
                    ) : (
                        <>
                            {previewResult && selectedPR ? (
                                <PRSummaryPreviewResult
                                    selectedPR={selectedPR}
                                    previewResult={previewResult}
                                    onResetState={() => {
                                        setPreviewResult(null);
                                        setError(null);
                                        setSelectedPR(undefined);
                                    }}
                                />
                            ) : (
                                <div className="flex flex-col gap-4">
                                    <FormControl.Root>
                                        <FormControl.Input>
                                            <Suspense
                                                fallback={
                                                    <Skeleton className="h-16">
                                                        <Spinner className="size-6" />
                                                    </Skeleton>
                                                }>
                                                <PRSummaryPreviewSelectRepositories
                                                    value={selectedPR}
                                                    isGlobalConfig={
                                                        isGlobalConfig
                                                    }
                                                    repositoryName={
                                                        repositoryName
                                                    }
                                                    repositoryId={repositoryId}
                                                    onChange={(pr) => {
                                                        setSelectedPR(pr);
                                                        setError(null);
                                                    }}
                                                />
                                            </Suspense>
                                        </FormControl.Input>

                                        <FormControl.Helper>
                                            {isGlobalConfig
                                                ? "Choose a PR from any repository to generate a preview summary"
                                                : "Choose a PR to generate a preview summary"}
                                        </FormControl.Helper>

                                        <FormControl.Error>
                                            {error}
                                        </FormControl.Error>
                                    </FormControl.Root>

                                    <DialogFooter>
                                        <DialogClose asChild>
                                            <Button size="md" variant="cancel">
                                                Cancel
                                            </Button>
                                        </DialogClose>

                                        <Button
                                            size="md"
                                            variant="primary"
                                            leftIcon={<Eye />}
                                            disabled={!selectedPR}
                                            onClick={() =>
                                                handleGeneratePreview()
                                            }>
                                            Generate Preview
                                        </Button>
                                    </DialogFooter>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};
