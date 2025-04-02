import { cn } from "src/core/utils/components";

type Props = React.ComponentProps<"div"> & {
    loading?: boolean;
};

export const FormControlRoot = (props: Props) => {
    const { loading = false, ...rest } = props;

    return (
        <div
            {...rest}
            className={cn(
                "flex flex-col gap-0.5",
                loading ? "opacity-50" : "opacity-100",
                props.className,
            )}>
            {props.children}
        </div>
    );
};
