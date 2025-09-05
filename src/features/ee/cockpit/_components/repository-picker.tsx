"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@components/ui/popover";
import { Spinner } from "@components/ui/spinner";
import { useGetRepositories } from "@services/codeManagement/hooks";
import { Check, GitBranch } from "lucide-react";

import { setCockpitRepositoryCookie } from "../_actions/set-cockpit-repository";

type Props = {
    cookieValue: string | undefined;
    teamId: string;
};

export const RepositoryPicker = ({ cookieValue, teamId }: Props) => {
    const { data: allRepositories = [], isLoading } = useGetRepositories(
        teamId,
        undefined,
    );

    // Filter only selected repositories in the frontend as a temporary fix
    // TODO: Backend should handle isSelected filter properly
    const repositories = allRepositories.filter((repo: any) => repo.selected);

    const router = useRouter();
    const [loading, startTransition] = useTransition();

    const [open, setOpen] = useState(false);
    const [selectedRepository, setSelectedRepository] = useState<string>(() => {
        if (!cookieValue) return "";
        try {
            return JSON.parse(cookieValue) as string;
        } catch {
            return "";
        }
    });

    const handleSelect = (repositoryFullName: string) => {
        setSelectedRepository(repositoryFullName);
        setOpen(false);

        startTransition(() => {
            setCockpitRepositoryCookie(repositoryFullName);
        });
    };

    const handleClearFilter = () => {
        setSelectedRepository("");
        setOpen(false);

        startTransition(() => {
            setCockpitRepositoryCookie("");
        });
    };

    return (
        <>
            {loading && (
                <div className="fixed inset-0 z-5 flex flex-col items-center justify-center gap-4 bg-black/70 backdrop-blur-sm">
                    <Spinner className="size-16" />

                    <span className="text-sm font-semibold">
                        Loading cockpit for
                        <span className="text-primary-light ml-1 font-semibold">
                            {selectedRepository || "all repositories"}
                        </span>
                    </span>
                </div>
            )}

            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        size="md"
                        variant="helper"
                        loading={isLoading}
                        data-disabled={undefined}
                        leftIcon={<GitBranch />}
                        className="w-68 justify-start">
                        {selectedRepository ? (
                            <span className="truncate font-semibold">
                                {selectedRepository}
                            </span>
                        ) : (
                            <span className="text-text-secondary font-semibold">
                                All repositories
                            </span>
                        )}
                    </Button>
                </PopoverTrigger>

                <PopoverContent align="end" className="w-80 p-0">
                    <Command
                        filter={(value, search) => {
                            const repository = repositories.find(
                                (r) => r.full_name === value,
                            );

                            if (!repository) return 0;

                            if (
                                repository.full_name
                                    .toLowerCase()
                                    .includes(search.toLowerCase()) ||
                                repository.organizationName
                                    .toLowerCase()
                                    .includes(search.toLowerCase())
                            ) {
                                return 1;
                            }

                            return 0;
                        }}>
                        <CommandInput placeholder="Search repository..." />

                        <CommandList className="max-h-56 overflow-y-auto">
                            <CommandEmpty>No repository found.</CommandEmpty>

                            <CommandGroup>
                                {!selectedRepository && (
                                    <CommandItem
                                        value="all"
                                        onSelect={() => setOpen(false)}
                                        className="font-semibold">
                                        <span>All repositories</span>
                                        <Check className="text-primary-light -mr-2 size-5" />
                                    </CommandItem>
                                )}
                                {selectedRepository && (
                                    <CommandItem
                                        value="all"
                                        onSelect={handleClearFilter}>
                                        <span>All repositories</span>
                                    </CommandItem>
                                )}

                                {repositories.map((r) => (
                                    <CommandItem
                                        key={r.id}
                                        value={r.full_name}
                                        onSelect={() =>
                                            handleSelect(r.full_name)
                                        }>
                                        <span>{r.full_name}</span>
                                        {selectedRepository === r.full_name && (
                                            <Check className="text-primary-light -mr-2 size-5" />
                                        )}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        </>
    );
};
