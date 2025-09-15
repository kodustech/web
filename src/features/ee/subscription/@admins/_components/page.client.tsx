"use client";

import { createContext, use, useMemo } from "react";
import { DataTable } from "@components/ui/data-table";
import { UserRole } from "@enums";
import { Repository } from "@services/codeManagement/types";
import { rolePriority } from "@services/permissions/types";
import type { MembersSetup } from "@services/setup/types";
import { useAuth } from "src/core/providers/auth.provider";

import { TableFilterContext } from "../../_providers/table-filter-context";
import { columns } from "./columns";

export const AdminsPageClient = ({ data }: { data: MembersSetup[] }) => {
    const { userId } = useAuth();
    const { query, setQuery } = use(TableFilterContext);

    const defaultSortedData = useMemo(
        () =>
            [...data].sort((a, b) => {
                if (a.userId === userId) return -1; // Current user goes to the top
                if (b.userId === userId) return 1;

                // Sort by role first
                const roleComparison =
                    rolePriority[a.role] - rolePriority[b.role];
                if (roleComparison !== 0) return roleComparison;

                // Then sort by email
                return a.email.localeCompare(b.email);
            }),
        [data, userId],
    );

    return (
        <DataTable
            data={defaultSortedData}
            columns={columns}
            state={{ globalFilter: query }}
            onGlobalFilterChange={setQuery}
            EmptyComponent="No organization admins found."
        />
    );
};
