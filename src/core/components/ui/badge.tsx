import { forwardRef } from "react";
import { cn } from "src/core/utils/components";

import { Button } from "./button";

export const Badge = forwardRef<
    HTMLButtonElement,
    React.ComponentProps<typeof Button>
>((props, ref) => {
    return (
        <Button
            ref={ref}
            type="button"
            {...props}
            className={cn("h-8 w-fit px-3", props.className)}
        />
    );
});
