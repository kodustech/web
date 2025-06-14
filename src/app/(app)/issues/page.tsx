"use client";

import { useCallback, useRef } from "react";
import { DataTable } from "@components/ui/data-table";
import { Page } from "@components/ui/page";
import { getIssuesWithPagination } from "@services/issues/fetch";
import { useSuspenseGetOrganizationId } from "@services/setup/hooks";
import { useInfiniteQuery } from "@tanstack/react-query";

import { columns } from "./_components/columns";

const MAX_POST_PAGE = 10;

export default function IssuesPage() {
    const organizationId = useSuspenseGetOrganizationId();
    const observer = useRef<IntersectionObserver>(null);

    const infiniteQuery = useInfiniteQuery({
        queryKey: ["issues"],
        initialPageParam: 1,
        queryFn: ({ pageParam }) =>
            getIssuesWithPagination({
                page: pageParam,
                limit: MAX_POST_PAGE,
                organizationId,
                filters: {},
            }),
        getNextPageParam: (lastPage, allPages) =>
            lastPage.length ? allPages.length + 1 : undefined,
    });

    const { data, error, fetchNextPage, hasNextPage, isFetching, isLoading } =
        infiniteQuery;

    const lastElementRef = useCallback(
        (node: HTMLDivElement) => {
            if (isLoading) return;
            if (observer.current) observer.current.disconnect();

            observer.current = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting && hasNextPage && !isFetching) {
                    fetchNextPage();
                }
            });

            if (node) observer.current.observe(node);
        },
        [fetchNextPage, hasNextPage, isFetching, isLoading],
    );

    const tableData = data?.pages.flat() ?? [];

    return (
        <Page.Root>
            <Page.Header className="max-w-full">
                <Page.Title>Issues</Page.Title>
            </Page.Header>

            <Page.Content className="max-w-full">
                <DataTable
                    data={tableData}
                    columns={columns}
                    loading={isLoading || (isFetching && "bottom")}
                />

                <div ref={lastElementRef} />
            </Page.Content>
        </Page.Root>
    );
}
