import { Badge } from "@components/ui/badge";
import type { IssueStatus } from "@services/issues/types";
import { cn } from "src/core/utils/components";

export const issueStatusClassnames = {
    open: "bg-warning/10 text-warning ring-warning/64 [--button-foreground:var(--color-warning)]",
    resolved:
        "bg-success/10 text-success ring-success/64 [--button-foreground:var(--color-success)]",
    dismissed:
        "bg-info/10 text-info ring-info/64 [--button-foreground:var(--color-info)]",
} as const satisfies Record<IssueStatus, string>;

export const StatusBadge = ({ value }: { value: IssueStatus }) => {
    return (
        <Badge
            className={cn(
                "pointer-events-none h-6 min-h-auto rounded-lg px-1.5 text-[10px] leading-px uppercase ring-1",
                issueStatusClassnames[value],
            )}>
            {value}
        </Badge>
    );
};
