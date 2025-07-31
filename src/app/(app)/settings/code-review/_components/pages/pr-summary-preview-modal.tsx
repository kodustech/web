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

import { useOrganizationContext } from "src/features/organization/_providers/organization-context";
import { useSelectedTeamId } from "src/core/providers/selected-team-context";
import { axiosAuthorized } from "src/core/utils/axios";
import { Eye } from "lucide-react";
import { useSuspenseGetOnboardingPullRequests } from "@services/codeManagement/hooks";
import { useSuspenseGetCodeReviewParameter } from "@services/parameters/hooks";
import type { Repository } from "@services/codeManagement/types";
import type { CodeReviewRepositoryConfig } from "./types";

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
    const [selectedRepository, setSelectedRepository] = useState<CodeReviewRepositoryConfig | undefined>();
    const [isLoading, setIsLoading] = useState(false);
    const [previewResult, setPreviewResult] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

        const { organizationId } = useOrganizationContext();
    const { teamId } = useSelectedTeamId();

    // Buscar todos os PRs do time
    const allPullRequests = useSuspenseGetOnboardingPullRequests(teamId);

        // Buscar configuração de code review para obter repositórios configurados
    const codeReviewConfig = useSuspenseGetCodeReviewParameter(teamId);
    const configuredRepositories = codeReviewConfig?.configValue?.repositories || [];

    // Determinar se estamos em configuração global ou de repositório específico
    const isGlobalConfig = repositoryId === "global";

        // Filtrar PRs baseado no contexto
    const getRepositoryPullRequests = () => {
        if (isGlobalConfig) {
            // Para configuração global, usar o repositório selecionado
            if (!selectedRepository) return [];
            return allPullRequests.filter(
                pr => pr.repository === selectedRepository.name || pr.repository === selectedRepository.id
            );
        } else {
            // Para configuração de repositório específico, mostrar todos os PRs
            // O filtro por repositório específico pode estar falhando devido a diferenças nos nomes
            return allPullRequests;
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
                    id: isGlobalConfig ? selectedRepository?.id || "" : repositoryId,
                    name: isGlobalConfig ? selectedRepository?.name || "" : repositoryName,
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
                        id: isGlobalConfig ? selectedRepository?.id || "" : repositoryId,
                        name: isGlobalConfig ? selectedRepository?.name || "" : repositoryName,
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
        setSelectedRepository(undefined);
        setPreviewResult(null);
        setError(null);
        setIsLoading(false);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle>PR Summary Preview</DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-4 flex-1 overflow-y-auto">
                    {!previewResult && !isLoading && (
                        <div className="flex flex-col gap-4">
                            {/* Para configuração global, mostrar seletor de repositório primeiro */}
                            {isGlobalConfig && (
                                <FormControl.Root>
                                    <FormControl.Label>
                                        Select Repository
                                    </FormControl.Label>
                                    <FormControl.Helper>
                                        Choose a repository to select a PR from
                                    </FormControl.Helper>
                                    <FormControl.Input>
                                        {configuredRepositories.length > 0 ? (
                                            <div className="space-y-2">
                                                {configuredRepositories.map((repo) => (
                                                    <Button
                                                        key={repo.id}
                                                        size="md"
                                                        variant={selectedRepository?.id === repo.id ? "helper" : "cancel"}
                                                        className="w-full justify-start"
                                                        onClick={() => {
                                                            setSelectedRepository(repo);
                                                            setSelectedPR(undefined); // Reset PR selection when repo changes
                                                            setError(null);
                                                        }}>
                                                        <div className="flex flex-col items-start">
                                                            <span className="font-medium">{repo.name}</span>
                                                            <span className="text-text-secondary text-xs">
                                                                Repository ID: {repo.id}
                                                            </span>
                                                        </div>
                                                    </Button>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="p-4 text-center text-text-secondary border border-card-lv2 rounded-lg">
                                                No repositories configured for code review
                                            </div>
                                        )}
                                    </FormControl.Input>
                                </FormControl.Root>
                            )}

                            {/* Seletor de PR - só mostrar se tiver repositório selecionado (global) ou sempre (repo específico) */}
                            {(!isGlobalConfig || selectedRepository) && (
                                <FormControl.Root>
                                    <FormControl.Label>
                                        Select a Pull Request
                                    </FormControl.Label>
                                    <FormControl.Helper>
                                        {isGlobalConfig
                                            ? "Choose a PR from the repository to generate a preview summary"
                                            : "Choose a PR to generate a preview summary (showing all available PRs)"
                                        }
                                    </FormControl.Helper>
                                    <FormControl.Input>
                                        {repositoryPullRequests.length > 0 ? (
                                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                                {repositoryPullRequests.map((pr, index) => (
                                                    <Button
                                                        key={`${pr.id}-${pr.pull_number}-${index}`}
                                                        size="md"
                                                        variant={selectedPR?.id === pr.id ? "helper" : "cancel"}
                                                        className="w-full justify-start"
                                                        onClick={() => {
                                                            console.log('PR Selected:', pr);
                                                            setSelectedPR(pr);
                                                            setError(null);
                                                        }}>
                                                        <div className="flex flex-col items-start">
                                                            <span className="font-medium">
                                                                #{pr.pull_number} - {pr.title}
                                                            </span>
                                                        </div>
                                                    </Button>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="p-4 text-center text-text-secondary border border-card-lv2 rounded-lg">
                                                {isGlobalConfig && !selectedRepository
                                                    ? "Please select a repository first"
                                                    : "No pull requests found for this repository"
                                                }
                                            </div>
                                        )}
                                    </FormControl.Input>
                                    {error && (
                                        <FormControl.Error>
                                            {error}
                                        </FormControl.Error>
                                    )}
                                </FormControl.Root>
                            )}

                            <div className="flex justify-end gap-2">
                                <Button size="md" variant="cancel" onClick={handleClose}>
                                    Cancel
                                </Button>
                                <Button
                                    size="md"
                                    variant="primary"
                                    leftIcon={<Eye />}
                                    disabled={
                                        !selectedPR ||
                                        repositoryPullRequests.length === 0 ||
                                        (isGlobalConfig && !selectedRepository)
                                    }
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
                            <div className="flex items-center justify-between">
                                <Heading variant="h3">
                                    Preview for PR #{selectedPR?.pull_number}
                                    {isGlobalConfig && selectedRepository && (
                                        <span className="text-text-secondary text-sm ml-2">
                                            from {selectedRepository.name}
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
                                        if (isGlobalConfig) {
                                            setSelectedRepository(undefined);
                                        }
                                    }}>
                                    Generate Another
                                </Button>
                            </div>

                            <div className="bg-background-secondary border border-card-lv2 rounded-lg p-4 flex-1 overflow-auto">
                                <pre className="whitespace-pre-wrap text-sm leading-relaxed font-mono">
                                    {previewResult}
                                </pre>
                            </div>

                            <div className="flex justify-end">
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
