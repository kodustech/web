import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "src/core/utils/components";

const alertVariants = cva(
    cn(
        "relative w-full rounded-xl border p-5",
        "[&>svg]:absolute [&>svg]:left-5 [&>svg]:size-5 [&>svg]:top-5.5 [&>svg~*]:pl-8",
        "bg-(--alert-background)/5 border-(--alert-background)/10 [&>svg]:text-(--alert-background)",
    ),
    {
        variants: {
            variant: {
                default:
                    "bg-card-lv2 border-card-lv3 *:text-text-primary [&>svg]:text-text-primary",
                success: "[--alert-background:var(--color-success)]",
                info: "[--alert-background:var(--color-info)]",
                alert: "[--alert-background:var(--color-alert)]",
                warning: "[--alert-background:var(--color-warning)]",
                danger: "[--alert-background:var(--color-danger)]",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    },
);

const Alert = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
    <div
        ref={ref}
        role="alert"
        className={cn(alertVariants({ variant }), className)}
        {...props}
    />
));
Alert.displayName = "Alert";

const AlertTitle = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
    <h5
        ref={ref}
        className={cn(
            "min-h-5 leading-[initial] font-semibold tracking-tight text-(--alert-background)",
            className,
        )}
        {...props}
    />
));
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            "text-text-secondary mt-2 text-sm [&_p]:leading-relaxed",
            className,
        )}
        {...props}
    />
));
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertDescription, AlertTitle };
