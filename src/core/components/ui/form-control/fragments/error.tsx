import { cn } from "src/core/utils/components";

type Props = React.ComponentProps<"span">;

export const FormControlError = (props: Props) => {
    if (!props.children) return null;

    return (
        <span
            {...props}
            className={cn("mt-0.5 text-xs text-destructive", props.className)}>
            {props.children}
        </span>
    );
};
