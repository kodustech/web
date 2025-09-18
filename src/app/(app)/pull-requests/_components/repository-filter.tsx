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
import { usePermission } from "@services/permissions/hooks";
import { Action, ResourceType } from "@services/permissions/types";
import { Check, GitBranch } from "lucide-react";
import { useAuth } from "src/core/providers/auth.provider";
import { usePermissions } from "src/core/providers/permissions.provider";
import { hasPermission } from "src/core/utils/permissions";

type Props = {
    teamId: string;
    selectedRepository?: string;
    onRepositoryChange: (repository?: string) => void;
};

export const RepositoryFilter = ({
    teamId,
    selectedRepository,
    onRepositoryChange,
}: Props) => {
    const { organizationId } = useAuth();
    const permissions = usePermissions();
    const { data: allRepositories = [], isLoading } = useGetRepositories(
        teamId,
        undefined,
    );

    // Filter only selected repositories in the frontend as a temporary fix
    // TODO: Backend should handle isSelected filter properly
    const repositories = allRepositories.filter(
        (repo: any) =>
            repo.selected &&
            hasPermission({
                permissions,
                organizationId: organizationId!,
                action: Action.Read,
                resource: ResourceType.PullRequests,
                repoId: repo.id,
            }),
    );

    const [open, setOpen] = useState(false);

    const handleSelect = (repositoryName: string) => {
        onRepositoryChange(repositoryName);
        setOpen(false);
    };

    const handleClearFilter = () => {
        onRepositoryChange(undefined);
        setOpen(false);
    };

    const selectedRepo = repositories.find(
        (r) => r.name === selectedRepository,
    );

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    size="md"
                    variant="helper"
                    loading={isLoading}
                    data-disabled={undefined}
                    leftIcon={<GitBranch />}
                    className="w-64 justify-start">
                    {selectedRepo ? (
                        <span className="truncate font-semibold">
                            <span className="text-text-secondary">
                                {selectedRepo.organizationName}/
                            </span>
                            {selectedRepo.name}
                        </span>
                    ) : (
                        <span className="text-text-secondary font-semibold">
                            All repositories
                        </span>
                    )}
                </Button>
            </PopoverTrigger>

            <PopoverContent align="start" className="w-80 p-0">
                <Command
                    filter={(value, search) => {
                        if (value === "all") return 1;

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
