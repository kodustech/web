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
                    !!error && "border-destructive border-1",
                    "rounded-md backdrop-blur-xs",
                    "placeholder:text-muted-foreground focus-visible:border-brand-orange flex h-12 w-full items-center rounded-xl border bg-[#231b2e]/35 px-5 text-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:opacity-50 hover:bg-[#231b2e] focus-visible:bg-[#231b2e] disabled:cursor-not-allowed disabled:opacity-50",
                    className,
                )}
                {...props}
            />
        );
    },
);
Input.displayName = "Input";

export { Input };
