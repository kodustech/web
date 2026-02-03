"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@components/ui/card";
import { FormControl } from "@components/ui/form-control";
import { Heading } from "@components/ui/heading";
import { Label } from "@components/ui/label";
import { Link } from "@components/ui/link";
import { NumberInput } from "@components/ui/number-input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@components/ui/select";
import { Switch } from "@components/ui/switch";
import { toast } from "@components/ui/toaster/use-toast";
import { useAsyncAction } from "@hooks/use-async-action";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@components/ui/tooltip";
import {
    BadgeDollarSignIcon,
    BookOpenIcon,
    BrainIcon,
    CalculatorIcon,
    CheckIcon,
    ChevronDownIcon,
    ClockIcon,
    ExternalLinkIcon,
    GaugeIcon,
    GitPullRequestIcon,
    HeadphonesIcon,
    InfoIcon,
    KeyIcon,
    type LucideIcon,
    MessageCircleIcon,
    PlugIcon,
    RadarIcon,
    RocketIcon,
    ShieldCheckIcon,
    SparklesIcon,
    TrendingUpIcon,
    UsersIcon,
} from "lucide-react";
import { useAuth } from "src/core/providers/auth.provider";
import { useSelectedTeamId } from "src/core/providers/selected-team-context";
import { cn } from "src/core/utils/components";
import { CurrencyHelpers } from "src/core/utils/currency";
import { addSearchParamsToUrl } from "src/core/utils/url";

import { createCheckoutSessionAction } from "../_actions/create-checkout-session";
import { migrateToFree } from "../_services/billing/fetch";
import type { Plan } from "../_services/billing/types";
import type { SimulatorModel } from "./_services/models";

type TokenProjection = {
    minCost: number;
    maxCost: number;
    minModel: string;
    maxModel: string;
    currency: string;
    uniquePRs: number;
    uniqueDevelopers: number;
    monthlyPRs: number;
    actualDaysUsed: number;
    monthlyInputTokens: number;
    monthlyOutputTokens: number;
} | null;

type UsageProgress = {
    current: number;
    required: number;
} | null;

type PlansObject = Record<
    "free" | "teams_byok" | "enterprise",
    Plan | undefined
>;

export function ChoosePlanPageClient({
    plans,
    tokenProjection,
    simulatorModels,
    usageProgress,
}: {
    plans: PlansObject;
    tokenProjection: TokenProjection;
    simulatorModels: SimulatorModel[];
    usageProgress: UsageProgress;
}) {
    return (
        <div className="flex flex-col gap-6">
            {tokenProjection && tokenProjection.maxCost >= 1 ? (
                <TokenProjectionBanner
                    projection={tokenProjection}
                    simulatorModels={simulatorModels}
                />
            ) : (
                <TokenProjectionEmptyState progress={usageProgress} />
            )}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {plans.free && <FreePlan plan={plans.free} />}
                {plans.teams_byok && <TeamsPlan plan={plans.teams_byok} />}
                {plans.enterprise && <EnterprisePlan plan={plans.enterprise} />}
            </div>

            {/* All plans include */}
            <AllPlansInclude />
        </div>
    );
}

// Features that are common to all plans - these will be filtered from individual plan lists
const COMMON_FEATURES = [
    "Unlimited PRs using your own API key",
    "Unlimited users",
];

// Map feature keywords to icons
const FEATURE_ICONS: Array<{ keywords: string[]; icon: LucideIcon }> = [
    { keywords: ["kody rules", "rules"], icon: BookOpenIcon },
    { keywords: ["plugin"], icon: PlugIcon },
    { keywords: ["quality radar", "radar"], icon: RadarIcon },
    { keywords: ["learning", "memory"], icon: BrainIcon },
    { keywords: ["discord", "support", "email"], icon: MessageCircleIcon },
    { keywords: ["priority queue", "queue"], icon: RocketIcon },
    { keywords: ["metrics", "cockpit"], icon: GaugeIcon },
    { keywords: ["sso", "saml"], icon: KeyIcon },
    { keywords: ["soc 2", "soc2"], icon: ShieldCheckIcon },
    { keywords: ["rbac", "audit"], icon: ShieldCheckIcon },
    { keywords: ["hours", "onboarding", "dedicated"], icon: HeadphonesIcon },
    { keywords: ["private discord", "private channel"], icon: MessageCircleIcon },
];

