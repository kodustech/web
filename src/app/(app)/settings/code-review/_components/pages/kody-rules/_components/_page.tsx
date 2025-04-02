"use client";

import { Suspense, useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@components/ui/breadcrumb";
import { Button } from "@components/ui/button";
import { Card } from "@components/ui/card";
import { Heading } from "@components/ui/heading";
import { SvgKodyRulesDiscovery } from "@components/ui/icons/SvgKodyRulesDiscovery";
import { Input } from "@components/ui/input";
import { KodyRuleLibraryItem } from "@components/ui/kody-rules/library-item-card";
import { Link } from "@components/ui/link";
import { magicModal } from "@components/ui/magic-modal";
import { Page } from "@components/ui/page";
import { Separator } from "@components/ui/separator";
import { useSuspenseFindLibraryKodyRules } from "@services/kodyRules/hooks";
import { type KodyRule } from "@services/kodyRules/types";
import { KodyLearningStatus } from "@services/parameters/types";
import { BellRing, Plus } from "lucide-react";
import { useSelectedTeamId } from "src/core/providers/selected-team-context";
import { revalidateServerSideTag } from "src/core/utils/revalidate-server-side";

import {
    useAutomationCodeReviewConfig,
    usePlatformConfig,
} from "../../../context";
import GeneratingConfig from "../../generating-config";
import {
    AutomationCodeReviewConfigPageProps,
    CodeReviewGlobalConfig,
    CodeReviewSummaryOptions,
    GroupingModeSuggestions,
    LimitationType,
    SeverityLevel,
} from "../../types";
import { GenerateRulesButton } from "./generate-rules";
import { KodyRuleItem } from "./item";
import { KodyRuleAddOrUpdateItemModal } from "./modal";
import { PendingKodyRulesModal } from "./pending-rules-modal";
import { KodyRulesRepoFollowsGlobalRulesModal } from "./repo-global-rules-modal";

export const KodyRulesPage = ({
    kodyRules,
    repositoryId,
    globalRules,
    pendingRules,
}: AutomationCodeReviewConfigPageProps & {
    kodyRules: KodyRule[];
    globalRules: KodyRule[];
    pendingRules: KodyRule[];
}) => {
    const platformConfig = usePlatformConfig();
    const { teamId } = useSelectedTeamId();
    const router = useRouter();
    const config = useAutomationCodeReviewConfig(repositoryId);
    const [filterQuery, setFilterQuery] = useState("");

    const newConfig: CodeReviewGlobalConfig = {
        ...config,
        automatedReviewActive: config?.automatedReviewActive ?? false,
        ignorePaths: config?.ignorePaths ?? [],
        ignoredTitleKeywords: config?.ignoredTitleKeywords ?? [],
        baseBranches: config?.baseBranches ?? [],
        kodusConfigFileOverridesWebPreferences:
            config?.kodusConfigFileOverridesWebPreferences ?? false,
        pullRequestApprovalActive: config?.pullRequestApprovalActive ?? false,
        isRequestChangesActive: config?.isRequestChangesActive ?? false,
        reviewOptions: {
            code_style: config?.reviewOptions?.code_style ?? false,
            documentation_and_comments:
                config?.reviewOptions?.documentation_and_comments ?? false,
            error_handling: config?.reviewOptions?.error_handling ?? false,
            maintainability: config?.reviewOptions?.maintainability ?? false,
            performance_and_optimization:
                config?.reviewOptions?.performance_and_optimization ?? false,
            potential_issues: config?.reviewOptions?.potential_issues ?? false,
            refactoring: config?.reviewOptions?.refactoring ?? false,
            security: config?.reviewOptions?.security ?? false,
            kody_rules: config?.reviewOptions?.kody_rules ?? false,
            breaking_changes: config?.reviewOptions?.breaking_changes ?? false,
        },
        kodyRulesGeneratorEnabled: config?.kodyRulesGeneratorEnabled ?? true,
        summary: {
            behaviourForExistingDescription:
                config?.summary?.behaviourForExistingDescription ??
                CodeReviewSummaryOptions.REPLACE,
            customInstructions: config?.summary?.customInstructions ?? "",
            generatePRSummary: config?.summary?.generatePRSummary ?? false,
        },
        suggestionControl: {
            groupingMode:
                config?.suggestionControl?.groupingMode ??
                GroupingModeSuggestions.FULL,
            limitationType:
                config?.suggestionControl?.limitationType ?? LimitationType.PR,
            maxSuggestions: config?.suggestionControl?.maxSuggestions ?? 10,
            severityLevelFilter:
                config?.suggestionControl?.severityLevelFilter ??
                SeverityLevel.HIGH,
        },
    };

    const filteredRules = useMemo(
        () =>
            kodyRules?.filter((rule) => {
                if (!filterQuery) return true;
                const filterQueryLowercase = filterQuery.toLowerCase();

                return (
                    rule.title.toLowerCase().includes(filterQueryLowercase) ||
                    rule.path.toLowerCase().includes(filterQueryLowercase) ||
                    rule.rule.toLowerCase().includes(filterQueryLowercase)
                );
            }),
        [kodyRules, filterQuery],
    );

    const refreshRulesList = useCallback(() => {
        revalidateServerSideTag("kody-rules-list");
        router.refresh();
    }, [router]);

    const addNewEmptyRule = async () => {
        const response = await magicModal.show(() => (
            <KodyRuleAddOrUpdateItemModal repositoryId={repositoryId} />
        ));
        if (!response) return;

        refreshRulesList();
    };

    const repoFollowsGlobalRulesModal = () =>
        magicModal.show(() => (
            <KodyRulesRepoFollowsGlobalRulesModal globalRules={globalRules} />
        ));

    const showPendingRules = useCallback(async () => {
        const response = await magicModal.show(() => (
            <PendingKodyRulesModal pendingRules={pendingRules} />
        ));
        if (!response) return;

        refreshRulesList();
    }, [pendingRules]);

    if (
        platformConfig.kodyLearningStatus ===
        KodyLearningStatus.GENERATING_CONFIG
    ) {
        return <GeneratingConfig />;
    }

    return (
        <Page.Root>
            <Page.Header>
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink
                                href={`/settings/code-review/${repositoryId}/general`}>
                                {repositoryId === "global"
                                    ? "Global"
                                    : config?.name}
                            </BreadcrumbLink>
                        </BreadcrumbItem>

                        <BreadcrumbSeparator />

                        <BreadcrumbItem>
                            <BreadcrumbPage>Kody Rules</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </Page.Header>

            <Page.Header className="flex flex-col gap-4">
                <div className="flex w-full flex-row items-center justify-between">
                    <Page.Title>Kody Rules</Page.Title>

                    <div className="flex items-center justify-end">
                        <Page.HeaderActions>
                            {repositoryId !== "global" && config && (
                                <GenerateRulesButton
                                    config={newConfig}
                                    repositoryId={repositoryId}
                                    teamId={teamId}
                                />
                            )}
                            <Button
                                variant="default"
                                leftIcon={
                                    <SvgKodyRulesDiscovery className="!size-4" />
                                }
                                onClick={() =>
                                    router.push("/library/kody-rules")
                                }>
                                Discovery
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                leftIcon={<Plus className="!size-4" />}
                                onClick={addNewEmptyRule}>
                                New rule
                            </Button>
                        </Page.HeaderActions>
                    </div>
                </div>

                <Separator />

                <div className="flex w-full flex-row gap-3">
                    {repositoryId === "global" ? (
                        <p className="w-full text-sm text-muted-foreground">
                            Set up automated rules and guidelines for your code
                            reviews.
                        </p>
                    ) : (
                        <p className="w-full text-sm text-muted-foreground">
                            This repository follows{" "}
                            <Link
                                href=""
                                onClick={(ev) => {
                                    ev.preventDefault();
                                    repoFollowsGlobalRulesModal();
                                }}>
                                Global Kody Rules
                            </Link>{" "}
                            by default. You can still customize automated rules
                            and guidelines specific to this repository's code
                            reviews.
                        </p>
                    )}

                    {pendingRules.length > 0 && (
                        <Button
                            variant="outline"
                            className="rounded-e-sm border-e-8 border-brand-orange text-brand-orange"
                            leftIcon={
                                <BellRing className="fill-brand-orange" />
                            }
                            onClick={showPendingRules}>
                            <Heading variant="h3">Check out new rules!</Heading>
                        </Button>
                    )}
                </div>
            </Page.Header>

            <Page.Content>
                <div className="flex flex-col gap-4">
                    {kodyRules?.length === 0 ? (
                        <Suspense>
                            <NoItems
                                addEmptyRule={addNewEmptyRule}
                                repositoryId={repositoryId}
                                onAddRule={refreshRulesList}
                            />
                        </Suspense>
                    ) : (
                        <div className="flex flex-col gap-4">
                            <Input
                                placeholder="Search for titles, paths or instructions"
                                value={filterQuery}
                                onChange={(e) => setFilterQuery(e.target.value)}
                            />

                            {filteredRules.length === 0 ? (
                                <div className="flex flex-col items-center gap-2 py-20 text-sm text-muted-foreground">
                                    No rules found with your search query.
                                </div>
                            ) : (
                                filteredRules.map((rule) => (
                                    <KodyRuleItem
                                        key={rule.uuid}
                                        rule={rule}
                                        repositoryId={repositoryId}
                                        onAnyChange={refreshRulesList}
                                    />
                                ))
                            )}
                        </div>
                    )}
                </div>
            </Page.Content>
        </Page.Root>
    );
};

const NoItems = ({
    addEmptyRule,
    repositoryId,
    onAddRule,
}: {
    addEmptyRule: () => void;
    repositoryId: string;
    onAddRule?: () => void;
}) => {
    const router = useRouter();
    const rules = useSuspenseFindLibraryKodyRules();

    return (
        <div className="flex flex-col gap-6 rounded-2xl bg-card/40 px-10 py-8">
            <div className="flex flex-col gap-1">
                <Heading variant="h2">Start with Discovery 🚀</Heading>
                <p className="text-sm text-muted-foreground">
                    <strong>No rules yet?</strong> Import best practices from
                    top engineering teams in seconds or create your own by
                    clicking on{" "}
                    <Link
                        href=""
                        onClick={(ev) => {
                            ev.preventDefault();
                            addEmptyRule();
                        }}>
                        New Rule
                    </Link>
                    .
                </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
                {rules.slice(0, 3).map((r) => (
                    <KodyRuleLibraryItem
                        key={r.uuid}
                        rule={r}
                        repositoryId={repositoryId}
                        onAddRule={onAddRule}
                    />
                ))}

                <Card
                    className="group flex cursor-pointer items-center justify-center"
                    onClick={() => {
                        router.push("/library/kody-rules");
                    }}>
                    <Button
                        variant="link"
                        leftIcon={<Plus />}
                        className="pointer-events-none group-hover:text-brand-orange group-hover:underline">
                        View more
                    </Button>
                </Card>
            </div>
        </div>
    );
};
