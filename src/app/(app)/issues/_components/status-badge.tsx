import { Badge } from "@components/ui/badge";
import { cn } from "src/core/utils/components";

export const StatusBadge = ({ value }: { value: "open" | "closed" }) => {
    return (
        <Badge
            className={cn(
                "pointer-events-none h-6 min-h-auto rounded-lg border-1 px-1.5 text-[10px] leading-px uppercase",
                value === "closed" &&
                    "bg-success/10 text-success border-success/64",
                value === "open" &&
                    "bg-warning/10 text-warning border-warning/64",
            )}>
            {value}
        </Badge>
    );
};