function getFeatureIcon(feature: string): LucideIcon {
    const lowerFeature = feature.toLowerCase();
    for (const { keywords, icon } of FEATURE_ICONS) {
        if (keywords.some((kw) => lowerFeature.includes(kw))) {
            return icon;
        }
    }
    return CheckIcon;
}

function AllPlansInclude() {
    return (
        <div className="bg-card-lv1 flex items-center gap-6 rounded-lg px-5 py-4">
            <p className="text-text-secondary text-sm font-medium">
                All plans include
            </p>
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                    <div className="bg-success/20 flex size-6 items-center justify-center rounded-full">
                        <GitPullRequestIcon className="text-success size-3.5" />
                    </div>
                    <span className="text-text-primary text-sm">
                        Unlimited PRs
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="bg-success/20 flex size-6 items-center justify-center rounded-full">
                        <UsersIcon className="text-success size-3.5" />
                    </div>
                    <span className="text-text-primary text-sm">
                        Unlimited users
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="bg-success/20 flex size-6 items-center justify-center rounded-full">
                        <KeyIcon className="text-success size-3.5" />
                    </div>
                    <span className="text-text-primary text-sm">
                        Your own API key
                    </span>
                </div>
            </div>
        </div>
    );
}

function formatModelName(model: string): string {
    // Remove common prefixes and suffixes to make model names more readable
    return model
        .replace(/^(openai\/|anthropic\/|google\/|meta-llama\/|mistralai\/)/, "")
        .replace(/-\d{8}$/, "") // Remove date suffixes like -20241022
        .replace(/:free$/, "");
}

function formatCostRange(
    projection: NonNullable<TokenProjection>,
    divisor?: number,
) {
    const min = divisor ? projection.minCost / divisor : projection.minCost;
    const max = divisor ? projection.maxCost / divisor : projection.maxCost;

    const formattedMin = CurrencyHelpers.format({
        currency: projection.currency,
        amount: min,
        maximumFractionDigits: max < 10 ? 2 : 0,
    });

    const formattedMax = CurrencyHelpers.format({
        currency: projection.currency,
        amount: max,
        maximumFractionDigits: max < 10 ? 2 : 0,
    });

    return { formattedMin, formattedMax };
}

const TRIAL_MODEL_ID = "gemini-2.5-pro";

