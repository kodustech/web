import { cn } from "src/core/utils/components";

export const CockpitNoDataPlaceholder = ({
    mini,
    className,
}: {
    mini?: true;
    className?: string;
}) => {
    return (
        <div
            className={cn(
                "text-text-secondary -mt-4 flex h-full w-full items-center justify-center text-center text-sm",
                className,
            )}>
            <div
                className={cn(
                    "flex w-48 flex-col items-center gap-4 text-center",
                    mini && "scale-90 gap-2",
                )}>
                <div className="*:bg-card-lv3 flex h-16 items-end gap-1 *:w-6 *:rounded-sm">
                    <div className="h-2/5" />
                    <div className="h-3/5" />
                    <div className="h-4/5" />
                    <div className="h-5/5" />
                </div>

                <span className="text-sm leading-tight">
                    Once we have enough data, your metrics will appear here.
                </span>
            </div>
        </div>
    );
};
