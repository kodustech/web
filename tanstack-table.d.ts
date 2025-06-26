import "@tanstack/react-table";

import type { Operator } from "src/core/utils/filtering";

declare module "@tanstack/table-core" {
    interface ColumnMeta<TData extends RowData, TValue> {
        name?: string;
        align?: "left" | "center" | "right";
        filters?: Partial<Record<Operator, true>>;
    }

    interface TableMeta<TData extends RowData> {
        peek?: string | null;
    }
}
