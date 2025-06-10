"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@components/ui/button";
import { DataTableColumnHeader } from "@components/ui/data-table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@components/ui/dropdown-menu";
import { magicModal } from "@components/ui/magic-modal";
import { toast } from "@components/ui/toaster/use-toast";
import { useReactQueryInvalidateQueries } from "@hooks/use-invalidate-queries";
import { createOrUpdateRepositories } from "@services/codeManagement/fetch";
import type { Repository } from "@services/codeManagement/types";
import { INTEGRATION_CONFIG } from "@services/integrations/integrationConfig";
import { PARAMETERS_PATHS } from "@services/parameters";
import { updateCodeReviewParameterRepositories } from "@services/parameters/fetch";
import { ParametersConfigKey } from "@services/parameters/types";
import { ColumnDef } from "@tanstack/react-table";
import { Ellipsis } from "lucide-react";
import { useSelectedTeamId } from "src/core/providers/selected-team-context";
import { IntegrationCategory } from "src/core/types";
import { revalidateServerSidePath } from "src/core/utils/revalidate-server-side";

import { DeleteModal } from "./_modals/remove-repository-modal";

export const columns: ColumnDef<Repository>[] = [
    {
        id: "name",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Name" />
        ),
        accessorFn: ({ organizationName, name }) =>
            `${organizationName}/${name}`,

        cell: ({ renderValue }) => (
            <span className="font-medium">{renderValue<string>()}</span>
        ),
    },
    {
        id: "actions",
        meta: { align: "right" },

        cell: ({ row, table }) => {
            const [isOpen, setIsOpen] = useState(false);
            const router = useRouter();
            const { teamId } = useSelectedTeamId();
            const { generateQueryKey, invalidateQueries } =
                useReactQueryInvalidateQueries();

            const saveSelectedRepositoriesAction = async () => {
                const repositoriesWithoutThisOne = table
                    .getRowModel()
                    .rows.map((r) => r.original)
                    .filter((r) => r.id !== row.original.id);

                await createOrUpdateRepositories(
                    repositoriesWithoutThisOne,
                    teamId,
                );

                await updateCodeReviewParameterRepositories(teamId);

                toast({
                    variant: "success",
                    title: "Integration removed",
                    description: (
                        <>
                            Integration with{" "}
                            <span className="text-danger">
                                {row.original.organizationName}/
                                {row.original.name}
                            </span>{" "}
                            was removed.
                        </>
                    ),
                });

                await Promise.all([
                    invalidateQueries({
                        type: "all",
                        queryKey: generateQueryKey(
                            PARAMETERS_PATHS.GET_BY_KEY,
                            {
                                params: {
                                    key: ParametersConfigKey.CODE_REVIEW_CONFIG,
                                    teamId,
                                },
                            },
                        ),
                    }),

                    invalidateQueries({
                        type: "all",
                        queryKey: generateQueryKey(
                            INTEGRATION_CONFIG.GET_INTEGRATION_CONFIG_BY_CATEGORY,
                            {
                                params: {
                                    teamId,
                                    integrationCategory:
                                        IntegrationCategory.CODE_MANAGEMENT,
                                },
                            },
                        ),
                    }),
                    revalidateServerSidePath("/settings/git"),
                ]);

                router.refresh();
            };

            return (
                <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
                    <DropdownMenuTrigger asChild>
                        <Button variant="helper" size="icon-xs">
                            <Ellipsis />
                        </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end" className="w-52">
                        <DropdownMenuItem
                            disabled={table.getRowModel().rows.length === 1}
                            className="text-danger"
                            onClick={async () => {
                                setIsOpen(false);

                                magicModal.show(() => (
                                    <DeleteModal
                                        repository={row.original}
                                        saveFn={saveSelectedRepositoriesAction}
                                    />
                                ));
                            }}>
                            Remove integration
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];
