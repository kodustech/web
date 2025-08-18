"use client";

import { Button } from "@components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@components/ui/dropdown-menu";
import { magicModal } from "@components/ui/magic-modal";
import { toast } from "@components/ui/toaster/use-toast";
import type { MembersSetup } from "@services/setup/types";
import { ColumnDef } from "@tanstack/react-table";
import { EllipsisVertical } from "lucide-react";
import { ClipboardHelpers } from "src/core/utils/clipboard";

import { DeleteModal } from "./delete-modal";

export const columns: ColumnDef<MembersSetup>[] = [
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
                            onClick={async () => {
                                await ClipboardHelpers.copyTextToClipboard(
                                    `${window.location.origin}/invite/${row.original.userId}`,
                                );

                                toast({
                                    variant: "info",
                                    title: "Copied to clipboard the invite link",
                                    description: (
                                        <span className="text-text-secondary">
                                            for user with email{" "}
                                            <span className="text-text-primary">
                                                {row.original.email}
                                            </span>
                                        </span>
                                    ),
                                });
                            }}>
                            Copy invite link
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

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
