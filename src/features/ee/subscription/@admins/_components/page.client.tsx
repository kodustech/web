"use client";

import { use } from "react";
import { DataTable } from "@components/ui/data-table";
import type { MembersSetup } from "@services/setup/types";

import { TableFilterContext } from "../../_providers/table-filter-context";
import { columns } from "./columns";

export const AdminsPageClient = ({ data }: { data: MembersSetup[] }) => {
    const { query, setQuery } = use(TableFilterContext);

    return (
        <DataTable
            data={data}
            columns={columns}
            state={{ globalFilter: query }}
            onGlobalFilterChange={setQuery}
            EmptyComponent="No organization admins found."
        />
    );
};
