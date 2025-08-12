"use client";

import { useParams } from "next/navigation";
import { Button } from "@components/ui/button";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleIndicator,
    CollapsibleTrigger,
} from "@components/ui/collapsible";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@components/ui/dropdown-menu";
import { Link } from "@components/ui/link";
import { magicModal } from "@components/ui/magic-modal";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@components/ui/popover";
import { Separator } from "@components/ui/separator";
import { useSuspenseGetCodeReviewParameter } from "@services/parameters/hooks";
import {
    ArrowRightIcon,
    ChevronDownIcon,
    EllipsisIcon,
    TrashIcon,
} from "lucide-react";
import { useSelectedTeamId } from "src/core/providers/selected-team-context";
import type { LiteralUnion } from "src/core/types";
import { cn } from "src/core/utils/components";

import { DeleteRepoConfigModal } from "./per-repository/delete-config-modal";

const RepositoryButton = (props: {
    id: string;
    name: string;
    isSelected: boolean;
    directories?: any[];
}) => {
    const {
        params: [repositoryId, page],
    } = useParams<{ params: [LiteralUnion<"global">, string] }>();

    return (
        <Link
            className="w-full flex-1"
            disabled={!props.isSelected}
            href={`/settings/code-review/${props.id}/${page}`}>
            <Button
                size="sm"
                decorative
                variant="helper"
                active={repositoryId === props.id}
                className={cn(
                    "w-full flex-1 justify-start gap-2.5 px-3 text-xs",
                    !props.isSelected && "pointer-events-none",
                    props.directories && "pl-2",
                )}
                rightIcon={
                    <div className="flex flex-1 justify-end">
                        <ArrowRightIcon className="text-primary-light group-disabled/link:text-text-tertiary size-3.5!" />
                    </div>
                }>
                {props.name}
            </Button>
        </Link>
    );
};

const RepositoryDirectoryButton = (props: { id: string; name: string }) => {
    return (
        <Button
            size="sm"
            variant="helper"
            className="text-text-primary w-full flex-1 justify-start gap-2.5 rounded-xl text-xs"
            rightIcon={
                <div className="flex flex-1 justify-end">
                    <ArrowRightIcon className="text-primary-light size-3.5!" />
                </div>
            }>
            {props.name}
        </Button>
    );
};

export const SelectCodeReviewRepository = () => {
    const { teamId } = useSelectedTeamId();

    const {
        params: [repositoryId, page],
    } = useParams<{ params: [LiteralUnion<"global">, string] }>();

    const { configValue } = useSuspenseGetCodeReviewParameter(teamId);

    const repositories = configValue?.repositories.filter(
        (r) => r.directories || r.isSelected,
    );
    const selectedRepository =
        repositoryId === "global"
            ? { name: "Global" }
            : repositories?.find((r) => r.id === repositoryId);

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    size="xs"
                    variant="helper"
                    rightIcon={<ChevronDownIcon className="size-3.5!" />}>
                    {selectedRepository?.name}
                </Button>
            </PopoverTrigger>

            <PopoverContent
                align="start"
                className="flex w-auto min-w-72 flex-col gap-1 px-2 py-3 transition-all">
                <RepositoryButton id="global" name="Global" isSelected />

                <Separator className="my-1" />

                {repositories?.map((r) => (
                    <Collapsible key={r.id} disabled={!r.directories}>
                        <div className="flex items-center gap-1">
                            {r.directories && (
                                <CollapsibleTrigger asChild>
                                    <Button
                                        active
                                        size="icon-xs"
                                        variant="helper"
                                        className="size-6 flex-none justify-center rounded-lg p-0">
                                        <CollapsibleIndicator />
                                    </Button>
                                </CollapsibleTrigger>
                            )}

                            <RepositoryButton {...r} />

                            {r.isSelected && (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button size="icon-sm" variant="cancel">
                                            <EllipsisIcon className="size-5!" />
                                        </Button>
                                    </DropdownMenuTrigger>

                                    <DropdownMenuContent
                                        align="end"
                                        sideOffset={-6}>
                                        <DropdownMenuItem
                                            className="text-danger text-[13px] leading-none"
                                            onClick={() => {
                                                magicModal.show(() => (
                                                    <DeleteRepoConfigModal
                                                        repository={{
                                                            id: r.id,
                                                            name: r.name,
                                                        }}
                                                        teamId={teamId}
                                                    />
                                                ));
                                            }}>
                                            <TrashIcon className="-ml-1 size-4!" />
                                            Delete configuration
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            )}
                        </div>

                        {r.directories && (
                            <CollapsibleContent className="mt-3 mb-3 ml-3 flex flex-col gap-1 border-l pb-0 pl-2">
                                <span className="text-text-tertiary ml-4 text-xs font-bold">
                                    Directories
                                </span>

                                {r.directories?.map((d) => (
                                    <div
                                        key={d.id}
                                        className="flex items-center gap-2">
                                        <RepositoryDirectoryButton
                                            id={d.id}
                                            name={d.path}
                                        />

                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    size="icon-sm"
                                                    variant="cancel">
                                                    <EllipsisIcon className="size-5!" />
                                                </Button>
                                            </DropdownMenuTrigger>

                                            <DropdownMenuContent
                                                align="end"
                                                sideOffset={-6}>
                                                <DropdownMenuItem
                                                    className="text-danger text-[13px] leading-none"
                                                    onClick={() => {
                                                        magicModal.show(() => (
                                                            <DeleteRepoConfigModal
                                                                teamId={teamId}
                                                                repository={{
                                                                    id: r.id,
                                                                    name: r.name,
                                                                }}
                                                            />
                                                        ));
                                                    }}>
                                                    <TrashIcon className="-ml-1 size-4!" />
                                                    Delete configuration
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                ))}
                            </CollapsibleContent>
                        )}
                    </Collapsible>
                ))}
            </PopoverContent>
        </Popover>
    );
};
