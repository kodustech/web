import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "src/core/utils/components";

const progressVariants = cva(
    cn(
        "h-2.5 overflow-hidden rounded-full relative w-full bg-(--progress-background)",
    ),
    {
        variants: {
            variant: {
                "primary":
                    "[--progress-foreground:var(--color-primary-light)] [--progress-background:var(--color-primary-dark)]",

                "primary-dark":
                    "[--progress-foreground:var(--color-primary-light)] [--progress-background:var(--color-primary-dark)]",

                "secondary":
                    "[--progress-foreground:var(--color-secondary-light)] [--progress-background:var(--color-secondary-dark)]",

                "helper":
                    "[--progress-foreground:var(--color-card-lv2)] [--progress-background:var(--color-text-secondary)]",

                "tertiary":
                    "[--progress-foreground:var(--color-tertiary-light)] [--progress-background:var(--color-tertiary-dark)]",
            },
        },
        defaultVariants: {
            variant: "primary",
        },
    },
);

const ProgressRoot = ({
    variant,
    ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root> &
    Required<VariantProps<typeof progressVariants>>) => (
    <ProgressPrimitive.Root
        {...props}
        className={cn(progressVariants({ variant }), props.className)}>
        <ProgressPrimitive.Indicator
            {...props}
            asChild
            className={cn(
                "h-full w-full flex-1 bg-(--progress-foreground) transition-all",
                props.className,
            )}>
            <ProgressIndicatorImpl />
        </ProgressPrimitive.Indicator>
    </ProgressPrimitive.Root>
);

const ProgressIndicatorImpl = (props: {
    "data-value"?: number;
    "data-max"?: number;
}) => (
    <div
        {...props}
        style={{
            transform: `translateX(-${100 - ((props["data-value"] || 0) / (props["data-max"] || 100)) * 100}%)`,
        }}
    />
);

export const Progress = ProgressRoot;
