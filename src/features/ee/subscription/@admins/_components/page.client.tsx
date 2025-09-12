"use client";

import { use } from "react";
import { DataTable } from "@components/ui/data-table";
import { UserRole } from "@enums";
import type { MembersSetup } from "@services/setup/types";

import { TableFilterContext } from "../../_providers/table-filter-context";
import { columns } from "./columns";

export const AdminsPageClient = ({ data }: { data: MembersSetup[] }) => {
    const { query, setQuery } = use(TableFilterContext);

    const mockData = data.concat(
        Array.from({ length: 20 }, (_, i) => ({
            id: `user-${i + 1}`,
            name: `User ${i + 1}`,
            email: `user${i + 1}`,
            role:
                i % 3 === 0
                    ? UserRole.BILLING_MANAGER
                    : i % 3 === 1
                      ? UserRole.REPO_ADMIN
                      : UserRole.CONTRIBUTOR,
            active: true,
            error: false,
        })) as MembersSetup[],
    );

    return (
        <DataTable
            data={mockData}
            columns={columns}
            state={{ globalFilter: query }}
            onGlobalFilterChange={setQuery}
            EmptyComponent="No organization admins found."
        />
    );
};
