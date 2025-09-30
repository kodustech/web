"use client";

import { useEffect, useMemo, useState } from "react";
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
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@components/ui/dialog";
import { magicModal, MagicModalContext } from "@components/ui/magic-modal";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@components/ui/popover";
import { useAsyncAction } from "@hooks/use-async-action";
import { useEffectOnce } from "@hooks/use-effect-once";
import { useGetRepositories } from "@services/codeManagement/hooks";
import { Repository } from "@services/codeManagement/types";
import { assignRepos, getAssignedRepos } from "@services/permissions/fetch";
import { Check } from "lucide-react";
import { useSelectedTeamId } from "src/core/providers/selected-team-context";

export default function AssignReposModal({ userId }: { userId: string }) {
    const { teamId } = useSelectedTeamId();

    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const [selectedRepositories, setSelectedRepositories] = useState<
        Repository[]
    >([]);
    const [isLoadingInitial, setIsLoadingInitial] = useState(true);

    const { data: allRepositories = [], isLoading: isLoadingAllRepos } =
        useGetRepositories(teamId, undefined, { isSelected: true });

    useEffect(() => {
        if (!allRepositories || allRepositories.length === 0) {
            return;
        }

        let isMounted = true;

        const fetchInitialRepos = async () => {
            setIsLoadingInitial(true);

            try {
                const assignedRepoIds = await getAssignedRepos(userId);
                const assignedIdsSet = new Set(assignedRepoIds);

                const initiallySelected = allRepositories.filter((repo) =>
                    assignedIdsSet.has(repo.id),
                );

                if (isMounted) {
                    setSelectedRepositories(initiallySelected);
                }
            } catch (error) {
                console.error("Error fetching assigned repositories:", error);
            } finally {
                if (isMounted) {
                    setIsLoadingInitial(false);
                }
            }
        };

        fetchInitialRepos();

        return () => {
            isMounted = false; // Cleanup to prevent state updates on unmounted components
        };
    }, [userId, allRepositories]);

    const selectedRepoIds = useMemo(
        () => new Set(selectedRepositories.map((repo) => repo.id)),
        [selectedRepositories],
    );

    const handleToggleRepository = (repository: Repository) => {
        setSelectedRepositories((currentSelection) => {
            const isSelected = selectedRepoIds.has(repository.id);
            if (isSelected) {
                return currentSelection.filter(
                    (repo) => repo.id !== repository.id,
                );
            } else {
                return [...currentSelection, repository].sort((a, b) =>
                    a.name.localeCompare(b.name),
                );
            }
        });
    };

    const [saveSelectionAction, { loading: isSaving }] = useAsyncAction(
        async () => {
            // The selectedRepoIds Set can be used directly here
            const selectedIds = Array.from(selectedRepoIds);
            await assignRepos(selectedIds, userId, teamId);
            magicModal.hide();
        },
    );

    const isInitializing = isLoadingAllRepos || isLoadingInitial;
    const repoCountText =
        selectedRepositories.length === 1 ? "repository" : "repositories";

    return (
        <MagicModalContext value={{ closeable: !isSaving }}>
            <Dialog open onOpenChange={magicModal.hide}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Assign repositories</DialogTitle>
                        <DialogDescription>
                            Select the repositories you want to assign to this
                            user.
                        </DialogDescription>
                    </DialogHeader>

                    <Popover
                        open={isPopoverOpen}
                        onOpenChange={setIsPopoverOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                size="md"
                                variant="helper"
                                loading={isInitializing}
                                disabled={isInitializing}
                                className="w-full justify-start text-left">
                                {selectedRepositories.length > 0 ? (
                                    <span className="truncate font-semibold">
                                        {`${selectedRepositories.length} ${repoCountText} selected`}
                                    </span>
                                ) : (
                                    <span className="text-text-secondary font-semibold">
                                        Select repositories...
                                    </span>
                                )}
                            </Button>
                        </PopoverTrigger>

                        <PopoverContent align="start" className="w-80 p-0">
                            <Command>
                                <CommandInput placeholder="Search repository..." />
                                <CommandList className="max-h-56">
                                    <CommandEmpty>
                                        No repository found.
                                    </CommandEmpty>
                                    <CommandGroup>
                                        {allRepositories.map((repository) => (
                                            <CommandItem
                                                key={repository.id}
                                                value={`${repository.organizationName}/${repository.name}`}
                                                onSelect={() =>
                                                    handleToggleRepository(
                                                        repository,
                                                    )
                                                }>
                                                <div className="flex w-full items-center justify-between">
                                                    <span className="truncate">
                                                        <span className="text-text-secondary">
                                                            {
                                                                repository.organizationName
                                                            }
                                                            /
                                                        </span>
                                                        {repository.name}
                                                    </span>
                                                    {selectedRepoIds.has(
                                                        repository.id,
                                                    ) && (
                                                        <Check className="text-primary-light -mr-2 size-5" />
                                                    )}
                                                </div>
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button
                                size="md"
                                variant="cancel"
                                disabled={isSaving}>
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button
                            size="md"
                            variant="primary"
                            loading={isSaving}
                            onClick={saveSelectionAction}
                            disabled={
                                isInitializing ||
                                selectedRepositories.length === 0
                            }>
                            Save changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </MagicModalContext>
    );
}
