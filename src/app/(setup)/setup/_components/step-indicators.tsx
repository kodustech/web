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
                status === "active" && "bg-primary-light",
                status === "completed" && "bg-primary-light/20",
                status === "error" && "bg-danger",
                status === "inactive" && "bg-card-lv3/15",
            )}
        />
    );
};

export const StepIndicators = {
    Root: StepIndicatorsRoot,
    Item: StepIndicatorItem,
};
