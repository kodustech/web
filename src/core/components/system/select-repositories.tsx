import { useEffect } from "react";
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
import { Check, ChevronsUpDown } from "lucide-react";
import { pluralize } from "src/core/utils/string";

export const SelectRepositories = (props: {
    id?: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    selectedRepositories: Repository[];
    onChangeSelectedRepositories: (repositories: Repository[]) => void;
    onFinishLoading?: () => void;
    teamId: string;
}) => {
    const { data: repositories = [], isLoading } = useGetRepositories(
        props.teamId,
    );

    useEffect(() => {
        if (!isLoading) props.onFinishLoading?.();
    }, [isLoading]);

    const {
        id = "select-repositories",
        open,
        onOpenChange,
        selectedRepositories,
        onChangeSelectedRepositories,
    } = props;

    const unselectedRepositories = repositories.filter(
        (r) => !selectedRepositories.some((s) => s.id === r.id),
    );

    return (
        <Popover open={open} onOpenChange={onOpenChange}>
            <PopoverTrigger asChild>
                <Button
                    size="lg"
                    variant="helper"
                    role="combobox"
                    loading={isLoading}
                    aria-expanded={open}
                    className="w-full justify-between"
                    id={id}
                    rightIcon={<ChevronsUpDown className="-mr-2 opacity-50" />}>
                    {selectedRepositories.length > 0 ? (
                        `${selectedRepositories.length} ${pluralize(
                            selectedRepositories.length,
                            {
                                singular: "repository",
                                plural: "repositories",
                            },
                        )} selected`
                    ) : (
                        <span>Select repositories...</span>
                    )}
                </Button>
            </PopoverTrigger>

            <PopoverContent className="w-[var(--radix-popper-anchor-width)] p-0">
                <Command
                    filter={(value, search) => {
                        const repository = repositories.find(
                            (r) => r.id === value,
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

                        {selectedRepositories.length > 0 && (
                            <CommandGroup heading="Selected">
                                {selectedRepositories.map((r) => (
                                    <CommandItem
                                        key={r.id}
                                        value={r.id}
                                        onSelect={(currentValue) => {
                                            onChangeSelectedRepositories(
                                                selectedRepositories.filter(
                                                    (repo) =>
                                                        repo.id !==
                                                        currentValue,
                                                ),
                                            );
                                        }}>
                                        <span>
                                            <span className="text-text-secondary">
                                                {r.organizationName}/
                                            </span>
                                            {r.name}
                                        </span>

                                        <Check className="text-primary-light -mr-2 size-5" />
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        )}
                        {unselectedRepositories.length > 0 && (
                            <CommandGroup heading="Not selected">
                                {unselectedRepositories.map((r) => (
                                    <CommandItem
                                        key={r.id}
                                        value={r.id}
                                        onSelect={(currentValue) => {
                                            onChangeSelectedRepositories([
                                                ...selectedRepositories,
                                                repositories.find(
                                                    (repo) =>
                                                        repo.id ===
                                                        currentValue,
                                                )!,
                                            ]);
                                        }}>
                                        <span>
                                            <span className="text-text-secondary">
                                                {r.organizationName}/
                                            </span>
                                            {r.name}
                                        </span>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        )}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
};
