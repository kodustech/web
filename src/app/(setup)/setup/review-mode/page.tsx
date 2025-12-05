"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@components/ui/button";
import { Heading } from "@components/ui/heading";
import { Page } from "@components/ui/page";
import { Spinner } from "@components/ui/spinner";
import { useSuspenseGetCodeReviewParameter } from "@services/parameters/hooks";
import { PULL_REQUEST_API } from "@services/pull-requests/fetch";
import { useSelectedTeamId } from "src/core/providers/selected-team-context";
import { cn } from "src/core/utils/components";
import { useFetch } from "src/core/utils/reactQuery";

import { StepIndicators } from "../_components/step-indicators";

type ReviewMode = "default" | "safety" | "speed" | "coach";

const REVIEW_MODES = [
    {
        id: "default" as const,
        title: "Default",
        description: "Balanced review with a steady amount of comments.",
        image: "/assets/images/kody_default.png",
    },
    {
        id: "safety" as const,
        title: "Safety",
        description:
            "More issues flagged and more comments. Best for thorough reviews.",
        image: "/assets/images/kody_safety.png",
        recommended: true,
    },
    {
        id: "speed" as const,
        title: "Speed",
        description: "Only high impact issues. Minimal comments.",
        image: "/assets/images/kody_speed.png",
    },
    {
        id: "coach" as const,
        title: "Coach",
        description: "More suggestions and explanations with less nitpicking.",
        image: "/assets/images/kody_coach.png",
    },
];

const ReviewModeCard = ({
    mode,
    selected,
    recommended,
    onSelect,
}: {
    mode: (typeof REVIEW_MODES)[number];
    selected: boolean;
    recommended?: boolean;
    onSelect: () => void;
}) => {
    return (
        <button
            type="button"
            onClick={onSelect}
            className={cn(
                "relative flex flex-row items-center gap-4 rounded-xl border p-4 text-left transition-colors",
                selected
                    ? "border-primary-light bg-primary-light/5"
                    : "border-card-lv3 hover:border-card-lv3/80",
            )}>
            {recommended && (
                <span className="bg-primary-light ring-primary/30 absolute -top-2.5 right-3 rounded px-2.5 py-0.5 text-[10px] font-semibold whitespace-nowrap text-black shadow-sm ring-1">
                    Recommended based on your repo
                </span>
            )}
            <Image
                src={mode.image}
                alt={mode.title}
                width={56}
                height={56}
                className="shrink-0"
            />
            <div className="flex flex-col gap-1">
                <span className="text-sm font-semibold">{mode.title}</span>
                <span className="text-text-secondary text-xs">
                    {mode.description}
                </span>
            </div>
        </button>
    );
};

export default function ReviewModePage() {
    const router = useRouter();
    const { teamId } = useSelectedTeamId();
    const { configValue } = useSuspenseGetCodeReviewParameter(teamId);
    const [selectedMode, setSelectedMode] = useState<ReviewMode>("default");
    const hasAppliedRecommendation = useRef(false);

    const selectedRepoIds = useMemo(() => {
        const repos = configValue?.repositories || [];
        const selected = repos.filter((r) => r?.isSelected);
        if (selected.length) return selected.map((r) => r.id);
        return repos.map((r) => r.id);
    }, [configValue?.repositories]);

    const onboardingEnabled =
        Boolean(teamId) && Boolean(selectedRepoIds.length);

    const {
        data: onboardingSignals = [],
        isLoading: isOnboardingSignalsLoading = onboardingEnabled,
        isFetching: isOnboardingSignalsFetching = false,
    } = useFetch<
        Array<{
            repositoryId: string;
            recommendation?: { mode?: string };
        }>
    >(
        onboardingEnabled
            ? PULL_REQUEST_API.GET_ONBOARDING_SIGNALS({
                  teamId,
                  repositoryIds: selectedRepoIds,
                  limit: 5,
              })
            : null,
        undefined,
        onboardingEnabled,
    ) ?? { data: [], isLoading: onboardingEnabled, isFetching: false };

    const recommendedMode = useMemo(() => {
        const mode =
            onboardingSignals?.[0]?.recommendation?.mode?.toLowerCase();
        if (
            mode === "safety" ||
            mode === "speed" ||
            mode === "coach" ||
            mode === "default"
        )
            return mode as ReviewMode;
        return undefined;
    }, [onboardingSignals]);

    const recommendationLoading =
        Boolean(teamId && selectedRepoIds.length) &&
        !recommendedMode &&
        (isOnboardingSignalsLoading || isOnboardingSignalsFetching);

    const selectedModeLabel =
        REVIEW_MODES.find((m) => m.id === selectedMode)?.title ?? "Default";

    useEffect(() => {
        if (recommendedMode && !hasAppliedRecommendation.current) {
            setSelectedMode(recommendedMode);
            hasAppliedRecommendation.current = true;
        }
    }, [recommendedMode]);

    const handleContinue = () => {
        router.push("/setup/customize-team");
    };

    const handleSkip = () => {
        router.push("/setup/customize-team");
    };

    return (
        <Page.Root className="mx-auto flex min-h-screen flex-col gap-6 overflow-x-hidden overflow-y-auto p-6 lg:max-h-screen lg:flex-row lg:gap-6 lg:overflow-hidden">
            <div className="bg-card-lv1 flex w-full flex-col justify-center gap-10 rounded-3xl p-8 lg:max-w-none lg:flex-10 lg:p-12">
                <div className="flex-1 overflow-hidden rounded-3xl">
                    <video
                        loop
                        muted
                        autoPlay
                        playsInline
                        disablePictureInPicture
                        className="h-full w-full object-contain"
                        src="/assets/videos/setup/learn-with-your-context.webm"
                    />
                </div>
            </div>

            <div className="flex w-full flex-col gap-10 lg:flex-14 lg:overflow-y-auto lg:p-10">
                <div className="flex flex-1 flex-col gap-8">
                    <StepIndicators.Auto />

                    <Heading variant="h2">Choose a review mode</Heading>

                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                            <span className="text-text-secondary text-sm">
                                Choose how deep Kody should review your code.
                                You can change this anytime in Settings.
                            </span>
                            {recommendationLoading && (
                                <div className="text-text-secondary flex items-center gap-2 text-xs">
                                    <Spinner className="h-4 w-4" />
                                    <span>Loading recommendation...</span>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            {REVIEW_MODES.map((mode) => (
                                <ReviewModeCard
                                    key={mode.id}
                                    mode={mode}
                                    recommended={recommendedMode === mode.id}
                                    selected={selectedMode === mode.id}
                                    onSelect={() => setSelectedMode(mode.id)}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col items-center gap-4">
                        <Button
                            size="lg"
                            variant="primary"
                            className="w-full"
                            onClick={handleContinue}>
                            {`Continue with ${selectedModeLabel}`}
                        </Button>
                    </div>
                </div>
            </div>
        </Page.Root>
    );
}
