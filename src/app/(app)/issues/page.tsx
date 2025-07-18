"use client";

import { useEffect, useMemo } from "react";
import { Page } from "@components/ui/page";
import { useEffectOnce } from "@hooks/use-effect-once";
import { useIssues } from "@services/issues/hooks";
import { parseAsJson, useQueryState } from "nuqs";
import { filterArray, type FilterValueGroup } from "src/core/utils/filtering";

import { IssuesDataTable } from "./_components/data-table";
import { IssuesFilters } from "./_components/filters";
import { IssueDetailsRightSheet } from "./_components/issue-details-right-sheet";
import { DEFAULT_FILTERS, getFiltersInLocalStorage } from "./_constants";
import { FiltersContext } from "./_contexts/filters";

export default function IssuesPage() {
    const { data: issues, isLoading, error } = useIssues();
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

    const filteredData = useMemo(
        () => filterArray(filters, issues),
        [filters, issues],
    );

    useEffectOnce(() => {
        if (_filtersQuery) return;
        setFilters(savedFiltersOrDefault, { history: "replace" });
    });

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

                        {issues.length > 0 && (
                            <span className="flex gap-0.5 text-sm">
                                <span>Showing </span>
                                {filteredData.length !== issues.length ? (
                                    <>
                                        <span className="text-primary-light">
                                            {filteredData.length}
                                        </span>
                                        <span className="text-text-secondary">
                                            of {issues.length} issues
                                        </span>
                                    </>
                                ) : (
                                    <span className="text-text-secondary">
                                        all {issues.length} issues
                                    </span>
                                )}
                            </span>
                        )}
                    </div>
                </div>
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
