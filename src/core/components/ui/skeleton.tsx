import { cn } from "src/core/utils/components";

function Skeleton({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn(
                "h-4 w-full animate-pulse rounded-xl bg-primary/10",
                className,
            )}
            {...props}
        />
    );
}

export { Skeleton };
