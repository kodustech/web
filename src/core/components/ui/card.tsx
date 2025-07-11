import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "src/core/utils/components";

const cardVariants = cva("flex flex-col overflow-hidden rounded-xl shadow-sm", {
    variants: {
        color: {
            none: "bg-transparent",
            lv1: "bg-card-lv1",
            lv2: "bg-card-lv2",
            lv3: "bg-card-lv3",
        },
    },
    defaultVariants: { color: "lv2" },
});

const Card = React.forwardRef<
    HTMLDivElement,
    Omit<React.HTMLAttributes<HTMLDivElement>, "color"> &
        VariantProps<typeof cardVariants>
>(({ className, color, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(cardVariants({ color }), className)}
        {...props}
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
        className={cn("text-lg leading-none font-bold", className)}
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
        className={cn("text-text-secondary text-sm font-normal", className)}
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
        className={cn("flex shrink-0 items-center gap-2 p-6 pt-0", className)}
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
