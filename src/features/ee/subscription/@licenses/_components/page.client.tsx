"use client";

import { use } from "react";
import { DataTable } from "@components/ui/data-table";

import { TableFilterContext } from "../../_providers/table-filter-context";
import { columns, type LicenseTableRow } from "./columns";

export const LicensesPageClient = ({ data }: { data: LicenseTableRow[] }) => {
    const { query, setQuery } = use(TableFilterContext);

    return (
        <DataTable
            data={data}
            columns={columns}
            state={{ globalFilter: query }}
            onGlobalFilterChange={setQuery}
        />
    );
};
