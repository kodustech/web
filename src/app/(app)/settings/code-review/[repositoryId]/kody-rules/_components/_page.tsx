"use client";

import { Suspense, useMemo, useState } from "react";
import { Button } from "@components/ui/button";
import { SvgKodyRulesDiscovery } from "@components/ui/icons/SvgKodyRulesDiscovery";
import { Link } from "@components/ui/link";
import { magicModal } from "@components/ui/magic-modal";
import { Page } from "@components/ui/page";
import { Separator } from "@components/ui/separator";
import { Skeleton } from "@components/ui/skeleton";
import { KODY_RULES_PATHS } from "@services/kodyRules";
import {
    KodyRuleWithInheritanceDetails,
    type KodyRule,
} from "@services/kodyRules/types";
import { KodyLearningStatus } from "@services/parameters/types";
import { usePermission } from "@services/permissions/hooks";
import { Action, ResourceType } from "@services/permissions/types";
import { useQueryClient } from "@tanstack/react-query";
import { BellRing, Plus } from "lucide-react";

import { CodeReviewPagesBreadcrumb } from "../../../_components/breadcrumb";
import { GenerateRulesOptions } from "../../../_components/generate-rules-options";
import GeneratingConfig from "../../../_components/generating-config";
import { KodyRuleAddOrUpdateItemModal } from "../../../_components/modal";
import { PendingKodyRulesModal } from "../../../_components/pending-rules-modal";
import {
    useFullCodeReviewConfig,
    usePlatformConfig,
} from "../../../../_components/context";
import { useCodeReviewRouteParams } from "../../../../_hooks";
import { KodyRulesEmptyState } from "./empty";
import { KodyRulesList } from "./list";
import { KodyRulesToolbar, type VisibleScopes } from "./toolbar";

