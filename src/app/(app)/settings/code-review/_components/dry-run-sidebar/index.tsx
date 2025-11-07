"use client";

import { useEffect, useState } from "react";
import { SelectPullRequest } from "@components/system/select-pull-requests";
import { Button } from "@components/ui/button";
import { Label } from "@components/ui/label";
import {
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from "@components/ui/sheet";
import { useEffectOnce } from "@hooks/use-effect-once";
import { getPrsByRepository } from "@services/codeManagement/fetch";
import { executeDryRun } from "@services/dryRun/fetch";
import { PREVIEW_JOB_ID_KEY, useDryRun } from "@services/dryRun/hooks";
import { DryRunStatus, IDryRunData } from "@services/dryRun/types";
import { Eye, Info, Loader2, RefreshCw } from "lucide-react";
import { useSelectedTeamId } from "src/core/providers/selected-team-context";
import { AwaitedReturnType } from "src/core/types";

import { useCodeReviewRouteParams } from "../../../_hooks";
import { EmptyState } from "./empty";
import { SelectHistoryItem } from "./history";
import { Results } from "./results";

export const DryRunSidebar = () => {
    const { teamId } = useSelectedTeamId();
    const { repositoryId } = useCodeReviewRouteParams();

    const [pullRequests, setPullRequests] = useState<
        AwaitedReturnType<typeof getPrsByRepository>
    >([]);
    const [isPrsLoading, setIsPrsLoading] = useState(false);

    useEffect(() => {
        const fetchPrs = async () => {
            setIsPrsLoading(true);
            try {
                const prs = await getPrsByRepository(teamId, repositoryId, {
                    state: "closed",
                });
                setPullRequests(prs);
            } catch (err) {
                console.error("Failed to fetch pull requests:", err);
            } finally {
                setIsPrsLoading(false);
            }
        };

        if (teamId && repositoryId) {
            fetchPrs();
        }
    }, [teamId, repositoryId]);

    useEffectOnce(() => {
        const activeJobId = sessionStorage.getItem(PREVIEW_JOB_ID_KEY);
        if (activeJobId) {
            setCorrelationId(activeJobId);
        }
    });

    const [prsOpen, setPrsOpen] = useState(false);
    const [selectedPR, setSelectedPR] = useState<
        NonNullable<typeof pullRequests>[number] | undefined
    >();

    const [historyOpen, setHistoryOpen] = useState(false);

    const [correlationId, setCorrelationId] = useState<string | null>(null);
    const [isStarting, setIsStarting] = useState(false);

    const { messages, status, description, isLoading, isConnected, error } =
        useDryRun({
            correlationId,
            teamId,
        });

    const handleGeneratePreview = async () => {
        setIsStarting(true);
        setCorrelationId(null);

        const prNumber = selectedPR ? selectedPR.pull_number : null;
        const repositoryId = selectedPR ? selectedPR.repositoryId : null;

        if (!prNumber || !repositoryId) {
            setIsStarting(false);
            return;
        }

        const response = await executeDryRun(teamId, repositoryId, prNumber);

        const jobId = response;
        sessionStorage.setItem(PREVIEW_JOB_ID_KEY, jobId);
        setCorrelationId(jobId);

        setIsStarting(false);
    };

    const showLoading = isStarting || isLoading;
    const hasData = messages.length > 0 || !!status;
    const isComplete = status === DryRunStatus.COMPLETED && !isConnected;

    const loadingPrs = (
        <div className="text-text-secondary flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading Pull Requests...</span>
        </div>
    );

    return (
        <SheetContent className="sm:max-w-8xl flex flex-col p-0">
            <SheetHeader className="bg-card-lv1 p-4">
                <div className="flex items-center gap-3">
                    <div className="text-primary-light bg-card-lv3 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                        <Eye className="h-6 w-6" />
                    </div>
                    <div>
                        <SheetTitle>Preview</SheetTitle>
                        <SheetDescription>
                            Preview code review results
                        </SheetDescription>
                    </div>
                </div>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto">
                <div className="space-y-6 p-4">
                    <div className="space-y-2">
                        <Label htmlFor="pr-select">Select a Pull Request</Label>
                        {isPrsLoading ? (
                            loadingPrs
                        ) : (
                            <SelectPullRequest
                                pullRequests={pullRequests!}
                                disabled={showLoading}
                                open={prsOpen}
                                onOpenChange={setPrsOpen}
                                value={selectedPR}
                                onChange={(v) => {
                                    setSelectedPR(v);
                                    setPrsOpen(false);
                                }}
                            />
                        )}
                    </div>

                    <Button
                        size="lg"
                        variant="primary"
                        className="w-full font-semibold"
                        onClick={handleGeneratePreview}
                        disabled={isLoading}>
                        {isLoading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <RefreshCw className="mr-2 h-4 w-4" />
                        )}
                        {isLoading
                            ? status || "Generating..."
                            : "Generate Preview"}
                    </Button>

                    <div className="relative flex items-center justify-center">
                        <div className="border-border-divider w-full border-t"></div>
                        <span className="bg-background text-text-tertiary absolute px-2 text-xs uppercase">
                            Or
                        </span>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="history-select">
                            Load a past preview
                        </Label>
                        <SelectHistoryItem
                            id="history-select"
                            open={historyOpen}
                            onOpenChange={setHistoryOpen}
                            disabled={showLoading}
                            value={correlationId}
                            onChange={(value) => {
                                setCorrelationId(value);
                                setSelectedPR(undefined);
                                setHistoryOpen(false);
                            }}
                        />
                    </div>

                    <div className="border-border-divider w-full border-t"></div>
                </div>

                <div className="p-4 pt-0">
                    {error && (
                        <div className="text-destructive border-destructive/50 bg-destructive/10 rounded-lg border p-4">
                            <strong>Error:</strong> {error}
                        </div>
                    )}
                    {!hasData && !isLoading && !error ? <EmptyState /> : null}
                    {hasData ? (
                        <Results
                            messages={messages}
                            status={status}
                            description={description}
                            isComplete={!isConnected && !error}
                        />
                    ) : null}
                </div>
            </div>

            <SheetFooter className="bg-card-lv1 p-4">
                <div className="flex w-full items-center gap-2 text-sm">
                    <Info className="h-4 w-4 flex-shrink-0" />
                    <span>
                        This is a preview. No changes will be made to the actual
                        PR.
                    </span>
                </div>
            </SheetFooter>
        </SheetContent>
    );
};
