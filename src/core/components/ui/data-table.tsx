"use client";

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
    type TableOptions,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import { cn } from "src/core/utils/components";

import { Button } from "./button";
import { Checkbox } from "./checkbox";
import { Spinner } from "./spinner";

const SELECTABLE_COLUMN_ID = "#select";

const LoadingRow = ({ columnsQuantity }: { columnsQuantity: number }) => (
    <TableRow className="hover:bg-transparent">
        <TableCell colSpan={columnsQuantity} align="center">
            <Spinner className="size-7" />
        </TableCell>
    </TableRow>
);

export function DataTable<TData>({
    loading,
    EmptyComponent = "No results found.",
    ...tableProps
}: Omit<TableOptions<TData>, "data" | "columns" | "getCoreRowModel"> &
    Required<Pick<TableOptions<TData>, "data" | "columns">> & {
        EmptyComponent?: React.ReactNode;
        loading?: true | "bottom" | false;
        meta?: Record<string, any>;
    }) {
    const table = useReactTable({
        globalFilterFn: "includesString",
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        columnResizeMode: "onChange",
        enableColumnResizing: false,
        ...tableProps,
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
                                    style={{
                                        maxWidth: header.column.getSize(),
                                    }}>
                                    {header.isPlaceholder
                                        ? null
                                        : flexRender(
                                              header.column.columnDef.header,
                                              header.getContext(),
                                          )}

                                    {header.column.getCanResize() && (
                                        <div
                                            onMouseDown={header.getResizeHandler()}
                                            onTouchStart={header.getResizeHandler()}
                                            className={cn(
                                                "bg-card-lv2 absolute inset-y-0 right-0 w-0.5 cursor-col-resize touch-none select-none",
                                                header.column.getIsResizing() &&
                                                    "bg-card-lv3",
                                            )}
                                        />
                                    )}
                                </TableHead>
                            );
                        })}
                    </TableRow>
                ))}
            </TableHeader>

            <TableBody>
                {loading === true ? (
                    <LoadingRow columnsQuantity={tableProps.columns.length} />
                ) : (
                    <>
                        {!table.getRowModel().rows.length ? (
                            <TableRow className="hover:bg-transparent">
                                <TableCell colSpan={tableProps.columns.length}>
                                    {EmptyComponent}
                                </TableCell>
                            </TableRow>
                        ) : (
                            <>
                                {table.getRowModel().rows.map((row) => (
                                    <TableRow
                                        key={row.id}
                                        data-peek={
                                            table.options.meta?.peek === row.id
                                                ? ""
                                                : undefined
                                        }
                                        data-selected={
                                            row.getIsSelected() ? "" : undefined
                                        }>
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell
                                                key={cell.id}
                                                align={
                                                    cell.column.columnDef.meta
                                                        ?.align
                                                }
                                                style={{
                                                    width: cell.column.getSize(),
                                                }}>
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext(),
                                                )}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))}

                                {loading === "bottom" && (
                                    <LoadingRow
                                        columnsQuantity={
                                            tableProps.columns.length
                                        }
                                    />
                                )}
                            </>
                        )}
                    </>
                )}
            </TableBody>
        </Table>
    );
}

export function DataTableColumnHeader<TData, TValue>({
    column,
    title,
    className,
}: React.HTMLAttributes<HTMLDivElement> & {
    title: string;
    column: Column<TData, TValue>;
}) {
    if (!column.getCanSort()) {
        return (
            <div className={cn(className, "text-text-tertiary")}>{title}</div>
        );
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

export const getSelectableColumn = <T,>(): ColumnDef<T> => ({
    id: SELECTABLE_COLUMN_ID,
    enableHiding: false,
    size: 40,
    enableSorting: false,
    enableResizing: false,
    header: ({ table }) => (
        <div
            className="absolute inset-0 flex items-center justify-center"
            onClick={() => table.toggleAllPageRowsSelected()}>
            <Checkbox
                className="size-5"
                onChange={() => table.toggleAllPageRowsSelected()}
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                }
            />
        </div>
    ),
    cell: ({ row }) => (
        <div
            onClick={() => row.toggleSelected()}
            className={cn(
                "absolute inset-0 flex items-center justify-center",
                !row.getCanSelect() && "pointer-events-none",
            )}>
            <Checkbox
                className="size-5"
                checked={row.getIsSelected()}
                disabled={!row.getCanSelect()}
                onChange={() => row.toggleSelected()}
            />
        </div>
    ),
});
