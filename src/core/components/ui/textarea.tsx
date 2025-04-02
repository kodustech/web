import * as React from "react";
import { cn } from "src/core/utils/components";

interface TextareaProps
    extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    error?: unknown;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, error, ...props }, ref) => {
        return (
            <textarea
                className={cn(
                    !!error && "border-1 border-destructive",
                    "rounded-md backdrop-blur-sm",
                    "flex min-h-[80px] w-full rounded-xl border bg-[#231b2e] bg-opacity-35 px-4 py-3 text-sm transition-colors placeholder:text-muted-foreground placeholder:opacity-50 focus-visible:border-brand-orange focus-visible:bg-opacity-100 hover:bg-opacity-100 disabled:cursor-not-allowed disabled:opacity-50",
                    className,
                )}
                ref={ref}
                {...props}
            />
        );
    },
);
Textarea.displayName = "Textarea";

export { Textarea };
