import { Button } from "@components/ui/button";
import { Checkbox } from "@components/ui/checkbox";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleIndicator,
    CollapsibleTrigger,
} from "@components/ui/collapsible";
import { Heading } from "@components/ui/heading";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@components/ui/popover";
import { ChevronDown } from "lucide-react";
import type {
    CodeReviewGlobalConfig,
    CodeReviewRepositoryConfig,
} from "src/app/(app)/settings/code-review/_types";
import type { LiteralUnion } from "src/core/types";
import { cn } from "src/core/utils/components";

export const SelectRepositoriesDropdown = ({
    repositories: _repositories,
    selectedDirectoriesIds,
    selectedRepositoriesIds,
    setSelectedDirectoriesIds,
    setSelectedRepositoriesIds,
    canEdit,
    global = true,
}: {
    selectedRepositoriesIds: string[];
    selectedDirectoriesIds: Array<{
        directoryId: string;
        repositoryId: string;
    }>;
    setSelectedRepositoriesIds: (s: typeof selectedRepositoriesIds) => void;
    setSelectedDirectoriesIds: (s: typeof selectedDirectoriesIds) => void;
    repositories: Array<CodeReviewRepositoryConfig>;
    canEdit: boolean;
    global?: boolean;
}) => {
    const repositories: Array<
        Omit<CodeReviewRepositoryConfig, "configs"> & {
            id: LiteralUnion<"global">;
        }
    > = global
        ? [{ id: "global", name: "Global", isSelected: true }].concat(
              _repositories,
          )
        : _repositories;

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    size="md"
                    variant="primary"
                    disabled={!canEdit}
                    className="group rounded-l-none px-3">
                    <ChevronDown
                        className={cn(
                            "size-4",
                            "transition-transform group-data-[state=closed]:rotate-180",
                        )}
                    />
                </Button>
            </PopoverTrigger>

            <PopoverContent
                align="end"
                side="top"
                sideOffset={10}
                className="w-72">
                <Heading variant="h3" className="mb-2">
                    Select repositories/directories
                </Heading>

                {repositories
                    .filter((r) => r.isSelected || r.id === "global")
                    .map((r) => (
                        <div key={r.id}>
                            <Collapsible
                                className="flex-1"
                                disabled={
                                    r.id === "global" || !r.directories?.length
                                }>
                                <div className="flex items-center gap-3">
                                    <div className="size-6">
                                        {r.isSelected && (
                                            <Checkbox
                                                className="size-full"
                                                checked={selectedRepositoriesIds.includes(
                                                    r.id,
                                                )}
                                                onCheckedChange={(checked) => {
                                                    if (!checked) {
                                                        return setSelectedRepositoriesIds(
                                                            selectedRepositoriesIds.filter(
                                                                (id) =>
                                                                    id !== r.id,
                                                            ),
                                                        );
                                                    }

                                                    setSelectedRepositoriesIds([
                                                        ...selectedRepositoriesIds,
                                                        r.id,
                                                    ]);
                                                }}
                                            />
                                        )}
                                    </div>

                                    <CollapsibleTrigger
                                        asChild
                                        className="flex-1">
                                        <Button
                                            active
                                            size="sm"
                                            variant="cancel"
                                            data-disabled={undefined}
                                            className={cn(
                                                "flex-1 justify-start px-0",
                                                r.id === "global" &&
                                                    "pointer-events-none",
                                            )}
                                            rightIcon={
                                                r.id !== "global" &&
                                                r.directories?.length && (
                                                    <CollapsibleIndicator />
                                                )
                                            }>
                                            {r.name}
                                        </Button>
                                    </CollapsibleTrigger>
                                </div>

                                <CollapsibleContent className="mt-1 ml-2 flex flex-col justify-center gap-2 border-l pb-0 pl-3">
                                    {r.directories?.map((d) => (
                                        <div key={d.id} className="flex gap-3">
                                            <Checkbox
                                                checked={selectedDirectoriesIds.some(
                                                    (dId) =>
                                                        d.id ===
                                                        dId.directoryId,
                                                )}
                                                onCheckedChange={(checked) => {
                                                    if (!checked) {
                                                        return setSelectedDirectoriesIds(
                                                            selectedDirectoriesIds.filter(
                                                                ({
                                                                    directoryId,
                                                                }) =>
                                                                    directoryId !==
                                                                    d.id,
                                                            ),
                                                        );
                                                    }

                                                    setSelectedDirectoriesIds([
                                                        ...selectedDirectoriesIds,
                                                        {
                                                            directoryId: d.id,
                                                            repositoryId: r.id,
                                                        },
                                                    ]);
                                                }}
                                            />

                                            <span>{d.path}</span>
                                        </div>
                                    ))}
                                </CollapsibleContent>
                            </Collapsible>
                        </div>
                    ))}

                {/* <Command
                    filter={(value, search) => {
                        const repository = repositories.find(
                            (r) => r.id === value,
                        );

                        if (!repository) return 0;

                        if (
                            repository.name
                                .toLowerCase()
                                .includes(search.toLowerCase())
                        ) {
                            return 1;
                        }

                        return 0;
                    }}>
                    <CommandInput placeholder="Search repositories..." />

                    <CommandList>
                        <CommandEmpty className="text-text-secondary px-8 text-xs">
                            No repositories found with current search query.
                        </CommandEmpty>
                        <CommandGroup>
                            {repositories
                                .filter(
                                    (repository: {
                                        id: string;
                                        name: string;
                                        isSelected?: boolean;
                                    }) =>
                                        repository?.isSelected ||
                                        repository.id === "global",
                                )
                                .map((r) => (
                                    <CommandItem
                                        key={r.id}
                                        value={r.id}
                                        onSelect={() => {
                                            setSelectedRepositoriesIds(
                                                selectedRepositoriesIds.includes(
                                                    r.id,
                                                )
                                                    ? selectedRepositoriesIds.filter(
                                                          (id) => id !== r.id,
                                                      )
                                                    : [
                                                          ...selectedRepositoriesIds,
                                                          r.id,
                                                      ],
                                            );
                                        }}>
                                        {r.name}
                                        <Check
                                            className={cn(
                                                "text-primary-light ml-auto size-4",
                                                selectedRepositoriesIds.includes(
                                                    r.id,
                                                )
                                                    ? "opacity-100"
                                                    : "opacity-0",
                                            )}
                                        />
                                    </CommandItem>
                                ))}
                        </CommandGroup>
                    </CommandList>
                </Command> */}
            </PopoverContent>
        </Popover>
    );
};
