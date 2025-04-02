import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { cn } from "src/core/utils/components";

type PercentageDiffStatus = "good" | "bad" | "neutral";
type PercentageDiffMode = "lower-is-better" | "higher-is-better";

type PercentageDiffProps = React.PropsWithChildren & {
    mode: PercentageDiffMode;
    status: PercentageDiffStatus;
};

const classNames: Record<PercentageDiffStatus, string> = {
    good: "text-[hsl(151,77%,43%)]",
    bad: "text-[hsl(0,84%,62%)]",
    neutral: "text-[hsl(210,100%,50%)]",
};

const icons = {
    higher: <ArrowUpRight width="100%" height="100%" />,
    lower: <ArrowDownRight width="100%" height="100%" />,
    neutral: <Minus width="100%" height="100%" />,
} satisfies Record<string, React.ReactNode>;

const getIcon = (status: PercentageDiffStatus, mode: PercentageDiffMode) => {
    if (status === "neutral") return icons.neutral;

    if (mode === "lower-is-better") {
        return status === "bad" ? icons.higher : icons.lower;
    } else if (mode === "higher-is-better") {
        return status === "bad" ? icons.lower : icons.higher;
    }
};

export const PercentageDiff = (props: PercentageDiffProps) => {
    return (
        <span className={cn("flex gap-0.5", classNames[props.status])}>
            <span className="size-4">{getIcon(props.status, props.mode)}</span>
            {props.children}
        </span>
    );
};
