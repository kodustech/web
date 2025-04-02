import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "src/core/utils/components";

import { Icons } from "./icons";

const buttonVariants = cva(
    "inline-flex overflow-hidden select-none relative items-center justify-center rounded-xl text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 gap-2 text-start flex-shrink-0 border",
    {
        variants: {
            variant: {
                default:
                    "bg-primary text-primary-foreground hover:bg-primary/70 selected:bg-primary/70 border-transparent",
                destructive:
                    "bg-destructive text-destructive-foreground hover:bg-destructive/90 selected:bg-destructive/90 border-transparent",
                outline:
                    "bg-[#231b2e] bg-opacity-25 text-foreground hover:bg-[#231b2e] hover:bg-opacity-100 selected:bg-opacity-100 selected:border-opacity-60 border",
                secondary:
                    "bg-secondary text-secondary-foreground hover:bg-secondary/80 selected:bg-secondary/80 border-transparent",
                ghost: "bg-[#231b2e] bg-opacity-0 text-foreground hover:bg-[#231b2e] hover:bg-opacity-100 selected:bg-opacity-100 border-transparent",
                link: "text-primary underline-offset-4 hover:underline border-transparent !px-0 w-fit hover:text-brand-orange text-muted-foreground selected:text-brand-orange",
                success:
                    "bg-green-600 text-white hover:bg-green-500 border-transparent",
            },
            size: {
                default: "h-11 px-4 py-2",
                sm: "h-9 px-3",
                lg: "h-12 px-5",
                icon: "size-10",
            },
        },
        defaultVariants: {
            variant: "secondary",
            size: "default",
        },
    },
);

interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
        VariantProps<typeof buttonVariants> {
    loading?: boolean;
    selected?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    (props, ref) => {
        const {
            className,
            variant,
            size,
            disabled,
            leftIcon: LeftIcon,
            rightIcon: RightIcon,
            loading,
            selected,
            ...otherProps
        } = props;
        return (
            <button
                {...otherProps}
                ref={ref}
                disabled={disabled || loading}
                className={cn(buttonVariants({ variant, size }), className)}
                {...(selected ? { "data-selected": "true" } : {})}>
                {loading && (
                    <div className="absolute inset-0 flex items-center justify-center backdrop-blur-3xl">
                        <Icons.spinner className="size-5 animate-spin" />
                    </div>
                )}

                <div className="contents">
                    {LeftIcon && (
                        <div className="children:size-4">{LeftIcon}</div>
                    )}

                    {props.children}

                    {RightIcon && (
                        <div className="children:size-4">{RightIcon}</div>
                    )}
                </div>
            </button>
        );
    },
);

Button.displayName = "Button";

export { Button, buttonVariants };