function TokenProjectionBanner({
    projection,
    simulatorModels,
}: {
    projection: NonNullable<TokenProjection>;
    simulatorModels: SimulatorModel[];
}) {
    const [selectedModelId, setSelectedModelId] = useState<string>(TRIAL_MODEL_ID);
    const [isExpanded, setIsExpanded] = useState(false);

    const hasPerDev = projection.uniqueDevelopers > 0;
    const hasPerPR = projection.uniquePRs > 0;

    // Group models by provider
    const modelsByProvider = useMemo(() => {
        const grouped: Record<string, SimulatorModel[]> = {};
        for (const model of simulatorModels) {
            if (!grouped[model.provider]) {
                grouped[model.provider] = [];
            }
            grouped[model.provider].push(model);
        }
        return grouped;
    }, [simulatorModels]);

    // Calculate costs based on selected model
    const costs = useMemo(() => {
        const model = simulatorModels.find((m) => m.id === selectedModelId);
        if (!model) return null;

        const inputCostPerToken = model.costPerMillionInput / 1_000_000;
        const outputCostPerToken = model.costPerMillionOutput / 1_000_000;

        const monthlyCost =
            projection.monthlyInputTokens * inputCostPerToken +
            projection.monthlyOutputTokens * outputCostPerToken;

        const format = (amount: number) =>
            CurrencyHelpers.format({
                currency: "USD",
                amount,
                maximumFractionDigits: amount < 10 ? 2 : 0,
            });

        return {
            isTrialModel: selectedModelId === TRIAL_MODEL_ID,
            modelName: model.name,
            monthly: format(monthlyCost),
            perDev: hasPerDev
                ? format(monthlyCost / projection.uniqueDevelopers)
                : null,
            perPR: hasPerPR && projection.monthlyPRs > 0
                ? format(monthlyCost / projection.monthlyPRs)
                : null,
        };
    }, [selectedModelId, simulatorModels, projection, hasPerDev, hasPerPR]);

    if (!costs) return null;

    return (
        <Card className="overflow-hidden">
            <CardContent className="p-0">
                {/* Collapsed header - clickable */}
                <button
                    type="button"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex w-full items-center gap-4 px-5 py-4 text-left">
                    <div className="bg-primary-dark flex size-9 shrink-0 items-center justify-center rounded-full">
                        <TrendingUpIcon className="text-primary-light size-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-text-secondary text-xs">
                            Estimated AI token cost
                            <span className="text-text-tertiary">
                                {" "}
                                · based on {projection.uniquePRs} PRs over {projection.actualDaysUsed} day{projection.actualDaysUsed !== 1 ? "s" : ""}
                            </span>
                        </p>
                        <p className="text-text-primary flex items-center gap-1 text-sm font-medium">
                            <span className="text-primary-light tabular-nums font-semibold">
                                {costs.monthly}
                            </span>
                            <span className="text-text-tertiary">/month</span>
                            <TooltipProvider delayDuration={100}>
                                <Tooltip>
                                    <TooltipTrigger
                                        onClick={(e) => e.stopPropagation()}
                                        className="inline-flex size-5 items-center justify-center rounded-full hover:bg-[var(--color-card-lv1)]">
                                        <InfoIcon className="text-text-tertiary size-3.5" />
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="max-w-72 p-3">
                                        <p className="text-text-secondary text-pretty text-sm leading-relaxed">
                                            Calculated from your average daily token usage (<span className="text-text-primary font-medium">{projection.actualDaysUsed} day{projection.actualDaysUsed !== 1 ? "s" : ""}</span> with activity) projected to 30 days, using <span className="text-text-primary font-medium">{costs.modelName}</span> pricing.
                                        </p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                            <span className="text-text-tertiary"> · </span>
                            <span className="text-text-secondary">
                                {costs.modelName}
                            </span>
                        </p>
                    </div>
                    <ChevronDownIcon
                        className={cn(
                            "text-text-tertiary size-5 shrink-0 transition-transform",
                            isExpanded && "rotate-180",
                        )}
                    />
                </button>

                {/* Expanded content */}
                {isExpanded && (
                    <>
                        <div className="space-y-4 border-t border-[var(--color-card-lv1)] px-5 py-4">
                            {/* Model Selector */}
                            {simulatorModels.length > 0 && (
                                <div className="flex items-center gap-3">
                                    <CalculatorIcon className="text-text-tertiary size-4 shrink-0" />
                                    <Select
                                        value={selectedModelId}
                                        onValueChange={setSelectedModelId}>
                                        <SelectTrigger className="flex-1">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="max-h-64 overflow-y-auto">
                                            {Object.entries(modelsByProvider).map(
                                                ([provider, models]) => (
                                                    <div key={provider}>
                                                        <div className="text-text-tertiary px-2 py-1.5 text-xs font-medium">
                                                            {provider}
                                                        </div>
                                                        {models.map((model) => (
                                                            <SelectItem
                                                                key={model.id}
                                                                value={model.id}>
                                                                {model.name}
                                                                {model.id ===
                                                                    TRIAL_MODEL_ID && (
                                                                    <span className="text-text-tertiary ml-2">
                                                                        (used in trial)
                                                                    </span>
                                                                )}
                                                            </SelectItem>
                                                        ))}
                                                    </div>
                                                ),
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            {/* Metrics cards */}
                            {(() => {
                                const showPerDev = costs.perDev && projection.uniqueDevelopers > 1;
                                const showPerPR = costs.perPR;

                                if (!showPerDev && !showPerPR) return null;

                                return (
                                    <div className={cn(
                                        "grid gap-3",
                                        showPerDev && showPerPR ? "grid-cols-2" : "grid-cols-1"
                                    )}>
                                        {showPerDev && (
                                            <div className="bg-card-lv1 flex flex-col gap-1 rounded-lg p-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="bg-secondary-dark flex size-6 shrink-0 items-center justify-center rounded">
                                                        <UsersIcon className="text-secondary-light size-3.5" />
                                                    </div>
                                                    <p className="text-text-tertiary text-xs">
                                                        Per developer
                                                    </p>
                                                </div>
                                                <p className="text-text-primary tabular-nums text-lg font-semibold">
                                                    {costs.perDev}
                                                </p>
                                                <p className="text-text-tertiary text-xs">
                                                    {projection.uniqueDevelopers} devs · ~{Math.round(projection.uniquePRs / projection.uniqueDevelopers)} PRs/dev
                                                </p>
                                            </div>
                                        )}

                                        {showPerPR && (
                                            <div className="bg-card-lv1 flex flex-col gap-1 rounded-lg p-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="bg-tertiary-dark flex size-6 shrink-0 items-center justify-center rounded">
                                                        <GitPullRequestIcon className="text-tertiary-light size-3.5" />
                                                    </div>
                                                    <p className="text-text-tertiary text-xs">
                                                        Per pull request
                                                    </p>
                                                </div>
                                                <p className="text-text-primary tabular-nums text-lg font-semibold">
                                                    {costs.perPR}
                                                </p>
                                                <p className="text-text-tertiary text-xs">
                                                    ~{projection.monthlyPRs} PRs/mo estimated
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                );
                            })()}
                        </div>

                        {/* Footer note */}
                        <div className="bg-card-lv1 flex items-center justify-between gap-4 px-5 py-3">
                            <div className="flex items-center gap-2">
                                <SparklesIcon className="text-text-tertiary size-4 shrink-0" />
                                <p className="text-text-tertiary text-pretty text-xs">
                                    AI costs are paid directly to providers.
                                </p>
                            </div>
                            <Link
                                href="/token-usage"
                                className="text-primary-light hover:text-primary-lighter shrink-0 text-xs font-medium">
                                View usage
                            </Link>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
}

function TokenProjectionEmptyState({
    progress,
}: {
    progress: UsageProgress;
}) {
    const current = progress?.current ?? 0;
    const required = progress?.required ?? 3;
    const percentage = Math.min((current / required) * 100, 100);
    const hasStarted = current > 0;

    return (
        <Card className="overflow-hidden">
            <CardContent className="p-0">
                <div className="flex items-center gap-4 px-5 py-4">
                    <div className="bg-primary-dark flex size-9 shrink-0 items-center justify-center rounded-full">
                        <TrendingUpIcon className="text-primary-light size-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-text-secondary text-xs">
                            Estimated AI token cost
                        </p>
                        <p className="text-text-primary text-sm font-medium">
                            {hasStarted ? (
                                <>
                                    <span className="text-primary-light">
                                        {current} of {required} PRs
                                    </span>
                                    <span className="text-text-tertiary">
                                        {" "}· Keep using Kody to get your estimate
                                    </span>
                                </>
                            ) : (
                                <span className="text-text-tertiary">
                                    Review some PRs to get your estimate
                                </span>
                            )}
                        </p>
                        {/* Progress bar */}
                        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-card-lv1)]">
                            <div
                                className="bg-primary-light h-full rounded-full transition-all"
                                style={{ width: `${percentage}%` }}
                            />
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function FreePlan({ plan }: { plan: Plan }) {
    const { teamId } = useSelectedTeamId();
    const { organizationId } = useAuth();
    const router = useRouter();

    const [handleMigrateToFree, { loading }] = useAsyncAction(async () => {
        if (!teamId || !organizationId) {
            toast({
                title: "Error",
                description: "Missing team or organization information",
                variant: "danger",
            });
            return;
        }

        try {
            const result = await migrateToFree({
                organizationId,
                teamId,
            });

            if (result?.success) {
                toast({
                    title: "Successfully migrated to free plan",
                    description: (
                        <span>
                            <span className="text-primary-light mr-1 font-bold">
                                {plan.label}
                            </span>
                            <span>plan is now active.</span>
                        </span>
                    ),
                    variant: "success",
                });

                router.push("/settings/subscription");
                router.refresh();
            } else {
                toast({
                    title: "Migration failed",
                    description:
                        result?.message || "Failed to migrate to free plan",
                    variant: "danger",
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description:
                    "An unexpected error occurred while migrating to free plan",
                variant: "danger",
            });
            console.error("Migration error:", error);
        }
    });

    return (
        <Card className="flex flex-col overflow-hidden">
            <CardHeader className="pb-2">
                <div className="mb-3 flex items-center gap-2">
                    <div className="bg-card-lv1 flex size-8 items-center justify-center rounded-lg">
                        <SparklesIcon className="text-text-secondary size-4" />
                    </div>
                    <CardTitle className="text-balance">{plan.label}</CardTitle>
                </div>
                <CardDescription className="min-h-16 text-pretty">
                    {plan.description}
                </CardDescription>
            </CardHeader>

            <CardContent className="flex-none pb-4 pt-2">
                <div className="bg-card-lv1 rounded-lg p-4">
                    <Heading variant="h2" className="text-primary-light">
                        Free
                    </Heading>
                    <span className="text-text-tertiary text-sm">
                        Forever free
                    </span>
                </div>
            </CardContent>

            <CardContent className="flex-1 pb-4">
                <p className="text-text-tertiary mb-3 text-xs font-medium uppercase">
                    Includes
                </p>
                <PlanFeatures features={plan.features} />
            </CardContent>

            <CardContent className="flex-none pb-5 pt-0">
                <Button
                    size="md"
                    variant="secondary"
                    className="w-full"
                    loading={loading}
                    onClick={() => handleMigrateToFree()}>
                    Choose this plan
                </Button>
            </CardContent>
        </Card>
    );
}

function TeamsPlan({ plan }: { plan: Plan }) {
    const { teamId } = useSelectedTeamId();
    const [quantity, setQuantity] = useState(1);
    const [isAddonActive, setIsAddonActive] = useState(false);

    const planPricing = plan.pricing.find((p) => p.interval === "month");
    if (!planPricing) {
        return null;
    }

    const addon = plan.addons.at(0);
    const addonPricing = addon?.pricing.find((p) => p.interval === "month");

    const [createLinkToCheckout, { loading: isCreatingLinkToCheckout }] =
        useAsyncAction(async () => {
            const { url } = await createCheckoutSessionAction({
                teamId,
                planId: isAddonActive ? addon!.id : plan.id,
                quantity,
            });
            window.location.href = url;
        });

    return (
        <Card className="border-primary-dark relative flex flex-col overflow-hidden border-2">
            {/* Popular badge */}
            <div className="bg-primary-light absolute right-4 top-4 rounded-full px-3 py-1">
                <span className="text-xs font-semibold text-black">
                    Most popular
                </span>
            </div>

            <CardHeader className="pb-2">
                <div className="mb-3 flex items-center gap-2">
                    <div className="bg-primary-dark flex size-8 items-center justify-center rounded-lg">
                        <UsersIcon className="text-primary-light size-4" />
                    </div>
                    <CardTitle className="text-balance">{plan.label}</CardTitle>
                </div>
                <CardDescription className="min-h-16 text-pretty">
                    {plan.description}
                </CardDescription>
            </CardHeader>

            <CardContent className="flex-none pb-4 pt-2">
                <div className="bg-primary-dark/30 rounded-lg p-4">
                    <div className="flex items-baseline gap-1">
                        <Heading
                            variant="h2"
                            className="text-primary-light tabular-nums">
                            {CurrencyHelpers.format({
                                currency: planPricing.currency,
                                amount: planPricing.amount,
                                maximumFractionDigits: 0,
                            })}
                        </Heading>
                        <span className="text-text-secondary text-sm">
                            /dev/month
                        </span>
                    </div>
                    <span className="text-text-tertiary text-sm">
                        + AI token costs (pay-as-you-go)
                    </span>
                </div>
            </CardContent>

            {addonPricing && (
                <Label className="bg-card-lv1 mx-5 mb-4 flex cursor-pointer items-center justify-between gap-4 rounded-lg p-4">
                    <div className="space-y-0.5">
                        <p className="text-text-primary text-sm font-medium">
                            {addon?.description}
                        </p>
                        <p className="text-text-secondary text-sm">
                            <span className="text-primary-light font-semibold">
                                +{" "}
                                {CurrencyHelpers.format({
                                    maximumFractionDigits: 0,
                                    currency: addonPricing.currency,
                                    amount:
                                        addonPricing.amount -
                                        planPricing.amount,
                                })}
                            </span>
                            <span className="text-text-tertiary">
                                /dev/month
                            </span>
                        </p>
                    </div>

                    <Switch
                        checked={isAddonActive}
                        onCheckedChange={setIsAddonActive}
                    />
                </Label>
            )}

            <CardContent className="flex-1 pb-4">
                <p className="text-text-tertiary mb-3 text-xs font-medium uppercase">
                    Everything in Free, plus
                </p>
                <PlanFeatures features={plan.features} />
            </CardContent>

            <CardContent className="flex flex-none flex-col gap-4 pb-5 pt-0">
                <FormControl.Root>
                    <FormControl.Label htmlFor="teams-quantity">
                        Quantity of licenses
                    </FormControl.Label>

                    <FormControl.Input>
                        <NumberInput.Root
                            min={1}
                            size="md"
                            value={quantity}
                            onValueChange={setQuantity}>
                            <NumberInput.Decrement />
                            <NumberInput.Input id="teams-quantity" />
                            <NumberInput.Increment />
                        </NumberInput.Root>
                    </FormControl.Input>
                </FormControl.Root>

                <Button
                    size="md"
                    variant="primary"
                    className="w-full"
                    leftIcon={<BadgeDollarSignIcon />}
                    loading={isCreatingLinkToCheckout}
                    onClick={() => createLinkToCheckout()}>
                    Choose this plan
                </Button>
            </CardContent>
        </Card>
    );
}

function EnterprisePlan({ plan }: { plan: Plan }) {
    const { email } = useAuth();

    return (
        <Card className="flex flex-col overflow-hidden">
            <CardHeader className="pb-2">
                <div className="mb-3 flex items-center gap-2">
                    <div className="bg-tertiary-dark flex size-8 items-center justify-center rounded-lg">
                        <BadgeDollarSignIcon className="text-tertiary-light size-4" />
                    </div>
                    <CardTitle className="text-balance">{plan.label}</CardTitle>
                </div>
                <CardDescription className="min-h-16 text-pretty">
                    {plan.description}
                </CardDescription>
            </CardHeader>

            <CardContent className="flex-none pb-4 pt-2">
                <div className="bg-card-lv1 rounded-lg p-4">
                    <Heading variant="h2" className="text-primary-light">
                        Custom
                    </Heading>
                    <span className="text-text-tertiary text-sm">
                        Tailored to your needs
                    </span>
                </div>
            </CardContent>

            <CardContent className="flex-1 pb-4">
                <p className="text-text-tertiary mb-3 text-xs font-medium uppercase">
                    Everything in Teams, plus
                </p>
                <PlanFeatures features={plan.features} />
            </CardContent>

            <CardContent className="flex-none pb-5 pt-0">
                <Link
                    target="_blank"
                    href={addSearchParamsToUrl(
                        process.env.WEB_SUPPORT_TALK_TO_FOUNDER_URL ?? "",
                        {
                            email,
                            notes: "I want to know more about Enterprise plan.",
                        },
                    )}>
                    <Button
                        size="md"
                        decorative
                        variant="tertiary"
                        className="w-full"
                        leftIcon={<ExternalLinkIcon />}>
                        Talk to sales
                    </Button>
                </Link>
            </CardContent>
        </Card>
    );
}

function PlanFeatures({ features }: { features: Array<string> }) {
    // Filter out common features that are shown in "All plans include"
    const filteredFeatures = features.filter(
        (f) =>
            !COMMON_FEATURES.some((common) =>
                f.toLowerCase().includes(common.toLowerCase()),
            ),
    );

    return (
        <div className="flex flex-col gap-3">
            {filteredFeatures.map((f) => {
                const textWithoutComingSoon = f.split("(coming soon)")[0];
                const Icon = getFeatureIcon(f);

                return (
                    <div
                        key={f}
                        className="text-text-secondary flex items-start gap-3 text-sm">
                        <div className="bg-card-lv1 mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md">
                            <Icon className="text-text-tertiary size-3.5" />
                        </div>
                        <div className="pt-0.5">
                            {textWithoutComingSoon}

                            {f !== textWithoutComingSoon && (
                                <small className="text-text-tertiary ml-1">
                                    (coming soon)
                                </small>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
