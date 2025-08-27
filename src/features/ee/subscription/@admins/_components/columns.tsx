"use client";

import { Button } from "@components/ui/button";
import { DataTableColumnHeader } from "@components/ui/data-table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@components/ui/dropdown-menu";
import { magicModal } from "@components/ui/magic-modal";
import { toast } from "@components/ui/toaster/use-toast";
import { UserStatus, type MembersSetup } from "@services/setup/types";
import { approveUser } from "@services/users/fetch";
import { ColumnDef } from "@tanstack/react-table";
import { CheckIcon, CopyIcon, EllipsisVertical, TrashIcon } from "lucide-react";
import { ClipboardHelpers } from "src/core/utils/clipboard";
import { revalidateServerSidePath } from "src/core/utils/revalidate-server-side";

import { DeleteModal } from "./delete-modal";

export const columns: ColumnDef<MembersSetup>[] = [
    {
        id: "name",
        size: 150,
        minSize: 150,
        accessorFn: (r) => r.name,
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Username" />
        ),
    },
    {
        id: "email",
        accessorFn: (r) => r.email,
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Email" />
        ),
    },
    {
        size: 70,
        minSize: 70,
        id: "actions",
        header: "Actions",
        meta: { align: "right" },
        cell: ({ row }) => {
            const approveUserAction = async () => {
                try {
                    await approveUser(row.original.userId);

                    toast({
                        variant: "success",
                        title: "User approved",
                        description: (
                            <span>
                                <span className="text-primary-light">
                                    {row.original.email}
                                </span>{" "}
                                <span>was approved</span>
                            </span>
                        ),
                    });

                    revalidateServerSidePath("/settings/subscription");
                } catch {
                    toast({
                        variant: "danger",
                        title: "User was not approved",
                        description:
                            "Something wrong happened. Please, try again.",
                    });
                }
            };

            return (
                <div className="flex w-fit items-center gap-3">
                    {row.original.userStatus ===
                        UserStatus.AWAITING_APPROVAL && (
                        <Button
                            size="xs"
                            variant="helper"
                            className="pointer-events-none">
                            Needs approval
                        </Button>
                    )}

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="cancel" size="icon-sm">
                                <EllipsisVertical />
                            </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end">
                            {row.original.userStatus ===
                                UserStatus.AWAITING_APPROVAL && (
                                <>
                                    <DropdownMenuItem
                                        leftIcon={<CheckIcon />}
                                        className="text-success"
                                        onClick={() => approveUserAction()}>
                                        Approve
                                    </DropdownMenuItem>

                                    <DropdownMenuSeparator />
                                </>
                            )}

                            <DropdownMenuItem
                                leftIcon={<CopyIcon />}
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
                                leftIcon={<TrashIcon />}
                                onClick={() =>
                                    magicModal.show(() => (
                                        <DeleteModal member={row.original} />
                                    ))
                                }>
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            );
        },
    },
];
