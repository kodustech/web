import { cn } from "src/core/utils/components";

const StepIndicatorsRoot = (props: React.PropsWithChildren) => {
    return <div className="flex flex-row gap-2">{props.children}</div>;
};

const StepIndicatorItem = ({
    status = "inactive",
}: {
    status?: "active" | "completed" | "error" | "inactive";
}) => {
    return (
        <div
            className={cn(
                "aspect-[5] h-2 rounded-full",
                status === "active" && "cursor-pointer bg-brand-orange/100",
                status === "completed" && "bg-brand-orange/20",
                status === "error" && "bg-brand-red",
                status === "inactive" && "bg-foreground/10",
            )}
        />
    );
};

export const StepIndicators = {
    Root: StepIndicatorsRoot,
    Item: StepIndicatorItem,
};
