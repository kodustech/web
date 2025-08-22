"use client";

import { Suspense, useMemo, useState } from "react";
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
import { Skeleton } from "@components/ui/skeleton";
import { Spinner } from "@components/ui/spinner";
import { KODY_RULES_PATHS } from "@services/kodyRules";
import { useSuspenseFindLibraryKodyRules } from "@services/kodyRules/hooks";
import { type KodyRule } from "@services/kodyRules/types";
import { KodyLearningStatus } from "@services/parameters/types";
import { useQueryClient } from "@tanstack/react-query";
import { BellRing, Plus, SearchIcon } from "lucide-react";

import { CodeReviewPagesBreadcrumb } from "../../../_components/breadcrumb";
import { GenerateRulesOptions } from "../../../_components/generate-rules-options";
import GeneratingConfig from "../../../_components/generating-config";
import { KodyRuleAddOrUpdateItemModal } from "../../../_components/modal";
import { PendingKodyRulesModal } from "../../../_components/pending-rules-modal";
import { KodyRulesRepoFollowsGlobalRulesModal } from "../../../_components/repo-global-rules-modal";
import {
    useFullCodeReviewConfig,
    usePlatformConfig,
} from "../../../../_components/context";
import { useCodeReviewRouteParams } from "../../../../_hooks";
import { KodyRuleItem } from "./item";

export const KodyRulesPage = ({
    kodyRules,
    globalRules,
    pendingRules,
}: {
    kodyRules: KodyRule[];
    globalRules: KodyRule[];
    pendingRules: KodyRule[];
}) => {
    const platformConfig = usePlatformConfig();
    const config = useFullCodeReviewConfig();
    const { repositoryId, directoryId } = useCodeReviewRouteParams();
    const [filterQuery, setFilterQuery] = useState("");
    const queryClient = useQueryClient();

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
            />
        ));
        if (!response) return;

        await refreshRulesList();
    };

    const repoFollowsGlobalRulesModal = () =>
        magicModal.show(() => (
            <KodyRulesRepoFollowsGlobalRulesModal globalRules={globalRules} />
        ));

    const showPendingRules = async () => {
        const response = await magicModal.show(() => (
            <PendingKodyRulesModal pendingRules={pendingRules} />
        ));
        if (!response) return;
        refreshRulesList();
    };

    if (
        platformConfig.kodyLearningStatus ===
        KodyLearningStatus.GENERATING_CONFIG
    ) {
        return <GeneratingConfig />;
    }

    return (
        <Page.Root>
            <Page.Header>
                <CodeReviewPagesBreadcrumb pageName="Kody Rules" />
            </Page.Header>

            <Page.Header>
                <Page.TitleContainer>
                    <Page.Title>Kody Rules</Page.Title>

                    <Page.Description>
                        {repositoryId === "global" ? (
                            "Set up automated rules and guidelines for your code reviews."
                        ) : (
                            <>
                                This repository follows{" "}
                                <Link
                                    href=""
                                    onClick={(ev) => {
                                        ev.preventDefault();
                                        repoFollowsGlobalRulesModal();
                                    }}>
                                    Global Kody Rules
                                </Link>{" "}
                                by default. You can still customize automated
                                rules and guidelines specific to this
                                repository's code reviews.
                            </>
                        )}
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
                            onClick={addNewEmptyRule}>
                            New rule
                        </Button>
                    </Page.HeaderActions>

                    <div className="flex justify-end">
                        {pendingRules.length > 0 && (
                            <Button
                                size="md"
                                variant="helper"
                                className="border-e-primary-light rounded-e-none border-e-4"
                                leftIcon={<BellRing />}
                                onClick={showPendingRules}>
                                Check out new rules!
                            </Button>
                        )}
                    </div>
                </div>
            </Page.Header>

            <Page.Content>
                {repositoryId !== "global" && !directoryId && (
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
                    {kodyRules?.length === 0 ? (
                        <div className="mt-4 flex min-h-[540px] flex-col gap-2">
                            <div className="flex flex-col gap-1">
                                <Heading variant="h2">
                                    Start with Discovery 🚀
                                </Heading>
                                <p className="text-text-secondary text-sm">
                                    <strong>No rules yet?</strong> Import best
                                    practices from top engineering teams in
                                    seconds or create your own by clicking on{" "}
                                    <Link
                                        href=""
                                        onClick={(ev) => {
                                            ev.preventDefault();
                                            addNewEmptyRule();
                                        }}>
                                        New Rule
                                    </Link>
                                    .
                                </p>
                            </div>

                            <div className="mt-4 grid h-full grid-cols-2 gap-2">
                                <Suspense
                                    fallback={
                                        <>
                                            {new Array(3)
                                                .fill(null)
                                                .map((_, index) => (
                                                    <Card
                                                        key={index}
                                                        className="h-full flex-1 items-center justify-center">
                                                        <Spinner />
                                                    </Card>
                                                ))}
                                        </>
                                    }>
                                    <NoItems />
                                </Suspense>

                                <NoItemsViewMore />
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="mb-2">
                                <Input
                                    value={filterQuery}
                                    leftIcon={<SearchIcon />}
                                    onChange={(e) =>
                                        setFilterQuery(e.target.value)
                                    }
                                    placeholder="Search for titles, paths or instructions"
                                />
                            </div>

                            <div className="flex flex-col gap-3">
                                {filteredRules.length === 0 ? (
                                    <div className="text-text-secondary flex flex-col items-center gap-2 py-20 text-sm">
                                        No rules found with your search query.
                                    </div>
                                ) : (
                                    filteredRules.map((rule) => (
                                        <KodyRuleItem
                                            key={rule.uuid}
                                            rule={rule}
                                            onAnyChange={refreshRulesList}
                                        />
                                    ))
                                )}
                            </div>
                        </>
                    )}
                </div>
            </Page.Content>
        </Page.Root>
    );
};

const NoItems = () => {
    const rules = useSuspenseFindLibraryKodyRules();
    const { repositoryId, directoryId } = useCodeReviewRouteParams();

    return rules
        .slice(0, 3)
        .map((r) => (
            <KodyRuleLibraryItem
                rule={r}
                key={r.uuid}
                repositoryId={repositoryId}
                directoryId={directoryId}
            />
        ));
};

const NoItemsViewMore = () => {
    return (
        <Link href="/library/kody-rules" className="w-full">
            <Button
                decorative
                size="lg"
                variant="helper"
                className="h-full w-full"
                leftIcon={<Plus />}>
                View more
            </Button>
        </Link>
    );
};
