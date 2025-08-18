"use client";

import { Button } from "@components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@components/ui/dropdown-menu";
import { magicModal } from "@components/ui/magic-modal";
import { EllipsisIcon, TrashIcon } from "lucide-react";

import type { CodeReviewRepositoryConfig } from "../../code-review/_types";
import { DeleteRepoConfigModal } from "./delete-config-modal";

export const SidebarRepositoryOrDirectoryDropdown = (props: {
    repository: Pick<CodeReviewRepositoryConfig, "id" | "name" | "isSelected">;
    directory?: Pick<
        NonNullable<CodeReviewRepositoryConfig["directories"]>[number],
        "id" | "name" | "path"
    >;
}) => {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button size="icon-sm" variant="cancel">
                    <EllipsisIcon className="size-5!" />
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" sideOffset={-6}>
                <DropdownMenuItem
                    className="text-danger text-[13px] leading-none"
                    leftIcon={<TrashIcon className="size-4!" />}
                    onClick={() => {
                        magicModal.show(() => (
                            <DeleteRepoConfigModal
                                repository={props.repository}
                                directory={props.directory}
                            />
                        ));
                    }}>
                    Delete configuration
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
