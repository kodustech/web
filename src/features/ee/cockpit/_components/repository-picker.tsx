"use client";

import { useState } from "react";
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
import { useGetRepositories } from "@services/codeManagement/hooks";
import type { Repository } from "@services/codeManagement/types";
import { Check, GitBranch } from "lucide-react";

import { setCockpitRepositoryCookie } from "../_actions/set-cockpit-repository";

type Props = {
    cookieValue: string | undefined;
    teamId: string;
};

export const RepositoryPicker = ({ cookieValue, teamId }: Props) => {
    const { data: repositories = [], isLoading } = useGetRepositories(teamId, undefined, { isSelected: true });
    
    const [open, setOpen] = useState(false);
    const [selectedRepository, setSelectedRepository] = useState<string>(() => {
        if (!cookieValue) return "";
        try {
            return JSON.parse(cookieValue) as string;
        } catch {
            return "";
        }
    });

    const selectedRepo = repositories.find(r => r.name === selectedRepository);

    const handleSelect = (repositoryName: string) => {
        setSelectedRepository(repositoryName);
        setCockpitRepositoryCookie(repositoryName);
        setOpen(false);
    };

    const handleClearFilter = () => {
        setSelectedRepository("");
        setCockpitRepositoryCookie("");
        setOpen(false);
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    size="md"
                    variant="helper"
                    loading={isLoading}
                    leftIcon={<GitBranch />}
                    className="w-64 justify-start">
                    {selectedRepository ? (
                        <span className="truncate">
                            {selectedRepo?.organizationName}/{selectedRepository}
                        </span>
                    ) : (
                        <span className="text-text-secondary">
                            All repositories
                        </span>
                    )}
                </Button>
            </PopoverTrigger>

            <PopoverContent align="end" className="w-80 p-0">
                <Command
                    filter={(value, search) => {
                        const repository = repositories.find(
                            (r) => r.name === value,
                        );

                        if (!repository) return 0;

                        if (
                            repository.name
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
                                    value={r.name}
                                    onSelect={() => handleSelect(r.name)}>
                                    <span>
                                        <span className="text-text-secondary">
                                            {r.organizationName}/
                                        </span>
                                        {r.name}
                                    </span>
                                    {selectedRepository === r.name && (
                                        <Check className="text-primary-light -mr-2 size-5" />
                                    )}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
};