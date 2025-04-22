import { cn } from "src/core/utils/components";

import { Label } from "./label";

const FormControlRoot = (
    props: React.ComponentProps<"div"> & {
        loading?: boolean;
    },
) => {
    const { loading, ...rest } = props;

    return (
        <div
            {...rest}
            className={cn(
                "flex flex-col",
                loading && "opacity-50",
                props.className,
            )}
        />
    );
};

const FormControlInput = (props: React.PropsWithChildren) => props.children;

const FormControlLabel = (props: React.ComponentProps<typeof Label>) => {
    return (
        <Label {...props} className={cn("mb-1 w-fit text-sm", props.className)}>
            {props.children}
        </Label>
    );
};

const FormControlHelper = ({
    children,
    ...props
}: React.ComponentProps<"span">) => {
    return (
        <span
            {...props}
            className={cn(
                "text-muted-foreground mt-1.5 text-[13px] leading-none",
                props.className,
            )}>
            {children}
        </span>
    );
};

const FormControlError = (props: React.ComponentProps<"span">) => {
    if (!props.children) return null;

    return (
        <span
            {...props}
            className={cn(
                "text-destructive mt-1.5 text-[13px] leading-none",
                props.className,
            )}>
            {props.children}
        </span>
    );
};

export const FormControl = {
    Root: FormControlRoot,
    Label: FormControlLabel,
    Input: FormControlInput,
    Error: FormControlError,
    Helper: FormControlHelper,
};
