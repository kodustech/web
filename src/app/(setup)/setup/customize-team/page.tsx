"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@components/ui/button";
import { Checkbox } from "@components/ui/checkbox";
import { Heading } from "@components/ui/heading";
import { SvgKodus } from "@components/ui/icons/SvgKodus";
import { Page } from "@components/ui/page";
import { cn } from "src/core/utils/components";

import { StepIndicators } from "../_components/step-indicators";

type ReviewMode = "default" | "safety" | "speed" | "coach";

interface KodyRule {
    id: string;
    title: string;
    description: string;
}

const REVIEW_MODES = [
    {
        id: "default" as const,
        title: "Default",
        description: "Balanced review with a reasonable number of comments.",
        image: "/assets/images/kody/look-right.png",
    },
    {
        id: "safety" as const,
        title: "Safety",
        description:
            "More issues flagged and more comments. Best for thorough reviews.",
        image: "/assets/images/kody/chemicals.png",
        recommended: true,
    },
    {
        id: "speed" as const,
        title: "Speed",
        description: "Only high impact issues. Minimal comments.",
        image: "/assets/images/kody/look-left-with-paws.png",
    },
    {
        id: "coach" as const,
        title: "Coach",
        description: "More suggestions and explanations. Less nitpicking.",
        image: "/assets/images/kody/look-right.png",
    },
];

const MOCK_KODY_RULES: KodyRule[] = [
    {
        id: "1",
        title: "Lorem ipsum dolor sit amet consectetur.",
        description:
            "Proin donec penatibus sit proin. Ultrices ut arcu lectus venenatis amet. Diam ut ultrices commodo malesuada mus in. Lacus rhoncus iaculis magna in mi nulla suspendisse nunc amet.",
    },
    {
        id: "2",
        title: "Lorem ipsum dolor sit amet consectetur.",
        description:
            "Proin donec penatibus sit proin. Ultrices ut arcu lectus venenatis amet. Diam ut ultrices commodo malesuada mus in. Lacus rhoncus iaculis magna in mi nulla suspendisse nunc amet.",
    },
    {
        id: "3",
        title: "Lorem ipsum dolor sit amet consectetur.",
        description:
            "Proin donec penatibus sit proin. Ultrices ut arcu lectus venenatis amet. Diam ut ultrices commodo malesuada mus in. Lacus rhoncus iaculis magna in mi nulla suspendisse nunc amet.",
    },
];

const ReviewModeCard = ({
    mode,
    selected,
    onSelect,
}: {
    mode: (typeof REVIEW_MODES)[number];
    selected: boolean;
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
            {mode.recommended && (
                <span className="bg-primary-light/20 text-primary-light absolute -top-2.5 right-3 rounded px-2 py-0.5 text-[10px] font-medium whitespace-nowrap">
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
    onToggle,
}: {
    rule: KodyRule;
    selected: boolean;
    onToggle: () => void;
}) => {
    return (
        <button
            type="button"
            onClick={onToggle}
            className={cn(
                "flex flex-row items-start gap-4 rounded-xl border p-4 text-left transition-colors",
                selected
                    ? "border-primary-light bg-primary-light/5"
                    : "border-card-lv3 hover:border-card-lv3/80",
            )}>
            <div className="flex flex-1 flex-col gap-1">
                <span className="text-sm font-semibold">{rule.title}</span>
                <span className="text-text-secondary text-xs">
                    {rule.description}
                </span>
            </div>
            <Checkbox checked={selected} />
        </button>
    );
};

export default function CustomizeTeamPage() {
    const router = useRouter();
    const [selectedMode, setSelectedMode] = useState<ReviewMode>("safety");
    const [selectedRules, setSelectedRules] = useState<string[]>(["1", "3"]);

    const toggleRule = (ruleId: string) => {
        setSelectedRules((prev) =>
            prev.includes(ruleId)
                ? prev.filter((id) => id !== ruleId)
                : [...prev, ruleId],
        );
    };

    const handleApplyAndContinue = () => {
        router.push("/setup/choosing-a-pull-request");
    };

    const handleSkip = () => {
        router.push("/setup/choosing-a-pull-request");
    };

    return (
        <Page.Root className="mx-auto flex min-h-screen flex-col gap-6 overflow-x-hidden overflow-y-auto p-6 lg:max-h-screen lg:flex-row lg:gap-6 lg:overflow-hidden">
            <div className="bg-card-lv1 flex w-full flex-col justify-center gap-10 rounded-3xl p-8 lg:max-w-none lg:flex-10 lg:p-12">
                <SvgKodus className="h-8 min-h-8" />

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
                        <div className="flex flex-col gap-1">
                            <span className="text-base font-semibold">
                                Choose a review mode
                            </span>
                            <span className="text-text-secondary text-sm">
                                Pick a mode. You can change it anytime.
                            </span>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            {REVIEW_MODES.map((mode) => (
                                <ReviewModeCard
                                    key={mode.id}
                                    mode={mode}
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
                                    Recommended based on your repo (and recent
                                    PRs, if available). Edit anytime.
                                </span>
                            </div>
                            <span className="text-primary-light shrink-0 text-sm">
                                {selectedRules.length} selected
                            </span>
                        </div>

                        <div className="flex flex-col gap-3">
                            {MOCK_KODY_RULES.map((rule) => (
                                <KodyRuleCard
                                    key={rule.id}
                                    rule={rule}
                                    selected={selectedRules.includes(rule.id)}
                                    onToggle={() => toggleRule(rule.id)}
                                />
                            ))}
                        </div>

                        <span className="text-text-secondary text-right text-sm">
                            You can add more later in settings.
                        </span>
                    </div>

                    <div className="flex flex-col items-center gap-4">
                        <Button
                            size="lg"
                            variant="primary"
                            className="w-full"
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
