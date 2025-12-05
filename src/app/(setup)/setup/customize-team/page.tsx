"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { IssueSeverityLevelBadge } from "@components/system/issue-severity-level-badge";
import { Button } from "@components/ui/button";
import { Checkbox } from "@components/ui/checkbox";
import { Heading } from "@components/ui/heading";
import { Page } from "@components/ui/page";
import { Spinner } from "@components/ui/spinner";
import { toast } from "@components/ui/toaster/use-toast";
import { KODY_RULES_PATHS } from "@services/kodyRules";
import { PULL_REQUEST_API } from "@services/pull-requests/fetch";
import {
    reviewFastIDERules,
    type ReviewFastIDERulesPayload,
} from "@services/kodyRules/fetch";
import type { KodyRule } from "@services/kodyRules/types";
import { useSuspenseGetCodeReviewParameter } from "@services/parameters/hooks";
import { useSelectedTeamId } from "src/core/providers/selected-team-context";
import { cn } from "src/core/utils/components";
import { useFetch } from "src/core/utils/reactQuery";

import { StepIndicators } from "../_components/step-indicators";

type ReviewMode = "default" | "safety" | "speed" | "coach";

const REVIEW_MODES = [
    {
        id: "default" as const,
        title: "Default",
        description: "Balanced review with a reasonable number of comments.",
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
        description: "More suggestions and explanations. Less nitpicking.",
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
                <span className="bg-primary-light text-black absolute -top-2.5 right-3 rounded px-2.5 py-0.5 text-[10px] font-semibold shadow-sm ring-1 ring-primary/30 whitespace-nowrap">
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

const KodyRuleCard = ({
    rule,
    selected,
    repositoryName,
    onToggle,
}: {
    rule: KodyRule;
    selected: boolean;
    repositoryName?: string;
    onToggle: () => void;
}) => {
    return (
        <div
            role="button"
            tabIndex={0}
            onClick={onToggle}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onToggle();
                }
            }}
            className={cn(
                "flex flex-row items-start gap-4 rounded-xl border p-4 text-left transition-colors",
                selected
                    ? "border-primary-light bg-primary-light/5"
                    : "border-card-lv3 hover:border-card-lv3/80",
            )}>
            <div className="flex flex-1 flex-col gap-2">
                <div className="flex flex-col gap-1">
                    <div className="flex items-start justify-between gap-3">
                        <span className="text-sm font-semibold">
                            {rule.title}
                        </span>

                        {rule.severity && (
                            <IssueSeverityLevelBadge severity={rule.severity} />
                        )}
                    </div>

                    {repositoryName && (
                        <span className="text-text-secondary text-xs">
                            repo: {repositoryName}
                        </span>
                    )}
                </div>

                <span className="text-text-secondary line-clamp-3 text-xs">
                    {rule.rule}
                </span>
            </div>
            <Checkbox checked={selected} />
        </div>
    );
};