export const KodyRulesPage = ({
    kodyRules,
    pendingRules,
    inheritedGlobalRules,
    inheritedRepoRules,
    inheritedDirectoryRules,
}: {
    kodyRules: KodyRule[];
    inheritedGlobalRules: KodyRuleWithInheritanceDetails[];
    inheritedRepoRules: KodyRuleWithInheritanceDetails[];
    inheritedDirectoryRules: KodyRuleWithInheritanceDetails[];
    pendingRules: KodyRule[];
}) => {
    const platformConfig = usePlatformConfig();
    const config = useFullCodeReviewConfig();
    const { repositoryId, directoryId } = useCodeReviewRouteParams();
    const queryClient = useQueryClient();
    const canEdit = usePermission(
        Action.Update,
        ResourceType.KodyRules,
        repositoryId,
    );

    const repositoryOnlyRules = useMemo(() => {
        if (directoryId) return [];
        if (repositoryId === "global") return [];

        return kodyRules.filter((rule) => !rule.directoryId);
    }, [kodyRules, directoryId, repositoryId]);

    const directoryOnlyRules = useMemo(() => {
        if (!directoryId) return [];
        if (repositoryId === "global") return [];

        return kodyRules.filter((rule) => rule.directoryId === directoryId);
    }, [kodyRules, directoryId, repositoryId]);

    const isGlobalView = repositoryId === "global";
    const isRepoView = !isGlobalView && !directoryId;

    const [filterQuery, setFilterQuery] = useState("");
    const [visibleScopes, setVisibleScopes] = useState<VisibleScopes>({
        self: true,
        dir: true,
        repo: true,
        global: true,
        disabled: true,
    });

    const rulesToDisplay = useMemo(() => {
        const sourceRuleSets = [] as (
            | KodyRule
            | KodyRuleWithInheritanceDetails
        )[][];
        if (isGlobalView) {
            // When in global view, kodyRules array contains only global rules
            sourceRuleSets.push(kodyRules);
        } else if (isRepoView) {
            if (visibleScopes.self) sourceRuleSets.push(repositoryOnlyRules);
            if (visibleScopes.global) sourceRuleSets.push(inheritedGlobalRules);
        } else {
            if (visibleScopes.self) sourceRuleSets.push(directoryOnlyRules);
            if (visibleScopes.dir) sourceRuleSets.push(inheritedDirectoryRules);
            if (visibleScopes.repo) sourceRuleSets.push(inheritedRepoRules);
            if (visibleScopes.global) sourceRuleSets.push(inheritedGlobalRules);
        }

        const combinedRules = sourceRuleSets.flat();

        const activeRules = visibleScopes.disabled
            ? combinedRules
            : combinedRules.filter(
                  (rule) => !("excluded" in rule) || !rule.excluded,
              );

        const uniqueRulesMap = new Map<
            string,
            KodyRule | KodyRuleWithInheritanceDetails
        >();
        for (const rule of activeRules) {
            if (rule.uuid) {
                uniqueRulesMap.set(rule.uuid, rule);
            }
        }
        const uniqueRules = Array.from(uniqueRulesMap.values());

        if (!filterQuery) return uniqueRules;

        const filterQueryLowercase = filterQuery.toLowerCase();
        return uniqueRules.filter(
            (rule) =>
                rule.title.toLowerCase().includes(filterQueryLowercase) ||
                rule.path?.toLowerCase().includes(filterQueryLowercase) ||
                rule.rule.toLowerCase().includes(filterQueryLowercase),
        );
    }, [
        visibleScopes,
        filterQuery,
        isGlobalView,
        isRepoView,
        kodyRules,
        directoryOnlyRules,
        repositoryOnlyRules,
        inheritedGlobalRules,
        inheritedRepoRules,
        inheritedDirectoryRules,
    ]);

    const refreshRulesList = async () => {
        await queryClient.resetQueries({
            predicate: (query) =>
                query.queryKey[0] ===
                KODY_RULES_PATHS.FIND_BY_ORGANIZATION_ID_AND_FILTER,
        });
    };

    const addNewEmptyRule = async () => {
        const directory = config.repositories
            .find((r) => r.id === repositoryId)
            ?.directories?.find((d) => d.id === directoryId);
        const response = await magicModal.show(() => (
            <KodyRuleAddOrUpdateItemModal
                repositoryId={repositoryId}
                directory={directory}
                canEdit={canEdit}
            />
        ));
        if (response) await refreshRulesList();
    };

    const showPendingRules = async () => {
        const response = await magicModal.show(() => (
            <PendingKodyRulesModal pendingRules={pendingRules} />
        ));
        if (response) refreshRulesList();
    };

    if (
        platformConfig.kodyLearningStatus ===
        KodyLearningStatus.GENERATING_CONFIG
    ) {
        return <GeneratingConfig />;
    }

    const hasAnyRulesInSystem =
        kodyRules.length > 0 ||
        inheritedGlobalRules.length > 0 ||
        inheritedRepoRules.length > 0 ||
        inheritedDirectoryRules.length > 0;
    const isToolbarDisabled = !hasAnyRulesInSystem;
    const hasRulesToDisplay = rulesToDisplay.length > 0;

    return (
        <Page.Root>
            <Page.Header>
                <CodeReviewPagesBreadcrumb pageName="Kody Rules" />
            </Page.Header>
            <Page.Header>
                <Page.TitleContainer>
                    <Page.Title>Kody Rules</Page.Title>
                    <Page.Description>
                        Set up automated rules and guidelines for your code
                        reviews.
                    </Page.Description>
                </Page.TitleContainer>
                <div className="flex flex-col gap-2">
                    <Page.HeaderActions>
                        <Link href="/library/kody-rules">
                            <Button
                                size="md"
                                decorative
                                variant="secondary"
                                leftIcon={<SvgKodyRulesDiscovery />}>
                                Discovery
                            </Button>
                        </Link>
                        <Button
                            size="md"
                            type="button"
                            variant="primary"
                            leftIcon={<Plus />}
                            disabled={!canEdit}
                            onClick={addNewEmptyRule}>
                            New rule
                        </Button>
                    </Page.HeaderActions>
                    {pendingRules.length > 0 && (
                        <div className="flex justify-end">
                            <Button
                                size="md"
                                variant="helper"
                                className="border-e-primary-light rounded-e-none border-e-4"
                                leftIcon={<BellRing />}
                                onClick={showPendingRules}>
                                Check out new rules!
                            </Button>
                        </div>
                    )}
                </div>
            </Page.Header>
            <Page.Content>
                {isRepoView && (
                    <>
                        <Suspense fallback={<Skeleton className="h-15" />}>
                            <GenerateRulesOptions />
                        </Suspense>
                        <div className="w-md self-center">
                            <Separator />
                        </div>
                    </>
                )}
                <div className="flex flex-col gap-4">
                    <KodyRulesToolbar
                        filterQuery={filterQuery}
                        onFilterQueryChange={setFilterQuery}
                        visibleScopes={visibleScopes}
                        onVisibleScopesChange={setVisibleScopes}
                        isDisabled={isToolbarDisabled}
                        isRepoView={isRepoView}
                        isGlobalView={isGlobalView}
                    />
                    {!hasRulesToDisplay ? (
                        <KodyRulesEmptyState
                            canEdit={canEdit}
                            onAddNewRule={addNewEmptyRule}
                        />
                    ) : (
                        <KodyRulesList
                            rules={rulesToDisplay}
                            onAnyChange={refreshRulesList}
                        />
                    )}
                </div>
            </Page.Content>
        </Page.Root>
    );
};
