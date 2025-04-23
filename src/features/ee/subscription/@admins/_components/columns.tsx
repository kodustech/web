"use client";

import { Button } from "@components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@components/ui/dropdown-menu";
import { magicModal } from "@components/ui/magic-modal";
import type { MembersSetup } from "@services/setup/types";
import { ColumnDef } from "@tanstack/react-table";
import { EllipsisVertical } from "lucide-react";

import { DeleteModal } from "./delete-modal";

type Type = MembersSetup;

export const columns: ColumnDef<Type>[] = [
    {
        accessorKey: "name",
        header: "Username",
    },
    {
        accessorKey: "email",
        header: "Email",
    },
    {
        id: "actions",
        size: 20,
        meta: { align: "right" },
        cell: ({ row }) => {
            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="cancel" size="icon-sm">
                            <EllipsisVertical />
                        </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end">
                        <DropdownMenuItem
                            className="text-danger"
                            onClick={async () => {
                                const response = await magicModal.show(() => (
                                    <DeleteModal member={row.original} />
                                ));

                                if (!response) return;
                            }}>
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];
