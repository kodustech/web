"use client";

import { createContext, useContext } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@components/ui/table";
import {
    Column,
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    useReactTable,
    type OnChangeFn,
    type SortingState,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import { cn } from "src/core/utils/components";

import { Button } from "./button";

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    EmptyComponent?: React.ReactNode;
    meta?: Record<string, any>;
}

export const DataTableSearchQueryContext = createContext<{
    query: string;
    setQuery: (query: string) => void;
}>({
    query: "",
    setQuery: () => {},
});

export const DataTableSortingContext = createContext<{
    sortingState: SortingState;
    setSortingState: OnChangeFn<SortingState>;
}>({
    sortingState: [],
    setSortingState: () => [],
});

interface DataTableColumnHeaderProps<TData, TValue>
    extends React.HTMLAttributes<HTMLDivElement> {
    column: Column<TData, TValue>;
    title: string;
}

export function DataTableColumnHeader<TData, TValue>({
    column,
    title,
    className,
}: DataTableColumnHeaderProps<TData, TValue>) {
    if (!column.getCanSort()) {
        return <div className={cn(className)}>{title}</div>;
    }

    return (
        <div className={cn("flex items-center gap-2", className)}>
            <Button
                size="sm"
                variant="cancel"
                className="px-0"
                onClick={() => column.toggleSorting()}
                rightIcon={
                    column.getIsSorted() === "desc" ? (
                        <ArrowDown />
                    ) : column.getIsSorted() === "asc" ? (
                        <ArrowUp />
                    ) : (
                        <ChevronsUpDown />
                    )
                }>
                {title}
            </Button>
        </div>
    );
}

export function DataTable<TData, TValue>({
    columns,
    data,
    meta,
    EmptyComponent = "No results found.",
}: DataTableProps<TData, TValue>) {
    const { query, setQuery } = useContext(DataTableSearchQueryContext);
    const { sortingState, setSortingState } = useContext(
        DataTableSortingContext,
    );

    const table = useReactTable({
        data,
        columns,
        meta,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        globalFilterFn: "includesString", // built-in filter function
        state: {
            globalFilter: query,
            sorting: sortingState,
        },
        onGlobalFilterChange: setQuery,
        onSortingChange: setSortingState,
    });

    return (
        <Table>
            <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => {
                            return (
                                <TableHead
                                    key={header.id}
                                    align={header.column.columnDef.meta?.align}
                                    style={{ width: header.column.getSize() }}>
                                    {header.isPlaceholder
                                        ? null
                                        : flexRender(
                                              header.column.columnDef.header,
                                              header.getContext(),
                                          )}
                                </TableHead>
                            );
                        })}
                    </TableRow>
                ))}
            </TableHeader>

            <TableBody>
                {table.getRowModel().rows.length ? (
                    table.getRowModel().rows.map((row) => (
                        <TableRow
                            key={row.id}
                            data-state={row.getIsSelected() && "selected"}>
                            {row.getVisibleCells().map((cell) => (
                                <TableCell
                                    key={cell.id}
                                    align={cell.column.columnDef.meta?.align}
                                    style={{ width: cell.column.getSize() }}>
                                    {flexRender(
                                        cell.column.columnDef.cell,
                                        cell.getContext(),
                                    )}
                                </TableCell>
                            ))}
                        </TableRow>
                    ))
                ) : (
                    <TableRow className="hover:bg-transparent data-[state=selected]:bg-transparent">
                        <TableCell colSpan={columns.length}>
                            {EmptyComponent}
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    );
}
