"use client";

import { useState } from "react";
import { Button } from "@components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@components/ui/dialog";
import { FormControl } from "@components/ui/form-control";
import { Heading } from "@components/ui/heading";
import { Spinner } from "@components/ui/spinner";
import { SelectPullRequest } from "@components/system/select-pull-requests";

import { useOrganizationContext } from "src/features/organization/_providers/organization-context";
import { useSelectedTeamId } from "src/core/providers/selected-team-context";
import { axiosAuthorized } from "src/core/utils/axios";
import { Eye } from "lucide-react";
import { useSuspenseGetOnboardingPullRequests } from "@services/codeManagement/hooks";

interface PRSummaryPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    repositoryId: string;
    repositoryName: string;
    behaviourForExistingDescription: string;
    customInstructions: string;
}

interface PreviewResponse {
    data: string;
    statusCode: number;
    type: string;
}

type PullRequest = {
    id: string;
    pull_number: number;
    repository: string;
    title: string;
    url: string;
};

export const PRSummaryPreviewModal = ({
    isOpen,
    onClose,
    repositoryId,
    repositoryName,
    behaviourForExistingDescription,
    customInstructions,
}: PRSummaryPreviewModalProps) => {
    const [selectedPR, setSelectedPR] = useState<PullRequest | undefined>();
    const [isLoading, setIsLoading] = useState(false);
    const [previewResult, setPreviewResult] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const { organizationId } = useOrganizationContext();
    const { teamId } = useSelectedTeamId();

    // Buscar todos os PRs do time
    const allPullRequests = useSuspenseGetOnboardingPullRequests(teamId);

    // Determinar se estamos em configuração global ou de repositório específico
    const isGlobalConfig = repositoryId === "global";

    // Filtrar PRs baseado no contexto
    const getRepositoryPullRequests = () => {
        if (isGlobalConfig) {
            // Para configuração global, mostrar todos os PRs
            return allPullRequests;
        } else {
            // Para configuração de repositório específico, filtrar por repositório
            return allPullRequests.filter(
                pr => pr.repository === repositoryName || pr.repository === repositoryId
            );
        }
    };

    const repositoryPullRequests = getRepositoryPullRequests();

    const handleGeneratePreview = async () => {
        if (!selectedPR) {
            setError("Please select a PR");
            return;
        }

        setIsLoading(true);
        setError(null);
        setPreviewResult(null);

        try {
            console.log('Sending request with data:', {
                organizationId,
                teamId,
                repository: {
                    id: isGlobalConfig ? selectedPR.repository : repositoryId,
                    name: isGlobalConfig ? selectedPR.repository : repositoryName,
                },
                prNumber: selectedPR.pull_number.toString(),
                behaviourForExistingDescription,
                customInstructions,
            });

            const response = await axiosAuthorized.post<PreviewResponse>(
                "http://localhost:3001/parameters/preview-pr-summary",
                {
                    organizationId,
                    teamId,
                    repository: {
                        id: isGlobalConfig ? selectedPR.repository : repositoryId,
                        name: isGlobalConfig ? selectedPR.repository : repositoryName,
                    },
                    prNumber: selectedPR.pull_number.toString(),
                    behaviourForExistingDescription,
                    customInstructions,
                }
            );

            console.log('API Response:', response);
            setPreviewResult(response.data || "No summary generated");
        } catch (err) {
            console.error("Error generating preview:", err);
            setError("Failed to generate preview. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setSelectedPR(undefined);
        setPreviewResult(null);
        setError(null);
        setIsLoading(false);
        setDropdownOpen(false);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-6">
                <DialogHeader className="flex-shrink-0">
                    <DialogTitle>PR Summary Preview</DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-4 flex-1 overflow-y-auto min-h-0">
                    {!previewResult && !isLoading && (
                        <div className="flex flex-col gap-4">
                            <FormControl.Root>
                                <FormControl.Label>
                                    Select a Pull Request
                                </FormControl.Label>
                                <FormControl.Helper>
                                    {isGlobalConfig
                                        ? "Choose a PR from any repository to generate a preview summary"
                                        : "Choose a PR to generate a preview summary"
                                    }
                                </FormControl.Helper>
                                <FormControl.Input>
                                    {repositoryPullRequests.length > 0 ? (
                                        <SelectPullRequest
                                            pullRequests={repositoryPullRequests}
                                            disabled={isLoading}
                                            open={dropdownOpen}
                                            onOpenChange={setDropdownOpen}
                                            value={selectedPR}
                                            onChange={(pr) => {
                                                setSelectedPR(pr);
                                                setDropdownOpen(false);
                                                setError(null);
                                            }}
                                        />
                                    ) : (
                                        <div className="p-4 text-center text-text-secondary border border-card-lv2 rounded-lg">
                                            No pull requests found
                                        </div>
                                    )}
                                </FormControl.Input>
                                {error && (
                                    <FormControl.Error>
                                        {error}
                                    </FormControl.Error>
                                )}
                            </FormControl.Root>

                            <div className="flex justify-end gap-2 flex-shrink-0">
                                <Button size="md" variant="cancel" onClick={handleClose}>
                                    Cancel
                                </Button>
                                <Button
                                    size="md"
                                    variant="primary"
                                    leftIcon={<Eye />}
                                    disabled={!selectedPR || repositoryPullRequests.length === 0}
                                    onClick={() => {
                                        console.log('Generate Preview clicked, selectedPR:', selectedPR);
                                        handleGeneratePreview();
                                    }}>
                                    Generate Preview
                                </Button>
                            </div>
                        </div>
                    )}

                    {isLoading && (
                        <div className="flex flex-col items-center justify-center py-12 gap-4">
                            <Spinner />
                            <div className="text-center">
                                <Heading variant="h3">Generating PR Summary</Heading>
                                <p className="text-text-secondary text-sm">
                                    This may take a few moments...
                                </p>
                            </div>
                        </div>
                    )}

                    {previewResult && (
                        <div className="flex flex-col gap-4 flex-1 overflow-y-auto">
                            <div className="flex items-center justify-between flex-shrink-0">
                                <Heading variant="h3">
                                    Preview for PR #{selectedPR?.pull_number}
                                    {selectedPR && (
                                        <span className="text-text-secondary text-sm ml-2">
                                            from {selectedPR.repository}
                                        </span>
                                    )}
                                </Heading>
                                <Button
                                    size="sm"
                                    variant="cancel"
                                    onClick={() => {
                                        setPreviewResult(null);
                                        setError(null);
                                        setSelectedPR(undefined);
                                    }}>
                                    Generate Another
                                </Button>
                            </div>

                            <div className="bg-background-secondary border border-card-lv2 rounded-lg p-4 flex-1 overflow-auto">
                                <pre className="whitespace-pre-wrap text-sm leading-relaxed font-mono">
                                    {previewResult}
                                </pre>
                            </div>

                            <div className="flex justify-end flex-shrink-0">
                                <Button size="md" variant="primary" onClick={handleClose}>
                                    Close
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};
