"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { Page } from "@components/ui/page";
import { useEffectOnce } from "@hooks/use-effect-once";
import { useIssues } from "@services/issues/hooks";
import { Action, ResourceType } from "@services/permissions/types";
import { parseAsJson, useQueryState } from "nuqs";
import { useAuth } from "src/core/providers/auth.provider";
import { usePermissions } from "src/core/providers/permissions.provider";
import {
    filterArray,
    isFilterValueGroup,
    type FilterValueGroup,
    type FilterValueItem,
} from "src/core/utils/filtering";
import { capturePosthogEvent } from "src/core/utils/posthog-client";
import { hasPermission } from "src/core/utils/permissions";

import { IssuesDataTable } from "./_components/data-table";
import { IssueCreationToggle } from "./_components/issue-creation-toggle";
import { IssuesFilters } from "./_components/filters";
import { IssueDetailsRightSheet } from "./_components/issue-details-right-sheet";
import { DEFAULT_FILTERS, getFiltersInLocalStorage } from "./_constants";
import { FiltersContext } from "./_contexts/filters";

export default function IssuesPage() {
    const permissions = usePermissions();
    const { organizationId } = useAuth();
    const lastFiltersRef = useRef<string | null>(null);
    const skipNextFilterEventRef = useRef(false);

    const { data: issues, isLoading, error } = useIssues();

    const canAccessIssues = useMemo(() => {
        return issues.filter((issue) =>
            hasPermission({
                permissions,
                organizationId: organizationId!,
                action: Action.Read,
                resource: ResourceType.Issues,
                repoId: issue.repository.id,
            }),
        );
    }, [issues, permissions, organizationId]);

    const [peek] = useQueryState("peek");

    const [_filtersQuery, setFilters] = useQueryState("filters", {
        ...parseAsJson((j) => {
            try {
                if (!j) {
                    return DEFAULT_FILTERS;
                }

                if (typeof j === "string") {
                    const parsed = JSON.parse(j) as FilterValueGroup;
                    return parsed;
                }

                return j as FilterValueGroup;
            } catch {
                return DEFAULT_FILTERS;
            }
        }),
        history: "push",
        clearOnDefault: false,
        parse: (value) => {
            try {
                const parsed = JSON.parse(decodeURIComponent(value));
                return parsed;
            } catch {
                return DEFAULT_FILTERS;
            }
        },
        serialize: (value) => {
            try {
                const serialized = encodeURIComponent(JSON.stringify(value));
                return serialized;
            } catch {
                return encodeURIComponent(JSON.stringify(DEFAULT_FILTERS));
            }
        },
    });

    const savedFiltersOrDefault = getFiltersInLocalStorage() ?? DEFAULT_FILTERS;
    const filters = _filtersQuery ?? savedFiltersOrDefault;

    const flattenFilterItems = useCallback(function flattenFilters(
        group: FilterValueGroup,
    ): FilterValueItem[] {
        return group.items.flatMap((item) =>
            isFilterValueGroup(item) ? flattenFilters(item) : [item],
        );
    }, []);

    const filteredData = useMemo(
        () => filterArray(filters, canAccessIssues),
        [filters, canAccessIssues],
    );

    useEffectOnce(() => {
        if (_filtersQuery) return;
        skipNextFilterEventRef.current = true;
        setFilters(savedFiltersOrDefault, { history: "replace" });
    });

    useEffectOnce(() => {
        capturePosthogEvent({
            event: "main_screen_viewed",
            properties: { screen: "issues" },
        });
    });

    useEffect(() => {
        const serialized = JSON.stringify(filters);
        if (skipNextFilterEventRef.current) {
            skipNextFilterEventRef.current = false;
            lastFiltersRef.current = serialized;
            return;
        }
        if (!lastFiltersRef.current) {
            lastFiltersRef.current = serialized;
            return;
        }

        if (lastFiltersRef.current === serialized) return;
        lastFiltersRef.current = serialized;

        const filterItems = flattenFilterItems(filters).map((item) => ({
            field: item.field,
            operator: item.operator,
            value: item.value,
        }));

        capturePosthogEvent({
            event: "issues_filter_changed",
            properties: {
                condition: filters.condition,
                items: filterItems,
                items_count: filterItems.length,
            },
        });
    }, [filters, flattenFilterItems]);

    useEffect(() => {
        const listItem = globalThis.document.querySelector(`[data-peek]`);

        listItem?.scrollIntoView({
            block: "center",
            inline: "center",
            behavior: "smooth",
        });
    }, [peek]);

    return (
        <Page.Root className="overflow-hidden pb-0">
            <Page.Header className="max-w-full">
                <div className="flex items-center gap-5">
                    <Page.Title>Issues</Page.Title>

                    <div className="flex items-center gap-3">
                        <FiltersContext value={{ filters, setFilters }}>
                            <IssuesFilters />
                        </FiltersContext>

                        {canAccessIssues.length > 0 && (
                            <span className="flex gap-0.5 text-sm">
                                <span>Showing </span>
                                {filteredData.length !== issues.length ? (
                                    <>
                                        <span className="text-primary-light">
                                            {filteredData.length}
                                        </span>
                                        <span className="text-text-secondary">
                                            of {canAccessIssues.length} issues
                                        </span>
                                    </>
                                ) : (
                                    <span className="text-text-secondary">
                                        all {canAccessIssues.length} issues
                                    </span>
                                )}
                            </span>
                        )}
                    </div>
                </div>

                <IssueCreationToggle />
            </Page.Header>

            {/* 'overflow-auto' is required to virtualizing table */}
            <Page.Content className="max-w-full overflow-auto px-0">
                <IssuesDataTable
                    peek={peek}
                    data={filteredData}
                    loading={isLoading}
                />
            </Page.Content>

            <IssueDetailsRightSheet issues={filteredData} />
        </Page.Root>
    );
}
