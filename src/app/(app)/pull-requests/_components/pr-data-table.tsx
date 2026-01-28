"use client";

import { Spinner } from "@components/ui/spinner";
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableHeader,
    TableRow,
} from "@components/ui/table";
import { PrListItem } from "./pr-list-item";
import type { PullRequestExecutionGroup } from "./types";

interface PrDataTableProps {
    data: PullRequestExecutionGroup[];
    loading?: boolean;
}

export const PrDataTable = ({ data, loading }: PrDataTableProps) => {
    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Spinner className="size-7" />
            </div>
        );
    }

    if (!data.length) {
        return (
            <div className="py-12 text-center">
                <p className="text-text-secondary text-sm">
                    No pull requests found.
                </p>
            </div>
        );
    }

    return (
        <TableContainer className="rounded-xl border border-card-lv3/40 bg-card-lv1/50">
            <Table className="w-full">
                <TableHeader>
                    <TableRow className="hover:bg-transparent">
                        <TableHead className="w-8"></TableHead>
                        <TableHead className="w-20 text-text-tertiary text-xs uppercase tracking-wide font-medium">PR</TableHead>
                        <TableHead className="min-w-[18rem] text-text-tertiary text-xs uppercase tracking-wide font-medium">Title</TableHead>
                        <TableHead className="w-32 text-text-tertiary text-xs uppercase tracking-wide font-medium">Repository</TableHead>
                        <TableHead className="w-40 text-text-tertiary text-xs uppercase tracking-wide font-medium">Branch</TableHead>
                        <TableHead className="w-40 text-text-tertiary text-xs uppercase tracking-wide font-medium">Author</TableHead>
<TableHead className="w-20 text-center text-text-tertiary text-xs uppercase tracking-wide font-medium">
                            Reviews
                        </TableHead>
                        <TableHead className="w-32 text-text-tertiary text-xs uppercase tracking-wide font-medium">Created</TableHead>
                        <TableHead className="w-20 text-center text-text-tertiary text-xs uppercase tracking-wide font-medium">
                            Suggestions
                        </TableHead>
                        <TableHead className="w-32 text-center text-text-tertiary text-xs uppercase tracking-wide font-medium">
                            Status
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((group) => (
                        <PrListItem key={group.prId} group={group} />
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};
