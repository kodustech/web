"use client";

import { useState } from "react";
import { Button } from "@components/ui/button";
import {
    DataTable,
    DataTableSearchQueryContext,
    DataTableSortingContext,
} from "@components/ui/data-table";
import { Input } from "@components/ui/input";
import { Link } from "@components/ui/link";
import type { getIntegrationConfig } from "@services/integrations/integrationConfig/fetch";
import type { SortingState } from "@tanstack/react-table";
import { PlusIcon, SearchIcon } from "lucide-react";

import { columns } from "./table-columns";

export const GitRepositoriesTable = ({
    platformName,
    repositories,
}: {
    repositories: Awaited<ReturnType<typeof getIntegrationConfig>>;
    platformName: string;
}) => {
    const [query, setQuery] = useState("");
    const [sortingState, setSortingState] = useState<SortingState>([]);

    return (
        <div>
            <DataTableSearchQueryContext value={{ query, setQuery }}>
                <div className="mb-3 flex items-center justify-end">
                    <div className="flex items-center gap-2">
                        <Input
                            size="md"
                            value={query}
                            className="w-52"
                            leftIcon={<SearchIcon />}
                            placeholder="Find by name"
                            onChange={(e) => setQuery(e.target.value)}
                        />

                        <Link href="/settings/git/repositories">
                            <Button
                                size="md"
                                decorative
                                variant="primary-dark"
                                leftIcon={<PlusIcon />}>
                                Add repository
                            </Button>
                        </Link>
                    </div>
                </div>

                <DataTableSortingContext
                    value={{ sortingState, setSortingState }}>
                    <DataTable columns={columns} data={repositories} />
                </DataTableSortingContext>
            </DataTableSearchQueryContext>
        </div>
    );
};
