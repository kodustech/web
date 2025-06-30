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
    console.log("📄 IssuesPage: Component rendering");

    const { data: issues, isLoading } = useIssues();
    const [peek] = useQueryState("peek");

    console.log("📄 IssuesPage: Data loaded", {
        issuesCount: issues?.length || 0,
        isLoading,
        hasPeek: !!peek
    });

    const [_filtersQuery, setFilters] = useQueryState("filters", {
        ...parseAsJson((j) => {
            console.log("📄 IssuesPage: Parsing filters from URL", { rawFilters: j });
            try {
                if (!j) {
                    console.log("📄 IssuesPage: No filters, using default");
                    return DEFAULT_FILTERS;
                }

                if (typeof j === 'string') {
                    const parsed = JSON.parse(j) as FilterValueGroup;
                    console.log("📄 IssuesPage: Parsed string filters", { parsed });
                    return parsed;
                }

                console.log("📄 IssuesPage: Using object filters", { filters: j });
                return j as FilterValueGroup;
            } catch (error) {
                console.warn("📄 IssuesPage: Failed to parse filters from URL, using default:", error);
                return DEFAULT_FILTERS;
            }
        }),
        history: "push",
        clearOnDefault: false,
        parse: (value) => {
            console.log("📄 IssuesPage: Parsing filter value", { value });
            try {
                const parsed = JSON.parse(decodeURIComponent(value));
                console.log("📄 IssuesPage: Successfully parsed filter value", { parsed });
                return parsed;
            } catch {
                console.warn("📄 IssuesPage: Failed to parse filter value, using default");
                return DEFAULT_FILTERS;
            }
        },
        serialize: (value) => {
            console.log("📄 IssuesPage: Serializing filter value", { value });
            try {
                const serialized = encodeURIComponent(JSON.stringify(value));
                console.log("📄 IssuesPage: Successfully serialized filter value", { serialized });
                return serialized;
            } catch {
                console.warn("📄 IssuesPage: Failed to serialize filter value, using default");
                return encodeURIComponent(JSON.stringify(DEFAULT_FILTERS));
            }
        }
    });

    console.log("📄 IssuesPage: Filter query state", {
        hasFiltersQuery: !!_filtersQuery,
        filtersQuery: _filtersQuery
    });

    const savedFiltersOrDefault = getFiltersInLocalStorage() ?? DEFAULT_FILTERS;
    const filters = _filtersQuery ?? savedFiltersOrDefault;

    console.log("📄 IssuesPage: Final filters", {
        filters,
        source: _filtersQuery ? "url" : "localStorage"
    });

    const filteredData = useMemo(
        () => {
            console.log("📄 IssuesPage: Filtering data", {
                totalIssues: issues?.length || 0,
                filters
            });
            const filtered = filterArray(filters, issues);
            console.log("📄 IssuesPage: Filtered data result", {
                filteredCount: filtered.length
            });
            return filtered;
        },
        [filters, issues],
    );

    useEffectOnce(() => {
        console.log("📄 IssuesPage: useEffectOnce - setting filters", {
            hasFiltersQuery: !!_filtersQuery,
            savedFiltersOrDefault
        });
        if (_filtersQuery) return;
        setFilters(savedFiltersOrDefault, { history: "replace" });
    });

    useEffect(() => {
        console.log("📄 IssuesPage: useEffect - peek scroll", { peek });
        const listItem = globalThis.document.querySelector(`[data-peek]`);

        listItem?.scrollIntoView({
            block: "center",
            inline: "center",
            behavior: "smooth",
        });
    }, [peek]);

    console.log("📄 IssuesPage: Rendering component", {
        filteredDataCount: filteredData.length,
        isLoading
    });

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
