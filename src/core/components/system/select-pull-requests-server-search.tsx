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
import { Spinner } from "@components/ui/spinner";
import { useDebouncedPRSearch } from "@services/codeManagement/hooks/use-debounced-pr-search";
import { ChevronsUpDown } from "lucide-react";

type PullRequest = {
    id: string;
    pull_number: number;
    repository: string;
    title: string;
    url: string;
};

export const SelectPullRequestWithServerSearch = (props: {
    id?: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    disabled?: boolean;
    teamId: string;
    repositoryId?: string;
    value?: PullRequest;
    onChange: (value: PullRequest) => void;
}) => {
    const {
        id = "select-pull-request",
        open,
        onOpenChange,
        disabled,
        teamId,
        repositoryId,
        onChange,
        value,
    } = props;

    const {
        searchInput,
        setSearchInput,
        pullRequests,
        isSearching,
    } = useDebouncedPRSearch({
        teamId,
        repositoryId,
    });

    console.log("🎨 SelectPullRequestWithServerSearch - Debug:");
    console.log("  📊 Pull Requests:", pullRequests);
    console.log("  📏 PR Count:", pullRequests?.length);
    console.log("  🔍 Search Input:", searchInput);
    console.log("  ⚡ Is Searching:", isSearching);

    const PRsGroupedByRepository = pullRequests.reduce(
        (acc, current) => {
            if (!acc[current.repository]) acc[current.repository] = [];
            acc[current.repository].push(current);
            return acc;
        },
        {} as Record<string, typeof pullRequests>,
    );

    console.log("📊 Grouped by Repository:", PRsGroupedByRepository);

    return (
        <Popover open={open} onOpenChange={onOpenChange}>
            <PopoverTrigger asChild>
                <Button
                    id={id}
                    type="button"
                    size="lg"
                    variant="helper"
                    disabled={disabled}
                    className="flex min-h-16 w-full justify-between">
                    <div className="flex w-full items-center">
                        {!value ? (
                            <span className="flex-1">
                                No pull request selected
                            </span>
                        ) : (
                            <div className="flex-1">
                                <span className="text-primary-light text-xs">
                                    {value.repository}
                                </span>

                                <span className="text-text-secondary line-clamp-1 wrap-anywhere">
                                    <strong>#{value.pull_number}</strong>{" "}
                                    {value.title}
                                </span>
                            </div>
                        )}
                    </div>

                    <ChevronsUpDown className="-mr-2 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>

            <PopoverContent
                align="start"
                className="w-[var(--radix-popover-trigger-width)] p-0">
                <Command 
                    className="w-full"
                    shouldFilter={false} // Disable internal filtering - API handles it
                >
                    <CommandInput 
                        placeholder="Search by title or number (e.g., 'fix bug' or '#123')"
                        value={searchInput}
                        onValueChange={setSearchInput}
                    />

                    <CommandList className="overflow-y-auto">
                        {isSearching ? (
                            <div className="flex items-center justify-center p-4">
                                <Spinner className="mr-2 size-4" />
                                <span className="text-sm text-muted-foreground">
                                    Searching...
                                </span>
                            </div>
                        ) : (
                            <>
                                <CommandEmpty className="flex h-full items-center justify-center">
                                    {searchInput.trim() 
                                        ? "No pull request found with current search query"
                                        : "Start typing to search pull requests"
                                    }
                                </CommandEmpty>

                                <div className="max-h-72">
                                    {Object.entries(PRsGroupedByRepository).map(
                                        ([repository, prs]) => (
                                            <CommandGroup
                                                heading={repository}
                                                key={repository}>
                                                {prs.map((pr) => (
                                                    <CommandItem
                                                        key={`${pr.id}_${pr.pull_number}`}
                                                        value={`${repository}#${pr.pull_number}`}
                                                        onSelect={() => {
                                                            onChange(pr);
                                                            onOpenChange(false);
                                                        }}
                                                        className="flex items-center justify-start">
                                                        <span className="text-text-secondary line-clamp-2">
                                                            <strong className="mr-2 font-mono">
                                                                #{pr.pull_number}
                                                            </strong>

                                                            {pr.title}
                                                        </span>
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        ),
                                    )}
                                </div>
                            </>
                        )}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
};
