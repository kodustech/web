import { cn } from "src/core/utils/components";

function Skeleton({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn(
                "bg-text-placeholder/10 flex h-4 w-full animate-pulse items-center justify-center rounded-xl",
                className,
            )}
            {...props}
        />
    );
}

export { Skeleton };
