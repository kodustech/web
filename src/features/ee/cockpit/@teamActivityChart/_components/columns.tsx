import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@components/ui/tooltip";
import { ColumnDef } from "@tanstack/react-table";
import {
    addDays,
    eachWeekOfInterval,
    formatDate,
    isWithinInterval,
} from "date-fns";
import { cn } from "src/core/utils/components";
import { pluralize } from "src/core/utils/string";

type Type = [string, Array<{ date: string; prCount: number }>];

const prsClassname = "bg-(--color-danger)";
const commitsClassname = "bg-[hsl(244,100%,78%)]";

export const getColumns = ({
    startDate,
    endDate,
}: {
    startDate: string;
    endDate: string;
}): ColumnDef<Type>[] => {
    const interval = eachWeekOfInterval({
        start: new Date(startDate),
        end: new Date(endDate),
    }).reverse();

    return [
        {
            accessorKey: "developer",
            header: "Developer",
            accessorFn: (row) => row[0],
            cell: ({ row }) => {
                const all = row.original[1].reduce(
                    (acc, d) => {
                        acc.prCount += d.prCount;
                        return acc;
                    },
                    { prCount: 0 },
                );

                return (
                    <div className="flex flex-col gap-2 py-2">
                        <div className="text-sm font-semibold wrap-anywhere">
                            {row.original[0]}
                        </div>

                        <div className="flex flex-col gap-1">
                            <div className="text-text-secondary flex items-center text-xs">
                                <div
                                    className={cn(
                                        "mr-2 h-4 w-1 rounded",
                                        prsClassname,
                                    )}
                                />

                                <span className="mr-0.5 font-bold">
                                    {all.prCount}
                                </span>

                                {pluralize(all.prCount, {
                                    plural: "PRs",
                                    singular: "PR",
                                })}
                            </div>
                            {/* <div className="flex gap-2 text-xs text-text-secondary">
                            <div
                                className={cn("w-1 rounded", commitsClassname)}
                            />
                            {all.commitCount} commits
                        </div> */}
                        </div>
                    </div>
                );
            },
        },
        ...interval.map((a) => {
            const weekStart = formatDate(a, "yyyy-MM-dd");
            const weekEnd = formatDate(addDays(a, 6), "yyyy-MM-dd");

            return {
                accessorKey: weekStart,
                header: () => (
                    <span className="font-semibold">
                        {weekEnd}
                        <span className="text-text-tertiary mx-1">~</span>
                        {weekStart}
                    </span>
                ),
                meta: { align: "center" },
                minSize: 250,
                cell: ({ row }) => {
                    const daysBetween = row.original[1].filter((d) =>
                        isWithinInterval(d.date, {
                            start: weekStart,
                            end: weekEnd,
                        }),
                    );

                    // const commits = weekData.reduce((sum, d) => sum + d.commitCount, 0);
                    const prs = daysBetween.reduce(
                        (sum, d) => sum + d.prCount,
                        0,
                    );

                    return (
                        <>
                            <div className="flex flex-col gap-1">
                                <div className="flex flex-wrap gap-1">
                                    {new Array(prs).fill(null).map((_, i) => (
                                        <div
                                            key={i}
                                            className={cn(
                                                "h-4 w-1 rounded",
                                                prsClassname,
                                            )}
                                        />
                                    ))}
                                </div>
                                {/* <div className="flex flex-wrap gap-1">
                                {new Array(commits).fill(null).map((_, i) => (
                                    <div
                                        key={i}
                                        className={cn(
                                            "h-4 w-1 rounded",
                                            commitsClassname,
                                        )}
                                    />
                                ))}
                                </div> */}
                            </div>

                            {prs > 0 && (
                                <Tooltip>
                                    <TooltipTrigger className="absolute inset-0" />

                                    <TooltipContent className="pointer-events-none">
                                        <span className="text-primary-light mr-0.5 font-bold">
                                            {prs}
                                        </span>

                                        {pluralize(prs, {
                                            plural: "PRs",
                                            singular: "PR",
                                        })}
                                    </TooltipContent>
                                </Tooltip>
                            )}
                        </>
                    );
                },
            } satisfies ColumnDef<Type>;
        }),
    ];
};
