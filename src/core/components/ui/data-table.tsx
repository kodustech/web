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
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    useReactTable,
} from "@tanstack/react-table";

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

export function DataTable<TData, TValue>({
    columns,
    data,
    meta,
    EmptyComponent = (
        <div className="flex h-24 items-center justify-center text-center">
            No results.
        </div>
    ),
}: DataTableProps<TData, TValue>) {
    const { query, setQuery } = useContext(DataTableSearchQueryContext);

    const table = useReactTable({
        data,
        columns,
        meta,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        globalFilterFn: "includesString", // built-in filter function
        state: { globalFilter: query },
        onGlobalFilterChange: setQuery,
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
                {table.getRowModel().rows?.length ? (
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
                    <TableRow className="data-[state=selected]:bg-transparent hover:bg-transparent">
                        <TableCell colSpan={columns.length}>
                            {EmptyComponent}
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    );
}
