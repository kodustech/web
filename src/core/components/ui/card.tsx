import * as React from "react";
import { cn } from "src/core/utils/components";

const Card = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & { disabled?: boolean }
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            "bg-card/50 text-card-foreground flex flex-col overflow-hidden rounded-2xl border shadow-xs",
            className,
        )}
        {...props}
        onClick={props.disabled ? undefined : props.onClick}
    />
));
Card.displayName = "Card";

const CardHeader = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("flex w-full flex-col gap-y-1.5 p-6", className)}
        {...props}
    />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
    <h3
        ref={ref}
        className={cn("text-2xl leading-none font-semibold", className)}
        {...props}
    />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
    <p
        ref={ref}
        className={cn("text-muted-foreground text-sm", className)}
        {...props}
    />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("w-full flex-1 p-6 pt-0", className)}
        {...props}
    />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("flex shrink-0 items-center p-6 pt-0", className)}
        {...props}
    />
));
CardFooter.displayName = "CardFooter";

export {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
};
