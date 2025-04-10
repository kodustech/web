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
                    !!error && "border-destructive border-1",
                    "rounded-md backdrop-blur-xs",
                    "placeholder:text-muted-foreground focus-visible:border-brand-orange flex min-h-[80px] w-full rounded-xl border bg-[#231b2e]/35 px-4 py-3 text-sm transition-colors placeholder:opacity-50 hover:bg-[#231b2e] focus-visible:bg-[#231b2e] disabled:cursor-not-allowed disabled:opacity-50",
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
