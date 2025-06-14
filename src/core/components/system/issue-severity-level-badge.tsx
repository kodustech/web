import { Badge } from "@components/ui/badge";
import { cn } from "src/core/utils/components";

const severityVariantMap = {
    critical: "bg-danger/10 text-danger border-danger/64",
    high: "bg-warning/10 text-warning border-warning/64",
    medium: "bg-alert/10 text-alert border-alert/64",
    low: "bg-info/10 text-info border-info/64",
} as const satisfies Record<string, string>;

export const IssueSeverityLevelBadge = ({
    severity,
}: {
    severity: keyof typeof severityVariantMap;
}) => {
    return (
        <Badge
            className={cn(
                "pointer-events-none h-6 min-h-auto rounded-lg border-1 px-1.5 text-[10px] leading-px uppercase",
                severityVariantMap[severity as keyof typeof severityVariantMap],
            )}>
            {severity}
        </Badge>
    );
};
