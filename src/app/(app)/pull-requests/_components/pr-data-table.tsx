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
        <TableContainer className="rounded-xl border bg-card-lv1/30">
            <Table className="w-full">
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-8"></TableHead>
                        <TableHead className="w-20">PR</TableHead>
                        <TableHead className="min-w-[18rem]">Title</TableHead>
                        <TableHead className="w-32">Repository</TableHead>
                        <TableHead className="w-40">Branch</TableHead>
                        <TableHead className="w-40">Author</TableHead>
                        <TableHead className="min-w-[16rem]">
                            Current stage
                        </TableHead>
                        <TableHead className="w-20 text-center">
                            Reviews
                        </TableHead>
                        <TableHead className="w-32">Created</TableHead>
                        <TableHead className="w-20 text-center">
                            Suggestions
                        </TableHead>
                        <TableHead className="w-32 text-center">
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
