"use client";

import { IssueSeverityLevelBadge } from "@components/system/issue-severity-level-badge";
import { Button } from "@components/ui/button";
import { DataTableColumnHeader } from "@components/ui/data-table";
import { Link } from "@components/ui/link";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@components/ui/tooltip";
import type { getIssuesWithPagination } from "@services/issues/fetch";
import { ColumnDef } from "@tanstack/react-table";
import { formatDistanceToNow, parseISO } from "date-fns";

import { StatusBadge } from "./status-badge";

type Row = Awaited<ReturnType<typeof getIssuesWithPagination>>[number];

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
        cell: ({ row }) => {
            return (
                <div className="flex items-center justify-end gap-2">
                    <Link href={`/issues/${row.original.uuid}`}>
                        <Button decorative variant="primary-dark" size="xs">
                            Details
                        </Button>
                    </Link>
                </div>
            );
        },
    },
];
