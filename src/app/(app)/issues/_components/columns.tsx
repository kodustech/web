"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IssueSeverityLevelBadge } from "@components/system/issue-severity-level-badge";
import { Button } from "@components/ui/button";
import { DataTableColumnHeader } from "@components/ui/data-table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@components/ui/dropdown-menu";
import { Link } from "@components/ui/link";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@components/ui/tooltip";
import { useReactQueryInvalidateQueries } from "@hooks/use-invalidate-queries";
import type { getIssues } from "@services/issues/fetch";
import { ColumnDef } from "@tanstack/react-table";
import { formatDistanceToNow, parseISO } from "date-fns";
import { Ellipsis } from "lucide-react";
import { useSelectedTeamId } from "src/core/providers/selected-team-context";

import { StatusBadge } from "./status-badge";

type Row = Awaited<ReturnType<typeof getIssues>>[number];

export const columns: ColumnDef<Row>[] = [
    {
        id: "severity",
        accessorFn: (item) => item.severity,
        enableSorting: false,
        minSize: 80,
        maxSize: 80,
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Severity" />
        ),
        cell: ({ renderValue }) => {
            const value = renderValue<Row["severity"]>();
            return <IssueSeverityLevelBadge severity={value} />;
        },
    },
    {
        id: "category",
        accessorFn: (item) => item.label,
        enableSorting: false,
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Category" />
        ),
        cell: ({ renderValue }) => (
            <div>{renderValue<string>().replaceAll("_", " ")}</div>
        ),
    },
    {
        id: "title",
        accessorFn: (item) => item.title,
        enableSorting: false,
        minSize: 450,
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Title" />
        ),
        cell: ({ renderValue }) => {
            const value = renderValue<string>();

            return (
                <Tooltip disableHoverableContent>
                    <TooltipTrigger className="line-clamp-2 text-left">
                        {value}
                    </TooltipTrigger>
                    <TooltipContent className="max-w-96" sideOffset={10}>
                        {value}
                    </TooltipContent>
                </Tooltip>
            );
        },
    },
    {
        id: "repository",
        accessorFn: (item) => item.repository.name,
        enableSorting: false,
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Repository" />
        ),
    },
    {
        id: "filepath",
        accessorFn: (item) => item.filePath,
        enableSorting: false,
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="File" />
        ),
        cell: ({ renderValue }) => {
            const value = renderValue<string>();

            return (
                <Tooltip>
                    <TooltipTrigger className="line-clamp-1 max-w-60 text-left text-ellipsis [direction:rtl]">
                        {value}
                    </TooltipTrigger>
                    <TooltipContent sideOffset={10}>{value}</TooltipContent>
                </Tooltip>
            );
        },
    },
    {
        id: "age",
        minSize: 120,
        maxSize: 120,
        enableSorting: false,
        accessorFn: (item) => formatDistanceToNow(parseISO(item.createdAt)),
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Age" />
        ),
    },
    {
        id: "status",
        accessorFn: (item) => item.status,
        enableSorting: false,
        minSize: 50,
        maxSize: 50,
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Status" />
        ),
        cell: ({ renderValue }) => {
            const value = renderValue<Row["status"]>();
            return <StatusBadge value={value} />;
        },
    },
    {
        id: "actions",
        meta: { align: "right" },
        minSize: 50,
        maxSize: 50,
        cell: ({ row, table }) => {
            const [isOpen, setIsOpen] = useState(false);
            const router = useRouter();
            const { teamId } = useSelectedTeamId();
            const { generateQueryKey, invalidateQueries } =
                useReactQueryInvalidateQueries();

            // const saveSelectedRepositoriesAction = async () => {
            //     const repositoriesWithoutThisOne = table
            //         .getRowModel()
            //         .rows.map((r) => r.original)
            //         .filter((r) => r.id !== row.original.id);

            //     await createOrUpdateRepositories(
            //         repositoriesWithoutThisOne,
            //         teamId,
            //     );

            //     await updateCodeReviewParameterRepositories(teamId);

            //     toast({
            //         variant: "success",
            //         title: "Integration removed",
            //         description: (
            //             <>
            //                 Integration with{" "}
            //                 <span className="text-danger">
            //                     {row.original.organizationName}/
            //                     {row.original.name}
            //                 </span>{" "}
            //                 was removed.
            //             </>
            //         ),
            //     });

            //     await Promise.all([
            //         invalidateQueries({
            //             type: "all",
            //             queryKey: generateQueryKey(
            //                 PARAMETERS_PATHS.GET_BY_KEY,
            //                 {
            //                     params: {
            //                         key: ParametersConfigKey.CODE_REVIEW_CONFIG,
            //                         teamId,
            //                     },
            //                 },
            //             ),
            //         }),

            //         invalidateQueries({
            //             type: "all",
            //             queryKey: generateQueryKey(
            //                 INTEGRATION_CONFIG.GET_INTEGRATION_CONFIG_BY_CATEGORY,
            //                 {
            //                     params: {
            //                         teamId,
            //                         integrationCategory:
            //                             IntegrationCategory.CODE_MANAGEMENT,
            //                     },
            //                 },
            //             ),
            //         }),
            //         revalidateServerSidePath("/settings/git"),
            //     ]);

            //     router.refresh();
            // };

            return (
                <div className="flex items-center justify-end gap-2">
                    <Link href={`/issues/${row.original.uuid}`}>
                        <Button decorative variant="primary-dark" size="xs">
                            Details
                        </Button>
                    </Link>

                    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
                        <DropdownMenuTrigger asChild>
                            <Button variant="helper" size="icon-xs">
                                <Ellipsis />
                            </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end">
                            <DropdownMenuItem
                                className="text-danger"
                                onClick={async () => {
                                    setIsOpen(false);

                                    // magicModal.show(() => (
                                    //     <DeleteModal
                                    //         repository={row.original}
                                    //         saveFn={saveSelectedRepositoriesAction}
                                    //     />
                                    // ));
                                }}>
                                Close
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            );
        },
    },
];
