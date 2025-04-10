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
    teamId: string;
}) => {
    const { data = [], isLoading } = useGetRepositories(props.teamId);

    const {
        id = "select-repositories",
        open,
        onOpenChange,
        selectedRepositories,
        onChangeSelectedRepositories,
    } = props;

    const repositories = data.map((r) => ({
        ...r,
        name: r.name.includes("/") ? r.name.split("/")[1] : r.name,
    }));

    const unselectedRepositories = repositories.filter(
        (r) => !selectedRepositories.some((s) => s.id === r.id),
    );

    return (
        <Popover open={open} onOpenChange={onOpenChange}>
            <PopoverTrigger asChild disabled={isLoading}>
                <Button
                    variant="outline"
                    role="combobox"
                    loading={isLoading}
                    aria-expanded={open}
                    className="justify-between"
                    id={id}
                    rightIcon={
                        <ChevronsUpDown className="size-4! opacity-50" />
                    }>
                    {selectedRepositories.length > 0 ? (
                        `${selectedRepositories.length} ${pluralize(
                            selectedRepositories.length,
                            {
                                singular: "repository",
                                plural: "repositories",
                            },
                        )} selected`
                    ) : (
                        <p className="text-muted-foreground">
                            Select repositories...
                        </p>
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

                    <CommandList>
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
                                        <Check className="mr-2 h-4 w-4 text-brand-orange" />
                                        <span className="text-muted-foreground">
                                            {r.organizationName}/
                                        </span>
                                        {r.name}
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
                                                data.find(
                                                    (r) =>
                                                        r.id === currentValue,
                                                )!,
                                            ]);
                                        }}>
                                        <div className="mr-2 h-4 w-4" />
                                        <span className="text-muted-foreground">
                                            {r.organizationName}/
                                        </span>
                                        {r.name}
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
