import { cn } from "src/core/utils/components";

export const InlineCode = (props: React.ComponentProps<"code">) => {
    return (
        <code
            {...props}
            className={cn(
                "bg-background text-text-primary mx-0.5 rounded-lg px-1.5 py-1 text-[95%] font-normal",
                props.className,
            )}
        />
    );
};
