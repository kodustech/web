import { usePathname } from "next/navigation";
import {
    IssueSeverityLevelBadge,
    severityLevelClassnames,
} from "@components/system/issue-severity-level-badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
} from "@components/ui/select";
import { toast } from "@components/ui/toaster/use-toast";
import { useAsyncAction } from "@hooks/use-async-action";
import { useReactQueryInvalidateQueries } from "@hooks/use-invalidate-queries";
import { changeIssueParameter } from "@services/issues/fetch";
import { SeverityLevel } from "src/core/types";
import { cn } from "src/core/utils/components";
import { revalidateServerSidePath } from "src/core/utils/revalidate-server-side";

const SEVERITY_OPTIONS = [
    SeverityLevel.LOW,
    SeverityLevel.MEDIUM,
    SeverityLevel.HIGH,
    SeverityLevel.CRITICAL,
] satisfies Array<SeverityLevel>;

export const SeverityLevelSelect = ({
    issueId,
    severity,
}: {
    issueId: string;
    severity: SeverityLevel;
}) => {
    const pathname = usePathname();
    const { invalidateQueries } = useReactQueryInvalidateQueries();

    const [changeIssueParameterAction, { loading }] = useAsyncAction(
        async (severityLevel: string) => {
            try {
                await changeIssueParameter({
                    id: issueId,
                    field: "severity",
                    value: severityLevel as SeverityLevel,
                });

                await Promise.all([
                    invalidateQueries({ queryKey: ["issues"] }),
                    revalidateServerSidePath(pathname),
                ]);
            } catch {
                toast({
                    variant: "warning",
                    title: "Failed to change severity level",
                });
            }
        },
    );

    return (
        <Select
            value={severity}
            onValueChange={(v) => changeIssueParameterAction(v)}>
            <div className="flex items-center">
                <SelectTrigger
                    loading={loading}
                    className={cn(
                        "min-h-auto w-fit gap-1 rounded-lg py-1 pr-3.5 pl-2 text-xs leading-none uppercase [--icon-size:calc(var(--spacing)*4)]",
                        severityLevelClassnames[severity],
                    )}>
                    {severity}
                </SelectTrigger>
            </div>

            <SelectContent>
                {SEVERITY_OPTIONS.map((s) => (
                    <SelectItem
                        key={s}
                        value={s}
                        className="min-h-auto gap-1.5 py-1 pr-4 pl-1 [--icon-size:calc(var(--spacing)*4)]">
                        <IssueSeverityLevelBadge severity={s} />
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
};
