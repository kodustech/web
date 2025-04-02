import { cn } from "src/core/utils/components";

export const DotLoader = (props: React.ComponentProps<"div">) => (
    <div
        {...props}
        className={cn(
            "flex aspect-[2] h-6 items-center justify-center gap-x-1 text-brand-orange",
            props.className,
        )}>
        <span className="sr-only">Loading...</span>
        <div className="aspect-square flex-1 flex-shrink-0 animate-bounce rounded-full bg-[currentColor] [animation-delay:-0.3s]" />
        <div className="aspect-square flex-1 flex-shrink-0 animate-bounce rounded-full bg-[currentColor] [animation-delay:-0.15s]" />
        <div className="aspect-square flex-1 flex-shrink-0 animate-bounce rounded-full bg-[currentColor]" />
    </div>
);