export default function CustomizeTeamPage() {
    const router = useRouter();
    const { teamId } = useSelectedTeamId();
    const { configValue } = useSuspenseGetCodeReviewParameter(teamId);
    const [selectedMode, setSelectedMode] = useState<ReviewMode>("default");
    const [selectedRules, setSelectedRules] = useState<string[]>([]);
    const [isSavingRules, setIsSavingRules] = useState(false);
    const [noRulesTimeoutReached, setNoRulesTimeoutReached] = useState(false);
    const hasAppliedRecommendation = useRef(false);

    const selectedRepoIds = useMemo(() => {
        const repos = configValue?.repositories || [];
        const selected = repos.filter((r) => r?.isSelected);
        if (selected.length) return selected.map((r) => r.id);
        return repos.map((r) => r.id);
    }, [configValue?.repositories]);

    const {
        data: pendingRules = [],
        isLoading: isPendingRulesLoading,
        isRefetching: isPendingRulesRefetching,
    } = useFetch<Array<KodyRule>>(
        KODY_RULES_PATHS.PENDING_IDE_RULES,
        { params: { teamId } },
        !!teamId,
        {
            refetchInterval: 5000,
            refetchIntervalInBackground: true,
            staleTime: 0,
        },
    );

    const {
        data: onboardingSignals = [],
        isLoading: isOnboardingSignalsLoading,
        isFetching: isOnboardingSignalsFetching,
    } =
        useFetch<
            Array<{
                repositoryId: string;
                recommendation?: { mode?: string };
            }>
        >(
            teamId && selectedRepoIds.length
                ? PULL_REQUEST_API.GET_ONBOARDING_SIGNALS({
                      teamId,
                      repositoryIds: selectedRepoIds,
                      limit: 5,
                  })
                : null,
            undefined,
            Boolean(teamId && selectedRepoIds.length),
        ) || {};

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

    const repositoryNameById = useMemo(() => {
        return new Map(
            (configValue?.repositories || []).map((repo) => [
                repo.id,
                repo.name,
            ]),
        );
    }, [configValue?.repositories]);

    const pendingRuleIds = useMemo(
        () =>
            (pendingRules || [])
                .map((rule) => rule.uuid)
                .filter((id): id is string => Boolean(id)),
        [pendingRules],
    );

    const areArraysEqual = (a: string[], b: string[]) => {
        if (a.length !== b.length) return false;
        const sortedA = [...a].sort();
        const sortedB = [...b].sort();
        return sortedA.every((id, idx) => id === sortedB[idx]);
    };

    useEffect(() => {
        if (recommendedMode && !hasAppliedRecommendation.current) {
            setSelectedMode(recommendedMode);
            hasAppliedRecommendation.current = true;
        }
    }, [recommendedMode]);

    useEffect(() => {
        setSelectedRules((prev) => {
            if (areArraysEqual(prev, pendingRuleIds)) return prev;

            if (prev.length === 0) return pendingRuleIds;

            const stillSelected = prev.filter((id) =>
                pendingRuleIds.includes(id),
            );
            const newOnes = pendingRuleIds.filter(
                (id) => !stillSelected.includes(id),
            );

            const next = [...stillSelected, ...newOnes];

            if (areArraysEqual(prev, next)) return prev;

            return next;
        });
    }, [pendingRuleIds]);

    useEffect(() => {
        if (pendingRuleIds.length > 0) {
            setNoRulesTimeoutReached(false);
            return;
        }

        const timeout = setTimeout(() => setNoRulesTimeoutReached(true), 15000);

        return () => clearTimeout(timeout);
    }, [pendingRuleIds]);

    const showEmptyStateSpinner = useMemo(
        () =>
            !noRulesTimeoutReached &&
            pendingRules.length === 0 &&
            isPendingRulesLoading,
        [noRulesTimeoutReached, pendingRules.length, isPendingRulesLoading],
    );

    const toggleRule = (ruleId: string) => {
        if (!ruleId) return;

        setSelectedRules((prev) =>
            prev.includes(ruleId)
                ? prev.filter((id) => id !== ruleId)
                : [...prev, ruleId],
        );
    };

    const handleApplyAndContinue = async () => {
        if (!teamId) {
            toast({
                variant: "danger",
                description: "Missing team. Please try again.",
            });
            return;
        }

        const pendingIds = pendingRules
            .map((rule) => rule.uuid)
            .filter((id): id is string => Boolean(id));

        const payload: ReviewFastIDERulesPayload = {
            teamId,
            activateRuleIds: selectedRules,
            deleteRuleIds: pendingIds.filter(
                (id) => !selectedRules.includes(id),
            ),
        };

        try {
            setIsSavingRules(true);
            await reviewFastIDERules(payload);
            toast({
                variant: "success",
                description: "Rules saved for your team.",
            });
            router.push("/setup/choosing-a-pull-request");
        } catch (error) {
            console.error("Error reviewing fast IDE rules", error);
            toast({
                variant: "danger",
                description:
                    "We couldn't save your selection. Please try again.",
            });
        } finally {
            setIsSavingRules(false);
        }
    };

    const handleSkip = () => {
        if (isSavingRules) return;

        router.push("/setup/choosing-a-pull-request");
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

                    <Heading variant="h2">Customize for your team</Heading>

                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1 sm:flex-col ">
                            <span className="text-base font-semibold">
                                Choose a review mode
                            </span>
                            <span className="text-text-secondary text-sm">
                                Pick a mode. You can change it anytime.
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

                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                            <div className="flex flex-col gap-1">
                                <span className="text-base font-semibold">
                                    Kody Rules
                                </span>
                                <span className="text-text-secondary text-sm">
                                    Kody Rules are guardrails Kody uses when
                                    reviewing your repo. These suggestions come
                                    from your codebase; keep what matters and
                                    adjust anytime.
                                </span>
                            </div>
                            {pendingRules.length > 0 && (
                                <span className="text-primary-light shrink-0 text-sm">
                                    {selectedRules.length} selected of{" "}
                                    {pendingRules.length}
                                </span>
                            )}
                        </div>

                        {pendingRules.length === 0 ? (
                            <div className="bg-card-lv1 border-card-lv3 text-text-secondary flex flex-col gap-2 rounded-xl border p-4 text-sm">
                                <div className="text-text-primary flex items-center gap-2 font-semibold">
                                    {showEmptyStateSpinner ? <Spinner /> : null}
                                    <span>
                                        {noRulesTimeoutReached
                                            ? "No rules generated this time"
                                            : "We're syncing rules from your repositories"}
                                    </span>
                                </div>

                                <span className="text-text-primary">
                                    {noRulesTimeoutReached
                                        ? "We couldn't find rules from your repo configs this time. You can continue and add or edit rules later in Settings."
                                        : "Kody is scanning your config files and preparing recommendations. They will appear here automatically, and you can keep going in the meantime."}
                                </span>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {pendingRules.map((rule) => {
                                    const ruleId = rule.uuid ?? rule.title;

                                    return (
                                        <KodyRuleCard
                                            key={ruleId}
                                            rule={rule}
                                            repositoryName={
                                                rule.repositoryId
                                                    ? repositoryNameById.get(
                                                          rule.repositoryId,
                                                      )
                                                    : undefined
                                            }
                                            selected={
                                                !!rule.uuid &&
                                                selectedRules.includes(
                                                    rule.uuid,
                                                )
                                            }
                                            onToggle={() =>
                                                rule.uuid &&
                                                toggleRule(rule.uuid)
                                            }
                                        />
                                    );
                                })}
                            </div>
                        )}

                        <span className="text-text-secondary text-right text-sm">
                            You can add or edit rules later in Settings.
                        </span>
                    </div>

                    <div className="flex flex-col items-center gap-4">
                        <Button
                            size="lg"
                            variant="primary"
                            className="w-full"
                            loading={isSavingRules}
                            disabled={
                                isSavingRules ||
                                (isPendingRulesLoading &&
                                    !noRulesTimeoutReached &&
                                    pendingRules.length === 0) ||
                                (pendingRules.length > 0 &&
                                    selectedRules.length === 0)
                            }
                            onClick={handleApplyAndContinue}>
                            Apply and continue
                        </Button>

                        <button
                            type="button"
                            onClick={handleSkip}
                            className="text-primary-light text-sm hover:underline">
                            Skip for now
                        </button>
                    </div>
                </div>
            </div>
        </Page.Root>
    );
}
