import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "src/core/utils/components";

type Props = React.ComponentProps<"h1"> & VariantProps<typeof headingVariants>;

const headingVariants = cva("font-semibold text-text-primary", {
    variants: {
        variant: {
            h1: "text-2xl",
            h2: "text-xl",
            h3: "text-md",
        },
    },
    defaultVariants: {
        variant: "h1",
    },
});

export const Heading = ({ variant, className, ...props }: Props) => {
    const headings: Record<NonNullable<typeof variant>, React.ElementType> = {
        h1: "h1",
        h2: "h2",
        h3: "h3",
    };

    const Component = headings[variant ?? "h1"];

    return (
        <Component
            {...props}
            className={cn(headingVariants({ variant }), className)}
        />
    );
};
