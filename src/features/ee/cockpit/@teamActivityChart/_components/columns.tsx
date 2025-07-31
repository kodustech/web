import { ColumnDef } from "@tanstack/react-table";
import { addDays, eachDayOfInterval, formatDate, formatISO } from "date-fns";
import { cn } from "src/core/utils/components";

type Type = [
    string,
    Array<{ date: string; commitCount: number; prCount: number }>,
];

const prsClassname = "bg-(--color-danger)";
const commitsClassname = "bg-[hsl(244,100%,78%)]";

export const getColumns = ({
    startDate,
    endDate,
}: {
    startDate: string;
    endDate: string;
}): ColumnDef<Type>[] => [
    {
        accessorKey: "developer",
        header: "Developer",
        accessorFn: (row) => row[0],
        cell: ({ row }) => {
            const all = row.original[1].reduce(
                (acc, d) => {
                    acc.commitCount += d.commitCount;
                    acc.prCount += d.prCount;
                    return acc;
                },
                {
                    commitCount: 0,
                    prCount: 0,
                },
            );

            return (
                <div className="flex flex-col gap-2 py-2">
                    <div className="text-sm font-medium wrap-anywhere">
                        {row.original[0]}
                    </div>

                    <div className="flex flex-col gap-1">
                        <div className="text-text-secondary flex gap-2 text-xs">
                            <div className={cn("w-1 rounded", prsClassname)} />
                            {all.prCount} PRs
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
    ...eachDayOfInterval({
        end: formatISO(addDays(startDate, 1)),
        start: formatISO(addDays(endDate, 1)),
    }).map((date) => {
        const dateString = formatDate(date, "yyyy/MM/dd");

        return {
            accessorKey: dateString,
            header: dateString,
            meta: { align: "center" },
            cell: ({ row }) => {
                const rowDate = row.original[1].find((d) => {
                    return d.date === dateString.replaceAll("/", "-");
                });

                // const commits = rowDate?.commitCount ?? 0;
                const prs = rowDate?.prCount ?? 0;

                return (
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
                );
            },
        } satisfies ColumnDef<Type>;
    }),
];
