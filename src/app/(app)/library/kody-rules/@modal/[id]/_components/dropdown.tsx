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
import { Check, ChevronDown } from "lucide-react";
import { cn } from "src/core/utils/components";

export const SelectRepositoriesDropdown = ({
    selectedRepositoriesIds,
    setSelectedRepositoriesIds,
    selectedRepositories,
}: {
    selectedRepositoriesIds: Array<string>;
    setSelectedRepositoriesIds: (
        selectedRepositoriesIds: Array<string>,
    ) => void;
    selectedRepositories: Array<{
        id: string;
        name: string;
        isSelected?: boolean;
    }>;
}) => {
    const repositories = [{ id: "global", name: "Global" }].concat(
        selectedRepositories,
    );

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    size="md"
                    variant="primary"
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
                className="w-72 p-0">
                <Command
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
                </Command>
            </PopoverContent>
        </Popover>
    );
};
