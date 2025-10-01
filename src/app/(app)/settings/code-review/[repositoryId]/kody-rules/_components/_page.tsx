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
    KodyRuleInheritanceOrigin,
    KodyRulesStatus,
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
import { KodyRulesInheritedRulesModal } from "../../../_components/repo-global-rules-modal";
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
    excludedRules,
    inheritedGlobalRules,
    inheritedRepoRules,
    inheritedDirectoryRules,
}: {
    kodyRules: KodyRule[];
    excludedRules: KodyRule[];
    inheritedGlobalRules: KodyRule[];
    inheritedRepoRules: KodyRule[];
    inheritedDirectoryRules: KodyRule[];
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
    const parentRepository = isRepoView
        ? ""
        : config?.repositories.find((r) => r.id === repositoryId)?.name || "";

    const [filterQuery, setFilterQuery] = useState("");
    const [visibleScopes, setVisibleScopes] = useState<VisibleScopes>({
        self: true,
        dir: true,
        repo: true,
        global: true,
        disabled: false,
    });

    const rulesToDisplay = useMemo(() => {
        const combined: KodyRule[] = [];
        if (isGlobalView) {
            // When in global view, kodyRules array contains only global rules
            combined.push(...kodyRules);
        } else if (isRepoView) {
            if (visibleScopes.self) combined.push(...repositoryOnlyRules);
            if (visibleScopes.global) combined.push(...inheritedGlobalRules);
        } else {
            if (visibleScopes.self) combined.push(...directoryOnlyRules);
            if (visibleScopes.dir) combined.push(...inheritedDirectoryRules);
            if (visibleScopes.repo) combined.push(...inheritedRepoRules);
            if (visibleScopes.global) combined.push(...inheritedGlobalRules);
        }

        if (visibleScopes.disabled) {
            combined.push(...excludedRules);
        }

        const deDupedRules = Array.from(
            combined
                .reduce((map, rule) => {
                    if (!map.has(rule.uuid!)) {
                        map.set(rule.uuid!, rule);
                    }
                    return map;
                }, new Map<string, KodyRule>())
                .values(),
        );

        if (!filterQuery) return deDupedRules;

        const filterQueryLowercase = filterQuery.toLowerCase();
        return deDupedRules.filter(
            (rule) =>
                rule.title.toLowerCase().includes(filterQueryLowercase) ||
                rule.path?.toLowerCase().includes(filterQueryLowercase) ||
                rule.rule.toLowerCase().includes(filterQueryLowercase),
        );
    }, [
        visibleScopes,
        filterQuery,
        kodyRules,
        isGlobalView,
        isRepoView,
        directoryId,
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

    const showGlobalRulesModal = () =>
        magicModal.show(() => (
            <KodyRulesInheritedRulesModal
                inheritedRules={inheritedGlobalRules}
                repoName="Global"
            />
        ));

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

const getHeaderDescription = (
    isGlobal: boolean,
    isRepo: boolean,
    showGlobalRulesModal: () => void,
    showRepoRulesModal: () => void,
) => {
    if (isGlobal) {
        return (
            <>Set up automated rules and guidelines for your code reviews.</>
        );
    }

    if (isRepo) {
        return (
            <>
                This repository follows{" "}
                <Link href="" onClick={showGlobalRulesModal}>
                    Global Kody Rules
                </Link>{" "}
                by default.
            </>
        );
    }

    return (
        <>
            This directory follows{" "}
            <Link href="" onClick={showGlobalRulesModal}>
                Global Kody Rules
            </Link>{" "}
            and{" "}
            <Link href="" onClick={showRepoRulesModal}>
                Repository Kody Rules
            </Link>{" "}
            by default.
        </>
    );
};
