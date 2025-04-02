import * as React from "react";
import { cn } from "src/core/utils/components";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    error?: unknown;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, error, ...props }, ref) => {
        return (
            <input
                ref={ref}
                className={cn(
                    !!error && "border-1 border-destructive",
                    "rounded-md backdrop-blur-sm",
                    "flex h-12 w-full items-center rounded-xl border bg-[#231b2e] bg-opacity-35 px-5 text-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground placeholder:opacity-50 focus-visible:border-brand-orange focus-visible:bg-opacity-100 hover:bg-opacity-100 disabled:cursor-not-allowed disabled:opacity-50",
                    className,
                )}
                {...props}
            />
        );
    },
);
Input.displayName = "Input";

export { Input };
