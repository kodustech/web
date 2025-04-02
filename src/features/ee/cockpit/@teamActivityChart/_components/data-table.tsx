"use client";

import { ScrollArea, ScrollBar } from "@components/ui/scroll-area";
import {
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@components/ui/table";
import {
    flexRender,
    getCoreRowModel,
    useReactTable,
    type Column,
} from "@tanstack/react-table";
import { cn } from "src/core/utils/components";

import { getColumns } from "./columns";

//These are the important styles to make sticky column pinning work!
//Apply styles like this using your CSS strategy of choice with this kind of logic to head cells, data cells, footer cells, etc.
//View the index.css file for more needed styles such as border-collapse: separate
const getCommonPinningStyles = (
    column: Column<any>,
): React.ComponentProps<"th"> => {
    const isPinned = column.getIsPinned();
    const isLastLeftPinnedColumn =
        isPinned === "left" && column.getIsLastColumn("left");

    return {
        className: cn(isLastLeftPinnedColumn && "bg-card border-r"),
        style: {
            left:
                isPinned === "left"
                    ? `${column.getStart("left")}px`
                    : undefined,
            position: isPinned ? "sticky" : "relative",
            width: column.getSize(),
            zIndex: isPinned ? 1 : 0,
        },
    };
};

export const DataTable = ({
    data,
    startDate,
    endDate,
}: {
    data: [string, { date: string; commitCount: number; prCount: number }[]][];
    startDate: string;
    endDate: string;
}) => {
    const columns = getColumns({ startDate, endDate });

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        state: {
            columnPinning: {
                left: ["developer"],
            },
        },
    });

    return (
        <ScrollArea type="always" className="relative h-[600px]">
            <table
                className="border-separate border-spacing-0 text-sm"
                style={{ width: table.getTotalSize() }}>
                <TableHeader className="sticky top-0 z-10 bg-card">
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map((header) => {
                                return (
                                    <TableHead
                                        key={header.id}
                                        align={
                                            header.column.columnDef.meta?.align
                                        }
                                        {...getCommonPinningStyles(
                                            header.column,
                                        )}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                  header.column.columnDef
                                                      .header,
                                                  header.getContext(),
                                              )}
                                    </TableHead>
                                );
                            })}
                        </TableRow>
                    ))}
                </TableHeader>

                <TableBody>
                    {table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map((row) => (
                            <TableRow
                                key={row.id}
                                data-state={row.getIsSelected() && "selected"}>
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell
                                        key={cell.id}
                                        align={
                                            cell.column.columnDef.meta?.align
                                        }
                                        {...getCommonPinningStyles(
                                            cell.column,
                                        )}>
                                        {flexRender(
                                            cell.column.columnDef.cell,
                                            cell.getContext(),
                                        )}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell
                                colSpan={columns.length}
                                className="h-24 text-center">
                                No results.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </table>

            <ScrollBar orientation="horizontal" />
        </ScrollArea>
    );
};
