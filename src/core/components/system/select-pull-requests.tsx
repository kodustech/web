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
import { ScrollArea } from "@components/ui/scroll-area";
import { ChevronsUpDown } from "lucide-react";
import { cn } from "src/core/utils/components";

type PullRequest = {
    id: string;
    pull_number: number;
    repository: string;
    title: string;
    url: string;
};

export const SelectPullRequest = (props: {
    id?: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    disabled?: boolean;

    value?: PullRequest;
    onChange: (value: PullRequest) => void;
    pullRequests: PullRequest[];
}) => {
    const {
        id = "select-pull-request",
        open,
        onOpenChange,
        disabled,
        pullRequests,
        onChange,
        value,
    } = props;

    const PRsGroupedByRepository = pullRequests.reduce(
        (acc, current) => {
            if (!acc[current.repository]) acc[current.repository] = [];
            acc[current.repository].push(current);
            return acc;
        },
        {} as Record<string, typeof pullRequests>,
    );

    return (
        <Popover open={open} onOpenChange={onOpenChange}>
            <PopoverTrigger asChild>
                <Button
                    id={id}
                    type="button"
                    variant="outline"
                    disabled={disabled}
                    className="flex h-14 justify-between">
                    {!value ? (
                        <span className="text-muted-foreground">Pick a PR</span>
                    ) : (
                        <div>
                            <span className="text-xs text-muted-foreground">
                                {value.repository}
                            </span>

                            <div className="line-clamp-1">
                                <span className="mr-1">PR</span>
                                <strong>#{value.pull_number}</strong>
                                <span className="ml-2 text-muted-foreground">
                                    {value.title}
                                </span>
                            </div>
                        </div>
                    )}

                    <ChevronsUpDown
                        className={cn(
                            "-mr-2 size-4 opacity-50",
                            !!value ? "hidden" : "opacity-100",
                        )}
                    />
                </Button>
            </PopoverTrigger>

            <PopoverContent
                align="start"
                className="w-[var(--radix-popover-trigger-width)] p-0">
                <Command
                    className="w-full"
                    filter={(value, search) => {
                        if (value.includes(search)) return 1;
                        return 0;
                    }}>
                    <CommandInput placeholder="Search repository..." />
                    <CommandList>
                        <CommandEmpty className="flex h-full items-center justify-center">
                            No repository found
                        </CommandEmpty>

                        <ScrollArea className="h-72">
                            {Object.entries(PRsGroupedByRepository).map(
                                ([repository, prs]) => (
                                    <CommandGroup
                                        heading={repository}
                                        key={repository}>
                                        {prs.map((pr) => (
                                            <CommandItem
                                                key={`${pr.id}_${pr.pull_number}`}
                                                value={`${repository}#${pr.pull_number}`}
                                                onSelect={() => onChange(pr)}>
                                                <span className="flex items-center">
                                                    PR
                                                    <strong>
                                                        #{pr.pull_number}
                                                    </strong>
                                                </span>

                                                <span className="ml-2 line-clamp-2 text-muted-foreground">
                                                    {pr.title}
                                                </span>
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                ),
                            )}
                        </ScrollArea>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
};
