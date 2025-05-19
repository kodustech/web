"use client";

import { useState } from "react";
import { redirect } from "next/navigation";
import { SelectPullRequest } from "@components/system/select-pull-requests";
import { Alert, AlertDescription, AlertTitle } from "@components/ui/alert";
import { Button } from "@components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@components/ui/dialog";
import { FormControl } from "@components/ui/form-control";
import { Link } from "@components/ui/link";
import { MagicModalContext } from "@components/ui/magic-modal";
import { Page } from "@components/ui/page";
import { useSuspenseGetOnboardingPullRequests } from "@services/codeManagement/hooks";
import { useSuspenseGetParameterPlatformConfigs } from "@services/parameters/hooks";
import { useSuspenseGetOrganizationId } from "@services/setup/hooks";
import { useAuth } from "src/core/providers/auth.provider";
import { useSelectedTeamId } from "src/core/providers/selected-team-context";
import { useFinishOnboardingReviewingPR } from "src/features/ee/onboarding/_hooks/use-finish-onboarding-reviewing-pr";
import { useFinishOnboardingWithoutSelectingPR } from "src/features/ee/onboarding/_hooks/use-finish-onboarding-without-selecting-pr";

export default function App() {
    const { userId } = useAuth();

    const { teamId } = useSelectedTeamId();
    const { configValue } = useSuspenseGetParameterPlatformConfigs(teamId);
    if (configValue?.finishOnboard) redirect("/");

    const pullRequests = useSuspenseGetOnboardingPullRequests(teamId);
    const organizationId = useSuspenseGetOrganizationId();

    const [open, setOpen] = useState(false);
    const [selectedPR, setSelectedPR] = useState<
        (typeof pullRequests)[number] | undefined
    >();

    const [requestedPullRequestReview, setRequestedPullRequestReview] =
        useState(false);

    const {
        finishOnboardingWithoutSelectingPR,
        isFinishingOnboardingWithoutSelectingPR,
    } = useFinishOnboardingWithoutSelectingPR({
        organizationId,
        teamId,
        userId: userId!,
    });

    const { finishOnboardingReviewingPR, isFinishingOnboardingReviewingPR } =
        useFinishOnboardingReviewingPR({
            organizationId,
            teamId,
            userId: userId!,
            onSuccess: () => {
                setRequestedPullRequestReview(true);
            },
        });

    return (
        <Page.Root className="flex h-full w-full flex-col items-center overflow-auto py-20">
            <MagicModalContext.Provider value={{ closeable: false }}>
                <Dialog open>
                    <DialogContent className="gap-0 p-10">
                        <DialogHeader>
                            <DialogTitle>
                                Congrats! Your automation is live!
                            </DialogTitle>

                            <DialogDescription className="mt-4">
                                From now on, I’ll automatically review every PR
                                you open in your selected repositories.
                            </DialogDescription>
                            <DialogDescription className="mb-4">
                                <strong className="text-white">
                                    Want to see it in action?
                                </strong>{" "}
                                Pick a PR for an instant review—or skip and let
                                automation handle the next ones.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="flex flex-1 flex-col gap-4">
                            {requestedPullRequestReview ? (
                                <>
                                    <Alert variant="success">
                                        <AlertTitle>
                                            Review requested
                                        </AlertTitle>
                                        <AlertDescription className="mb-4">
                                            Soon it will be ready in your PR:
                                        </AlertDescription>

                                        <Link
                                            href={selectedPR?.url ?? ""}
                                            className="wrap-anywhere">
                                            {selectedPR?.url}
                                        </Link>
                                    </Alert>

                                    <p className="text-center text-sm">
                                        Redirecting to dashboard...
                                    </p>
                                </>
                            ) : (
                                <>
                                    <FormControl.Root>
                                        <FormControl.Label htmlFor="select-pull-request">
                                            Select a PR to review
                                        </FormControl.Label>

                                        <FormControl.Input>
                                            <SelectPullRequest
                                                pullRequests={pullRequests}
                                                disabled={
                                                    requestedPullRequestReview ||
                                                    isFinishingOnboardingWithoutSelectingPR ||
                                                    isFinishingOnboardingReviewingPR
                                                }
                                                open={open}
                                                onOpenChange={setOpen}
                                                value={selectedPR}
                                                onChange={(v) => {
                                                    setSelectedPR(v);
                                                    setOpen(false);
                                                }}
                                            />
                                        </FormControl.Input>
                                    </FormControl.Root>

                                    <div className="mt-1 -mb-3 flex flex-row items-center justify-between">
                                        <div className="text-center">
                                            <Link
                                                href=""
                                                disabled={
                                                    isFinishingOnboardingWithoutSelectingPR
                                                }
                                                className="text-sm"
                                                onClick={(ev) => {
                                                    ev.preventDefault();
                                                    finishOnboardingWithoutSelectingPR();
                                                }}>
                                                No thanks, I'll let automation
                                                handle it
                                            </Link>
                                        </div>

                                        <Button
                                            size="lg"
                                            variant="primary"
                                            disabled={
                                                !selectedPR ||
                                                requestedPullRequestReview ||
                                                isFinishingOnboardingWithoutSelectingPR
                                            }
                                            onClick={() =>
                                                finishOnboardingReviewingPR(
                                                    selectedPR,
                                                )
                                            }
                                            loading={
                                                isFinishingOnboardingReviewingPR
                                            }>
                                            Review Pull Request now
                                        </Button>
                                    </div>
                                </>
                            )}
                        </div>
                    </DialogContent>
                </Dialog>
            </MagicModalContext.Provider>
        </Page.Root>
    );
}
