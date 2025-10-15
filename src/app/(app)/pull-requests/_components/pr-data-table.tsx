"use client";

import { Spinner } from "@components/ui/spinner";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@components/ui/table";
import type { PullRequestExecution } from "@services/pull-requests";

import { PrListItem } from "./pr-list-item";

interface PrDataTableProps {
    data: PullRequestExecution[];
    loading?: boolean;
}

export const PrDataTable = ({ data, loading }: PrDataTableProps) => {
    console.log(data);

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
        <div className="overflow-hidden rounded-lg border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-8"></TableHead>
                        <TableHead className="w-20">PR</TableHead>
                        <TableHead className="min-w-0 flex-1">Title</TableHead>
                        <TableHead className="w-32">Repository</TableHead>
                        <TableHead className="w-40">Branch</TableHead>
                        <TableHead className="w-32">Created</TableHead>
                        <TableHead className="w-32">Author</TableHead>
                        <TableHead className="w-20 text-center">
                            Suggestions
                        </TableHead>
                        <TableHead className="w-32 text-center">
                            Status
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((pr) => (
                        <PrListItem key={pr.prId} pr={pr} />
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};
