import { cn } from "src/core/utils/components";

type Props = React.ComponentProps<"span">;

export const FormControlHelper = ({ children, ...props }: Props) => {
    return (
        <span
            {...props}
            className={cn(
                "mt-0.5 text-xs text-muted-foreground",
                props.className,
            )}>
            {children}
        </span>
    );
};
