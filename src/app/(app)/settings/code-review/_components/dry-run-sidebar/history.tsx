import { useEffect, useState } from "react";
import { Badge } from "@components/ui/badge";
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
import { listDryRuns } from "@services/dryRun/fetch";
import { IDryRunData } from "@services/dryRun/types";
import { ChevronsUpDown, Loader2 } from "lucide-react";
import { useSelectedTeamId } from "src/core/providers/selected-team-context";

import { statusMap } from ".";
import { useCodeReviewRouteParams } from "../../../_hooks";

const formatHistoryDate = (dateString: string | Date) => {
    const date = dateString instanceof Date ? dateString : new Date(dateString);
    return date.toLocaleString(undefined, {
        dateStyle: "short",
        timeStyle: "short",
    });
};

export const SelectHistoryItem = (props: {
    id?: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    disabled?: boolean;
    value: string | null; // correlationId
    onChange: (value: string) => void; // setCorrelationId
}) => {
    const {
        id = "select-history-item",
        open,
        onOpenChange,
        disabled,
        onChange,
        value,
    } = props;

    const { teamId } = useSelectedTeamId();
    const { repositoryId, directoryId } = useCodeReviewRouteParams();

    const [history, setHistory] = useState<IDryRunData[]>([]);
    const [isHistoryLoading, setIsHistoryLoading] = useState(false);

    useEffect(() => {
        const fetchHistory = async () => {
            if (!teamId || !repositoryId) return;
            setIsHistoryLoading(true);
            try {
                const historyData = await listDryRuns(teamId, {
                    repositoryId,
                    directoryId,
                });
                setHistory(historyData);
            } catch (err) {
                console.error("Failed to fetch dry run history:", err);
                setHistory([]);
            } finally {
                setIsHistoryLoading(false);
            }
        };

        fetchHistory();
    }, [teamId, repositoryId, directoryId]);

    const selectedItem = history.find((item) => item.id === value);

    const historyGroupedByRepository = history.reduce(
        (acc, current) => {
            if (!acc[current.repositoryName]) acc[current.repositoryName] = [];
            acc[current.repositoryName].push(current);
            return acc;
        },
        {} as Record<string, typeof history>,
    );

    return (
        <Popover open={open} onOpenChange={onOpenChange} modal>
            <PopoverTrigger asChild>
                <Button
                    id={id}
                    type="button"
                    size="lg"
                    variant="helper"
                    disabled={disabled || isHistoryLoading}
                    className="flex min-h-16 w-full justify-between">
                    <div className="flex w-full items-center">
                        {isHistoryLoading ? (
                            <span className="flex flex-1 items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Loading history...
                            </span>
                        ) : !selectedItem ? (
                            <span className="flex-1">
                                No past preview selected
                            </span>
                        ) : (
                            <div className="flex-1">
                                <span className="text-primary-light text-xs">
                                    {selectedItem.repositoryName}
                                </span>
                                <span className="text-text-secondary line-clamp-1 wrap-anywhere">
                                    <strong>
                                        #{selectedItem.prNumber} -{" "}
                                        {selectedItem.prTitle}
                                    </strong>{" "}
                                    {formatHistoryDate(selectedItem.createdAt)}
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
                    filter={(value, search) => {
                        const item = history.find((h) => h.id === value);
                        if (item) {
                            const prNumberString = item.prNumber.toString();
                            const repositoryName =
                                item.repositoryName.toLowerCase();
                            const searchLower = search.toLowerCase();

                            if (
                                prNumberString.includes(searchLower) ||
                                `#${prNumberString}`.includes(searchLower) ||
                                repositoryName.includes(searchLower)
                            ) {
                                return 1;
                            }
                        }
                        return 0;
                    }}>
                    <CommandInput placeholder="Search by PR number or repository" />
                    <CommandList className="overflow-y-auto">
                        <CommandEmpty className="flex h-full items-center justify-center">
                            No past preview found.
                        </CommandEmpty>
                        <div className="max-h-72">
                            {Object.entries(historyGroupedByRepository).map(
                                ([repoName, items]) => (
                                    <CommandGroup
                                        heading={repoName}
                                        key={repoName}>
                                        {items.map((item) => (
                                            <CommandItem
                                                key={item.id}
                                                value={item.id}
                                                onSelect={() =>
                                                    onChange(item.id)
                                                }
                                                className="flex flex-col items-start">
                                                <span className="text-text-secondary line-clamp-1">
                                                    <Badge className="mr-2">
                                                        {item.status
                                                            ? statusMap[
                                                                  item.status
                                                              ]
                                                            : "Unknown"}
                                                    </Badge>
                                                    <strong className="mr-2 font-mono">
                                                        #{item.prNumber} -{" "}
                                                        {item.prTitle}
                                                    </strong>
                                                </span>
                                                <span className="text-text-tertiary text-xs">
                                                    {formatHistoryDate(
                                                        item.createdAt,
                                                    )}
                                                </span>
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                ),
                            )}
                        </div>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
};
