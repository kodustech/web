import { Label } from "src/core/components/ui/label";
import { cn } from "src/core/utils/components";

type Props = React.ComponentProps<typeof Label>;

export const FormControlLabel = (props: Props) => {
    return (
        <Label
            {...props}
            className={cn("w-fit cursor-pointer text-sm", props.className)}>
            {props.children}
        </Label>
    );
};
